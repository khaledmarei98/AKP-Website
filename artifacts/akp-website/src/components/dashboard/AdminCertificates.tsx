import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, Loader2, ShieldX, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCertificates, revokeCertificate, downloadCertificateBlob, type FirestoreCertificate } from "@/lib/certificates";

export default function AdminCertificates() {
  const queryClient = useQueryClient();
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const { data: certs = [], isLoading } = useQuery<FirestoreCertificate[]>({
    queryKey: ["allCertificates"],
    queryFn: getAllCertificates,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCertificates"] });
      setRevokeConfirm(null);
    },
  });

  const valid = certs.filter((c) => !c.revoked).length;
  const revokedCount = certs.filter((c) => c.revoked).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Certificates Admin</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          View, verify, and manage all issued certificates
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Issued", value: certs.length, color: "text-foreground" },
          { label: "Valid", value: valid, color: "text-emerald-500" },
          { label: "Revoked", value: revokedCount, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading certificates…
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No certificates issued yet</h3>
          <p className="text-sm text-muted-foreground">
            Certificates appear here when students complete 100% of a course.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-opacity ${
                cert.revoked ? "border-red-200 dark:border-red-900/30 opacity-55" : "border-border"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  cert.revoked ? "bg-red-100 dark:bg-red-900/20" : "gold-gradient"
                }`}
              >
                <Award className={`w-5 h-5 ${cert.revoked ? "text-red-400" : "text-[#0A1628]"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">{cert.studentName}</span>
                  {cert.revoked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{cert.courseTitle}</div>
                <div className="font-mono text-[10px] text-muted-foreground/50">{cert.id}</div>
              </div>

              <div className="text-xs text-muted-foreground text-right shrink-0 hidden sm:block">
                <div className="font-medium">{cert.issueDate}</div>
                <div className="text-[11px] text-muted-foreground/70">{cert.instructorName}</div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => downloadCertificateBlob(cert)}
                  className="p-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors text-muted-foreground"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {!cert.revoked ? (
                  revokeConfirm === cert.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => revokeMutation.mutate(cert.id)}
                        disabled={revokeMutation.isPending}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokeConfirm(null)}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-accent transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeConfirm(cert.id)}
                      className="p-2 rounded-lg border border-border hover:border-red-400 hover:text-red-400 transition-colors text-muted-foreground"
                      title="Revoke Certificate"
                    >
                      <ShieldX className="w-3.5 h-3.5" />
                    </button>
                  )
                ) : (
                  <div className="p-2 text-muted-foreground/30" title="Revoked">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
