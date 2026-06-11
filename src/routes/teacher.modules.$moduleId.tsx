import {
  createFileRoute,
  Link,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Layout,
  FileText,
  BookOpen,
  Trophy,
  Users,
  Utensils,
  Folder,
  Mic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  Grid,
  User,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Brain,
  Send,
  Save,
  Loader2,
  Star,
  Award,
  Users2,
  PieChart,
  Table,
  Calculator,
  Edit3,
  BookCheck,
  ClipboardList,
  Medal,
  School,
  Gift,
  GraduationCap,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";

export const Route = createFileRoute("/teacher/modules/$moduleId")({
  component: ModulePage,
});

const MODULE_MAP: any = {
  timetable: {
    m: "Class Schedule",
    e: "Institutional Timetable",
    icon: Calendar,
    color: "bg-[#D6B97A]",
  },
  "special-day": {
    m: "Paripath",
    e: "Academic Intelligence",
    icon: Star,
    color: "bg-[#D6B97A]",
  },
  template: {
    m: "Design Hub",
    e: "Template Studio",
    icon: FileText,
    color: "bg-[#D6B97A]",
  },
  "annual-monthly-planning": {
    m: "Academic Planning",
    e: "Strategic Roadmap",
    icon: BookCheck,
    color: "bg-[#D6B97A]",
  },
  "question-bank": {
    m: "Knowledge Bank",
    e: "Exam Preparation",
    icon: ClipboardList,
    color: "bg-[#D6B97A]",
  },

  homework: {
    m: "Assignment Desk",
    e: "Student Engagement",
    icon: BookOpen,
    color: "bg-[#D6B97A]",
  },
  "monthly-meeting": {
    m: "Institutional Briefing",
    e: "Staff Coordination",
    icon: Users2,
    color: "bg-[#D6B97A]",
  },
  "mid-day-meal-(mdm)": {
    m: "Meal Logistics",
    e: "Nutrition Management",
    icon: Utensils,
    color: "bg-[#D6B97A]",
  },
  "teacher-statistics": {
    m: "Professional Analytics",
    e: "Performance Metrics",
    icon: PieChart,
    color: "bg-[#D6B97A]",
  },
  "student-statistics": {
    m: "Student Analytics",
    e: "Enrollment Intelligence",
    icon: Users2,
    color: "bg-[#D6B97A]",
  },
  "daily-activity-record-book": {
    m: "Institutional Diary",
    e: "Daily Activity Log",
    icon: Table,
    color: "bg-[#D6B97A]",
  },
  "sqaf-evaluation": {
    m: "Quality Framework",
    e: "Educational Audit",
    icon: Calculator,
    color: "bg-[#D6B97A]",
  },
  "teaching-record-notebook": {
    m: "Digital Journal",
    e: "Pedagogical Records",
    icon: Edit3,
    color: "bg-[#D6B97A]",
  },
};

function ModulePage() {
  const { moduleId } = useParams({ from: "/teacher/modules/$moduleId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("5th");


  const config = MODULE_MAP[moduleId] || {
    m: moduleId,
    e: moduleId,
    icon: Folder,
    color: "bg-slate-600",
  };

  useEffect(() => {
    async function fetchExistingData() {
      if (!user) return;
      if (!db) {
        toast.error(
          "Database connection unavailable. Please check your internet.",
        );
        setLoading(false);
        return;
      }
      try {
        const tDoc = await getDoc(doc(db, "teachers", user.uid));
        if (tDoc.exists()) {
          const udise = tDoc.data().udise;
          if (udise) {
            const rDoc = await getDoc(
              doc(db, "school_data", `${udise}_${moduleId}`),
            );
            if (rDoc.exists()) {
              setData(rDoc.data().data || "");
            }
          }
        }
      } catch (e) {
        console.error("Data fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchExistingData();
  }, [user, moduleId]);

  const handleSave = async () => {
    if (!user) return;
    if (!db) {
      toast.error("Database connection lost. Changes cannot be committed.");
      return;
    }
    setSaving(true);
    try {
      const tDoc = await getDoc(doc(db, "teachers", user.uid));
      if (!tDoc.exists()) throw new Error("Teacher profile not found");
      const udise = tDoc.data().udise;
      if (!udise) throw new Error("UDISE code missing in profile");

      await setDoc(doc(db, "school_data", `${udise}_${moduleId}`), {
        data,
        updatedAt: new Date().toISOString(),
        resourceId: moduleId,
        udise,
        teacherId: user.uid,
      });

      toast.success(`${config.e} updated successfully!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  if (moduleId === "teaching-record-notebook") {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <TeacherHeader />
        <TeacherSidebar />
        <main className="lg:pl-64 pt-16 min-h-screen">
          <div className="p-6">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-6">
                <Loader2 className="size-10 animate-spin text-indigo-600" />
                <p className="text-[12px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Synchronizing Data...
                </p>
              </div>
            ) : (
              <TeachingRecordNotebookEditor
                data={data}
                onChange={setData}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] relative overflow-hidden flex flex-col pb-20 md:pb-0 font-sans">
      {/* Premium Luxury Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 size-[800px] bg-[#E8DFD1]/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-48 size-[900px] bg-[#C9D8C5]/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-64 left-1/4 size-[800px] bg-[#D6B97A]/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <header className="bg-white/40 backdrop-blur-2xl border-b border-[#E8DFD1]/50 sticky top-0 z-30 px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 md:gap-8">
            <button
              onClick={() => window.history.back()}
              className="size-10 md:size-12 flex items-center justify-center bg-white/50 hover:bg-white rounded-xl md:rounded-2xl transition-all border border-[#E8DFD1]/50 text-[#D6B97A] shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </button>
            <div className="flex items-center gap-3 md:gap-6">
              <div
                className={`size-10 md:size-14 ${config.color} rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-[#D6B97A]/20 ring-4 ring-white/50`}
              >
                <config.icon className="size-5 md:size-7" />
              </div>
              <div>
                <h1 className="font-black text-[#1A1A1A] text-lg md:text-2xl tracking-tight leading-none">
                  {config.m}
                </h1>
                <p className="text-[8px] md:text-[11px] font-bold text-[#D6B97A] uppercase tracking-[0.3em] mt-1 md:mt-2">
                  {config.e}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group flex items-center gap-2 md:gap-4 px-6 md:px-12 py-3 md:py-5 bg-[#1A1A1A] text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#D6B97A] transition-all duration-700 shadow-2xl disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-3 md:size-4 animate-spin" />
              ) : (
                <Save className="size-3 md:size-4 group-hover:rotate-12 transition-transform text-[#D6B97A] group-hover:text-white" />
              )}
              <span className="hidden sm:inline">Commit Sync</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12 md:py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-3xl rounded-[4rem] border border-white/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          {/* Canvas Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#D6B97A]/30 to-transparent" />

          <div className="p-4 md:p-16">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <config.icon className="size-32 md:size-64 text-[#D6B97A]" />
            </div>

            {moduleId !== "teaching-record-notebook" && (
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-20 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-[#D6B97A]/10 flex items-center justify-center text-[#D6B97A]">
                      <Layout className="size-4 md:size-5" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#D6B97A]">
                      Studio Workspace
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter leading-none">
                    Institutional <span className="text-[#D6B97A]">Hub</span>
                  </h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D6B97A]">
                      UDISE Protocol
                    </span>
                    <span className="text-[12px] font-bold text-[#1A1A1A]/40 uppercase tracking-tighter">
                      Academic Year 2024-25
                    </span>
                  </div>
                  <div className="size-16 rounded-[2rem] bg-[#1A1A1A] flex items-center justify-center text-white shadow-2xl ring-4 ring-white">
                    <Sparkles className="size-7" />
                  </div>
                </div>
              </div>
            )}

            {moduleId === "timetable" && (
              <>
                <div className="md:hidden flex items-center justify-center gap-2 mb-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                  <ArrowRight className="size-3" /> Swipe left to see more{" "}
                  <ArrowRight className="size-3" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-[2rem] mb-12 overflow-x-auto no-scrollbar shadow-sm"
                >
                  {["5th", "6th", "7th", "8th", "9th", "10th"].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
                        selectedClass === cls
                          ? "bg-slate-900 text-white shadow-2xl translate-y-[-2px]"
                          : "text-slate-400 hover:text-slate-900 hover:bg-white"
                      }`}
                    >
                      Class {cls}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-6">
                <Loader2 className="size-10 animate-spin text-indigo-600" />
                <p className="text-[12px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Synchronizing Data...
                </p>
              </div>
            ) : moduleId === "timetable" ? (
              <TimetableEditor
                data={data}
                selectedClass={selectedClass}
                onChange={(val: any) => setData(val)}
              />
            ) : moduleId === "special-day" ? (
              <SpecialDayEditor
                data={data}
                onChange={(val: any) => setData(val)}
                loading={loading}
                moduleId={moduleId}
              />
            ) : moduleId === "template" ? (
              <TemplateVisualHub data={data} onChange={setData} />

            ) : moduleId === "mid-day-meal-(mdm)" ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="size-20 rounded-full bg-[#D6B97A]/10 text-[#D6B97A] flex items-center justify-center shadow-inner">
                  <Utensils className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#1A1A1A] italic">
                    Mid-Day Meal (MDM) Portal
                  </h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">
                    Access the interactive meal distribution registers, food
                    stock inventory ledgers, helper records, and autogenerated
                    reports.
                  </p>
                </div>
                <Link
                  to="/teacher/mdm"
                  className="px-10 py-5 bg-[#1A1A1A] hover:bg-[#D6B97A] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl"
                >
                  Access MDM Workspace
                </Link>
              </div>
            ) : moduleId === "teaching-record-notebook" ? (
              <TeachingRecordNotebookEditor
                data={data}
                onChange={setData}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Grid className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    Module Under Construction
                  </h3>
                  <p className="text-slate-500 font-medium">
                    We're building something amazing here. Please check back
                    soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-20 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl z-50 flex items-center justify-around px-8">
        <Link to="/teacher" className="p-3 text-slate-400">
          <Home className="size-6" />
        </Link>
        <button
          className={`p-4 rounded-2xl ${config.color} text-white shadow-lg`}
        >
          <config.icon className="size-6" />
        </button>
        <Link to="/profile" className="p-3 text-slate-400">
          <User className="size-6" />
        </Link>
      </nav>
    </div>
  );
}

function TimetableEditor({
  data,
  selectedClass,
  onChange,
}: {
  data: any;
  selectedClass: string;
  onChange: (val: any) => void;
}) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const accentColors = [
    {
      border: "from-[#D6B97A] to-[#C4A661]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#D6B97A]",
      shadow: "shadow-[#D6B97A]/10",
    },
    {
      border: "from-[#C9D8C5] to-[#B8C7B4]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#7A8A76]",
      shadow: "shadow-[#C9D8C5]/10",
    },
    {
      border: "from-[#E8DFD1] to-[#D7CEC0]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#8A7A66]",
      shadow: "shadow-[#E8DFD1]/10",
    },
    {
      border: "from-[#D6B97A] to-[#C4A661]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#D6B97A]",
      shadow: "shadow-[#D6B97A]/10",
    },
    {
      border: "from-[#C9D8C5] to-[#B8C7B4]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#7A8A76]",
      shadow: "shadow-[#C9D8C5]/10",
    },
    {
      border: "from-[#E8DFD1] to-[#D7CEC0]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#8A7A66]",
      shadow: "shadow-[#E8DFD1]/10",
    },
    {
      border: "from-[#D6B97A] to-[#C4A661]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#D6B97A]",
      shadow: "shadow-[#D6B97A]/10",
    },
    {
      border: "from-[#C9D8C5] to-[#B8C7B4]",
      bg: "bg-[#FAFAF7]",
      text: "text-[#7A8A76]",
      shadow: "shadow-[#C9D8C5]/10",
    },
  ];

  const safeData = typeof data === "object" && data !== null ? data : {};

  const handleCellChange = (
    day: string,
    period: number,
    field: string,
    value: string,
  ) => {
    const updatedData = { ...safeData };
    if (!updatedData[selectedClass]) updatedData[selectedClass] = {};
    if (!updatedData[selectedClass][day]) updatedData[selectedClass][day] = {};
    if (!updatedData[selectedClass][day][period])
      updatedData[selectedClass][day][period] = {};

    updatedData[selectedClass][day][period][field] = value;
    onChange(updatedData);
  };

  return (
    <div className="space-y-12">
      <div className="overflow-x-auto pb-16 no-scrollbar -mx-8 md:-mx-14 px-8 md:px-14">
        <div className="min-w-[1200px] bg-white/40 backdrop-blur-2xl rounded-[4rem] border border-white shadow-2xl overflow-hidden">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#FAFAF7] border-b border-[#E8DFD1]">
                <th className="p-10 text-left border-r border-[#E8DFD1]/50 w-[140px]">
                  <span className="text-[10px] font-black text-[#D6B97A] uppercase tracking-[0.4em]">
                    Chronicle
                  </span>
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-10 text-center border-r border-[#E8DFD1]/50 last:border-0"
                  >
                    <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.4em]">
                      {day}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr
                  key={p}
                  className="group hover:bg-[#FAFAF7]/50 transition-colors duration-500"
                >
                  <td className="p-10 border-r border-[#E8DFD1]/50 bg-[#FAFAF7]/30">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div
                        className={`size-14 rounded-2xl ${accentColors[p - 1].bg} flex items-center justify-center border border-[#E8DFD1]/50 shadow-sm ring-4 ring-white/50 group-hover:scale-110 transition-transform`}
                      >
                        <span
                          className={`text-lg font-black ${accentColors[p - 1].text}`}
                        >
                          {p}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-[#D6B97A]/60 uppercase tracking-widest">
                        Period
                      </span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const cell = safeData[selectedClass]?.[day]?.[p] || {
                      subject: "",
                      teacher: "",
                    };
                    return (
                      <td
                        key={day}
                        className="p-4 border-r border-[#E8DFD1]/50 last:border-0"
                      >
                        <div className="p-6 rounded-[2.5rem] transition-all duration-500 border border-transparent focus-within:border-[#D6B97A]/30 focus-within:bg-white focus-within:shadow-xl group-hover:bg-white/40">
                          <div className="relative mb-4">
                            <input
                              type="text"
                              placeholder="Academic Discipline..."
                              className="w-full bg-transparent text-base font-black text-[#1A1A1A] placeholder:text-[#D6B97A]/40 outline-none"
                              value={cell.subject}
                              onChange={(e) =>
                                handleCellChange(
                                  day,
                                  p,
                                  "subject",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D6B97A] group-hover:w-full transition-all duration-700 opacity-20" />
                          </div>
                          <div className="flex items-center gap-3 opacity-60 focus-within:opacity-100 transition-opacity">
                            <div className="size-6 rounded-lg bg-[#F8F5EF] flex items-center justify-center border border-[#E8DFD1]/50">
                              <User className="size-3 text-[#D6B97A]" />
                            </div>
                            <input
                              type="text"
                              placeholder="Instructor"
                              className="w-full bg-transparent text-[11px] font-bold text-[#8A7A66] placeholder:text-[#D6B97A]/30 outline-none"
                              value={cell.teacher}
                              onChange={(e) =>
                                handleCellChange(
                                  day,
                                  p,
                                  "teacher",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TemplateVisualHub({
  data,
  onChange,
}: {
  data: any;
  onChange: (val: any) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeVariant, setActiveVariant] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize with fallback for SSR
  const [safeData, setSafeData] = useState<any>(() => {
    const defaultFields = {
      name: "Aryan Sharma",
      class: "Grade 4",
      division: "A",
      school: "Royal Academy of Excellence",
      date: "May 24, 2026",
      message:
        "Wishing you a year filled with academic brilliance and joyous discoveries!",
      rank: "1st",
      percentage: "98.4%",
      instructor: "Dr. Elena Gilbert",
      course: "Advanced Sciences",
      festival: "Ganesh Chaturthi",
      event: "Annual Sports Meet",
      year: "2025-26",
    };

    if (typeof window === "undefined") {
      return { studentPhoto: null, editFields: defaultFields };
    }

    return typeof data === "object" && data !== null
      ? data
      : {
          studentPhoto: localStorage.getItem("school_template_photo"),
          editFields:
            JSON.parse(
              localStorage.getItem("school_template_fields") || "null",
            ) || defaultFields,
        };
  });

  // Sync safeData with incoming data prop
  useEffect(() => {
    if (typeof data === "object" && data !== null) {
      setSafeData(data);
    }
  }, [data]);

  const studentPhoto = safeData.studentPhoto;
  const editFields = safeData.editFields;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newData = { ...safeData, studentPhoto: base64 };
        onChange(newData);
        localStorage.setItem("school_template_photo", base64);
        toast.success("Identity portrait synchronized!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newData = { ...safeData, studentPhoto: base64 };
        onChange(newData);
        localStorage.setItem("school_template_photo", base64);
        toast.success("Identity portrait synchronized!");
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: string, value: string) => {
    const newFields = { ...editFields, [field]: value };
    const newData = { ...safeData, editFields: newFields };
    onChange(newData);
    localStorage.setItem("school_template_fields", JSON.stringify(newFields));
  };

  interface Template {
    id: string;
    category: string;
    title: string;
    icon: any;
    color: string;
    desc: string;
  }

  const templates: Template[] = [
    {
      id: "bday-1",
      category: "birthday",
      title: "Royal Birthday",
      icon: Star,
      color: "bg-amber-500",
      desc: "Celebrate milestones with style.",
    },
    {
      id: "adm-1",
      category: "admission",
      title: "Institutional Welcome",
      icon: Award,
      color: "bg-blue-600",
      desc: "Official welcome for new scholars.",
    },
    {
      id: "cert-1",
      category: "certificate",
      title: "Mastery Proof",
      icon: BookOpen,
      color: "bg-slate-900",
      desc: "Formal certification of achievement.",
    },
    {
      id: "sports-1",
      category: "sports",
      title: "Champion Call",
      icon: Trophy,
      color: "bg-rose-600",
      desc: "For sports excellence and spirit.",
    },
    {
      id: "cult-1",
      category: "cultural",
      title: "Stage Magic",
      icon: Mic,
      color: "bg-violet-600",
      desc: "Spotlight on artistic brilliance.",
    },
    {
      id: "rank-1",
      category: "topper",
      title: "Elite Merit",
      icon: Medal,
      color: "bg-emerald-600",
      desc: "Honoring academic top rankers.",
    },
    {
      id: "fest-1",
      category: "festival",
      title: "Festive Joy",
      icon: Sparkles,
      color: "bg-orange-500",
      desc: "Cultural celebration announcements.",
    },
  ];

  return (
    <div className="space-y-12 md:space-y-20 font-sans">
      {/* Search & Navigation Hub */}
      <div className="flex flex-col gap-8 relative z-10">
        <div className="relative group max-w-2xl mx-auto w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D6B97A] via-[#E8DFD1] to-[#D6B97A] rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Design Templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-5 md:py-7 bg-white/80 backdrop-blur-xl border-2 border-white rounded-2xl md:rounded-[2.5rem] text-xs md:text-sm font-bold text-[#111827] outline-none focus:ring-4 focus:ring-[#D6B97A]/10 transition-all shadow-2xl"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D6B97A]">
              <Sparkles className="size-6 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-3 p-1">
          {[
            "all",
            "birthday",
            "admission",
            "certificate",
            "sports",
            "cultural",
            "topper",
            "festival",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border-2 ${
                activeTab === tab
                  ? "bg-[#111827] text-white border-[#111827] shadow-2xl scale-105"
                  : "bg-white text-[#111827]/40 border-transparent hover:border-[#E8DFD1]/50 hover:text-[#111827]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 md:gap-20">
        {/* Atelier Editor Section */}
        {activeTab !== "all" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/40 backdrop-blur-3xl rounded-[3rem] md:rounded-[4rem] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden group"
          >
            {/* Decorative Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -top-24 -right-24 size-64 bg-[#D6B97A]/10 rounded-full blur-[100px]" />

            <div className="p-6 md:p-14 space-y-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  <div className="size-14 md:size-16 rounded-2xl md:rounded-[1.5rem] bg-[#111827] flex items-center justify-center text-white shadow-2xl ring-4 ring-white shrink-0">
                    <Edit3 className="size-6 md:size-8 text-[#D6B97A]" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tighter">
                      Design <span className="text-[#D6B97A]">Atelier</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D6B97A]/60">
                      Studio Precision
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 bg-white/60 rounded-2xl border border-white shadow-sm">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111827]/40">
                    Active Session
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Universal Fields */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                    Full Identity
                  </label>
                  <input
                    type="text"
                    value={editFields.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                    placeholder="Enter Full Name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                    Academic Placement
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Grade (e.g. Grade 4)"
                      value={editFields.class}
                      onChange={(e) => updateField("class", e.target.value)}
                      className="flex-[2] px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Div (e.g. A)"
                      value={editFields.division}
                      onChange={(e) => updateField("division", e.target.value)}
                      className="flex-1 px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category Specific Fields */}
                {activeTab === "certificate" && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={editFields.course}
                        onChange={(e) => updateField("course", e.target.value)}
                        className="w-full px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                        Lead Instructor
                      </label>
                      <input
                        type="text"
                        value={editFields.instructor}
                        onChange={(e) =>
                          updateField("instructor", e.target.value)
                        }
                        className="w-full px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {activeTab === "topper" && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                        Merit Rank
                      </label>
                      <input
                        type="text"
                        value={editFields.rank}
                        onChange={(e) => updateField("rank", e.target.value)}
                        className="w-full px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                        Performance %
                      </label>
                      <input
                        type="text"
                        value={editFields.percentage}
                        onChange={(e) =>
                          updateField("percentage", e.target.value)
                        }
                        className="w-full px-8 py-5 bg-[#F8F5EF]/50 border-2 border-transparent rounded-2xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                    Digital Manuscript
                  </label>
                  <textarea
                    value={editFields.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full h-32 px-8 py-6 bg-[#F8F5EF]/50 border-2 border-transparent rounded-3xl text-sm font-bold text-[#111827] focus:border-[#D6B97A] focus:bg-white outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <label className="text-[10px] font-black text-[#111827] uppercase tracking-[0.3em] ml-2">
                    Identity Portrait
                  </label>
                  <div 
                    className="flex flex-col items-center justify-center gap-8 p-8 md:p-12 bg-[#F8F5EF]/30 border-2 border-dashed border-[#D6B97A]/30 rounded-[3rem]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handlePhotoDrop}
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <button
                        onClick={() =>
                          document.getElementById("photo-input")?.click()
                        }
                        className="w-full sm:w-auto px-12 py-6 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D6B97A] transition-all flex items-center justify-center gap-4 group shadow-2xl"
                      >
                        <Plus className="size-5 group-hover:rotate-90 transition-transform text-[#D6B97A]" />
                        {studentPhoto ? "Update Portrait" : "Upload Portrait"}
                      </button>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Supports PNG, JPG (Max 5MB)
                      </p>
                    </div>

                    <input
                      id="photo-input"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />

                    {studentPhoto && (
                      <div className="size-32 md:size-40 rounded-[2.5rem] border-8 border-white shadow-3xl overflow-hidden ring-8 ring-[#D6B97A]/5">
                        <img
                          src={studentPhoto}
                          className="w-full h-full object-cover"
                          alt="Portrait"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, idx) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveTab(t.category)}
                className="group relative h-[420px] rounded-[3rem] bg-white border border-white p-10 text-left transition-all duration-700 shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(214,185,122,0.3)] overflow-hidden hover:-translate-y-4"
              >
                {/* Card Background Bloom */}
                <div
                  className={`absolute -top-20 -right-20 size-64 ${t.color} opacity-[0.03] rounded-full blur-[80px] group-hover:opacity-10 transition-opacity duration-700`}
                />

                <div
                  className={`size-20 ${t.color} rounded-[1.5rem] flex items-center justify-center text-white mb-10 shadow-2xl shadow-[#111827]/10 group-hover:rotate-[15deg] transition-transform duration-700`}
                >
                  <t.icon className="size-10" />
                </div>

                <div className="space-y-4 relative z-10">
                  <h4 className="text-3xl font-black text-[#111827] tracking-tighter leading-none">
                    {t.title}
                  </h4>
                  <p className="text-[11px] font-bold text-[#111827]/40 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                    {t.desc}
                  </p>
                </div>

                <div className="absolute bottom-10 left-10 flex items-center gap-4">
                  <div className="px-4 py-2 bg-[#F8F5EF] rounded-full text-[9px] font-black uppercase tracking-widest text-[#D6B97A]">
                    Template v2.0
                  </div>
                </div>

                <div className="absolute bottom-10 right-10 size-14 rounded-2xl bg-[#111827] flex items-center justify-center text-[#D6B97A] opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-700 shadow-2xl">
                  <ArrowRight className="size-6" />
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Digital Twin Preview Hub */}
        {activeTab !== "all" && (
          <div className="relative space-y-12 flex flex-col items-center py-20 px-4 md:px-10 bg-[#111827]/[0.02] rounded-[5rem] border border-white/50 overflow-hidden">
            {/* Cinematic Spotlight Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-[#D6B97A]/5 rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between w-full max-w-2xl px-10 py-6 bg-[#111827] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4">
                <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D6B97A]">
                  Digital Twin Engine v2.4
                </span>
              </div>
              <div className="flex gap-3">
                <div className="size-2 rounded-full bg-white/20" />
                <div className="size-2 rounded-full bg-white/10" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeVariant}`}
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                className="relative aspect-[3/4.2] w-full max-w-[550px] rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] md:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] border-8 md:border-[16px] border-white bg-white group"
              >
                {/* Distinct Template Renderers */}
                {activeTab === "birthday" && (
                  <div className="h-full bg-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    {/* Animated Celebratory Orbs */}
                    <motion.div
                      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-10 left-10 size-40 bg-amber-200/40 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-20 right-10 size-48 bg-orange-200/30 rounded-full blur-3xl"
                    />

                    <div className="relative z-10 w-full h-full border-[2px] border-amber-100 rounded-[3rem] p-8 flex flex-col items-center justify-center">
                      <div className="mb-10 relative">
                        <div className="absolute -inset-4 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                        <Sparkles className="size-16 text-amber-500 relative z-10" />
                      </div>

                      <h3 className="text-5xl font-black text-[#111827] tracking-[0.2em] mb-12 leading-none uppercase">
                        Happy
                        <br />
                        <span className="text-amber-500">Birthday</span>
                      </h3>

                      <div className="size-48 md:size-64 rounded-full border-[12px] border-white shadow-[0_32px_64px_-16px_rgba(214,185,122,0.4)] overflow-hidden mb-10 ring-[16px] ring-amber-50/50">
                        {studentPhoto ? (
                          <img
                            src={studentPhoto}
                            className="w-full h-full object-cover"
                            alt="Student"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                            <User className="size-16 md:size-20" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-4xl font-black text-[#111827] tracking-tight">
                          {editFields.name}
                        </h2>
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#111827] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                          Class {editFields.class} • Div {editFields.division}
                        </div>
                      </div>

                      <p className="mt-10 text-sm font-medium text-slate-500 italic max-w-[280px] leading-relaxed">
                        "{editFields.message}"
                      </p>

                      <div className="mt-auto pt-8 w-full border-t border-amber-100/50 flex flex-col items-center gap-2">
                        <div className="size-2 rounded-full bg-amber-500/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#111827]">
                          {editFields.school}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "admission" && (
                  <div className="h-full bg-[#111827] flex flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-transparent to-transparent opacity-40" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

                    <div className="relative z-10 w-full h-full border border-white/10 rounded-[3.5rem] p-8 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="size-24 rounded-[2rem] bg-white text-indigo-600 flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                      >
                        <GraduationCap className="size-12" />
                      </motion.div>

                      <div className="space-y-4 mb-12">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-300">
                          Scholastic Admission
                        </h4>
                        <h3 className="text-5xl font-black tracking-tighter uppercase leading-none">
                          Welcome
                          <br />
                          <span className="text-indigo-400">Genius</span>
                        </h3>
                      </div>

                      <div className="size-48 md:size-60 rounded-[2.5rem] border-[8px] border-white/10 p-2 bg-white/5 mb-12 shadow-3xl">
                        <div className="w-full h-full rounded-[2rem] border-4 border-white overflow-hidden">
                          {studentPhoto ? (
                            <img
                              src={studentPhoto}
                              className="w-full h-full object-cover"
                              alt="Student"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                              <User className="size-16 md:size-24" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tight">
                          {editFields.name}
                        </h2>
                        <div className="inline-flex px-8 py-3 bg-white text-[#111827] rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                          Grade {editFields.class} • Section{" "}
                          {editFields.division}
                        </div>
                      </div>

                      <div className="mt-auto opacity-30 text-[9px] font-black uppercase tracking-[0.5em] border-t border-white/10 pt-8 w-full">
                        {editFields.school}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "certificate" && (
                  <div className="h-full bg-[#FDFCFB] border-[24px] border-[#111827] flex flex-col items-center justify-between p-12 text-center text-[#111827] relative">
                    <div className="absolute inset-0 border border-[#111827]/10 m-4 pointer-events-none" />
                    <div className="absolute inset-0 border-4 border-[#111827]/5 m-8 pointer-events-none" />

                    <div className="flex flex-col items-center gap-6 mt-6">
                      <Trophy className="size-20 text-amber-500 drop-shadow-xl" />
                      <div className="size-2 w-32 bg-amber-500/20 rounded-full" />
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">
                        Merit Certification
                      </h4>
                      <p className="text-sm font-serif italic text-slate-500 px-10 leading-relaxed">
                        This prestigious document is awarded to
                      </p>
                      <h2 className="text-5xl font-serif italic border-b-4 border-[#111827] pb-4 px-12 leading-none inline-block">
                        {editFields.name}
                      </h2>
                      <p className="text-sm font-serif italic text-slate-500 px-10 leading-relaxed mt-4">
                        for demonstrating exceptional mastery in
                      </p>
                      <h3 className="text-3xl font-black tracking-tight uppercase text-amber-600">
                        {editFields.course}
                      </h3>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-12 pt-12 border-t border-[#111827]/5 mb-6">
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase">
                          {editFields.instructor}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                          Institutional Lead
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase">
                          {editFields.date}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                          Validation Date
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20">
                      <p className="text-[8px] font-black uppercase tracking-[0.5em]">
                        {editFields.school}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "sports" && (
                  <div className="h-full bg-[#111827] flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10" />

                    <div className="relative z-10 w-full h-full border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center">
                      <div className="flex justify-between items-start w-full mb-12">
                        <div className="size-16 rounded-2xl bg-amber-500 text-[#111827] flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                          <Trophy className="size-10" />
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">
                            {editFields.event}
                          </p>
                          <p className="text-xs font-bold text-white/40 uppercase">
                            {editFields.year}
                          </p>
                        </div>
                      </div>

                      <div className="size-48 md:size-64 rounded-full border-[10px] border-white shadow-[0_0_60px_rgba(255,255,255,0.1)] overflow-hidden mb-12 relative group-hover:scale-105 transition-transform duration-700 ring-8 ring-rose-500/20">
                        {studentPhoto ? (
                          <img
                            src={studentPhoto}
                            className="w-full h-full object-cover"
                            alt="Student"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <User className="size-16 md:size-24" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-rose-600 to-transparent opacity-80" />
                      </div>

                      <h2 className="text-6xl font-black tracking-tighter uppercase italic drop-shadow-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                        {editFields.name}
                      </h2>

                      <div className="px-12 py-4 bg-white text-[#111827] rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-3xl flex items-center gap-4">
                        <div className="size-2 rounded-full bg-rose-600 animate-ping" />
                        Elite Champion • {editFields.rank}
                      </div>

                      <div className="mt-auto w-full flex justify-between items-center opacity-20 text-[9px] font-black uppercase tracking-[0.5em] border-t border-white/10 pt-8">
                        <span>Physical Excellence</span>
                        <span>{editFields.school}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "topper" && (
                  <div className="h-full bg-[#0F172A] flex flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                    <div className="relative z-10 w-full h-full border border-white/10 rounded-[3.5rem] p-10 flex flex-col items-center justify-center">
                      <div className="inline-flex items-center gap-3 px-8 py-3 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] mb-12">
                        <Medal className="size-5" /> Academic Titan
                      </div>

                      <div className="size-48 md:size-60 rounded-full border-[16px] border-emerald-500/10 p-2 mb-12">
                        <div className="w-full h-full rounded-full border-[8px] border-white shadow-3xl overflow-hidden ring-[12px] ring-emerald-500/5">
                          {studentPhoto ? (
                            <img
                              src={studentPhoto}
                              className="w-full h-full object-cover"
                              alt="Student"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <User className="size-16 md:size-24" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                          {editFields.name}
                        </h2>
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-emerald-400 text-lg font-black tracking-[0.5em]">
                            {editFields.percentage}
                          </p>
                          <div className="px-6 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-200">
                            State Rank {editFields.rank}
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] max-w-[320px]">
                        <p className="text-xs font-medium text-emerald-100/60 leading-relaxed italic">
                          "Excellence is not an act, but a habit. Recognized for
                          the academic cycle {editFields.year}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "cultural" && (
                  <div className="h-full bg-[#2E1065] flex flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-transparent to-transparent opacity-60" />
                    <div className="absolute -bottom-20 -left-20 size-80 bg-indigo-500/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 w-full h-full border border-white/10 rounded-[4rem] p-10 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="size-24 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center mb-10 shadow-2xl"
                      >
                        <Mic className="size-12 text-fuchsia-400" />
                      </motion.div>

                      <div className="space-y-4 mb-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-fuchsia-300">
                          Cultural Prodigy
                        </h4>
                        <h3 className="text-5xl font-black tracking-tighter mb-10 leading-none">
                          THEATRE
                          <br />
                          <span className="text-fuchsia-400">LEGEND</span>
                        </h3>
                      </div>

                      <div className="size-48 md:size-56 rounded-[3rem] border-[12px] border-white shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden mb-12 relative -rotate-3 group-hover:rotate-0 transition-transform duration-700 ring-8 ring-fuchsia-500/10">
                        {studentPhoto ? (
                          <img
                            src={studentPhoto}
                            className="w-full h-full object-cover"
                            alt="Student"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <User className="size-16 md:size-24" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tight">
                          {editFields.name}
                        </h2>
                        <div className="px-8 py-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-2xl">
                          {editFields.event}
                        </div>
                      </div>

                      <div className="mt-auto opacity-20 text-[9px] font-black uppercase tracking-[0.6em] border-t border-white/10 pt-8 w-full">
                        {editFields.school}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "festival" && (
                  <div className="h-full bg-[#1A1110] flex flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-600/30 via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/criss-xcross.png')] opacity-10" />

                    <div className="relative z-10 w-full h-full border border-orange-500/20 rounded-[4rem] p-10 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative mb-12"
                      >
                        <div className="absolute -inset-10 bg-orange-500/20 rounded-full blur-[40px] animate-pulse" />
                        <Sparkles className="size-20 text-orange-400 relative z-10" />
                      </motion.div>

                      <h3 className="text-5xl font-black text-orange-200 tracking-[0.3em] uppercase mb-12 leading-none">
                        {editFields.festival}
                      </h3>

                      <div className="size-48 md:size-60 rounded-[3rem] border-[16px] border-orange-950 p-3 bg-orange-900/20 mb-12 shadow-[0_0_80px_rgba(234,88,12,0.2)] ring-8 ring-orange-500/10">
                        <div className="w-full h-full rounded-[2rem] border-4 border-orange-400/30 overflow-hidden shadow-inner">
                          {studentPhoto ? (
                            <img
                              src={studentPhoto}
                              className="w-full h-full object-cover"
                              alt="Student"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/40 flex items-center justify-center">
                              <User className="size-16 md:size-24 text-white/20" />
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-2xl font-serif italic text-orange-50/90 leading-relaxed max-w-[340px] mb-12 drop-shadow-lg">
                        "{editFields.message}"
                      </p>

                      <div className="mt-auto opacity-40 text-[10px] font-black uppercase tracking-[0.8em] text-orange-200/60 border-t border-orange-500/10 pt-8 w-full">
                        {editFields.school}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Bar Hub */}
            <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-[#E8DFD1] rounded-[2.5rem] shadow-2xl">
              <button
                onClick={() =>
                  toast.success("Opening Digital Asset Gallery...")
                }
                className="w-full sm:flex-1 py-5 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D6B97A] transition-all flex items-center justify-center gap-3"
              >
                <Layout className="size-4" /> Full View Studio
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={() => toast.success("Asset Committed to Database")}
                  className="flex-1 sm:size-16 size-14 bg-[#F8F5EF] text-[#111827] rounded-2xl flex items-center justify-center hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                  title="Save"
                >
                  <Save className="size-6" />
                </button>
                <button
                  onClick={() => toast.success("Asset URL Copied")}
                  className="flex-1 sm:size-16 size-14 bg-[#F8F5EF] text-[#111827] rounded-2xl flex items-center justify-center hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                  title="Share"
                >
                  <Send className="size-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialDayEditor({
  data,
  onChange,
  loading,
  moduleId,
}: {
  data: any;
  onChange: (val: any) => void;
  loading: boolean;
  moduleId: string;
}) {
  const [activeSection, setActiveSection] = useState("thought");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lang, setLang] = useState<"en" | "mr">("en");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const safeData =
    typeof data === "object" && data !== null
      ? data
      : {
          thought: { en: "", mr: "" },
          story: { en: "", mr: "" },
          joke: { en: "", mr: "" },
          news: { en: "", mr: "" },
          significance: { en: "", mr: "" },
        };

  const updateField = (field: string, value: string) => {
    const updated = { ...safeData };
    if (!updated[field]) updated[field] = { en: "", mr: "" };
    updated[field][lang] = value;
    onChange(updated);
  };

  const generateSection = (key: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const daySeed =
        now.getDate() + now.getMonth() * 31 + now.getFullYear() * 366;

      let libKey = key;
      if (key === "thought") libKey = "thoughts";
      if (key === "story") libKey = "stories";
      if (key === "joke") libKey = "jokes";

      const pool = DAILY_INTELLIGENCE_LIBRARY[libKey];
      if (pool && pool.length > 0) {
        const updated = { ...safeData };
        updated[key] = pool[daySeed % pool.length];
        onChange(updated);
        toast.success(
          `${key.charAt(0).toUpperCase() + key.slice(1)} synchronized!`,
        );
      }
      setIsGenerating(false);
    }, 800);
  };

  const autoFillIntelligence = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const daySeed =
        now.getDate() + now.getMonth() * 31 + now.getFullYear() * 366;

      const updated: any = {};
      ["thought", "story", "significance", "news", "joke"].forEach((key) => {
        let libKey = key;
        if (key === "thought") libKey = "thoughts";
        if (key === "story") libKey = "stories";
        if (key === "joke") libKey = "jokes";

        const pool = DAILY_INTELLIGENCE_LIBRARY[libKey];
        if (pool && pool.length > 0) {
          updated[key] = pool[daySeed % pool.length];
        }
      });
      onChange(updated);
      setIsGenerating(false);
      toast.success("Daily Intelligence Synchronized!");
    }, 1500);
  };

  // Improved Empty Check for Bilingual Objects
  useEffect(() => {
    if (loading) return; // Wait for Firebase load

    const isActuallyEmpty = (field: any) => {
      if (!field) return true;
      if (typeof field === "string") return !field;
      if (typeof field === "object") return !field.en && !field.mr;
      return true;
    };

    const isEmpty =
      isActuallyEmpty(safeData.thought) &&
      isActuallyEmpty(safeData.story) &&
      isActuallyEmpty(safeData.joke) &&
      isActuallyEmpty(safeData.news) &&
      isActuallyEmpty(safeData.significance);

    if (isEmpty) {
      autoFillIntelligence();
    }
  }, [loading, moduleId]); // Re-run when moduleId changes or loading finishes

  const sections = [
    {
      id: "thought",
      label: "Thought of the Day",
      sub: "Suvichar",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-50",
      gradient: "from-amber-50 to-white",
    },
    {
      id: "story",
      label: "Motivational Story",
      sub: "Daily Inspiration",
      icon: BookOpen,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      gradient: "from-indigo-50 to-white",
    },
    {
      id: "significance",
      label: "Dinvishesh",
      sub: "Historical Significance",
      icon: Star,
      color: "text-rose-500",
      bg: "bg-rose-50",
      gradient: "from-rose-50 to-white",
    },
    {
      id: "news",
      label: "Today's News",
      sub: "Important Updates",
      icon: FileText,
      color: "text-teal-500",
      bg: "bg-teal-50",
      gradient: "from-teal-50 to-white",
    },
    {
      id: "joke",
      label: "Joke of the Day",
      sub: "Morning Humor",
      icon: Mic,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      gradient: "from-emerald-50 to-white",
    },
  ];

  const current = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="flex flex-col lg:flex-row gap-12 min-h-[700px]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-96 flex flex-col gap-4">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`p-8 rounded-[3rem] text-left transition-all duration-700 flex items-center gap-6 border-2 relative overflow-hidden group ${
              activeSection === s.id
                ? "bg-white border-[#D6B97A] shadow-[0_32px_64px_-16px_rgba(214,185,122,0.2)] scale-[1.05]"
                : "bg-white/40 border-transparent hover:bg-white hover:border-[#E8DFD1]"
            }`}
          >
            <div
              className={`size-14 rounded-2xl ${activeSection === s.id ? "bg-[#D6B97A] text-white" : "bg-[#F8F5EF] text-[#D6B97A]"} flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform duration-500`}
            >
              <s.icon className="size-7" />
            </div>
            <div>
              <p
                className={`text-[11px] font-black uppercase tracking-[0.3em] ${activeSection === s.id ? "text-[#1A1A1A]" : "text-[#D6B97A]/60"}`}
              >
                {s.label}
              </p>
              <p className="text-[10px] font-bold text-[#D6B97A]/40 uppercase tracking-tighter mt-1">
                {s.sub}
              </p>
            </div>
            {activeSection === s.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute right-6 size-2.5 rounded-full bg-[#D6B97A] shadow-[0_0_15px_#D6B97A]"
              />
            )}
          </button>
        ))}
      </aside>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeSection}
          initial={{ opacity: 0, x: 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="flex-1 bg-white/60 backdrop-blur-3xl rounded-[4rem] border border-white shadow-2xl overflow-hidden flex flex-col relative z-10"
        >
          <header
            className={`p-12 bg-gradient-to-br ${current.gradient} border-b border-[#E8DFD1]/30 flex flex-col xl:flex-row xl:items-center justify-between gap-8`}
          >
            <div className="flex items-center gap-8">
              <motion.div
                layoutId={`icon-${current.id}`}
                className={`size-20 rounded-[2.5rem] bg-[#1A1A1A] text-[#D6B97A] flex items-center justify-center shadow-2xl ring-8 ring-white/50`}
              >
                <current.icon className="size-10" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                  {current.label}
                </h3>
                <p className="text-[11px] font-black text-[#D6B97A] uppercase tracking-[0.4em] mt-2">
                  {current.sub}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6">
              <div className="flex bg-[#F8F5EF] p-2 rounded-[2rem] border border-[#E8DFD1]/50 shadow-inner">
                <button
                  onClick={() => setLang("en")}
                  className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${lang === "en" ? "bg-white text-[#D6B97A] shadow-md" : "text-[#D6B97A]/40 hover:text-[#D6B97A]"}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("mr")}
                  className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${lang === "mr" ? "bg-white text-[#D6B97A] shadow-md" : "text-[#D6B97A]/40 hover:text-[#D6B97A]"}`}
                >
                  Marathi
                </button>
              </div>

              <div className="flex items-center gap-4 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white text-[10px] font-black uppercase tracking-[0.3em] text-[#D6B97A] shadow-sm">
                <Calendar className="size-4" />
                {currentTime.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                <div className="w-[1px] h-4 bg-[#E8DFD1] mx-2" />
                <Clock className="size-4" />
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </header>

          <div className="flex-1 p-12 space-y-8">
            <div className="flex items-center justify-between px-8 py-5 bg-[#FAFAF7] border border-[#E8DFD1]/40 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => generateSection(activeSection)}
                  disabled={isGenerating}
                  className="flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] text-[#F8F5EF] text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-[#D6B97A] hover:text-white transition-all duration-500 shadow-xl disabled:opacity-50"
                >
                  <Sparkles className="size-4" />
                  {isGenerating ? "Curating..." : "AI Oracle"}
                </button>
                <button
                  onClick={() =>
                    (
                      document.querySelector("textarea") as HTMLTextAreaElement
                    )?.focus()
                  }
                  className="flex items-center gap-3 px-8 py-4 bg-white border border-[#E8DFD1]/50 text-[#D6B97A] text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:border-[#D6B97A] transition-all duration-500 shadow-sm"
                >
                  <Edit3 className="size-4" />
                  Manual Scroll
                </button>
              </div>
              <button
                onClick={() => updateField(activeSection, "")}
                className="flex items-center gap-2 px-6 py-3 text-[#D6B97A]/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all duration-500"
              >
                Purge Content
              </button>
            </div>

            <div className="relative group flex-1 flex flex-col">
              <div className="absolute -top-4 left-10 px-5 py-2 bg-[#1A1A1A] text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] z-10 shadow-xl">
                {lang === "en" ? "Anglicized Manuscript" : "Vedic Manuscript"}
              </div>
              <textarea
                className={`w-full flex-1 p-8 md:p-12 bg-white/40 border-2 border-transparent focus:border-[#D6B97A]/30 rounded-[2.5rem] md:rounded-[3.5rem] outline-none focus:bg-white transition-all text-xl md:text-2xl text-[#1A1A1A] font-medium leading-relaxed resize-none shadow-inner ${isGenerating ? "animate-pulse opacity-50" : ""}`}
                placeholder={
                  isGenerating
                    ? "Transcribing universal knowledge..."
                    : `Document your daily ${current.label.toLowerCase()} in ${lang === "en" ? "English" : "Marathi"}...`
                }
                value={safeData[activeSection]?.[lang] || ""}
                onChange={(e) => updateField(activeSection, e.target.value)}
                disabled={isGenerating}
              ></textarea>
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-6">
                    <div className="size-20 rounded-full border-4 border-[#D6B97A]/20 border-t-[#D6B97A] animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D6B97A] animate-pulse">
                      Synchronizing Intelligence
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={autoFillIntelligence}
                className="group flex items-center gap-4 px-10 py-5 bg-[#F8F5EF] text-[#D6B97A] text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] border border-[#D6B97A]/30 hover:bg-[#D6B97A] hover:text-white transition-all duration-700 shadow-lg"
              >
                <div className="size-8 rounded-xl bg-white group-hover:bg-[#1A1A1A] flex items-center justify-center shadow-sm transition-colors">
                  <Sparkles className="size-4" />
                </div>
                Global Intelligence Sync
              </button>
            </div>
          </div>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

const DAILY_INTELLIGENCE_LIBRARY: any = {
  thoughts: [
    {
      en: "The beautiful thing about learning is that no one can take it away from you. This profound insight by B.B. King reminds us that education is a permanent asset that empowers individuals beyond physical boundaries. Every piece of knowledge you acquire builds a foundation for a future where you are the master of your own destiny.",
      mr: "शिकण्याचे सर्वात सुंदर वैशिष्ट्य म्हणजे ते तुमच्याकडून कोणीही हिरावून घेऊ शकत नाही. बी.बी. किंग यांचे हे सखोल विचार आपल्याला आठवण करून देतात की शिक्षण ही एक कायमस्वरूपी संपत्ती आहे जी व्यक्तीला भौतिक सीमांच्या पलीकडे सक्षम करते. तुम्ही मिळवलेले ज्ञानाचे प्रत्येक कण अशा भविष्याचा पाया रचतात जिथे तुम्ही स्वतःच्या नशिबाचे स्वामी असाल.",
    },
    {
      en: "Education is the most powerful weapon which you can use to change the world. Nelson Mandela's words emphasize that learning is not just about personal growth but about societal transformation. By equipping ourselves with knowledge, we gain the strategic capability to address global challenges and build a more equitable and just society for everyone.",
      mr: "शिक्षण हे जगाला बदलण्यासाठी वापरले जाणारे सर्वात शक्तिशाली शस्त्र आहे. नेल्सन मंडेला यांचे शब्द यावर भर देतात की शिकणे हे केवळ वैयक्तिक वाढीसाठी नाही तर सामाजिक परिवर्तनासाठी आहे. स्वतःला ज्ञानाने सुसज्ज करून, आपण जागतिक आव्हानांना सामोरे जाण्याची आणि सर्वांसाठी अधिक न्याय्य समाज घडवण्याची धोरणात्मक क्षमता प्राप्त करतो.",
    },
    {
      en: "Don't let what you cannot do interfere with what you can do. This guidance from John Wooden encourages us to focus our energy on our strengths and possibilities rather than our limitations. Success is often the result of maximizing our current potential while steadily working towards overcoming our obstacles with persistence and a positive mindset.",
      mr: "तुम्ही जे करू शकत नाही, ते तुम्ही जे करू शकता त्यात अडथळा आणू देऊ नका. जॉन वूडन यांचे हे मार्गदर्शन आपल्याला आपल्या मर्यादांऐवजी आपली ताकद आणि शक्यतांवर लक्ष केंद्रित करण्यास प्रोत्साहित करते. यश हे बऱ्याचदा आपल्या वर्तमान क्षमतेचा जास्तीत जास्त वापर करण्याचे आणि सकारात्मक विचारसरणीने आपल्या अडथळ्यांवर मात करण्याचे फळ असते.",
    },
    {
      en: "A person who never made a mistake never tried anything new. Albert Einstein's perspective validates the necessity of failure in the journey of innovation. Mistakes are not setbacks but essential stepping stones that provide critical insights, helping us refine our approach and eventually achieve breakthroughs that were previously unimaginable.",
      mr: "ज्या व्यक्तीने कधीच चूक केली नाही, त्याने कधीच काही नवीन करण्याचा प्रयत्न केला नाही. अल्बर्ट आइनस्टाइन यांचा दृष्टीकोन नाविन्यपूर्ण प्रवासात अपयशाची गरज अधोरेखित करतो. चुका या माघार नसून त्या महत्त्वाच्या पायऱ्या आहेत ज्या आपल्याला धडे देतात, आपली पद्धत सुधारण्यास मदत करतात आणि शेवटी अशक्य वाटणारी प्रगती साध्य करण्यास मदत करतात.",
    },
  ],
  stories: [
    {
      en: "The Elephant Rope: A traveler noticed that giant elephants were held by only a small rope tied to their front leg. They didn't try to break free because, as calves, they were conditioned to believe the rope was strong enough to hold them. This story teaches us that our limitations are often mental barriers created by past experiences, and we must break free from these self-imposed beliefs to realize our true potential.",
      mr: "हत्तीची दोरी: एका प्रवाशाला दिसले की महाकाय हत्तींना त्यांच्या पुढच्या पायाला बांधलेल्या एका लहानशा दोरीने रोखून धरले होते. ते मुक्त होण्याचा प्रयत्न करत नव्हते कारण, लहान असताना त्यांना असे वाटायचे की ती दोरी त्यांना रोखण्यासाठी पुरेशी मजबूत आहे. ही गोष्ट आपल्याला शिकवते की आपल्या मर्यादा बऱ्याचदा भूतकाळातील अनुभवांनी तयार केलेले मानसिक अडथळे असतात आणि आपली खरी क्षमता ओळखण्यासाठी आपण या स्वतःहून लादलेल्या विश्वासातून मुक्त झाले पाहिजे.",
    },
    {
      en: "The Starfish Thrower: An old man saw a boy throwing starfish back into the ocean after a storm. When asked why he bothered since there were thousands, the boy picked one up, threw it back, and said, 'It made a difference to that one.' This narrative reminds us that while we cannot solve every problem in the world, every small act of kindness we perform has a profound and lasting impact on the individuals we help.",
      mr: "स्टारफिश फेकणारा मुलगा: एका वृद्ध माणसाने एका मुलाला वादळानंतर समुद्राच्या किनाऱ्यावर पडलेले स्टारफिश पुन्हा समुद्रात फेकताना पाहिले. जेव्हा त्याला विचारले गेले की हजारो स्टारफिश असताना तो हा त्रास का घेत आहे, तेव्हा त्या मुलाने एक स्टारफिश उचलला, तो समुद्रात फेकला आणि म्हणाला, 'या एकासाठी तरी फरक पडला.' ही गोष्ट आपल्याला आठवण करून देते की आपण जगातील प्रत्येक समस्या सोडू शकत नसलो तरी, आपण केलेली प्रत्येक छोटी दयाळू कृती आपण मदत केलेल्या व्यक्तीवर खोल आणि कायमस्वरूपी प्रभाव पाडते.",
    },
  ],
  significance: [
    {
      en: "National Science Day: Commemorated to honor the discovery of the Raman Effect by Indian physicist Sir C.V. Raman. This day serves as a critical reminder of the importance of scientific inquiry and rational thinking in our daily lives. It encourages students to explore the wonders of the physical world and pursue careers in research and technology to contribute to global progress.",
      mr: "राष्ट्रीय विज्ञान दिन: भारतीय भौतिकशास्त्रज्ञ सर सी.व्ही. रमण यांनी शोधलेल्या 'रमण इफेक्ट'च्या सन्मानार्थ हा दिवस साजरा केला जातो. हा दिवस आपल्या दैनंदिन जीवनातील वैज्ञानिक चौकस बुद्धी आणि तर्कसंगत विचारांच्या महत्त्वाची आठवण करून देतो. हे विद्यार्थ्यांना भौतिक जगाचे चमत्कार शोधण्यासाठी आणि जागतिक प्रगतीमध्ये योगदान देण्यासाठी संशोधन आणि तंत्रज्ञानामध्ये करिअर करण्यासाठी प्रोत्साहित करते.",
    },
    {
      en: "World Environment Day: A global platform for inspiring positive change in the protection of our planet's ecosystems. It highlights the urgent need to address climate change, deforestation, and pollution through collective action. Students play a pivotal role as future stewards of the earth, and this day empowers them to adopt sustainable habits and advocate for a greener, healthier future for all living beings.",
      mr: "जागतिक पर्यावरण दिन: आपल्या ग्रहाच्या परिसंस्थेच्या संरक्षणासाठी सकारात्मक बदल घडवून आणण्यासाठी हे एक जागतिक व्यासपीठ आहे. हे हवामान बदल, जंगलतोड आणि प्रदूषण यांसारख्या समस्यांवर एकत्रित कृतीद्वारे मात करण्याची निकड अधोरेखित करते. पृथ्वीचे भावी रक्षक म्हणून विद्यार्थी महत्त्वाची भूमिका बजावतात आणि हा दिवस त्यांना शाश्वत सवयी स्वीकारण्यास आणि सर्वांसाठी हिरव्यागार भविष्याचा पुरस्कार करण्यास सक्षम करतो.",
    },
  ],
  jokes: [
    {
      en: "Why did the teacher wear sunglasses in the classroom today? Because she said her students were so bright that they were literally dazzling! It's a humorous way to acknowledge the exceptional potential and intellectual brilliance that each student brings to the learning environment, encouraging them to keep shining in their academic pursuits.",
      mr: "आज वर्गात शिक्षकाने गॉगल का लावला होता? कारण ती म्हणाली की तिचे विद्यार्थी इतके तेजस्वी (ब्राइट) होते की ते अक्षरशः डोळे दिपवून टाकत होते! हा एक विनोदी मार्ग आहे ज्याद्वारे प्रत्येक विद्यार्थी शैक्षणिक वातावरणात आणत असलेल्या विलक्षण क्षमता आणि बौद्धिक तेजाची प्रशंसा केली जाते, त्यांना त्यांच्या अभ्यासात चमकत राहण्यास प्रोत्साहित केले जाते.",
    },
    {
      en: "Why was the math book looking so incredibly sad and overwhelmed? Because it had way too many complex problems to solve all at once! This joke lightens the mood around a challenging subject like mathematics, reminding us that even though problems can seem daunting, they can be tackled one step at a time with patience, practice, and a bit of humor to keep us going.",
      mr: "गणिताचे पुस्तक इतके प्रचंड दुःखी आणि हतबल का दिसत होते? कारण त्याच्याकडे एकाच वेळी सोडवण्यासाठी खूप जास्त जटिल समस्या (प्रॉब्लेम्स) होत्या! हा विनोद गणित या आव्हानात्मक विषयाबद्दलची भीती कमी करतो आणि आपल्याला आठवण करून देतो की समस्या कितीही कठीण वाटल्या तरी, संयम, सराव आणि थोड्या विनोदाने त्या एका वेळी एक अशा सोडवल्या जाऊ शकतात.",
    },
  ],
  news: [
    {
      en: "The school is proud to announce the launch of a new state-of-the-art Digital Learning Hub, equipped with high-speed internet and advanced educational software. This initiative aims to provide students with the latest technological tools to enhance their research capabilities and prepare them for a future dominated by digital innovation. We encourage all students to utilize these resources responsibly to broaden their horizons.",
      mr: "शाळेला नवीन अत्याधुनिक 'डिजिटल लर्निंग हब' सुरू झाल्याची घोषणा करताना अभिमान वाटत आहे, जे हाय-स्पीड इंटरनेट आणि प्रगत शैक्षणिक सॉफ्टवेअरने सुसज्ज आहे. या उपक्रमाचा उद्देश विद्यार्थ्यांना त्यांच्या संशोधन क्षमता वाढवण्यासाठी आणि डिजिटल नाविन्यपूर्ण भविष्यासाठी तयार करण्यासाठी नवीन तांत्रिक साधने प्रदान करणे आहे. आम्ही सर्व विद्यार्थ्यांना विनंती करतो की त्यांनी या संसाधनांचा जबाबदारीने वापर करून आपली क्षितिजे विस्तारली पाहिजेत.",
    },
    {
      en: "Our annual inter-school Athletics Championship is scheduled to take place next Friday at the main sports complex. This event is a fantastic opportunity for our young athletes to demonstrate their physical prowess, teamwork, and sportsman spirit. We invite all parents and community members to join us in cheering for our students as they compete with dedication and excellence in various track and field events.",
      mr: "आमची वार्षिक आंतरशालेय ॲथलेटिक्स चॅम्पियनशिप पुढील शुक्रवारी मुख्य क्रीडा संकुलात आयोजित केली जाणार आहे. हा कार्यक्रम आपल्या तरुण खेळाडूंसाठी त्यांचे शारीरिक कसब, सांघिक कार्य आणि खिलाडूवृत्ती प्रदर्शित करण्याची एक विलक्षण संधी आहे. आम्ही सर्व पालक आणि समाजातील सदस्यांना विनंती करतो की त्यांनी आपल्या विद्यार्थ्यांचा उत्साह वाढवण्यासाठी उपस्थित राहावे, कारण ते विविध ट्रॅक आणि फील्ड स्पर्धांमध्ये समर्पितपणे आणि उत्कृष्टतेने भाग घेणार आहेत.",
    },
  ],
};

function Info({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

const DEFAULT_TACHAN_DATA = {
  pageNo: "",
  date: "",
  day: "",
  teacher: "",
  school: "",
  quote: "",
  classes: "",
  year: "",
  periods: [
    {
      periodNo: "1",
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    },
    {
      periodNo: "2",
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    },
    {
      periodNo: "3",
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    },
    {
      periodNo: "4",
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    },
    {
      periodNo: "5",
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    }
  ]
};

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/><path d="M6 2h12v4H6z"/></svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2500/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

function TeachingRecordNotebookEditor({
  data,
  onChange,
  onSave,
  saving,
}: {
  data: any;
  onChange: (val: any) => void;
  onSave?: () => void;
  saving?: boolean;
}) {
  const { profile } = useAuth();

  const safeData = React.useMemo(() => {
    let base = DEFAULT_TACHAN_DATA;
    if (typeof data === "object" && data !== null && Array.isArray(data.periods)) {
      base = data;
    } else if (typeof data === "string" && data.trim().length > 0) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && Array.isArray(parsed.periods)) {
          base = parsed;
        }
      } catch (e) {
        console.error("Failed to parse tachandata:", e);
      }
    }

    return {
      ...base,
      teacher: base.teacher || "",
      school: base.school || "",
    };
  }, [data, profile]);

  const handleHeaderChange = (field: string, value: string) => {
    onChange({ ...safeData, [field]: value });
  };

  const handleRowChange = (periodIndex: number, rowIndex: number, field: string, value: string) => {
    const updated = { ...safeData };
    const updatedPeriods = [...updated.periods];
    const updatedPeriod = { ...updatedPeriods[periodIndex] };
    const updatedRows = [...updatedPeriod.rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };
    updatedPeriod.rows = updatedRows;
    updatedPeriods[periodIndex] = updatedPeriod;
    updated.periods = updatedPeriods;
    onChange(updated);
  };

  const addPeriod = () => {
    const updated = { ...safeData };
    const newPeriodNo = String(updated.periods.length + 1);
    const newPeriod = {
      periodNo: newPeriodNo,
      rows: [
        { std: "1", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" },
        { std: "2", subject: "", topic: "", outcome: "", experience: "", technique: "", aid: "" }
      ]
    };
    updated.periods = [...updated.periods, newPeriod];
    onChange(updated);
  };

  const removePeriod = (index: number) => {
    const updated = { ...safeData };
    const updatedPeriods = updated.periods.filter((_: any, i: number) => i !== index);
    updated.periods = updatedPeriods.map((p: any, i: number) => ({
      ...p,
      periodNo: String(i + 1)
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-10">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: transparent !important;
          }
          #print-tachanhub, #print-tachanhub * {
            visibility: visible !important;
          }
          #print-tachanhub {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border-double {
            border: 4px double black !important;
            padding: 24px !important;
          }
          .print-w-full {
            width: 100% !important;
          }
          .print-text-black {
            color: black !important;
          }
          /* Flatten input controls */
          input.tachaneditable, textarea.tachaneditable {
            border: none !important;
            padding: 0 !important;
            background: transparent !important;
            outline: none !important;
            resize: none !important;
            box-shadow: none !important;
            color: black !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Editor Control Panel */}
      <div className="no-print bg-[#FAFAF7] border border-[#E8DFD1]/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="size-5 text-[#D6B97A]" /> दैनंदिन पाठ टाचण कार्यक्षेत्र
          </h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Edit details, add/remove periods in-place, and print or download as PDF.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              बदल सेव्ह करा (Save)
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#D6B97A] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
          >
            <PrinterIcon className="size-4" /> PDF डाउनलोड करा (Print)
          </button>
        </div>
      </div>

      {/* The Printable Page Sheet (WYSIWYG Editable) */}
      <div id="print-tachanhub" className="bg-white border-4 border-double border-slate-900 p-6 md:p-10 mx-auto max-w-[1100px] shadow-xl relative font-serif text-black leading-relaxed">
        
        {/* Page number */}
        <div className="absolute top-4 left-4 text-xs font-bold text-slate-700">
          <span className="no-print text-slate-400">Page No: </span>
          <input
            type="text"
            value={safeData.pageNo || "11"}
            onChange={(e) => handleHeaderChange("pageNo", e.target.value)}
            className="tachaneditable w-10 font-bold bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none text-center"
          />
        </div>

        {/* Red Title */}
        <div className="text-center mt-4 mb-6">
          <h2 className="text-[#c22d2d] text-2xl md:text-3xl font-extrabold tracking-widest uppercase font-sans">
            दैनंदिन पाठ टाचण
          </h2>
        </div>

        {/* Subtitle fields grid */}
        <div className="border-t border-b border-black py-4 my-4 space-y-3 font-sans text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#c22d2d]">दिनांक:</span>
              <input
                type="text"
                value={safeData.date || ""}
                onChange={(e) => handleHeaderChange("date", e.target.value)}
                className="tachaneditable flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold"
                placeholder="उदा. १४/०१/२०२५"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-extrabold text-slate-800">वार:</span>
              <input
                type="text"
                value={safeData.day || ""}
                onChange={(e) => handleHeaderChange("day", e.target.value)}
                className="tachaneditable w-32 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-right"
                placeholder="उदा. मंगळवार"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#c22d2d]">वर्गशिक्षक:</span>
              <input
                type="text"
                value={safeData.teacher || ""}
                onChange={(e) => handleHeaderChange("teacher", e.target.value)}
                className="tachaneditable flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-[#c22d2d]"
                placeholder="उदा. शिक्षक नाव"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-extrabold text-slate-800">शाळा:</span>
              <input
                type="text"
                value={safeData.school || ""}
                onChange={(e) => handleHeaderChange("school", e.target.value)}
                className="tachaneditable flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-right"
                placeholder="उदा. शाळेचे नाव"
              />
            </div>
          </div>

          <div className="border-t border-dotted border-black/35 pt-3 flex items-center justify-center gap-2">
            <span className="font-extrabold text-[#c22d2d]">आजचा सुविचार:</span>
            <input
              type="text"
              value={safeData.quote || ""}
              onChange={(e) => handleHeaderChange("quote", e.target.value)}
              className="tachaneditable flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-center text-slate-800"
              placeholder="उदा. प्रयत्नांती परमेश्वर."
            />
          </div>

          <div className="border-t border-dotted border-black/35 pt-3 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#c22d2d]">इयत्ता:</span>
              <input
                type="text"
                value={safeData.classes || ""}
                onChange={(e) => handleHeaderChange("classes", e.target.value)}
                className="tachaneditable flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-[#c22d2d]"
                placeholder="उदा. पहिली व दुसरी"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-extrabold text-[#c22d2d]">सन:</span>
              <input
                type="text"
                value={safeData.year || ""}
                onChange={(e) => handleHeaderChange("year", e.target.value)}
                className="tachaneditable w-32 bg-transparent border-b border-dashed border-slate-200 focus:border-[#D6B97A] outline-none font-bold text-right text-[#c22d2d]"
                placeholder="उदा. २०२४-२५"
              />
            </div>
          </div>
        </div>

        {/* Grid Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse border border-black text-center text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="border border-black p-2 font-bold w-12 text-[10px]">तासिका</th>
                <th className="border border-black p-2 font-bold w-12 text-[10px]">इयत्ता</th>
                <th className="border border-black p-2 font-bold w-20 text-[10px]">विषय</th>
                <th className="border border-black p-2 font-bold text-[10px]">अध्ययन मुद्दा / पाठ्यांश / पाठघटक</th>
                <th className="border border-black p-2 font-bold text-[10px]">अध्ययन निष्पत्ती / अध्ययन दर्शके</th>
                <th className="border border-black p-2 font-bold text-[10px]">अध्ययन अनुभवाचे स्वरूप</th>
                <th className="border border-black p-2 font-bold w-24 text-[10px]">साधन तंत्र</th>
                <th className="border border-black p-2 font-bold w-24 text-[10px]">शैक्षणिक साहित्य</th>
              </tr>
            </thead>
            <tbody>
              {safeData.periods.map((p: any, pIdx: number) => {
                return p.rows.map((row: any, rIdx: number) => {
                  const isFirstRowOfPeriod = rIdx === 0;
                  return (
                    <tr key={`${pIdx}-${rIdx}`} className="hover:bg-slate-50/50 transition-colors">
                      {/* Period Column (Rowspan across all rows of this period) */}
                      {isFirstRowOfPeriod && (
                        <td
                          rowSpan={p.rows.length}
                          className="border border-black p-2 font-extrabold text-sm align-middle relative group"
                        >
                          <span>{p.periodNo}</span>
                          <button
                            onClick={() => removePeriod(pIdx)}
                            className="no-print absolute -top-1 -left-1 hidden group-hover:flex size-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white items-center justify-center shadow"
                            title="Remove Period"
                          >
                            <span className="text-[10px]">×</span>
                          </button>
                        </td>
                      )}
                      
                      {/* Standard (इयत्ता) */}
                      <td className="border border-black p-1 font-bold">
                        <input
                          type="text"
                          value={row.std}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "std", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-center"
                        />
                      </td>

                      {/* Subject (विषय) */}
                      <td className="border border-black p-1 font-semibold text-[#1F2937]">
                        <input
                          type="text"
                          value={row.subject}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "subject", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-center"
                        />
                      </td>

                      {/* Learning Topic (अध्ययन मुद्दा) */}
                      <td className="border border-black p-1 text-left">
                        <textarea
                          rows={2}
                          value={row.topic}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "topic", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-[11px] leading-relaxed resize-none custom-scrollbar"
                        />
                      </td>

                      {/* Learning Outcome (अध्ययन निष्पत्ती) */}
                      <td className="border border-black p-1 text-left">
                        <textarea
                          rows={2}
                          value={row.outcome}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "outcome", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-[11px] leading-relaxed resize-none custom-scrollbar"
                        />
                      </td>

                      {/* Learning Experience (अध्ययन अनुभवाचे स्वरूप) */}
                      <td className="border border-black p-1 text-left">
                        <textarea
                          rows={2}
                          value={row.experience}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "experience", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-[11px] leading-relaxed resize-none custom-scrollbar"
                        />
                      </td>

                      {/* Method (साधन तंत्र) */}
                      <td className="border border-black p-1">
                        <input
                          type="text"
                          value={row.technique}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "technique", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-center"
                        />
                      </td>

                      {/* Teaching Aid (शैक्षणिक साहित्य) */}
                      <td className="border border-black p-1">
                        <input
                          type="text"
                          value={row.aid}
                          onChange={(e) => handleRowChange(pIdx, rIdx, "aid", e.target.value)}
                          className="tachaneditable w-full bg-transparent border-none outline-none text-center"
                        />
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Add Period control button in workspace */}
        <div className="no-print py-4 flex justify-center">
          <button
            onClick={addPeriod}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-indigo-150"
          >
            <Plus className="size-4" /> तासिका जोडा (Add Period)
          </button>
        </div>

        {/* Footer line */}
        <div className="border-t border-black mt-8" />
      </div>
    </div>
  );
}
