import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  Star,
  Sparkles,
  CheckCircle2,
  Trophy,
  Download,
  Edit3,
  ArrowLeft,
  User,
  Share2,
  PartyPopper,
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
  School,
  Send,
  Heart,
  BookOpen,
  Compass,
  LayoutGrid,
} from "lucide-react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/teacher/templates/admission")({
  head: () => ({
    meta: [{ title: "Admission Welcome Manager — Teacher Portal" }],
  }),
  component: AdmissionTemplatesPage,
});

const ADMISSION_TEMPLATES = [
  {
    id: 1,
    name: "Royal Ivy Welcome",
    theme: "emerald-gold",
    category: "Elite",
    bg: "linear-gradient(135deg, #064e3b 0%, #1a2e21 100%)",
    accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728)",
    icon: School,
    quote:
      "Step into excellence. Your legacy of learning begins in these halls.",
    particle: "sparkle",
  },
  {
    id: 2,
    name: "Future Leaders Glow",
    theme: "purple-blue",
    category: "Premium",
    bg: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Crown,
    quote:
      "A bright future awaits. We are honored to have you as our newest leader.",
    particle: "float",
  },
  {
    id: 3,
    name: "Academic Spark Hub",
    theme: "amber-orange",
    category: "Modern",
    bg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: BookOpen,
    quote: "Unleash your curiosity. Welcome to a journey of endless knowledge.",
    particle: "orbit",
  },
  {
    id: 4,
    name: "Oceanic Merit Shield",
    theme: "cyan-teal",
    category: "Traditional",
    bg: "linear-gradient(135deg, #164e63 0%, #083344 100%)",
    accent: "linear-gradient(to right, #22d3ee, #0d9488, #2dd4bf)",
    icon: GraduationCap,
    quote: "Steady sails to success. We're proud to welcome you on board.",
    particle: "wave",
  },
  {
    id: 5,
    name: "Sunset Success Blaze",
    theme: "red-yellow",
    category: "Dynamic",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    accent: "linear-gradient(to right, #f87171, #fbbf24, #facc15)",
    icon: Trophy,
    quote: "The heat is on! Welcome to the home of champions and achievers.",
    particle: "flame",
  },
  {
    id: 6,
    name: "Infinite Wisdom Star",
    theme: "indigo-violet",
    category: "Elite",
    bg: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Compass,
    quote: "Navigate your dreams. A world of wisdom is now yours to explore.",
    particle: "star",
  },
];

function AdmissionTemplatesPage() {
  const [studentName, setStudentName] = useState("RAHUL DESHMUKH");
  const [studentClass, setStudentClass] = useState("CLASS 1st-A");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  // Stats
  const stats = [
    {
      label: "New Admissions",
      value: "12",
      icon: User,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Welcome Wishes",
      value: "Active",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Dashboard Sync",
      value: "Live",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Templates",
      value: "6 Premium",
      icon: LayoutGrid,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
  ];

  const handleShareDashboard = () => {
    toast.success(
      `Welcome Masterpiece Published to ${studentName}'s Dashboard!`,
    );
  };

  const handleWhatsAppShare = () => {
    const message = `🎉 *Congratulations & Welcome!* 🎓\n\nDear Parent, we are delighted to welcome ${studentName} to our school family in ${studentClass}!\n\nYour child's success journey starts now.\n\n— From School Management ❤️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 space-y-10">
          {/* High-Fidelity Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-transparent to-blue-600/30" />
            <div className="absolute -right-20 -top-20 size-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/20 backdrop-blur-xl rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Sparkles className="size-4" /> Admission Creative Studio
                </motion.div>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                  Welcome{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic">
                    Bright Minds
                  </span>
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
                  Celebrate every new enrollment with cinematic, high-fidelity
                  welcome cards. Personalize, publish, and inspire from day one.
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
            {/* Real-time Customizer */}
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 sticky top-28"
              >
                <div className="flex items-center gap-5">
                  <div className="size-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <Edit3 className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                      Studio Controls
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Real-time Personalization
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      New Student Name
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-emerald-500/30 transition-all shadow-inner">
                      <User className="size-6 text-slate-300 group-focus-within/input:text-emerald-500" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) =>
                          setStudentName(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900 placeholder:text-slate-300"
                        placeholder="NAME"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      Enrolled Class
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-emerald-500/30 transition-all shadow-inner">
                      <GraduationCap className="size-6 text-slate-300 group-focus-within/input:text-emerald-500" />
                      <input
                        type="text"
                        value={studentClass}
                        onChange={(e) =>
                          setStudentClass(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900 placeholder:text-slate-300"
                        placeholder="CLASS"
                      />
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button
                      onClick={handleShareDashboard}
                      className="w-full py-7 bg-slate-900 text-white rounded-[3rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl"
                    >
                      <Send className="size-5" /> Publish to Dashboard
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full py-7 bg-emerald-600 text-white rounded-[3rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      <MessageCircle className="size-5" /> Share via WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Premium Template Gallery */}
            <div className="xl:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {ADMISSION_TEMPLATES.map((template, idx) => (
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

                      {/* Unique Template Animations */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={
                              template.particle === "sparkle"
                                ? {
                                    scale: [1, 1.5, 1],
                                    opacity: [0.1, 0.4, 0.1],
                                  }
                                : template.particle === "float"
                                  ? { y: [0, -100, 0], x: [0, 20, 0] }
                                  : template.particle === "wave"
                                    ? {
                                        x: [-20, 20, -20],
                                        opacity: [0.1, 0.3, 0.1],
                                      }
                                    : {
                                        scale: [0.8, 1.2, 0.8],
                                        opacity: [0.1, 0.3, 0.1],
                                      }
                            }
                            transition={{
                              duration: 4 + i,
                              repeat: Infinity,
                              delay: i * 0.4,
                            }}
                            className="absolute size-4 rounded-full blur-[2px] bg-white/20"
                            style={{ left: `${(i + 1) * 12}%`, bottom: "10%" }}
                          />
                        ))}
                      </div>

                      <div className="relative h-full p-10 flex flex-col items-center justify-center text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="size-20 bg-white/10 backdrop-blur-2xl rounded-[1.8rem] flex items-center justify-center mb-6 border border-white/20 shadow-2xl"
                        >
                          <template.icon className="size-10 text-white" />
                        </motion.div>

                        <h4 className="text-3xl font-black text-white tracking-tighter italic mb-2">
                          Congratulations!
                        </h4>
                        <div
                          className="h-1 w-12 bg-white/30 rounded-full mb-6"
                          style={{ background: template.accent }}
                        />

                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 leading-none">
                          Welcome to the Academy
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
                            {studentClass}
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
                                  templateId: `admission-${template.id}`,
                                }}
                                className="w-full max-w-[220px] py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
                              >
                                <Edit3 className="size-5" /> Design Studio
                              </Link>
                              <button className="w-full max-w-[220px] py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
                                <Download className="size-5" /> Download HD
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="px-8 py-10 flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                          {template.name}
                        </p>
                        <p className="text-xs font-bold text-slate-400 italic leading-snug">
                          "{template.quote}"
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-pink-50 transition-all border border-slate-100 shadow-sm">
                          <Heart className="size-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Premium Quote Library */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  <School className="size-64 text-slate-900" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Star className="size-7 text-white fill-white" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                    Welcome Quote Anthology
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {[
                    {
                      q: "Education is not the filling of a pail, but the lighting of a fire.",
                      a: "W.B. Yeats",
                    },
                    {
                      q: "Welcome to our family. Here, we don't just learn, we thrive together.",
                      a: "Principal's Desk",
                    },
                    {
                      q: "Your potential is limitless. We're excited to see you shine in your new class.",
                      a: "Academic Dean",
                    },
                    {
                      q: "The beautiful thing about learning is that no one can take it away from you.",
                      a: "B.B. King",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-emerald-100 transition-all group/quote"
                    >
                      <p className="text-lg font-black text-slate-800 leading-tight mb-4 italic">
                        "{item.q}"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-px w-6 bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                          {item.a}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
