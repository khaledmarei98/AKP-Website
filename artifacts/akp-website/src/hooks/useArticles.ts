import { useState, useEffect, useCallback } from "react";
import {
  getPublishedArticles,
  getAllArticles,
  type FirestoreArticle,
} from "@/lib/firestore";

function makeHook(fetcher: () => Promise<FirestoreArticle[]>) {
  return function useArticlesFetcher() {
    const [articles, setArticles] = useState<FirestoreArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(() => {
      setLoading(true);
      setError(null);
      fetcher()
        .then((data) => {
          setArticles(data);
          setLoading(false);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to load articles");
          setLoading(false);
        });
    }, []);

    useEffect(() => {
      fetch();
    }, [fetch]);

    return { articles, loading, error, refetch: fetch };
  };
}

export const usePublishedArticles = makeHook(getPublishedArticles);
export const useAllArticles = makeHook(getAllArticles);
