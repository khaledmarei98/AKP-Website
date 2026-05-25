import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getUserCertificates, downloadCertificateBlob, type FirestoreCertificate } from "@/lib/certificates";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

function parseIssueDate(issueDate: string): { month: number; year: number } {
  const parts = issueDate.split(" ");
  const month = MONTH_MAP[parts[1]] ?? new Date().getMonth() + 1;
  const year = parseInt(parts[2]) || new Date().getFullYear();
  return { month, year };
}

function getLinkedInShareUrl(cert: FirestoreCertificate): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://akpconsulting.com";
  const verifyUrl = `${origin}/verify/${cert.id}`;
  const title = `Certificate of Completion – ${cert.courseTitle}`;
  const summary = `I'm proud to share that I've completed "${cert.courseTitle}" and earned a Certificate of Completion from AKP Consulting Egypt! Instructed by ${cert.instructorName}. #ProfessionalDevelopment #Finance #Consulting`;
  return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(verifyUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=AKP+Consulting`;
}

function getLinkedInAddToProfileUrl(cert: FirestoreCertificate): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://akpconsulting.com";
  const verifyUrl = `${origin}/verify/${cert.id}`;
  const { month, year } = parseIssueDate(cert.issueDate);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: cert.courseTitle,
    issueYear: String(year),
    issueMonth: String(month),
    certUrl: verifyUrl,
    certId: cert.id,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

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

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
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
                  <div className="flex gap-2">
                    <a
                      href={getLinkedInAddToProfileUrl(cert)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-colors"
                      style={{ background: "#0A66C2" }}
                      title="Add to LinkedIn Certifications section"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" /> Add to Profile
                    </a>
                    <a
                      href={getLinkedInShareUrl(cert)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-[#0A66C2] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0A66C2]/10 transition-colors"
                      style={{ border: "1px solid #0A66C2" }}
                      title="Share a LinkedIn post"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" /> Share Post
                    </a>
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
