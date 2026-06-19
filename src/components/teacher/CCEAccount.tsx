import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ArrowLeft, LogOut, User, Mail, Phone, GraduationCap, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  fullName?: string;
  name?: string;
  email?: string;
  mobile?: string;
  class?: string;
  role?: string;
  photoURL?: string;
}

export function CCEAccount({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile({ email: user.email || "" });
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("लॉगआउट यशस्वी!");
    } catch (err: any) {
      toast.error("लॉगआउट अयशस्वी: " + err.message);
    }
  };

  const infoItems = [
    { icon: User, label: "नाव", value: profile.fullName || profile.name || "—" },
    { icon: Mail, label: "ईमेल", value: profile.email || auth.currentUser?.email || "—" },
    { icon: Phone, label: "मोबाईल", value: profile.mobile || "—" },
    { icon: GraduationCap, label: "वर्ग", value: profile.class || "—" },
  ];

  return (
    <div className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col font-sans select-none" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a2e1a]">
        <button onClick={onBack} className="p-1.5 hover:bg-[#1a231a] rounded-full transition-colors cursor-pointer text-white flex items-center justify-center">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">खाते</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Avatar */}
          <div className="flex flex-col items-center py-8 border-b border-[#1a2e1a]">
            <div className="w-20 h-20 rounded-full bg-[#1e4620] border-2 border-[#4ade80] flex items-center justify-center mb-4 text-[#4ade80]">
              <User className="size-10" />
            </div>
            <p className="text-[#d1fae5] text-lg font-bold">{profile.fullName || profile.name || "शिक्षक"}</p>
            <p className="text-[#6b8f6b] text-sm mt-1">{profile.role || "Teacher"}</p>
          </div>

          {/* Info list */}
          <div className="flex-1 px-4 py-3 space-y-0.5">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-[#121a12] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#1e4620] border border-[#2d4a2d] flex items-center justify-center">
                    <Icon className="size-4 text-[#4ade80]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6b8f6b] uppercase tracking-wider font-bold">{label}</p>
                    <p className="text-[#d1fae5] text-[14px] font-medium mt-0.5">{value}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-[#4a5f4a]" />
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="px-5 pb-8 pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-[#1a0e0e] hover:bg-[#2a1414] border border-[#4a2020] text-[#f87171] font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="size-4" />
              लॉगआउट
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
