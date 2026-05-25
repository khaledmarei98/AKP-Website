import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, Edit2, Trash2, Loader2, X, Check,
  Shield, Mail, Phone, Building2, ToggleLeft, ToggleRight, Crown,
} from "lucide-react";
import {
  queryDocuments, createDocument, updateDocument, deleteDocument, COLLECTIONS,
} from "@/lib/firestore";
import { orderBy } from "firebase/firestore";
import { toast } from "sonner";

export type TeamRole = "super_admin" | "admin_staff" | "instructor" | "consultant" | "accounting_partner";
export type TeamDepartment = "Management" | "Tax" | "Accounting" | "HR" | "Technology" | "Marketing";

export interface FirestoreTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamRole;
  department: TeamDepartment;
  isActive: boolean;
  joinedDate?: string;
  notes?: string;
  permissions: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

const ROLE_CONFIG: Record<TeamRole, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  super_admin:        { label: "Super Admin",    color: "text-[#C9A84C]",  bg: "bg-[#C9A84C]/10",       icon: Crown },
  admin_staff:        { label: "Admin Staff",    color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Shield },
  instructor:         { label: "Instructor",     color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20", icon: Users },
  consultant:         { label: "Consultant",     color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20", icon: Users },
  accounting_partner: { label: "Acct. Partner",  color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20", icon: Building2 },
};

const DEPARTMENTS: TeamDepartment[] = ["Management", "Tax", "Accounting", "HR", "Technology", "Marketing"];
const ROLES: TeamRole[] = ["super_admin", "admin_staff", "instructor", "consultant", "accounting_partner"];

const DEFAULT_PERMISSIONS_BY_ROLE: Record<TeamRole, string[]> = {
  super_admin: ["all"],
  admin_staff: ["manage_bookings", "manage_articles", "manage_courses", "view_analytics"],
  instructor: ["manage_courses", "view_enrollments"],
  consultant: ["view_bookings", "manage_assigned_clients"],
  accounting_partner: ["view_documents", "manage_assigned_clients"],
};

const PERMISSION_OPTIONS = [
  "manage_bookings", "manage_articles", "manage_courses", "manage_users",
  "view_analytics", "manage_payments", "manage_leads", "manage_certificates",
  "view_enrollments", "view_documents", "manage_assigned_clients",
];

const emptyMember: Omit<FirestoreTeamMember, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", role: "admin_staff",
  department: "Management", isActive: true, joinedDate: "", notes: "", permissions: [],
};

async function fetchTeam(): Promise<FirestoreTeamMember[]> {
  return queryDocuments<FirestoreTeamMember>(COLLECTIONS.TEAM_MEMBERS, [orderBy("createdAt", "desc")]);
}

export default function AdminTeam() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyMember });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: fetchTeam,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<FirestoreTeamMember, "id" | "createdAt" | "updatedAt">) => {
      if (editId) {
        await updateDocument(COLLECTIONS.TEAM_MEMBERS, editId, data);
      } else {
        await createDocument(COLLECTIONS.TEAM_MEMBERS, data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team"] });
      setShowForm(false);
      setEditId(null);
      setForm({ ...emptyMember });
      toast.success(editId ? "Team member updated" : "Team member added");
    },
    onError: () => toast.error("Failed to save team member"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(COLLECTIONS.TEAM_MEMBERS, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Team member removed");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDocument(COLLECTIONS.TEAM_MEMBERS, id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-team"] }),
    onError: () => toast.error("Failed to update"),
  });

  const openEdit = (m: FirestoreTeamMember) => {
    setForm({
      name: m.name, email: m.email, phone: m.phone ?? "",
      role: m.role, department: m.department, isActive: m.isActive,
      joinedDate: m.joinedDate ?? "", notes: m.notes ?? "", permissions: m.permissions,
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const togglePermission = (perm: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const deptCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.department] = (acc[m.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <button
          onClick={() => { setForm({ ...emptyMember }); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Department breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {DEPARTMENTS.map((dept) => (
          <div key={dept} className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-foreground">{deptCounts[dept] ?? 0}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{dept}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search team members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Members list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No team members yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => {
            const cfg = ROLE_CONFIG[member.role];
            const RoleIcon = cfg.icon;
            return (
              <motion.div
                key={member.id}
                layout
                className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-opacity ${!member.isActive ? "opacity-60" : ""} border-border`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 font-bold text-sm text-foreground">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{member.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <RoleIcon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>
                    {member.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive.mutate({ id: member.id, isActive: !member.isActive })}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={member.isActive ? "Deactivate" : "Activate"}
                  >
                    {member.isActive
                      ? <ToggleRight className="w-5 h-5 text-green-500" />
                      : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Remove team member?")) deleteMutation.mutate(member.id); }}
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
                <h3 className="font-semibold text-foreground">{editId ? "Edit Team Member" : "Add Team Member"}</h3>
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
                  { key: "joinedDate", label: "Joined Date", type: "date" },
                ].map(({ key, label, type, required }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted-foreground mb-1">{label}{required && " *"}</label>
                    <input
                      type={type}
                      value={(form as Record<string, unknown>)[key] as string ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Role *</label>
                    <select
                      value={form.role}
                      onChange={(e) => {
                        const role = e.target.value as TeamRole;
                        setForm((f) => ({ ...f, role, permissions: DEFAULT_PERMISSIONS_BY_ROLE[role] }));
                      }}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Department *</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm((f) => ({ ...f, department: e.target.value as TeamDepartment }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PERMISSION_OPTIONS.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => togglePermission(perm)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            form.permissions.includes(perm) || form.permissions.includes("all")
                              ? "bg-accent border-accent"
                              : "border-border"
                          }`}
                        >
                          {(form.permissions.includes(perm) || form.permissions.includes("all")) && (
                            <Check className="w-2.5 h-2.5 text-[#0A1628]" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {perm.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#C9A84C]"
                  />
                  <label htmlFor="isActive" className="text-sm text-foreground">Active account</label>
                </div>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editId ? "Save Changes" : "Add Member"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
