import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, RotateCcw, ChevronDown, Sparkles, Calculator,
  Users, BarChart3, FileText, Briefcase, Loader2,
} from "lucide-react";

interface AssistantConfig {
  id: string;
  name: string;
  icon: typeof Bot;
  color: string;
  accent: string;
  description: string;
  prompts: string[];
}

const ASSISTANTS: AssistantConfig[] = [
  {
    id: "tax",
    name: "Tax Assistant",
    icon: Calculator,
    color: "text-amber-500",
    accent: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    description: "Egyptian tax law, VAT, corporate tax, filing deadlines",
    prompts: [
      "What is the current corporate income tax rate in Egypt?",
      "When is the VAT filing deadline for Q1?",
      "What documents are needed for annual tax return?",
      "How is payroll tax calculated in Egypt?",
    ],
  },
  {
    id: "finance",
    name: "Finance Assistant",
    icon: BarChart3,
    color: "text-blue-500",
    accent: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    description: "Financial analysis, reporting, cash flow, forecasting",
    prompts: [
      "How do I prepare a cash flow statement?",
      "What is the difference between IFRS and EAS?",
      "Explain the DuPont analysis framework.",
      "What ratios indicate a company's liquidity?",
    ],
  },
  {
    id: "hr",
    name: "HR Assistant",
    icon: Users,
    color: "text-purple-500",
    accent: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    description: "Egyptian labor law, payroll, contracts, HR compliance",
    prompts: [
      "What are the mandatory employee benefits in Egypt?",
      "How is social insurance calculated?",
      "What notice period is required for termination?",
      "What are the rules for annual leave in Egypt?",
    ],
  },
  {
    id: "business",
    name: "Business Consultant",
    icon: Briefcase,
    color: "text-green-500",
    accent: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    description: "Business strategy, market entry, growth planning",
    prompts: [
      "How do I register a company in Egypt?",
      "What are the key steps to entering the Egyptian market?",
      "How should I structure a business plan?",
      "What are common ERP implementation pitfalls?",
    ],
  },
  {
    id: "document",
    name: "Document Analyzer",
    icon: FileText,
    color: "text-pink-500",
    accent: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    description: "Contract review, financial statement analysis, report insights",
    prompts: [
      "What should I look for in a vendor contract?",
      "How do I read a balance sheet?",
      "What red flags appear in financial statements?",
      "Explain the components of an income statement.",
    ],
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "Thank you for your question. The AI assistant is being configured with our knowledge base. Once live, I'll provide detailed guidance on Egyptian business regulations, finance, and HR matters.\n\n**Coming soon:** Full AI integration with AKP's expert knowledge base.",
  tax: "Our Tax Assistant will cover Egyptian tax law including: corporate income tax (22.5%), VAT (14%), withholding taxes, payroll tax calculations, filing deadlines, and e-filing procedures through the Egyptian Tax Authority portal.\n\n**Coming soon:** Live AI responses with up-to-date Egyptian tax guidance.",
  finance: "The Finance Assistant will help with IFRS/EAS compliance, financial ratio analysis, budgeting templates, cash flow modeling, and financial statement interpretation tailored to the Egyptian business environment.\n\n**Coming soon:** Live AI responses.",
  hr: "The HR Assistant will provide guidance on Egyptian Labor Law (Law No. 12 of 2003), social insurance calculations, payroll processing, employment contracts, leave entitlements, and termination procedures.\n\n**Coming soon:** Live AI responses.",
  business: "The Business Consultant will assist with company registration in Egypt (SAE, LLC structures), investment law guidance, market entry strategy, ERP implementation planning, and regulatory compliance.\n\n**Coming soon:** Live AI responses.",
  document: "The Document Analyzer will help review contracts, analyze financial statements, identify compliance gaps, and provide structured summaries of business documents. Upload functionality will be enabled once the AI integration is live.\n\n**Coming soon:** Document upload and AI analysis.",
};

export default function AIAssistant() {
  const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(ASSISTANTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentMessages = conversations[activeAssistant.id] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  const switchAssistant = (assistant: AssistantConfig) => {
    setActiveAssistant(assistant);
    setInput("");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setConversations((prev) => ({
      ...prev,
      [activeAssistant.id]: [...(prev[activeAssistant.id] ?? []), userMsg],
    }));
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

    const response = DEMO_RESPONSES[activeAssistant.id] ?? DEMO_RESPONSES.default;
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: response,
      timestamp: new Date(),
    };

    setConversations((prev) => ({
      ...prev,
      [activeAssistant.id]: [...(prev[activeAssistant.id] ?? []), assistantMsg],
    }));
    setIsTyping(false);
  };

  const clearChat = () => {
    setConversations((prev) => ({ ...prev, [activeAssistant.id]: [] }));
  };

  const AssistantIcon = activeAssistant.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" /> AI Assistants
        </h1>
        <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium">
          Preview Mode
        </span>
      </div>

      {/* Assistant selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {ASSISTANTS.map((a) => {
          const Icon = a.icon;
          const isActive = activeAssistant.id === a.id;
          return (
            <button
              key={a.id}
              onClick={() => switchAssistant(a)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? `${a.accent} ${a.color}`
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {a.name}
            </button>
          );
        })}
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-card border rounded-2xl overflow-hidden ${activeAssistant.accent}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-card border border-inherit flex items-center justify-center`}>
              <AssistantIcon className={`w-4 h-4 ${activeAssistant.color}`} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${activeAssistant.color}`}>{activeAssistant.name}</div>
              <div className="text-xs text-muted-foreground">{activeAssistant.description}</div>
            </div>
          </div>
          <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground" title="Clear chat">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className={`w-12 h-12 rounded-2xl bg-card border border-inherit flex items-center justify-center mb-3`}>
                <AssistantIcon className={`w-6 h-6 ${activeAssistant.color}`} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Ask {activeAssistant.name}</p>
              <p className="text-xs text-muted-foreground mb-5 max-w-xs">{activeAssistant.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {activeAssistant.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs bg-card border border-inherit rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground hover:border-current transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
              {msg.role === "assistant" && (
                <div className={`w-7 h-7 rounded-lg bg-card border border-inherit flex items-center justify-center shrink-0 mt-0.5`}>
                  <AssistantIcon className={`w-3.5 h-3.5 ${activeAssistant.color}`} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#0A1628] text-white rounded-br-sm"
                    : "bg-card border border-inherit text-foreground rounded-bl-sm"
                }`}
              >
                {msg.text.split("**").map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
                <div className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-white/40" : "text-muted-foreground"}`}>
                  {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg bg-card border border-inherit flex items-center justify-center shrink-0`}>
                <AssistantIcon className={`w-3.5 h-3.5 ${activeAssistant.color}`} />
              </div>
              <div className="bg-card border border-inherit rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-inherit">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={`Ask ${activeAssistant.name}…`}
              rows={1}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl gold-gradient text-[#0A1628] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            AI assistants are in preview mode — responses are illustrative. Full integration coming soon.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
