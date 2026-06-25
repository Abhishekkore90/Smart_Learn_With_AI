
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Bot,
  School,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

import { AboutPage } from "@/components/home/AboutSection";
import { ContactPage } from "@/components/home/ContactSection";
import { Footer } from "@/components/Footer";

import modernClassroomBg from "@/assets/modern-classroom-hd.png";
import schoolBuildingBg from "@/assets/school-building-hd.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const bgImages = [
  modernClassroomBg,
  schoolBuildingBg,
];

function LandingPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const landingCards = [
    {
      title: t.c1_title || "Study",
      desc: t.c1_desc || "Access intelligent virtual AI mentors.",
      icon: Bot,
      color: "sky",
      softBg: "bg-sky-50/80",
      blobColor: "bg-sky-200/60",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      actionText: t.c1_action || "Launch AI Suite",
      to: "/admin/ai-tools",
    },
    {
      title: t.c4_title || "Practice",
      desc:
        t.c4_desc ||
        "Track academic progress, check exam results, submit school homework assignments, and earn verified performance badges.",
      icon: GraduationCap,
      color: "rose",
      softBg: "bg-rose-50/80",
      blobColor: "bg-rose-200/60",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      actionText: t.c4_action || "Open Scholar Portal",
      to: "/login",
      search: { role: "student" },
    },
    {
      title: t.c3_title || "Courses",
      desc: t.c3_desc || "Browse a rich catalog of courses.",
      icon: BookOpen,
      color: "violet",
      softBg: "bg-violet-50/80",
      blobColor: "bg-violet-200/60",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      actionText: t.c3_action || "Explore Courses",
      to: "/courses",
    },
    {
      title: t.c2_title || "Teacher Section",
      desc: t.c2_desc || "Empower teachers to manage classrooms.",
      icon: School,
      color: "emerald",
      softBg: "bg-emerald-50/80",
      blobColor: "bg-emerald-200/60",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      actionText: t.c2_action || "Enter Teacher Suite",
      to: "/login",
      search: { role: "teacher" },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Smooth background image slider using CSS transitions */}
        {bgImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="School Background"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${currentBgIndex === idx ? "opacity-100" : "opacity-0"} ${img === modernClassroomBg ? "scale-[1.3]" : ""}`}
            loading="eager"
          />
        ))}

        {/* Subtle clear overlay to keep background images properly visible */}
        <div className="absolute inset-0 bg-white/10 z-10" />

        {/* Static soft color accents — NO blur, NO animation */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-400/10 z-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-400/10 z-20" />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6 drop-shadow-2xl"
          >
            {t.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500 italic pr-2 drop-shadow-md">
              {t.title2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-800 font-bold max-w-2xl drop-shadow-sm mt-4"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Premium Animated Soft Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.3 },
            },
          }}
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 px-2 sm:px-4 w-full max-w-5xl mx-auto"
        >
          {landingCards.map((card, index) => {
            const Icon = card.icon;

            // Define extra rich styles per card color for premium appearance
            const styleMap: Record<string, { gradient: string; glowBg: string; glowBorder: string }> = {
              sky: {
                gradient: "from-sky-400 to-blue-500",
                glowBg: "group-hover:shadow-[0_20px_45px_rgba(56,189,248,0.35)]",
                glowBorder: "group-hover:border-sky-400/80",
              },
              rose: {
                gradient: "from-rose-400 to-pink-500",
                glowBg: "group-hover:shadow-[0_20px_45px_rgba(251,113,133,0.35)]",
                glowBorder: "group-hover:border-rose-400/80",
              },
              violet: {
                gradient: "from-violet-400 to-purple-500",
                glowBg: "group-hover:shadow-[0_20px_45px_rgba(167,139,250,0.35)]",
                glowBorder: "group-hover:border-violet-400/80",
              },
              emerald: {
                gradient: "from-emerald-400 to-teal-500",
                glowBg: "group-hover:shadow-[0_20px_45px_rgba(52,211,153,0.35)]",
                glowBorder: "group-hover:border-emerald-400/80",
              },
            };
            const customStyles = styleMap[card.color] || styleMap.sky;

            return (
              <motion.button
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  },
                }}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: card.to as any, search: (card as any).search })}
                className={`relative text-left group transition-all duration-500 flex flex-col justify-between h-full min-h-[220px] rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-2xl overflow-hidden border border-white/70 bg-white/60 backdrop-blur-lg ${customStyles.glowBg} ${customStyles.glowBorder}`}
              >
                {/* Diagonal Gloss Shine Overlay on Hover */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10 pointer-events-none" />

                {/* Neon Gradient Border Glow on Hover */}
                <div className={`absolute -inset-px rounded-3xl bg-gradient-to-r ${customStyles.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur z-0`} />

                {/* Soft Pastel Hover Background */}
                <div
                  className={`absolute inset-0 ${card.softBg} opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0`}
                />

                {/* Animated Soft Pastel Orbs */}
                <div
                  className={`absolute -top-24 -right-24 w-64 h-64 ${card.blobColor} rounded-full opacity-40 group-hover:scale-125 transition-transform duration-700 ease-out blur-2xl z-0`}
                />
                <div
                  className={`absolute -bottom-24 -left-24 w-64 h-64 ${card.blobColor} rounded-full opacity-40 group-hover:scale-125 transition-transform duration-700 ease-out blur-2xl z-0`}
                />

                {/* Content */}
                <div className="relative z-20 p-4 sm:p-6 flex flex-col h-full justify-between w-full">
                  <div>
                    {/* Soft Icon Container with subtle scale & shadow */}
                    <div
                      className={`size-10 sm:size-11 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-white/40 transition-all duration-500 group-hover:bg-white group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={20} className="sm:w-5 sm:h-5 transition-transform duration-500" strokeWidth={1.8} />
                    </div>

                    <h3
                      className={`text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1 sm:mb-2 transition-all duration-300 group-hover:translate-x-1 group-hover:${card.iconColor}`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-[11px] sm:text-xs font-semibold leading-relaxed tracking-wide group-hover:text-slate-800 transition-colors duration-300 line-clamp-3 sm:line-clamp-none">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 mt-4 sm:mt-5 flex items-center justify-between gap-2 border-t border-slate-200/50 group-hover:border-slate-300/40 transition-colors duration-300">
                    <span
                      className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:${card.iconColor} transition-colors duration-300`}
                    >
                      {card.actionText}
                    </span>
                    <div
                      className={`size-7 sm:size-8 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm text-slate-400 group-hover:text-white group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:${customStyles.gradient}`}
                    >
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-0.5 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </main>

      <div className="relative z-10">
        <div id="about">
          <AboutPage />
        </div>
        <div id="contact">
          <ContactPage />
        </div>
        <Footer />
      </div>
    </div>
  );
}
