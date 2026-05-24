import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, ChevronRight, User, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createContactMessage } from "@/lib/firestore";
import { toast } from "sonner";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  timestamp: string;
}

const quickSuggestions = [
  "What services do you offer?",
  "How do I book a consultation?",
  "What are your tax services?",
  "Tell me about your courses",
];

const botResponses: Record<string, string> = {
  services: "AKP offers Financial Accounting, Tax Consulting, HR Management, Payroll Processing, ERP Implementation, and Business Consulting. Visit our Services page for full details.",
  tax: "Our Tax Advisory team handles Egyptian income tax, VAT (14%), withholding tax, corporate tax strategy, and tax dispute resolution. We're fully compliant with Egyptian Tax Authority regulations.",
  accounting: "We provide comprehensive bookkeeping, monthly financial statements, IFRS-compliant reporting, and internal controls tailored for Egyptian businesses.",
  hr: "Our HR services include policy design, recruitment support, performance management, Egyptian labor law compliance (Law No. 12/2003), and payroll processing.",
  erp: "We implement SAP, Oracle, and Microsoft Dynamics ERP systems for Egyptian companies — including setup, configuration, data migration, and staff training.",
  courses: "AKP Academy offers 120+ professional courses in Accounting, Tax, HR, and Finance — taught by certified Egyptian professionals. Check our Courses page for the full catalog.",
  booking: "You can book a consultation via the 'Book Consultation' button in the navigation, or visit /booking. First 30 minutes are free!",
  contact: "You can reach us at +20 2 1234 5678, email info@akp-consulting.com, or book a consultation online. We're available Sun–Thu, 9 AM – 5 PM.",
  price: "Our plans start from EGP 2,500/month for the Starter plan. We also offer Professional (EGP 6,500/month) and custom Enterprise pricing. Visit our Pricing page for details.",
  default: "Thank you for your message! Our AKP advisors are available Sun–Thu, 9 AM – 5 PM Cairo time. For immediate assistance, call +20 2 1234 5678 or book a free consultation.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("service") || lower.includes("offer") || lower.includes("do you")) return botResponses.services;
  if (lower.includes("tax") || lower.includes("vat")) return botResponses.tax;
  if (lower.includes("accounting") || lower.includes("bookkeep") || lower.includes("financial statement")) return botResponses.accounting;
  if (lower.includes("hr") || lower.includes("human resource") || lower.includes("payroll") || lower.includes("labor")) return botResponses.hr;
  if (lower.includes("erp") || lower.includes("sap") || lower.includes("oracle") || lower.includes("system")) return botResponses.erp;
  if (lower.includes("course") || lower.includes("learn") || lower.includes("train") || lower.includes("academy")) return botResponses.courses;
  if (lower.includes("book") || lower.includes("appointment") || lower.includes("consult") || lower.includes("schedule")) return botResponses.booking;
  if (lower.includes("contact") || lower.includes("phone") || lower.includes("email") || lower.includes("reach")) return botResponses.contact;
  if (lower.includes("price") || lower.includes("cost") || lower.includes("plan") || lower.includes("fee") || lower.includes("egp")) return botResponses.price;
  return botResponses.default;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "escalate">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: "Hello! I'm the AKP Assistant. I can help you with questions about our accounting, tax, HR, and consulting services. How can I help you today?",
      timestamp: getTime(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const [escalateName, setEscalateName] = useState("");
  const [escalateEmail, setEscalateEmail] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && view === "chat") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, isTyping, view]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text, timestamp: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
    const botMsg: Message = { id: Date.now() + 1, from: "bot", text: getResponse(text), timestamp: getTime() };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleEscalate = async () => {
    if (!escalateName.trim() || !escalateEmail.trim()) return;
    setEscalating(true);
    try {
      const transcript = messages.map((m) => ({ from: m.from, text: m.text, timestamp: m.timestamp }));
      await createContactMessage({
        name: escalateName,
        email: escalateEmail,
        message: escalateNote || "Requested to speak with a human advisor.",
        source: "chat_escalation",
        chatTranscript: transcript,
      });
      setEscalated(true);
    } catch {
      toast.error("Could not send your request. Please email us at info@akp-consulting.com.");
    } finally {
      setEscalating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setView("chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-[#C9A84C]/20 flex flex-col"
            style={{ maxHeight: "500px" }}
          >
            {/* Header */}
            <div className="bg-[#0A1628] px-4 py-3.5 flex items-center gap-3 shrink-0">
              {view === "escalate" && (
                <button onClick={() => setView("chat")} className="text-white/50 hover:text-white transition-colors mr-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                {view === "escalate" ? <User className="w-5 h-5 text-[#0A1628]" /> : <Bot className="w-5 h-5 text-[#0A1628]" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-white font-semibold text-sm">
                    {view === "escalate" ? "Talk to a Human" : "AKP Assistant"}
                  </div>
                  {view === "chat" && <Sparkles className="w-3 h-3 text-[#C9A84C]" />}
                </div>
                <div className="text-[#C9A84C] text-xs flex items-center gap-1.5">
                  {view === "chat" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                      Online — typically replies instantly
                    </>
                  ) : (
                    "Leave your details and we'll call you back"
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white transition-colors"
                data-testid="button-close-chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat view */}
            {view === "chat" && (
              <>
                <div className="bg-[#F8F9FB] dark:bg-[#0D1F3C] flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.from === "bot" && (
                        <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center shrink-0 mb-1">
                          <Bot className="w-3.5 h-3.5 text-[#0A1628]" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div
                          className={`px-4 py-3 text-sm leading-relaxed ${
                            msg.from === "user"
                              ? "bg-[#0A1628] text-white rounded-2xl rounded-br-sm"
                              : "bg-white dark:bg-[#0A1628] text-foreground rounded-2xl rounded-tl-sm shadow-sm border border-border/50"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5 text-[#0A1628]" />
                      </div>
                      <div className="bg-white dark:bg-[#0A1628] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border/50">
                        <div className="flex gap-1 items-center h-4">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                  <div className="bg-[#F8F9FB] dark:bg-[#0D1F3C] px-4 pb-3 flex flex-wrap gap-1.5">
                    {quickSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-white dark:bg-[#0A1628] border-t border-border px-3 py-3 flex gap-2 shrink-0">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AKP Assistant..."
                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                    data-testid="input-chat"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="w-9 h-9 rounded-xl gold-gradient text-[#0A1628] flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40"
                    data-testid="button-send-chat"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white dark:bg-[#0A1628] border-t border-border/50 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">AKP Consulting · Cairo, Egypt</span>
                  <button
                    onClick={() => setView("escalate")}
                    className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                    data-testid="button-talk-human"
                  >
                    Talk to a human <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </>
            )}

            {/* Escalation view */}
            {view === "escalate" && (
              <div className="bg-[#F8F9FB] dark:bg-[#0D1F3C] flex-1 overflow-y-auto p-5">
                {escalated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-6 gap-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">Request Received!</div>
                      <p className="text-sm text-muted-foreground">
                        One of our advisors will contact you within 24 hours on business days (Sun–Thu).
                      </p>
                    </div>
                    <button
                      onClick={() => { setView("chat"); setEscalated(false); setEscalateName(""); setEscalateEmail(""); setEscalateNote(""); }}
                      className="text-xs text-accent hover:underline"
                    >
                      Back to chat
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Leave your details and an AKP advisor will reach out to you directly.
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input
                        value={escalateName}
                        onChange={(e) => setEscalateName(e.target.value)}
                        placeholder="Ahmed Karim"
                        className="w-full bg-white dark:bg-[#0A1628] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                        data-testid="input-escalate-name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={escalateEmail}
                        onChange={(e) => setEscalateEmail(e.target.value)}
                        placeholder="ahmed@company.com"
                        className="w-full bg-white dark:bg-[#0A1628] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                        data-testid="input-escalate-email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Additional Notes</label>
                      <textarea
                        value={escalateNote}
                        onChange={(e) => setEscalateNote(e.target.value)}
                        placeholder="Anything specific you'd like to discuss..."
                        rows={3}
                        className="w-full bg-white dark:bg-[#0A1628] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 resize-none"
                        data-testid="textarea-escalate-note"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Your chat history will be shared with the advisor so they can help you faster.
                    </p>
                    <button
                      onClick={handleEscalate}
                      disabled={!escalateName.trim() || !escalateEmail.trim() || escalating}
                      className="w-full py-2.5 rounded-xl gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                      data-testid="button-escalate-submit"
                    >
                      {escalating ? "Sending..." : "Request Callback"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full gold-gradient shadow-xl flex items-center justify-center text-[#0A1628] relative"
        data-testid="button-chat-widget"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </motion.button>
    </div>
  );
}
