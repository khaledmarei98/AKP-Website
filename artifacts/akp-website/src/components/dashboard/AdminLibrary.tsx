import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Pencil, Trash2, Upload, X, FileText, Grid3X3, BookOpen,
  Star, Download, AlertCircle, CheckCircle, Loader2, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  createResource, updateResource, deleteResource,
  type FirestoreResource, type ResourceCategory, type ResourceFileType,
} from "@/lib/firestore";
import { uploadFile, deleteFile, storagePaths, formatBytes } from "@/lib/storage";
import { useResources } from "@/hooks/useResources";

const CATEGORIES: ResourceCategory[] = ["Finance", "Tax", "HR", "Legal", "Other"];
const FILE_TYPES: ResourceFileType[] = ["PDF", "Excel", "Word"];

const fileTypeColors: Record<string, string> = {
  PDF: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  Excel: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Word: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText, Excel: Grid3X3, Word: BookOpen,
};

interface FormState {
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: ResourceFileType;
  author: string;
  pages: string;
  featured: boolean;
}

const emptyForm: FormState = {
  title: "", description: "", category: "Finance",
  fileType: "PDF", author: "", pages: "", featured: false,
};

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  try {
    const date = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

export default function AdminLibrary() {
  const { user } = useAuth();
  const { resources, loading, error, refetch } = useResources();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumb, setSelectedThumb] = useState<File | null>(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedFile(null);
    setSelectedThumb(null);
    setFileProgress(0);
    setThumbProgress(0);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (r: FirestoreResource) => {
    setForm({
      title: r.title, description: r.description, category: r.category,
      fileType: r.fileType, author: r.author, pages: r.pages?.toString() ?? "",
      featured: r.featured,
    });
    setSelectedFile(null);
    setSelectedThumb(null);
    setEditingId(r.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.author) {
      showFeedback("error", "Please fill in all required fields.");
      return;
    }
    if (!editingId && !selectedFile) {
      showFeedback("error", "Please select a file to upload.");
      return;
    }

    setSubmitting(true);
    setFileProgress(0);
    setThumbProgress(0);

    try {
      const resourceId = editingId ?? crypto.randomUUID();
      const existing = editingId ? resources.find((r) => r.id === editingId) : null;

      // Upload file if selected
      let fileUrl = existing?.fileUrl ?? "";
      let storagePath = existing?.storagePath ?? "";
      let size = existing?.size ?? "";

      if (selectedFile) {
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = storagePaths.libraryFile(resourceId, safeName);
        const result = await uploadFile(path, selectedFile, (p) => setFileProgress(p.progress));
        fileUrl = result.downloadUrl;
        storagePath = result.storagePath;
        size = formatBytes(selectedFile.size);
      }

      // Upload thumbnail if selected
      let thumbnailUrl = existing?.thumbnailUrl;
      let thumbnailPath = existing?.thumbnailPath;

      if (selectedThumb) {
        const safeName = selectedThumb.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = storagePaths.libraryThumbnail(resourceId, safeName);
        const result = await uploadFile(path, selectedThumb, (p) => setThumbProgress(p.progress));
        thumbnailUrl = result.downloadUrl;
        thumbnailPath = result.storagePath;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        fileType: form.fileType,
        author: form.author.trim(),
        pages: form.pages ? parseInt(form.pages, 10) : undefined,
        featured: form.featured,
        fileUrl,
        storagePath,
        size,
        uploadedBy: user?.id ?? "",
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(thumbnailPath !== undefined && { thumbnailPath }),
      };

      if (editingId) {
        await updateResource(editingId, payload);
        showFeedback("success", "Resource updated successfully.");
      } else {
        await createResource({ ...payload, uploadedBy: user?.id ?? "" });
        showFeedback("success", "Resource uploaded and published.");
      }

      refetch();
      resetForm();
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r: FirestoreResource) => {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    setDeletingId(r.id);
    try {
      if (r.storagePath) await deleteFile(r.storagePath).catch(() => null);
      if (r.thumbnailPath) await deleteFile(r.thumbnailPath).catch(() => null);
      await deleteResource(r.id);
      showFeedback("success", "Resource deleted.");
      refetch();
    } catch {
      showFeedback("error", "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Library Admin</h1>
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl mb-5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.message}
        </motion.div>
      )}

      {/* Upload / Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">{editingId ? "Edit Resource" : "Upload New Resource"}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                <input
                  type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Egyptian Tax Law — Full Text 2025"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description *</label>
                <textarea
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the resource content and use case..."
                  rows={3}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category *</label>
                <select
                  value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ResourceCategory }))}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* File Type */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">File Type *</label>
                <select
                  value={form.fileType} onChange={(e) => setForm((f) => ({ ...f, fileType: e.target.value as ResourceFileType }))}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Author *</label>
                <input
                  type="text" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="e.g. AKP Finance Team"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>

              {/* Pages */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pages (optional)</label>
                <input
                  type="number" value={form.pages} onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                  placeholder="e.g. 120"
                  min="1"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Resource File {!editingId && "*"}
                  {editingId && <span className="text-muted-foreground font-normal"> (leave blank to keep existing)</span>}
                </label>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                <button
                  type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted border border-border border-dashed hover:border-accent/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  {selectedFile ? selectedFile.name : "Choose file (PDF, Excel, Word)"}
                </button>
                {submitting && fileProgress > 0 && fileProgress < 100 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${fileProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Thumbnail Image <span className="font-normal">(optional)</span>
                </label>
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedThumb(e.target.files?.[0] ?? null)} />
                <button
                  type="button" onClick={() => thumbInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted border border-border border-dashed hover:border-accent/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  {selectedThumb ? selectedThumb.name : "Choose image (PNG, JPG, WebP)"}
                </button>
                {submitting && thumbProgress > 0 && thumbProgress < 100 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${thumbProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                    className={`w-11 h-6 rounded-full relative transition-all ${form.featured ? "gold-gradient" : "bg-muted border border-border"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? "right-1" : "left-1"}`} />
                  </button>
                  <span className="text-sm text-foreground font-medium">Mark as Featured</span>
                  <Star className={`w-4 h-4 ${form.featured ? "text-accent" : "text-muted-foreground"}`} />
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:border-foreground/30 transition-colors">
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : editingId ? "Save Changes" : "Upload & Publish"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Resources Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No resources yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first resource using the button above.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Resource</span><span>Type</span><span>Category</span><span>Downloads</span><span>Date</span><span>Actions</span>
          </div>

          {resources.map((r) => {
            const Icon = fileTypeIcons[r.fileType] ?? FileText;
            return (
              <div key={r.id} className="grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#0A1628]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{r.title}</div>
                    <div className="text-muted-foreground text-xs truncate">by {r.author}</div>
                  </div>
                  {r.featured && <Star className="w-3.5 h-3.5 text-accent shrink-0" />}
                </div>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${fileTypeColors[r.fileType] ?? ""}`}>{r.fileType}</span>
                <span className="text-xs text-muted-foreground">{r.category}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Download className="w-3 h-3" />{r.downloads.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{formatDate(r.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Preview">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={deletingId === r.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
