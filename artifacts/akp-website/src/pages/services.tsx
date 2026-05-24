import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Calculator, FileText, TrendingUp, Users, DollarSign, Building2,
  BarChart3, PieChart, Briefcase, Search, MonitorCheck, ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Calculator,
    title: "Financial Accounting",
    category: "Finance",
    desc: "Complete financial record-keeping, journal entries, general ledger management, and financial statement preparation aligned with Egyptian GAAP and IFRS standards. We ensure your books are always audit-ready.",
    highlights: ["Monthly closing & reconciliation", "Balance sheet & P&L preparation", "IFRS-compliant reporting", "Audit preparation support"],
  },
  {
    icon: FileText,
    title: "Tax Consulting",
    category: "Tax",
    desc: "Strategic tax planning and full compliance management with Egyptian income tax, VAT, stamp duty, and withholding tax regulations. We minimize your tax burden while keeping you fully compliant.",
    highlights: ["Annual tax return preparation", "VAT registration & filing", "Tax dispute resolution", "Transfer pricing support"],
  },
  {
    icon: MonitorCheck,
    title: "ERP & Accounting Systems",
    category: "Finance",
    desc: "Implementation, configuration, and training for leading ERP and accounting platforms. We help businesses transition from manual processes to powerful, integrated financial management systems.",
    highlights: ["Odoo & SAP implementation", "QuickBooks & Xero setup", "Data migration support", "Staff training programs"],
  },
  {
    icon: DollarSign,
    title: "Payroll Management",
    category: "HR",
    desc: "Accurate, timely, and fully compliant payroll processing for Egyptian businesses. From salary calculation to social insurance contributions and labor law compliance — we handle everything.",
    highlights: ["Monthly salary processing", "Social insurance management", "Income tax withholding", "Payslip generation & delivery"],
  },
  {
    icon: Users,
    title: "HR Management",
    category: "HR",
    desc: "Comprehensive human resources management solutions covering the full employee lifecycle — from onboarding to offboarding, performance management, and labor law compliance.",
    highlights: ["HR policy design", "Employee contracts & handbook", "Performance management", "Labor law compliance"],
  },
  {
    icon: Search,
    title: "Recruitment Support",
    category: "HR",
    desc: "End-to-end recruitment services that help you find, screen, and hire the right talent. We manage the process so your management team can focus on what matters most.",
    highlights: ["Job description design", "Candidate sourcing & screening", "Interview coordination", "Offer & onboarding support"],
  },
  {
    icon: TrendingUp,
    title: "Financial Analysis",
    category: "Finance",
    desc: "Deep financial modeling, KPI analysis, and business intelligence reporting to help leadership make data-driven decisions with confidence.",
    highlights: ["Financial modeling & forecasting", "KPI dashboard development", "Variance analysis", "Profitability analysis"],
  },
  {
    icon: BarChart3,
    title: "Cost Accounting",
    category: "Finance",
    desc: "Detailed cost structure analysis, product/service costing, and cost allocation methodologies to help you price correctly and improve margins.",
    highlights: ["Product & service costing", "Cost center management", "Activity-based costing", "Cost reduction strategies"],
  },
  {
    icon: PieChart,
    title: "Feasibility Studies",
    category: "Finance",
    desc: "Rigorous financial and market feasibility analysis for new projects, expansions, and investments. We give you the data to make informed strategic decisions.",
    highlights: ["Market & financial analysis", "NPV, IRR & payback calculation", "Risk assessment", "Executive summary reports"],
  },
  {
    icon: Briefcase,
    title: "Internal Auditing",
    category: "Finance",
    desc: "Independent internal audit services to evaluate and improve the effectiveness of your risk management, control, and governance processes.",
    highlights: ["Process & control review", "Fraud risk assessment", "Compliance auditing", "Management letter delivery"],
  },
  {
    icon: Building2,
    title: "Business Consulting",
    category: "Finance",
    desc: "Strategic business advisory covering company formation, restructuring, and growth strategy for established and emerging Egyptian businesses.",
    highlights: ["Company formation & licensing", "Business restructuring", "Growth strategy planning", "Investor presentation support"],
  },
];

const categoryColors: Record<string, string> = {
  Finance: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Tax: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Services() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              Our Services
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Comprehensive Consulting Services
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              11 specialized service lines covering every dimension of financial management, tax compliance, and HR operations for Egyptian businesses.
            </p>
          </motion.div>

          {/* Category legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            {["Finance", "Tax", "HR"].map((cat) => (
              <span
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${categoryColors[cat]}`}
              >
                {cat}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(13,31,60,0.10)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-border rounded-2xl p-7 group h-full flex flex-col"
                  data-testid={`card-service-full-${i}`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-[#0A1628]" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[service.category]}`}>
                      {service.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{service.desc}</p>

                  <ul className="space-y-2 mb-6">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all"
                    data-testid={`link-service-learn-more-${i}`}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#060E1E]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold text-white mb-4">Not sure which service you need?</h2>
            <p className="text-white/60 mb-8">Book a free 30-minute consultation and we'll map the right solution for your business.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold hover:opacity-90 transition-all"
              data-testid="link-services-cta"
            >
              Book Free Consultation <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
