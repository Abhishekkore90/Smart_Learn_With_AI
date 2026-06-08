import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Share2,
  Save,
  User,
  GraduationCap,
  Type,
  Palette as PaletteIcon,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Crown,
  Rocket,
  Flame,
  Zap,
  Trophy,
  Cake,
  Send,
  MessageCircle,
  Heart,
  Star,
  PartyPopper,
  School,
  BookOpen,
  Compass,
  Flag,
  Calendar,
  Medal,
  Theater,
  Mic2,
  Music,
  Palette,
  Award,
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/templates/edit/$templateId")({
  component: TemplateEditorPage,
});

const TEMPLATE_CONFIGS: Record<string, any> = {
  // Birthday Templates
  "birthday-1": {
    name: "Luxury Gold Royale",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)",
    accent:
      "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
    icon: Crown,
    title: "Happy Birthday!",
    quote: "May your day be as royal and golden as your future.",
    particleColor: "rgba(251, 245, 183, 0.4)",
  },
  "birthday-2": {
    name: "Cosmic Nebula",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Rocket,
    title: "Celestial Celebration!",
    quote: "Shooting for the stars on your special day. Keep shining bright!",
    particleColor: "rgba(192, 132, 252, 0.4)",
  },
  "birthday-3": {
    name: "Emerald Gardenia",
    bg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Sparkles,
    title: "Birthday Blossoms",
    quote: "Wishing you a day filled with natural joy and infinite growth.",
    particleColor: "rgba(110, 231, 183, 0.4)",
  },
  "birthday-4": {
    name: "Sunset Ember",
    bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
    accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
    icon: Flame,
    title: "Birthday Blaze!",
    quote:
      "Ignite your potential. Today is the spark for your greatest year yet.",
    particleColor: "rgba(251, 146, 60, 0.4)",
  },
  "birthday-5": {
    name: "Electric Azure",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
    accent: "linear-gradient(to right, #38bdf8, #818cf8, #2dd4bf)",
    icon: Zap,
    title: "Shockingly Awesome!",
    quote: "May your energy electrify the world. Have a powerful birthday!",
    particleColor: "rgba(56, 189, 248, 0.4)",
  },
  "birthday-6": {
    name: "Midnight Diamond",
    bg: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
    accent: "linear-gradient(to right, #94a3b8, #f8fafc, #64748b)",
    icon: Trophy,
    title: "Rare & Brilliant",
    quote: "You are a true gem. May your brilliance illuminate every path.",
    particleColor: "rgba(248, 250, 252, 0.4)",
  },
  // Admission Templates
  "admission-1": {
    name: "Royal Ivy Welcome",
    bg: "linear-gradient(135deg, #064e3b 0%, #1a2e21 100%)",
    accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728)",
    icon: School,
    title: "Welcome to School!",
    quote:
      "Congratulations! We are thrilled to welcome you to our school family.",
    particleColor: "rgba(251, 245, 183, 0.3)",
  },
  "admission-2": {
    name: "Future Leaders Glow",
    bg: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Crown,
    title: "Welcome Dear Student!",
    quote:
      "Congratulations on your admission! Your bright future begins here with us.",
    particleColor: "rgba(167, 139, 250, 0.3)",
  },
  "admission-3": {
    name: "Academic Spark Hub",
    bg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: BookOpen,
    title: "Congratulations!",
    quote:
      "Welcome to our school. We're excited to help you unlock your full potential.",
    particleColor: "rgba(251, 191, 36, 0.3)",
  },
  "admission-4": {
    name: "Oceanic Merit Shield",
    bg: "linear-gradient(135deg, #164e63 0%, #083344 100%)",
    accent: "linear-gradient(to right, #22d3ee, #0d9488, #2dd4bf)",
    icon: GraduationCap,
    title: "Welcome On Board!",
    quote:
      "Congratulations on joining our academy. Let's sail towards success together.",
    particleColor: "rgba(34, 211, 238, 0.3)",
  },
  "admission-5": {
    name: "Sunset Success Blaze",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    accent: "linear-gradient(to right, #f87171, #fbbf24, #facc15)",
    icon: Trophy,
    title: "Welcome Achiever!",
    quote:
      "Congratulations! You're now a part of our winning school community.",
    particleColor: "rgba(248, 113, 113, 0.3)",
  },
  "admission-6": {
    name: "Infinite Wisdom Star",
    bg: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Compass,
    title: "Welcome to Excellence!",
    quote:
      "Congratulations on your admission. A world of wisdom awaits you here.",
    particleColor: "rgba(129, 140, 248, 0.3)",
  },
  // Sports Templates
  "sports-1": {
    name: "Grand Sports Day Invitation",
    bg: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)",
    accent: "linear-gradient(to right, #facc15, #fbbf24, #f59e0b)",
    icon: Flag,
    title: "YOU'RE INVITED!",
    quote: "Join us for a day of speed, strength, and school spirit!",
    particleColor: "rgba(250, 204, 21, 0.3)",
  },
  "sports-2": {
    name: "Victory Award Ceremony",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    accent: "linear-gradient(to right, #818cf8, #c084fc, #e879f9)",
    icon: Calendar,
    title: "OFFICIAL INVITATION",
    quote: "Celebrating our athletes' incredible journey and achievements.",
    particleColor: "rgba(129, 140, 248, 0.3)",
  },
  "sports-3": {
    name: "Gold Medal Achievement",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)",
    accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728)",
    icon: Medal,
    title: "CHAMPION!",
    quote: "Hard work pays off. Congratulations on your historic win!",
    particleColor: "rgba(251, 245, 183, 0.3)",
  },
  "sports-4": {
    name: "Athlete of the Year",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Trophy,
    title: "GOLDEN ACHIEVEMENT",
    quote: "You've set the bar high. A true inspiration to the whole school.",
    particleColor: "rgba(52, 211, 153, 0.3)",
  },
  // Annual Function Templates
  "annual-1": {
    name: "Royal Stage Welcome",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)",
    accent: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728)",
    icon: Theater,
    title: "THE STAGE IS SET!",
    quote: "Step into a night of wonder and celebration. Witness the magic!",
    particleColor: "rgba(251, 245, 183, 0.3)",
  },
  "annual-2": {
    name: "Golden Legacy Awards",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #facc15, #fbbf24, #f59e0b)",
    icon: Trophy,
    title: "HONORING EXCELLENCE",
    quote: "Celebrating the hard work, talent, and achievements of our stars.",
    particleColor: "rgba(250, 204, 21, 0.3)",
  },
  "annual-3": {
    name: "Retro Drama Gala",
    bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
    accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
    icon: Mic2,
    title: "A DRAMATIC NIGHT",
    quote: "Experience the timeless stories brought to life by our performers.",
    particleColor: "rgba(248, 113, 113, 0.3)",
  },
  "annual-4": {
    name: "Futuristic Fusion",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
    accent: "linear-gradient(to right, #38bdf8, #818cf8, #2dd4bf)",
    icon: Rocket,
    title: "FUSION FIESTA 2026",
    quote: "Where tradition meets the future. A high-energy showcase!",
    particleColor: "rgba(56, 189, 248, 0.3)",
  },
  "annual-5": {
    name: "Midnight Symphony",
    bg: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
    accent: "linear-gradient(to right, #94a3b8, #f8fafc, #64748b)",
    icon: Music,
    title: "GRAND FINALE",
    quote: "The final symphony of a year filled with growth and joy.",
    particleColor: "rgba(248, 250, 252, 0.3)",
  },
  // Cultural Templates
  "cultural-1": {
    name: "Paint & Splash Hub",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Palette,
    title: "CREATIVE CANVAS",
    quote: "Let your colors tell a story. Express your artistic soul!",
    particleColor: "rgba(52, 211, 153, 0.3)",
  },
  "cultural-2": {
    name: "Rhythm & Beats",
    bg: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Music,
    title: "DANCE REVOLUTION",
    quote: "Feel the beat, own the stage. Show the world your moves!",
    particleColor: "rgba(167, 139, 250, 0.3)",
  },
  "cultural-3": {
    name: "Traditional Roots",
    bg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: School,
    title: "CULTURAL PRIDE",
    quote: "Celebrating the vibrant traditions that make us who we are.",
    particleColor: "rgba(251, 191, 36, 0.3)",
  },
  "cultural-4": {
    name: "Neon Talent Hunt",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #22d3ee, #0d9488, #2dd4bf)",
    icon: Sparkles,
    title: "SHINE BRIGHT!",
    quote: "Uncover the hidden star within you. Your time to shine is now!",
    particleColor: "rgba(34, 211, 238, 0.3)",
  },
  "cultural-5": {
    name: "Storyteller's Nook",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    accent: "linear-gradient(to right, #f87171, #fbbf24, #facc15)",
    icon: BookOpen,
    title: "ONCE UPON A TIME...",
    quote: "Enchant us with your tales and take us to far-off worlds.",
    particleColor: "rgba(248, 113, 113, 0.3)",
  },
  // Achievement Templates
  "achievement-1": {
    name: "Elite Scholar Award",
    bg: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    accent: "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)",
    icon: Trophy,
    title: "CONGRATULATIONS!",
    quote: "Excellence is not a skill, it's an attitude. Well deserved!",
    particleColor: "rgba(251, 191, 36, 0.3)",
  },
  "achievement-2": {
    name: "Perfect Attendance",
    bg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    accent: "linear-gradient(to right, #34d399, #6ee7b7, #10b981)",
    icon: Calendar,
    title: "DEDICATION AWARD",
    quote: "Your consistency is the foundation of your success. Well done!",
    particleColor: "rgba(52, 211, 153, 0.3)",
  },
  "achievement-3": {
    name: "Rising Star Growth",
    bg: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
    accent: "linear-gradient(to right, #a78bfa, #818cf8, #6366f1)",
    icon: Sparkles,
    title: "RISING STAR!",
    quote: "Watching you grow and succeed is our greatest reward.",
    particleColor: "rgba(167, 139, 250, 0.3)",
  },
  "achievement-4": {
    name: "Citizen of Honor",
    bg: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    accent: "linear-gradient(to right, #f87171, #fb923c, #facc15)",
    icon: Medal,
    title: "HONOR & INTEGRITY",
    quote: "Integrity and character define a true leader. We're proud of you!",
    particleColor: "rgba(248, 113, 113, 0.3)",
  },
};

function TemplateEditorPage() {
  const { templateId } = Route.useParams();
  const [studentName, setStudentName] = useState("ADITYA SHINDE");
  const [studentClass, setStudentClass] = useState("CLASS 5-A");
  const [isSaving, setIsSaving] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const config = useMemo(() => {
    if (TEMPLATE_CONFIGS[templateId]) return TEMPLATE_CONFIGS[templateId];

    // Improved Fallback
    const isAdmission = templateId?.includes("admission");
    const isSports = templateId?.includes("sports");
    const isAnnual = templateId?.includes("annual");
    const isCultural = templateId?.includes("cultural");
    const isAchievement = templateId?.includes("achievement");

    return {
      bg: isAdmission
        ? "linear-gradient(135deg, #064e3b 0%, #022c22 100%)"
        : isSports
          ? "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)"
          : isAnnual
            ? "linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)"
            : isCultural
              ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
              : isAchievement
                ? "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)"
                : "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      accent: "linear-gradient(to right, #ffffff, #ffffff)",
      icon: isAdmission
        ? School
        : isSports
          ? Trophy
          : isAnnual
            ? Theater
            : isCultural
              ? Palette
              : isAchievement
                ? Award
                : Cake,
      title: isAdmission
        ? "Welcome to School!"
        : isSports
          ? "Sports Victory!"
          : isAnnual
            ? "Annual Gala!"
            : isCultural
              ? "Cultural Star!"
              : isAchievement
                ? "Congratulations!"
                : "Happy Birthday!",
      quote: isAdmission
        ? "Congratulations! Welcome to our school family."
        : "Have a wonderful day filled with joy!",
      particleColor: "rgba(255, 255, 255, 0.4)",
    };
  }, [templateId]);

  const isAnnual = templateId?.includes("annual");
  const isCultural = templateId?.includes("cultural");
  const isAchievement = templateId?.includes("achievement");

  const handleShareToStudent = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const type = templateId?.includes("admission")
        ? "Welcome"
        : templateId?.includes("sports")
          ? "Sports"
          : templateId?.includes("annual")
            ? "Annual"
            : templateId?.includes("cultural")
              ? "Cultural"
              : templateId?.includes("achievement")
                ? "Achievement"
                : "Birthday";
      toast.success(`${type} card published to ${studentName}'s dashboard!`);
    }, 2000);
  };

  const handleWhatsAppShare = () => {
    const isAdmission = templateId?.includes("admission");
    const isSports = templateId?.includes("sports");
    const isAnnual = templateId?.includes("annual");
    const isCultural = templateId?.includes("cultural");
    const isAchievement = templateId?.includes("achievement");

    let message = `🎉 *Special Message from School* 🎓\n\nDear Parent, we are celebrating ${studentName}'s achievements! \n\n"${config.quote}"\n\n— From School Management ❤️`;

    if (isAdmission) {
      message = `🎉 *Congratulations & Welcome to Our School!* 🎓\n\nDear Parent, we are delighted to welcome ${studentName} to our school family in ${studentClass}!\n\n"${config.quote}"\n\n— From School Management ❤️`;
    } else if (isSports) {
      message = `🏆 *Sports Excellence News!* 🏅\n\nDear Parent, we are proud to share a special update regarding ${studentName}'s sports performance!\n\n"${config.quote}"\n\n— School Sports Department ⚡`;
    } else if (isAnnual) {
      message = `🎭 *Grand Annual Function 2026* 🌟\n\nDear Parent, you are cordially invited to witness ${studentName}'s performance in the Annual Gala!\n\n✨ *Role/Item:* ${studentClass}\n\n"${config.quote}"\n\n— School Events Team 🎭`;
    } else if (isCultural) {
      message = `🎨 *Cultural Achievement News* ✨\n\nDear Parent, we are proud to celebrate ${studentName}'s creative participation in our Cultural Events!\n\n✨ *Activity:* ${studentClass}\n\n"${config.quote}"\n\n— School Arts Council 🎨`;
    } else if (isAchievement) {
      message = `🏆 *Achievement Celebration* 🏅\n\nDear Parent, we are thrilled to celebrate ${studentName}'s victory in ${studentClass}!\n\n"${config.quote}"\n\n— Proud School Management ❤️`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
          {/* Editor Controls */}
          <div className="space-y-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all text-sm mb-4 group"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />{" "}
              Back to Templates
            </button>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-10"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                  Creative Studio
                </h2>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">
                  Live Personalization Engine
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                    Student Full Name
                  </label>
                  <div className="bg-slate-50 rounded-[2rem] flex items-center gap-4 px-8 border-2 border-transparent focus-within:bg-white focus-within:border-emerald-500/20 transition-all shadow-inner">
                    <User className="size-5 text-slate-300 group-focus-within:text-emerald-500" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) =>
                        setStudentName(e.target.value.toUpperCase())
                      }
                      className="bg-transparent outline-none w-full py-6 text-sm font-black text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                    {isAnnual
                      ? "Performance Role"
                      : isCultural
                        ? "Activity Category"
                        : isAchievement
                          ? "Achievement Title"
                          : "Class & Section"}
                  </label>
                  <div className="bg-slate-50 rounded-[2rem] flex items-center gap-4 px-8 border-2 border-transparent focus-within:bg-white focus-within:border-blue-500/20 transition-all shadow-inner">
                    {isAnnual ? (
                      <Theater className="size-5 text-slate-300 group-focus-within:text-blue-500" />
                    ) : isCultural ? (
                      <PaletteIcon className="size-5 text-slate-300 group-focus-within:text-blue-500" />
                    ) : isAchievement ? (
                      <Trophy className="size-5 text-slate-300 group-focus-within:text-blue-500" />
                    ) : (
                      <GraduationCap className="size-5 text-slate-300 group-focus-within:text-blue-500" />
                    )}
                    <input
                      type="text"
                      value={studentClass}
                      onChange={(e) =>
                        setStudentClass(e.target.value.toUpperCase())
                      }
                      className="bg-transparent outline-none w-full py-6 text-sm font-black text-slate-900"
                      placeholder={
                        isAnnual
                          ? "E.G. WELCOME DANCE"
                          : isCultural
                            ? "E.G. PAINTING CONTEST"
                            : isAchievement
                              ? "E.G. CLASS TOPPER"
                              : "CLASS 5-A"
                      }
                    />
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <button
                    onClick={handleShareToStudent}
                    disabled={isSaving}
                    className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl"
                  >
                    {isSaving ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5" />
                    )}{" "}
                    Share to Dashboard
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    <MessageCircle className="size-5" /> Send to WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Attractive Preview Card */}
          <div className="sticky top-24">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full aspect-[3/4] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group border-[12px] border-white"
              ref={templateRef}
            >
              {/* Dynamic Background */}
              <div
                className="absolute inset-0"
                style={{ background: config.bg }}
              />

              {/* Animated Floating Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -100, 0],
                      x: [0, Math.sin(i) * 20, 0],
                      rotate: [0, 180, 360],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 8 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute size-4 rounded-lg blur-[1px]"
                    style={{
                      background: config.particleColor,
                      left: `${(i + 1) * 12}%`,
                      bottom: "-5%",
                    }}
                  />
                ))}
              </div>

              {/* Decorative Glows */}
              <div className="absolute -top-32 -right-32 size-96 bg-white/10 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute -bottom-32 -left-32 size-96 bg-black/40 rounded-full blur-[120px]" />

              {/* Card Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="size-28 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/20 shadow-2xl relative"
                >
                  <config.icon className="size-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -right-4 size-10 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg rotate-12"
                  >
                    <Heart className="size-5 text-white" fill="white" />
                  </motion.div>
                </motion.div>

                <motion.h1
                  key={config.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-black text-white tracking-tighter mb-4 italic drop-shadow-2xl"
                >
                  {config.title}
                </motion.h1>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  className="h-1.5 bg-white/30 rounded-full mb-10 shadow-glow"
                  style={{ background: config.accent }}
                />

                <div className="space-y-4 mb-10">
                  <p className="text-white/40 font-black uppercase tracking-[0.8em] text-[10px]">
                    Presented To
                  </p>
                  <motion.h2
                    key={studentName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-6xl font-black tracking-tighter leading-none"
                    style={{
                      backgroundImage: config.accent,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
                    }}
                  >
                    {studentName}
                  </motion.h2>
                </div>

                <div className="max-w-[90%] mx-auto mb-12">
                  <motion.p
                    key={config.quote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/90 font-bold text-lg italic leading-relaxed"
                  >
                    "{config.quote}"
                  </motion.p>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-black/30 backdrop-blur-xl px-10 py-4 rounded-[1.5rem] border border-white/10 shadow-2xl flex items-center gap-3"
                >
                  {isAnnual ? (
                    <Theater className="size-5 text-white/70" />
                  ) : isCultural ? (
                    <PaletteIcon className="size-5 text-white/70" />
                  ) : isAchievement ? (
                    <Trophy className="size-5 text-white/70" />
                  ) : (
                    <GraduationCap className="size-5 text-white/70" />
                  )}
                  <span className="text-white font-black text-sm tracking-[0.2em] uppercase italic">
                    {studentClass}
                  </span>
                </motion.div>

                {/* Footer Branding */}
                <div className="absolute bottom-16 left-0 right-0 px-16 flex justify-between items-end opacity-50">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">
                      Premium Card
                    </p>
                    <p className="text-[8px] font-bold text-white/60">
                      ID: {templateId?.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                      <Star className="size-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none group-hover:translate-x-full transition-transform duration-1500 ease-in-out" />
            </motion.div>

            <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
              <PartyPopper className="size-4 text-pink-500" /> Ultra-Premium
              Digital Asset
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
