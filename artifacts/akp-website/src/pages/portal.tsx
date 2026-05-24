import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import {
  LayoutDashboard, FileText, BarChart3, Receipt, Bell, Upload,
  Download, CheckCircle, Clock, AlertCircle, TrendingUp, Users,
  FolderOpen, ChevronRight, X
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: FolderOpen, label: "Documents", id: "documents" },
  { icon: BarChart3, label: "Reports", id: "reports" },
  { icon: Receipt, label: "Invoices", id: "invoices" },
  { icon: FileText, label: "Requests", id: "requests" },
  { icon: Bell, label: "Notifications", id: "notifications" },
];

const documents = [
  { id: 1, name: "Q1 2025 Financial Statements.pdf", type: "PDF", size: "2.4 MB", date: "Apr 15, 2025", status: "Reviewed" },
  { id: 2, name: "March Payroll Report.xlsx", type: "Excel", size: "1.1 MB", date: "Apr 1, 2025", status: "Pending Review" },
  { id: 3, name: "VAT Return Q1 2025.pdf", type: "PDF", size: "0.8 MB", date: "Mar 28, 2025", status: "Approved" },
  { id: 4, name: "Employee Contracts Bundle.pdf", type: "PDF", size: "5.2 MB", date: "Mar 20, 2025", status: "Archived" },
];

const notifications = [
  { id: 1, type: "success", message: "Your Q1 2025 Financial Report is ready for download.", time: "2 hours ago" },
  { id: 2, type: "info", message: "Request #204 has been updated. Review the latest comments.", time: "Yesterday" },
  { id: 3, type: "warning", message: "VAT filing deadline is approaching: 25 May 2025.", time: "2 days ago" },
];

const statusColors: Record<string, string> = {
  "Reviewed": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Pending Review": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Approved": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Archived": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const notifIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  info: Bell,
  warning: AlertCircle,
};

const notifColors: Record<string, string> = {
  success: "text-emerald-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};

// Simple bar chart component
function MiniBarChart() {
  const bars = [65, 80, 55, 90, 72, 85, 60, 95, 78, 88, 70, 100];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
          {i % 3 === 0 && <span className="text-[9px] text-muted-foreground">{months[i]}</span>}
        </div>
      ))}
    </div>
  );
}

export default function Portal() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visibleNotifs = notifications.filter((n) => !dismissed.includes(n.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-16 lg:pt-20">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          {/* Portal header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                <span className="text-[#0A1628] font-bold text-sm">AK</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Ahmed Karim</div>
                <div className="text-xs text-sidebar-foreground/60">Delta Industries</div>
              </div>
            </div>
            <div className="mt-3 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium w-fit">
              Active Account
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                data-testid={`button-portal-nav-${item.id}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.id === "notifications" && visibleNotifs.length > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {visibleNotifs.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/40">Account Manager</div>
            <div className="text-sm font-medium text-sidebar-foreground/80 mt-0.5">Dr. Ahmed Kamal</div>
            <div className="text-xs text-sidebar-foreground/40">ahmed@akp-consulting.com</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-accent text-[#0A1628]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {activeSection === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

              {/* Widgets */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Documents Uploaded", value: "12", icon: FolderOpen, change: "+2 this month" },
                  { label: "Pending Requests", value: "3", icon: Clock, change: "2 need action" },
                  { label: "Last Report", value: "Apr 15", icon: BarChart3, change: "Q1 2025" },
                  { label: "Team Members", value: "8", icon: Users, change: "Active users" },
                ].map((widget, i) => (
                  <motion.div
                    key={widget.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-2xl p-5"
                    data-testid={`widget-${i}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                        <widget.icon className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-0.5">{widget.value}</div>
                    <div className="text-sm text-foreground font-medium">{widget.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{widget.change}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">Financial Overview 2024</h3>
                    <span className="text-xs text-muted-foreground">Monthly revenue (EGP '000)</span>
                  </div>
                  <MiniBarChart />
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: "Report uploaded", detail: "Q1 2025 Financial Statements", time: "2h ago", color: "bg-blue-500" },
                      { action: "Request resolved", detail: "Tax advice on new contract", time: "Yesterday", color: "bg-green-500" },
                      { action: "Invoice issued", detail: "AKP Advisory - April 2025", time: "2 days ago", color: "bg-amber-500" },
                      { action: "Document reviewed", detail: "Payroll March 2025", time: "3 days ago", color: "bg-purple-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{item.action}</span>
                          <span className="text-muted-foreground"> — {item.detail}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications preview */}
              {visibleNotifs.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{visibleNotifs.length}</span>
                  </div>
                  <div className="space-y-3">
                    {visibleNotifs.map((n) => {
                      const Icon = notifIcons[n.type];
                      return (
                        <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                          <Icon className={`w-4 h-4 ${notifColors[n.type]} mt-0.5 shrink-0`} />
                          <div className="flex-1 text-sm">
                            <p className="text-foreground">{n.message}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{n.time}</p>
                          </div>
                          <button onClick={() => setDismissed([...dismissed, n.id])} className="text-muted-foreground hover:text-foreground" data-testid={`button-dismiss-notif-${n.id}`}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === "documents" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Documents</h1>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm" data-testid="button-upload-document">
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Type</span>
                  <span>Name</span>
                  <span>Size</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/20 transition-colors"
                    data-testid={`row-document-${doc.id}`}
                  >
                    <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${doc.type === "PDF" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"}`}>
                      {doc.type}
                    </div>
                    <div className="text-sm text-foreground font-medium truncate">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.size}</div>
                    <div className="text-xs text-muted-foreground">{doc.date}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>{doc.status}</span>
                      <button className="p-1.5 rounded-lg hover:bg-accent/10 hover:text-accent transition-all" data-testid={`button-doc-download-${doc.id}`}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeSection === "reports" || activeSection === "invoices" || activeSection === "requests") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-foreground mb-6 capitalize">{activeSection}</h1>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  {activeSection === "reports" && <BarChart3 className="w-7 h-7 text-muted-foreground" />}
                  {activeSection === "invoices" && <Receipt className="w-7 h-7 text-muted-foreground" />}
                  {activeSection === "requests" && <FileText className="w-7 h-7 text-muted-foreground" />}
                </div>
                <h3 className="font-semibold text-foreground mb-2">No {activeSection} yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Your {activeSection} will appear here once your AKP advisor generates them.</p>
                <button className="px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm inline-flex items-center gap-2" data-testid={`button-${activeSection}-request`}>
                  Request {activeSection === "reports" ? "a Report" : activeSection === "invoices" ? "Invoice" : "Support"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-bold text-foreground mb-6">Notifications</h1>
              <div className="space-y-3">
                {notifications.map((n) => {
                  const Icon = notifIcons[n.type];
                  const isDismissed = dismissed.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-4 p-5 rounded-2xl bg-card border transition-all ${isDismissed ? "opacity-40 border-border" : "border-border hover:border-accent/30"}`}
                      data-testid={`card-notification-${n.id}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20" : n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                        <Icon className={`w-4 h-4 ${notifColors[n.type]}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm">{n.message}</p>
                        <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
                      </div>
                      {!isDismissed && (
                        <button onClick={() => setDismissed([...dismissed, n.id])} className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-dismiss-${n.id}`}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
