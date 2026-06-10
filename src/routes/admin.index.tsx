import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Users,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Layers,
  ClipboardList,
} from "lucide-react";

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

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("is_super_admin");
    if (!isAdmin) {
      navigate({ to: "/login" });
      return;
    }
  }, [navigate]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-indigo-50/80 to-slate-50 border border-slate-200/80 rounded-2xl p-6 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <ShieldAlert className="size-3.5 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
                Active root command session
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Welcome to the <span className="text-indigo-600">Control Center</span>
            </h2>
            <p className="text-slate-600 max-w-2xl text-sm font-medium leading-relaxed">
              Easily review incoming student materials, manage custom course uploaders, tweak automated AI assistant neural path rules, or configure Monthly Meeting agenda presets.
            </p>
          </div>
        </div>
      </div>





      {/* Quick Management Links Area (The requested original modules) */}
      <section className="space-y-5">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Direct Quick-Management Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sidebarLinks
            .filter((link) => link.to !== "/admin")
            .map((m, i) => (
              <Link
                key={i}
                to={m.to as any}
                className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200 hover:border-indigo-500/40 rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-slate-50 border border-slate-200 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 rounded-xl">
                      <m.icon className="size-5.5" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                      <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                        Configure
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-md font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Navigate to setup dashboard controls, settings, logs and data records mapping.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Launch View
                  </span>
                  <ChevronRight className="size-4.5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
