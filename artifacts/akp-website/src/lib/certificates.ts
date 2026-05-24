import jsPDF from "jspdf";
import { where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { storage } from "./firebase";
import { setDocument, getDocument, queryDocuments, updateDocument } from "./firestore";

export interface FirestoreCertificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  issueDate: string;
  certificateUrl: string;
  storagePath: string;
  revoked: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

// ─── PDF Generation ────────────────────────────────────────────────────────────

export function generateCertificatePdf(data: {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  certificateId: string;
  verificationUrl: string;
}): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const gold: [number, number, number] = [201, 168, 76];
  const navy: [number, number, number] = [10, 22, 40];
  const white: [number, number, number] = [255, 255, 255];
  const dimGold: [number, number, number] = [180, 150, 65];
  const muted: [number, number, number] = [160, 160, 160];
  const dimGray: [number, number, number] = [100, 100, 100];
  const nearWhite: [number, number, number] = [220, 220, 220];

  // Dark background
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, H, "F");

  // Outer gold border
  doc.setDrawColor(...gold);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, W - 20, H - 20);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, W - 28, H - 28);

  // Corner gold squares
  doc.setFillColor(...gold);
  ([
    [10, 10], [W - 14, 10], [10, H - 14], [W - 14, H - 14],
  ] as [number, number][]).forEach(([x, y]) => {
    doc.rect(x - 1.5, y - 1.5, 5, 5, "F");
  });

  // AKP Branding
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("AKP CONSULTING", W / 2, 30, { align: "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dimGold);
  doc.text("E G Y P T", W / 2, 36, { align: "center" });

  // Gold divider lines
  doc.setLineWidth(0.6);
  doc.setDrawColor(...gold);
  doc.line(W / 2 - 55, 41, W / 2 + 55, 41);
  doc.setLineWidth(0.2);
  doc.line(W / 2 - 38, 43.5, W / 2 + 38, 43.5);

  // "CERTIFICATE OF COMPLETION"
  doc.setFontSize(23);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("CERTIFICATE OF COMPLETION", W / 2, 57, { align: "center" });

  // "This is to certify that"
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text("This is to certify that", W / 2, 70, { align: "center" });

  // Student Name
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  let displayName = data.studentName;
  while (doc.getTextWidth(displayName) > W - 100 && displayName.length > 5) {
    displayName = displayName.slice(0, -4) + "...";
  }
  doc.text(displayName, W / 2, 88, { align: "center" });

  // Name underline
  const nameW = doc.getTextWidth(displayName);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - nameW / 2, 91, W / 2 + nameW / 2, 91);

  // "has successfully completed the course"
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text("has successfully completed the course", W / 2, 103, { align: "center" });

  // Course Title
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  let displayTitle = data.courseTitle;
  while (doc.getTextWidth(displayTitle) > W - 60 && displayTitle.length > 5) {
    displayTitle = displayTitle.slice(0, -4) + "...";
  }
  doc.text(displayTitle, W / 2, 114, { align: "center" });

  // Signature area
  const sigY = 150;

  // Left: Instructor
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dimGray);
  doc.text("I N S T R U C T O R", 68, sigY - 12, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...nearWhite);
  const instrText = data.instructorName.length > 20
    ? data.instructorName.slice(0, 20) + "…"
    : data.instructorName;
  doc.text(instrText, 68, sigY - 2, { align: "center" });
  doc.setDrawColor(...dimGray);
  doc.setLineWidth(0.3);
  doc.line(35, sigY + 3, 101, sigY + 3);

  // Center: AKP Seal
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.circle(W / 2, sigY - 7, 13, "S");
  doc.setLineWidth(0.3);
  doc.circle(W / 2, sigY - 7, 11, "S");
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gold);
  doc.text("AKP", W / 2, sigY - 4, { align: "center" });
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.text("VERIFIED", W / 2, sigY + 1, { align: "center" });

  // Right: Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dimGray);
  doc.text("D A T E  O F  C O M P L E T I O N", W - 68, sigY - 12, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...nearWhite);
  doc.text(data.issueDate, W - 68, sigY - 2, { align: "center" });
  doc.setDrawColor(...dimGray);
  doc.setLineWidth(0.3);
  doc.line(W - 101, sigY + 3, W - 35, sigY + 3);

  // Footer: cert ID + verify URL
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text(
    `Certificate ID: ${data.certificateId}   ·   Verify at: ${data.verificationUrl}`,
    W / 2, H - 19, { align: "center" }
  );

  return doc.output("blob");
}

// ─── Storage Upload ─────────────────────────────────────────────────────────────

async function uploadCertificatePdf(
  userId: string,
  certificateId: string,
  blob: Blob
): Promise<{ url: string; path: string }> {
  if (!storage) return { url: "", path: "" };
  try {
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const path = `certificates/${userId}/${certificateId}.pdf`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, { contentType: "application/pdf" });
    const url = await getDownloadURL(storageRef);
    return { url, path };
  } catch {
    return { url: "", path: "" };
  }
}

// ─── Certificate CRUD ──────────────────────────────────────────────────────────

export async function issueCertificate(params: {
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
}): Promise<FirestoreCertificate> {
  const existing = await getUserCertificateForCourse(params.userId, params.courseId);
  if (existing) return existing;

  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const certificateId = `AKP-${Date.now().toString(36).toUpperCase()}-${rand}`;
  const issueDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const origin = typeof window !== "undefined" ? window.location.origin : "https://akpconsulting.com";
  const verificationUrl = `${origin}/verify/${certificateId}`;

  const blob = generateCertificatePdf({
    studentName: params.studentName,
    courseTitle: params.courseTitle,
    instructorName: params.instructorName,
    issueDate,
    certificateId,
    verificationUrl,
  });

  const { url, path } = await uploadCertificatePdf(params.userId, certificateId, blob);

  const certData = {
    userId: params.userId,
    courseId: params.courseId,
    courseTitle: params.courseTitle,
    studentName: params.studentName,
    instructorName: params.instructorName,
    issueDate,
    certificateUrl: url,
    storagePath: path,
    revoked: false,
    createdAt: serverTimestamp(),
  };

  await setDocument("certificates", certificateId, certData, false);

  return {
    id: certificateId,
    ...certData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as FirestoreCertificate;
}

export async function getUserCertificateForCourse(
  userId: string,
  courseId: string
): Promise<FirestoreCertificate | null> {
  const results = await queryDocuments<FirestoreCertificate>("certificates", [
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    limit(1),
  ]);
  return results[0] ?? null;
}

export async function getUserCertificates(userId: string): Promise<FirestoreCertificate[]> {
  return queryDocuments<FirestoreCertificate>("certificates", [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  ]);
}

export async function getAllCertificates(): Promise<FirestoreCertificate[]> {
  return queryDocuments<FirestoreCertificate>("certificates", [
    orderBy("createdAt", "desc"),
  ]);
}

export async function getCertificateById(certificateId: string): Promise<FirestoreCertificate | null> {
  return getDocument<FirestoreCertificate>("certificates", certificateId);
}

export async function revokeCertificate(id: string): Promise<void> {
  return updateDocument("certificates", id, { revoked: true });
}

// ─── Client-side Download ───────────────────────────────────────────────────────

export function downloadCertificateBlob(cert: FirestoreCertificate): void {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://akpconsulting.com";
  const blob = generateCertificatePdf({
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    instructorName: cert.instructorName,
    issueDate: cert.issueDate,
    certificateId: cert.id,
    verificationUrl: `${origin}/verify/${cert.id}`,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AKP-Certificate-${cert.courseTitle.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
