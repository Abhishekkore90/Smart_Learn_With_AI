import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useLocation, Link } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Calendar, Star, GraduationCap, Trophy, Music, Sparkles, Award, Layout, Target, HelpCircle, Edit3, BarChart, RefreshCw, FileSpreadsheet, Users, Activity, ClipboardList, Package, FileText, Utensils, FolderOpen, Folder, Book, ClipboardCheck, Notebook, Menu, Globe, ChevronDown, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { b as useLanguage, u as useAuth, a as auth } from "./router-BCVN4cfk.js";
import { D as DICTIONARY } from "./translations-RzKVqU65.js";
import { toast } from "sonner";
const MENU_ITEMS = [
  { icon: LayoutDashboard, labelKey: "teacher_dashboard", to: "/teacher" },
  {
    icon: Calendar,
    labelKey: "timetable_teacher",
    to: "/teacher/timetable",
    subItems: [
      {
        labelKey: "class1",
        to: "/teacher/timetable/class",
        search: { class: "1st" },
        icon: BookOpen
      },
      {
        labelKey: "class2",
        to: "/teacher/timetable/class",
        search: { class: "2nd" },
        icon: BookOpen
      },
      {
        labelKey: "class3",
        to: "/teacher/timetable/class",
        search: { class: "3rd" },
        icon: BookOpen
      },
      {
        labelKey: "class4",
        to: "/teacher/timetable/class",
        search: { class: "4th" },
        icon: BookOpen
      },
      {
        labelKey: "class5",
        to: "/teacher/timetable/class",
        search: { class: "5th" },
        icon: BookOpen
      },
      {
        labelKey: "class6",
        to: "/teacher/timetable/class",
        search: { class: "6th" },
        icon: BookOpen
      },
      {
        labelKey: "class7",
        to: "/teacher/timetable/class",
        search: { class: "7th" },
        icon: BookOpen
      }
    ]
  },
  { icon: Star, labelKey: "specialDay", to: "/teacher/modules/special-day" },
  {
    icon: Layout,
    labelKey: "templates",
    to: "/teacher/templates",
    subItems: [
      {
        labelKey: "birthdayWishes",
        to: "/teacher/templates/birthday",
        icon: Star
      },
      {
        labelKey: "admissionWelcome",
        to: "/teacher/templates/admission",
        icon: GraduationCap
      },
      { labelKey: "sportsDay", to: "/teacher/templates/sports", icon: Trophy },
      {
        labelKey: "culturalActivities",
        to: "/teacher/templates/cultural",
        icon: Music
      },
      {
        labelKey: "annualFunction",
        to: "/teacher/templates/annual",
        icon: Sparkles
      },
      {
        labelKey: "resultAchievement",
        to: "/teacher/templates/achievement",
        icon: Award
      }
    ]
  },
  { icon: Target, labelKey: "planning", to: "/teacher/modules/annual-monthly-planning" },
  { icon: HelpCircle, labelKey: "questionBank", to: "/teacher/question-bank" },
  { icon: BookOpen, labelKey: "homework", to: "/teacher/homework" },
  {
    icon: FileSpreadsheet,
    labelKey: "results",
    to: "/teacher/result",
    subItems: [
      {
        labelKey: "markRegistration",
        to: "/teacher/result",
        search: { tab: "marks-entry" },
        icon: Edit3
      },
      {
        labelKey: "progressSheet",
        to: "/teacher/result",
        search: { tab: "progress-sheets" },
        icon: BarChart
      },
      {
        labelKey: "combinedResult",
        to: "/teacher/result",
        search: { tab: "combined-results" },
        icon: BarChart
      },
      {
        labelKey: "subjectWiseResult",
        to: "/teacher/result",
        search: { tab: "subject-wise" },
        icon: BarChart
      },
      {
        labelKey: "gradeWiseResult",
        to: "/teacher/result",
        search: { tab: "grade-wise" },
        icon: BarChart
      },
      {
        labelKey: "dailyRegister",
        to: "/teacher/result",
        search: { tab: "daily-register" },
        icon: Calendar
      },
      {
        labelKey: "result5th8th",
        to: "/teacher/result",
        search: { tab: "board-results" },
        icon: BarChart
      },
      {
        labelKey: "sscResult",
        to: "/teacher/result",
        search: { tab: "ssc-result" },
        icon: BarChart
      },
      {
        labelKey: "hscResult",
        to: "/teacher/result",
        search: { tab: "hsc-result" },
        icon: BarChart
      },
      {
        labelKey: "viewReport",
        to: "/teacher/result",
        search: { tab: "view-report" },
        icon: BarChart
      },
      {
        labelKey: "promoteStudents",
        to: "/teacher/result",
        search: { tab: "promote-students" },
        icon: RefreshCw
      },
      {
        labelKey: "result9th10th",
        to: "/teacher/result",
        search: { tab: "result-9th-10th" },
        icon: BarChart
      }
    ]
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
        search: { tab: "quantity" },
        icon: Activity
      },
      {
        labelKey: "mdm_menu",
        to: "/teacher/mdm",
        search: { tab: "menu" },
        icon: ClipboardList
      },
      {
        labelKey: "mdm_incoming",
        to: "/teacher/mdm",
        search: { tab: "incoming" },
        icon: Package
      },
      {
        labelKey: "mdm_daily_reg",
        to: "/teacher/mdm",
        search: { tab: "daily-reg" },
        icon: Calendar
      },
      {
        labelKey: "mdm_stock_now",
        to: "/teacher/mdm",
        search: { tab: "stock" },
        icon: Package
      },
      {
        labelKey: "mdm_demand",
        to: "/teacher/mdm",
        search: { tab: "demand" },
        icon: FileText
      }
    ]
  },
  { icon: FolderOpen, labelKey: "statsTeacher", to: "/teacher/modules/teacher-statistics" },
  { icon: Folder, labelKey: "statsStudent", to: "/teacher/modules/student-statistics" },
  { icon: Activity, labelKey: "dailyActivity", to: "/teacher/modules/daily-activity-record-book" },
  { icon: Target, labelKey: "conceptMapping", to: "/teacher/concept-mapping" },
  { icon: Book, labelKey: "recordBook", to: "/teacher/modules/daily-activity-record-book" },
  { icon: ClipboardCheck, labelKey: "sqaf", to: "/teacher/sqaf" },
  {
    icon: Notebook,
    labelKey: "teachingRecord",
    to: "/teacher/teaching-record"
  }
];
function TeacherSidebar() {
  const loc = useLocation();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang];
  const [openMenus, setOpenMenus] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleToggle = () => {
      console.log("TeacherSidebar received toggle-teacher-sidebar event");
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("toggle-teacher-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-teacher-sidebar", handleToggle);
  }, []);
  useEffect(() => {
    setIsOpen(false);
  }, [loc.pathname]);
  useEffect(() => {
    const activeMenu = MENU_ITEMS.find(
      (item) => item.subItems?.some(
        (sub) => loc.pathname.startsWith(sub.to)
      )
    );
    if (activeMenu) {
      const labelKey = activeMenu.labelKey;
      if (!openMenus.includes(labelKey)) {
        setOpenMenus((prev) => [...prev, labelKey]);
      }
    }
  }, [loc.pathname]);
  const toggleMenu = (labelKey) => {
    setOpenMenus(
      (prev) => prev.includes(labelKey) ? prev.filter((m) => m !== labelKey) : [...prev, labelKey]
    );
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: () => setIsOpen(false),
        className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
      }
    ) }),
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `w-64 bg-white h-[calc(100vh-4rem)] fixed left-0 top-16 border-r border-slate-200 z-40 overflow-y-auto custom-scrollbar pt-4 pb-10 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`,
        children: /* @__PURE__ */ jsx("nav", { className: "p-4 space-y-2", children: MENU_ITEMS.map((item, idx) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const labelKey = item.labelKey;
          const isOpenMenu = openMenus.includes(labelKey);
          const isMenuCurrentlyActive = (() => {
            if (isOpenMenu) return true;
            return item.subItems?.some((sub) => {
              if (sub.search) {
                return loc.pathname === sub.to && loc.search.tab === sub.search.tab;
              }
              return loc.pathname === sub.to;
            });
          })();
          if (hasSubItems) {
            return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => toggleMenu(labelKey),
                  className: `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-sm ${isMenuCurrentlyActive ? "bg-gradient-to-r from-[#70a4e3] to-[#397ad0] text-[#051329] border border-[#3072c4]" : "bg-[#d3e5f8] hover:bg-[#c1daef] text-[#082245] border border-[#adcbea] hover:border-[#96c1ea]"}`,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center text-current", children: /* @__PURE__ */ jsx(item.icon, { className: "size-6", strokeWidth: 2 }) }),
                    /* @__PURE__ */ jsx("span", { children: t[labelKey] })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(AnimatePresence, { children: isOpenMenu && /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { height: 0, opacity: 0 },
                  animate: { height: "auto", opacity: 1 },
                  exit: { height: 0, opacity: 0 },
                  className: "overflow-hidden space-y-2 mt-2",
                  children: item.subItems?.map(
                    (sub, sidx) => /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: sub.to,
                        search: sub.search,
                        className: "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[14px] text-[#082245] bg-[#c2d7ed] border border-[#9dc3ea] hover:bg-[#b3cdf0] transition-all",
                        activeProps: {
                          style: {
                            backgroundColor: "#397ad0",
                            borderColor: "#205da8",
                            color: "#ffffff",
                            fontWeight: "bold",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                          }
                        },
                        children: [
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center text-current", children: sub.icon && /* @__PURE__ */ jsx(
                            sub.icon,
                            {
                              className: "size-5",
                              strokeWidth: 2.5
                            }
                          ) }),
                          t[sub.labelKey]
                        ]
                      },
                      sidx
                    )
                  )
                }
              ) })
            ] }, idx);
          }
          const isLinkActive = loc.pathname === item.to;
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: item.to,
              activeOptions: { exact: true },
              className: `flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all hover:opacity-90 group shadow-sm ${isLinkActive ? "bg-gradient-to-r from-[#70a4e3] to-[#397ad0] text-[#051329] border border-[#3072c4]" : "bg-[#d3e5f8] hover:bg-[#c1daef] text-[#082245] border border-[#adcbea] hover:border-[#96c1ea]"}`,
              activeProps: {
                style: {
                  boxShadow: "0 4px 12px rgba(72, 134, 211, 0.4)"
                }
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center text-current group-hover:scale-110 transition-transform flex-shrink-0", children: /* @__PURE__ */ jsx(item.icon, { className: "size-6", strokeWidth: 2 }) }),
                /* @__PURE__ */ jsx("span", { className: "transition-colors truncate", children: t[labelKey] })
              ]
            },
            idx
          );
        }) })
      }
    )
  ] });
}
function TeacherHeader() {
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = DICTIONARY[lang];
  const [langOpen, setLangOpen] = useState(false);
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success(t.success || "Signed out successfully");
    } catch (error) {
      toast.error(t.error || "Failed to sign out");
    }
  };
  return /* @__PURE__ */ jsxs("header", { className: "bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 text-slate-800 h-16 fixed top-0 left-0 right-0 z-[60] px-4 md:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.dispatchEvent(new CustomEvent("toggle-teacher-sidebar")),
          className: "lg:hidden size-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-95 shadow-sm",
          children: /* @__PURE__ */ jsx(Menu, { className: "size-5" })
        }
      ),
      /* @__PURE__ */ jsxs(Link, { to: "/teacher", className: "flex items-center gap-3 group", children: [
        /* @__PURE__ */ jsx("div", { className: "size-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border border-white/50 shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300", children: /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "size-6 text-white drop-shadow-md",
            viewBox: "0 0 100 100",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: "50",
                  cy: "50",
                  r: "46",
                  fill: "transparent",
                  stroke: "currentColor",
                  strokeWidth: "8"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M50 22C34.5 22 28 32.5 35 44C40.5 53 59.5 47 65 56C72 67.5 65.5 78 50 78",
                  stroke: "currentColor",
                  strokeWidth: "12",
                  strokeLinecap: "round",
                  fill: "none"
                }
              ),
              /* @__PURE__ */ jsx("circle", { cx: "35", cy: "35", r: "6", fill: "currentColor" }),
              /* @__PURE__ */ jsx("circle", { cx: "65", cy: "65", r: "6", fill: "currentColor" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "font-extrabold tracking-tight hidden sm:block uppercase text-[14px] md:text-[16px] text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-poppins drop-shadow-sm leading-tight", children: t.teacher_section || "TEACHER SECTION" }),
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block leading-none mt-0.5", children: "Dashboard" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative ml-1 hidden sm:block", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setLangOpen(!langOpen),
            className: `flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all border shadow-sm duration-300 ${langOpen ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 hover:bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"}`,
            children: [
              /* @__PURE__ */ jsx(Globe, { className: "size-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest hidden lg:inline", children: lang === "en" ? "EN" : "MR" }),
              /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  className: `size-3 transition-transform duration-300 ${langOpen ? "rotate-180" : ""}`
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { children: langOpen && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 10, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 10, scale: 0.95 },
            className: "absolute top-full right-0 mt-2 p-1.5 rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 min-w-[120px] flex flex-col gap-1 z-50 overflow-hidden text-slate-800",
            children: [
              { code: "en", label: "English", sub: "Global" },
              { code: "mr", label: "मराठी", sub: "महाराष्ट्र" }
            ].map((l) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setLang(l.code);
                  setLangOpen(false);
                },
                className: `px-3 py-2 text-left rounded-xl transition-all flex flex-col group ${lang === l.code ? "bg-indigo-50/80 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs group-hover:translate-x-1 transition-transform", children: l.label }),
                  /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest opacity-40", children: l.sub })
                ]
              },
              l.code
            ))
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-slate-200 mx-1 hidden sm:block" }),
      /* @__PURE__ */ jsxs(Link, { to: "/teacher/settings", className: "flex items-center gap-3 pl-1 hover:opacity-85 active:scale-95 transition-all cursor-pointer", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right hidden md:block", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-800 leading-none", children: user?.displayName || "Teacher" }),
          /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black uppercase tracking-widest text-indigo-500 mt-1", children: "Educator" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold shadow-inner border border-slate-200/60 overflow-hidden relative group", children: [
          user?.photoURL ? /* @__PURE__ */ jsx(
            "img",
            {
              src: user.photoURL,
              alt: "Profile",
              className: "size-full object-cover group-hover:scale-110 transition-transform duration-300"
            }
          ) : /* @__PURE__ */ jsx(User, { className: "size-5" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSignOut,
          className: "size-10 rounded-xl bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 flex items-center justify-center text-red-500 hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95 group ml-1",
          title: "Logout",
          children: /* @__PURE__ */ jsx(LogOut, { className: "size-4 group-hover:-translate-x-0.5 transition-transform" })
        }
      )
    ] })
  ] });
}
export {
  TeacherHeader as T,
  TeacherSidebar as a
};
