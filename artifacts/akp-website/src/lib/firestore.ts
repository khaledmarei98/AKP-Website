import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Collection names ──────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  COURSES: "courses",
  ARTICLES: "articles",
  RESOURCES: "resources",
  BOOKINGS: "bookings",
  SUPPORT_TICKETS: "supportTickets",
  SUBSCRIPTIONS: "subscriptions",
  NOTIFICATIONS: "notifications",
  ENROLLMENTS: "enrollments",
  CLIENT_DOCUMENTS: "clientDocuments",
} as const;

// ─── Generic helpers ───────────────────────────────────────────────────────────

function ensureDb() {
  if (!db) throw new Error("Firestore is not initialized. Please configure Firebase.");
  return db;
}

export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  const snap = await getDoc(doc(ensureDb(), collectionName, documentId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T,
  merge = true
): Promise<void> {
  await setDoc(doc(ensureDb(), collectionName, documentId), { ...data, updatedAt: serverTimestamp() }, { merge });
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const ref = await addDoc(collection(ensureDb(), collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> {
  await updateDoc(doc(ensureDb(), collectionName, documentId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  await deleteDoc(doc(ensureDb(), collectionName, documentId));
}

export async function queryDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(ensureDb(), collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

// ─── User profile helpers ──────────────────────────────────────────────────────

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin_staff" | "instructor" | "client" | "student" | "accounting_partner";
  company?: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt?: unknown;
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  return getDocument<FirestoreUser>(COLLECTIONS.USERS, uid);
}

export async function createUserProfile(
  uid: string,
  data: Omit<FirestoreUser, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  await setDoc(
    doc(ensureDb(), COLLECTIONS.USERS, uid),
    {
      ...data,
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: false }
  );
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<FirestoreUser, "id" | "createdAt">>
): Promise<void> {
  await updateDocument(COLLECTIONS.USERS, uid, data);
}

// ─── Booking helpers ───────────────────────────────────────────────────────────

export type BookingStatus = "new" | "pending" | "in_review" | "approved" | "completed" | "rejected";
export type ServiceCategory = "accounting" | "tax" | "hr" | "erp" | "financial" | "business" | "audit";
export type RequestType =
  | "initial_consultation"
  | "ongoing_advisory"
  | "project_work"
  | "urgent_review"
  | "tax_filing"
  | "audit_preparation"
  | "general_inquiry";
export type ContactPreference = "phone" | "email" | "video";

export interface BookingAttachment {
  name: string;
  url: string;
  storagePath: string;
  size: string;
}

export interface FirestoreBooking {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone?: string;
  company?: string;
  serviceCategory: ServiceCategory;
  requestType: RequestType;
  requestDetails: string;
  contactPreference: ContactPreference;
  preferredDate?: string;
  preferredTime?: string;
  attachments: BookingAttachment[];
  status: BookingStatus;
  assignedTo?: string;
  adminNotes?: string;
  notificationsSent: {
    clientConfirmation: boolean;
    adminAlert: boolean;
    statusUpdates: string[];
  };
  createdAt: unknown;
  updatedAt: unknown;
}

export const SERVICE_LABELS: Record<ServiceCategory, string> = {
  accounting: "Financial Accounting",
  tax: "Tax Consulting",
  hr: "HR Consultation",
  erp: "ERP Implementation",
  financial: "Financial Analysis",
  business: "Business Consulting",
  audit: "Audit & Review",
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  initial_consultation: "Initial Consultation",
  ongoing_advisory: "Ongoing Advisory",
  project_work: "Project Work",
  urgent_review: "Urgent Review",
  tax_filing: "Tax Filing Assistance",
  audit_preparation: "Audit Preparation",
  general_inquiry: "General Inquiry",
};

export async function createBooking(
  data: Omit<FirestoreBooking, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createDocument(COLLECTIONS.BOOKINGS, data);
}

export async function getUserBookings(userId: string): Promise<FirestoreBooking[]> {
  return queryDocuments<FirestoreBooking>(COLLECTIONS.BOOKINGS, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  ]);
}

export async function getAllBookings(): Promise<FirestoreBooking[]> {
  return queryDocuments<FirestoreBooking>(COLLECTIONS.BOOKINGS, [
    orderBy("createdAt", "desc"),
  ]);
}

export async function getBookingsByStatus(status: BookingStatus): Promise<FirestoreBooking[]> {
  return queryDocuments<FirestoreBooking>(COLLECTIONS.BOOKINGS, [
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  ]);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  adminNotes?: string
): Promise<void> {
  return updateDocument(COLLECTIONS.BOOKINGS, id, {
    status,
    ...(adminNotes !== undefined && { adminNotes }),
  });
}

export async function assignBooking(id: string, assignedTo: string): Promise<void> {
  return updateDocument(COLLECTIONS.BOOKINGS, id, { assignedTo });
}

// ─── Support ticket helpers ────────────────────────────────────────────────────

export interface FirestoreTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: unknown;
  updatedAt: unknown;
}

export async function createSupportTicket(
  data: Omit<FirestoreTicket, "id" | "createdAt" | "updatedAt" | "status">
): Promise<string> {
  return createDocument(COLLECTIONS.SUPPORT_TICKETS, { ...data, status: "open" });
}

export async function getUserTickets(userId: string): Promise<FirestoreTicket[]> {
  return queryDocuments<FirestoreTicket>(COLLECTIONS.SUPPORT_TICKETS, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  ]);
}

// ─── Notification helpers ──────────────────────────────────────────────────────

export interface FirestoreNotification {
  id: string;
  userId: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  read: boolean;
  createdAt: unknown;
}

export async function getUserNotifications(userId: string, maxCount = 20): Promise<FirestoreNotification[]> {
  return queryDocuments<FirestoreNotification>(COLLECTIONS.NOTIFICATIONS, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxCount),
  ]);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
}

// ─── Subscription helpers ──────────────────────────────────────────────────────

export interface FirestoreSubscription {
  id: string;
  userId: string;
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "cancelled" | "past_due" | "trial";
  startDate: unknown;
  endDate?: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

export async function getUserSubscription(userId: string): Promise<FirestoreSubscription | null> {
  const results = await queryDocuments<FirestoreSubscription>(COLLECTIONS.SUBSCRIPTIONS, [
    where("userId", "==", userId),
    where("status", "==", "active"),
    limit(1),
  ]);
  return results[0] ?? null;
}

// ─── Client document helpers ──────────────────────────────────────────────────

export interface FirestoreClientDocument {
  id: string;
  userId: string;
  name: string;
  fileType: "PDF" | "Excel" | "Word" | "Image" | "Other";
  storagePath: string;
  downloadUrl?: string;
  size: number;
  category: "Tax Documents" | "Accounting Files" | "HR Files" | "Legal Documents" | "Other";
  status: "Uploaded" | "Pending Review" | "Reviewed" | "Approved" | "Archived";
  uploadedAt: unknown;
  updatedAt: unknown;
}

export async function getUserDocuments(userId: string): Promise<FirestoreClientDocument[]> {
  return queryDocuments<FirestoreClientDocument>(COLLECTIONS.CLIENT_DOCUMENTS, [
    where("userId", "==", userId),
    orderBy("uploadedAt", "desc"),
  ]);
}

export async function createClientDocument(
  data: Omit<FirestoreClientDocument, "id" | "uploadedAt" | "updatedAt" | "status">
): Promise<string> {
  return createDocument(COLLECTIONS.CLIENT_DOCUMENTS, { ...data, status: "Uploaded" });
}

// ─── Resource (Library) helpers ────────────────────────────────────────────────

export type ResourceCategory = "Finance" | "Tax" | "HR" | "Legal" | "Other";
export type ResourceFileType = "PDF" | "Excel" | "Word";

export interface FirestoreResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: ResourceFileType;
  fileUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  size: string;
  author: string;
  pages?: number;
  featured: boolean;
  downloads: number;
  uploadedBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export async function getPublicResources(): Promise<FirestoreResource[]> {
  return queryDocuments<FirestoreResource>(COLLECTIONS.RESOURCES, [
    orderBy("createdAt", "desc"),
  ]);
}

export async function createResource(
  data: Omit<FirestoreResource, "id" | "createdAt" | "updatedAt" | "downloads">
): Promise<string> {
  return createDocument(COLLECTIONS.RESOURCES, { ...data, downloads: 0 });
}

export async function updateResource(
  id: string,
  data: Partial<Omit<FirestoreResource, "id" | "createdAt" | "uploadedBy">>
): Promise<void> {
  return updateDocument(COLLECTIONS.RESOURCES, id, data);
}

export async function deleteResource(id: string): Promise<void> {
  return deleteDocument(COLLECTIONS.RESOURCES, id);
}

export async function incrementResourceDownloads(id: string, current: number): Promise<void> {
  try {
    await updateDocument(COLLECTIONS.RESOURCES, id, { downloads: current + 1 });
  } catch {
    // Non-critical — download count update failure is acceptable
  }
}

// ─── Article (Blog/CMS) helpers ────────────────────────────────────────────────

export type ArticleCategory = "Finance" | "Tax" | "Accounting" | "HR" | "Legal" | "News";
export type ArticleStatus = "draft" | "published";

export interface FirestoreArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  featuredImageUrl?: string;
  featuredImagePath?: string;
  tags: string[];
  author: string;
  authorTitle?: string;
  readingTime: number;
  status: ArticleStatus;
  featured: boolean;
  publishedAt?: unknown;
  createdAt: unknown;
  updatedAt: unknown;
  uploadedBy: string;
  metaDescription?: string;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export async function getPublishedArticles(): Promise<FirestoreArticle[]> {
  return queryDocuments<FirestoreArticle>(COLLECTIONS.ARTICLES, [
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
  ]);
}

export async function getArticleBySlug(slug: string): Promise<FirestoreArticle | null> {
  const results = await queryDocuments<FirestoreArticle>(COLLECTIONS.ARTICLES, [
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1),
  ]);
  return results[0] ?? null;
}

export async function getAllArticles(): Promise<FirestoreArticle[]> {
  return queryDocuments<FirestoreArticle>(COLLECTIONS.ARTICLES, [
    orderBy("createdAt", "desc"),
  ]);
}

export async function createArticle(
  data: Omit<FirestoreArticle, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createDocument(COLLECTIONS.ARTICLES, data);
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<FirestoreArticle, "id" | "createdAt" | "uploadedBy">>
): Promise<void> {
  return updateDocument(COLLECTIONS.ARTICLES, id, data);
}

export async function deleteArticle(id: string): Promise<void> {
  return deleteDocument(COLLECTIONS.ARTICLES, id);
}

// ─── Course & LMS helpers ──────────────────────────────────────────────────────

export type CourseCategory = "Finance" | "Tax" | "HR" | "ERP" | "Business" | "Accounting";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "video" | "pdf" | "text";

export interface CourseLesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  isPreview: boolean;
  order: number;
}

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface FirestoreCourse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  instructor: string;
  instructorId: string;
  instructorBio?: string;
  instructorAvatar?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  tags: string[];
  isFree: boolean;
  price?: number;
  lessonCount: number;
  duration: string;
  sections: CourseSection[];
  status: "draft" | "published";
  featured: boolean;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  uploadedBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface FirestoreEnrollment {
  id: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  instructor: string;
  thumbnailUrl?: string;
  progress: number;
  completedLessons: string[];
  lastLessonId?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export async function getPublishedCourses(): Promise<FirestoreCourse[]> {
  return queryDocuments<FirestoreCourse>(COLLECTIONS.COURSES, [
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
  ]);
}

export async function getCourseBySlug(slug: string): Promise<FirestoreCourse | null> {
  const results = await queryDocuments<FirestoreCourse>(COLLECTIONS.COURSES, [
    where("slug", "==", slug),
    limit(1),
  ]);
  return results[0] ?? null;
}

export async function getAllCourses(): Promise<FirestoreCourse[]> {
  return queryDocuments<FirestoreCourse>(COLLECTIONS.COURSES, [
    orderBy("createdAt", "desc"),
  ]);
}

export async function createCourse(
  data: Omit<FirestoreCourse, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createDocument(COLLECTIONS.COURSES, data);
}

export async function updateCourse(
  id: string,
  data: Partial<Omit<FirestoreCourse, "id" | "createdAt" | "uploadedBy">>
): Promise<void> {
  return updateDocument(COLLECTIONS.COURSES, id, data);
}

export async function deleteCourse(id: string): Promise<void> {
  return deleteDocument(COLLECTIONS.COURSES, id);
}

export async function getUserEnrollments(userId: string): Promise<FirestoreEnrollment[]> {
  return queryDocuments<FirestoreEnrollment>(COLLECTIONS.ENROLLMENTS, [
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  ]);
}

export async function getUserEnrollmentForCourse(
  userId: string,
  courseId: string
): Promise<FirestoreEnrollment | null> {
  const results = await queryDocuments<FirestoreEnrollment>(COLLECTIONS.ENROLLMENTS, [
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    limit(1),
  ]);
  return results[0] ?? null;
}

export async function enrollInCourse(
  userId: string,
  course: Pick<FirestoreCourse, "id" | "slug" | "title" | "instructor" | "thumbnailUrl">
): Promise<string> {
  const existing = await getUserEnrollmentForCourse(userId, course.id);
  if (existing) return existing.id;
  return createDocument(COLLECTIONS.ENROLLMENTS, {
    userId,
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    instructor: course.instructor,
    thumbnailUrl: course.thumbnailUrl ?? "",
    progress: 0,
    completedLessons: [],
    lastLessonId: "",
  });
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  lessonId: string,
  allLessonIds: string[],
  currentCompleted: string[]
): Promise<{ completedLessons: string[]; progress: number }> {
  const completedSet = new Set(currentCompleted);
  completedSet.add(lessonId);
  const completedLessons = Array.from(completedSet);
  const progress = allLessonIds.length > 0
    ? Math.round((completedLessons.length / allLessonIds.length) * 100)
    : 0;
  await updateDocument(COLLECTIONS.ENROLLMENTS, enrollmentId, {
    completedLessons,
    progress,
    lastLessonId: lessonId,
  });
  return { completedLessons, progress };
}
