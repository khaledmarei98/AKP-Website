import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit2, Trash2, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Upload, BookOpen, Play, FileText, Type, Eye, EyeOff, Star
} from "lucide-react";
import { useAllCourses } from "@/hooks/useCourses";
import {
  createCourse, updateCourse, deleteCourse, generateSlug,
  type FirestoreCourse, type CourseSection, type CourseLesson,
  type CourseCategory, type CourseLevel, type LessonType,
} from "@/lib/firestore";
import { uploadFile, storagePaths, formatFileSize } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

// ─── Config ────────────────────────────────────────────────────────────────────

const CATEGORIES: CourseCategory[] = ["Finance", "Accounting", "Tax", "HR", "ERP", "Business"];
const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];
const LEVEL_LABELS: Record<CourseLevel, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const LESSON_TYPES: LessonType[] = ["video", "pdf", "text"];
const LESSON_TYPE_ICONS: Record<LessonType, typeof Play> = { video: Play, pdf: FileText, text: Type };

const EMPTY_FORM = {
  title: "", slug: "", summary: "", description: "",
  category: "Finance" as CourseCategory, level: "beginner" as CourseLevel,
  instructor: "", instructorBio: "", duration: "",
  isFree: true, price: 0, status: "draft" as "draft" | "published",
  featured: false, tags: "",
};

// ─── Curriculum Editor ─────────────────────────────────────────────────────────

function LessonEditor({ lesson, onUpdate, onDelete }: {
  lesson: CourseLesson;
  onUpdate: (update: Partial<CourseLesson>) => void;
  onDelete: () => void;
}) {
  const Icon = LESSON_TYPE_ICONS[lesson.type];
  return (
    <div className="pl-4 border-l-2 border-accent/20 ml-4 mb-3">
      <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Lesson title"
            className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none"
          />
          <button onClick={onDelete} className="p-1 hover:text-red-500 transition-colors text-muted-foreground shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={lesson.type}
            onChange={(e) => onUpdate({ type: e.target.value as LessonType })}
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent"
          >
            {LESSON_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <input
            type="text"
            value={lesson.duration ?? ""}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="Duration (e.g. 15 min)"
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-32"
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={lesson.isPreview} onChange={(e) => onUpdate({ isPreview: e.target.checked })} className="w-3 h-3" />
            Free Preview
          </label>
        </div>
        {lesson.type === "video" && (
          <input
            type="url"
            value={lesson.videoUrl ?? ""}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="Video URL (YouTube or direct)"
            className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        )}
        {lesson.type === "pdf" && (
          <input
            type="url"
            value={lesson.pdfUrl ?? ""}
            onChange={(e) => onUpdate({ pdfUrl: e.target.value })}
            placeholder="PDF URL"
            className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        )}
        {lesson.type === "text" && (
          <textarea
            value={lesson.content ?? ""}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Lesson content (HTML supported)"
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        )}
      </div>
    </div>
  );
}

function SectionEditor({ section, onUpdate, onDelete }: {
  section: CourseSection;
  onUpdate: (section: CourseSection) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);

  const addLesson = () => {
    const lesson: CourseLesson = {
      id: crypto.randomUUID(), title: "New Lesson", type: "video",
      isPreview: false, order: section.lessons.length,
    };
    onUpdate({ ...section, lessons: [...section.lessons, lesson] });
  };

  const updateLesson = (lessonId: string, update: Partial<CourseLesson>) => {
    onUpdate({ ...section, lessons: section.lessons.map((l) => l.id === lessonId ? { ...l, ...update } : l) });
  };

  const deleteLesson = (lessonId: string) => {
    onUpdate({ ...section, lessons: section.lessons.filter((l) => l.id !== lessonId) });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
        <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          placeholder="Section title"
          className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
        />
        <span className="text-xs text-muted-foreground">{section.lessons.length} lessons</span>
        <button onClick={onDelete} className="p-1 hover:text-red-500 transition-colors text-muted-foreground">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && (
        <div className="p-3">
          {section.lessons.map((lesson) => (
            <LessonEditor
              key={lesson.id}
              lesson={lesson}
              onUpdate={(u) => updateLesson(lesson.id, u)}
              onDelete={() => deleteLesson(lesson.id)}
            />
          ))}
          <button
            onClick={addLesson}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline mt-1 ml-4"
          >
            <Plus className="w-3.5 h-3.5" /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Course Row ────────────────────────────────────────────────────────────────

function CourseRow({ course, onEdit, onDelete }: {
  course: FirestoreCourse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { await deleteCourse(course.id); onDelete(); } catch { setDeleting(false); }
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10 transition-colors">
      <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#0D2044] overflow-hidden flex items-center justify-center shrink-0">
        {course.thumbnailUrl
          ? <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          : <Play className="w-4 h-4 text-[#C9A84C]" />
        }
      </div>
      <div className="min-w-0">
        <div className="font-medium text-foreground text-sm truncate">{course.title}</div>
        <div className="text-xs text-muted-foreground">{course.category} · {LEVEL_LABELS[course.level]} · {course.lessonCount} lessons</div>
      </div>
      <div className="flex items-center gap-1.5">
        {course.featured && <Star className="w-3.5 h-3.5 fill-[#C9A84C] text-[#C9A84C]" />}
        {course.isFree ? <span className="text-xs text-emerald-600 font-medium">Free</span> : <span className="text-xs text-muted-foreground">EGP {course.price}</span>}
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${course.status === "published" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
        {course.status}
      </span>
      <span className="text-xs text-muted-foreground">{course.enrollmentCount} enrolled</span>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors text-muted-foreground">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors text-muted-foreground disabled:opacity-50">
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Admin Courses ─────────────────────────────────────────────────────────────

export default function AdminCourses() {
  const { user } = useAuth();
  const { courses, loading, error, refetch } = useAllCourses();
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === "super_admin" || user?.role === "admin_staff";

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSections([]);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setSaveError(null);
    setSaved(false);
    setView("editor");
  };

  const openEdit = (course: FirestoreCourse) => {
    setEditingId(course.id);
    setForm({
      title: course.title, slug: course.slug, summary: course.summary, description: course.description,
      category: course.category, level: course.level, instructor: course.instructor,
      instructorBio: course.instructorBio ?? "", duration: course.duration,
      isFree: course.isFree, price: course.price ?? 0, status: course.status,
      featured: course.featured, tags: course.tags.join(", "),
    });
    setSections(course.sections);
    setThumbnailPreview(course.thumbnailUrl ?? "");
    setThumbnailFile(null);
    setSaveError(null);
    setSaved(false);
    setView("editor");
  };

  const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const updateFormField = (field: string, value: string | boolean | number) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && !editingId) updated.slug = generateSlug(value as string);
      return updated;
    });
  };

  const addSection = () => {
    const s: CourseSection = { id: crypto.randomUUID(), title: `Section ${sections.length + 1}`, order: sections.length, lessons: [] };
    setSections([...sections, s]);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.instructor.trim()) {
      setSaveError("Title and instructor are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      let thumbnailUrl = thumbnailPreview;
      let thumbnailPath = "";

      if (thumbnailFile) {
        const tempId = editingId ?? crypto.randomUUID();
        const safeName = `${Date.now()}_${thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const path = storagePaths.courseThumbnail(tempId, safeName);
        const result = await uploadFile(path, thumbnailFile);
        thumbnailUrl = result.downloadUrl;
        thumbnailPath = result.storagePath;
      }

      const lessonCount = sections.reduce((sum, s) => sum + s.lessons.length, 0);
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

      const data: Omit<FirestoreCourse, "id" | "createdAt" | "updatedAt"> = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        summary: form.summary.trim(),
        description: form.description.trim(),
        category: form.category,
        level: form.level,
        instructor: form.instructor.trim(),
        instructorId: user?.id ?? "",
        instructorBio: form.instructorBio.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        thumbnailPath: thumbnailPath || undefined,
        tags,
        isFree: form.isFree,
        price: form.isFree ? 0 : form.price,
        lessonCount,
        duration: form.duration.trim(),
        sections,
        status: form.status,
        featured: form.featured,
        enrollmentCount: 0,
        rating: 0,
        ratingCount: 0,
        uploadedBy: user?.id ?? "",
      };

      if (editingId) {
        await updateCourse(editingId, data);
      } else {
        await createCourse(data);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await refetch();
      setView("list");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: "Total", value: courses.length },
    { label: "Published", value: courses.filter((c) => c.status === "published").length },
    { label: "Draft", value: courses.filter((c) => c.status === "draft").length },
    { label: "Total Enrolled", value: courses.reduce((s, c) => s + (c.enrollmentCount ?? 0), 0) },
  ];

  if (view === "editor") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-foreground">{editingId ? "Edit Course" : "New Course"}</h1>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: basic info */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Course Info</h3>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Thumbnail</label>
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbSelect} />
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="relative h-36 rounded-xl border border-dashed border-border bg-muted cursor-pointer hover:border-accent/40 transition-colors overflow-hidden"
                >
                  {thumbnailPreview
                    ? <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground"><Upload className="w-5 h-5" /><span className="text-xs">Upload thumbnail</span></div>
                  }
                </div>
                {thumbnailFile && <p className="text-xs text-muted-foreground mt-1">{thumbnailFile.name} · {formatFileSize(thumbnailFile.size)}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => updateFormField("title", e.target.value)} placeholder="Course title" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL Slug</label>
                <input type="text" value={form.slug} onChange={(e) => updateFormField("slug", e.target.value)} placeholder="url-slug" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Short Summary</label>
                <input type="text" value={form.summary} onChange={(e) => updateFormField("summary", e.target.value)} placeholder="One-line course description" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Description</label>
                <textarea value={form.description} onChange={(e) => updateFormField("description", e.target.value)} rows={4} placeholder="Detailed course description..." className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => updateFormField("category", e.target.value)} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Level</label>
                  <select value={form.level} onChange={(e) => updateFormField("level", e.target.value)} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent">
                    {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Instructor *</label>
                <input type="text" value={form.instructor} onChange={(e) => updateFormField("instructor", e.target.value)} placeholder="Instructor name" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Instructor Bio</label>
                <input type="text" value={form.instructorBio} onChange={(e) => updateFormField("instructorBio", e.target.value)} placeholder="Short bio" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration (e.g. "8 hours")</label>
                <input type="text" value={form.duration} onChange={(e) => updateFormField("duration", e.target.value)} placeholder="8 hours" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => updateFormField("tags", e.target.value)} placeholder="accounting, tax, beginner" className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFree} onChange={(e) => updateFormField("isFree", e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-foreground">Free course</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => updateFormField("featured", e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-foreground">Featured</span>
                </label>
              </div>

              {!form.isFree && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Price (EGP)</label>
                  <input type="number" value={form.price} onChange={(e) => updateFormField("price", Number(e.target.value))} min={0} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["draft", "published"] as const).map((s) => (
                    <button key={s} onClick={() => updateFormField("status", s)} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${form.status === s ? "gold-gradient text-[#0A1628]" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                      {s === "draft" ? <><EyeOff className="w-3 h-3 inline mr-1" />Draft</> : <><Eye className="w-3 h-3 inline mr-1" />Published</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : editingId ? "Save Changes" : "Create Course"}
            </button>
          </div>

          {/* Right: curriculum */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm">Curriculum</h3>
                <span className="text-xs text-muted-foreground">{sections.reduce((s, sec) => s + sec.lessons.length, 0)} lessons</span>
              </div>
              {sections.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border rounded-xl mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No sections yet. Add your first section below.</p>
                </div>
              )}
              {sections.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={(updated) => setSections(sections.map((s) => s.id === section.id ? updated : s))}
                  onDelete={() => setSections(sections.filter((s) => s.id !== section.id))}
                />
              ))}
              <button onClick={addSection} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors">
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Courses CMS</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No courses yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Create your first course to get started.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm">
            <Plus className="w-4 h-4" /> Create First Course
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Thumbnail</span><span>Course</span><span>Pricing</span><span>Status</span><span>Enrolled</span><span>Actions</span>
          </div>
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onEdit={() => openEdit(course)}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
