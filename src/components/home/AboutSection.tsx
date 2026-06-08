import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  GraduationCap,
  Users,
  Globe,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Heart,
  Zap,
  Target,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

import slideImage1 from "@/assets/image 1.jpg";
import slideImage2 from "@/assets/image 2.jpg";
import slideImage3 from "@/assets/image 3.jpg";

const sliderImages = [slideImage1, slideImage2, slideImage3];

const mobileSliderImages = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1080&h=1920&q=80",
];

export function AboutPage() {
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] md:min-h-[60vh] lg:min-h-[70vh] flex flex-col justify-center pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1080&h=1920&q=80')] md:bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat opacity-40 md:opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/95" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full flex flex-col justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-xs font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_30px_rgba(45,212,191,0.2)]"
          >
            <Sparkles className="size-4 animate-pulse" />
            <span>{t.about_vision}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8rem] font-black mb-6 md:mb-8 w-full break-words px-2 ${lang === "en" ? "tracking-tighter leading-[1.1] md:leading-[1] lg:leading-[0.9]" : "tracking-normal leading-[1.3] md:leading-[1.2] py-4"}`}
          >
            {(t.about_hero_title || "").split(" ").slice(0, -2).join(" ")}{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-200 to-teal-400">
              {(t.about_hero_title || "").split(" ").slice(-2).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed px-4"
          >
            {t.about_hero_subtitle}
          </motion.p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-16 md:py-32 px-4 sm:px-6 overflow-hidden min-h-[100dvh] flex flex-col justify-center items-center w-full bg-slate-50">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          {/* Simple crossfade using CSS transitions instead of AnimatePresence */}
          {sliderImages.map((img, idx) => (
            <img
              key={idx}
              src={isMobile ? mobileSliderImages[idx] : img}
              alt={t.about_philosophy_title}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${currentImage === idx ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
            />
          ))}
          {/* Light color tinted overlay for perfect image visibility and premium look */}
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/35 via-white/20 to-teal-100/35" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center items-center text-center">
          <div className="max-w-4xl w-full px-4 py-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/90 border border-slate-200/80 shadow-premium backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-xs sm:text-sm font-black text-teal-600 uppercase tracking-[0.4em] drop-shadow-sm">
                  {t.about_philosophy_badge}
                </h2>
                <h3
                  className={`text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 drop-shadow-sm ${lang === "en" ? "tracking-tighter leading-tight" : "tracking-normal leading-snug py-2"}`}
                >
                  {t.about_philosophy_title}
                </h3>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                {t.about_philosophy_desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 text-left">
                {[
                  {
                    icon: Target,
                    title: t.about_precision,
                    desc: t.about_precision_desc,
                  },
                  {
                    icon: Zap,
                    title: t.about_velocity,
                    desc: t.about_velocity_desc,
                  },
                  {
                    icon: ShieldCheck,
                    title: t.about_integrity,
                    desc: t.about_integrity_desc,
                  },
                  {
                    icon: Globe,
                    title: t.about_global,
                    desc: t.about_global_desc,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100/90 transition-all hover:shadow-sm"
                  >
                    <div className="shrink-0 size-10 sm:size-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-200/50">
                      <item.icon className="size-5 sm:size-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-widest">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-[10px] sm:text-xs font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Slider indicators */}
            <div className="mt-8 sm:mt-12 flex justify-center gap-2 sm:gap-3">
              {sliderImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    currentImage === idx
                      ? "bg-teal-500 w-8 sm:w-10 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                      : "bg-slate-300 hover:bg-slate-400 w-1.5 sm:w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
