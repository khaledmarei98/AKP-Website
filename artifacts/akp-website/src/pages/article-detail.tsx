import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Clock, Calendar, Tag, Share2, AlertCircle, ChevronRight } from "lucide-react";
import { getArticleBySlug, type FirestoreArticle } from "@/lib/firestore";
import { usePublishedArticles } from "@/hooks/useArticles";
import "@/styles/article.css";

const categoryColors: Record<string, string> = {
  Finance: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Tax: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Accounting: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Legal: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  News: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
};

function formatDate(ts: unknown): string {
  if (!ts) return "";
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
      <div
        className="h-full gold-gradient transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 animate-pulse">
      <div className="h-5 w-24 rounded bg-muted mb-8" />
      <div className="h-4 w-20 rounded-full bg-muted mb-4" />
      <div className="h-10 w-full rounded bg-muted mb-2" />
      <div className="h-10 w-4/5 rounded bg-muted mb-6" />
      <div className="h-4 w-48 rounded bg-muted mb-10" />
      <div className="h-64 w-full rounded-2xl bg-muted mb-10" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded bg-muted mb-3" />
      ))}
    </div>
  );
}

function RelatedCard({ article }: { article: FirestoreArticle }) {
  return (
    <Link href={`/articles/${article.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-card border border-border rounded-2xl p-5 group cursor-pointer hover:border-accent/30 transition-all"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[article.category] ?? ""}`}>
            {article.category}
          </span>
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readingTime} min
          </span>
        </div>
        <h4 className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {article.title}
        </h4>
        <p className="text-muted-foreground text-xs line-clamp-2">{article.excerpt}</p>
      </motion.div>
    </Link>
  );
}

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug ?? "";

  const [article, setArticle] = useState<FirestoreArticle | null | undefined>(undefined);
  const [articleError, setArticleError] = useState<string | null>(null);
  const { articles: allArticles } = usePublishedArticles();

  useEffect(() => {
    if (!slug) return;
    setArticle(undefined);
    setArticleError(null);
    getArticleBySlug(slug)
      .then((data) => setArticle(data))
      .catch((err: unknown) => {
        setArticleError(err instanceof Error ? err.message : "Failed to load article");
        setArticle(null);
      });
  }, [slug]);

  const related = allArticles
    .filter((a) => a.id !== article?.id && a.category === article?.category)
    .slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article?.title ?? "", url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url).catch(() => null);
    }
  };

  // Loading
  if (article === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-20">
          <SkeletonDetail />
        </div>
        <Footer />
      </div>
    );
  }

  // Error
  if (articleError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-16 max-w-2xl mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Failed to load article</h1>
          <p className="text-muted-foreground mb-6">Please try again later.</p>
          <Link href="/articles" className="inline-flex items-center gap-2 text-accent hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found
  if (article === null) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-16 max-w-2xl mx-auto px-4 text-center">
          <div className="text-8xl mb-6">📄</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            This article may have been removed or the link is incorrect.
          </p>
          <Link href="/articles" className="inline-flex items-center gap-2 text-accent hover:underline">
            <ArrowLeft className="w-4 h-4" /> Browse all articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ReadingProgress />
      <Navbar />

      {/* Hero with featured image */}
      {article.featuredImageUrl && (
        <div className="pt-16 lg:pt-20">
          <div className="relative h-72 sm:h-96 lg:h-[28rem] overflow-hidden">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060E1E] via-[#060E1E]/40 to-transparent" />
          </div>
        </div>
      )}

      {!article.featuredImageUrl && (
        <div className="h-20 lg:h-24" />
      )}

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Link href="/articles" className="hover:text-accent transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Articles
          </Link>
          <span>/</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${categoryColors[article.category] ?? ""}`}>
            {article.category}
          </span>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6"
        >
          {article.title}
        </motion.h1>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm shrink-0">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{article.author}</div>
              {article.authorTitle && <div className="text-xs">{article.authorTitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(article.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} min read
          </div>
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-accent hover:text-accent transition-all text-xs font-medium"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </motion.div>

        {/* Excerpt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg text-muted-foreground leading-relaxed mb-10 font-medium"
        >
          {article.excerpt}
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="article-prose text-foreground"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent/10 hover:text-accent transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author card */}
        <div className="mt-10 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-xl shrink-0">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-foreground">{article.author}</div>
              <div className="text-muted-foreground text-sm">{article.authorTitle ?? "AKP Consulting"}</div>
            </div>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Related Articles</h2>
              <Link href="/articles" className="text-sm text-accent hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((a) => <RelatedCard key={a.id} article={a} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
