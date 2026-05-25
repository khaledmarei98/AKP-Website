/**
 * AKP Email Template System
 * Firebase-compatible email queue architecture.
 * Uses EmailJS for immediate dispatch; Firestore queue for batch/scheduled sends.
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

// ─── Template Types ────────────────────────────────────────────────────────────

export type EmailTemplateType =
  | "welcome"
  | "booking_confirmation"
  | "booking_status_update"
  | "certificate_issued"
  | "enrollment_confirmation"
  | "payment_receipt"
  | "admin_alert"
  | "password_reset"
  | "newsletter";

export interface EmailPayload {
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  reply_to?: string;
  cta_url?: string;
  cta_label?: string;
}

// ─── Template Builders ─────────────────────────────────────────────────────────

export function buildWelcomeEmail(params: { name: string; email: string }): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: "Welcome to AKP Consulting — Your Account is Ready",
    body: `Dear ${params.name},\n\nWelcome to AKP Consulting! Your account has been successfully created.\n\nYou now have access to:\n• Professional consulting services\n• Online training courses\n• Resource library\n• Client dashboard\n\nWe look forward to supporting your business growth.\n\nBest regards,\nThe AKP Consulting Team`,
    reply_to: "support@akp-consulting.com",
    cta_url: "/dashboard",
    cta_label: "Go to Dashboard",
  };
}

export function buildBookingConfirmationEmail(params: {
  name: string;
  email: string;
  service: string;
  bookingId: string;
  preferredDate?: string;
}): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: `Booking Confirmed — ${params.service} | AKP Consulting`,
    body: `Dear ${params.name},\n\nThank you for your service request. We have received your booking for:\n\nService: ${params.service}\nBooking ID: ${params.bookingId}${params.preferredDate ? `\nPreferred Date: ${params.preferredDate}` : ""}\n\nOur team will review your request and contact you within 1–2 business days to confirm scheduling.\n\nYou can track the status of your request in your client dashboard.\n\nBest regards,\nAKP Consulting Team`,
    reply_to: "bookings@akp-consulting.com",
    cta_url: "/dashboard",
    cta_label: "Track Booking",
  };
}

export function buildBookingStatusEmail(params: {
  name: string;
  email: string;
  bookingId: string;
  status: string;
  adminNotes?: string;
}): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: `Booking Update — Status: ${params.status} | AKP Consulting`,
    body: `Dear ${params.name},\n\nYour service request (ID: ${params.bookingId}) has been updated.\n\nNew Status: ${params.status}${params.adminNotes ? `\n\nNotes from your advisor:\n${params.adminNotes}` : ""}\n\nPlease log in to your dashboard for full details.\n\nBest regards,\nAKP Consulting Team`,
    cta_url: "/dashboard",
    cta_label: "View Booking",
  };
}

export function buildCertificateEmail(params: {
  name: string;
  email: string;
  courseTitle: string;
  certificateId: string;
  verifyUrl: string;
}): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: `Your Certificate of Completion — ${params.courseTitle}`,
    body: `Dear ${params.name},\n\nCongratulations! You have successfully completed "${params.courseTitle}" and your Certificate of Completion has been issued.\n\nCertificate ID: ${params.certificateId}\nVerification URL: ${params.verifyUrl}\n\nYou can download your certificate from your dashboard and share it directly to your LinkedIn profile.\n\nWell done!\n\nAKP Consulting Team`,
    cta_url: params.verifyUrl,
    cta_label: "View Certificate",
  };
}

export function buildEnrollmentEmail(params: {
  name: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
}): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: `Enrolled: ${params.courseTitle} | AKP Consulting`,
    body: `Dear ${params.name},\n\nYou have been successfully enrolled in:\n\n"${params.courseTitle}"\n\nYou can start learning right away from your dashboard.\n\nGood luck!\n\nAKP Consulting Team`,
    cta_url: `/learn/${params.courseSlug}`,
    cta_label: "Start Learning",
  };
}

export function buildPaymentReceiptEmail(params: {
  name: string;
  email: string;
  invoiceNumber: string;
  amount: string;
  description: string;
}): EmailPayload {
  return {
    to_email: params.email,
    to_name: params.name,
    subject: `Payment Receipt — ${params.invoiceNumber} | AKP Consulting`,
    body: `Dear ${params.name},\n\nThank you for your payment. Here is your receipt:\n\nInvoice: ${params.invoiceNumber}\nDescription: ${params.description}\nAmount: ${params.amount}\nDate: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}\n\nKeep this email for your records.\n\nAKP Consulting Finance Team`,
    cta_url: "/dashboard",
    cta_label: "View Invoice",
  };
}

// ─── Send helpers ──────────────────────────────────────────────────────────────

export async function sendTemplatedEmail(payload: EmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: payload.to_email,
      to_name: payload.to_name,
      subject: payload.subject,
      message: payload.body,
      reply_to: payload.reply_to ?? payload.to_email,
    },
    { publicKey: PUBLIC_KEY }
  );
}

// ─── Firestore email queue entry (for future batch/scheduled sends) ─────────────

export interface FirestoreEmailQueueEntry {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  templateType: EmailTemplateType;
  status: "queued" | "sent" | "failed";
  attempts: number;
  scheduledAt?: unknown;
  sentAt?: unknown;
  createdAt: unknown;
}
