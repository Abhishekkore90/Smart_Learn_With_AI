import React, { useState } from "react";
import { 
  ChevronRight,
  Users,
  Share2,
  HelpCircle,
  Moon,
  Sun,
  SquarePen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface CCEAccountProps {
  onBack: () => void;
}

// Robust syllable/character-aware initials extractor for Devanagari (Marathi) and English names
function getDevanagariInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (!part) return "";
      // Matches first Devanagari consonant/vowel plus any vowel signs, halant, anusvara, visarga, etc.
      const match = part.match(/^[\u0900-\u097F][\u0900-\u0903\u093E-\u0957\u0962\u0963]*/);
      return match ? match[0] : part[0];
    })
    .join("")
    .slice(0, 2);
}

export function CCEAccount({ onBack }: CCEAccountProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const displayName = profile?.fullName || user?.displayName || "Teacher";
  const phone = profile?.phone || (user as any)?.phoneNumber || "";
  const initials = getDevanagariInitials(displayName);

  const handleLogout = async () => {
    if (!confirm("तुम्हाला लॉगआउट करायचे आहे का?")) return;
    try {
      await signOut(auth);
      localStorage.removeItem("sqaf_teacher_profile");
      toast.success("यशस्वीरित्या लॉगआउट झाले!");
      navigate({ to: "/login" });
    } catch {
      toast.error("लॉगआउट करताना अडचण आली.");
    }
  };

  const menuItems = [
    {
      label: "शाळेची माहिती संपादन करा",
      icon: null,
      onClick: () => navigate({ to: "/teacher/settings" }),
    },
    {
      label: "Member join requests",
      icon: null,
      onClick: () => toast.info("Member join requests — लवकरच उपलब्ध!"),
    },
    {
      label: "शाळा बदली",
      icon: null,
      onClick: () => toast.info("शाळा बदली — लवकरच उपलब्ध!"),
    },
    {
      label: "प्लेस्टोअर/ॲपस्टोअरवर आम्हाला रेट करा",
      icon: SquarePen,
      onClick: () => window.open("https://play.google.com/store", "_blank"),
    },
    {
      label: "ॲप शेअर करा",
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: "Smart Learn With AI",
            text: "Smart Learn With AI ॲप वापरून पहा!",
            url: window.location.origin,
          });
        } else {
          navigator.clipboard.writeText(window.location.origin);
          toast.success("लिंक कॉपी झाली!");
        }
      },
    },
    {
      label: "सपोर्टशी संपर्क साधा",
      icon: HelpCircle,
      onClick: () => window.open("https://wa.me/919422778992", "_blank"),
    },
    {
      label: "Join whatsapp community",
      icon: Users,
      onClick: () => window.open("https://chat.whatsapp.com/", "_blank"),
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[600px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          तुमचे खाते
        </h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 bg-[#16221A] border border-[#24352B] rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col items-center mb-10 relative z-10">
        <div className="size-24 rounded-full bg-emerald-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-950/40 mb-4">
          {initials}
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">
          {displayName}
        </h3>
        {phone && (
          <p className="text-sm text-slate-400 font-bold mt-1">
            +91{phone.replace(/^\+91/, "")}
          </p>
        )}
      </div>

      {/* Menu Items */}
      <div className="space-y-1 relative z-10">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#16221A] rounded-2xl transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              {item.icon && (
                <div className="size-8 rounded-xl bg-[#16221A] group-hover:bg-[#1E2E24] text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                  <item.icon size={16} />
                </div>
              )}
              <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="flex justify-center mt-10 mb-6 relative z-10">
        <button
          onClick={handleLogout}
          className="px-10 py-2 border border-emerald-800 text-[#4ADE80] hover:bg-emerald-950/30 rounded-full text-sm font-bold transition-all cursor-pointer"
        >
          लॉगआउट
        </button>
      </div>

      {/* Bottom Nav Bar Simulation */}
      <div className="mt-8 pt-4 border-t border-[#1C2C22] flex items-center justify-around text-center relative z-10">
        <button 
          onClick={onBack}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-emerald-400 transition-colors font-bold text-[10px] cursor-pointer"
        >
          <div className="p-2">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <span>होम</span>
        </button>
        <button 
          onClick={() => navigate({ to: "/teacher/timetable" })}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-emerald-400 transition-colors font-bold text-[10px] cursor-pointer"
        >
          <div className="p-2">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span>वर्ग</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-emerald-400 font-bold text-[10px] cursor-pointer">
          <div className="bg-[#132A1C] p-2 rounded-xl text-emerald-400 animate-pulse">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <span>खाते</span>
        </button>
      </div>
    </div>
  );
}
