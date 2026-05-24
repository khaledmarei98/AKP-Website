import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCourse, useEnrollmentForCourse } from "@/hooks/useCourses";
import { updateEnrollmentProgress } from "@/lib/firestore";
import type { CourseLesson, CourseSection } from "@/lib/firestore";
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, FileText, Type,
  BookOpen, Menu, X, Loader2, Award, ArrowRight, Download, Lock
} from "lucide-react";

const LESSON_ICONS: Record<string, typeof Play> = { video: Play, pdf: FileText, text: Type };

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function LessonContent({ lesson }: { lesson: CourseLesson }) {
  if (lesson.type === "video" && lesson.videoUrl) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-black">
        {isYouTube(lesson.videoUrl) ? (
          <iframe
            src={getYouTubeEmbedUrl(lesson.videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video controls className="w-full h-full" src={lesson.videoUrl} />
        )}
      </div>
    );
  }

  if (lesson.type === "pdf" && lesson.pdfUrl) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Document Resource</h3>
          <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90">
            <Download className="w-4 h-4" /> Download PDF
          </a>
        </div>
        <iframe src={lesson.pdfUrl} className="w-full rounded-xl border border-border" style={{ height: "500px" }} title={lesson.title} />
      </div>
    );
  }

  if (lesson.type === "text" && lesson.content) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8">
        <div
          className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
      <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No content available for this lesson yet.</p>
    </div>
  );
}

export default function Learn() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { course, loading: courseLoading } = useCourse(courseSlug);
  const { enrollment, loading: enrollLoading, refetch } = useEnrollmentForCourse(
    user?.id ?? "",
    course?.id ?? ""
  );

  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const loading = courseLoading || enrollLoading;

  // Flatten all lessons in order
  const allLessons: { lesson: CourseLesson; section: CourseSection }[] = [];
  course?.sections.forEach((section) => {
    section.lessons.forEach((lesson) => allLessons.push({ lesson, section }));
  });
  const allLessonIds = allLessons.map((l) => l.lesson.id);

  // Init state from enrollment
  useEffect(() => {
    if (enrollment) {
      setCompletedLessons(enrollment.completedLessons);
      setProgress(enrollment.progress);
      if (!currentLessonId) {
        const startId = enrollment.lastLessonId || allLessonIds[0] || "";
        setCurrentLessonId(startId);
      }
    } else if (!enrollLoading && allLessonIds.length > 0 && !currentLessonId) {
      setCurrentLessonId(allLessonIds[0]);
    }
  }, [enrollment, enrollLoading]);

  const currentIdx = allLessons.findIndex((l) => l.lesson.id === currentLessonId);
  const currentEntry = allLessons[currentIdx];
  const prevLesson = allLessons[currentIdx - 1]?.lesson ?? null;
  const nextLesson = allLessons[currentIdx + 1]?.lesson ?? null;
  const isCompleted = completedLessons.includes(currentLessonId);

  const handleMarkComplete = async () => {
    if (!enrollment || !currentLessonId) return;
    setCompleting(true);
    try {
      const result = await updateEnrollmentProgress(enrollment.id, currentLessonId, allLessonIds, completedLessons);
      setCompletedLessons(result.completedLessons);
      setProgress(result.progress);
      await refetch();
      if (nextLesson) setCurrentLessonId(nextLesson.id);
    } catch {
      // silent
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Course not found</h1>
        <Link href="/courses" className="text-accent hover:underline text-sm">Browse all courses</Link>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">You're not enrolled</h1>
        <p className="text-muted-foreground text-sm text-center">Enroll in this course to access the learning content.</p>
        <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm">
          View Course <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden">
          {sidebarOpen ? <X className="w-5 h-5 text-sidebar-foreground" /> : <Menu className="w-5 h-5 text-sidebar-foreground" />}
        </button>
        <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2 text-sidebar-foreground hover:text-accent transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium truncate max-w-48">{course.title}</span>
        </Link>
        <div className="flex-1 mx-4 hidden sm:block">
          <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
            <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/60 shrink-0 hidden sm:block">
          {completedLessons.length}/{allLessonIds.length} lessons · {progress}%
        </div>
        {progress === 100 && (
          <div className="flex items-center gap-1 text-xs text-[#C9A84C] font-medium shrink-0">
            <Award className="w-4 h-4" /> Complete!
          </div>
        )}
      </header>

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside className={`fixed lg:static top-14 left-0 bottom-0 z-40 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex-1 overflow-y-auto">
            {course.sections.map((section) => (
              <div key={section.id}>
                <div className="px-4 py-2.5 bg-sidebar-accent/50 border-b border-sidebar-border">
                  <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">{section.title}</h3>
                </div>
                {section.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const isDone = completedLessons.includes(lesson.id);
                  const LessonIcon = LESSON_ICONS[lesson.type] ?? Play;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => { setCurrentLessonId(lesson.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-sidebar-border/50 transition-colors ${isActive ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-sidebar-accent/30"}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-500" : isActive ? "gold-gradient" : "bg-sidebar-accent"}`}>
                        {isDone
                          ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                          : <LessonIcon className={`w-3 h-3 ${isActive ? "text-[#0A1628]" : "text-sidebar-foreground/50"}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${isActive ? "text-accent" : isDone ? "text-sidebar-foreground/60" : "text-sidebar-foreground"}`}>
                          {lesson.title}
                        </div>
                        {lesson.duration && <div className="text-[10px] text-sidebar-foreground/40">{lesson.duration}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {currentEntry ? (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              {/* Lesson header */}
              <div className="mb-6">
                <div className="text-xs text-muted-foreground mb-1">{currentEntry.section.title}</div>
                <h1 className="text-2xl font-bold text-foreground">{currentEntry.lesson.title}</h1>
                {currentEntry.lesson.description && (
                  <p className="text-muted-foreground mt-2 text-sm">{currentEntry.lesson.description}</p>
                )}
              </div>

              {/* Content */}
              <LessonContent lesson={currentEntry.lesson} />

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  onClick={handleMarkComplete}
                  disabled={completing || isCompleted}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isCompleted ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 cursor-default" : "gold-gradient text-[#0A1628] hover:opacity-90 disabled:opacity-60"}`}
                >
                  {completing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : isCompleted
                    ? <><CheckCircle className="w-4 h-4" /> Completed</>
                    : <><CheckCircle className="w-4 h-4" /> Mark Complete</>
                  }
                </button>

                <button
                  onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                  disabled={!nextLesson}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="font-semibold text-foreground mb-1">Select a lesson to begin</h2>
              <p className="text-sm text-muted-foreground">Choose a lesson from the sidebar to start learning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
