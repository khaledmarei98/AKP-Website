import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, X, ExternalLink, Star } from "lucide-react";
import { useLocation } from "wouter";
import type { FirestoreCertificate } from "@/lib/certificates";
import { downloadCertificateBlob } from "@/lib/certificates";

interface Props {
  cert: FirestoreCertificate | null;
  courseTitle: string;
  studentName: string;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#C9A84C", "#FFD700", "#ffffff", "#4CAF50", "#64B5F6", "#CE93D8"];

function Particle({ delay }: { delay: number }) {
  const left = `${Math.random() * 100}%`;
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const size = Math.random() * 7 + 4;
  const rotate = Math.random() * 360;
  return (
    <motion.div
      className="absolute top-0 rounded-sm pointer-events-none"
      style={{ left, width: size, height: size * 0.6, backgroundColor: color, rotate }}
      initial={{ y: -30, opacity: 1 }}
      animate={{ y: "105vh", opacity: 0, rotate: rotate + 540 }}
      transition={{ duration: 2.5 + Math.random() * 2, delay, ease: "linear" }}
    />
  );
}

export default function CertificateOverlay({ cert, courseTitle, studentName, onClose }: Props) {
  const [, navigate] = useLocation();
  const [particles] = useState(() => Array.from({ length: 50 }, (_, i) => i));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-[#020B17]/95 backdrop-blur-md" onClick={onClose} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((i) => (
            <Particle key={i} delay={i * 0.04} />
          ))}
        </div>

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ scale: 0.75, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(160deg, #0D1F3C 0%, #0A1628 50%, #0F2540 100%)", border: "1px solid rgba(201,168,76,0.35)" }}
          >
            {/* Top hero */}
            <div className="px-8 pt-8 pb-6 text-center relative">
              <div className="flex justify-center gap-1.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.25 + i * 0.07, type: "spring", bounce: 0.6 }}
                  >
                    <Star className="w-5 h-5 fill-[#C9A84C] text-[#C9A84C]" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
              >
                <Award className="w-10 h-10 text-[#0A1628]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="text-2xl font-bold text-white mb-1">Course Complete!</h2>
                <p className="text-[#C9A84C] text-sm font-medium">Your certificate has been issued</p>
              </motion.div>
            </div>

            {/* Certificate preview card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mx-6 mb-5 rounded-2xl p-5"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <div className="text-center mb-3">
                <div className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.15em] mb-1">
                  Certificate of Completion
                </div>
                <div className="text-[11px] text-white/45">This certifies that</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#C9A84C] truncate">{studentName}</div>
                <div className="text-[11px] text-white/45 my-1">has successfully completed</div>
                <div className="text-sm font-semibold text-white truncate px-2">{courseTitle}</div>
              </div>
              {cert && (
                <div className="mt-3.5 pt-3 border-t border-[#C9A84C]/15 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-white/35 leading-relaxed">
                    <div>Issued: {cert.issueDate}</div>
                    <div className="font-mono">{cert.id}</div>
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ border: "1px solid rgba(201,168,76,0.4)" }}
                  >
                    <Award className="w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="px-6 pb-6 space-y-2.5"
            >
              {cert && (
                <button
                  onClick={() => downloadCertificateBlob(cert)}
                  className="w-full py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Certificate PDF
                </button>
              )}
              <div className="flex gap-2.5">
                <button
                  onClick={() => { navigate("/dashboard"); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl text-[#C9A84C] text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#C9A84C]/10 transition-colors"
                  style={{ border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> My Certificates
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                >
                  Keep Learning
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
