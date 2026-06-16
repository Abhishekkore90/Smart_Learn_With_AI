import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Sparkles, ChevronLeft, Play, Link, Loader2, ArrowRight } from "lucide-react";
import { D as DOMAINS } from "./constants-1AeNWntT.js";
import { F as Footer } from "./Footer-Dt4kCwio.js";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getDoc, doc, addDoc, collection } from "firebase/firestore";
import { u as useAuth, a as auth, d as db } from "./router-BCVN4cfk.js";
import "./translations-RzKVqU65.js";
import "@tanstack/react-query";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
function AntigravityUploadForm() {
  const search = useSearch({
    from: "/upload"
  });
  const {
    category: initialCategory = "",
    type = "free"
  } = search;
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading: authLoading
  } = useAuth();
  const [userName, setUserName] = useState("Creator");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [subcategory, setSubcategory] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!authLoading) {
      const isSuperAdmin = sessionStorage.getItem("is_super_admin");
      if (!isSuperAdmin && (!user || profile?.role !== "uploader")) {
        toast.error("Please login as Uploader to access the creator dashboard");
        navigate({
          to: "/login",
          search: {
            redirect: `/upload?category=${initialCategory}&type=${type}`,
            role: "uploader"
          }
        });
        return;
      }
      if (!initialCategory) {
        toast.error("Please select a category first");
        navigate({
          to: "/courses",
          search: {
            action: "upload"
          }
        });
      }
      setCategory(initialCategory || "");
    }
  }, [initialCategory, navigate, type, user, profile, authLoading]);
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || userDoc.data().fullName || "Creator");
        }
      }
    };
    fetchUser();
  }, []);
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !category || !subcategory || !videoLink) {
      toast.error("Please fill in all fields including subcategory");
      return;
    }
    if (!auth.currentUser) {
      toast.error("Please login to upload content");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "videos"), {
        title,
        category,
        subcategory,
        videoLink,
        uploaderId: auth.currentUser.uid,
        uploaderName: userName,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isFree: type === "free",
        priceType: type,
        status: "pending"
      });
      toast.success(`${type === "free" ? "Free" : "Paid"} course published successfully!`);
      navigate({
        to: "/courses",
        search: {
          action: "upload"
        }
      });
    } catch (error) {
      toast.error("Failed to upload video metadata");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#FDFDFF] text-[#111827] relative overflow-hidden font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none -z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#6C63FF]/5 blur-[120px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#00D4FF]/5 blur-[120px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#FFB6FF]/5 blur-[100px] rounded-full" })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10", children: [
      /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "max-w-6xl mx-auto mb-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white shadow-soft flex flex-col md:flex-row items-center gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "size-24 rounded-[2rem] bg-gradient-to-br from-[#6C63FF] to-[#4F46E5] flex items-center justify-center text-white shadow-glow relative", children: [
          /* @__PURE__ */ jsx(User, { className: "size-10" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-2 -right-2 size-8 bg-white rounded-xl shadow-card flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-[#FACC15]" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center md:text-left", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl font-black tracking-tight", children: [
            "Welcome, ",
            /* @__PURE__ */ jsx("span", { className: "text-[#6C63FF]", children: userName }),
            " 👋"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[#6B7280] text-lg mt-2 font-medium", children: "Ready to empower the world with your expertise today?" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.95
      }, animate: {
        opacity: 1,
        scale: 1
      }, className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => navigate({
            to: "/courses",
            search: {
              action: "upload"
            }
          }), className: "flex items-center gap-2 text-sm font-black text-[#6B7280] hover:text-[#111827] uppercase tracking-widest transition-colors", children: [
            /* @__PURE__ */ jsx(ChevronLeft, { className: "size-5" }),
            " Change Category"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-soft ${type === "free" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-purple-200 text-purple-600 bg-purple-50"}`, children: [
            type,
            " Course • ",
            category
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-8 min-h-[600px]", children: [
          /* @__PURE__ */ jsxs(motion.aside, { initial: {
            x: -20,
            opacity: 0
          }, animate: {
            x: 0,
            opacity: 1
          }, className: "w-full lg:w-72 bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-soft h-fit sticky top-32", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-[0.2em] text-[#6C63FF] mb-2", children: "Explore Niches" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#6B7280] font-medium leading-relaxed", children: "Select the most relevant topic for your expertise." })
            ] }),
            /* @__PURE__ */ jsx("nav", { className: "space-y-2", children: DOMAINS.find((d) => d.t === category)?.subcategories.map((sub) => /* @__PURE__ */ jsxs(motion.button, { whileHover: {
              x: 4
            }, whileTap: {
              scale: 0.98
            }, onClick: () => setSubcategory(sub), className: `w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all ${subcategory === sub ? "bg-[#6C63FF] text-white shadow-glow-sm scale-[1.02]" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: sub }),
              subcategory === sub && /* @__PURE__ */ jsx(motion.div, { layoutId: "active-indicator", className: "size-1.5 rounded-full bg-white shadow-sm" })
            ] }, sub)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-10 p-5 rounded-[2rem] bg-gradient-to-br from-[#F8FAFF] to-[#F3F4F6] border border-white/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsx("div", { className: "size-8 rounded-lg bg-white flex items-center justify-center shadow-soft", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-[#6C63FF]" }) }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider", children: "Pro Tip" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] text-[#6B7280] leading-relaxed", children: "Specific subcategories help scholars find your content 3x faster." })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/60 backdrop-blur-3xl p-10 md:p-14 rounded-[4.5rem] border border-white shadow-soft relative overflow-hidden h-full", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6C63FF]/5 to-transparent rounded-bl-[100px]" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
              /* @__PURE__ */ jsxs("header", { children: [
                /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-black tracking-tight", children: [
                  "Course ",
                  /* @__PURE__ */ jsx("span", { className: "text-[#6C63FF]", children: "Details" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-[#6B7280] mt-2 font-medium", children: [
                  "Ready to publish to",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-[#111827]", children: subcategory || "..." }),
                  "?"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleUpload, className: "space-y-8", children: [
                /* @__PURE__ */ jsx(DashboardField, { label: "Course Title", icon: Play, placeholder: "e.g. Advanced Quantum Mechanics", value: title, onChange: (e) => setTitle(e.target.value) }),
                /* @__PURE__ */ jsx(DashboardField, { label: "Video URI", icon: Link, placeholder: "YouTube or Drive link", value: videoLink, onChange: (e) => setVideoLink(e.target.value) }),
                /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading || !subcategory, className: `w-full py-5 rounded-[2rem] font-black tracking-[0.2em] uppercase text-xs shadow-glow flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 ${type === "free" ? "bg-[#10B981] text-white" : "bg-[#6C63FF] text-white"}`, children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Publish ",
                  subcategory || "Course",
                  " Content",
                  " ",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-8 border-t border-[#F3F4F6]", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4", children: "Upload Guidelines" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4", children: ["High Resolution", "Clear Audio", "Original Work", "Educational Value"].map((g, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold text-[#6B7280]", children: [
                  /* @__PURE__ */ jsx("div", { className: "size-1 rounded-full bg-[#6C63FF]" }),
                  " ",
                  g
                ] }, i)) })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function DashboardField({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-widest text-[#6B7280] ml-1", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#F3F4F6] rounded-2xl flex items-center gap-4 px-6 border border-transparent focus-within:border-[#6C63FF]/30 transition-all", children: [
      /* @__PURE__ */ jsx(Icon, { className: "size-5 text-[#9CA3AF]" }),
      /* @__PURE__ */ jsx("input", { type, placeholder, className: "bg-transparent outline-none w-full py-5 text-sm font-medium", value, onChange, required: true })
    ] })
  ] });
}
export {
  AntigravityUploadForm as component
};
