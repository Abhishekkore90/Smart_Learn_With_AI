import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Star,
  GraduationCap,
  Settings,
  MessageSquare,
  Bell,
  User,
  FileText,
  Calendar as CalendarIcon,
  Trophy,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

const MENU_ITEMS = [
  { icon: LayoutDashboard, labelKey: "dashboard", to: "/student" },
  { icon: GraduationCap, labelKey: "courses", to: "/courses" },

  { icon: BookOpen, labelKey: "homework", to: "/student/homework" },
  { icon: FileText, labelKey: "results", to: "/student/result" },
  { icon: HelpCircle, labelKey: "questionBank", to: "/student/question-bank" },
  { icon: CalendarIcon, labelKey: "timetable", to: "/student/timetable" },
  { icon: Trophy, labelKey: "achievements", to: "/" },
  { icon: MessageSquare, labelKey: "notices", to: "/student/notices" },
  { icon: User, labelKey: "profile", to: "/profile" },
  { icon: Settings, labelKey: "settings", to: "/" },
] as const;

export function StudentSidebar() {
  const loc = useLocation();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang];
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-student-sidebar", handleToggle);
    return () =>
      window.removeEventListener("toggle-student-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [loc.pathname]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`w-64 bg-white h-[calc(100vh-4rem)] fixed left-0 top-16 border-r border-slate-200 z-40 overflow-y-auto custom-scrollbar pt-4 pb-10 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="p-4 space-y-2">
          {MENU_ITEMS.map((item, idx) => {
            return (
              <Link
                key={idx}
                to={item.to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 group text-white shadow-sm"
                style={{ backgroundColor: "#6FA0D8" }}
                activeProps={{
                  style: {
                    backgroundColor: "#6FA0D8",
                    boxShadow: "0 4px 12px rgba(111, 160, 216, 0.3)",
                  },
                }}
              >
                <div className="p-1.5 rounded-lg bg-white/20 group-hover:scale-110 transition-transform flex-shrink-0">
                  <item.icon className="size-4 text-white" />
                </div>
                <span className="transition-colors truncate">
                  {t[item.labelKey as keyof typeof t]}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
