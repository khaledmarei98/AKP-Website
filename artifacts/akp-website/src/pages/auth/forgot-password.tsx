import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/too-many-requests": "Too many requests. Please try again later.",
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return FIREBASE_ERRORS[(error as { code: string }).code] ?? "Failed to send reset email. Please try again.";
  }
  return "Failed to send reset email. Please try again.";
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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
          <Link href="/">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg">
                <span className="text-[#0A1628] font-bold text-lg">AKP</span>
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-xl">AKP Consulting</div>
                <div className="text-[#C9A84C] text-xs font-medium tracking-wider">EGYPT</div>
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="text-white/50 text-sm mt-1">
            {sent ? "Check your inbox for the reset link." : "Enter your email and we'll send a reset link."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Email Sent</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <strong className="text-white">{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <p className="text-white/40 text-xs mb-6">
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-[#C9A84C] hover:underline">
                  try again
                </button>.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity"
                data-testid="link-back-to-login"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  data-testid="button-send-reset"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full animate-spin" />
                  ) : (
                    <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-white/50 text-sm hover:text-white transition-colors"
                  data-testid="link-back-login"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
