import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, ExternalLink } from "lucide-react";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "201000000000";
const WHATSAPP_BASE = "https://wa.me/";

interface WhatsAppPreset {
  label: string;
  message: string;
}

const PRESETS: WhatsAppPreset[] = [
  { label: "Book a Consultation", message: "Hi AKP Consulting, I'd like to book a consultation session." },
  { label: "Course Inquiry", message: "Hi, I'd like to know more about your training courses." },
  { label: "Tax & Accounting Help", message: "Hello, I need assistance with tax and accounting services." },
  { label: "General Support", message: "Hi AKP team, I need some support." },
];

function buildWhatsAppUrl(message: string): string {
  return `${WHATSAPP_BASE}${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#1a2840] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 w-72 overflow-hidden"
          >
            <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">AKP Consulting</div>
                <div className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
                  Typically replies quickly
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                Hi there! How can we help you today? Choose a topic or start a conversation.
              </p>
              <div className="space-y-2">
                {PRESETS.map((preset) => (
                  <a
                    key={preset.label}
                    href={buildWhatsAppUrl(preset.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-[#25D366]/10 border border-gray-100 dark:border-white/10 hover:border-[#25D366]/30 transition-all group text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {preset.label}
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] transition-colors" />
                  </a>
                ))}
              </div>
              <a
                href={buildWhatsAppUrl("Hi AKP Consulting, I'd like to get in touch.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4" />
                Start a Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
        style={{ background: "#25D366" }}
        aria-label="Contact us on WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-green-300 border-2 border-white animate-pulse" />
      </motion.button>
    </div>
  );
}

export function WhatsAppCTA({
  message = "Hi AKP Consulting, I'd like to learn more about your services.",
  label = "Chat on WhatsApp",
  className = "",
}: {
  message?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 ${className}`}
      style={{ background: "#25D366" }}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </a>
  );
}
