import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, RefreshCw, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const { user, logout, sendVerificationEmail, refreshUser } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-poll every 5 seconds to detect verification
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshUser();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  // Navigate to dashboard when verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate("/dashboard");
    }
  }, [user?.isVerified, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setResendError("");
    setResendSuccess(false);
    setIsSending(true);
    try {
      await sendVerificationEmail();
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setResendError("Failed to resend. Please wait a moment and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckNow = useCallback(async () => {
    setIsChecking(true);
    try {
      await refreshUser();
    } finally {
      setIsChecking(false);
    }
  }, [refreshUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#060E1E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-9 h-9 text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
          <p className="text-white/50 text-sm mt-2 leading-relaxed">
            We sent a verification link to
          </p>
          <p className="text-[#C9A84C] font-semibold text-sm mt-1">{user?.email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          {/* Instructions */}
          <div className="space-y-3">
            {[
              "Open the email from AKP Consulting",
              "Click the verification link",
              "You'll be signed in automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center shrink-0 text-[#0A1628] font-bold text-xs">
                  {i + 1}
                </div>
                <span className="text-white/70 text-sm">{step}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5 space-y-3">
            {/* Feedback messages */}
            {resendSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Verification email resent successfully.
              </div>
            )}
            {resendError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {resendError}
              </div>
            )}

            {/* Check now */}
            <button
              onClick={handleCheckNow}
              disabled={isChecking}
              className="w-full py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking…" : "I've Verified — Continue"}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
              className="w-full py-3 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:border-white/40 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending
                ? "Sending…"
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
            </button>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-white/40 text-xs text-center mb-3">
              Wrong email address or want to start over?
            </p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 text-sm hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out & Use Different Account
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-white/30 text-xs mt-6"
        >
          Didn't receive the email? Check your spam folder.
        </motion.p>
      </div>
    </div>
  );
}
