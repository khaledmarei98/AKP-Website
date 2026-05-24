import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, FolderOpen, Receipt, Bell, HeadphonesIcon,
  Settings, ChevronRight, X, Upload, Download, TrendingUp, Users, Clock,
  BarChart3, CheckCircle, AlertCircle, FileText, Plus, ArrowUpRight,
  LogOut, Shield, Play, Star, Library, Newspaper, ClipboardList, Mail, MessageSquare, Eye, Phone, PhoneCall, Award, Loader2
} from "lucide-react";
import { toast } from "sonner";
import AdminLibrary from "@/components/dashboard/AdminLibrary";
import AdminArticles from "@/components/dashboard/AdminArticles";
import AdminBookings from "@/components/dashboard/AdminBookings";
import AdminCourses from "@/components/dashboard/AdminCourses";
import StudentCertificates from "@/components/dashboard/StudentCertificates";
import AdminCertificates from "@/components/dashboard/AdminCertificates";
import { useUserBookings } from "@/hooks/useBookings";
import { useUserEnrollments } from "@/hooks/useCourses";
import { SERVICE_LABELS, getAllContactMessages, updateContactMessageStatus, type FirestoreContactMessage, type ContactMessageStatus } from "@/lib/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
type Section = "overview" | "courses" | "certificates" | "bookings" | "documents" | "invoices" | "notifications" | "support" | "settings" | "library" | "articles" | "bookings_admin" | "courses_admin" | "contacts_admin" | "certificates_admin";

const baseNavItems: { id: Section; icon: typeof LayoutDashboard; label: string; badge?: number }[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "courses", icon: BookOpen, label: "My Courses" },
  { id: "certificates", icon: Award, label: "Certificates" },
  { id: "bookings", icon: Calendar, label: "Bookings" },
  { id: "documents", icon: FolderOpen, label: "Documents", badge: 1 },
  { id: "invoices", icon: Receipt, label: "Invoices" },
  { id: "notifications", icon: Bell, label: "Notifications", badge: 3 },
  { id: "support", icon: HeadphonesIcon, label: "Support" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const adminNavItems: { id: Section; icon: typeof LayoutDashboard; label: string; badge?: number }[] = [
  { id: "library", icon: Library, label: "Library Admin" },
  { id: "articles", icon: Newspaper, label: "Articles CMS" },
  { id: "bookings_admin", icon: ClipboardList, label: "Bookings CMS" },
  { id: "courses_admin", icon: BookOpen, label: "Courses CMS" },
  { id: "contacts_admin", icon: Mail, label: "Contact Messages" },
  { id: "certificates_admin", icon: Award, label: "Certificates Admin" },
];

const documents = [
  { id: 1, name: "Q1 2025 Financial Statements.pdf", type: "PDF", size: "2.4 MB", date: "Apr 15, 2025", status: "Reviewed" },
  { id: 2, name: "March Payroll Report.xlsx", type: "Excel", size: "1.1 MB", date: "Apr 1, 2025", status: "Pending Review" },
  { id: 3, name: "VAT Return Q1 2025.pdf", type: "PDF", size: "0.8 MB", date: "Mar 28, 2025", status: "Approved" },
  { id: 4, name: "Employee Contracts Bundle.pdf", type: "PDF", size: "5.2 MB", date: "Mar 20, 2025", status: "Archived" },
];

const invoices = [
  { id: "INV-2025-042", description: "AKP Advisory Services — April 2025", amount: "EGP 6,500", date: "Apr 1, 2025", due: "Apr 30, 2025", status: "Pending" },
  { id: "INV-2025-038", description: "AKP Advisory Services — March 2025", amount: "EGP 6,500", date: "Mar 1, 2025", due: "Mar 31, 2025", status: "Paid" },
  { id: "INV-2025-031", description: "Payroll Processing Q1 2025", amount: "EGP 2,200", date: "Jan 5, 2025", due: "Jan 31, 2025", status: "Paid" },
  { id: "INV-2025-028", description: "Annual Tax Filing 2024", amount: "EGP 4,800", date: "Dec 10, 2024", due: "Dec 31, 2024", status: "Paid" },
];

const notifications = [
  { id: 1, type: "warning", message: "VAT filing deadline approaching: 25 May 2025. Please review Q1 2025 returns.", time: "2 hours ago", read: false },
  { id: 2, type: "success", message: "Your Q1 2025 Financial Report is ready for download.", time: "Yesterday", read: false },
  { id: 3, type: "info", message: "Request #204 has been updated. Review the latest comments from your advisor.", time: "2 days ago", read: false },
  { id: 4, type: "info", message: "New course available: Advanced Excel for Accountants 2025 Edition.", time: "4 days ago", read: true },
  { id: 5, type: "success", message: "Invoice INV-2025-038 has been marked as paid. Thank you!", time: "1 week ago", read: true },
];

const tickets = [
  { id: "TKT-245", subject: "Question about Q1 VAT calculation method", status: "open", priority: "medium", created: "Apr 20, 2025", messages: 3 },
  { id: "TKT-238", subject: "Request for payroll policy update", status: "resolved", priority: "low", created: "Apr 5, 2025", messages: 7 },
  { id: "TKT-229", subject: "Invoice discrepancy — March 2025", status: "resolved", priority: "high", created: "Mar 15, 2025", messages: 5 },
];

const statusColors: Record<string, string> = {
  Reviewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Pending Review": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Approved: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Paid: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Overdue: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  confirmed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  open: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  new: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  in_review: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const notifIcons: Record<string, typeof CheckCircle> = { success: CheckCircle, info: Bell, warning: AlertCircle, error: AlertCircle };
const notifColors: Record<string, string> = { success: "text-emerald-500", info: "text-blue-500", warning: "text-amber-500", error: "text-red-500" };

function BarChart() {
  const bars = [65, 80, 55, 90, 72, 85, 60, 95, 78, 88, 70, 100];
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  return (
    <div className="flex items-end gap-1.5 h-24 mt-4">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="w-full rounded-t-md gold-gradient opacity-80 hover:opacity-100 transition-opacity"
          />
          <span className="text-[9px] text-muted-foreground">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ContactMessagesAdmin() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery<FirestoreContactMessage[]>({
    queryKey: ["contactMessages"],
    queryFn: getAllContactMessages,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contactMessages"] }),
  });

  const sourceLabel: Record<string, string> = {
    contact_form: "Contact Form",
    chat_escalation: "Chat Escalation",
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    read: "bg-muted text-muted-foreground",
    replied: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
          {newCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-accent text-[#0A1628] text-xs font-bold">{newCount} new</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold text-foreground mb-1">No messages yet</div>
          <p className="text-sm text-muted-foreground">Contact form and chat escalation submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => {
                  setExpanded(expanded === msg.id ? null : msg.id);
                  if (msg.status === "new") mutation.mutate({ id: msg.id, status: "read" });
                }}
              >
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm shrink-0">
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{msg.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[msg.status]}`}>{msg.status}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground flex items-center gap-1">
                      {msg.source === "chat_escalation" ? <MessageSquare className="w-2.5 h-2.5" /> : <Mail className="w-2.5 h-2.5" />}
                      {sourceLabel[msg.source]}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{msg.email}</span>
                    {msg.phone && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        <Phone className="w-2.5 h-2.5" />{msg.phone}
                      </span>
                    )}
                    {msg.service && <span className="text-muted-foreground">{msg.service}</span>}
                  </div>
                  <p className="text-sm text-foreground/70 mt-1 truncate">{msg.message}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded === msg.id ? "rotate-90" : ""}`} />
              </div>

              {expanded === msg.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">Message</div>
                      <p className="text-sm text-foreground bg-muted rounded-xl p-4 leading-relaxed">{msg.message}</p>
                    </div>

                    {msg.chatTranscript && msg.chatTranscript.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Chat Transcript</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto bg-muted rounded-xl p-3">
                          {msg.chatTranscript.map((t, i) => (
                            <div key={i} className={`flex gap-2 text-xs ${t.from === "user" ? "flex-row-reverse" : ""}`}>
                              <span className={`px-3 py-1.5 rounded-xl max-w-[80%] ${t.from === "user" ? "bg-[#0A1628] text-white" : "bg-white dark:bg-[#0A1628]/80 text-foreground border border-border"}`}>
                                {t.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.phone && (
                      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
                        <PhoneCall className="w-3.5 h-3.5 text-accent shrink-0" />
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Phone</div>
                          <div className="text-sm font-semibold text-foreground">{msg.phone}</div>
                        </div>
                        <a
                          href={`tel:${msg.phone}`}
                          className="ml-auto text-xs font-medium text-accent hover:underline"
                        >
                          Call
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {(["new", "read", "replied", "archived"] as ContactMessageStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => mutation.mutate({ id: msg.id, status: s })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${msg.status === s ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:border-accent hover:text-accent"}`}
                        >
                          Mark as {s}
                        </button>
                      ))}
                      <a
                        href={`mailto:${msg.email}`}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium gold-gradient text-[#0A1628] hover:opacity-90 transition-opacity"
                      >
                        <Mail className="w-3 h-3" /> Reply by Email
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { bookings: userBookings, loading: bookingsLoading } = useUserBookings(user?.id ?? "");
  const { enrollments, loading: enrollmentsLoading } = useUserEnrollments(user?.id ?? "");

  const isAdmin = user?.role === "super_admin" || user?.role === "admin_staff";
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const visibleNotifs = notifications.filter((n) => !dismissed.includes(n.id));
  const unreadNotifs = notifications.filter((n) => !n.read && !dismissed.includes(n.id));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SectionTitle = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center px-4 lg:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <span className="text-[#0A1628] font-bold text-sm">AKP</span>
          </div>
          <span className="text-sidebar-foreground font-semibold text-sm hidden sm:block">AKP Consulting</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection("notifications")}
            className="relative p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            data-testid="button-header-notifs"
          >
            <Bell className="w-5 h-5 text-sidebar-foreground/70" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-sidebar-border">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm">
              {user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="hidden sm:block">
              <div className="text-sidebar-foreground font-medium text-sm leading-none">{user?.name ?? "Ahmed Karim"}</div>
              <div className="text-sidebar-foreground/50 text-xs mt-0.5">{user?.company ?? "Client"}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground" title="Sign out" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border fixed top-16 bottom-0 left-0">
          <div className="p-4 border-b border-sidebar-border">
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
              ● Active Account
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                data-testid={`button-nav-${item.id}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-accent text-[#0A1628] text-xs font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="text-xs text-sidebar-foreground/40">Your advisor</div>
            <div className="text-sm font-medium text-sidebar-foreground/80">Dr. Ahmed Kamal</div>
            <div className="text-xs text-sidebar-foreground/40">ahmed@akp-consulting.com</div>
            <Link href="/contact" className="flex items-center gap-1.5 text-xs text-accent hover:underline mt-1">
              <HeadphonesIcon className="w-3 h-3" /> Contact Advisor
            </Link>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative ${
                  activeSection === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label.split(" ")[0]}
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-[#0A1628] text-[8px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 overflow-auto p-5 lg:p-8 pb-24 lg:pb-8">

          {/* OVERVIEW */}
          {activeSection === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle title={`Good morning, ${user?.name?.split(" ")[0] ?? "Ahmed"} 👋`} />

              {/* Widgets */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Documents", value: "12", icon: FolderOpen, change: "+2 this month", color: "text-blue-500" },
                  { label: "Active Courses", value: "2", icon: BookOpen, change: "1 in progress", color: "text-purple-500" },
                  { label: "Upcoming Bookings", value: "1", icon: Calendar, change: "May 22, 2025", color: "text-amber-500" },
                  { label: "Open Invoices", value: "1", icon: Receipt, change: "EGP 6,500 due", color: "text-red-500" },
                ].map((w, i) => (
                  <motion.div
                    key={w.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-card border border-border rounded-2xl p-5"
                    data-testid={`widget-${i}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                        <w.icon className={`w-4.5 h-4.5 ${w.color}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-0.5">{w.value}</div>
                    <div className="text-sm font-medium text-foreground">{w.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{w.change}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts + Activity */}
              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">Financial Overview 2025</h3>
                    <span className="text-xs text-muted-foreground">Monthly (EGP '000)</span>
                  </div>
                  <BarChart />
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: "Report uploaded", detail: "Q1 2025 Financial Statements", time: "2h ago", color: "bg-blue-500" },
                      { action: "Booking confirmed", detail: "Tax Consulting — May 22, 2025", time: "Yesterday", color: "bg-green-500" },
                      { action: "Invoice issued", detail: "AKP Advisory — April 2025", time: "3 days ago", color: "bg-amber-500" },
                      { action: "Document reviewed", detail: "Payroll March 2025", time: "5 days ago", color: "bg-purple-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground">{item.action}</span>
                          <span className="text-muted-foreground"> — {item.detail}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming + Deadlines */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> Upcoming Requests</h3>
                  {bookingsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />)}
                    </div>
                  ) : userBookings.filter(b => b.status !== "completed" && b.status !== "rejected").length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm mb-2">No active requests.</p>
                      <Link href="/booking" className="text-xs text-accent hover:underline">Submit a request</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userBookings.filter(b => b.status !== "completed" && b.status !== "rejected").slice(0, 3).map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-[#0A1628]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm truncate">{SERVICE_LABELS[b.serviceCategory] ?? b.serviceCategory}</div>
                            <div className="text-muted-foreground text-xs">{b.assignedTo ? `Assigned to ${b.assignedTo}` : "Awaiting assignment"}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[b.status] ?? ""}`}>{b.status.replace("_", " ")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setActiveSection("bookings")} className="mt-3 text-xs text-accent hover:underline flex items-center gap-1">
                    View all requests <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> Important Deadlines</h3>
                  <div className="space-y-3">
                    {[
                      { label: "VAT Filing — Q1 2025", date: "May 25, 2025", urgency: "urgent" },
                      { label: "Social Insurance — May", date: "May 31, 2025", urgency: "upcoming" },
                      { label: "Annual Tax Return 2025", date: "Apr 30, 2026", urgency: "normal" },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${d.urgency === "urgent" ? "bg-red-500" : d.urgency === "upcoming" ? "bg-amber-500" : "bg-green-500"}`} />
                          <span className="text-foreground">{d.label}</span>
                        </div>
                        <span className={`text-xs font-medium ${d.urgency === "urgent" ? "text-red-500" : "text-muted-foreground"}`}>{d.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COURSES */}
          {activeSection === "courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle
                title="My Courses"
                action={
                  <Link href="/courses" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm" data-testid="link-browse-courses">
                    <Plus className="w-4 h-4" /> Browse Courses
                  </Link>
                }
              />
              {enrollmentsLoading ? (
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  {[1, 2].map((i) => <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />)}
                </div>
              ) : enrollments.length === 0 ? null : (
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-card border border-border rounded-2xl p-6" data-testid={`card-my-course-${enrollment.id}`}>
                      <div className="h-28 rounded-xl bg-gradient-to-br from-[#0A1628] to-[#0D2044] flex items-center justify-center mb-4 relative overflow-hidden">
                        {enrollment.thumbnailUrl
                          ? <img src={enrollment.thumbnailUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
                          : <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center"><Play className="w-5 h-5 text-[#0A1628] ml-0.5" /></div>
                        }
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                          <div className="h-full gold-gradient" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{enrollment.courseTitle}</h3>
                      <p className="text-muted-foreground text-xs mb-4">by {enrollment.instructor}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{enrollment.completedLessons.length} lessons done</span>
                        <span className="text-accent font-semibold">{enrollment.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                        <div className="h-full gold-gradient rounded-full" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <Link href={`/learn/${enrollment.courseSlug}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent/10 transition-colors" data-testid={`button-continue-course-${enrollment.id}`}>
                        Continue Learning <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Explore More Courses</h3>
                <p className="text-muted-foreground text-sm mb-4">120+ courses in accounting, tax, HR, and finance available.</p>
                <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm">
                  Browse All Courses <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* BOOKINGS */}
          {activeSection === "bookings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle
                title="My Service Requests"
                action={
                  <Link href="/booking" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm" data-testid="link-new-booking">
                    <Plus className="w-4 h-4" /> New Request
                  </Link>
                }
              />
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-card border border-border animate-pulse" />)}
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No service requests yet</h3>
                  <p className="text-muted-foreground text-sm mb-5">Submit a consultation request and an AKP advisor will respond within one business day.</p>
                  <Link href="/booking" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm">
                    Book a Consultation <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span>Service / Request</span><span>Request Type</span><span>Submitted</span><span>Status</span>
                  </div>
                  {userBookings.map((b) => (
                    <div key={b.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10 transition-colors" data-testid={`row-booking-${b.id}`}>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{SERVICE_LABELS[b.serviceCategory] ?? b.serviceCategory}</div>
                        <div className="text-muted-foreground text-xs">#{b.id.slice(0, 8).toUpperCase()} {b.assignedTo ? `· ${b.assignedTo}` : ""}</div>
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block capitalize">{b.requestType.replace(/_/g, " ")}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {(() => {
                          try {
                            const d = (b.createdAt as { toDate?: () => Date }).toDate?.() ?? new Date(b.createdAt as string);
                            return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                          } catch { return "—"; }
                        })()}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[b.status] ?? ""}`}>{b.status.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DOCUMENTS */}
          {activeSection === "documents" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle
                title="Documents"
                action={
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm" data-testid="button-upload-doc">
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {["Tax Documents", "Accounting Files", "HR Files", "Legal Documents"].map((cat) => (
                  <button key={cat} className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent/40 transition-colors">
                    <FolderOpen className="w-6 h-6 text-accent mx-auto mb-1.5" />
                    <div className="text-xs font-medium text-foreground">{cat}</div>
                  </button>
                ))}
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Type</span><span>Name</span><span>Size</span><span>Date</span><span>Status</span>
                </div>
                {documents.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10" data-testid={`row-doc-${doc.id}`}>
                    <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${doc.type === "PDF" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"}`}>
                      {doc.type}
                    </div>
                    <div className="text-sm text-foreground font-medium truncate">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.size}</div>
                    <div className="text-xs text-muted-foreground">{doc.date}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>{doc.status}</span>
                      <button className="p-1.5 rounded-lg hover:bg-accent/10 hover:text-accent transition-all" data-testid={`button-download-doc-${doc.id}`}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* INVOICES */}
          {activeSection === "invoices" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle title="Invoices & Billing" />
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Outstanding Balance", value: "EGP 6,500", color: "text-amber-500" },
                  { label: "Paid This Year", value: "EGP 19,500", color: "text-emerald-500" },
                  { label: "Next Due Date", value: "Apr 30, 2025", color: "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                    <div className="text-muted-foreground text-xs mb-1">{s.label}</div>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Description</span><span>Amount</span><span>Date</span><span>Due</span><span>Status</span>
                </div>
                {invoices.map((inv) => (
                  <div key={inv.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/10" data-testid={`row-invoice-${inv.id}`}>
                    <div>
                      <div className="font-medium text-foreground text-sm">{inv.description}</div>
                      <div className="text-muted-foreground text-xs">{inv.id}</div>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{inv.amount}</div>
                    <div className="text-xs text-muted-foreground">{inv.date}</div>
                    <div className="text-xs text-muted-foreground">{inv.due}</div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle title="Notifications" action={
                <button onClick={() => setDismissed(notifications.map(n => n.id))} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mark all read
                </button>
              } />
              <div className="space-y-3">
                {notifications.map((n) => {
                  const Icon = notifIcons[n.type];
                  const isDismissed = dismissed.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-4 p-5 rounded-2xl bg-card border transition-all ${isDismissed || n.read ? "opacity-50 border-border" : "border-border hover:border-accent/30"}`}
                      data-testid={`card-notif-${n.id}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20" : n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                        <Icon className={`w-4 h-4 ${notifColors[n.type]}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm">{n.message}</p>
                        <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
                      </div>
                      {!isDismissed && (
                        <button onClick={() => setDismissed([...dismissed, n.id])} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" data-testid={`button-dismiss-${n.id}`}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SUPPORT */}
          {activeSection === "support" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SectionTitle title="Support Center" action={
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm" data-testid="button-new-ticket">
                  <Plus className="w-4 h-4" /> New Ticket
                </button>
              } />
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Open Tickets", value: "1", icon: FileText, color: "text-blue-500" },
                  { label: "Resolved", value: "2", icon: CheckCircle, color: "text-emerald-500" },
                  { label: "Avg. Response", value: "< 24h", icon: Clock, color: "text-accent" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-muted-foreground text-xs">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-card border border-border rounded-2xl p-5 hover:border-accent/30 transition-all" data-testid={`card-ticket-${t.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-medium">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.priority === "high" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : t.priority === "medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>{t.priority}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{t.subject}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                          <span>Created {t.created}</span>
                          <span>· {t.messages} messages</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LIBRARY ADMIN */}
          {activeSection === "library" && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AdminLibrary />
            </motion.div>
          )}

          {/* ARTICLES CMS */}
          {activeSection === "articles" && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AdminArticles />
            </motion.div>
          )}

          {/* BOOKINGS CMS (admin) */}
          {activeSection === "bookings_admin" && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AdminBookings />
            </motion.div>
          )}

          {/* COURSES CMS (admin) */}
          {activeSection === "courses_admin" && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <AdminCourses />
            </motion.div>
          )}

          {/* CONTACT MESSAGES (admin) */}
          {activeSection === "contacts_admin" && isAdmin && (
            <ContactMessagesAdmin />
          )}

          {/* CERTIFICATES */}
          {activeSection === "certificates" && (
            <StudentCertificates />
          )}

          {/* CERTIFICATES ADMIN */}
          {activeSection === "certificates_admin" && isAdmin && (
            <AdminCertificates />
          )}

          {/* SETTINGS */}
          {activeSection === "settings" && (
            <SettingsSection />
          )}
        </main>
      </div>
    </div>
  );
}

function SettingsSection() {
  const { user, updateUserProfile, logout } = useAuth();
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? "");
  const [profileCompany, setProfileCompany] = useState(user?.company ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfilePhone(user?.phone ?? "");
    setProfileCompany(user?.company ?? "");
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: profileName.trim() || undefined,
        phone: profilePhone.trim() || undefined,
        company: profileCompany.trim() || undefined,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> Profile Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-sm cursor-not-allowed opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+20 10 1234 5678"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company Name</label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="Your company"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="button-save-profile"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Security</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between py-3 text-sm text-foreground hover:text-accent transition-colors" data-testid="button-change-password">
                <span>Change Password</span><ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between py-3 text-sm text-foreground hover:text-accent transition-colors border-t border-border" data-testid="button-2fa">
                <span>Enable Two-Factor Authentication</span><ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-accent" /> Notifications</h3>
            {[
              { label: "Email notifications", desc: "Receive updates by email" },
              { label: "Booking reminders", desc: "Reminded 24h before appointments" },
              { label: "Deadline alerts", desc: "Tax and compliance reminders" },
              { label: "Invoice notifications", desc: "New invoice alerts" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <button className="w-11 h-6 rounded-full gold-gradient relative transition-all" data-testid={`toggle-${item.label.toLowerCase().replace(" ", "-")}`}>
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-[#0A1628]" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-card border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors" data-testid="button-signout">
              <LogOut className="w-4 h-4" /> Sign Out of Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
