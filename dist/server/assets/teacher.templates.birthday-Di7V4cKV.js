import { jsxs, jsx } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Save, Cake, BellRing, MessageCircle, Zap, Settings2, Edit3, User, GraduationCap, Crown, Rocket, Flame, Trophy, Download, Heart, Share2, History } from "lucide-react";
import { T as TeacherSidebar } from "./TeacherSidebar-4Wx4T7rj.js";
import { T as TeacherHeader } from "./TeacherHeader-CEQHTxpc.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { s as showToast } from "./router-C_zaSst_.js";
import "./translations-DnpdRcxs.js";
import "@tanstack/react-query";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
import "firebase/firestore";
import "sonner";
const BIRTHDAY_TEMPLATES = [{
  id: 1,
  name: "Chocolate Gold Royale",
  theme: "chocolate-gold",
  category: "Elite",
  bg: "linear-gradient(135deg, #2d1b0f 0%, #1a0f0a 100%)",
  accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
  icon: Crown
}, {
  id: 2,
  name: "Cosmic Celebration",
  theme: "cosmic",
  category: "Modern",
  bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
  accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
  icon: Rocket
}, {
  id: 3,
  name: "Emerald Garden",
  theme: "emerald",
  category: "Premium",
  bg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
  accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
  icon: Sparkles
}, {
  id: 4,
  name: "Fiery Success",
  theme: "fiery",
  category: "Dynamic",
  bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
  accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
  icon: Flame
}, {
  id: 5,
  name: "Oceanic Sparkle",
  theme: "ocean",
  category: "Elite",
  bg: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
  accent: "linear-gradient(to right, #38bdf8, #818cf8, #2dd4bf)",
  icon: Zap
}, {
  id: 6,
  name: "Diamond Night",
  theme: "diamond",
  category: "Premium",
  bg: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
  accent: "linear-gradient(to right, #94a3b8, #f8fafc, #64748b)",
  icon: Trophy
}];
function BirthdayTemplatesPage() {
  const [studentName, setStudentName] = useState("ADITYA SHINDE");
  const [studentClass, setStudentClass] = useState("CLASS 4th-A");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [autoPopup, setAutoPopup] = useState(true);
  const [globalMessage, setGlobalMessage] = useState("May your life be filled with happiness, success and joy. Have a wonderful day!");
  const [isSaving, setIsSaving] = useState(false);
  const stats = [{
    label: "Today's Birthdays",
    value: "3",
    icon: Cake,
    color: "text-pink-500",
    bg: "bg-pink-50"
  }, {
    label: "Upcoming (7 Days)",
    value: "12",
    icon: BellRing,
    color: "text-blue-500",
    bg: "bg-blue-50"
  }, {
    label: "Total Wishes Sent",
    value: "458",
    icon: MessageCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  }, {
    label: "Auto-Popup",
    value: autoPopup ? "On" : "Off",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50"
  }];
  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast.success("Birthday System Settings Updated!");
    }, 1500);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8FAFC]", children: [
    /* @__PURE__ */ jsx(TeacherHeader, {}),
    /* @__PURE__ */ jsx(TeacherSidebar, {}),
    /* @__PURE__ */ jsx("main", { className: "lg:pl-64 pt-16 min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-10 space-y-10", children: [
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: -20
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-blue-600/20" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -right-20 -top-20 size-80 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(motion.div, { initial: {
              scale: 0
            }, animate: {
              scale: 1
            }, className: "inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-widest", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "size-4" }),
              " Birthday Command Center"
            ] }),
            /* @__PURE__ */ jsxs("h2", { className: "text-5xl md:text-6xl font-black tracking-tighter leading-none", children: [
              "Student Birthday",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400", children: "System" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 font-medium max-w-xl text-lg", children: "Manage automated wishes, custom templates, and celebrate student milestones with high-fidelity production tools." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-4", children: /* @__PURE__ */ jsxs("button", { onClick: handleSaveSettings, className: "group flex items-center gap-3 px-8 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl", children: [
            isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "size-5" }),
            " ",
            "Save Changes"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: stats.map((s, i) => /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: i * 0.1
      }, className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:shadow-2xl transition-all", children: [
        /* @__PURE__ */ jsx("div", { className: `size-16 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`, children: /* @__PURE__ */ jsx(s.icon, { className: `size-8 ${s.color}` }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-2", children: s.label }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-slate-900 tracking-tighter", children: s.value })
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "xl:col-span-1 space-y-8", children: [
          /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            x: -20
          }, animate: {
            opacity: 1,
            x: 0
          }, className: "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "size-12 bg-slate-900 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(Settings2, { className: "size-6 text-white" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-900 tracking-tighter", children: "System Settings" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "size-10 rounded-xl bg-white flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(Zap, { className: `size-5 ${autoPopup ? "text-amber-500" : "text-slate-300"}` }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900", children: "Auto Birthday Popup" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest", children: "Enable on Dashboard" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setAutoPopup(!autoPopup), className: `relative w-14 h-8 rounded-full transition-colors ${autoPopup ? "bg-emerald-500" : "bg-slate-300"}`, children: /* @__PURE__ */ jsx(motion.div, { animate: {
                  x: autoPopup ? 24 : 4
                }, className: "absolute top-1 size-6 bg-white rounded-full shadow-md" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1", children: "Global Wishing Message" }),
                /* @__PURE__ */ jsx("textarea", { value: globalMessage, onChange: (e) => setGlobalMessage(e.target.value), className: "w-full bg-slate-50 border-2 border-transparent focus:border-pink-500/20 focus:bg-white rounded-[2rem] p-8 text-sm font-bold text-slate-900 h-48 outline-none transition-all shadow-inner", placeholder: "Write the magic words..." })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleSaveSettings, className: "w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10", children: [
                /* @__PURE__ */ jsx(Save, { className: "size-5" }),
                " Update Global Settings"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            x: -20
          }, animate: {
            opacity: 1,
            x: 0
          }, transition: {
            delay: 0.2
          }, className: "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "size-12 bg-pink-100 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(Cake, { className: "size-6 text-pink-600" }) }),
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-900 tracking-tighter", children: "Today's Stars" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "px-4 py-1.5 bg-pink-50 text-pink-600 text-[10px] font-black uppercase rounded-full", children: "3 Students" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [{
              name: "ADITYA SHINDE",
              class: "Class 5-A",
              photo: "https://i.pravatar.cc/150?u=1"
            }, {
              name: "SNEHA PATIL",
              class: "Class 8-C",
              photo: "https://i.pravatar.cc/150?u=2"
            }, {
              name: "RAHUL KULKARNI",
              class: "Class 10-B",
              photo: "https://i.pravatar.cc/150?u=3"
            }].map((student, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 rounded-[2rem] bg-slate-50 border border-transparent hover:border-pink-100 transition-all group", children: [
              /* @__PURE__ */ jsx("div", { className: "size-14 rounded-2xl overflow-hidden border-2 border-white shadow-md", children: /* @__PURE__ */ jsx("img", { src: student.photo, alt: "", className: "w-full h-full object-cover" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900 leading-tight", children: student.name }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: student.class })
              ] }),
              /* @__PURE__ */ jsx("button", { className: "size-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm hover:bg-emerald-500 hover:text-white transition-all", children: /* @__PURE__ */ jsx(MessageCircle, { className: "size-5" }) })
            ] }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 space-y-10", children: [
          /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            y: 20
          }, animate: {
            opacity: 1,
            y: 0
          }, className: "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent pointer-events-none" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
              /* @__PURE__ */ jsx("div", { className: "size-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20", children: /* @__PURE__ */ jsx(Edit3, { className: "size-7 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-900 tracking-tight italic", children: "Intelligence Studio" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-bold text-xs uppercase tracking-widest mt-0.5 opacity-60", children: "High-Resolution Live Preview Engine" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10", children: [
              /* @__PURE__ */ jsxs("div", { className: "group/input", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 mb-2 block", children: "Preview Recipient" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 rounded-[2rem] flex items-center gap-5 px-8 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner", children: [
                  /* @__PURE__ */ jsx(User, { className: "size-6 text-slate-300 group-focus-within/input:text-blue-500" }),
                  /* @__PURE__ */ jsx("input", { type: "text", value: studentName, onChange: (e) => setStudentName(e.target.value.toUpperCase()), className: "bg-transparent outline-none w-full py-6 text-lg font-black text-slate-900" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "group/input", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 mb-2 block", children: "Institutional Identity" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 rounded-[2rem] flex items-center gap-5 px-8 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner", children: [
                  /* @__PURE__ */ jsx(GraduationCap, { className: "size-6 text-slate-300 group-focus-within/input:text-blue-500" }),
                  /* @__PURE__ */ jsx("input", { type: "text", value: studentClass, onChange: (e) => setStudentClass(e.target.value.toUpperCase()), className: "bg-transparent outline-none w-full py-6 text-lg font-black text-slate-900" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: BIRTHDAY_TEMPLATES.map((template, idx) => /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            scale: 0.9
          }, animate: {
            opacity: 1,
            scale: 1
          }, transition: {
            delay: idx * 0.1
          }, whileHover: {
            y: -5
          }, onHoverStart: () => setActiveTemplate(template.id), onHoverEnd: () => setActiveTemplate(null), className: "group relative bg-white rounded-[3rem] p-4 shadow-xl border border-slate-100", children: [
            /* @__PURE__ */ jsxs("div", { className: "aspect-video rounded-[2rem] overflow-hidden relative shadow-inner", style: {
              background: template.bg
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" }),
              /* @__PURE__ */ jsxs("div", { className: "relative h-full p-8 flex flex-col items-center justify-center text-center", children: [
                /* @__PURE__ */ jsx(template.icon, { className: "size-10 text-white mb-4 drop-shadow-lg" }),
                /* @__PURE__ */ jsx("h4", { className: "text-2xl font-black text-white tracking-tighter italic mb-1", children: "Happy Birthday!" }),
                /* @__PURE__ */ jsx("div", { className: "h-0.5 w-10 bg-white/30 rounded-full mb-4", style: {
                  background: template.accent
                } }),
                /* @__PURE__ */ jsx("p", { className: "text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-1", children: "Presented To" }),
                /* @__PURE__ */ jsx("h5", { className: "text-2xl font-black text-white tracking-tighter leading-none", style: {
                  backgroundImage: template.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }, children: studentName }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10", children: /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-white uppercase tracking-widest", children: studentClass }) })
              ] }),
              /* @__PURE__ */ jsx(AnimatePresence, { children: activeTemplate === template.id && /* @__PURE__ */ jsxs(motion.div, { initial: {
                opacity: 0
              }, animate: {
                opacity: 1
              }, exit: {
                opacity: 0
              }, className: "absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-8", children: [
                /* @__PURE__ */ jsxs(Link, { to: "/teacher/templates/edit/$templateId", params: {
                  templateId: `birthday-${template.id}`
                }, className: "w-full max-w-[180px] py-4 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl", children: [
                  /* @__PURE__ */ jsx(Edit3, { className: "size-4" }),
                  " Advanced Editor"
                ] }),
                /* @__PURE__ */ jsxs("button", { className: "w-full max-w-[180px] py-4 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl", children: [
                  /* @__PURE__ */ jsx(Download, { className: "size-4" }),
                  " Download 4K"
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-black text-slate-900 tracking-tight", children: template.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [
                  template.category,
                  " ENGINE"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx("button", { className: "size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-pink-50 transition-all border border-slate-100", children: /* @__PURE__ */ jsx(Heart, { className: "size-4" }) }),
                /* @__PURE__ */ jsx("button", { className: "size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all border border-slate-100", children: /* @__PURE__ */ jsx(Share2, { className: "size-4" }) })
              ] })
            ] })
          ] }, template.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "size-14 bg-slate-100 rounded-3xl flex items-center justify-center", children: /* @__PURE__ */ jsx(History, { className: "size-7 text-slate-600" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-3xl font-black text-slate-900 tracking-tighter", children: "Celebration History" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1", children: "Archived Records & Sent Wishes" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Download, { className: "size-4" }),
            " Export Report"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Student" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Class" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50", children: [{
            name: "Rahul Deshmukh",
            date: "15 May 2026",
            class: "10th-B",
            status: "Sent",
            color: "text-emerald-500"
          }, {
            name: "Sneha Patil",
            date: "15 May 2026",
            class: "8th-A",
            status: "Pending",
            color: "text-amber-500"
          }, {
            name: "Aditya Kulkarni",
            date: "15 May 2026",
            class: "12th-C",
            status: "Sent",
            color: "text-emerald-500"
          }].map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-slate-50/50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-6 font-black text-slate-900", children: row.name }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-6 text-sm font-bold text-slate-500", children: row.date }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-6 text-xs font-black text-slate-400", children: row.class }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-6", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 ${row.color}`, children: [
              /* @__PURE__ */ jsx("div", { className: `size-1.5 rounded-full fill-current ${row.color.replace("text", "bg")}` }),
              " ",
              row.status
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-6", children: /* @__PURE__ */ jsx("button", { className: "size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:shadow-lg transition-all", children: /* @__PURE__ */ jsx(MessageCircle, { className: "size-4" }) }) })
          ] }, i)) })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  BirthdayTemplatesPage as component
};
