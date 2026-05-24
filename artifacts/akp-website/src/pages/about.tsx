import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Award, Shield, Clock, TrendingUp, Users, CheckCircle,
  Star, Globe, BookOpen, Briefcase, ArrowRight, Target, Heart
} from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const leadership = [
  {
    name: "Dr. Ahmed Kamal", role: "Chief Accounting Advisor", bio: "15+ years in financial advisory. Former Big 4 partner. IFRS specialist and CPA holder with deep expertise in Egyptian accounting law.",
    expertise: ["IFRS", "Financial Reporting", "Audit"],
  },
  {
    name: "CPA Ahmed Fathy", role: "Tax Advisory Director", bio: "Egypt's leading tax consultant with 12+ years navigating Egyptian Tax Authority regulations. Specializes in corporate tax strategy and VAT compliance.",
    expertise: ["Corporate Tax", "VAT", "Tax Litigation"],
  },
  {
    name: "Dr. Mona Hassan", role: "HR Solutions Director", bio: "10+ years building HR frameworks for Egyptian corporations. Expert in Egyptian Labor Law No. 12/2003 and organizational development.",
    expertise: ["Labor Law", "HR Strategy", "Organizational Design"],
  },
  {
    name: "Eng. Mohamed Ali", role: "ERP Systems Lead", bio: "Implementation expert for SAP, Oracle, and Microsoft Dynamics ERP systems across Egyptian manufacturing, retail, and services companies.",
    expertise: ["SAP", "Oracle ERP", "System Integration"],
  },
];

const milestones = [
  { year: "2009", event: "AKP Consulting Founded", desc: "Established in Cairo with a team of 4 certified accountants and a mission to deliver Big 4-quality services to mid-market Egyptian businesses." },
  { year: "2013", event: "HR Division Launched", desc: "Expanded into HR management services, responding to growing demand from clients needing integrated finance and HR solutions." },
  { year: "2016", event: "Digital Academy Opens", desc: "Launched AKP Academy with 20 courses, making professional accounting and HR education accessible across Egypt." },
  { year: "2019", event: "ERP Practice Established", desc: "Formed a dedicated ERP implementation team, delivering Oracle and SAP projects for Egyptian manufacturing and retail clients." },
  { year: "2022", event: "500 Clients Milestone", desc: "Reached 500 active client engagements across Egypt's 15+ industry sectors. Team grew to 60+ certified professionals." },
  { year: "2024", event: "Digital Platform Launch", desc: "Launched the AKP digital ecosystem — integrating client portals, online courses, resources, and digital consulting delivery." },
];

const values = [
  { icon: Shield, title: "Integrity First", desc: "Every engagement is conducted with absolute transparency and ethical standards. Our advice is always in your best interest." },
  { icon: Target, title: "Results-Focused", desc: "We measure our success by your outcomes — cost savings, compliance, growth, and risk reduction. No vague deliverables." },
  { icon: Globe, title: "International Standards", desc: "We apply IFRS, international best practices, and global professional standards to every Egyptian engagement." },
  { icon: Heart, title: "Client Partnership", desc: "We build long-term relationships, not one-off projects. Our clients average 6+ years of continuous engagement with AKP." },
];

const certifications = [
  "Certified Public Accountant (CPA)", "Chartered Financial Analyst (CFA)", "IFRS Certified",
  "Egyptian Tax Authority Registered", "CIPD (HR Professional)", "SAP Certified Consultants",
  "Oracle ERP Certified", "Microsoft Dynamics Partners",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060E1E] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-8"
              style={{
                width: `${180 + i * 60}px`,
                height: `${180 + i * 60}px`,
                left: `${(i * 25 + 5) % 90}%`,
                top: `${(i * 31 + 10) % 70}%`,
                background: i % 2 === 0
                  ? "radial-gradient(circle, #C9A84C, transparent)"
                  : "radial-gradient(circle, #1a3a6e, transparent)",
              }}
              animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
              transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060E1E]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-6">
              Our Story
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Built on Trust.<br />
              <span className="text-[#C9A84C]">Driven by Expertise.</span>
            </h1>
            <p className="text-white/60 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              For 15 years, AKP has been Egypt's most trusted partner for accounting, finance, tax, HR, and ERP consulting. We combine international expertise with deep local knowledge to deliver results that matter.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "15+", label: "Years Experience" },
              { value: "500+", label: "Clients Served" },
              { value: "60+", label: "Expert Professionals" },
              { value: "15", label: "Industry Sectors" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-[#C9A84C] text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                  Who We Are
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Egypt's Premier Accounting & Consulting Ecosystem
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in Cairo in 2009, AKP Consulting has grown from a boutique accounting firm into Egypt's most comprehensive financial services ecosystem. We serve companies across every major industry sector — from startups to multinationals.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our team of 60+ certified professionals brings Big 4-caliber expertise with the responsiveness and dedication that only a focused, client-centric firm can offer. We don't just advise — we implement, train, and transform alongside our clients.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "CPA & IFRS certified advisors",
                    "Full Egyptian law compliance",
                    "Bilingual Arabic & English",
                    "Dedicated senior advisors",
                    "15+ industry specializations",
                    "International best practices",
                  ].map((item) => (
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
                {values.map((value, i) => (
                  <motion.div
                    key={value.title}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all"
                    data-testid={`card-value-${i}`}
                  >
                    <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center mb-4">
                      <value.icon className="w-5 h-5 text-[#0A1628]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
                Our Journey
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                15 Years of Growth
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-px bg-[#C9A84C]/20 hidden lg:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <FadeIn key={m.year} delay={i * 0.08}>
                  <div className={`grid lg:grid-cols-2 gap-6 lg:gap-12 items-center ${i % 2 === 0 ? "" : "lg:direction-rtl"}`}>
                    <div className={`${i % 2 === 0 ? "lg:text-right" : "lg:col-start-2 lg:row-start-1"}`}>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all" data-testid={`card-milestone-${i}`}>
                        <div className="text-[#C9A84C] font-bold text-xl mb-1">{m.year}</div>
                        <h3 className="font-semibold text-white text-lg mb-2">{m.event}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                    <div className={`hidden lg:flex items-center justify-center ${i % 2 === 0 ? "" : "lg:col-start-1 lg:row-start-1"}`}>
                      <div className="w-4 h-4 rounded-full gold-gradient ring-4 ring-[#060E1E]" />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Our Team
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Leadership & Expert Advisors
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Every client engagement is led by a senior certified professional — never delegated to junior staff.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all" data-testid={`card-leader-${i}`}>
                  <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#0A1628] font-bold text-xl">{member.name.charAt(0)}</span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-accent text-sm mt-0.5">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.expertise.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Award className="w-3.5 h-3.5" /> Credentials & Certifications
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Internationally Recognized Qualifications
              </h2>
            </div>
          </FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {certifications.map((cert, i) => (
              <FadeIn key={cert} delay={i * 0.06}>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-accent/30 transition-all">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm text-foreground font-medium">{cert}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#060E1E]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Work with Egypt's Best?
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Schedule a free 30-minute discovery call with a senior AKP advisor. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl gold-gradient text-[#0A1628] font-bold hover:opacity-90 transition-all inline-flex items-center gap-2"
                data-testid="link-about-cta"
              >
                Book a Free Consultation <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="px-8 py-4 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Explore Our Services
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
