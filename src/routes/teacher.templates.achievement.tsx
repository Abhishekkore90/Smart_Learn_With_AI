import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Star,
  Target,
  CheckCircle,
  Download,
  Edit3,
  ArrowLeft,
  User,
  Share2,
  PartyPopper,
  Crown,
  Flame,
  Rocket,
  Settings2,
  Calendar,
  MessageCircle,
  History,
  Users2,
  BellRing,
  Save,
  Loader2,
  School,
  Send,
  Medal as MedalIcon,
  Timer,
  Zap,
  Trophy as TrophyIcon,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/teacher/templates/achievement")({
  head: () => ({
    meta: [{ title: "Achievement & Victory Hub — Teacher Portal" }],
  }),
  component: AchievementTemplatesPage,
});

const ACHIEVEMENT_TEMPLATES = [
  {
    id: 1,
    name: "Elite Scholar Award",
    type: "Academic",
    bg: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: Trophy,
    quote:
      "Excellence is not a skill, it's an attitude. Congratulations on your rank!",
  },
  {
    id: 2,
    name: "Perfect Attendance",
    type: "Dedication",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Calendar,
    quote: "Your consistency is the foundation of your success. Well done!",
  },
  {
    id: 3,
    name: "Rising Star Growth",
    type: "Progress",
    bg: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Sparkles,
    quote: "Watching you grow and succeed is our greatest reward. Keep it up!",
  },
  {
    id: 4,
    name: "Citizen of Honor",
    type: "Discipline",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
    icon: Medal,
    quote: "Integrity and character define a true leader. We are proud of you!",
  },
];

function AchievementTemplatesPage() {
  const [studentName, setStudentName] = useState("ROHIT PATIL");
  const [achievementType, setAchievementType] = useState("CLASS TOPPER 2026");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  const stats = [
    {
      label: "Issued",
      value: "1,240",
      icon: Award,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Top Rankers",
      value: "42",
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Growth Rate",
      value: "+24%",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Global Rank",
      value: "Elite",
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const handleShareDashboard = () => {
    toast.success(`Victory card published to ${studentName}'s dashboard!`);
  };

  const handleWhatsAppShare = () => {
    const message = `🏆 *Achievement Celebration* 🏅\n\nDear Parent, we are thrilled to celebrate ${studentName}'s victory in ${achievementType}!\n\nView the certificate: [Link]\n\n— Proud School Management ❤️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 space-y-10">
          {/* Cinematic Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-amber-600/30" />
            <div className="absolute -right-20 -top-20 size-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/20 backdrop-blur-xl rounded-full border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Trophy className="size-4" /> Victory Command Center
                </motion.div>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                  Victory{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400 italic">
                    Pavilion
                  </span>
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
                  Honor your students' dedication and hard work. Create premium
                  certificates that celebrate every milestone and victory.
                </p>
              </div>
              <Link
                to="/teacher"
                className="group flex items-center gap-4 px-10 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />{" "}
                Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:shadow-2xl transition-all"
              >
                <div
                  className={`size-16 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <s.icon className={`size-8 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {s.label}
                  </p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Real-time Studio */}
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 sticky top-28"
              >
                <div className="flex items-center gap-5">
                  <div className="size-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Award className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                      Victory Studio
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Honor Personalization
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      Achiever Name
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner">
                      <User className="size-6 text-slate-300 group-focus-within/input:text-blue-500" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) =>
                          setStudentName(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900"
                        placeholder="NAME"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      Achievement Title
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-blue-500/30 transition-all shadow-inner">
                      <Trophy className="size-6 text-slate-300 group-focus-within/input:text-blue-500" />
                      <input
                        type="text"
                        value={achievementType}
                        onChange={(e) =>
                          setAchievementType(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900"
                        placeholder="E.G. TOP RANKER"
                      />
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button
                      onClick={handleShareDashboard}
                      className="w-full py-7 bg-slate-900 text-white rounded-[3rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl"
                    >
                      <Send className="size-5" /> Share to Student
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full py-7 bg-emerald-600 text-white rounded-[3rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      <MessageCircle className="size-5" /> WhatsApp Share
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Template Gallery */}
            <div className="xl:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {ACHIEVEMENT_TEMPLATES.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -10 }}
                    onHoverStart={() => setActiveTemplate(template.id)}
                    onHoverEnd={() => setActiveTemplate(null)}
                    className="group relative bg-white rounded-[4rem] p-5 shadow-2xl border border-slate-100"
                  >
                    <div
                      className="aspect-[4/3] rounded-[3rem] overflow-hidden relative shadow-inner"
                      style={{ background: template.bg }}
                    >
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                      {/* Animated Victory Particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [-100, 500],
                              x: [0, Math.sin(i) * 50],
                              opacity: [0, 1, 0],
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 3 + i,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="absolute size-4 rounded-sm bg-white/20"
                            style={{ left: `${(i + 1) * 15}%`, top: "-10%" }}
                          />
                        ))}
                      </div>

                      <div className="relative h-full p-10 flex flex-col items-center justify-center text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="size-24 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl"
                        >
                          <template.icon className="size-12 text-white" />
                        </motion.div>

                        <h4 className="text-4xl font-black text-white tracking-tighter italic mb-2 leading-none">
                          CONGRATULATIONS
                        </h4>
                        <div
                          className="h-1.5 w-16 bg-white/30 rounded-full mb-8"
                          style={{ background: template.accent }}
                        />

                        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50 mb-3 leading-none">
                          Achievement Award
                        </p>
                        <h5
                          className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none px-4"
                          style={{
                            backgroundImage: template.accent,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                          }}
                        >
                          {studentName}
                        </h5>

                        <div className="mt-10 px-12 py-5 rounded-3xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
                          <span className="text-xs font-black text-white uppercase tracking-[0.3em] italic">
                            {achievementType}
                          </span>
                        </div>

                        {/* Interactive Overlay */}
                        <AnimatePresence>
                          {activeTemplate === template.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center gap-6 p-10"
                            >
                              <Link
                                to="/teacher/templates/edit/$templateId"
                                params={{
                                  templateId: `achievement-${template.id}`,
                                }}
                                className="w-full max-w-[240px] py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl"
                              >
                                <Edit3 className="size-6" /> Launch Studio
                              </Link>
                              <button className="w-full max-w-[240px] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl">
                                <Download className="size-6" /> Download HD
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="px-10 py-12 flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600">
                            {template.type}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                          {template.name}
                        </p>
                        <p className="text-sm font-bold text-slate-400 italic leading-relaxed">
                          "{template.quote}"
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                          <Star className="size-6" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
