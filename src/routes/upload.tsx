import {
  createFileRoute,
  useNavigate,
  useSearch,
  Link,
} from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload as UploadIcon,
  FileVideo,
  Globe,
  CheckCircle2,
  Cloud,
  ArrowRight,
  Link as LinkIcon,
  Play,
  Loader2,
  Unlock,
  Gift,
  Crown,
  LayoutDashboard,
  User as UserIcon,
  Sparkles,
  ChevronLeft,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { DOMAINS } from "@/lib/constants";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/upload")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { category?: string; type?: "free" | "paid" } => ({
    category: search.category as string | undefined,
    type: (search.type as "free" | "paid") || "free",
  }),
  head: () => ({
    meta: [
      { title: "Course Details — SMART LEARNING" },
      {
        name: "description",
        content: "Finalize your course details and publish to the world.",
      },
    ],
  }),
  component: AntigravityUploadForm,
});

function AntigravityUploadForm() {
  const search = useSearch({ from: "/upload" });
  const { category: initialCategory = "", type = "free" } = search;
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

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
            role: "uploader",
          } as any,
        });
        return;
      }
      if (!initialCategory) {
        toast.error("Please select a category first");
        navigate({ to: "/courses", search: { action: "upload" } });
      }
      setCategory(initialCategory || "");
    }
  }, [initialCategory, navigate, type, user, profile, authLoading]);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(
            userDoc.data().name || userDoc.data().fullName || "Creator",
          );
        }
      }
    };
    fetchUser();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
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
        createdAt: new Date().toISOString(),
        isFree: type === "free",
        priceType: type,
        status: "pending",
      });

      toast.success(
        `${type === "free" ? "Free" : "Paid"} course published successfully!`,
      );
      navigate({ to: "/courses", search: { action: "upload" } });
    } catch (error: any) {
      toast.error("Failed to upload video metadata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#111827] relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#6C63FF]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#00D4FF]/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#FFB6FF]/5 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white shadow-soft flex flex-col md:flex-row items-center gap-8">
            <div className="size-24 rounded-[2rem] bg-gradient-to-br from-[#6C63FF] to-[#4F46E5] flex items-center justify-center text-white shadow-glow relative">
              <UserIcon className="size-10" />
              <div className="absolute -bottom-2 -right-2 size-8 bg-white rounded-xl shadow-card flex items-center justify-center">
                <Sparkles className="size-4 text-[#FACC15]" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Welcome, <span className="text-[#6C63FF]">{userName}</span> 👋
              </h1>
              <p className="text-[#6B7280] text-lg mt-2 font-medium">
                Ready to empower the world with your expertise today?
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() =>
                navigate({ to: "/courses", search: { action: "upload" } })
              }
              className="flex items-center gap-2 text-sm font-black text-[#6B7280] hover:text-[#111827] uppercase tracking-widest transition-colors"
            >
              <ChevronLeft className="size-5" /> Change Category
            </button>
            <div
              className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-soft ${type === "free" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-purple-200 text-purple-600 bg-purple-50"}`}
            >
              {type} Course • {category}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* ATTRACTIVE SIDEBAR */}
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full lg:w-72 bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-soft h-fit sticky top-32"
            >
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#6C63FF] mb-2">
                  Explore Niches
                </h3>
                <p className="text-[10px] text-[#6B7280] font-medium leading-relaxed">
                  Select the most relevant topic for your expertise.
                </p>
              </div>

              <nav className="space-y-2">
                {DOMAINS.find((d) => d.t === category)?.subcategories.map(
                  (sub) => (
                    <motion.button
                      key={sub}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSubcategory(sub)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all ${subcategory === sub ? "bg-[#6C63FF] text-white shadow-glow-sm scale-[1.02]" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"}`}
                    >
                      <span className="truncate">{sub}</span>
                      {subcategory === sub && (
                        <motion.div
                          layoutId="active-indicator"
                          className="size-1.5 rounded-full bg-white shadow-sm"
                        />
                      )}
                    </motion.button>
                  ),
                )}
              </nav>

              <div className="mt-10 p-5 rounded-[2rem] bg-gradient-to-br from-[#F8FAFF] to-[#F3F4F6] border border-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-soft">
                    <Sparkles className="size-4 text-[#6C63FF]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Pro Tip
                  </span>
                </div>
                <p className="text-[9px] text-[#6B7280] leading-relaxed">
                  Specific subcategories help scholars find your content 3x
                  faster.
                </p>
              </div>
            </motion.aside>

            {/* MAIN FORM */}
            <div className="flex-1">
              <div className="bg-white/60 backdrop-blur-3xl p-10 md:p-14 rounded-[4.5rem] border border-white shadow-soft relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6C63FF]/5 to-transparent rounded-bl-[100px]" />

                <div className="space-y-10">
                  <header>
                    <h2 className="text-4xl font-black tracking-tight">
                      Course <span className="text-[#6C63FF]">Details</span>
                    </h2>
                    <p className="text-[#6B7280] mt-2 font-medium">
                      Ready to publish to{" "}
                      <span className="font-bold text-[#111827]">
                        {subcategory || "..."}
                      </span>
                      ?
                    </p>
                  </header>

                  <form onSubmit={handleUpload} className="space-y-8">
                    <DashboardField
                      label="Course Title"
                      icon={Play}
                      placeholder="e.g. Advanced Quantum Mechanics"
                      value={title}
                      onChange={(e: any) => setTitle(e.target.value)}
                    />

                    <DashboardField
                      label="Video URI"
                      icon={LinkIcon}
                      placeholder="YouTube or Drive link"
                      value={videoLink}
                      onChange={(e: any) => setVideoLink(e.target.value)}
                    />

                    <button
                      type="submit"
                      disabled={loading || !subcategory}
                      className={`w-full py-5 rounded-[2rem] font-black tracking-[0.2em] uppercase text-xs shadow-glow flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 ${type === "free" ? "bg-[#10B981] text-white" : "bg-[#6C63FF] text-white"}`}
                    >
                      {loading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          Publish {subcategory || "Course"} Content{" "}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-8 border-t border-[#F3F4F6]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">
                      Upload Guidelines
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        "High Resolution",
                        "Clear Audio",
                        "Original Work",
                        "Educational Value",
                      ].map((g, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280]"
                        >
                          <div className="size-1 rounded-full bg-[#6C63FF]" />{" "}
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function DashboardField({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] ml-1">
        {label}
      </label>
      <div className="bg-[#F3F4F6] rounded-2xl flex items-center gap-4 px-6 border border-transparent focus-within:border-[#6C63FF]/30 transition-all">
        <Icon className="size-5 text-[#9CA3AF]" />
        <input
          type={type}
          placeholder={placeholder}
          className="bg-transparent outline-none w-full py-5 text-sm font-medium"
          value={value}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
}
