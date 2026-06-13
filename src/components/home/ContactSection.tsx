import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  MessageSquare,
  Globe,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

export function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const t = DICTIONARY[lang] as any;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(t.success);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/8 via-teal-500/5 to-transparent" />
        <div className="absolute top-[20%] -right-1/4 w-[600px] h-[600px] bg-teal-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] -left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Sparkles className="size-4 animate-pulse text-teal-400" />
            <span>{t.contact_badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-none"
          >
            {(t.contact_hero_title || "").split(" ").slice(0, -1).join(" ")}{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-cyan-300">
              {(t.contact_hero_title || "").split(" ").slice(-1)}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-slate-300 font-medium leading-relaxed"
          >
            {t.contact_hero_subtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 rounded-[3rem] bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="size-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <MessageSquare className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {t.contact_form_title}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {t.contact_form_badge}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                      {t.contact_form_name}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-6 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl focus:border-teal-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-teal-500/20 transition-all outline-none text-white font-bold placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                      {t.contact_form_email}
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-6 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl focus:border-teal-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-teal-500/20 transition-all outline-none text-white font-bold placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                    {t.contact_form_type}
                  </label>
                  <select className="w-full px-6 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl focus:border-teal-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-teal-500/20 transition-all outline-none text-white font-bold appearance-none">
                    <option>{t.contact_type_general}</option>
                    <option>{t.contact_type_partners}</option>
                    <option>{t.contact_type_support}</option>
                    <option>{t.contact_type_careers}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                    {t.contact_form_message}
                  </label>
                  <textarea
                    required
                    placeholder="..."
                    rows={5}
                    className="w-full px-6 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl focus:border-teal-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-teal-500/20 transition-all outline-none text-white font-bold resize-none placeholder:text-slate-500"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:from-teal-400 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(20,184,166,0.3)] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    t.contact_form_sending
                  ) : (
                    <>
                      <Send className="size-4" />
                      {t.contact_form_submit}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div className="space-y-12 py-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">
                    {t.contact_info_title}
                  </h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {t.contact_info_desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {[
                    {
                      icon: MapPin,
                      title: t.contact_info_location,
                      detail: "145/A, 194/A/2, PL NO 100, SHREE CAPITAL-2, WARNALI, WILLINGDON COLLEGE SANGLI, MIRAJ, SANGLI, MAHARASHTRA - 416415",
                      sub: "Main Office",
                      accent: "teal",
                    },
                    {
                      icon: Mail,
                      title: t.contact_info_email,
                      detail: "brgkendre86@gmail.com",
                      sub: "Email Support",
                      accent: "indigo",
                    },
                    {
                      icon: Phone,
                      title: t.contact_info_phone,
                      detail: "9422778992",
                      sub: "Contact Number",
                      accent: "emerald",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex items-start gap-6 group p-4 rounded-2xl hover:bg-slate-800/40 transition-all duration-300"
                    >
                      <div className={`size-14 rounded-3xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                        item.accent === "teal"
                          ? "text-teal-400 group-hover:bg-teal-500/20 group-hover:border-teal-500/30"
                          : item.accent === "indigo"
                            ? "text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30"
                            : "text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30"
                      }`}>
                        <item.icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          {item.title}
                        </p>
                        <p className="text-base font-bold text-white leading-relaxed mb-1">
                          {item.detail}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.sub}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-[3rem] relative overflow-hidden group shadow-2xl bg-gradient-to-br from-indigo-950/80 to-teal-950/80 border border-slate-700/40"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Globe className="size-32" />
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-4 text-white">
                    {t.contact_enterprise_title}
                  </h4>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                    {t.contact_enterprise_desc}
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-white transition-colors group">
                    {t.contact_enterprise_btn}{" "}
                    <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>

              <div className="flex items-center gap-6 px-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <ShieldCheck className="size-4 text-teal-400/60" />
                  {t.contact_gdpr}
                </div>
                <div className="size-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Globe className="size-4 text-indigo-400/60" />
                  {t.contact_support}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
