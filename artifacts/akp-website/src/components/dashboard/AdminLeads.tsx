import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, Filter, Phone, Mail, Building2, Calendar,
  ChevronRight, Edit2, Trash2, Loader2, AlertCircle, Tag, TrendingUp,
  X, Check,
} from "lucide-react";
import {
  queryDocuments, createDocument, updateDocument, deleteDocument, COLLECTIONS,
} from "@/lib/firestore";
import { orderBy } from "firebase/firestore";
import { toast } from "sonner";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type LeadSource = "website" | "referral" | "social" | "direct" | "booking" | "contact_form";
export type LeadPriority = "low" | "medium" | "high";

export interface FirestoreLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  service?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: string;
  notes?: string;
  estimatedValue?: number;
  followUpDate?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new:       { label: "New",       color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  contacted: { label: "Contacted", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  qualified: { label: "Qualified", color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20" },
  proposal:  { label: "Proposal",  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  won:       { label: "Won",       color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20" },
  lost:      { label: "Lost",      color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20" },
};

const PIPELINE: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const SOURCES: LeadSource[] = ["website", "referral", "social", "direct", "booking", "contact_form"];
const PRIORITIES: LeadPriority[] = ["low", "medium", "high"];

const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low: "text-gray-500",
  medium: "text-amber-500",
  high: "text-red-500",
};

const emptyLead: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", company: "", source: "website",
  status: "new", priority: "medium", service: "", notes: "", estimatedValue: undefined, assignedTo: "",
};

async function fetchLeads(): Promise<FirestoreLead[]> {
  return queryDocuments<FirestoreLead>(COLLECTIONS.LEADS, [orderBy("createdAt", "desc")]);
}

export default function AdminLeads() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyLead });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: fetchLeads,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">) => {
      if (editId) {
        await updateDocument(COLLECTIONS.LEADS, editId, data);
      } else {
        await createDocument(COLLECTIONS.LEADS, data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      setShowForm(false);
      setEditId(null);
      setForm({ ...emptyLead });
      toast.success(editId ? "Lead updated" : "Lead added");
    },
    onError: () => toast.error("Failed to save lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(COLLECTIONS.LEADS, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Lead removed");
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateDocument(COLLECTIONS.LEADS, id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
    onError: () => toast.error("Failed to update status"),
  });

  const openEdit = (lead: FirestoreLead) => {
    setForm({
      name: lead.name, email: lead.email, phone: lead.phone ?? "",
      company: lead.company ?? "", source: lead.source, status: lead.status,
      priority: lead.priority, service: lead.service ?? "", notes: lead.notes ?? "",
      estimatedValue: lead.estimatedValue, assignedTo: lead.assignedTo ?? "",
    });
    setEditId(lead.id);
    setShowForm(true);
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pipelineCounts = PIPELINE.reduce<Record<LeadStatus, number>>(
    (acc, s) => { acc[s] = leads.filter((l) => l.status === s).length; return acc; },
    {} as Record<LeadStatus, number>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">CRM — Leads</h1>
        <button
          onClick={() => { setForm({ ...emptyLead }); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {PIPELINE.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-xl border p-3 text-center transition-all ${statusFilter === s ? `${cfg.bg} border-current` : "bg-card border-border"}`}
            >
              <div className={`text-xl font-bold ${cfg.color}`}>{pipelineCounts[s] ?? 0}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Leads list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No leads found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const cfg = STATUS_CONFIG[lead.status];
            return (
              <motion.div
                key={lead.id}
                layout
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 font-bold text-sm text-foreground">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{lead.name}</span>
                    {lead.company && <span className="text-xs text-muted-foreground">{lead.company}</span>}
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${PRIORITY_COLORS[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                    {lead.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                    {lead.service && <span className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" />{lead.service}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus.mutate({ id: lead.id, status: e.target.value as LeadStatus })}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-semibold focus:outline-none cursor-pointer ${cfg.bg} ${cfg.color}`}
                  >
                    {PIPELINE.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                  <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Remove this lead?")) deleteMutation.mutate(lead.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-foreground">{editId ? "Edit Lead" : "Add Lead"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
                className="space-y-3"
              >
                {[
                  { key: "name", label: "Full Name", type: "text", required: true },
                  { key: "email", label: "Email", type: "email", required: true },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "company", label: "Company", type: "text" },
                  { key: "service", label: "Service Interest", type: "text" },
                  { key: "estimatedValue", label: "Est. Value (EGP)", type: "number" },
                  { key: "assignedTo", label: "Assigned To", type: "text" },
                  { key: "followUpDate", label: "Follow-up Date", type: "date" },
                ].map(({ key, label, type, required }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted-foreground mb-1">{label}{required && " *"}</label>
                    <input
                      type={type}
                      value={(form as Record<string, unknown>)[key] as string ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                      required={required}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "status", label: "Status", options: PIPELINE.map((s) => ({ v: s, l: STATUS_CONFIG[s].label })) },
                    { key: "priority", label: "Priority", options: PRIORITIES.map((p) => ({ v: p, l: p.charAt(0).toUpperCase() + p.slice(1) })) },
                    { key: "source", label: "Source", options: SOURCES.map((s) => ({ v: s, l: s.replace("_", " ") })) },
                  ].map(({ key, label, options }) => (
                    <div key={key}>
                      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                      <select
                        value={(form as Record<string, unknown>)[key] as string}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                      >
                        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editId ? "Save Changes" : "Add Lead"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
