import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isConfigured } from "@/lib/firebase";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return FIREBASE_ERRORS[(error as { code: string }).code] ?? "An error occurred. Please try again.";
  }
  return "An error occurred. Please try again.";
}

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060E1E] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to your AKP account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          {!isConfigured && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-5">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-xs">Demo mode — sign in with any credentials</p>
            </div>
          )}

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
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-[#C9A84C] text-xs hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-white/50 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-[#C9A84C] font-medium hover:underline" data-testid="link-register">
                Create one
              </Link>
            </p>
          </div>

          {!isConfigured && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs text-center mb-2">Demo — click Sign In with any credentials</p>
              <button
                onClick={() => { setEmail("ahmed@delta-industries.com"); setPassword("demo123"); }}
                className="w-full py-2 rounded-lg border border-white/15 text-white/60 text-xs hover:text-white/80 transition-colors"
                data-testid="button-demo-fill"
              >
                Fill Demo Credentials
              </button>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-white/30 text-xs mt-6"
        >
          By signing in you agree to our{" "}
          <a href="#" className="text-white/50 hover:text-white/70">Terms of Service</a>
          {" "}&amp;{" "}
          <a href="#" className="text-white/50 hover:text-white/70">Privacy Policy</a>
        </motion.p>
      </div>
    </div>
  );
}
