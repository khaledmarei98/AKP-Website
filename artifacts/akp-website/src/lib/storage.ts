import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./firebase";

// ─── Storage path builders ─────────────────────────────────────────────────────

export const storagePaths = {
  clientDocument: (userId: string, filename: string) =>
    `clients/${userId}/documents/${filename}`,
  courseResource: (courseId: string, filename: string) =>
    `courses/${courseId}/resources/${filename}`,
  avatar: (userId: string, filename: string) =>
    `avatars/${userId}/${filename}`,
  articleImage: (articleId: string, filename: string) =>
    `articles/${articleId}/${filename}`,
  libraryFile: (resourceId: string, filename: string) =>
    `library/files/${resourceId}/${filename}`,
  libraryThumbnail: (resourceId: string, filename: string) =>
    `library/thumbnails/${resourceId}/${filename}`,
  bookingAttachment: (bookingRef: string, filename: string) =>
    `bookings/${bookingRef}/attachments/${filename}`,
  courseThumbnail: (courseId: string, filename: string) =>
    `courses/${courseId}/thumbnails/${filename}`,
  lessonVideo: (courseId: string, lessonId: string, filename: string) =>
    `courses/${courseId}/lessons/${lessonId}/video/${filename}`,
  lessonResource: (courseId: string, lessonId: string, filename: string) =>
    `courses/${courseId}/lessons/${lessonId}/resources/${filename}`,
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Upload helpers ────────────────────────────────────────────────────────────

export interface UploadProgress {
  progress: number;
  state: "running" | "paused" | "success" | "canceled" | "error";
}

export function uploadFile(
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  return new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error("Firebase Storage is not initialized. Please configure Firebase."));
      return;
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadUrl, storagePath: path });
      }
    );
  });
}

export async function uploadClientDocument(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = storagePaths.clientDocument(userId, `${timestamp}_${sanitized}`);
  return uploadFile(path, file, onProgress);
}

export async function uploadCourseResource(
  courseId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = storagePaths.courseResource(courseId, `${timestamp}_${sanitized}`);
  return uploadFile(path, file, onProgress);
}

export async function uploadAvatar(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ downloadUrl: string; storagePath: string }> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = storagePaths.avatar(userId, `avatar.${ext}`);
  return uploadFile(path, file, onProgress);
}

// ─── Delete helper ─────────────────────────────────────────────────────────────

export async function deleteFile(storagePath: string): Promise<void> {
  if (!storage) throw new Error("Firebase Storage is not initialized.");
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

// ─── Download URL helper ───────────────────────────────────────────────────────

export async function getFileDownloadUrl(storagePath: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage is not initialized.");
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

// ─── File type validator ───────────────────────────────────────────────────────

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const MAX_FILE_SIZE_MB = 25;

export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMb = MAX_FILE_SIZE_MB
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Accepted: ${allowedTypes.join(", ")}` };
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return { valid: false, error: `File too large. Maximum size is ${maxSizeMb} MB.` };
  }
  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
