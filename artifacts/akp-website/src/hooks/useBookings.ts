import { useState, useEffect, useCallback } from "react";
import {
  getUserBookings,
  getAllBookings,
  type FirestoreBooking,
} from "@/lib/firestore";

export function useUserBookings(userId: string) {
  const [bookings, setBookings] = useState<FirestoreBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getUserBookings(userId)
      .then((data) => { setBookings(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, loading, error, refetch: fetch };
}

export function useAllBookings() {
  const [bookings, setBookings] = useState<FirestoreBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllBookings()
      .then((data) => { setBookings(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
        setLoading(false);
      });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, loading, error, refetch: fetch };
}
