import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  Star,
  Layout,
  Target,
  HelpCircle,
  BookOpen,
  Award,
  Users,
  Utensils,
  TrendingUp,
  BarChart3,
  Users2,
  Activity,
  Book,
  ClipboardCheck,
  Notebook,
  Settings,
  Bell,
  Edit3,
  FileText,
  BarChart,
  FolderOpen,
  Folder,
  Calendar as CalendarIcon,
  GraduationCap,
  Trophy,
  Music,
  Palette,
  Microscope,
  Flag,
  Apple,
  Sparkles,
  RefreshCw,
  ClipboardList,
  Package,
  FileSpreadsheet,
  UserPlus,
  UserCheck,
  Database,
  ListOrdered,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

const MENU_ITEMS = [
  { icon: LayoutDashboard, labelKey: "teacher_dashboard", to: "/teacher" },
  {
    icon: CalendarIcon,
    labelKey: "timetable_teacher",
    to: "/teacher/timetable",
    subItems: [
      {
        labelKey: "addSubject",
        to: "/teacher/timetable/add-subject",
        icon: BookOpen,
      },
      {
        labelKey: "addTeacher",
        to: "/teacher/timetable/add-teacher",
        icon: UserPlus,
      },
      {
        labelKey: "assignClassSubject",
        to: "/teacher/timetable/assign-class-subject",
        icon: UserCheck,
      },
      {
        labelKey: "assignPeriod",
        to: "/teacher/timetable/assign-period",
        icon: UserCheck,
      },
      {
        labelKey: "classTimetable",
        to: "/teacher/timetable/class",
        icon: CalendarIcon,
      },
      {
        labelKey: "teachersTimetable",
        to: "/teacher/timetable/teacher",
        icon: CalendarIcon,
      },
      {
        labelKey: "allTimetable",
        to: "/teacher/timetable/all",
        icon: LayoutDashboard,
      },
    ],
  },
  { icon: Star, labelKey: "specialDay", to: "/teacher/modules/special-day" },
  { icon: Notebook, labelKey: "paripathNondvahi", to: "/teacher/modules/paripath-nondvahi" },
  {
    icon: Layout,
    labelKey: "templates",
    to: "/teacher/templates",
    subItems: [
      {
        labelKey: "birthdayWishes",
        to: "/teacher/templates/birthday",
        icon: Star,
      },
      {
        labelKey: "admissionWelcome",
        to: "/teacher/templates/admission",
        icon: GraduationCap,
      },
      { labelKey: "sportsDay", to: "/teacher/templates/sports", icon: Trophy },
      {
        labelKey: "culturalActivities",
        to: "/teacher/templates/cultural",
        icon: Music,
      },
      {
        labelKey: "annualFunction",
        to: "/teacher/templates/annual",
        icon: Sparkles,
      },
      {
        labelKey: "resultAchievement",
        to: "/teacher/templates/achievement",
        icon: Award,
      },
    ],
  },
  {
    icon: Target,
    labelKey: "planningQuestionBank",
    to: "/teacher/modules/annual-monthly-planning",
    subItems: [
      {
        labelKey: "planning",
        to: "/teacher/modules/annual-monthly-planning",
        icon: Target,
      },
      {
        labelKey: "questionBank",
        to: "/teacher/question-bank",
        icon: HelpCircle,
      },
    ],
  },
  { icon: BookOpen, labelKey: "homework", to: "/teacher/homework" },
  {
    icon: FileSpreadsheet,
    labelKey: "results",
    to: "/teacher/result",
    subItems: [
      {
        labelKey: "markRegistration",
        to: "/teacher/result",
        search: { tab: "marks-entry" } as any,
        icon: Edit3,
      },
      {
        labelKey: "progressSheet",
        to: "/teacher/result",
        search: { tab: "progress-sheets" } as any,
        icon: BarChart,
      },
      {
        labelKey: "combinedResult",
        to: "/teacher/result",
        search: { tab: "combined-results" } as any,
        icon: BarChart,
      },
      {
        labelKey: "subjectWiseResult",
        to: "/teacher/result",
        search: { tab: "subject-wise" } as any,
        icon: BarChart,
      },
      {
        labelKey: "gradeWiseResult",
        to: "/teacher/result",
        search: { tab: "grade-wise" } as any,
        icon: BarChart,
      },
      {
        labelKey: "dailyRegister",
        to: "/teacher/result",
        search: { tab: "daily-register" } as any,
        icon: CalendarIcon,
      },
      {
        labelKey: "result5th8th",
        to: "/teacher/result",
        search: { tab: "result-5th-8th" } as any,
        icon: BarChart,
      },

      {
        labelKey: "viewReport",
        to: "/teacher/result",
        search: { tab: "view-report" } as any,
        icon: BarChart,
      },
      {
        labelKey: "promoteStudents",
        to: "/teacher/result",
        search: { tab: "promote-students" } as any,
        icon: RefreshCw,
      },
      {
        labelKey: "result9th10th",
        to: "/teacher/result",
        search: { tab: "result-9th-10th" } as any,
        icon: BarChart,
      },
    ],
  },

  { icon: Users, labelKey: "monthlyMeeting", to: "/teacher/meeting" },
  {
    icon: Utensils,
    labelKey: "mdm",
    to: "/teacher/mdm",
    subItems: [
      {
        labelKey: "mdm_quantity",
        to: "/teacher/mdm",
        search: { tab: "quantity" } as any,
        icon: Activity,
      },
      {
        labelKey: "mdm_menu",
        to: "/teacher/mdm",
        search: { tab: "menu" } as any,
        icon: ClipboardList,
      },
      {
        labelKey: "mdm_incoming",
        to: "/teacher/mdm",
        search: { tab: "incoming" } as any,
        icon: Package,
      },
      {
        labelKey: "mdm_daily_reg",
        to: "/teacher/mdm",
        search: { tab: "daily-reg" } as any,
        icon: CalendarIcon,
      },
      {
        labelKey: "mdm_stock_now",
        to: "/teacher/mdm",
        search: { tab: "stock" } as any,
        icon: Package,
      },
      {
        labelKey: "mdm_demand",
        to: "/teacher/mdm",
        search: { tab: "demand" } as any,
        icon: FileText,
      },
      {
        labelKey: "mdm_annual_report",
        to: "/teacher/mdm",
        search: { tab: "annual-report" } as any,
        icon: FileSpreadsheet,
      },
      {
        labelKey: "mdm_monthly_report",
        to: "/teacher/mdm",
        search: { tab: "monthly-report" } as any,
        icon: TrendingUp,
      },
    ],
  },
  { icon: FolderOpen, labelKey: "statsTeacher", to: "/teacher/stats-teacher" },
  {
    icon: GraduationCap,
    labelKey: "student_section",
    to: "/teacher/stats-student",
    subItems: [
      {
        labelKey: "new_students",
        to: "/teacher/stats-student",
        icon: UserPlus,
      },
    ],
  },
  { icon: ClipboardCheck, labelKey: "sqaf", to: "/teacher/modules/sqaf-evaluation" },
  {
    icon: Notebook,
    labelKey: "teachingRecord",
    to: "/teacher/modules/teaching-record-notebook",
  },
] as const;

export function TeacherSidebar() {
  const loc = useLocation();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang];
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-teacher-sidebar", handleToggle);
    return () =>
      window.removeEventListener("toggle-teacher-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const activeMenu = MENU_ITEMS.find((item) =>
      (item as any).subItems?.some((sub: any) =>
        loc.pathname.startsWith(sub.to),
      ),
    );
    if (activeMenu) {
      const labelKey = activeMenu.labelKey;
      if (!openMenus.includes(labelKey)) {
        setOpenMenus((prev) => [...prev, labelKey]);
      }
    }
  }, [loc.pathname]);

  const toggleMenu = (labelKey: string) => {
    setOpenMenus((prev) =>
      prev.includes(labelKey)
        ? prev.filter((m) => m !== labelKey)
        : [...prev, labelKey],
    );
  };

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
            const hasSubItems =
              (item as any).subItems && (item as any).subItems.length > 0;
            const labelKey = (item as any).labelKey;
            const isOpenMenu = openMenus.includes(labelKey);

            if (hasSubItems) {
              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(labelKey)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-sm bg-gradient-to-r from-[#88b1e4] to-[#4886d3] text-[#0a192f]"
                  >
                    <div className="flex items-center justify-center text-[#0a192f]">
                      <item.icon className="size-6" strokeWidth={2} />
                    </div>
                    <span>{t[labelKey as keyof typeof t]}</span>
                  </button>

                  <AnimatePresence>
                    {isOpenMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2 mt-2"
                      >
                        {(item as any).subItems?.map(
                          (sub: any, sidx: number) => (
                            <Link
                              key={sidx}
                              to={sub.to}
                              search={(sub as any).search}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[14px] text-[#0c2a52] bg-[#cce0f5] border border-[#a6c7ec] hover:bg-[#b5d3f2] transition-all"
                              activeProps={{
                                style: {
                                  backgroundColor: "#88b1e4",
                                  borderColor: "#4886d3",
                                  color: "#0a192f",
                                  fontWeight: "bold",
                                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                }
                              }}
                            >
                              <div className="flex items-center justify-center text-[#0c2a52]">
                                {sub.icon && (
                                  <sub.icon
                                    className="size-5"
                                    strokeWidth={2.5}
                                  />
                                )}
                              </div>
                              {t[sub.labelKey as keyof typeof t]}
                            </Link>
                          ),
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={idx}
                to={item.to as any}
                activeOptions={{ exact: true }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all hover:opacity-90 group shadow-sm bg-gradient-to-r from-[#88b1e4] to-[#4886d3] text-[#0a192f]"
                activeProps={{
                  style: {
                    boxShadow: "0 4px 12px rgba(72, 134, 211, 0.4)",
                  },
                }}
              >
                <div className="flex items-center justify-center text-[#0a192f] group-hover:scale-110 transition-transform flex-shrink-0">
                  <item.icon className="size-6" strokeWidth={2} />
                </div>
                <span className="transition-colors truncate">
                  {t[labelKey as keyof typeof t]}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
