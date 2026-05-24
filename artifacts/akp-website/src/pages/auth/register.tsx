import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Building2, Phone, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/operation-not-allowed": "Email/password registration is not enabled. Please contact support.",
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return FIREBASE_ERRORS[(error as { code: string }).code] ?? "Registration failed. Please try again.";
  }
  return "Registration failed. Please try again.";
}

const accountTypes: { value: UserRole; label: string; desc: string }[] = [
  { value: "client", label: "Business Client", desc: "Access accounting, tax, and HR services" },
  { value: "student", label: "Student / Professional", desc: "Access online courses and certifications" },
  { value: "accounting_partner", label: "Accounting Office Partner", desc: "Partner portal for accounting firms" },
];

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await register(name, email, password, role, company || undefined, phone || undefined);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060E1E] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
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
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="text-white/50 text-sm mt-1">Join Egypt's premier financial services platform</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s <= step ? "gold-gradient text-[#0A1628]" : "bg-white/10 text-white/40"}`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs ${s <= step ? "text-[#C9A84C]" : "text-white/30"}`}>
                {s === 1 ? "Account Type" : "Your Details"}
              </span>
              {s < 2 && <div className={`w-12 h-px ${s < step ? "bg-[#C9A84C]" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold mb-5">Choose your account type</h2>
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setRole(type.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                    role === type.value
                      ? "border-[#C9A84C] bg-[#C9A84C]/10"
                      : "border-white/15 hover:border-white/30"
                  }`}
                  data-testid={`button-role-${type.value}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${role === type.value ? "border-[#C9A84C]" : "border-white/30"}`}>
                    {role === type.value && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${role === type.value ? "text-[#C9A84C]" : "text-white"}`}>{type.label}</div>
                    <div className="text-white/50 text-xs mt-0.5">{type.desc}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                data-testid="button-next-step"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-white font-semibold mb-5">Fill in your details</h2>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmed Karim"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                    data-testid="input-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Email Address *</label>
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

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 10 1234 5678"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              {(role === "client" || role === "accounting_partner") && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company"
                      className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                      data-testid="input-company"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                    data-testid="input-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:border-white/40 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-white/50 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#C9A84C] font-medium hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
