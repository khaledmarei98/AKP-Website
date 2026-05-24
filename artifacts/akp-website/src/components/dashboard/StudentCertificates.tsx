import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getUserCertificates, downloadCertificateBlob, type FirestoreCertificate } from "@/lib/certificates";

export default function StudentCertificates() {
  const { user } = useAuth();

  const { data: certs = [], isLoading } = useQuery<FirestoreCertificate[]>({
    queryKey: ["certificates", user?.id],
    queryFn: () => getUserCertificates(user!.id),
    enabled: !!user?.id,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">My Certificates</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Certificates are issued automatically when you complete 100% of a course.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading certificates…
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-14 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient/10 bg-accent/10 flex items-center justify-center">
            <Award className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No certificates yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Complete 100% of any enrolled course to automatically earn a certificate.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Browse Courses →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="h-1 gold-gradient" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-[#0A1628]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.12em] mb-0.5">
                      Certificate of Completion
                    </div>
                    <div className="font-semibold text-foreground text-sm leading-tight truncate">
                      {cert.courseTitle}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {cert.instructorName}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground">{cert.issueDate}</div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate">{cert.id}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/verify/${cert.id}`}
                      className="p-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors text-muted-foreground"
                      title="Verify Certificate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => downloadCertificateBlob(cert)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg gold-gradient text-[#0A1628] font-semibold text-xs hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
