import { createFileRoute, Link, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Users,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Zap,
  Bell,
  Cpu,
  Layers,
  ClipboardList,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const sidebarLinks = [
  {
    title: "System Dashboard",
    icon: Cpu,
    to: "/admin",
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

function AdminLayout() {
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("is_super_admin");
    if (!isAdmin) {
      navigate({
        to: "/login",
        search: { redirect: window.location.pathname, role: "admin" } as any,
      });
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("is_super_admin");
    navigate({
      to: "/login",
      search: { role: "admin" } as any,
    });
  };

  const isActive = (to: string) => {
    if (to === "/admin") {
      return loc.pathname === "/admin" || loc.pathname === "/admin/";
    }
    return loc.pathname.startsWith(to);
  };

  return (
    <div className="h-screen bg-[#F8FAFF] text-slate-800 font-sans antialiased flex flex-col md:flex-row overflow-hidden">
      {/* LEFT SIDEBAR - Persistent Light Theme Sidebar */}
      <aside className="w-full md:w-80 h-full bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-30">
        {/* Brand Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/50">
              <Zap className="size-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                SMART LEARN
              </h1>
              <span className="text-[10px] font-black text-indigo-600/70 tracking-widest uppercase">
                Control Hub
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">
              Root
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-8 space-y-2.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">
            Navigation Menu
          </p>
          {sidebarLinks.map((link, idx) => {
            const active = isActive(link.to);
            return (
              <Link
                key={idx}
                to={link.to as any}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/40 border border-indigo-500/20"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <link.icon
                    className={`size-5 transition-transform group-hover:scale-110 ${
                      active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                    }`}
                  />
                  <span>{link.title}</span>
                </div>
                {link.badge ? (
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                    active 
                      ? "bg-white/20 text-white border border-white/30" 
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}>
                    {link.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`size-4 opacity-0 group-hover:opacity-100 transition-all ${
                      active ? "text-white opacity-100" : "text-slate-400"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout card */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4.5">
            <div className="size-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-md">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-800 truncate leading-snug">
                Super Admin
              </h4>
              <p className="text-[10px] font-bold text-slate-400 truncate font-mono">
                root@smartlearn.internal
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-100 text-slate-500 hover:text-red-600 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Logout Session"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE - Persistent Light Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFF] h-full overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
            <span>Root Hub</span>
            <ChevronRight className="size-4 text-slate-300" />
            <span className="text-slate-800">Console Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                <Bell className="size-5 text-slate-500" />
                <span className="absolute top-1 right-1 size-2 bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
