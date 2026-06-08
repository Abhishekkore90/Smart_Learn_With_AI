import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Heart,
  Star,
  Sparkles,
  Cake,
  Download,
  Edit3,
  ArrowLeft,
  User,
  GraduationCap,
  Share2,
  PartyPopper,
  Trophy,
  Zap,
  Crown,
  Flame,
  Rocket,
  Settings2,
  Calendar,
  MessageCircle,
  ToggleLeft,
  History,
  Users2,
  BellRing,
  Save,
  Loader2,
} from "lucide-react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/templates/birthday")({
  head: () => ({ meta: [{ title: "Birthday Manager — Teacher Portal" }] }),
  component: BirthdayTemplatesPage,
});

const BIRTHDAY_TEMPLATES = [
  {
    id: 1,
    name: "Chocolate Gold Royale",
    theme: "chocolate-gold",
    category: "Elite",
    bg: "linear-gradient(135deg, #2d1b0f 0%, #1a0f0a 100%)",
    accent:
      "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
    icon: Crown,
  },
  {
    id: 2,
    name: "Cosmic Celebration",
    theme: "cosmic",
    category: "Modern",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Rocket,
  },
  {
    id: 3,
    name: "Emerald Garden",
    theme: "emerald",
    category: "Premium",
    bg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Sparkles,
  },
  {
    id: 4,
    name: "Fiery Success",
    theme: "fiery",
    category: "Dynamic",
    bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
    accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
    icon: Flame,
  },
  {
    id: 5,
    name: "Oceanic Sparkle",
    theme: "ocean",
    category: "Elite",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
    accent: "linear-gradient(to right, #38bdf8, #818cf8, #2dd4bf)",
    icon: Zap,
  },
  {
    id: 6,
    name: "Diamond Night",
    theme: "diamond",
    category: "Premium",
    bg: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
    accent: "linear-gradient(to right, #94a3b8, #f8fafc, #64748b)",
    icon: Trophy,
  },
];

function BirthdayTemplatesPage() {
  const [studentName, setStudentName] = useState("ADITYA SHINDE");
  const [studentClass, setStudentClass] = useState("CLASS 4th-A");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);
  const [autoPopup, setAutoPopup] = useState(true);
  const [globalMessage, setGlobalMessage] = useState(
    "May your life be filled with happiness, success and joy. Have a wonderful day!",
  );
  const [isSaving, setIsSaving] = useState(false);

  // Stats
  const stats = [
    {
      label: "Today's Birthdays",
      value: "3",
      icon: Cake,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      label: "Upcoming (7 Days)",
      value: "12",
      icon: BellRing,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Wishes Sent",
      value: "458",
      icon: MessageCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Auto-Popup",
      value: autoPopup ? "On" : "Off",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Birthday System Settings Updated!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 space-y-10">
          {/* Cinematic Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-blue-600/20" />
            <div className="absolute -right-20 -top-20 size-80 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-widest"
                >
                  <Sparkles className="size-4" /> Birthday Command Center
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                  Student Birthday{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
                    System
                  </span>
                </h2>
                <p className="text-slate-400 font-medium max-w-xl text-lg">
                  Manage automated wishes, custom templates, and celebrate
                  student milestones with high-fidelity production tools.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSaveSettings}
                  className="group flex items-center gap-3 px-8 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  {isSaving ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Save className="size-5" />
                  )}{" "}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:shadow-2xl transition-all"
              >
                <div
                  className={`size-16 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <s.icon className={`size-8 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-2">
                    {s.label}
                  </p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* System Configuration */}
            <div className="xl:col-span-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Settings2 className="size-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                    System Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Auto Popup Toggle */}
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Zap
                          className={`size-5 ${autoPopup ? "text-amber-500" : "text-slate-300"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Auto Birthday Popup
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Enable on Dashboard
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoPopup(!autoPopup)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${autoPopup ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                      <motion.div
                        animate={{ x: autoPopup ? 24 : 4 }}
                        className="absolute top-1 size-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  {/* Default Message */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                      Global Wishing Message
                    </label>
                    <textarea
                      value={globalMessage}
                      onChange={(e) => setGlobalMessage(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-pink-500/20 focus:bg-white rounded-[2rem] p-8 text-sm font-bold text-slate-900 h-48 outline-none transition-all shadow-inner"
                      placeholder="Write the magic words..."
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    <Save className="size-5" /> Update Global Settings
                  </button>
                </div>
              </motion.div>

              {/* Today's Celebrants */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                      <Cake className="size-6 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                      Today's Stars
                    </h3>
                  </div>
                  <span className="px-4 py-1.5 bg-pink-50 text-pink-600 text-[10px] font-black uppercase rounded-full">
                    3 Students
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "ADITYA SHINDE",
                      class: "Class 5-A",
                      photo: "https://i.pravatar.cc/150?u=1",
                    },
                    {
                      name: "SNEHA PATIL",
                      class: "Class 8-C",
                      photo: "https://i.pravatar.cc/150?u=2",
                    },
                    {
                      name: "RAHUL KULKARNI",
                      class: "Class 10-B",
                      photo: "https://i.pravatar.cc/150?u=3",
                    },
                  ].map((student, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-[2rem] bg-slate-50 border border-transparent hover:border-pink-100 transition-all group"
                    >
                      <div className="size-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={student.photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900 leading-tight">
                          {student.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {student.class}
                        </p>
                      </div>
                      <button className="size-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm hover:bg-emerald-500 hover:text-white transition-all">
                        <MessageCircle className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Template Gallery & Live Preview */}
            <div className="xl:col-span-2 space-y-10">
              {/* Luxury Editor Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Edit3 className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">
                      Intelligence Studio
                    </h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-0.5 opacity-60">
                      High-Resolution Live Preview Engine
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 mb-2 block">
                      Preview Recipient
                    </label>
                    <div className="bg-slate-50 rounded-[2rem] flex items-center gap-5 px-8 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner">
                      <User className="size-6 text-slate-300 group-focus-within/input:text-blue-500" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) =>
                          setStudentName(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-6 text-lg font-black text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 mb-2 block">
                      Institutional Identity
                    </label>
                    <div className="bg-slate-50 rounded-[2rem] flex items-center gap-5 px-8 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner">
                      <GraduationCap className="size-6 text-slate-300 group-focus-within/input:text-blue-500" />
                      <input
                        type="text"
                        value={studentClass}
                        onChange={(e) =>
                          setStudentClass(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-6 text-lg font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {BIRTHDAY_TEMPLATES.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    onHoverStart={() => setActiveTemplate(template.id)}
                    onHoverEnd={() => setActiveTemplate(null)}
                    className="group relative bg-white rounded-[3rem] p-4 shadow-xl border border-slate-100"
                  >
                    <div
                      className="aspect-video rounded-[2rem] overflow-hidden relative shadow-inner"
                      style={{ background: template.bg }}
                    >
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                      <div className="relative h-full p-8 flex flex-col items-center justify-center text-center">
                        <template.icon className="size-10 text-white mb-4 drop-shadow-lg" />
                        <h4 className="text-2xl font-black text-white tracking-tighter italic mb-1">
                          Happy Birthday!
                        </h4>
                        <div
                          className="h-0.5 w-10 bg-white/30 rounded-full mb-4"
                          style={{ background: template.accent }}
                        />
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">
                          Presented To
                        </p>
                        <h5
                          className="text-2xl font-black text-white tracking-tighter leading-none"
                          style={{
                            backgroundImage: template.accent,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {studentName}
                        </h5>
                        <div className="mt-4 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">
                            {studentClass}
                          </span>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <AnimatePresence>
                        {activeTemplate === template.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-8"
                          >
                            <Link
                              to="/teacher/templates/edit/$templateId"
                              params={{ templateId: `birthday-${template.id}` }}
                              className="w-full max-w-[180px] py-4 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
                            >
                              <Edit3 className="size-4" /> Advanced Editor
                            </Link>
                            <button className="w-full max-w-[180px] py-4 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl">
                              <Download className="size-4" /> Download 4K
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="px-6 py-6 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                          {template.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {template.category} ENGINE
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-pink-50 transition-all border border-slate-100">
                          <Heart className="size-4" />
                        </button>
                        <button className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all border border-slate-100">
                          <Share2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Birthday History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-slate-100 rounded-3xl flex items-center justify-center">
                  <History className="size-7 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                    Celebration History
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Archived Records & Sent Wishes
                  </p>
                </div>
              </div>
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                <Download className="size-4" /> Export Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Class
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    {
                      name: "Rahul Deshmukh",
                      date: "15 May 2026",
                      class: "10th-B",
                      status: "Sent",
                      color: "text-emerald-500",
                    },
                    {
                      name: "Sneha Patil",
                      date: "15 May 2026",
                      class: "8th-A",
                      status: "Pending",
                      color: "text-amber-500",
                    },
                    {
                      name: "Aditya Kulkarni",
                      date: "15 May 2026",
                      class: "12th-C",
                      status: "Sent",
                      color: "text-emerald-500",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-6 font-black text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-slate-500">
                        {row.date}
                      </td>
                      <td className="px-6 py-6 text-xs font-black text-slate-400">
                        {row.class}
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 ${row.color}`}
                        >
                          <div
                            className={`size-1.5 rounded-full fill-current ${row.color.replace("text", "bg")}`}
                          />{" "}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <button className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:shadow-lg transition-all">
                          <MessageCircle className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
