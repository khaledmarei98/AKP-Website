import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar, CheckCircle, ArrowRight, Phone, Mail, Video,
  Calculator, FileText, Users, Building2, BarChart3, Briefcase,
  Upload, X, Loader2, AlertCircle, ClipboardList, Search
} from "lucide-react";
import {
  createBooking,
  SERVICE_LABELS,
  REQUEST_TYPE_LABELS,
  type ServiceCategory,
  type RequestType,
  type ContactPreference,
  type BookingAttachment,
} from "@/lib/firestore";
import { uploadFile, storagePaths, formatFileSize, validateFile, ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES } from "@/lib/storage";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

const services: { id: ServiceCategory; icon: typeof Calculator; title: string; desc: string }[] = [
  { id: "accounting", icon: Calculator, title: "Financial Accounting", desc: "Monthly bookkeeping, financial statements, and compliance reporting." },
  { id: "tax", icon: FileText, title: "Tax Consulting", desc: "Tax strategy, VAT filing, corporate tax, and dispute resolution." },
  { id: "hr", icon: Users, title: "HR Consultation", desc: "HR policy, payroll systems, labor law compliance, and employee relations." },
  { id: "erp", icon: Building2, title: "ERP Implementation", desc: "ERP system selection, implementation, training, and support." },
  { id: "financial", icon: BarChart3, title: "Financial Analysis", desc: "Financial modeling, KPI dashboards, and performance analysis." },
  { id: "business", icon: Briefcase, title: "Business Consulting", desc: "Feasibility studies, business plans, and strategic advisory." },
  { id: "audit", icon: Search, title: "Audit & Review", desc: "Internal audit, compliance review, and financial controls assessment." },
];

const requestTypes: { id: RequestType; label: string }[] = Object.entries(REQUEST_TYPE_LABELS).map(
  ([id, label]) => ({ id: id as RequestType, label })
);

const ALLOWED_BOOKING_TYPES = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
const MAX_FILES = 3;

interface AttachmentState {
  file: File;
  progress: number;
  error?: string;
  done: boolean;
  result?: { url: string; storagePath: string };
}

export default function Booking() {
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceCategory | "">("");
  const [requestType, setRequestType] = useState<RequestType>("initial_consultation");
  const [requestDetails, setRequestDetails] = useState("");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("email");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<"morning" | "afternoon" | "flexible">("flexible");
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    company: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageRef = useRef(crypto.randomUUID());

  const update = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_FILES - attachments.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newAttachments: AttachmentState[] = toAdd.map((file) => {
      const validation = validateFile(file, ALLOWED_BOOKING_TYPES, 25);
      return { file, progress: 0, done: !validation.valid, error: validation.error };
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (i: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const uploadedAttachments: BookingAttachment[] = [];

      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];
        if (att.error || att.done && att.result) continue;
        if (att.error) continue;
        const safeName = `${Date.now()}_${att.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const path = storagePaths.bookingAttachment(storageRef.current, safeName);
        const { downloadUrl, storagePath } = await uploadFile(path, att.file, ({ progress }) => {
          setAttachments((prev) => prev.map((a, idx) => idx === i ? { ...a, progress } : a));
        });
        setAttachments((prev) => prev.map((a, idx) => idx === i ? { ...a, done: true, result: { url: downloadUrl, storagePath } } : a));
        uploadedAttachments.push({
          name: att.file.name,
          url: downloadUrl,
          storagePath,
          size: formatFileSize(att.file.size),
        });
      }

      // Attach metadata for server-side access control and auditing
      const bookingPayload = {
        userId: user?.id ?? "",
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        serviceCategory: selectedService as ServiceCategory,
        requestType,
        requestDetails: requestDetails.trim(),
        contactPreference,
        preferredDate: preferredDate || undefined,
        preferredTime,
        attachments: uploadedAttachments,
        status: "new",
        notificationsSent: {
          clientConfirmation: false,
          adminAlert: false,
          statusUpdates: [],
        },
        meta: {
          createdFrom: "website_booking_form",
          clientIp: "",
        },
      };

      const id = await createBooking(bookingPayload as any);

      const id = await createBooking({
        userId: user?.id ?? "",
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        serviceCategory: selectedService as ServiceCategory,
        requestType,
        requestDetails: requestDetails.trim(),
        contactPreference,
        preferredDate: preferredDate || undefined,
        preferredTime,
        attachments: uploadedAttachments,
        status: "new",
        notificationsSent: {
          clientConfirmation: false,
          adminAlert: false,
          statusUpdates: [],
        },
      });

      setBookingRef(id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingRef) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Request Submitted!</h2>
            <p className="text-muted-foreground mb-2">
              Your service request has been received. An AKP advisor will review it and contact you within one business day.
            </p>
            <div className="bg-card border border-border rounded-2xl p-5 my-6 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-accent shrink-0" />
                <span className="text-foreground">{SERVICE_LABELS[selectedService as ServiceCategory]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ClipboardList className="w-4 h-4 text-accent shrink-0" />
                <span className="text-foreground">{REQUEST_TYPE_LABELS[requestType]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="text-foreground">{form.email}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">Reference ID</div>
                <div className="font-mono text-xs text-accent font-semibold mt-0.5">{bookingRef.slice(0, 16).toUpperCase()}</div>
              </div>
            </div>
            {isAuthenticated && (
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-[#0A1628] font-bold mb-3 hover:opacity-90">
                View in Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <div className="block">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              <Calendar className="w-3.5 h-3.5" /> Request a Consultation
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Book Your Consultation
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Submit your service request and an AKP senior advisor will be in touch within one business day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress */}
      <section className="py-8 border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {["Select Service", "Request Details", "Your Information"].map((label, i) => (
              <div key={label} className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i + 1 <= step ? "gold-gradient text-[#0A1628]" : "bg-muted text-muted-foreground"}`}>
                    {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* STEP 1: Service Selection */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-foreground mb-8">What service do you need?</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedService === service.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 bg-card"}`}
                      data-testid={`button-service-${service.id}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${selectedService === service.id ? "gold-gradient" : "bg-muted"}`}>
                        <service.icon className={`w-5 h-5 ${selectedService === service.id ? "text-[#0A1628]" : "text-muted-foreground"}`} />
                      </div>
                      <h3 className={`font-semibold mb-1 text-sm ${selectedService === service.id ? "text-accent" : "text-foreground"}`}>{service.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="px-8 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-2"
                    data-testid="button-step1-next"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Request Details */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-foreground mb-8">Tell us about your request</h2>
                <div className="space-y-6">

                  {/* Request Type */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Request Type *</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as RequestType)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                    >
                      {requestTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Request Details */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Describe Your Situation *</label>
                    <textarea
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      rows={5}
                      placeholder="Please describe your current situation, specific needs, and any relevant context that will help us prepare for your consultation..."
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                      data-testid="input-request-details"
                    />
                  </div>

                  {/* Contact Preference */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-3">Preferred Contact Method *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { id: "phone" as ContactPreference, icon: Phone, label: "Phone Call" },
                        { id: "email" as ContactPreference, icon: Mail, label: "Email" },
                        { id: "video" as ContactPreference, icon: Video, label: "Video Call" },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setContactPreference(opt.id)}
                          className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${contactPreference === opt.id ? "border-accent bg-accent/5 text-accent" : "border-border bg-card text-muted-foreground hover:border-accent/40"}`}
                        >
                          <opt.icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time preference */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Preferred Date <span className="font-normal">(optional)</span></label>
                      <input
                        type="date"
                        value={preferredDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
                        data-testid="input-date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Preferred Time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: "morning", label: "Morning", sub: "9 AM–12 PM" },
                          { id: "afternoon", label: "Afternoon", sub: "1 PM–5 PM" },
                          { id: "flexible", label: "Flexible", sub: "Any time" },
                        ] as const).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPreferredTime(t.id)}
                            className={`py-2.5 px-2 rounded-xl border transition-all text-center ${preferredTime === t.id ? "border-accent bg-accent/5 text-accent" : "border-border bg-card text-muted-foreground hover:border-accent/40"}`}
                          >
                            <div className="text-xs font-semibold">{t.label}</div>
                            <div className="text-[10px] opacity-70">{t.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* File attachments */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Supporting Documents <span className="font-normal">(optional — up to {MAX_FILES} files, 25 MB each)</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    {attachments.length < MAX_FILES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border border-dashed border-border hover:border-accent/50 transition-colors text-muted-foreground hover:text-foreground bg-card"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">Click to upload documents, spreadsheets, or images</span>
                      </button>
                    )}
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-sm">
                            <FileText className="w-4 h-4 text-accent shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-foreground text-xs font-medium">{att.file.name}</div>
                              {att.error ? (
                                <div className="text-red-500 text-xs">{att.error}</div>
                              ) : (
                                <div className="text-muted-foreground text-xs">{formatFileSize(att.file.size)}</div>
                              )}
                              {!att.done && att.progress > 0 && (
                                <div className="h-1 bg-muted rounded-full mt-1">
                                  <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${att.progress}%` }} />
                                </div>
                              )}
                            </div>
                            <button type="button" onClick={() => removeAttachment(i)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-border text-foreground text-sm hover:border-accent transition-colors">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!requestDetails.trim()}
                    className="px-8 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-2"
                    data-testid="button-step2-next"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Personal Details */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-foreground mb-8">Your contact details</h2>
                {submitError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
                  </div>
                )}
                <div className="grid lg:grid-cols-3 gap-8">
                  <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name *</label>
                        <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ahmed Karim" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Company</label>
                        <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Your company name" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-company" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address *</label>
                        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-email" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone Number</label>
                        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+20 10 0000 0000" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-phone" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button type="button" onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-border text-foreground text-sm hover:border-accent transition-colors">
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !form.name || !form.email}
                        className="px-8 py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-sm disabled:opacity-50 hover:opacity-90 flex items-center gap-2"
                        data-testid="button-submit-booking"
                      >
                        {submitting
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          : <><CheckCircle className="w-4 h-4" /> Submit Request</>
                        }
                      </button>
                    </div>
                  </form>

                  {/* Summary sidebar */}
                  <div className="space-y-3">
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold text-foreground mb-4 text-sm">Request Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2.5">
                          <Briefcase className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span className="text-foreground">{SERVICE_LABELS[selectedService as ServiceCategory]}</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <ClipboardList className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span className="text-foreground">{REQUEST_TYPE_LABELS[requestType]}</span>
                        </div>
                        {contactPreference === "phone" && <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-accent shrink-0" /><span className="text-foreground">Phone Call</span></div>}
                        {contactPreference === "email" && <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-accent shrink-0" /><span className="text-foreground">Email</span></div>}
                        {contactPreference === "video" && <div className="flex items-center gap-2.5"><Video className="w-4 h-4 text-accent shrink-0" /><span className="text-foreground">Video Call</span></div>}
                        {preferredDate && <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-accent shrink-0" /><span className="text-foreground">{preferredDate}</span></div>}
                        {attachments.filter((a) => !a.error).length > 0 && (
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-accent shrink-0" />
                            <span className="text-foreground">{attachments.filter((a) => !a.error).length} document(s) attached</span>
                          </div>
                        )}
                        <div className="pt-3 mt-2 border-t border-border">
                          <div className="text-accent font-semibold text-sm">First consultation — Free</div>
                          <div className="text-muted-foreground text-xs mt-1">Response within one business day.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#060E1E]/5 dark:bg-white/5 border border-border rounded-2xl p-4 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>All information is kept strictly confidential and protected under our privacy policy.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact alternatives */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-xl font-bold text-foreground text-center mb-8">Prefer to reach us directly?</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 max-w-2xl mx-auto gap-4">
            {[
              { icon: Phone, label: "Call Us", value: "+20 2 1234 5678", desc: "Sun–Thu, 9 AM – 5 PM" },
              { icon: Mail, label: "Email Us", value: "info@akp-consulting.com", desc: "Response within 24 hours" },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-[#0A1628]" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{item.label}</div>
                    <div className="text-accent text-sm">{item.value}</div>
                    <div className="text-muted-foreground text-xs">{item.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
