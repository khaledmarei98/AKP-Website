import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Pencil, Trash2, Upload, X, Eye, EyeOff, Star, CheckCircle,
  AlertCircle, Loader2, ExternalLink, Bold, Italic, List, Quote,
  Heading2, Heading3, Link as LinkIcon, Minus,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useAllArticles } from "@/hooks/useArticles";
import {
  createArticle, updateArticle, deleteArticle,
  generateSlug, calculateReadingTime,
  type FirestoreArticle, type ArticleCategory, type ArticleStatus,
} from "@/lib/firestore";
import { uploadFile, deleteFile, storagePaths } from "@/lib/storage";
import { serverTimestamp } from "firebase/firestore";

const CATEGORIES: ArticleCategory[] = ["Finance", "Tax", "Accounting", "HR", "Legal", "News"];

const categoryColors: Record<string, string> = {
  Finance: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Tax: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Accounting: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Legal: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  News: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
};

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  author: string;
  authorTitle: string;
  tags: string;
  status: ArticleStatus;
  featured: boolean;
  metaDescription: string;
}

const emptyForm: FormState = {
  title: "", slug: "", excerpt: "", content: "", category: "Finance",
  author: "", authorTitle: "", tags: "", status: "draft", featured: false, metaDescription: "",
};

// ─── Toolbar helper ────────────────────────────────────────────────────────────

function insertFormatting(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  content: string,
  setContent: (v: string) => void,
  open: string,
  close: string,
  placeholder = ""
) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = content.slice(start, end) || placeholder;
  const newContent = content.slice(0, start) + open + selected + close + content.slice(end);
  setContent(newContent);
  setTimeout(() => {
    el.focus();
    const cursor = start + open.length + selected.length + close.length;
    el.setSelectionRange(cursor, cursor);
  }, 0);
}

// ─── Article Editor ────────────────────────────────────────────────────────────

function ArticleEditor({
  editingArticle,
  onSave,
  onCancel,
}: {
  editingArticle: FirestoreArticle | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(
    editingArticle
      ? {
          title: editingArticle.title,
          slug: editingArticle.slug,
          excerpt: editingArticle.excerpt,
          content: editingArticle.content,
          category: editingArticle.category,
          author: editingArticle.author,
          authorTitle: editingArticle.authorTitle ?? "",
          tags: editingArticle.tags.join(", "),
          status: editingArticle.status,
          featured: editingArticle.featured,
          metaDescription: editingArticle.metaDescription ?? "",
        }
      : emptyForm
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingArticle?.featuredImageUrl ?? null);
  const [imageProgress, setImageProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const set = (key: keyof FormState, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug === generateSlug(f.title) || !f.slug ? generateSlug(title) : f.slug,
    }));
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toolbar = [
    { icon: Bold, label: "Bold", open: "<strong>", close: "</strong>", placeholder: "bold text" },
    { icon: Italic, label: "Italic", open: "<em>", close: "</em>", placeholder: "italic text" },
    { icon: Heading2, label: "H2", open: "<h2>", close: "</h2>", placeholder: "Section heading" },
    { icon: Heading3, label: "H3", open: "<h3>", close: "</h3>", placeholder: "Sub-heading" },
    { icon: Quote, label: "Quote", open: "<blockquote>", close: "</blockquote>", placeholder: "quoted text" },
    { icon: List, label: "List", open: "<ul>\n  <li>", close: "</li>\n</ul>", placeholder: "item" },
    { icon: LinkIcon, label: "Link", open: '<a href="URL">', close: "</a>", placeholder: "link text" },
    { icon: Minus, label: "HR", open: "<hr>", close: "", placeholder: "" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content || !form.author) {
      setFeedback({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    setSubmitting(true);
    setImageProgress(0);
    try {
      const articleId = editingArticle?.id ?? crypto.randomUUID();
      const existing = editingArticle;

      let featuredImageUrl = existing?.featuredImageUrl;
      let featuredImagePath = existing?.featuredImagePath;

      if (selectedImage) {
        const safeName = selectedImage.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = storagePaths.articleImage(articleId, safeName);
        const result = await uploadFile(path, selectedImage, (p) => setImageProgress(p.progress));
        featuredImageUrl = result.downloadUrl;
        featuredImagePath = result.storagePath;
      }

      const readingTime = calculateReadingTime(form.content);
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const isPublishing = form.status === "published";
      const wasAlreadyPublished = existing?.status === "published";

      const payload: Omit<FirestoreArticle, "id" | "createdAt" | "updatedAt"> = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        category: form.category,
        author: form.author.trim(),
        authorTitle: form.authorTitle.trim() || undefined,
        tags,
        status: form.status,
        featured: form.featured,
        readingTime,
        uploadedBy: user?.id ?? "",
        metaDescription: form.metaDescription.trim() || undefined,
        ...(featuredImageUrl && { featuredImageUrl }),
        ...(featuredImagePath && { featuredImagePath }),
        publishedAt: isPublishing && !wasAlreadyPublished ? serverTimestamp() : existing?.publishedAt,
      };

      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
      } else {
        await createArticle(payload);
      }

      onSave();
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof Error ? err.message : "Save failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {editingArticle ? "Edit Article" : "New Article"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:border-accent/40 transition-colors"
          >
            {previewMode ? <><EyeOff className="w-4 h-4" /> Edit</> : <><Eye className="w-4 h-4" /> Preview</>}
          </button>
          <button onClick={onCancel} className="p-2 rounded-xl border border-border hover:border-red-300 text-muted-foreground hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 text-sm ${
          feedback.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
            : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {previewMode ? (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[form.category] ?? ""}`}>{form.category}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">{form.title || "Untitled Article"}</h1>
          <p className="text-lg text-muted-foreground mb-8">{form.excerpt || "No excerpt yet."}</p>
          {imagePreview && <img src={imagePreview} alt="Featured" className="w-full h-64 object-cover rounded-2xl mb-8" />}
          <div
            className="article-prose text-foreground"
            dangerouslySetInnerHTML={{ __html: form.content || "<p><em>No content yet.</em></p>" }}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                <input
                  type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Article title..."
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors font-semibold"
                  required
                />
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Slug:</span>
                  <input
                    type="text" value={form.slug}
                    onChange={(e) => set("slug", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 bg-transparent border-b border-dashed border-border focus:outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Excerpt * <span className="font-normal">(shown in listing)</span></label>
                <textarea
                  value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="Write a compelling excerpt that summarizes the article..."
                  rows={3}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  required
                />
              </div>

              {/* Content editor */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <label className="block text-xs font-medium text-muted-foreground mb-3">Article Content * <span className="font-normal">(HTML)</span></label>

                {/* Toolbar */}
                <div className="flex items-center gap-1 flex-wrap mb-3 p-2 bg-muted rounded-xl border border-border">
                  {toolbar.map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      title={btn.label}
                      onClick={() => insertFormatting(contentRef, form.content, (v) => set("content", v), btn.open, btn.close, btn.placeholder)}
                      className="p-1.5 rounded-lg hover:bg-background hover:text-accent transition-colors text-muted-foreground"
                    >
                      <btn.icon className="w-4 h-4" />
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {calculateReadingTime(form.content)} min read
                  </span>
                </div>

                <textarea
                  ref={contentRef}
                  value={form.content} onChange={(e) => set("content", e.target.value)}
                  placeholder={`<h2>Section Heading</h2>\n<p>Your article content here...</p>`}
                  rows={20}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm font-mono focus:outline-none focus:border-accent transition-colors resize-y"
                  required
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Publish settings */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-4">Publish Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["draft", "published"] as ArticleStatus[]).map((s) => (
                        <button
                          key={s} type="button"
                          onClick={() => set("status", s)}
                          className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                            form.status === s
                              ? s === "published" ? "gold-gradient text-[#0A1628]" : "bg-muted-foreground/20 text-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button" onClick={() => set("featured", !form.featured)}
                      className={`w-11 h-6 rounded-full relative transition-all ${form.featured ? "gold-gradient" : "bg-muted border border-border"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? "right-1" : "left-1"}`} />
                    </button>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <Star className={`w-3.5 h-3.5 ${form.featured ? "text-accent" : "text-muted-foreground"}`} />
                      Featured Article
                    </div>
                  </label>
                </div>
              </div>

              {/* Category & Author */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground text-sm mb-1">Details</h3>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category *</label>
                  <select
                    value={form.category} onChange={(e) => set("category", e.target.value as ArticleCategory)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Author *</label>
                  <input
                    type="text" value={form.author} onChange={(e) => set("author", e.target.value)}
                    placeholder="Dr. Ahmed Kamal"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Author Title</label>
                  <input
                    type="text" value={form.authorTitle} onChange={(e) => set("authorTitle", e.target.value)}
                    placeholder="Chief Accounting Advisor"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tags <span className="font-normal">(comma-separated)</span></label>
                  <input
                    type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)}
                    placeholder="Tax, VAT, Egypt"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Featured image */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">Featured Image</h3>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }} />

                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-xl mb-2" />
                    <button
                      type="button"
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => imageInputRef.current?.click()}
                      className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Change image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button" onClick={() => imageInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border border-dashed border-border hover:border-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload featured image</span>
                  </button>
                )}
                {submitting && imageProgress > 0 && imageProgress < 100 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${imageProgress}%` }} />
                  </div>
                )}
              </div>

              {/* SEO */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">SEO</h3>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Meta Description</label>
                <textarea
                  value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)}
                  placeholder="Short description for search engines (150–160 chars)..."
                  rows={3}
                  maxLength={160}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
                <div className="text-right text-xs text-muted-foreground mt-1">{form.metaDescription.length}/160</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button type="button" onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:border-foreground/30 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingArticle ? "Save Changes" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Articles List View ────────────────────────────────────────────────────────

export default function AdminArticles() {
  const { articles, loading, error, refetch } = useAllArticles();
  const [editingArticle, setEditingArticle] = useState<FirestoreArticle | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (a: FirestoreArticle) => {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    setDeletingId(a.id);
    try {
      if (a.featuredImagePath) await deleteFile(a.featuredImagePath).catch(() => null);
      await deleteArticle(a.id);
      showFeedback("success", "Article deleted.");
      refetch();
    } catch {
      showFeedback("error", "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = useCallback(() => {
    showFeedback("success", editingArticle ? "Article updated." : "Article published.");
    setEditingArticle(undefined);
    refetch();
  }, [editingArticle, refetch]);

  // Show editor
  if (editingArticle !== undefined) {
    return (
      <ArticleEditor
        editingArticle={editingArticle}
        onSave={handleSave}
        onCancel={() => setEditingArticle(undefined)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Articles CMS</h1>
        <button
          onClick={() => setEditingArticle(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl mb-5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="font-medium text-foreground">No articles yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first article using the button above.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Articles", value: articles.length },
              { label: "Published", value: articles.filter((a) => a.status === "published").length },
              { label: "Drafts", value: articles.filter((a) => a.status === "draft").length },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Article</span><span>Category</span><span>Status</span><span>Reading</span><span>Date</span><span>Actions</span>
            </div>
            {articles.map((a) => (
              <div key={a.id} className="grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {a.featuredImageUrl ? (
                    <img src={a.featuredImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shrink-0 text-[#0A1628] font-bold text-sm">
                      {a.title.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-sm truncate flex items-center gap-1.5">
                      {a.title}
                      {a.featured && <Star className="w-3 h-3 text-accent shrink-0" />}
                    </div>
                    <div className="text-muted-foreground text-xs">by {a.author}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${categoryColors[a.category] ?? ""}`}>{a.category}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  a.status === "published"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}>{a.status}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{a.readingTime} min</span>
                <span className="text-xs text-muted-foreground hidden md:block">{formatDate(a.createdAt)}</span>
                <div className="flex items-center gap-1">
                  {a.status === "published" && (
                    <Link href={`/articles/${a.slug}`} target="_blank"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="View">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button onClick={() => setEditingArticle(a)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(a)} disabled={deletingId === a.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50" title="Delete">
                    {deletingId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
