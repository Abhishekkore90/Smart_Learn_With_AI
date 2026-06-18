import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Target,
  Zap,
  Activity,
  Dumbbell,
  Flag,
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
  Star,
} from "lucide-react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/teacher/templates/sports")({
  head: () => ({
    meta: [{ title: "Sports Excellence Manager — Teacher Portal" }],
  }),
  component: SportsTemplatesPage,
});

const SPORTS_TEMPLATES = [
  {
    id: 1,
    name: "Grand Sports Day Invitation",
    type: "Invitation",
    bg: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)",
    accent: "linear-gradient(to right, #facc15, #fbbf24, #f59e0b)",
    icon: Flag,
    quote: "Join us for a day of speed, strength, and school spirit!",
  },
  {
    id: 2,
    name: "Victory Award Ceremony",
    type: "Invitation",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Calendar,
    quote: "Celebrating our athletes' incredible journey and achievements.",
  },
  {
    id: 3,
    name: "Gold Medal Achievement",
    type: "Congratulation",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)",
    accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728)",
    icon: Medal,
    quote: "Hard work pays off. Congratulations on your historic win!",
  },
  {
    id: 4,
    name: "Athlete of the Year",
    type: "Congratulation",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Trophy,
    quote: "You've set the bar high. A true inspiration to the whole school.",
  },
];

function SportsTemplatesPage() {
  const [studentName, setStudentName] = useState("ADITYA RATHOD");
  const [eventName, setEventName] = useState("ANNUAL SPORTS MEET 2026");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  // Stats for Sports
  const stats = [
    {
      label: "Active Events",
      value: "3",
      icon: Timer,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "Medals Awarded",
      value: "42",
      icon: Medal,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Team Participants",
      value: "540",
      icon: Users2,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Victory Sync",
      value: "Live",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const handleShareDashboard = () => {
    toast.success(`Sports card published to ${studentName}'s dashboard!`);
  };

  const handleWhatsAppShare = () => {
    const message = `🏆 *Sports Excellence News!* 🏅\n\nDear Parent, we are proud to share a special update regarding ${studentName} for the ${eventName}!\n\nCheck out the card here: [Link]\n\n— School Sports Department ⚡`;
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
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/30 via-transparent to-orange-600/30" />
            <div className="absolute -right-20 -top-20 size-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-rose-500/20 backdrop-blur-xl rounded-full border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Trophy className="size-4" /> Sports Command Center
                </motion.div>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                  Athlete{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 italic">
                    Excellence
                  </span>
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl text-xl leading-relaxed">
                  Design high-energy invitations and congratulation cards for
                  the champions of tomorrow. Speed, power, and glory.
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
                  <div className="size-14 bg-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-rose-600/20">
                    <Zap className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                      Sports Studio
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Victory Personalization
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 group/input">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">
                      Athlete Name
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-rose-500/30 transition-all shadow-inner">
                      <User className="size-6 text-slate-300 group-focus-within/input:text-rose-500" />
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
                      Tournament/Event
                    </label>
                    <div className="bg-slate-50 rounded-[2.5rem] flex items-center gap-6 px-10 border-2 border-transparent group-focus-within/input:bg-white group-focus-within/input:border-rose-500/30 transition-all shadow-inner">
                      <Activity className="size-6 text-slate-300 group-focus-within/input:text-rose-500" />
                      <input
                        type="text"
                        value={eventName}
                        onChange={(e) =>
                          setEventName(e.target.value.toUpperCase())
                        }
                        className="bg-transparent outline-none w-full py-8 text-sm font-black text-slate-900"
                        placeholder="EVENT"
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
                      <MessageCircle className="size-5" /> WhatsApp Victory
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Template Gallery */}
            <div className="xl:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {SPORTS_TEMPLATES.map((template, idx) => (
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

                      {/* Animated Action Particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              x: [0, 200, 0],
                              opacity: [0, 0.4, 0],
                              scale: [0.5, 1.5, 0.5],
                            }}
                            transition={{
                              duration: 3 + i * 0.2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="absolute h-1 w-20 rounded-full bg-white/20 blur-[1px]"
                            style={{ top: `${(i + 1) * 10}%`, left: "-20%" }}
                          />
                        ))}
                      </div>

                      <div className="relative h-full p-10 flex flex-col items-center justify-center text-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="size-20 bg-white/10 backdrop-blur-2xl rounded-[1.8rem] flex items-center justify-center mb-6 border border-white/20 shadow-2xl"
                        >
                          <template.icon className="size-10 text-white" />
                        </motion.div>

                        <h4 className="text-3xl font-black text-white tracking-tighter italic mb-2">
                          {template.type === "Invitation"
                            ? "YOU'RE INVITED!"
                            : "CHAMPION!"}
                        </h4>
                        <div
                          className="h-1 w-12 bg-white/30 rounded-full mb-6"
                          style={{ background: template.accent }}
                        />

                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 leading-none">
                          {template.type === "Invitation"
                            ? "Official Sports Event"
                            : "Award of Excellence"}
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
                            {eventName}
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
                                params={{ templateId: `sports-${template.id}` }}
                                className="w-full max-w-[220px] py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
                              >
                                <Edit3 className="size-5" /> Launch Studio
                              </Link>
                              <button className="w-full max-w-[220px] py-5 bg-rose-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
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
                          <span
                            className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${template.type === "Invitation" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}
                          >
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
                        <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm">
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
