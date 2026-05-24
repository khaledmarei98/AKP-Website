import { useState, useEffect, useCallback } from "react";
import {
  getPublishedCourses,
  getCourseBySlug,
  getAllCourses,
  getUserEnrollments,
  getUserEnrollmentForCourse,
  type FirestoreCourse,
  type FirestoreEnrollment,
} from "@/lib/firestore";

export function usePublishedCourses() {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPublishedCourses()
      .then((data) => { setCourses(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        setLoading(false);
      });
  }, []);

  return { courses, loading, error };
}

export function useCourse(slug: string | undefined) {
  const [course, setCourse] = useState<FirestoreCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    getCourseBySlug(slug)
      .then((data) => { setCourse(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load course");
        setLoading(false);
      });
  }, [slug]);

  return { course, loading, error };
}

export function useAllCourses() {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    getAllCourses()
      .then((data) => { setCourses(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        setLoading(false);
      });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { courses, loading, error, refetch: fetch };
}

export function useUserEnrollments(userId: string) {
  const [enrollments, setEnrollments] = useState<FirestoreEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!userId) { setEnrollments([]); setLoading(false); return; }
    setLoading(true);
    getUserEnrollments(userId)
      .then((data) => { setEnrollments(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load enrollments");
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { enrollments, loading, error, refetch: fetch };
}

export function useEnrollmentForCourse(userId: string, courseId: string) {
  const [enrollment, setEnrollment] = useState<FirestoreEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    if (!userId || !courseId) { setEnrollment(null); setLoading(false); return; }
    setLoading(true);
    getUserEnrollmentForCourse(userId, courseId)
      .then((data) => { setEnrollment(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [userId, courseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { enrollment, loading, refetch: fetch };
}
