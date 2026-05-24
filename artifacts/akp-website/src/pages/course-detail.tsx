import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCourse, useEnrollmentForCourse } from "@/hooks/useCourses";
import { enrollInCourse } from "@/lib/firestore";
import {
  Clock, BookOpen, BarChart3, Users, Star, Play, FileText, Type,
  ChevronDown, ChevronUp, Lock, CheckCircle, ArrowRight, Loader2, Award
} from "lucide-react";

const LEVEL_LABELS: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  intermediate: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  advanced: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};
const LESSON_ICONS: Record<string, typeof Play> = { video: Play, pdf: FileText, text: Type };

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { course, loading, error } = useCourse(slug);
  const { enrollment, loading: enrollLoading, refetch } = useEnrollmentForCourse(
    user?.id ?? "",
    course?.id ?? ""
  );

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    if (!course) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      await enrollInCourse(user!.id, {
        id: course.id, slug: course.slug, title: course.title,
        instructor: course.instructor, thumbnailUrl: course.thumbnailUrl,
      });
      await refetch();
      navigate(`/learn/${course.slug}`);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-16 bg-[#060E1E] animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-6 w-32 bg-white/10 rounded mb-4" />
            <div className="h-10 w-2/3 bg-white/10 rounded mb-3" />
            <div className="h-5 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Course not found</h1>
          <Link href="/courses" className="text-accent hover:underline text-sm">Browse all courses</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Link href="/courses" className="text-white/40 hover:text-white/70 text-sm transition-colors">Courses</Link>
                <span className="text-white/30">/</span>
                <span className="text-[#C9A84C] text-sm">{course.category}</span>
              </div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                {course.title}
              </motion.h1>
              <p className="text-white/70 text-lg mb-6">{course.summary}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[course.level]}`}>{LEVEL_LABELS[course.level]}</span>
                {course.ratingCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                    <span className="font-semibold text-white">{course.rating.toFixed(1)}</span>
                    <span>({course.ratingCount.toLocaleString()} ratings)</span>
                  </div>
                )}
                {course.enrollmentCount > 0 && (
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrollmentCount.toLocaleString()} students</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {course.instructorAvatar ? (
                  <img src={course.instructorAvatar} alt={course.instructor} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shrink-0">
                    <span className="text-[#0A1628] font-bold text-sm">{course.instructor[0]}</span>
                  </div>
                )}
                <div>
                  <div className="text-white font-medium text-sm">{course.instructor}</div>
                  {course.instructorBio && <div className="text-white/50 text-xs">{course.instructorBio}</div>}
                </div>
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-[#0A1628] to-[#0D2044] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center">
                      <Play className="w-7 h-7 text-[#0A1628] ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="text-2xl font-bold text-foreground mb-4">
                    {course.isFree ? <span className="text-emerald-600">Free</span> : `EGP ${course.price?.toLocaleString()}`}
                  </div>

                  {enrollError && <p className="text-red-500 text-xs mb-3">{enrollError}</p>}

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <Award className="w-4 h-4" /> You're enrolled!
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{enrollment.progress}% complete · {enrollment.completedLessons.length}/{allLessonIds.length} lessons</p>
                      <Link href={`/learn/${course.slug}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity">
                        Continue Learning <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || enrollLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {enrolling ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling…</> : isAuthenticated ? "Enroll Now — Free" : "Sign In to Enroll"}
                    </button>
                  )}

                  <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {course.duration} total</div>
                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> {course.lessonCount} lessons</div>
                    <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" /> {LEVEL_LABELS[course.level]} level</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent" /> Lifetime access</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-3xl">

          {/* About */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-foreground mb-4">About this course</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {/* Tags */}
          {course.tags.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          {course.sections.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-2">Curriculum</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {course.sections.length} sections · {allLessonIds.length} lessons · {course.duration} total
              </p>
              <div className="border border-border rounded-2xl overflow-hidden">
                {course.sections.map((section, si) => {
                  const isOpen = openSections.has(section.id);
                  return (
                    <div key={section.id} className="border-b border-border last:border-0">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors text-left"
                      >
                        <div>
                          <span className="font-semibold text-foreground text-sm">{section.title}</span>
                          <span className="text-muted-foreground text-xs ml-2">{section.lessons.length} lessons</span>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {isOpen && (
                        <div className="border-t border-border">
                          {section.lessons.map((lesson) => {
                            const LessonIcon = LESSON_ICONS[lesson.type] ?? Play;
                            const canPreview = lesson.isPreview || isEnrolled;
                            return (
                              <div key={lesson.id} className={`flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-0 ${canPreview ? "hover:bg-muted/10" : ""} transition-colors`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${canPreview ? "bg-accent/10" : "bg-muted"}`}>
                                  {canPreview
                                    ? <LessonIcon className="w-3.5 h-3.5 text-accent" />
                                    : <Lock className="w-3 h-3 text-muted-foreground" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium truncate ${canPreview ? "text-foreground" : "text-muted-foreground"}`}>{lesson.title}</div>
                                  {lesson.duration && <div className="text-xs text-muted-foreground">{lesson.duration}</div>}
                                </div>
                                {lesson.isPreview && !isEnrolled && (
                                  <span className="text-xs text-accent font-medium shrink-0">Preview</span>
                                )}
                                {isEnrolled && enrollment.completedLessons.includes(lesson.id) && (
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructor */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Your Instructor</h2>
            <div className="flex items-start gap-4">
              {course.instructorAvatar ? (
                <img src={course.instructorAvatar} alt={course.instructor} className="w-16 h-16 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center shrink-0">
                  <span className="text-[#0A1628] font-bold text-xl">{course.instructor[0]}</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground">{course.instructor}</h3>
                {course.instructorBio && <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{course.instructorBio}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
