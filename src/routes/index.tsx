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

import homeHeroBg from "@/assets/home-hero-bg.png";
import schoolBuildingBg from "@/assets/school-building.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const bgImages = [
  schoolBuildingBg,
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2670&auto=format&fit=crop",
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
      title: t.c1_title || "Generative AI Lab",
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
      title: t.c3_title || "Interactive Library",
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
      title: t.c2_title || "Educator Command",
      desc: t.c2_desc || "Empower teachers to manage classrooms.",
      icon: School,
      color: "emerald",
      softBg: "bg-emerald-50/80",
      blobColor: "bg-emerald-200/60",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      actionText: t.c2_action || "Enter Teacher Suite",
      to: "/login?role=teacher",
    },
    {
      title: t.c4_title || "Student Terminal",
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
      to: "/login?role=student",
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
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${currentBgIndex === idx ? "opacity-100" : "opacity-0"} ${img === schoolBuildingBg ? "scale-[1.3]" : ""}`}
            loading="eager"
          />
        ))}

        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/40 z-10" />

        {/* Static soft color accents — NO blur, NO animation */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-400/10 z-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-400/10 z-20" />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
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
            className="text-lg md:text-xl text-slate-800 font-bold max-w-2xl mb-12 drop-shadow-md bg-white/80 p-5 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <button
              onClick={() => navigate({ to: "/login" })}
              className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(79,70,229,0.4)] group hover:-translate-y-1"
            >
              {t.btnEnter}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => navigate({ to: "/about" })}
              className="w-full sm:w-auto px-10 py-4 bg-white/90 text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg hover:-translate-y-1"
            >
              {t.btnLearn}
            </button>
          </motion.div>
        </div>

        {/* Premium Animated Soft Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.4 },
            },
          }}
          className="mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 px-4 w-full max-w-[1440px] mx-auto"
        >
          {landingCards.map((card, index) => {
            const Icon = card.icon;
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
                  y: -10,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 12 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: card.to })}
                className="relative text-left group transition-all duration-300 flex flex-col justify-between h-full min-h-[220px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] overflow-hidden border border-white/60 bg-white/90 hover:-translate-y-1"
              >
                {/* Soft Pastel Hover Background */}
                <div
                  className={`absolute inset-0 ${card.softBg} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                />

                {/* Animated Soft Pastel Orbs */}
                <div
                  className={`absolute -top-24 -right-24 w-64 h-64 ${card.blobColor} rounded-full opacity-30 group-hover:scale-125 transition-transform duration-700 ease-out`}
                />
                <div
                  className={`absolute -bottom-24 -left-24 w-64 h-64 ${card.blobColor} rounded-full opacity-30 group-hover:scale-125 transition-transform duration-700 ease-out`}
                />

                {/* Content */}
                <div className="relative z-20 p-4 md:p-5 flex flex-col h-full justify-between">
                  <div>
                    {/* Soft Icon Container */}
                    <motion.div
                      className={`size-9 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 shadow-sm transition-all duration-500 group-hover:bg-white group-hover:shadow-md`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </motion.div>

                    <h3
                      className={`text-base md:text-lg font-black text-slate-800 tracking-tight mb-1.5 group-hover:translate-x-0.5 transition-all duration-300 group-hover:${card.iconColor}`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] md:text-xs font-medium leading-relaxed tracking-wide group-hover:text-slate-700 transition-colors duration-300">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 flex items-center justify-between gap-2 border-t border-slate-200/60 group-hover:border-slate-300/60 transition-colors duration-300">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:${card.iconColor} transition-colors duration-300`}
                    >
                      {card.actionText}
                    </span>
                    <div
                      className={`size-7 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm text-slate-400 group-hover:text-white group-hover:border-transparent group-hover:bg-slate-800`}
                    >
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-0.5 transition-transform"
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
