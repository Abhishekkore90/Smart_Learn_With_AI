import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  Plus,
  ArrowUp,
  MessageSquare,
  Menu,
  X,
  Trash2,
  Paperclip,
  Copy,
  Check,
  Terminal,
  Mic,
} from "lucide-react";
import { showToast as toast } from "@/lib/custom-toast";

import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

export const Route = createFileRoute("/ai-tools")({
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

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY as string;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

type ModelKey = "chatgpt" | "claude" | "gemini";

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
  chatgpt: {
    name: "ChatGPT",
    version: "GPT-4o Mini",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    avatar: "bg-emerald-600 border-emerald-500 text-white",
    dot: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
    accent: "focus-within:border-emerald-500/30",
    gradient: "from-emerald-600 to-teal-500",
  },
  claude: {
    name: "Claude",
    version: "3.5 Sonnet",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    avatar: "bg-orange-600 border-orange-500 text-white",
    dot: "bg-orange-500 shadow-[0_0_10px_#f97316]",
    accent: "focus-within:border-orange-500/30",
    gradient: "from-orange-600 to-amber-500",
  },
  gemini: {
    name: "Gemini",
    version: "3.5 Flash",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    avatar: "bg-blue-600 border-blue-500 text-white",
    dot: "bg-blue-500 shadow-[0_0_10px_#3b82f6]",
    accent: "focus-within:border-blue-500/30",
    gradient: "from-blue-600 to-indigo-500",
  },
};

function AIChatWorkspace() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem("smart_learning_ai_chats");
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch (e) {
      console.error(e);
      return INITIAL_CHATS;
    }
  });
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem("smart_learning_ai_active_chat_id");
      return savedId || "";
    } catch (e) {
      return "";
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelKey>("chatgpt");
  const [selectedFormat, setSelectedFormat] = useState<string>("notes");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  useEffect(() => {
    try {
      localStorage.setItem("smart_learning_ai_chats", JSON.stringify(chats));
    } catch (e) {
      console.error(e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem("smart_learning_ai_active_chat_id", activeChatId);
    } catch (e) {
      console.error(e);
    }
  }, [activeChatId]);

  const [isListening, setIsListening] = useState(false);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast.info(lang === "mr" ? "बोलणे सुरू करा..." : "Listening... Speak now");
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputValue((prev) => (prev ? prev + " " + transcript : transcript));
        toast.success(lang === "mr" ? "आवाज रेकॉर्ड केला!" : "Voice captured!");
      }
    };
    
    recognition.start();
  };

  const currentModel = MODEL_CONFIGS[activeModel];
  const activeChat = activeChatId ? (chats.find((c) => c.id === activeChatId) || null) : null;

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

    const userMessage = inputValue;
    const currentFile = attachedFile;
    setInputValue("");
    setAttachedFile(null);

    const messageText = currentFile
      ? `[File: ${currentFile.name}] ${userMessage}`.trim()
      : userMessage;

    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: messageText,
      fileName: currentFile?.name,
      fileSize: currentFile
        ? `${(currentFile.size / 1024).toFixed(1)} KB`
        : undefined,
    };

    let currentChatId = activeChatId;
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: userMessage.slice(0, 30) || currentFile?.name || "New Chat",
        messages: [userMsgObj],
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
    } else {
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [...c.messages, userMsgObj],
              }
            : c
        )
      );
    }

    fetchAIResponse(
      messageText,
      currentChatId,
      currentFile?.name,
      currentFile ? `${(currentFile.size / 1024).toFixed(1)} KB` : undefined
    );
  };

  const getFormatInstruction = (format: string): string => {
    const f = format.toLowerCase();
    if (f.includes("lecture slides") || f.includes("slide"))
      return "Format your entire response as a slide-by-slide presentation outline. Use 'Slide 1:', 'Slide 2:', etc. as headers. Each slide should have a bold title and 3-5 bullet points.";
    if (f.includes("pdf"))
      return "Format your response as a professional PDF-style document with clear sections, headings, and subheadings. Include a Summary section at the top.";
    if (f.includes("word") || f.includes("document"))
      return "Format your response as a professional Word document structure with Introduction, Main Body (with numbered sections), and Conclusion.";
    if (f.includes("powerpoint") || f.includes("presentation"))
      return "Format your response as a PowerPoint presentation outline with titled slides. Each slide should have a title and key bullet points.";
    if (f.includes("google docs") || f.includes("google"))
      return "Format your response as a collaborative document outline with sections suitable for Google Docs. Use clear headings and collaborative notes.";
    if (f.includes("webpage") || f.includes("web"))
      return "Format your response as web page content with a clear H1 title, introduction paragraph, structured sections with H2 subheadings, and a conclusion.";
    if (f.includes("youtube") || f.includes("video"))
      return "Format your response as a YouTube video script with [INTRO], [SECTION 1], [SECTION 2], [OUTRO] markers. Include timestamps for each section.";
    if (f.includes("textbook"))
      return "Format your response in an academic textbook style with a chapter title, learning objectives, detailed explanations, examples, and review questions at the end.";
    if (f.includes("study guide"))
      return "Format your response as a concise study guide with Key Terms, Core Concepts, Important Formulas or Rules, Quick Review Questions, and Memory Tips.";
    if (f.includes("research"))
      return "Format your response as a research paper outline with Abstract, Introduction, Literature Review notes, Methodology, Key Findings, and References section.";
    // default: notes
    return "Format your response as clear and organized study notes with bullet points, bold key terms, and easy-to-read sections.";
  };

  const fetchAIResponse = async (userText: string, chatId: string, fileName?: string, fileSize?: string) => {
    setIsGenerating(true);

    const formatInstruction = getFormatInstruction(selectedFormat);
    const systemPrompt = `You are a smart educational AI assistant integrated into the Smart Learn platform. You help students learn by generating study materials, practice questions, summaries and insights. ${formatInstruction}${fileName ? ` The user has also attached a file named "${fileName}" (${fileSize}) — reference it in your response.` : ""}`;
    const cleanText = userText.replace(/\[File:.*?\]/, "").trim() || "Please analyze and create study material.";

    const aiMessageId = `ai-${Date.now()}`;

    // Add empty AI message placeholder
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { id: aiMessageId, sender: "ai" as const, text: "" }] }
          : c,
      ),
    );

    let response = "";

    try {
      if (activeModel === "chatgpt") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: cleanText },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any)?.error?.message || `OpenAI error ${res.status}`);
        }
        const data = await res.json();
        response = data.choices?.[0]?.message?.content || "No response received from ChatGPT.";
      } else if (activeModel === "claude") {
        const res = await fetch("/api/anthropic/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1500,
            system: systemPrompt,
            messages: [{ role: "user", content: cleanText }],
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any)?.error?.message || `Claude error ${res.status}`);
        }
        const data = await res.json();
        response = data.content?.[0]?.text || "No response received from Claude.";
      } else if (activeModel === "gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: cleanText }] }],
              generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
            }),
          },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any)?.error?.message || `Gemini error ${res.status}`);
        }
        const data = await res.json();
        response =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response received from Gemini.";
      }
    } catch (err: any) {
      console.error("AI API error:", err);
      response = `⚠️ **API Error:** ${err?.message || "Failed to fetch AI response. Please try again."}\n\nIf the issue persists, please check your API key or network connection.`;
      toast.error(`AI Error: ${err?.message || "Request failed"}`);
    }

    // Animate the response text character by character
    let i = 0;
    const interval = setInterval(() => {
      i += 8;
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
                  m.id === aiMessageId ? { ...m, text: response.slice(0, i) } : m,
                ),
              }
            : c,
        ),
      );
    }, 15);
  };


  return (
    <div>
      <div className="h-screen w-full flex bg-white text-slate-900 font-sans overflow-hidden">
        
        {/* Sidebar overlay drawer (Desktop & Mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed inset-y-0 left-0 w-80 bg-[#fafafa] dark:bg-[#121212] z-50 p-6 flex flex-col h-full shadow-2xl border-r border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-xs uppercase tracking-widest text-slate-400">
                    {lang === "mr" ? "मागील शोध" : "Search History"}
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 cursor-pointer transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setActiveChatId("");
                    setAttachedFile(null);
                    setInputValue("");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus size={16} /> {lang === "mr" ? "नवीन शोध" : "New Search"}
                </button>
                
                <div className="h-px bg-slate-100 dark:bg-white/5 my-4 shrink-0" />
                
                <div className="flex-1 overflow-y-auto space-y-1">
                  {chats.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 font-medium italic">
                      {lang === "mr" ? "कोणताही इतिहास नाही" : "No search history"}
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setSidebarOpen(false);
                        }}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          activeChatId === chat.id
                            ? "bg-violet-50 text-indigo-600 dark:bg-violet-500/10 dark:text-violet-400 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-stone-400 font-semibold"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <MessageSquare size={14} className="shrink-0 opacity-70" />
                          <span className="text-[11px] truncate">{chat.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChats((prev) => prev.filter((c) => c.id !== chat.id));
                            if (activeChatId === chat.id) {
                              setActiveChatId("");
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-rose-500 transition-all shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col h-full">
          <header className="h-16 px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/" })}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Menu Toggle for Sidebar (Desktop & Mobile) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-600 dark:text-stone-400 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/60 dark:border-white/5 shadow-sm px-3 py-1.5"
              >
                <Menu size={18} />
                <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">
                  {lang === "mr" ? "इतिहास" : "History"}
                </span>
              </button>

              <span className="font-black tracking-tighter text-lg uppercase pl-2">
                {t.ai_workspace_header}
              </span>
            </div>
            <div className="flex items-center gap-3">
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-20 lg:px-40 space-y-8">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-8 space-y-12">
                
                {/* Header Title Section */}
                <div className="text-center space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-indigo-600 border border-indigo-100 text-xs font-black uppercase tracking-widest animate-pulse">
                    <Sparkles className="size-3.5" /> Generative AI Workspace
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                    Get Practice Questions & Study Insights In Seconds
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Enter a prompt, paste a URL, or upload your document to immediately generate practice quizzes, study cards, and summaries.
                  </p>
                </div>

                {/* Model Selector Pills */}
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-center">
                    Choose AI Model
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {(Object.keys(MODEL_CONFIGS) as ModelKey[]).map((key) => {
                      const cfg = MODEL_CONFIGS[key];
                      const isActive = activeModel === key;
                      const gradientMap: Record<ModelKey, string> = {
                        chatgpt: "from-emerald-500 to-teal-400",
                        claude: "from-orange-500 to-amber-400",
                        gemini: "from-blue-500 to-indigo-400",
                      };
                      const glowMap: Record<ModelKey, string> = {
                        chatgpt: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
                        claude: "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
                        gemini: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
                      };
                      const emojiMap: Record<ModelKey, string> = {
                        chatgpt: "🤖",
                        claude: "🧡",
                        gemini: "✨",
                      };
                      return (
                        <motion.button
                          key={key}
                          onClick={() => setActiveModel(key)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer font-bold text-sm ${
                            isActive
                              ? `bg-gradient-to-r ${gradientMap[key]} text-white border-transparent ${glowMap[key]}`
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg">{emojiMap[key]}</span>
                          <div className="text-left">
                            <div className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-white" : "text-slate-800"}`}>
                              {cfg.name}
                            </div>
                            <div className={`text-[9px] font-semibold ${isActive ? "text-white/80" : "text-slate-400"}`}>
                              {cfg.version}
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="model-active-dot"
                              className="size-2 rounded-full bg-white/80 ml-1"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Dashboard Core Box */}
                <div className="w-full bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_70px_-20px_rgba(139,92,246,0.15)] space-y-8">
                  
                  {/* Central Search/Prompt Bar */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Link URL or Prompt Input
                    </label>
                    <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-3 py-2 w-full">
                      {/* Left: Plus attachment button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ${attachedFile ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-stone-400"}`}
                      >
                        <Plus size={20} />
                      </button>


                      {/* Middle: Input field */}
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-800 dark:text-stone-200 px-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />

                      {/* Right: Mic + Send button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={startSpeechRecognition}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 ${
                            isListening
                              ? "text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 animate-pulse"
                              : "text-slate-400 dark:text-stone-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Mic size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSendMessage(e as any)}
                          disabled={!inputValue.trim() && !attachedFile}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shrink-0"
                        >
                          <ArrowUp size={18} />
                        </button>
                      </div>
                    </div>
                  </div>


                  {/* Downside: Upload Zone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Upload Source Document
                    </label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.ppt,.pptx"
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 bg-slate-50/50 hover:bg-violet-50/10 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3"
                    >
                      <div className="size-12 rounded-xl bg-violet-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                        <Plus className="size-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Click to upload file or drag documents here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                          PDFs, Word Docs, Slides, Text or Images
                        </p>
                      </div>
                    </div>

                    {/* Display Attached File Status */}
                    <AnimatePresence>
                      {attachedFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-3 p-3.5 bg-violet-50 border border-indigo-100 rounded-2xl flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                              <Paperclip size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[250px]">
                                {attachedFile.name}
                              </p>
                              <p className="text-[9px] text-indigo-600/80 font-black uppercase tracking-widest">
                                {(attachedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachedFile(null);
                            }}
                            className="p-2 hover:bg-indigo-100/50 text-indigo-600 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Works On / Format Selector Section */}
                <div className="space-y-4 text-center w-full max-w-3xl">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Select Output Format — Works on all learning materials:
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Click a format below — AI will structure its response accordingly
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { emoji: "🛝", name: "lecture slides" },
                      { emoji: "📜", name: "PDFs" },
                      { emoji: "📄", name: "Word documents" },
                      { emoji: "💪", name: "PowerPoints" },
                      { emoji: "🐊", name: "Google Docs and Slides" },
                      { emoji: "🕸️", name: "webpages" },
                      { emoji: "🎥", name: "YouTube videos" },
                      { emoji: "📖", name: "textbooks" },
                      { emoji: "🗒️", name: "notes" },
                      { emoji: "📑", name: "study guides" },
                      { emoji: "🔬", name: "research papers" }
                    ].map((item, idx) => {
                      const isSelected = selectedFormat === item.name;
                      return (
                        <motion.div
                          key={idx}
                          onClick={() => setSelectedFormat(item.name)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 shadow-sm border-2 ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                              : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/30"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 size-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-md"
                            >
                              <Check size={10} className="text-white" />
                            </motion.div>
                          )}
                          <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-base border transition-colors ${
                            isSelected ? "bg-indigo-600/10 border-indigo-300" : "bg-indigo-50 border-indigo-100"
                          }`}>
                            {item.emoji}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide text-left transition-colors ${
                            isSelected ? "text-indigo-700" : "text-slate-700"
                          }`}>
                            {item.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                  {selectedFormat && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mt-2"
                    >
                      ✅ Format: <span className="capitalize">{selectedFormat}</span> — AI will auto-structure output
                    </motion.p>
                  )}
                </div>

              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-10">
                {activeChat.messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-6 rounded-3xl ${
                        msg.sender === "user"
                          ? "bg-violet-50 border border-violet-200/80 text-slate-800 shadow-sm"
                          : "bg-slate-50 text-slate-900 border border-slate-100 shadow-sm"
                      }`}
                    >
                      {msg.fileName && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                          <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <Paperclip size={18} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                              {msg.fileName}
                            </p>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                              {msg.fileSize}
                            </p>
                          </div>
                        </div>
                      )}
                      <MarkdownMessage text={msg.text.replace(/\[File:.*?\]/, "").trim()} sender={msg.sender} />
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 text-slate-400 p-6 rounded-3xl border border-slate-100 flex items-center gap-3 shadow-sm">
                      <div className="size-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI is generating insights...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {activeChat && activeChat.messages.length > 0 && (
            <div className="px-6 pb-6 pt-3 max-w-3xl w-full mx-auto border-t border-slate-100 dark:border-white/5 space-y-3">

              {/* Model + Format indicator row */}
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(MODEL_CONFIGS) as ModelKey[]).map((key) => {
                  const cfg = MODEL_CONFIGS[key];
                  const isActive = activeModel === key;
                  const colorMap: Record<ModelKey, string> = {
                    chatgpt: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                    claude: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
                    gemini: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                  };
                  const textMap: Record<ModelKey, string> = {
                    chatgpt: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                    claude: "text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100",
                    gemini: "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100",
                  };
                  const emojiMap: Record<ModelKey, string> = { chatgpt: "🤖", claude: "🧡", gemini: "✨" };
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveModel(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? `${textMap[key]} border-2`
                          : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isActive && <span className={`size-1.5 rounded-full inline-block ${colorMap[key]}`} />}
                      <span>{emojiMap[key]}</span>
                      {cfg.name}
                    </button>
                  );
                })}
                <span className="text-slate-300">|</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider px-2 py-1 bg-indigo-50 rounded-full border border-indigo-200 capitalize">
                  📋 {selectedFormat}
                </span>
              </div>

              <AnimatePresence>
                {attachedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <Paperclip size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px]">
                          {attachedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {(attachedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="relative flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-3 py-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.ppt,.pptx"
                />
                
                {/* Left: Plus attachment button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ${attachedFile ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-stone-400"}`}
                >
                  <Plus size={20} />
                </button>

                {/* Middle: Input field */}
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isGenerating
                      ? t.ai_thinking
                      : attachedFile
                        ? t.ai_ask_file
                        : "Ask anything..."
                  }
                  disabled={isGenerating}
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-800 dark:text-stone-200 px-2"
                />

                {/* Right: Mic + Send */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={startSpeechRecognition}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 ${
                      isListening
                        ? "text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 animate-pulse"
                        : "text-slate-400 dark:text-stone-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || (!inputValue.trim() && !attachedFile)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shrink-0"
                  >
                    {isGenerating ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp size={18} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MarkdownMessage({ text, sender }: { text: string; sender?: "user" | "ai" }) {
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
          <FormattedText key={i} text={part} sender={sender} />
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
      .replace(/>/g, "&gt;");
    html = html.replace(
      /(\/\/.*)/g,
      '<span class="text-slate-500 dark:text-stone-500 font-normal italic">$1</span>',
    );
    const kw =
      /\b(const|let|var|function|return|import|export|from|class|await|async|interface|type|default|extends|new|try|catch|finally|if|else|for|while|do|switch|case|break)\b/g;
    html = html.replace(kw, '<span class="text-pink-500 font-bold">$1</span>');
    html = html.replace(
      /(["'`])([\s\S]*?)\1/g,
      '<span class="text-emerald-400 font-medium">"$2"</span>',
    );
    const hooks =
      /\b(useState|useEffect|useRef|useAuth|useNavigate|createFileRoute|onAuthStateChanged|getDoc|doc|setDoc|query|collection|addDoc|deleteDoc|toast|success|error|info)\b/g;
    html = html.replace(
      hooks,
      '<span class="text-sky-400 font-bold">$1</span>',
    );
    return <code dangerouslySetInnerHTML={{ __html: html }} />;
  };
  return (
    <div className="my-4 rounded-2xl bg-[#090909] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#141414] border-b border-slate-200 dark:border-white/5">
        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-stone-500 flex items-center gap-1.5">
          <Terminal size={12} className="text-emerald-500" />{" "}
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 hover:bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-slate-600 dark:text-stone-400 hover:text-slate-900"
        >
          {copied ? (
            <Check size={11} className="text-emerald-500" />
          ) : (
            <Copy size={11} />
          )}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-[12px] font-mono text-slate-200 dark:text-[#ececec] bg-black/40">
        {highlight(code)}
      </pre>
    </div>
  );
}

function FormattedText({ text, sender }: { text: string; sender?: "user" | "ai" }) {
  const lines = text.split("\n");
  const textColorClass = sender === "user" 
    ? "text-slate-800" 
    : "text-slate-700 dark:text-[#dcdcdc]";

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;
        if (line.startsWith("* ") || line.startsWith("- ")) {
          const content = line.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-4">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              <span className={`${textColorClass} text-[13px]`}>
                {renderInlineStyles(content, sender)}
              </span>
            </div>
          );
        }
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-4">
              <span className="text-emerald-500 font-bold text-xs shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <span className={`${textColorClass} text-[13px]`}>
                {renderInlineStyles(numMatch[2], sender)}
              </span>
            </div>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className={`text-sm font-black mt-4 mb-2 border-l-2 border-emerald-500 pl-2 ${
                sender === "user" ? "text-slate-800" : "text-slate-800 dark:text-white"
              }`}
            >
              {renderInlineStyles(line.slice(4), sender)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className={`text-base font-black mt-5 mb-2 ${
              sender === "user" ? "text-slate-900" : "text-slate-850 dark:text-white"
            }`}>
              {renderInlineStyles(line.slice(3), sender)}
            </h3>
          );
        }
        return (
          <p key={idx} className={`${textColorClass} text-[13px]`}>
            {renderInlineStyles(line, sender)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineStyles(text: string, sender?: "user" | "ai") {
  const boldParts: React.ReactNode[] = [];
  const splitBold = text.split(/(\*\*.*?\*\*)/g);
  const boldClass = sender === "user"
    ? "font-bold text-slate-900"
    : "font-bold text-slate-900 dark:text-white";

  splitBold.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      boldParts.push(
        <strong key={i} className={boldClass}>
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
              className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#252525] border border-slate-200 dark:border-white/5 rounded-md text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mx-0.5"
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
