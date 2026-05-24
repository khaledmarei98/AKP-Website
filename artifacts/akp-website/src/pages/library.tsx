import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Download, Star, Clock, FileText, Grid3X3, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useResources } from "@/hooks/useResources";
import { incrementResourceDownloads, type FirestoreResource } from "@/lib/firestore";

type FilterCategory = "All" | "Finance" | "Tax" | "HR" | "Legal" | "Other";

const fileTypeColors: Record<string, string> = {
  PDF: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  Excel: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Word: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  Excel: Grid3X3,
  Word: BookOpen,
};

function formatDate(ts: unknown): string {
  if (!ts) return "";
  try {
    const date = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function ResourceCard({ resource, delay = 0 }: { resource: FirestoreResource; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = fileTypeIcons[resource.fileType] ?? FileText;

  const handleDownload = async () => {
    window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
    await incrementResourceDownloads(resource.id, resource.downloads);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-2xl p-6 group hover:border-accent/30 transition-all h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#0A1628]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${fileTypeColors[resource.fileType] ?? ""}`}>
              {resource.fileType}
            </span>
            {resource.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium w-fit">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          {resource.category}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mb-2 leading-tight flex-1">{resource.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{resource.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {formatDate(resource.createdAt)}
        </span>
        <span>{resource.size}</span>
        {resource.pages && <span>{resource.pages} pages</span>}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground">by {resource.author}</div>
          <div className="text-xs text-muted-foreground">{resource.downloads.toLocaleString()} downloads</div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-[#0A1628] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="h-5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-4 w-full rounded bg-muted mb-1" />
      <div className="h-4 w-2/3 rounded bg-muted mb-4" />
      <div className="h-3 w-1/2 rounded bg-muted mb-4" />
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-28 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

const categories: FilterCategory[] = ["All", "Finance", "Tax", "HR", "Legal", "Other"];

export default function Library() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const { resources, loading, error } = useResources();

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = resources.filter((r) => r.featured).slice(0, 3);
  const recent = [...resources].slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              Digital Library
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Professional Reference Library
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Accounting references, tax laws, HR policies, financial templates, and professional guides — all free to download.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources, authors, topics..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C] transition-colors"
                data-testid="input-library-search"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">Failed to load resources. Please refresh the page.</p>
          </div>
        </div>
      )}

      {/* Featured */}
      {!loading && !error && featured.length > 0 && search === "" && activeCategory === "All" && (
        <section className="py-16 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Featured Resources</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((r, i) => (
                <ResourceCard key={r.id} resource={r} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added */}
      {!loading && !error && recent.length > 0 && search === "" && activeCategory === "All" && (
        <section className="py-12 border-b border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Recently Added</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recent.map((r, i) => (
                <ResourceCard key={r.id} resource={r} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-foreground">
              {search || activeCategory !== "All"
                ? `Results (${filtered.length})`
                : loading
                ? "All Resources"
                : `All Resources (${resources.length})`}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-accent text-[#0A1628]"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No resources found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r, i) => (
                <ResourceCard key={r.id} resource={r} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
