import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Mail, Lock, EyeOff, Eye, Loader2, ArrowRight, Sparkles, Film, Globe } from "lucide-react";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { a as auth, d as db } from "./router-BCVN4cfk.js";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import "@tanstack/react-query";
import "firebase/app";
import "firebase/analytics";
function UploaderSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: name,
        email,
        role: "uploader",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      toast.success("Creator account created successfully!");
      window.location.href = "/courses?action=upload";
    } catch (error) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen grid md:grid-cols-2 bg-[#F8FAFC]", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white p-8 md:p-20 flex flex-col justify-center order-2 md:order-1", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      x: -20
    }, animate: {
      opacity: 1,
      x: 0
    }, className: "max-w-md w-full mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black tracking-tight text-slate-900", children: "Start Uploading." }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2 font-medium", children: "Join our network of elite digital creators." })
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: handleSignup, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1", children: "Full Legal Name" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F1F5F9] rounded-2xl flex items-center gap-3 px-6 border border-transparent focus-within:bg-white focus-within:border-violet-500/30 transition-all", children: [
            /* @__PURE__ */ jsx(User, { className: "size-4 text-slate-400" }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "John Doe", className: "bg-transparent outline-none w-full py-5 text-sm font-bold text-slate-900", value: name, onChange: (e) => setName(e.target.value), required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1", children: "Creator Email" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F1F5F9] rounded-2xl flex items-center gap-3 px-6 border border-transparent focus-within:bg-white focus-within:border-violet-500/30 transition-all", children: [
            /* @__PURE__ */ jsx(Mail, { className: "size-4 text-slate-400" }),
            /* @__PURE__ */ jsx("input", { type: "email", placeholder: "creator@example.com", className: "bg-transparent outline-none w-full py-5 text-sm font-bold text-slate-900", value: email, onChange: (e) => setEmail(e.target.value), required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1", children: "Create Secure Password" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F1F5F9] rounded-2xl flex items-center gap-3 px-6 border border-transparent focus-within:bg-white focus-within:border-violet-500/30 transition-all relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "size-4 text-slate-400" }),
            /* @__PURE__ */ jsx("input", { type: showPassword ? "text" : "password", placeholder: "••••••••••••", className: "bg-transparent outline-none w-full py-5 text-sm font-bold text-slate-900 pr-10", value: password, onChange: (e) => setPassword(e.target.value), required: true }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-6 text-slate-400 hover:text-violet-600 transition-colors", children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading, className: "w-full bg-violet-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/10 disabled:opacity-50 mt-4 uppercase text-xs tracking-[0.2em]", children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : "Register as Creator",
          " ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-12 text-center text-sm font-bold text-slate-500", children: [
        "Already registered?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", search: {
          role: "uploader"
        }, className: "text-violet-600 hover:underline", children: "Creator Sign In" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden p-10 md:p-14 flex flex-col text-white bg-slate-900 order-1 md:order-2", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/40 to-slate-900" }),
      /* @__PURE__ */ jsxs("div", { className: "relative my-auto max-w-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "size-10 bg-violet-500 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-6 text-white" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase tracking-[0.3em] text-violet-400", children: "Creator Advantage" })
        ] }),
        /* @__PURE__ */ jsxs(motion.h1, { initial: {
          opacity: 0,
          y: 20
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "text-5xl font-black tracking-tighter mb-8 leading-none", children: [
          "Share your ",
          /* @__PURE__ */ jsx("span", { className: "text-violet-500", children: "Knowledge." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: [{
          icon: Film,
          title: "Course Creation",
          desc: "Upload high-quality video content."
        }, {
          icon: Globe,
          title: "Global Reach",
          desc: "Share your expertise with the world."
        }].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm group hover:bg-white/10 transition-all", children: [
          /* @__PURE__ */ jsx(item.icon, { className: "size-6 text-violet-500 mb-4" }),
          /* @__PURE__ */ jsx("h3", { className: "font-black text-lg mb-1", children: item.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 font-medium", children: item.desc })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative text-xs text-slate-500 mt-12 font-bold tracking-widest uppercase", children: "SMART LEARNING Intelligence Systems" })
    ] })
  ] });
}
export {
  UploaderSignupPage as component
};
