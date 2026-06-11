import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
  Activity,
  Database,
  Settings,
  Zap,
  Globe,
  Bell,
  Cpu,
  Layers,
  Terminal,
  BarChart3,
  ClipboardList,
  LogOut,
  RefreshCw,
  Server,
  TrendingUp,
  Search,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Super Admin Command Center — SMART LEARNING" }],
  }),
  component: AdminDashboard,
});

const sidebarLinks = [
  {
    title: "System Dashboard",
    icon: Cpu,
    to: "/admin",
    active: true,
    badge: "Live",
  },
  {
    title: "Student Management",
    icon: Users,
    to: "/admin/student-management",
  },
  {
    title: "AI Tools Engine",
    icon: Sparkles,
    to: "/admin/ai-tools",
  },
  {
    title: "Teachers & Mentors",
    icon: GraduationCap,
    to: "/admin/teachers",
  },
  {
    title: "Enrollment Matrix",
    icon: Layers,
    to: "/admin/enrollments",
  },
  {
    title: "Meeting Agenda Presets",
    icon: ClipboardList,
    to: "/admin/meeting-presets",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // System Diagnostics / Terminal simulator state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System Root Access authenticated successfully.",
    "Initializing secure websocket listener...",
    "Database nodes connected: [US-East-Primary, IN-West-Secondary].",
    "Caching system templates (TanStack Route pre-split modules).",
    "Monitor active: 0.4ms latency.",
  ]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("is_super_admin");
    if (!isAdmin) {
      navigate({
        to: "/login",
        search: { redirect: "/admin", role: "admin" } as any,
      });
      return;
    }

    const fetchPending = async () => {
      try {
        const { collection, getDocs, query, where } = await import(
          "firebase/firestore"
        );
        const q = query(
          collection(db, "videos"),
          where("status", "==", "pending"),
        );
        const snapshot = await getDocs(q);
        setPendingCount(snapshot.docs.length);
      } catch (e) {
        console.error("Error fetching pending count:", e);
      }
    };

    fetchPending();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // Autoscroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("is_super_admin");
    navigate({
      to: "/login",
      search: { role: "admin" } as any,
    });
  };

  // Run System Diagnostic Simulation
  const runDiagnostic = () => {
    if (isDiagnosticRunning) return;
    setIsDiagnosticRunning(true);
    setTerminalLogs((prev) => [...prev, "> Starting comprehensive system audit..."]);

    const steps = [
      "Verifying Firebase connection & auth credentials...",
      "Analyzing content storage bucket allocations...",
      "Checking routing manifest splittings...",
      "Syncing static redirects config (Vercel Build API v3)...",
      "Diagnostic Complete: All nodes operating within optimal parameters. [OK]",
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, `[STATUS] ${step}`]);
        if (idx === steps.length - 1) {
          setIsDiagnosticRunning(false);
        }
      }, (idx + 1) * 1200);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col md:flex-row">
      {/* LEFT SIDEBAR - Modern Glassmorphic Dark Sidebar */}
      <aside className="w-full md:w-80 bg-slate-950/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-8 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <Zap className="size-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                SMART LEARN
              </h1>
              <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">
                Control Hub
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 border border-emerald-800/30 rounded-full">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
              Root
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-8 space-y-2.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">
            Navigation Menu
          </p>
          {sidebarLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.to as any}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group cursor-pointer ${
                link.active
                  ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/95 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <link.icon
                  className={`size-5 transition-transform group-hover:scale-110 ${
                    link.active ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                  }`}
                />
                <span>{link.title}</span>
              </div>
              {link.badge ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider rounded-md">
                  {link.badge}
                </span>
              ) : (
                <ChevronRight
                  className={`size-4 opacity-0 group-hover:opacity-100 transition-all ${
                    link.active ? "text-white opacity-100" : "text-slate-500"
                  }`}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User profile / Logout card */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-4.5">
            <div className="size-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-md">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white truncate leading-snug">
                Super Administrator
              </h4>
              <p className="text-[10px] font-bold text-slate-500 truncate font-mono">
                root@smartlearn.internal
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE - Clean Dark UI */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Top Control Bar */}
        <header className="h-20 bg-slate-950/40 border-b border-slate-800/80 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
            <span>Root Hub</span>
            <ChevronRight className="size-4 text-slate-600" />
            <span className="text-white">Console Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Clock */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                Current local time
              </span>
              <span className="text-sm font-bold text-white font-mono leading-none mt-1">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {/* Notification and Stats Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/60 transition-colors">
                <Bell className="size-5 text-slate-400" />
                <span className="absolute top-1 right-1 size-2 bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Scroll View */}
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          {/* Welcome Banner */}
          <div className="relative bg-gradient-to-r from-indigo-950/80 to-slate-950/90 border border-indigo-900/20 rounded-3xl p-8 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 border border-indigo-800/30 rounded-full">
                  <ShieldAlert className="size-3.5 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                    Active root command session
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Welcome to the <span className="text-indigo-400">Control Center</span>
                </h2>
                <p className="text-slate-400 max-w-2xl text-sm font-medium leading-relaxed">
                  Easily review incoming student materials, manage custom course uploaders, tweak automated AI assistant neural path rules, or configure Monthly Meeting agenda presets.
                </p>
              </div>
              <div className="shrink-0 flex gap-4">
                <button
                  onClick={runDiagnostic}
                  disabled={isDiagnosticRunning}
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`size-4 ${isDiagnosticRunning ? "animate-spin text-indigo-400" : ""}`} />
                  Run Audit
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Pending Reviews",
                val: pendingCount !== null ? `${pendingCount} Videos` : "Syncing...",
                desc: "Uploaded courses awaiting admin approval",
                icon: ClipboardList,
                color: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/20",
              },
              {
                title: "Uptime Health",
                val: "99.98%",
                desc: "Server clusters & nodes responsiveness",
                icon: Server,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                title: "Active Users",
                val: "12.8k Users",
                desc: "Combined students & mentors activity",
                icon: Users,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                title: "Admin Templates",
                val: "6 Committees",
                desc: "SMC, Sakhi Savitri, Safety, etc. agenda configurations",
                icon: Settings,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`p-6.5 rounded-2xl bg-slate-950/50 border flex items-start justify-between gap-4 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-950/70 ${card.bg}`}
              >
                <div className="space-y-3.5">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {card.val}
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-normal max-w-[180px]">
                    {card.desc}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl bg-slate-900 border border-slate-800 ${card.color}`}>
                  <card.icon className="size-6" />
                </div>
              </div>
            ))}
          </section>

          {/* Detailed Workspace Row (Terminal + Diagnostic Monitor) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Terminal Monitor */}
            <div className="lg:col-span-2 bg-slate-950/50 border border-slate-800 rounded-3xl p-6.5 flex flex-col h-[420px] shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400">
                    <Terminal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Live Console & Audit Feed
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      WebSocket Connection Secure
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTerminalLogs([])}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              {/* Console log list */}
              <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-850 rounded-2xl p-5 font-mono text-xs text-indigo-300 space-y-2 leading-relaxed custom-scrollbar">
                {terminalLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 uppercase text-[10px] font-black tracking-widest">
                    No active log history. Click audit to generate.
                  </div>
                ) : (
                  terminalLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600 select-none">[{i + 1}]</span>
                      <span className={log.includes("[STATUS]") ? "text-emerald-400" : log.includes("[ERROR]") ? "text-red-400" : ""}>
                        {log}
                      </span>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* Service Nodes monitor */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6.5 flex flex-col justify-between h-[420px] shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400">
                    <Database className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Infrastructure Nodes
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                      ALL NODES ONLINE
                    </p>
                  </div>
                </div>
                <div className="h-px bg-slate-800 my-4" />
              </div>

              <div className="flex-1 space-y-5 flex flex-col justify-center">
                {[
                  { name: "Auth Cluster Nodes", load: "12%", status: "online", icon: CheckCircle },
                  { name: "Firestore Realtime Sync", load: "0.4ms latency", status: "online", icon: CheckCircle },
                  { name: "Asset CDN (Storage)", load: "2.4 TB/5 TB limit", status: "online", icon: CheckCircle },
                  { name: "AI Agent Vector Router", load: "Active Uptime", status: "online", icon: CheckCircle },
                ].map((node, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-900 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <node.icon className="size-4.5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-slate-300">{node.name}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 font-mono">
                      {node.load}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Deploy Branch: <span className="font-mono text-white font-bold ml-1">main (Vercel static)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Management Links Area (The requested original modules) */}
          <section className="space-y-5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Direct Quick-Management Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sidebarLinks
                .filter((link) => link.to !== "/admin")
                .map((m, i) => (
                  <Link
                    key={i}
                    to={m.to as any}
                    className="group relative flex flex-col justify-between p-6 bg-slate-950/60 border border-slate-850 hover:border-indigo-500/40 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:bg-slate-950 cursor-pointer shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-slate-900 border border-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 rounded-xl">
                          <m.icon className="size-5.5" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                          <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                            Configure
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-md font-black text-white group-hover:text-indigo-400 transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                          Navigate to setup dashboard controls, settings, logs and data records mapping.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-800/80">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                        Launch View
                      </span>
                      <ChevronRight className="size-4.5 text-slate-600 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
