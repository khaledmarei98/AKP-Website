import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Calculator, FileText, TrendingUp, Users, DollarSign, Building2,
  ArrowRight, CheckCircle, Star, ChevronLeft, ChevronRight, Award,
  Shield, Clock, BarChart3, ChevronDown
} from "lucide-react";

// Animated counter hook
function useCounter(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const stats = [
  { label: "Years Experience", value: 15, suffix: "+" },
  { label: "Clients Served", value: 500, suffix: "+" },
  { label: "Courses Available", value: 120, suffix: "+" },
  { label: "Articles Published", value: 300, suffix: "+" },
];

const services = [
  { icon: Calculator, title: "Financial Accounting", desc: "Comprehensive bookkeeping, financial statements, and reporting that keep your business audit-ready.", category: "Finance" },
  { icon: FileText, title: "Tax Consulting", desc: "Strategic tax planning and compliance with Egyptian tax law to minimize liability and risk.", category: "Tax" },
  { icon: BarChart3, title: "Financial Analysis", desc: "Deep financial insights, KPI dashboards, and data-driven recommendations for growth.", category: "Finance" },
  { icon: Users, title: "HR Management", desc: "End-to-end human resources solutions from policy design to performance management.", category: "HR" },
  { icon: DollarSign, title: "Payroll Management", desc: "Accurate, compliant payroll processing with full Egyptian labor law adherence.", category: "HR" },
  { icon: Building2, title: "Business Setup", desc: "Company formation, licensing, and regulatory compliance for new ventures in Egypt.", category: "Finance" },
];

const testimonials = [
  {
    name: "Ahmed Mansour", role: "CFO", company: "Delta Industries Egypt",
    text: "AKP transformed our financial operations completely. Their tax consulting alone saved us over EGP 2 million in the first year. I cannot recommend them highly enough.",
    rating: 5,
  },
  {
    name: "Sara El-Rashidi", role: "HR Director", company: "MedCare Group",
    text: "The HR management team at AKP built our entire HR framework from scratch. Professional, thorough, and deeply knowledgeable about Egyptian labor law.",
    rating: 5,
  },
  {
    name: "Khaled Naguib", role: "CEO", company: "Naguib & Partners",
    text: "We've worked with AKP for 7 years. Their financial consulting has been instrumental in our expansion from 1 to 5 offices across Egypt.",
    rating: 5,
  },
  {
    name: "Dina Farouk", role: "Finance Manager", company: "Apex Tech Solutions",
    text: "Their ERP implementation was seamless. The team understood our business needs and delivered a system that our entire finance team loves.",
    rating: 5,
  },
];

const faqs = [
  { q: "What industries does AKP specialize in?", a: "AKP serves clients across manufacturing, technology, healthcare, retail, construction, and professional services. Our diverse team has sector-specific expertise in each domain." },
  { q: "How does the consultation process work?", a: "Start with a free 30-minute discovery call. We'll assess your needs, then propose a tailored engagement plan. Most projects begin within 5 business days of agreement." },
  { q: "Do you handle international accounting standards?", a: "Yes. Our team is fully trained in IFRS, Egyptian GAAP, and local tax law. We help multinational subsidiaries in Egypt navigate both local and international requirements." },
  { q: "Can AKP handle payroll for large companies?", a: "Absolutely. We process payroll for companies ranging from 5 to 2,000+ employees. Our system is fully compliant with Egyptian social insurance and labor regulations." },
  { q: "What makes AKP different from other accounting firms?", a: "We combine Big 4-caliber expertise with the agility and personalized service of a boutique firm. Every client has a dedicated senior advisor, not just a rotating junior team." },
  { q: "Do you offer training and courses?", a: "Yes — our digital academy offers 120+ courses in accounting, tax, HR, and finance, available to individuals and corporate teams, with certificates recognized in Egypt." },
];

const whyUs = [
  { icon: Award, title: "15+ Years of Excellence", desc: "Decades of proven results across Egypt's most demanding industries." },
  { icon: Shield, title: "Full Legal Compliance", desc: "Every engagement is structured around Egyptian law, regulations, and international standards." },
  { icon: Clock, title: "Responsive Service", desc: "Dedicated advisors available within 24 hours — never left waiting for a response." },
  { icon: TrendingUp, title: "Results-Driven", desc: "We measure success by your outcomes — cost savings, risk reduction, and growth." },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const counters = stats.map((s) => useCounter(s.value, 2000, statsInView));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060E1E]">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${200 + i * 80}px`,
                height: `${200 + i * 80}px`,
                left: `${(i * 17 + 5) % 90}%`,
                top: `${(i * 23 + 10) % 80}%`,
                background: i % 2 === 0
                  ? "radial-gradient(circle, #C9A84C, transparent)"
                  : "radial-gradient(circle, #1a3a6e, transparent)",
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.2,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060E1E]/30 to-[#060E1E]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-8"
          >
            <Star className="w-3.5 h-3.5" />
            Egypt's Premier Consulting Firm
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            Your Trusted Partner in{" "}
            <span className="gold-text">Accounting, Finance</span>
            {" "}&amp; HR Excellence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/70 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            AKP delivers Big 4-caliber expertise to Egyptian businesses — from tax strategy and financial reporting to HR systems and ERP implementation. We don't just advise; we transform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/booking"
              className="px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold text-base hover:opacity-90 transition-all shadow-lg hover:shadow-[#C9A84C]/25 hover:scale-105 active:scale-100"
              data-testid="link-book-consultation-hero"
            >
              Book Consultation
            </Link>
            <Link
              href="/library"
              className="px-8 py-4 rounded-xl border border-white/25 text-white font-semibold text-base hover:bg-white/10 transition-all"
              data-testid="link-explore-resources"
            >
              Explore Resources
            </Link>
          </motion.div>

          {/* Counters */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
                  {counters[i]}{stat.suffix}
                </div>
                <div className="text-[#C9A84C] text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ABOUT */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  About AKP
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Built on Trust. Driven by Expertise.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in Cairo, AKP has spent 15 years building Egypt's most comprehensive accounting and HR consulting practice. Our team of certified accountants, tax specialists, and HR professionals brings international-standard expertise to every engagement.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  We believe that great financial and HR management is not a luxury — it's the foundation every thriving business deserves. Our mission is to make that foundation accessible, reliable, and transformative for companies of all sizes.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {["Certified accountants & advisors", "IFRS & Egyptian GAAP specialists", "Bilingual Arabic & English service", "Dedicated client success team"].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {services.slice(0, 4).map((service, i) => (
                  <motion.div
                    key={service.title}
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(13,31,60,0.12)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-2xl p-5 cursor-pointer"
                    data-testid={`card-service-about-${i}`}
                  >
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center mb-3">
                      <service.icon className="w-5 h-5 text-[#0A1628]" />
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-1">{service.title}</div>
                    <div className="text-xs text-muted-foreground">{service.category}</div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Why Us */}
          <div className="mt-20">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  Why Choose AKP
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground">The AKP Difference</h2>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUs.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                  <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/30 transition-colors" data-testid={`card-why-us-${i}`}>
                    <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-[#0A1628]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
                Our Services
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Comprehensive Solutions for Every Business Need
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                From financial reporting to HR systems — we cover every dimension of your business's administrative and financial infrastructure.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 group hover:border-[#C9A84C]/30 transition-all"
                  data-testid={`card-service-${i}`}
                >
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#0A1628]" />
                  </div>
                  <div className="inline-flex px-2.5 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-medium mb-3">
                    {service.category}
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{service.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-[#C9A84C] text-sm font-medium group-hover:gap-2.5 transition-all"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold hover:opacity-90 transition-all"
                data-testid="link-view-all-services"
              >
                View All Services <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-20 bg-accent/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Client Satisfaction Rate", sub: "Based on annual surveys" },
              { value: "EGP 50M+", label: "Tax Savings Delivered", sub: "Across all clients, last 3 years" },
              { value: "72h", label: "Average Onboarding Time", sub: "From agreement to full service" },
              { value: "15+", label: "Industry Sectors Served", sub: "Across Egypt's economy" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center" data-testid={`stat-${i}`}>
                  <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Client Testimonials
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                What Our Clients Say
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {[testimonials[testimonialIdx], testimonials[(testimonialIdx + 1) % testimonials.length]].map((t, i) => (
                  <div
                    key={t.name}
                    className="bg-card border border-border rounded-2xl p-8"
                    data-testid={`card-testimonial-${i}`}
                  >
                    <div className="flex mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{t.name}</div>
                        <div className="text-muted-foreground text-xs">{t.role} — {t.company}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-all"
                data-testid="button-testimonial-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? "bg-accent w-6" : "bg-border"}`}
                />
              ))}
              <button
                onClick={() => setTestimonialIdx((testimonialIdx + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-all"
                data-testid="button-testimonial-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                FAQ
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">Common Questions</h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.06}>
                <div
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                  data-testid={`faq-item-${i}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-accent shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS + PLATFORM PREVIEW */}
      <section className="py-24 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  Free Tools
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Financial Calculators for Egyptian Businesses
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Instantly calculate VAT, salary deductions, profit margins, and loan repayments — all calibrated for Egyptian tax law and regulations. Free, no login required.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { label: "VAT Calculator (14%)", desc: "Add or extract Egyptian VAT" },
                    { label: "Salary Calculator", desc: "Net salary after deductions" },
                    { label: "Profit Margin", desc: "Gross margin & markup" },
                    { label: "Loan Calculator", desc: "Monthly payment & interest" },
                  ].map((tool) => (
                    <div key={tool.label} className="flex items-start gap-2 p-3 rounded-xl bg-card border border-border">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{tool.label}</div>
                        <div className="text-xs text-muted-foreground">{tool.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-all"
                  data-testid="link-tools-cta"
                >
                  Open Financial Tools <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                  <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-[#0A1628]" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">VAT Calculator</div>
                    <div className="text-muted-foreground text-xs">Egyptian VAT — 14%</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Amount (before VAT)</label>
                    <div className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm">EGP 10,000.00</div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">VAT Rate</label>
                    <div className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm">14%</div>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Net Amount</span>
                      <span className="font-semibold text-foreground">EGP 10,000.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (14%)</span>
                      <span className="font-semibold text-foreground">EGP 1,400.00</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-accent/20 pt-2">
                      <span className="font-bold text-accent">Total Amount</span>
                      <span className="font-bold text-accent">EGP 11,400.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* NEWSLETTER + CTA */}
      <section className="py-24 bg-[#060E1E]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-6">
                  Get Started
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  Join 500+ Egyptian businesses that trust AKP with their financial and human capital foundations. Your first consultation is free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/booking"
                    className="px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2"
                    data-testid="link-cta-consultation"
                  >
                    Book Free Consultation <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 rounded-xl border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-all text-center"
                    data-testid="link-cta-pricing"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <h3 className="text-white font-bold text-lg mb-2">Stay Informed</h3>
                <p className="text-white/60 text-sm mb-5">
                  Subscribe to the AKP newsletter for accounting insights, Egyptian tax law updates, and HR best practices — delivered monthly.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] text-sm transition-colors"
                    data-testid="input-newsletter-name"
                  />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C] text-sm transition-colors"
                      data-testid="input-newsletter-email"
                    />
                    <button className="px-4 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap" data-testid="button-subscribe-home">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-white/30 text-xs">No spam. Unsubscribe at any time.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
