import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Star,
  Mic2,
  Music,
  Camera,
  Theater,
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
  Medal,
  Timer,
  Zap,
  Trophy,
  LayoutGrid,
  Palette,
  PenTool,
  BookOpen,
} from "lucide-react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/teacher/templates/cultural")({
  head: () => ({ meta: [{ title: "Cultural Arts Manager — Teacher Portal" }] }),
  component: CulturalTemplatesPage,
});

const CULTURAL_TEMPLATES = [
  {
    id: 1,
    name: "Paint & Splash Hub",
    type: "Fine Arts",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Palette,
    quote: "Let your colors tell a story. Express your artistic soul!",
  },
  {
    id: 2,
    name: "Rhythm & Beats",
    type: "Performing Arts",
    bg: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Music,
    quote: "Feel the beat, own the stage. Show the world your moves!",
  },
  {
    id: 3,
    name: "Traditional Roots",
    type: "Heritage",
    bg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: School,
    quote: "Celebrating the vibrant traditions that make us who we are.",
  },
  {
    id: 4,
    name: "Neon Talent Hunt",
    type: "Variety Show",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #22d3ee, #0d9488, #2dd4bf)",
    icon: Sparkles,
    quote: "Uncover the hidden star within you. Your time to shine is now!",
  },
];

function CulturalTemplatesPage() {
  const [studentName, setStudentName] = useState("RAHUL VARMA");
  const [activityName, setActivityName] = useState("CULTURAL WEEK 2026");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  const stats = [
    {
      label: "Talents",
      value: "18",
      icon: Palette,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Workshops",
      value: "8",
      icon: PenTool,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Participants",
      value: "320",
      icon: Users2,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      label: "Creation Live",
      value: "Live",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const handleShareDashboard = () => {
    toast.success(`Cultural card published to ${studentName}'s dashboard!`);
  };

  const handleWhatsAppShare = () => {
    const message = `🎨 *Cultural Arts Achievement* ✨\n\nDear Parent, we are proud to celebrate ${studentName}'s creative participation in the ${activityName}!\n\nCheck out the card here: [Link]\n\n— School Arts Council 🎨`;
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-transparent to-indigo-600/30" />
            <div className="absolute -right-20 -top-20 size-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/20 backdrop-blur-xl rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Palette className="size-4" /> Cultural Command Center
                </motion.div>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                  Creative{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 italic">
                    Mastery
                  </span>
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
                  Design vibrant certificates and invitations for your school's
                  creative competitions. Arts, rhythm, and soul.
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
                  <div className="size-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Sparkles className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                      Cultural Studio
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Creative Personalization
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      Student Name
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-indigo-500/30 transition-all shadow-inner">
                      <User className="size-6 text-slate-300 group-focus-within/input:text-indigo-500" />
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
                      Activity/Event Name
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-indigo-500/30 transition-all shadow-inner">
                      <Palette className="size-6 text-slate-300 group-focus-within/input:text-indigo-500" />
                      <input
                        type="text"
                        value={activityName}
                        onChange={(e) =>
                          setActivityName(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900"
                        placeholder="ACTIVITY"
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
                {CULTURAL_TEMPLATES.map((template, idx) => (
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

                      {/* Animated Artistic Particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.1, 0.3, 0.1],
                              rotate: [0, 90, 180, 270, 360],
                            }}
                            transition={{
                              duration: 6 + i,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                            className="absolute size-20 rounded-full blur-[30px] bg-white/5"
                            style={{ left: `${(i + 1) * 12}%`, bottom: "10%" }}
                          />
                        ))}
                      </div>

                      <div className="relative h-full p-10 flex flex-col items-center justify-center text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="size-20 bg-white/10 backdrop-blur-2xl rounded-[1.8rem] flex items-center justify-center mb-6 border border-white/20 shadow-2xl"
                        >
                          <template.icon className="size-10 text-white" />
                        </motion.div>

                        <h4 className="text-3xl font-black text-white tracking-tighter italic mb-2">
                          CREATIVE STAR
                        </h4>
                        <div
                          className="h-1 w-12 bg-white/30 rounded-full mb-6"
                          style={{ background: template.accent }}
                        />

                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 leading-none">
                          Cultural Arts Contest
                        </p>
                        <h5
                          className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none px-4"
                          style={{
                            backgroundImage: template.accent,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                          }}
                        >
                          {studentName}
                        </h5>

                        <div className="mt-8 px-10 py-4 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
                            {activityName}
                          </span>
                        </div>

                        {/* Interactive Overlay */}
                        <AnimatePresence>
                          {activeTemplate === template.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg flex flex-col items-center justify-center gap-5 p-10"
                            >
                              <Link
                                to="/teacher/templates/edit/$templateId"
                                params={{
                                  templateId: `cultural-${template.id}`,
                                }}
                                className="w-full max-w-[220px] py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
                              >
                                <Edit3 className="size-5" /> Launch Studio
                              </Link>
                              <button className="w-full max-w-[220px] py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
                                <Download className="size-5" /> Download HD
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="px-8 py-10 flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-indigo-100 text-indigo-600">
                            {template.type}
                          </span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                          {template.name}
                        </p>
                        <p className="text-xs font-bold text-slate-400 italic leading-snug">
                          "{template.quote}"
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm">
                          <Star className="size-5" />
                        </button>
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
