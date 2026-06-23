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
  Mic,
  AudioLines,
} from "lucide-react";
import { showToast as toast } from "@/lib/custom-toast";

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
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    avatar: "bg-emerald-600 border-emerald-500 text-white",
    dot: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
    accent: "focus-within:border-emerald-500/30",
    gradient: "from-emerald-600 to-teal-500",
  },
  gpt4: {
    name: "SMART LEARNING GPT-4",
    version: "Intelligence Node",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    avatar: "bg-violet-600 border-violet-500 text-white",
    dot: "bg-violet-500 shadow-[0_0_10px_#8b5cf6]",
    accent: "focus-within:border-violet-500/30",
    gradient: "from-violet-600 to-indigo-500",
  },
  sora: {
    name: "Sora Media AI",
    version: "Motion Node v2",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
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
  const [isDark, setIsDark] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelKey>("gpt4");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    simulateAIResponse(
      messageText,
      currentChatId,
      currentFile?.name,
      currentFile ? (currentFile.size / 1024).toFixed(1) + " KB" : undefined
    );
  };

  const simulateAIResponse = (userText: string, chatId: string, fileName?: string, fileSize?: string) => {
    setIsGenerating(true);
    
    // Check if userText contains a URL
    const isUrl = userText.match(/https?:\/\/[^\s]+/);
    
    let response = "";
    
    if (lang === "en") {
      response = `### 🧠 Generative AI Workspace Response\n\n`;
      if (isUrl) {
        response += `🌐 **Fetched URL Context:** \`${isUrl[0]}\`\n`;
      }
      if (fileName) {
        response += `📁 **Analyzed File:** \`${fileName}\` (${fileSize})\n`;
      }
      response += `💬 **User Input Prompt:** *"${userText.replace(/\[File:.*?\]/, "").trim() || "Analyze context"}"*\n\n---\n\n`;
      response += `### 📋 Generated Study Materials & Practice Questions\n\n`;
      response += `Based on the combined resources and prompt you provided, I have synthesized the key insights and prepared practice questions:\n\n`;
      response += `#### 1. Core Concepts & Summary\n`;
      response += `The source file and instructions focus on optimizing study processes, breaking down complex theories into practical application steps, and reinforcing retention.\n\n`;
      response += `#### 2. Key Takeaways\n`;
      response += `- **Theory & Concept:** Understanding the core definitions is the first step to mastering the material.\n`;
      response += `- **Active Recall:** Generating custom questions allows students to test their memory and close knowledge gaps.\n`;
      response += `- **Real-world Application:** Combining prompt contexts with uploaded PDFs/Word files yields tailored summaries.\n\n`;
      response += `#### 3. Custom Practice Questions\n`;
      response += `- ❓ **Conceptual:** Explain the central topic of the uploaded document in two sentences.\n`;
      response += `- ❓ **Procedural:** What are the key steps required to implement the ideas mentioned in the prompt?\n`;
      response += `- ❓ **Critical Thinking:** Contrast the details fetched from the link with standard textbook guidelines.\n\n`;
      response += `*Feel free to chat further or attach more files to continue generating study resources!*`;
    } else if (lang === "mr") {
      response = `### 🧠 जनरेटिव्ह एआय वर्कस्पेस विश्लेषण\n\n`;
      if (isUrl) {
        response += `🌐 **माहिती घेतलेली लिंक:** \`${isUrl[0]}\`\n`;
      }
      if (fileName) {
        response += `📁 **वापरलेली फाईल:** \`${fileName}\` (${fileSize})\n`;
      }
      response += `💬 **तुमचा प्रश्न:** *"${userText.replace(/\[File:.*?\]/, "").trim() || "फाईल विश्लेषण"}"*\n\n---\n\n`;
      response += `### 📋 अभ्यास साहित्य आणि सराव प्रश्न\n\n`;
      response += `आपण दिलेल्या संदर्भ माहितीच्या आधारे खालील महत्त्वाचे मुद्दे तयार केले आहेत:\n\n`;
      response += `#### १. मुख्य सारांश\n`;
      response += `दस्तऐवजातील संकल्पना आणि डेटाचे विश्लेषण करून एआय ने महत्त्वाचे शिक्षण उद्दिष्टे स्पष्ट केली आहेत.\n\n`;
      response += `#### २. सराव प्रश्न\n`;
      response += `- ❓ **प्रश्न १:** प्राप्त दस्तऐवजातील मुख्य विषयाचा सारांश स्पष्ट करा.\n`;
      response += `- ❓ **प्रश्न २:** या मधील कार्यपद्धतीची अंमलबजावणी कशी करावी?\n`;
      response += `- ❓ **प्रश्न ३:** दिलेल्या माहितीचे महत्त्व काय आहे?\n\n`;
      response += `*अधिक माहितीसाठी खाली पुन्हा टाईप करा किंवा नवीन फाईल जोडा!*`;
    } else {
      response = `### 🧠 जनरेटिव एआई वर्कस्पेस विश्लेषण\n\n`;
      if (isUrl) {
        response += `🌐 **विश्लेषण लिंक:** \`${isUrl[0]}\`\n`;
      }
      if (fileName) {
        response += `📁 **फ़ाइल नाम:** \`${fileName}\` (${fileSize})\n`;
      }
      response += `💬 **आपका प्रश्न:** *"${userText.replace(/\[File:.*?\]/, "").trim() || "फ़ाइल विश्लेषण"}"*\n\n---\n\n`;
      response += `### 📋 अध्ययन सामग्री और अभ्यास प्रश्न\n\n`;
      response += `आपके द्वारा प्रदान किए गए संदर्भों के आधार पर तैयार की गई जानकारी:\n\n`;
      response += `#### १. मुख्य सारांश\n`;
      response += `दस्तावेज़ और संकेतों के आधार पर महत्वपूर्ण विवरणों का सारांश तैयार किया गया है।\n\n`;
      response += `#### २. अभ्यास प्रश्न\n`;
      response += `- ❓ **प्रश्न १:** इस अध्ययन सामग्री के मुख्य सिद्धांतों की व्याख्या करें।\n`;
      response += `- ❓ **प्रश्न २:** पूछे गए प्रश्नों के व्यावहारिक समाधान क्या हैं?\n`;
      response += `- ❓ **प्रश्न ३:** इस विषय पर अपने विचार स्पष्ट करें।\n\n`;
      response += `*आगे बातचीत जारी रखने के लिए नीचे पुनः लिखें या नई फ़ाइल संलग्न करें!*`;
    }

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
    <div className={isDark ? "dark" : ""}>
      <div className="h-screen w-full flex bg-white dark:bg-[#0d0d0d] text-slate-900 dark:text-[#ececec] font-sans overflow-hidden">
        
        {/* Left Sidebar Panel - Desktop */}
        <aside className="w-72 border-r border-slate-100 dark:border-white/5 bg-[#fafafa] dark:bg-[#121212] flex flex-col h-full shrink-0 hidden md:flex p-5">
          {/* New Search Button */}
          <button
            onClick={() => {
              setActiveChatId("");
              setAttachedFile(null);
              setInputValue("");
            }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> {lang === "mr" ? "नवीन शोध" : "New Search"}
          </button>
          
          <div className="h-px bg-slate-100 dark:bg-white/5 my-4 shrink-0" />
          
          {/* Scrollable Search History */}
          <div className="flex-1 overflow-y-auto space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              {lang === "mr" ? "मागील शोध" : "Search History"}
            </p>
            {chats.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-slate-400 font-medium italic">
                {lang === "mr" ? "कोणताही इतिहास नाही" : "No search history"}
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
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
        </aside>

        {/* Mobile Sidebar overlay backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#121212] z-50 p-5 flex flex-col h-full shadow-2xl border-r border-slate-100 dark:border-white/5 md:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-xs uppercase tracking-widest text-slate-400">
                    {lang === "mr" ? "मागील शोध" : "Search History"}
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500"
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
                          className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-rose-500 transition-all shrink-0"
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
                onClick={() => navigate({ to: "/admin" })}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Menu Toggle for Mobile Sidebar */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl md:hidden text-slate-600 dark:text-stone-400 transition-colors"
              >
                <Menu size={20} />
              </button>

              <span className="font-black tracking-tighter text-lg uppercase pl-2">
                {t.ai_workspace_header}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-700"
              >
                {isDark ? <Zap size={18} /> : <Settings size={18} />}
              </button>
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

                      {/* Right: Mic button */}
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

                {/* Works On Section */}
                <div className="space-y-6 text-center w-full max-w-3xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Works on all learning materials:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-slate-50 border border-slate-100/80 rounded-2xl flex items-center gap-3 hover:border-indigo-100/50 hover:bg-indigo-50/10 transition-all duration-300 shadow-sm"
                      >
                        <div className="size-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-base">
                          {item.emoji}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide text-left">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
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
                      className={`max-w-[80%] p-6 rounded-3xl ${msg.sender === "user" ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-900 border border-slate-100 shadow-sm"}`}
                    >
                      {msg.fileName && (
                        <div className="flex items-center gap-3 mb-3 p-3 bg-white/10 rounded-2xl border border-white/10">
                          <div className="size-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                            <Paperclip size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold truncate max-w-[150px]">
                              {msg.fileName}
                            </p>
                            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
                              {msg.fileSize}
                            </p>
                          </div>
                        </div>
                      )}
                      <MarkdownMessage text={msg.text} />
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
            <div className="p-6 max-w-3xl w-full mx-auto border-t border-slate-100 dark:border-white/5">
              <AnimatePresence>
                {attachedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4 p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-soft"
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

                {/* Right: Mic button */}
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
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
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
            <div key={idx} className="flex items-start gap-2.5 pl-4">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              <span className="text-slate-700 dark:text-[#dcdcdc] text-[13px]">
                {renderInlineStyles(content)}
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
              <span className="text-slate-700 dark:text-[#dcdcdc] text-[13px]">
                {renderInlineStyles(numMatch[2])}
              </span>
            </div>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-sm font-black text-slate-800 dark:text-white mt-4 mb-2 border-l-2 border-emerald-500 pl-2"
            >
              {renderInlineStyles(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-black text-slate-800 dark:text-white mt-5 mb-2">
              {renderInlineStyles(line.slice(3))}
            </h3>
          );
        }
        return (
          <p key={idx} className="text-slate-700 dark:text-[#dcdcdc] text-[13px]">
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
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
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
