import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Clock, ChevronRight, Star, AlertCircle } from "lucide-react";
import { usePublishedArticles } from "@/hooks/useArticles";
import type { FirestoreArticle } from "@/lib/firestore";

type FilterCategory = "All" | "Finance" | "Tax" | "Accounting" | "HR" | "Legal" | "News";

const categoryColors: Record<string, string> = {
  Finance: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Tax: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Accounting: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Legal: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  News: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
};

const categories: FilterCategory[] = ["All", "Finance", "Tax", "Accounting", "HR", "Legal", "News"];

function formatDate(ts: unknown): string {
  if (!ts) return "";
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch { return ""; }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
      <div className="h-6 w-full rounded bg-muted mb-2" />
      <div className="h-5 w-4/5 rounded bg-muted mb-3" />
      <div className="h-4 w-full rounded bg-muted mb-1.5" />
      <div className="h-4 w-2/3 rounded bg-muted mb-4" />
      <div className="flex gap-1.5 mb-4">
        {[1, 2].map((i) => <div key={i} className="h-5 w-14 rounded bg-muted" />)}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="h-7 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function FeaturedArticleCard({ article }: { article: FirestoreArticle }) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {article.featuredImageUrl ? (
          <div className="h-64 lg:h-auto">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-64 lg:h-auto bg-gradient-to-br from-[#0A1628] via-[#0D2044] to-[#1a3a6e] flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[120px] font-display font-bold text-white/5 select-none">AKP</div>
            </div>
            <div className="relative z-10 text-center px-8">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0A1628] font-bold text-xl">{article.author.charAt(0)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium">
                <Star className="w-3.5 h-3.5" /> Featured Article
              </div>
            </div>
          </div>
        )}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[article.category] ?? ""}`}>
              {article.category}
            </span>
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readingTime} min read
            </span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold shrink-0">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{article.author}</div>
                <div className="text-muted-foreground text-xs">
                  {article.authorTitle ?? "AKP Consulting"} · {formatDate(article.publishedAt)}
                </div>
              </div>
            </div>
            <Link
              href={`/articles/${article.slug}`}
              className="px-4 py-2 rounded-lg gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Read Article <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, delay = 0 }: { article: FirestoreArticle; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 group h-full flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[article.category] ?? ""}`}>
            {article.category}
          </span>
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readingTime} min read
          </span>
        </div>

        <h3 className="font-semibold text-foreground text-lg leading-snug mb-3 group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-xs shrink-0">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">{article.author}</div>
              <div className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</div>
            </div>
          </div>
          <Link
            href={`/articles/${article.slug}`}
            className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-accent/10 hover:text-accent transition-all flex items-center gap-1"
          >
            Read <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export default function Articles() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const { articles, loading, error } = usePublishedArticles();

  const featured = articles.find((a) => a.featured);
  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    const notFeatured = search || activeCategory !== "All" || !a.featured;
    return matchesSearch && matchesCategory && notFeatured;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              AKP Knowledge Center
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Articles &amp; Professional Insights
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Expert perspectives on accounting, tax, HR, and financial consulting from AKP's certified professionals.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, topics, authors..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C]"
                data-testid="input-articles-search"
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
            <p className="text-sm">Failed to load articles. Please refresh the page.</p>
          </div>
        </div>
      )}

      {/* Featured Article */}
      {!loading && !error && featured && search === "" && activeCategory === "All" && (
        <section className="py-12 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <FeaturedArticleCard article={featured} />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-foreground">
              {search || activeCategory !== "All"
                ? `Results (${filtered.length})`
                : loading ? "Latest Articles" : `Latest Articles (${articles.length})`}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat ? "bg-accent text-[#0A1628]" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-article-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <ArticleCard key={article.id} article={article} delay={i * 0.07} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
