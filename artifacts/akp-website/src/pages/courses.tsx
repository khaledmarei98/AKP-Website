import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { usePublishedCourses, useUserEnrollments } from "@/hooks/useCourses";
import {
  Star, Clock, BookOpen, ArrowRight, Search, Filter,
  Play, Award, BarChart3, Users
} from "lucide-react";
import type { CourseCategory, CourseLevel, FirestoreCourse } from "@/lib/firestore";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

const CATEGORIES: (CourseCategory | "All")[] = ["All", "Finance", "Accounting", "Tax", "HR", "ERP", "Business"];
const LEVELS: (CourseLevel | "All")[] = ["All", "beginner", "intermediate", "advanced"];
const LEVEL_LABELS: Record<string, string> = {
  All: "All Levels", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
};
const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  intermediate: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  advanced: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

function CourseCard({ course, enrolled }: { course: FirestoreCourse; enrolled: boolean }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col">
        <div className="relative h-44 bg-gradient-to-br from-[#0A1628] to-[#0D2044] overflow-hidden shrink-0">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center">
                <Play className="w-6 h-6 text-[#0A1628] ml-0.5" />
              </div>
            </div>
          )}
          {course.featured && <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#0A1628] text-xs font-bold">Featured</div>}
          {course.isFree && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">Free</div>}
          {enrolled && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#0A1628] text-xs font-bold">
              <Award className="w-3 h-3" /> Enrolled
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">{course.category}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[course.level] ?? ""}`}>{LEVEL_LABELS[course.level]}</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-2">{course.title}</h3>
          <p className="text-muted-foreground text-xs mb-3 flex-1 line-clamp-2">{course.summary}</p>
          <p className="text-xs text-muted-foreground mb-4">by {course.instructor}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</div>
            <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.lessonCount} lessons</div>
            {course.ratingCount > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="w-3.5 h-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                <span className="font-medium text-foreground">{course.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <div className="font-bold text-foreground">
              {course.isFree ? <span className="text-emerald-600">Free</span> : `EGP ${course.price?.toLocaleString()}`}
            </div>
            <span className="text-xs text-accent font-semibold group-hover:underline flex items-center gap-1">
              {enrolled ? "Continue" : "View Course"} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2"><div className="h-5 w-16 bg-muted rounded-full" /><div className="h-5 w-20 bg-muted rounded-full" /></div>
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" /><div className="h-3 w-2/3 bg-muted rounded" />
        <div className="h-px bg-border" />
        <div className="flex justify-between"><div className="h-4 w-12 bg-muted rounded" /><div className="h-4 w-20 bg-muted rounded" /></div>
      </div>
    </div>
  );
}

export default function Courses() {
  const { user, isAuthenticated } = useAuth();
  const { courses, loading, error } = usePublishedCourses();
  const { enrollments } = useUserEnrollments(isAuthenticated ? (user?.id ?? "") : "");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CourseCategory | "All">("All");
  const [level, setLevel] = useState<CourseLevel | "All">("All");

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const featured = courses.filter((c) => c.featured);
  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
    const matchCat = category === "All" || c.category === category;
    const matchLevel = level === "All" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  const showFeatured = !search && category === "All" && level === "All" && featured.length > 0 && !loading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" /> AKP Knowledge Platform
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Learn from Egypt's Top<br />Financial Experts
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Professional courses in accounting, tax, HR, and business consulting — built for Egyptian professionals and businesses.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search courses, topics, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-accent text-sm"
              />
            </div>
            <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
              {[
                { icon: Users, value: "10,000+", label: "Students" },
                { icon: BookOpen, value: `${loading ? "—" : courses.length || "120"}+`, label: "Courses" },
                { icon: Award, value: "15+", label: "Instructors" },
                { icon: BarChart3, value: "94%", label: "Completion" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-[#C9A84C]">{s.value}</div>
                  <div className="text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {showFeatured && (
        <section className="py-12 bg-muted/20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent fill-accent" /> Featured Courses
              </h2>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((c, i) => (
                <FadeIn key={c.id} delay={i * 0.08}><CourseCard course={c} enrolled={enrolledIds.has(c.id)} /></FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-card border border-border rounded-2xl">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === cat ? "gold-gradient text-[#0A1628]" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{cat}</button>
              ))}
            </div>
            <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lv) => (
                <button key={lv} onClick={() => setLevel(lv)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${level === lv ? "gold-gradient text-[#0A1628]" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{LEVEL_LABELS[lv]}</button>
              ))}
            </div>
            {(search || category !== "All" || level !== "All") && (
              <button onClick={() => { setSearch(""); setCategory("All"); setLevel("All"); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
            )}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}</div>
          ) : error ? (
            <div className="text-center py-16"><p className="text-muted-foreground">Failed to load courses. Please try again later.</p></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No courses found</h3>
              <p className="text-muted-foreground text-sm">{search ? `No results for "${search}"` : "No courses match your filters."}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-5">{filtered.length} course{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c, i) => (
                  <FadeIn key={c.id} delay={i * 0.04}><CourseCard course={c} enrolled={enrolledIds.has(c.id)} /></FadeIn>
                ))}
              </div>
            </>
          )}

          {!isAuthenticated && !loading && (
            <FadeIn>
              <div className="mt-12 text-center bg-card border border-accent/20 rounded-2xl p-8">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Track Your Learning Progress</h3>
                <p className="text-muted-foreground text-sm mb-5">Create a free account to enroll in courses and track your progress.</p>
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
