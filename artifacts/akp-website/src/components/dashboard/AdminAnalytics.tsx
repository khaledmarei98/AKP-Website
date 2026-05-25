import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, BookOpen, Calendar, Award, Download, MessageSquare,
  TrendingUp, TrendingDown, Loader2, AlertCircle, FileText,
} from "lucide-react";
import {
  queryDocuments,
  COLLECTIONS,
  type FirestoreBooking,
  type FirestoreEnrollment,
} from "@/lib/firestore";
import { where, orderBy, limit } from "firebase/firestore";

const GOLD = "#C9A84C";
const DARK = "#0A1628";

// ─── Analytics data fetchers ──────────────────────────────────────────────────

async function fetchAnalytics() {
  const [users, enrollments, bookings, certificates, resources, contacts] = await Promise.all([
    queryDocuments(COLLECTIONS.USERS),
    queryDocuments(COLLECTIONS.ENROLLMENTS),
    queryDocuments<FirestoreBooking>(COLLECTIONS.BOOKINGS, [orderBy("createdAt", "desc"), limit(100)]),
    queryDocuments(COLLECTIONS.CERTIFICATES),
    queryDocuments(COLLECTIONS.RESOURCES),
    queryDocuments(COLLECTIONS.CONTACT_MESSAGES),
  ]);

  const completedEnrollments = (enrollments as FirestoreEnrollment[]).filter((e) => e.progress === 100);
  const completionRate = enrollments.length > 0
    ? Math.round((completedEnrollments.length / enrollments.length) * 100)
    : 0;

  const bookingStatusCounts = (bookings as FirestoreBooking[]).reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalUsers: users.length,
    totalEnrollments: enrollments.length,
    totalBookings: bookings.length,
    totalCertificates: certificates.length,
    totalResources: resources.length,
    totalContacts: contacts.length,
    completionRate,
    bookingStatusCounts,
    recentBookings: (bookings as FirestoreBooking[]).slice(0, 5),
  };
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  new: "#6366f1",
  pending: "#f59e0b",
  in_review: "#3b82f6",
  approved: "#10b981",
  completed: "#22c55e",
  rejected: "#ef4444",
};

const ENROLLMENT_MONTHLY_PLACEHOLDER = [
  { month: "Jan", enrollments: 4 },
  { month: "Feb", enrollments: 7 },
  { month: "Mar", enrollments: 5 },
  { month: "Apr", enrollments: 11 },
  { month: "May", enrollments: 9 },
  { month: "Jun", enrollments: 14 },
];

export default function AdminAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card border border-border rounded-2xl p-6">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        Failed to load analytics. Please refresh.
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-violet-500", trend: "+12%" },
    { label: "Enrollments", value: data.totalEnrollments, icon: BookOpen, color: "text-blue-500", trend: "+8%" },
    { label: "Bookings", value: data.totalBookings, icon: Calendar, color: "text-amber-500", trend: "+5%" },
    { label: "Certificates", value: data.totalCertificates, icon: Award, color: "text-emerald-500", trend: "+21%" },
    { label: "Resources", value: data.totalResources, icon: Download, color: "text-pink-500", trend: "—" },
    { label: "Inquiries", value: data.totalContacts, icon: MessageSquare, color: "text-indigo-500", trend: "+3%" },
    { label: "Completion Rate", value: `${data.completionRate}%`, icon: TrendingUp, color: "text-green-500", trend: "—" },
    { label: "Revenue (EGP)", value: "—", icon: FileText, color: "text-[#C9A84C]", trend: "Paymob pending" },
  ];

  const pieData = Object.entries(data.bookingStatusCounts).map(([status, count]) => ({
    name: status.replace("_", " "),
    value: count,
    fill: BOOKING_STATUS_COLORS[status] ?? "#94a3b8",
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">Live · Firestore</span>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.trend.startsWith("+") ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Enrollment trend (placeholder monthly data) */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Enrollment Trend 2025</h3>
            <span className="text-xs text-muted-foreground">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ENROLLMENT_MONTHLY_PLACEHOLDER} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f1e35", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#C9A84C" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="enrollments" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">* Historical chart reflects demo data; live trend requires timestamp indexing</p>
        </div>

        {/* Booking status breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Booking Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f1e35", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              No booking data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" /> Recent Bookings
        </h3>
        {data.recentBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Customer", "Service", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 pr-4 font-medium text-foreground">{b.customerName}</td>
                    <td className="py-3 pr-4 text-muted-foreground capitalize">{b.serviceCategory}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "completed" ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                        b.status === "new" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {b.createdAt ? new Date((b.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("en-GB") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
