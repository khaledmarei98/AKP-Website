import { useState, useEffect, useCallback } from "react";
import { getPublicResources, type FirestoreResource } from "@/lib/firestore";

export function useResources() {
  const [resources, setResources] = useState<FirestoreResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getPublicResources()
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load resources");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { resources, loading, error, refetch: fetch };
}
