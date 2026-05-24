import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY && ADMIN_EMAIL);
}

export interface NotificationParams {
  fromName: string;
  fromEmail: string;
  phone?: string;
  service?: string;
  message: string;
  source: "Contact Form" | "Chat Escalation";
  chatSummary?: string;
}

export async function sendContactNotification(params: NotificationParams): Promise<void> {
  if (!isEmailConfigured()) {
    return;
  }

  const chatBlock = params.chatSummary
    ? `\n\n--- Chat Transcript ---\n${params.chatSummary}`
    : "";

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: ADMIN_EMAIL,
      from_name: params.fromName,
      from_email: params.fromEmail,
      phone: params.phone || "—",
      service: params.service || "—",
      source: params.source,
      message: params.message + chatBlock,
      reply_to: params.fromEmail,
    },
    { publicKey: PUBLIC_KEY }
  );
}
