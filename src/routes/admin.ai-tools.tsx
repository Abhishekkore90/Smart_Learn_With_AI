import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Cpu,
  Zap,
  Settings,
  ChevronLeft,
  Plus,
  Search,
  ArrowUp,
  MessageSquare,
  Menu,
  X,
  User,
  Trash2,
  Paperclip,
  CheckCircle,
  ChevronDown,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  Bot,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

export const Route = createFileRoute("/admin/ai-tools")({
  head: () => ({
    meta: [{ title: "SMART LEARNING — Generative AI Workspace" }],
  }),
  component: AIChatWorkspace,
});

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  fileName?: string;
  fileSize?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const INITIAL_CHATS: Chat[] = [];

type ModelKey = "gpt3" | "gpt4" | "sora";

interface ModelConfig {
  name: string;
  version: string;
  color: string;
  badge: string;
  avatar: string;
  dot: string;
  accent: string;
  gradient: string;
}

const MODEL_CONFIGS: Record<ModelKey, ModelConfig> = {
  gpt3: {
    name: "ChatGPT",
    version: "3.5",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    badge: "bg-emerald-50 border-emerald-100 text-emerald-600",
    avatar: "bg-emerald-600 border-emerald-500 text-white",
    dot: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
    accent: "focus-within:border-emerald-500/30",
    gradient: "from-emerald-600 to-teal-500",
  },
  gpt4: {
    name: "SMART LEARNING GPT-4",
    version: "Intelligence Node",
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    badge: "bg-indigo-50 border-indigo-100 text-indigo-600",
    avatar: "bg-indigo-600 border-indigo-500 text-white",
    dot: "bg-indigo-500 shadow-[0_0_10px_#8b5cf6]",
    accent: "focus-within:border-indigo-500/30",
    gradient: "from-indigo-600 to-violet-500",
  },
  sora: {
    name: "Sora Media AI",
    version: "Motion Node v2",
    color: "text-rose-600 bg-rose-50 border-rose-100",
    badge: "bg-rose-50 border-rose-100 text-rose-600",
    avatar: "bg-rose-600 border-rose-500 text-white",
    dot: "bg-rose-500 shadow-[0_0_10px_#f43f5e]",
    accent: "focus-within:border-rose-500/30",
    gradient: "from-rose-600 to-pink-500",
  },
};

function AIChatWorkspace() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelKey>("gpt4");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  if (!showWorkspace) {
    return <AILandingPage onStart={() => setShowWorkspace(true)} />;
  }

  const currentModel = MODEL_CONFIGS[activeModel];
  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    (chats.length > 0 ? chats[0] : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      toast.success(`${t.ai_attach_toast} ${file.name}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedFile) return;
    if (isGenerating) return;

    let currentChatId = activeChatId;
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: inputValue.slice(0, 30) || attachedFile?.name || "New Chat",
        messages: [],
      };
      setChats([newChat]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
    }

    const userMessage = inputValue;
    const currentFile = attachedFile;
    setInputValue("");
    setAttachedFile(null);

    const messageText = currentFile
      ? `[File: ${currentFile.name}] ${userMessage}`.trim()
      : userMessage;

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now().toString(),
                  sender: "user",
                  text: messageText,
                  fileName: currentFile?.name,
                  fileSize: currentFile
                    ? (currentFile.size / 1024).toFixed(1) + " KB"
                    : undefined,
                } as any,
              ],
            }
          : c,
      ),
    );
    simulateAIResponse(messageText, currentChatId);
  };

  const simulateAIResponse = (userText: string, chatId: string) => {
    setIsGenerating(true);
    let response =
      lang === "en"
        ? "I have processed your request with " +
          MODEL_CONFIGS[activeModel].name +
          ". How else can I help?"
        : lang === "mr"
          ? "मी " +
            MODEL_CONFIGS[activeModel].name +
            " सह तुमची विनंती पूर्ण केली आहे. मी अजून काय मदत करू शकतो?"
          : "मैंने " +
            MODEL_CONFIGS[activeModel].name +
            " के साथ आपके अनुरोध को प्रोसेस किया है। मैं आपकी और क्या सहायता कर सकता हूँ?";

    const aiMessageId = `ai-${Date.now()}`;

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: aiMessageId, sender: "ai", text: "" },
              ],
            }
          : c,
      ),
    );

    let i = 0;
    const interval = setInterval(() => {
      i += 5;
      if (i >= response.length) {
        i = response.length;
        clearInterval(interval);
        setIsGenerating(false);
      }
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, text: response.slice(0, i) }
                    : m,
                ),
              }
            : c,
        ),
      );
    }, 20);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full flex bg-white text-slate-800 font-sans overflow-hidden">
      <main className="flex-1 flex flex-col h-full relative">
        {/* Workspace Control Header */}
        <header className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowWorkspace(false)}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
              title="Back to Info Page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-black tracking-tight text-md text-slate-800 uppercase flex items-center gap-2">
              <Brain className="size-5 text-indigo-600" />
              {t.ai_workspace_header}
            </span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setModelMenuOpen(!modelMenuOpen)}
              className="flex items-center gap-2.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-wider text-slate-700 cursor-pointer"
            >
              <span className={`size-2 rounded-full ${currentModel.dot.split(" ")[0]}`} />
              {currentModel.name}
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {modelMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                {(Object.keys(MODEL_CONFIGS) as ModelKey[]).map((key) => {
                  const config = MODEL_CONFIGS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveModel(key);
                        setModelMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer ${
                        activeModel === key ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className={`size-8 rounded-lg ${config.avatar.split(" ")[0]} flex items-center justify-center font-bold text-xs`}>
                        {config.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">{config.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{config.version}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 space-y-8 bg-[#F8FAFF]">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="size-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 text-white">
                <Brain size={40} className="animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.ai_new_exploration}</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{t.ai_select_model}</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {activeChat.messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/60 rounded-bl-none"
                    }`}
                  >
                    {msg.fileName && (
                      <div className={`flex items-center gap-3 mb-3 p-3 rounded-xl border ${
                        msg.sender === "user" ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="size-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                          <Paperclip size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold truncate max-w-[150px]">
                            {msg.fileName}
                          </p>
                          <p className="text-[9px] opacity-70 font-black uppercase tracking-widest">
                            {msg.fileSize}
                          </p>
                        </div>
                      </div>
                    )}
                    <MarkdownMessage text={msg.text} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {attachedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center">
                      <Paperclip size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                        {attachedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {(attachedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-2 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="absolute left-3 top-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                    attachedFile
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <Paperclip size={18} />
                </button>
              </div>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isGenerating
                    ? t.ai_thinking
                    : attachedFile
                      ? t.ai_ask_file
                      : t.ai_placeholder
                }
                className="w-full h-16 pl-16 pr-16 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 size-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200/50"
              >
                <ArrowUp size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function AILandingPage({ onStart }: { onStart: () => void }) {
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;

  return (
    <div className="p-6 space-y-8 bg-[#F8FAFF]">
      {/* Back to Hub navigation link */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Hub
        </Link>
      </div>

      {/* Hero Section */}
      <header className="grid lg:grid-cols-2 gap-8 items-center border-b border-slate-100 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <Sparkles className="size-3.5 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">
                Cognitive Assist Module
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-slate-900">
              {t.ai_landing_title}
            </h1>
            <p className="text-md text-slate-500 font-medium leading-relaxed max-w-md">
              {t.ai_landing_subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onStart}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/40 cursor-pointer"
            >
              {t.ai_landing_get_started}
            </button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1454165833767-027ffea9e51b?auto=format&fit=crop&q=80&w=600"
            alt="AI Learning"
            className="rounded-2xl border border-slate-200 shadow-xl max-h-[220px] object-cover w-full"
          />
          <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="size-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {lang === "mr" ? "वैयक्तिकृत" : "Personalized"}
              </p>
              <p className="font-black text-sm text-slate-800 tracking-tight">
                {lang === "mr" ? "अनुकूलन शिक्षण" : "Adaptive Learning"}
              </p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Info Section */}
      <section className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-8">
        <div className="space-y-2.5 text-center">
          <p className="text-indigo-600 font-black uppercase tracking-widest text-[9px]">
            {lang === "mr" ? "स्टडी बडी तुम्हाला मदत करू शकते:" : "StudyBuddy can help you:"}
          </p>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            {t.ai_help_title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: BookOpen,
              title: t.ai_potential_title,
              desc: t.ai_potential_desc,
            },
            {
              icon: Cpu,
              title: t.ai_teaching_title,
              desc: t.ai_teaching_desc,
            },
            { icon: Zap, title: t.ai_adapts_title, desc: t.ai_adapts_desc },
          ].map((f, i) => (
            <div key={i} className="space-y-3 p-4 bg-[#F8FAFF] rounded-xl border border-slate-100">
              <div className="size-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-600 border border-slate-200">
                <f.icon size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-800">{f.title}</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MarkdownMessage({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-4">
      {parts.map((part, i) =>
        part.startsWith("```") ? (
          <CodeBlock
            key={i}
            language={part.match(/```(\w*)\n/)?.[1] || "code"}
            code={part.replace(/```[\w]*\n|```/g, "")}
          />
        ) : (
          <FormattedText key={i} text={part} />
        ),
      )}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  const highlight = (raw: string) => {
    let html = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt bridge;");
    html = html.replace(
      /(\/\/.*)/g,
      '<span class="text-slate-400 font-normal italic">$1</span>',
    );
    const kw =
      /\b(const|let|var|function|return|import|export|from|class|await|async|interface|type|default|extends|new|try|catch|finally|if|else|for|while|do|switch|case|break)\b/g;
    html = html.replace(kw, '<span class="text-pink-600 font-bold">$1</span>');
    html = html.replace(
      /(["'`])([\s\S]*?)\1/g,
      '<span class="text-emerald-600 font-medium">"$2"</span>',
    );
    const hooks =
      /\b(useState|useEffect|useRef|useAuth|useNavigate|createFileRoute|onAuthStateChanged|getDoc|doc|setDoc|query|collection|addDoc|deleteDoc|toast|success|error|info)\b/g;
    html = html.replace(
      hooks,
      '<span class="text-sky-600 font-bold">$1</span>',
    );
    return <code dangerouslySetInnerHTML={{ __html: html }} />;
  };
  return (
    <div className="my-4 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-1.5 font-mono">
          <Terminal size={12} className="text-indigo-600" />{" "}
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 hover:bg-slate-200 rounded-lg text-[9px] font-black text-slate-600 hover:text-slate-800 transition-colors"
        >
          {copied ? (
            <Check size={11} className="text-emerald-600" />
          ) : (
            <Copy size={11} />
          )}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-800 bg-slate-50/50">
        {highlight(code)}
      </pre>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;
        if (line.startsWith("* ") || line.startsWith("- ")) {
          const content = line.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-4">
              <span className="size-1.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              <span className="text-slate-700 text-xs font-semibold leading-relaxed">
                {renderInlineStyles(content)}
              </span>
            </div>
          );
        }
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-4">
              <span className="text-indigo-600 font-black text-xs shrink-0 mt-0.5 font-mono">
                {numMatch[1]}.
              </span>
              <span className="text-slate-700 text-xs font-semibold leading-relaxed">
                {renderInlineStyles(numMatch[2])}
              </span>
            </div>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-xs font-black text-slate-900 mt-4 mb-1 border-l-2 border-indigo-600 pl-2"
            >
              {renderInlineStyles(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-sm font-black text-slate-900 mt-5 mb-2">
              {renderInlineStyles(line.slice(3))}
            </h3>
          );
        }
        return (
          <p key={idx} className="text-slate-700 text-xs font-semibold leading-relaxed">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineStyles(text: string) {
  const boldParts: React.ReactNode[] = [];
  const splitBold = text.split(/(\*\*.*?\*\*)/g);
  splitBold.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      boldParts.push(
        <strong key={i} className="font-black text-slate-900">
          {part.slice(2, -2)}
        </strong>,
      );
    } else {
      boldParts.push(part);
    }
  });
  const final: React.ReactNode[] = [];
  boldParts.forEach((part, i) => {
    if (typeof part === "string") {
      const splitCode = part.split(/(`.*?`)/g);
      splitCode.forEach((c, j) => {
        if (c.startsWith("`") && c.endsWith("`")) {
          final.push(
            <code
              key={`c-${i}-${j}`}
              className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-bold mx-0.5"
            >
              {c.slice(1, -1)}
            </code>,
          );
        } else {
          final.push(c);
        }
      });
    } else {
      final.push(part);
    }
  });
  return <>{final}</>;
}
