import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CreditCard, Receipt, CheckCircle, Clock, XCircle, RefreshCw,
  Loader2, AlertCircle, ExternalLink, Filter, DollarSign, TrendingUp,
} from "lucide-react";
import { queryDocuments, COLLECTIONS } from "@/lib/firestore";
import { orderBy } from "firebase/firestore";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS, SUBSCRIPTION_PLANS, formatCurrency, type PaymentStatus } from "@/lib/payments";

export interface FirestorePayment {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  orderId: string;
  amount: number;
  currency: "EGP" | "USD";
  status: PaymentStatus;
  method: "paymob" | "stripe" | "vodafone_cash" | "manual";
  description: string;
  relatedType?: "course" | "subscription" | "booking" | "service";
  relatedId?: string;
  invoiceNumber?: string;
  paymobOrderId?: string;
  paymobTransactionId?: string;
  failureReason?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

const METHOD_LABELS: Record<string, string> = {
  paymob: "Paymob",
  stripe: "Stripe",
  vodafone_cash: "Vodafone Cash",
  manual: "Manual",
};

const STATUS_ICONS: Record<PaymentStatus, typeof CheckCircle> = {
  completed: CheckCircle,
  pending: Clock,
  failed: XCircle,
  refunded: RefreshCw,
  cancelled: XCircle,
};

async function fetchPayments(): Promise<FirestorePayment[]> {
  return queryDocuments<FirestorePayment>(COLLECTIONS.PAYMENTS, [
    orderBy("createdAt", "desc"),
  ]);
}

export default function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: fetchPayments,
    staleTime: 30_000,
  });

  const filtered = statusFilter === "all"
    ? payments
    : payments.filter((p) => p.status === statusFilter);

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium">
            Paymob Integration Pending
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Collected", value: formatCurrency(totalCompleted), icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Pending", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Transactions", value: String(payments.length), icon: CreditCard, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Paymob Integration Card */}
      <div className="bg-card border border-[#C9A84C]/30 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#0A1628]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Paymob Payment Gateway</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Paymob is configured as the primary payment gateway for Egypt. To activate live payments, add your Paymob API credentials to the server-side environment.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {["VITE_PAYMOB_API_KEY", "VITE_PAYMOB_INTEGRATION_ID", "VITE_PAYMOB_IFRAME_ID"].map((k) => (
                <div key={k} className="bg-muted rounded-lg px-3 py-2 font-mono text-muted-foreground">{k}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Subscription Plans
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id} className={`rounded-xl border p-4 ${plan.highlighted ? "border-[#C9A84C]/50 bg-[#C9A84C]/5" : "border-border"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground capitalize">{plan.name}</span>
                {plan.highlighted && <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded-full">Popular</span>}
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">{formatCurrency(plan.priceEGP)}</div>
              <div className="text-xs text-muted-foreground mb-3">per month</div>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-accent" /> Transactions
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
              className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none"
            >
              <option value="all">All</option>
              {(["pending", "completed", "failed", "refunded", "cancelled"] as PaymentStatus[]).map((s) => (
                <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Transactions will appear here once Paymob is configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Invoice", "Customer", "Description", "Amount", "Method", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const StatusIcon = STATUS_ICONS[p.status];
                  return (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{p.invoiceNumber ?? p.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">{p.customerName}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs max-w-[200px] truncate">{p.description}</td>
                      <td className="py-3 pr-4 font-semibold text-foreground">{formatCurrency(p.amount, p.currency)}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {PAYMENT_STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {p.createdAt ? new Date((p.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("en-GB") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
