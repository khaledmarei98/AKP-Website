import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle, ExternalLink,
  Phone, Mail, Video, Paperclip, User, Building2, Calendar, Clock, Filter,
} from "lucide-react";
import { useAllBookings } from "@/hooks/useBookings";
import {
  updateBookingStatus,
  assignBooking,
  SERVICE_LABELS,
  REQUEST_TYPE_LABELS,
  type FirestoreBooking,
  type BookingStatus,
  type ServiceCategory,
} from "@/lib/firestore";

// ─── Config ────────────────────────────────────────────────────────────────────

const ALL_STATUSES: BookingStatus[] = ["new", "pending", "in_review", "approved", "completed", "rejected"];

const STATUS_META: Record<BookingStatus, { label: string; color: string; dot: string }> = {
  new:        { label: "New",        color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",       dot: "bg-blue-500" },
  pending:    { label: "Pending",    color: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",   dot: "bg-amber-500" },
  in_review:  { label: "In Review",  color: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400", dot: "bg-orange-500" },
  approved:   { label: "Approved",   color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
  completed:  { label: "Completed",  color: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",  dot: "bg-green-500" },
  rejected:   { label: "Rejected",   color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",          dot: "bg-red-500" },
};

const CONTACT_ICONS: Record<string, typeof Phone> = { phone: Phone, email: Mail, video: Video };

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

function shortRef(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

// ─── Booking Row ───────────────────────────────────────────────────────────────

function BookingRow({ booking, onUpdate }: { booking: FirestoreBooking; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingStatus>(booking.status);
  const [assignedTo, setAssignedTo] = useState(booking.assignedTo ?? "");
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ContactIcon = CONTACT_ICONS[booking.contactPreference] ?? Mail;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (newStatus !== booking.status || adminNotes !== booking.adminNotes) {
        await updateBookingStatus(booking.id, newStatus, adminNotes);
      }
      if (assignedTo !== booking.assignedTo) {
        await assignBooking(booking.id, assignedTo);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const meta = STATUS_META[booking.status];

  return (
    <div className="border-b border-border last:border-0">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-muted/10 transition-colors text-left"
      >
        <div className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
        <div className="min-w-0">
          <div className="font-medium text-foreground text-sm truncate">{booking.customerName}</div>
          <div className="text-muted-foreground text-xs">
            {shortRef(booking.id)} · {booking.company ?? booking.email}
          </div>
        </div>
        <span className="text-xs text-muted-foreground hidden md:block">{SERVICE_LABELS[booking.serviceCategory as ServiceCategory] ?? booking.serviceCategory}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
        <span className="text-xs text-muted-foreground hidden lg:block">{formatDate(booking.createdAt)}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-6 pb-6 bg-muted/5 border-t border-border">
          <div className="grid lg:grid-cols-3 gap-6 pt-5">
            {/* Left: Request info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-foreground">{booking.customerName}</span>
                  </div>
                  {booking.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-foreground">{booking.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                    <a href={`mailto:${booking.email}`} className="text-accent hover:underline">{booking.email}</a>
                  </div>
                  {booking.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                      <a href={`tel:${booking.phone}`} className="text-foreground hover:text-accent">{booking.phone}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <ContactIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-foreground capitalize">Prefers {booking.contactPreference}</span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request</h4>
                  <div className="text-sm text-foreground font-medium">{SERVICE_LABELS[booking.serviceCategory as ServiceCategory]}</div>
                  <div className="text-sm text-muted-foreground">{REQUEST_TYPE_LABELS[booking.requestType]}</div>
                  {booking.preferredDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {booking.preferredDate} · <Clock className="w-3 h-3" /> {booking.preferredTime}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</div>
                </div>
              </div>

              {/* Request details */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Request Details</h4>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{booking.requestDetails}</p>
              </div>

              {/* Attachments */}
              {booking.attachments.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" /> Attachments ({booking.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {booking.attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground truncate">{att.name}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-muted-foreground text-xs">{att.size}</span>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-accent"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Admin actions */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin Actions</h4>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Assigned To</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Advisor name or email"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Internal Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : saved ? (
                    <><CheckCircle className="w-4 h-4" /> Saved</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              {/* Notification placeholder */}
              <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 text-xs text-muted-foreground text-center">
                Email notifications will be configured here in a future update.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Bookings CMS ────────────────────────────────────────────────────────

export default function AdminBookings() {
  const { bookings, loading, error, refetch } = useAllBookings();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchService = serviceFilter === "all" || b.serviceCategory === serviceFilter;
    return matchStatus && matchService;
  });

  const stats: { label: string; value: number; color: string }[] = [
    { label: "Total", value: bookings.length, color: "text-foreground" },
    { label: "New", value: bookings.filter((b) => b.status === "new").length, color: "text-blue-500" },
    { label: "In Review", value: bookings.filter((b) => b.status === "in_review").length, color: "text-orange-500" },
    { label: "Approved", value: bookings.filter((b) => b.status === "approved").length, color: "text-emerald-500" },
    { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-green-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bookings & Requests</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-card border border-border rounded-2xl">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
            className="bg-muted border border-border rounded-xl px-3 py-1.5 text-foreground text-xs focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Service:</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceCategory | "all")}
            className="bg-muted border border-border rounded-xl px-3 py-1.5 text-foreground text-xs focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">All Services</option>
            {(Object.entries(SERVICE_LABELS) as [ServiceCategory, string][]).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="font-medium text-foreground">No bookings found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length === 0 ? "New service requests will appear here." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span />
            <span>Customer</span>
            <span>Service</span>
            <span>Status</span>
            <span>Submitted</span>
            <span />
          </div>
          {filtered.map((booking) => (
            <BookingRow key={booking.id} booking={booking} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
