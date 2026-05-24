import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calculator, DollarSign, TrendingUp, Percent, CreditCard, Users, ChevronRight } from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

function InputField({ label, value, onChange, prefix, suffix, type = "number" }: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-muted-foreground text-sm font-medium">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-muted border border-border rounded-xl py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors ${prefix ? "pl-12" : "pl-4"} ${suffix ? "pr-14" : "pr-4"}`}
        />
        {suffix && <span className="absolute right-3 text-muted-foreground text-sm font-medium">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlighted }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-border last:border-0 ${highlighted ? "text-accent font-bold" : "text-foreground"}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function VATCalculator() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("14");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const n = parseFloat(amount) || 0;
  const r = parseFloat(rate) / 100 || 0;
  const vatAmount = mode === "exclusive" ? n * r : n - n / (1 + r);
  const total = mode === "exclusive" ? n + vatAmount : n;
  const net = mode === "exclusive" ? n : n / (1 + r);

  const fmt = (v: number) => `EGP ${v.toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["exclusive", "inclusive"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-accent text-[#0A1628]" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {m === "exclusive" ? "Add VAT" : "Extract VAT"}
          </button>
        ))}
      </div>
      <InputField label={mode === "exclusive" ? "Amount (before VAT)" : "Amount (including VAT)"} value={amount} onChange={setAmount} prefix="EGP" />
      <InputField label="VAT Rate" value={rate} onChange={setRate} suffix="%" />
      <div className="bg-muted/50 rounded-xl p-4 mt-4">
        <ResultRow label="Net Amount" value={fmt(net)} />
        <ResultRow label={`VAT (${rate}%)`} value={fmt(vatAmount)} />
        <ResultRow label="Total Amount" value={fmt(total)} highlighted />
      </div>
    </div>
  );
}

function SalaryCalculator() {
  const [gross, setGross] = useState("10000");
  const insurance = Math.min(parseFloat(gross) * 0.11, 1610);
  const taxableIncome = parseFloat(gross) - insurance;
  const incomeTax = taxableIncome > 30000 ? 0 : taxableIncome > 20000 ? (taxableIncome - 20000) * 0.1 + 1500 : taxableIncome > 10000 ? (taxableIncome - 10000) * 0.15 : taxableIncome * 0.1;
  const net = parseFloat(gross) - insurance - Math.max(0, incomeTax / 12);
  const fmt = (v: number) => `EGP ${v.toLocaleString("en-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      <InputField label="Gross Monthly Salary" value={gross} onChange={setGross} prefix="EGP" />
      <div className="bg-muted/50 rounded-xl p-4">
        <ResultRow label="Gross Salary" value={fmt(parseFloat(gross) || 0)} />
        <ResultRow label="Social Insurance (11%)" value={`- ${fmt(insurance)}`} />
        <ResultRow label="Taxable Income" value={fmt(taxableIncome || 0)} />
        <ResultRow label="Net Take-Home" value={fmt(net || 0)} highlighted />
      </div>
      <p className="text-xs text-muted-foreground">Simplified estimate. Actual deductions depend on insurance brackets and full annual income. Consult AKP for precise payroll calculations.</p>
    </div>
  );
}

function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState("100000");
  const [cost, setCost] = useState("70000");
  const r = parseFloat(revenue) || 0;
  const c = parseFloat(cost) || 0;
  const gross = r - c;
  const margin = r > 0 ? (gross / r) * 100 : 0;
  const markup = c > 0 ? (gross / c) * 100 : 0;
  const fmt = (v: number) => `EGP ${v.toLocaleString("en-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      <InputField label="Total Revenue" value={revenue} onChange={setRevenue} prefix="EGP" />
      <InputField label="Total Costs (COGS)" value={cost} onChange={setCost} prefix="EGP" />
      <div className="bg-muted/50 rounded-xl p-4">
        <ResultRow label="Gross Profit" value={fmt(gross)} />
        <ResultRow label="Gross Margin" value={`${margin.toFixed(1)}%`} highlighted />
        <ResultRow label="Markup %" value={`${markup.toFixed(1)}%`} />
      </div>
    </div>
  );
}

function LoanCalculator() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("18");
  const [years, setYears] = useState("5");
  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) / 100) / 12;
  const n = (parseFloat(years) || 1) * 12;
  const monthly = r > 0 ? p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
  const total = monthly * n;
  const interest = total - p;
  const fmt = (v: number) => `EGP ${v.toLocaleString("en-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      <InputField label="Loan Amount" value={principal} onChange={setPrincipal} prefix="EGP" />
      <InputField label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" />
      <InputField label="Loan Term" value={years} onChange={setYears} suffix="yrs" />
      <div className="bg-muted/50 rounded-xl p-4">
        <ResultRow label="Monthly Payment" value={fmt(monthly)} highlighted />
        <ResultRow label="Total Payment" value={fmt(total)} />
        <ResultRow label="Total Interest" value={fmt(interest)} />
      </div>
    </div>
  );
}

const tools = [
  { id: "vat", title: "VAT Calculator", icon: Percent, desc: "Add or extract Egyptian VAT (14%) from any amount.", component: VATCalculator },
  { id: "salary", title: "Salary Calculator", icon: Users, desc: "Estimate net take-home salary after social insurance deductions.", component: SalaryCalculator },
  { id: "margin", title: "Profit Margin", icon: TrendingUp, desc: "Calculate gross profit margin and markup percentage.", component: ProfitMarginCalculator },
  { id: "loan", title: "Loan Calculator", icon: CreditCard, desc: "Calculate monthly loan payments, total interest, and amortization.", component: LoanCalculator },
];

export default function Tools() {
  const [activeTool, setActiveTool] = useState("vat");
  const active = tools.find((t) => t.id === activeTool)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              <Calculator className="w-3.5 h-3.5" /> Financial Tools
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Free Financial Calculators
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Quick calculations for Egyptian businesses — VAT, salary, profit margins, and more. All calculations are estimates; contact AKP for precise professional advice.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tool selector */}
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground mb-4">Select a Tool</h2>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${activeTool === tool.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 bg-card"}`}
                  data-testid={`button-tool-${tool.id}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTool === tool.id ? "gold-gradient" : "bg-muted"}`}>
                    <tool.icon className={`w-5 h-5 ${activeTool === tool.id ? "text-[#0A1628]" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${activeTool === tool.id ? "text-accent" : "text-foreground"}`}>{tool.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.desc}</div>
                  </div>
                </button>
              ))}

              <div className="bg-muted/30 border border-border rounded-2xl p-4 mt-6">
                <div className="text-sm font-semibold text-foreground mb-1">Need precise calculations?</div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">Our tools provide estimates. For accurate payroll, tax, and financial calculations, our professionals are available.</p>
                <a href="/contact" className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                  Contact an Advisor <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Calculator */}
            <div className="lg:col-span-2">
              <FadeIn key={activeTool}>
                <div className="bg-card border border-border rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center">
                      <active.icon className="w-5 h-5 text-[#0A1628]" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">{active.title}</h2>
                      <p className="text-muted-foreground text-sm">{active.desc}</p>
                    </div>
                  </div>
                  <active.component />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon tools */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-xl font-bold text-foreground mb-8 text-center">More Tools Coming Soon</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Payroll Calculator", "Tax Return Estimator", "NPV / IRR Calculator", "Break-Even Analysis"].map((name, i) => (
              <FadeIn key={name} delay={i * 0.08}>
                <div className="bg-card border border-dashed border-border rounded-2xl p-5 text-center opacity-60">
                  <DollarSign className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <div className="font-medium text-foreground text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
