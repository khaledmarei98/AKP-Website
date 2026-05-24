import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, ArrowRight, Star, Building2, Users, Zap } from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    badge: null,
    price: { monthly: "EGP 2,500", annual: "EGP 2,000" },
    desc: "Perfect for small businesses and startups needing core accounting compliance.",
    features: [
      "Monthly bookkeeping & ledger",
      "Quarterly VAT filing",
      "Annual financial statements",
      "Basic payroll (up to 10 employees)",
      "Email & phone support",
      "Digital library access",
      "1 free consultation/quarter",
    ],
    missing: ["Tax advisory", "ERP consulting", "HR management", "Priority support"],
    cta: "Get Started",
    color: "border-border",
  },
  {
    id: "professional",
    name: "Professional",
    icon: Star,
    badge: "Most Popular",
    price: { monthly: "EGP 6,500", annual: "EGP 5,200" },
    desc: "For growing companies needing comprehensive accounting, tax, and HR services.",
    features: [
      "Full accounting & financial reporting",
      "Monthly VAT & tax filings",
      "Annual & quarterly statements",
      "Full payroll (up to 50 employees)",
      "Tax advisory sessions (4/year)",
      "HR policy design & compliance",
      "Course access for 3 staff",
      "Priority support (24h response)",
      "Dedicated senior advisor",
      "Quarterly business reviews",
    ],
    missing: ["ERP implementation", "Partner portal"],
    cta: "Start Free Trial",
    color: "border-accent",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    badge: "Full Suite",
    price: { monthly: "Custom", annual: "Custom" },
    desc: "End-to-end financial, HR, and technology transformation for large organizations.",
    features: [
      "Everything in Professional",
      "ERP implementation & training",
      "Unlimited payroll processing",
      "Dedicated account team",
      "Monthly CFO advisory sessions",
      "Full HR management system",
      "Custom course development",
      "IFRS reporting & compliance",
      "24/7 priority support",
      "On-site visits (monthly)",
      "Accounting office partner access",
      "Feasibility studies & board reporting",
    ],
    missing: [],
    cta: "Contact Sales",
    color: "border-white/20",
  },
];

const addons = [
  { name: "Additional Payroll Employees", price: "EGP 25/employee/month" },
  { name: "Extra Tax Advisory Session", price: "EGP 800/session" },
  { name: "ERP System Setup", price: "From EGP 15,000" },
  { name: "HR Employee Handbook", price: "EGP 3,500 one-time" },
  { name: "Feasibility Study", price: "From EGP 8,000" },
  { name: "Additional Course Licenses", price: "EGP 450/seat" },
];

const faqs = [
  { q: "Can I change my plan at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle. Our team will help transition your services smoothly." },
  { q: "Is there a minimum contract period?", a: "Monthly plans have no lock-in. Annual plans offer 20% savings and require a 12-month commitment. Enterprise contracts are negotiated individually." },
  { q: "What happens if I exceed my payroll employee limit?", a: "Additional employees are billed at EGP 25/employee/month, prorated. You'll receive a notification before any overage charges are applied." },
  { q: "Do you offer a free trial?", a: "The Professional plan includes a 30-day trial period. During the trial, you'll have full access to all Professional features with a dedicated onboarding advisor." },
  { q: "Is accounting software included?", a: "AKP handles your accounting using licensed professional software. If you need your own ERP system, our Enterprise plan includes full implementation and training." },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              Transparent Pricing
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Scalable Plans
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Whether you're a startup, a growing business, or a large enterprise — AKP has the right service package for your needs.
            </p>
            <div className="inline-flex items-center p-1 rounded-xl bg-white/10 border border-white/20">
              {(["monthly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billing === b ? "gold-gradient text-[#0A1628]" : "text-white/60 hover:text-white"}`}
                  data-testid={`button-billing-${b}`}
                >
                  {b === "monthly" ? "Monthly" : "Annual"}{b === "annual" && <span className="ml-1.5 text-xs text-emerald-400 font-bold">-20%</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <FadeIn key={plan.id} delay={i * 0.1}>
                <div
                  className={`relative bg-card border-2 ${plan.badge === "Most Popular" ? "border-accent shadow-accent/10 shadow-2xl" : plan.id === "enterprise" ? "bg-[#060E1E]" : plan.color} rounded-3xl p-8 h-full flex flex-col`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${plan.id === "enterprise" ? "bg-white/10 text-white" : "gold-gradient text-[#0A1628]"}`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${plan.badge === "Most Popular" ? "gold-gradient" : "bg-accent/10"}`}>
                      <plan.icon className={`w-6 h-6 ${plan.badge === "Most Popular" ? "text-[#0A1628]" : "text-accent"}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.desc}</p>
                  </div>

                  <div className="mb-8">
                    <div className="text-3xl font-bold text-foreground">
                      {plan.price[billing]}
                    </div>
                    {plan.price.monthly !== "Custom" && (
                      <div className="text-muted-foreground text-sm mt-0.5">per month + VAT</div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through">
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/20 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.id === "enterprise" ? "/contact" : "/auth/register"}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all text-center inline-block ${
                      plan.badge === "Most Popular"
                        ? "gold-gradient text-[#0A1628] hover:opacity-90"
                        : "border border-accent text-accent hover:bg-accent/10"
                    }`}
                    data-testid={`link-plan-cta-${plan.id}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Optional Add-ons</h2>
              <p className="text-muted-foreground">Add specific services to any plan as needed.</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon, i) => (
              <FadeIn key={addon.name} delay={i * 0.07}>
                <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4" data-testid={`card-addon-${i}`}>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{addon.name}</div>
                  </div>
                  <div className="text-accent font-semibold text-sm shrink-0">{addon.price}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl font-bold text-foreground">Pricing FAQ</h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.06}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden" data-testid={`faq-pricing-${i}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-medium text-foreground text-sm pr-4">{faq.q}</span>
                    <span className={`text-accent text-xl leading-none shrink-0 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#060E1E]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold text-white mb-4">Not sure which plan is right for you?</h2>
            <p className="text-white/60 mb-8">Talk to our team. We'll recommend the best fit for your business size and needs.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold hover:opacity-90 transition-all"
              data-testid="link-pricing-cta"
            >
              Talk to Our Team <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
