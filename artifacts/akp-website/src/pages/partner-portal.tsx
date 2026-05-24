import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Building2, Users, FileText, BarChart3, CheckCircle, ArrowRight,
  Upload, Shield, Globe, Zap, Clock, Star
} from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Users, title: "Multi-Client Management", desc: "Manage unlimited client companies from a single dashboard. Switch between client accounts instantly." },
  { icon: Upload, title: "Bulk File Management", desc: "Upload and organize financial files for all your clients. Categorized document vaults per company." },
  { icon: BarChart3, title: "Tax Filing Tracking", desc: "Track VAT, income tax, and withholding tax filing status across all client portfolios in real time." },
  { icon: FileText, title: "Bulk Service Requests", desc: "Submit service requests for multiple clients simultaneously. Streamlined request management." },
  { icon: Shield, title: "Enterprise Security", desc: "Role-based access control, audit trails, and encrypted document storage for full compliance." },
  { icon: Globe, title: "API Integration Ready", desc: "Future-ready API endpoints for integration with your accounting software and internal systems." },
];

const benefits = [
  "Dedicated partner account manager",
  "Priority support with 4-hour SLA",
  "Volume pricing for client services",
  "Co-branding options available",
  "Early access to new features",
  "Partner certification program",
  "Referral commission structure",
  "Monthly partner briefings",
];

const partnerTypes = [
  { title: "Accounting Firms", desc: "CPA firms and accounting practices that manage multiple client companies and need streamlined service delivery.", icon: Building2 },
  { title: "Tax Consultancies", desc: "Specialized tax advisory firms that need to track filings, deadlines, and compliance for their client portfolio.", icon: FileText },
  { title: "Business Service Centers", desc: "Business service providers who offer accounting outsourcing and need a technology backbone to scale.", icon: Zap },
];

const testimonials = [
  { name: "Mohamed Abdel-Aziz", role: "Managing Partner", company: "Abdel-Aziz & Partners CPA", text: "AKP's partner portal transformed how we manage our 50+ client companies. We cut administrative time by 60% in the first quarter.", rating: 5 },
  { name: "Rania Khalil", role: "Director", company: "Khalil Business Services", text: "The bulk filing tracking feature alone is worth the partnership. Our clients love the transparency and we love the efficiency.", rating: 5 },
];

export default function PartnerPortal() {
  const [form, setForm] = useState({ firm: "", name: "", email: "", phone: "", clients: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const update = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060E1E] relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full opacity-8"
              style={{ width: `${250 + i * 80}px`, height: `${250 + i * 80}px`, left: `${(i * 30 + 10) % 85}%`, top: `${(i * 25 + 15) % 60}%`, background: "radial-gradient(circle, #C9A84C, transparent)" }}
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060E1E]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-6">
                <Building2 className="w-3.5 h-3.5" /> Partner Program
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                The Accounting Office <span className="text-[#C9A84C]">Partner Portal</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                AKP's B2B partner platform enables accounting firms and business service providers to manage multiple client companies with enterprise-grade tools, compliance tracking, and streamlined service delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#apply" className="px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold hover:opacity-90 transition-all inline-flex items-center gap-2">
                  Apply for Partnership <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#features" className="px-8 py-4 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition-all text-center">
                  See Features
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Partner Firms", value: "45+" },
                  { label: "Companies Managed", value: "800+" },
                  { label: "Files Processed", value: "12K+" },
                  { label: "Tax Returns Filed", value: "3,200+" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                    <div className="text-[#C9A84C] text-sm font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground">Who is this for?</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {partnerTypes.map((type, i) => (
              <FadeIn key={type.title} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all" data-testid={`card-partner-type-${i}`}>
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-[#0A1628]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{type.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{type.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
                Platform Features
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Enterprise Tools for Accounting Partners
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all" data-testid={`card-feature-${i}`}>
                  <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-[#0A1628]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  Partner Benefits
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  Why Partner with AKP?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Joining the AKP partner network gives your firm access to Egypt's most sophisticated financial services infrastructure, co-branded with your identity.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-4">
                {[
                  { icon: Clock, title: "Fast Onboarding", desc: "Partner accounts are activated within 48 hours of application approval." },
                  { icon: Zap, title: "Instant Access", desc: "Full platform access from day one. No waiting for features to unlock." },
                  { icon: Star, title: "Certified Partners", desc: "Join our certified partner directory and get client referrals from AKP." },
                ].map((item, i) => (
                  <div key={item.title} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4" data-testid={`card-benefit-${i}`}>
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#0A1628]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">What Our Partners Say</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-2xl p-6" data-testid={`card-partner-testimonial-${i}`}>
                  <div className="flex mb-3">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}</div>
                  <p className="text-foreground text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm">{t.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{t.name}</div>
                      <div className="text-muted-foreground text-xs">{t.role} — {t.company}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Form */}
      <section id="apply" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Partner Application
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Apply for Partnership</h2>
              <p className="text-muted-foreground">Fill out the form and our partnerships team will get back to you within 2 business days.</p>
            </div>
          </FadeIn>

          {submitted ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-xl mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">Our partnerships team will review your application and contact you within 2 business days.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Firm Name *</label>
                    <input type="text" value={form.firm} onChange={(e) => update("firm", e.target.value)} placeholder="Your accounting firm" required className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-firm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Contact Name *</label>
                    <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" required className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-name" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@firm.com" required className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+20 10 0000 0000" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Number of Client Companies</label>
                  <select value={form.clients} onChange={(e) => update("clients", e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="select-clients">
                    <option value="">Select range</option>
                    <option value="1-10">1–10 companies</option>
                    <option value="11-30">11–30 companies</option>
                    <option value="31-100">31–100 companies</option>
                    <option value="100+">100+ companies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Message</label>
                  <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} placeholder="Tell us about your firm and what you're looking for..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none" data-testid="input-message" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2" data-testid="button-apply">
                  {isLoading ? <span className="w-4 h-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Submit Application</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
