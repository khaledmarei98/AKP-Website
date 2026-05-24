import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Award, CheckCircle, XCircle, Loader2, Download, ExternalLink, AlertCircle } from "lucide-react";
import { getCertificateById, downloadCertificateBlob, type FirestoreCertificate } from "@/lib/certificates";
import { isConfigured } from "@/lib/firebase";

type VerifyStatus = "loading" | "valid" | "revoked" | "not_found" | "error";

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [cert, setCert] = useState<FirestoreCertificate | null>(null);
  const [status, setStatus] = useState<VerifyStatus>("loading");

  useEffect(() => {
    if (!certificateId) { setStatus("not_found"); return; }
    if (!isConfigured) { setStatus("error"); return; }

    getCertificateById(certificateId)
      .then((c) => {
        if (!c) { setStatus("not_found"); return; }
        setCert(c);
        setStatus(c.revoked ? "revoked" : "valid");
      })
      .catch(() => setStatus("error"));
  }, [certificateId]);

  const statusConfig = {
    valid: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      bg: "bg-emerald-900/20 border-emerald-700/30",
      label: "Certificate Verified — Authentic & Valid",
      sub: "This certificate was issued by AKP Consulting Egypt and is genuine.",
      color: "text-emerald-400",
    },
    revoked: {
      icon: <XCircle className="w-6 h-6 text-red-400" />,
      bg: "bg-red-900/20 border-red-700/30",
      label: "Certificate Revoked",
      sub: "This certificate has been revoked by the issuing institution.",
      color: "text-red-400",
    },
  };

  return (
    <div className="min-h-screen bg-[#060E1E] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#C9A84C]/20 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
            <span className="text-[#0A1628] font-black text-xs leading-none">AKP</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">AKP Consulting</div>
            <div className="text-[#C9A84C] text-[10px] uppercase tracking-widest">Egypt</div>
          </div>
        </Link>
        <div className="text-xs text-white/30 hidden sm:block">Certificate Verification Portal</div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Loading */}
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C] mx-auto mb-4" />
              <p className="text-white/50">Verifying certificate…</p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-900/20 flex items-center justify-center border border-yellow-700/30">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verification Unavailable</h1>
              <p className="text-white/50 text-sm">Unable to connect to the verification service. Please try again later.</p>
              <Link href="/" className="mt-6 inline-block text-[#C9A84C] hover:underline text-sm">
                ← Return to AKP Consulting
              </Link>
            </div>
          )}

          {/* Not found */}
          {status === "not_found" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Award className="w-8 h-8 text-white/30" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Certificate Not Found</h1>
              <p className="text-white/50 text-sm mb-2">
                No certificate found with the identifier:
              </p>
              <p className="font-mono text-xs text-white/60 bg-white/5 px-3 py-2 rounded-lg inline-block mb-6">
                {certificateId ?? "—"}
              </p>
              <br />
              <Link href="/" className="text-[#C9A84C] hover:underline text-sm">
                ← Return to AKP Consulting
              </Link>
            </div>
          )}

          {/* Valid / Revoked */}
          {(status === "valid" || status === "revoked") && cert && (
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(160deg, #0D1F3C 0%, #0A1628 100%)", border: "1px solid rgba(201,168,76,0.3)" }}
            >
              {/* Status banner */}
              <div className={`px-6 py-4 flex items-center gap-3 border-b ${statusConfig[status].bg}`}>
                {statusConfig[status].icon}
                <div>
                  <div className={`font-bold text-sm ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </div>
                  <div className="text-xs text-white/45 mt-0.5">{statusConfig[status].sub}</div>
                </div>
              </div>

              {/* Certificate details */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shrink-0">
                    <Award className="w-7 h-7 text-[#0A1628]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#C9A84C] uppercase tracking-[0.15em] font-bold mb-0.5">
                      Certificate of Completion
                    </div>
                    <div className="text-white font-bold text-lg leading-tight">{cert.courseTitle}</div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {[
                    { label: "Student Name", value: cert.studentName },
                    { label: "Instructor", value: cert.instructorName },
                    { label: "Date Issued", value: cert.issueDate },
                    { label: "Certificate ID", value: cert.id, mono: true },
                    { label: "Issued By", value: "AKP Consulting Egypt" },
                  ].map(({ label, value, mono }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-xs text-white/45">{label}</span>
                      <span
                        className={`text-sm font-medium text-white text-right max-w-[60%] truncate ${mono ? "font-mono text-xs text-white/70" : ""}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {status === "valid" && (
                  <button
                    onClick={() => downloadCertificateBlob(cert)}
                    className="mt-6 w-full py-3 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" /> Download Certificate PDF
                  </button>
                )}

                <div className="mt-5 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-[#C9A84C] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> akpconsulting.com
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
