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
  Trash2,
  X,
  ChevronDown,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
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
    m: "Special Day",
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col pb-20 md:pb-0 font-sans">
      <TeacherHeader />
      <TeacherSidebar />

      <header className="bg-white/40 backdrop-blur-2xl border-b border-[#C7D2FE]/50 sticky top-16 z-30 px-4 md:px-8 py-4 md:py-6 lg:pl-64">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 md:gap-8">
            <button
              onClick={() => window.history.back()}
              className="size-10 md:size-12 flex items-center justify-center bg-white/50 hover:bg-white rounded-xl md:rounded-2xl transition-all border border-[#C7D2FE]/50 text-[#4B7BE5] shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </button>
            <div className="flex items-center gap-3 md:gap-6">
              <div
                className={`size-10 md:size-14 ${config.color} rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-[#4B7BE5]/20 ring-4 ring-white/50`}
              >
                <config.icon className="size-5 md:size-7" />
              </div>
              <div>
                <h1 className="font-black text-[#1A1A1A] text-lg md:text-2xl tracking-tight leading-none">
                  {config.m}
                </h1>
                <p className="text-[8px] md:text-[11px] font-bold text-[#4B7BE5] uppercase tracking-[0.3em] mt-1 md:mt-2">
                  {config.e}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group flex items-center gap-2 md:gap-4 px-6 md:px-12 py-3 md:py-5 bg-[#4B7BE5] text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#3563C9] transition-all duration-700 shadow-2xl disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-3 md:size-4 animate-spin" />
              ) : (
                <Save className="size-3 md:size-4 group-hover:rotate-12 transition-transform text-white group-hover:text-white" />
              )}
              <span className="hidden sm:inline">Commit Sync</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12 md:py-20 relative z-10 lg:pl-64">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-3xl rounded-[4rem] border border-white/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          {/* Canvas Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#4B7BE5]/30 to-transparent" />

          <div className="p-4 md:p-16">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <config.icon className="size-32 md:size-64 text-[#4B7BE5]" />
            </div>



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
            ) : moduleId === "annual-monthly-planning" ? (
              <AcademicPlanningEditor
                data={data}
                onChange={(val: any) => setData(val)}
              />
            ) : moduleId === "teaching-record-notebook" ? (
              <TeachingDiaryEditor
                data={data}
                onChange={(val: any) => setData(val)}
              />
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
                  <div className="flex flex-col items-center justify-center gap-8 p-8 md:p-12 bg-[#F8F5EF]/30 border-2 border-dashed border-[#D6B97A]/30 rounded-[3rem]">
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

// Academic Planning Editor Component
interface PlanningItem {
  id: string;
  month: string;
  subject: string;
  topic: string;
  periods: number;
  tlm?: string;
  status: "Planned" | "In Progress" | "Completed";
  workingDays?: string;
  periodsCount?: string;
  completionStatus?: string;
  signature?: string;
  principalSignature?: string;
}

const PLANNING_LANG_DICT = {
  en: {
    selectClass: "Select Class",
    selectDivision: "Select Division",
    addPlan: "Add Academic Plan",
    month: "Month",
    subject: "Subject / Discipline",
    topic: "Topic / Unit Name",
    periods: "Expected Periods",
    tlm: "TLM / Teaching Resource",
    status: "Execution Status",
    addBtn: "Establish Plan",
    actions: "Actions",
    noPlans: "No syllabus plans found for this configuration.",
    addFirst: "Click below to establish your first planning entry.",
    summary: "Planning Summary",
    totalTopics: "Total Topics",
    completed: "Completed",
    inProgress: "In Progress",
    planned: "Planned",
    successAdd: "Topic plan successfully established!",
    successDel: "Topic plan successfully removed!",
    successStatus: "Plan status updated!",
  },
  mr: {
    selectClass: "वर्ग निवडा",
    selectDivision: "तुकडी निवडा",
    addPlan: "नवीन अभ्यासक्रम नियोजन जोडा",
    month: "महिना",
    subject: "विषय",
    topic: "घटक / पाठाचे नाव",
    periods: "अपेक्षित तासिका",
    tlm: "शैक्षणिक साहित्य (TLM)",
    status: "सद्यस्थिती",
    addBtn: "नियोजन जतन करा",
    actions: "क्रिया",
    noPlans: "या वर्गासाठी आणि तुकडीसाठी कोणतेही नियोजन आढळले नाही.",
    addFirst: "पहिले नियोजन जोडण्यासाठी खालील फॉर्म भरा.",
    summary: "नियोजन सारांश",
    totalTopics: "एकूण घटक",
    completed: "पूर्ण",
    inProgress: "प्रगतीपथावर",
    planned: "नियोजित",
    successAdd: "अभ्यासक्रम नियोजन यशस्वीरित्या जोडले गेले!",
    successDel: "अभ्यासक्रम नियोजन यशस्वीरित्या काढले गेले!",
    successStatus: "नियोजनाची स्थिती सुधारली!",
  },
};

const PLANNING_CLASSES = [
  { id: "1st", mr: "पहिली (1st)", en: "Class 1" },
  { id: "2nd", mr: "दुसरी (2nd)", en: "Class 2" },
  { id: "3rd", mr: "तिसरी (3rd)", en: "Class 3" },
  { id: "4th", mr: "चौथी (4th)", en: "Class 4" },
  { id: "5th", mr: "पाचवी (5th)", en: "Class 5" },
  { id: "6th", mr: "सहावी (6th)", en: "Class 6" },
  { id: "7th", mr: "सातवी (7th)", en: "Class 7" },
  { id: "8th", mr: "आठवी (8th)", en: "Class 8" },
  { id: "9th", mr: "नववी (9th)", en: "Class 9" },
  { id: "10th", mr: "दहावी (10th)", en: "Class 10" },
];

const PLANNING_DIVISIONS = ["A", "B", "C", "D"];

const PLANNING_MONTHS = [
  { id: "June", mr: "जून (June)", en: "June" },
  { id: "July", mr: "जुलै (July)", en: "July" },
  { id: "August", mr: "ऑगस्ट (August)", en: "August" },
  { id: "September", mr: "सप्टेंबर (September)", en: "September" },
  { id: "October", mr: "ऑक्टोबर (October)", en: "October" },
  { id: "November", mr: "नोव्हेंबर (November)", en: "November" },
  { id: "December", mr: "डिसेंबर (December)", en: "December" },
  { id: "January", mr: "जानेवारी (January)", en: "January" },
  { id: "February", mr: "फेब्रुवारी (February)", en: "February" },
  { id: "March", mr: "मार्च (March)", en: "March" },
  { id: "April", mr: "एप्रिल (April)", en: "April" },
  { id: "May", mr: "मे (May)", en: "May" },
];

const PLANNING_MEDIUMS = [
  { id: "marathi", mr: "मराठी माध्यम", en: "Marathi Medium" },
  { id: "english", mr: "इंग्रजी माध्यम", en: "English Medium" },
];

const WORKING_DAYS_ROWS = [
  { month: "जून", mon: "३", tue: "३", wed: "२", thu: "२", fri: "१", sat: "२", total: "१३", holidays: "४ व १३" },
  { month: "जुलै", mon: "४", tue: "४", wed: "५", thu: "५", fri: "५", sat: "४", total: "२७", holidays: "४" },
  { month: "ऑगस्ट", mon: "४", tue: "४", wed: "३", thu: "४", fri: "३", sat: "४", total: "२२", holidays: "५ व ४" },
  { month: "सप्टेंबर", mon: "३", tue: "३", wed: "३", thu: "२", fri: "२", sat: "१", total: "१४", holidays: "४ व १२" },
  { month: "ऑक्टोंबर", mon: "४", tue: "३", wed: "४", thu: "५", fri: "४", sat: "५", total: "२५", holidays: "४ व २" },
  { month: "नोव्हेंबर", mon: "४", tue: "२", wed: "३", thu: "३", fri: "२", sat: "२", total: "२३", holidays: "५ व ९" },
  { month: "डिसेंबर", mon: "४", tue: "५", wed: "४", thu: "५", fri: "३", sat: "३", total: "२४", holidays: "४ व ३" },
  { month: "जानेवारी", mon: "४", tue: "४", wed: "४", thu: "३", fri: "५", sat: "५", total: "२५", holidays: "५ व १" },
  { month: "फेब्रुवारी", mon: "४", tue: "४", wed: "४", thu: "३", fri: "४", sat: "४", total: "२२", holidays: "४ व २" },
  { month: "मार्च", mon: "५", tue: "४", wed: "४", thu: "४", fri: "३", sat: "४", total: "२४", holidays: "४ व ३" },
  { month: "एप्रिल", mon: "५", tue: "३", wed: "३", thu: "३", fri: "३", sat: "४", total: "२१", holidays: "५ व ४" },
  { month: "एकूण", mon: "४४", tue: "३९", wed: "३९", thu: "३९", fri: "३५", sat: "३८", total: "२३४", holidays: "५२ व ८५" },
  { month: "प्राप्त आठवडे", mon: "३८.००", tue: "", wed: "", thu: "", fri: "", sat: "", total: "", holidays: "" }
];

const WEEKLY_PERIODS_ROWS = [
  { subject: "मराठी", c1: "१६", c2: "१६", c3: "१२", c4: "१२", c5: "६", c6: "६", c7: "६", c8: "६" },
  { subject: "हिंदी", c1: "०", c2: "०", c3: "०", c4: "०", c5: "६", c6: "६", c7: "६", c8: "६" },
  { subject: "इंग्रजी", c1: "७", c2: "७", c3: "७", c4: "७", c5: "७", c6: "६", c7: "६", c8: "६" },
  { subject: "गणित", c1: "१३", c2: "१३", c3: "९", c4: "९", c5: "८", c6: "७", c7: "७", c8: "७" },
  { subject: "विज्ञान", c1: "०", c2: "०", c3: "६", c4: "६", c5: "६", c6: "७", c7: "७", c8: "७" },
  { subject: "समाजशास्त्र", c1: "०", c2: "०", c3: "४", c4: "४", c5: "४", c6: "६", c7: "६", c8: "६" },
  { subject: "कला", c1: "४", c2: "४", c3: "३", c4: "३", c5: "३", c6: "४", c7: "४", c8: "४" },
  { subject: "कार्यानुभव", c1: "४", c2: "४", c3: "४", c4: "४", c5: "३", c6: "२", c7: "२", c8: "२" },
  { subject: "शा.शिक्षण", c1: "४", c2: "४", c3: "३", c4: "३", c5: "३", c6: "४", c7: "४", c8: "४" },
  { subject: "एकूण", c1: "४८", c2: "४८", c3: "४८", c4: "४८", c5: "४८", c6: "४८", c7: "४८", c8: "४८" }
];

const LEARNING_OUTCOMES_ROWS = [
  { subject: "मराठी", code: "1", c1: "14", c2: "17", c3: "14", c4: "18", c5: "15", c6: "28", c7: "27", c8: "18", total: "151" },
  { subject: "हिंदी", code: "15", c1: "--", c2: "--", c3: "--", c4: "--", c5: "15", c6: "13", c7: "12", c8: "14", total: "54" },
  { subject: "इंग्रजी", code: "17", c1: "19", c2: "16", c3: "22", c4: "23", c5: "24", c6: "37", c7: "73", c8: "39", total: "243" },
  { subject: "गणित", code: "71", c1: "13", c2: "10", c3: "13", c4: "20", c5: "12", c6: "31", c7: "31", c8: "24", total: "154" },
  { subject: "प.अभ्यास भाग ०१", code: "95 A", c1: "--", c2: "--", c3: "10", c4: "18", c5: "14", c6: "--", c7: "--", c8: "--", total: "42" },
  { subject: "प.अभ्यास भाग ०२", code: "95 B", c1: "--", c2: "--", c3: "--", c4: "6", c5: "5", c6: "--", c7: "--", c8: "--", total: "11" },
  { subject: "विज्ञान", code: "72", c1: "--", c2: "--", c3: "--", c4: "--", c5: "--", c6: "15", c7: "23", c8: "18", total: "56" },
  { subject: "इतिहास", code: "73 H", c1: "--", c2: "--", c3: "--", c4: "--", c5: "--", c6: "12", c7: "12", c8: "13", total: "37" },
  { subject: "ना.शास्त्र", code: "73 H", c1: "--", c2: "--", c3: "--", c4: "--", c5: "--", c6: "12", c7: "10", c8: "10", total: "32" },
  { subject: "भूगोल", code: "73 G", c1: "--", c2: "--", c3: "--", c4: "--", c5: "--", c6: "23", c7: "23", c8: "28", total: "74" },
  { subject: "एकूण", code: "46", c1: "43", c2: "59", c3: "85", c4: "85", c5: "171", c6: "211", c7: "154", c8: "854", total: "854" }
];

const MONTHS_LIST = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April"];

const MONTHS_MR_MAP: Record<string, string> = {
  "June": "जून २०२६",
  "July": "जुलै २०२६",
  "August": "ऑगस्ट २०२६",
  "September": "सप्टेंबर २०२६",
  "October": "ऑक्टोबर २०२६",
  "November": "नोव्हेंबर २०२६",
  "December": "डिसेंबर २०२६",
  "January": "जानेवारी २०२७",
  "February": "फेब्रुवारी २०२७",
  "March": "मार्च २०२७",
  "April": "एप्रिल २०२७"
};

const STATIC_SUBJECT_PLANS: Record<string, { days: number; periods: number; topics: string }[]> = {
  marathi: [
    { days: 13, periods: 35, topics: "माझ्या या दारातून कविता २) चित्रगप्पा ३) मी आणि माझे कुटुंब ४) माझी जोडी" },
    { days: 27, periods: 69, topics: "5) मला घरापर्यंत पोहोचवा ६) ठिपके जोड व रंगव 7) राधाचे कुटुंब पाठ ८) ए आई मला पावसात जावू दे कविता ९) अक्षरगट क्र .३ न.स.प . त. उ ऊ" },
    { days: 22, periods: 51, topics: "10) सोहमचा दिवस पाठ ११) अक्षरगट क्र २ घ . र . ब.इ .ई १२) ससा आणि डोंगर चित्रकथा 13) अक्षरगट क्र ३ न.स. प . त . उ .ऊ" },
    { days: 14, periods: 53, topics: "14) चांगल्या सवयी पाठ  १५) झुक झुक झुक कविता १६) अक्षरगट क्र ४ च. ळ. ह. झ . ए. 17) चतुर उंदीर पाठ 18) अक्षरगट क्र 5 द .ड.व.ग ऐ" },
    { days: 25, periods: 35, topics: "१९) चांदोबाचे घर कविता 20) अक्षरगट क्र ६ ध य फ ज श ओ २१) भोपळा कविता 22) माझे सोबती पाठ प्रथम सत्र संकलित मूल्यमापन\n\nसराव व प्रथम सत्र संकलित मूल्यमापन – दिवाळी सुट्टी" },
    { days: 17, periods: 61, topics: "23) चित्रगप्पा २४) झोक्या रे झोक्या कविता 25) अक्षरगट क्र.७. ण ख थ भ ओ 26) माझे जग पाठ २७) अक्षरगट क्र ८ ट. ढ. ठ. छ . ष." },
    { days: 24, periods: 61, topics: "२८) खार कविता 29) अक्षरगट क्र .९ क्ष ज्ञ अ आ अं ऋ ३०) अनुस्वार ३१) जोडाक्षरे ३२) मुळाक्षरे ३३ ) चौदाखडी" },
    { days: 25, periods: 67, topics: "३४) आठवडी बाजार चित्रवर्णन ३५) मेंढी कविता ३६) पूर्णविराम ३७) प्रश्नचिन्ह ३८) चला लाडू बनवूया पाठ" },
    { days: 22, periods: 59, topics: "३९) पतंग माझा कविता ४०) छोट्या हातांची मोठी किमया पाठ ४१) नवे ते हवे पाठ ४२ ) घटनाक्रम ४३) माझी ओळख ." },
    { days: 24, periods: 61, topics: "उर्वरित अभ्यासक्रम पूर्तता , सराव" },
    { days: 21, periods: 56, topics: "सराव व दवितीय सत्र संकलित मूल्यमापन" }
  ],
  math: [
    { days: 13, periods: 28, topics: "1) My village 2) Where is the rooster 3) Before, after 4) Near, far" },
    { days: 27, periods: 56, topics: "5) My shape 6) My house 7) Introduction to 1 to 9" },
    { days: 22, periods: 41, topics: "8) Identification of zero 9) Identification of 10 10) Addition up to 9 11) Subtraction" },
    { days: 14, periods: 43, topics: "12) Identification of 11 to 20 13) Adjacent next, adjacent next and middle numbers 14) Smallness of numbers" },
    { days: 25, periods: 28, topics: "15) Ascending and Descending Order 16) Understanding Information First Semester Comprehensive Assessment\n\nसराव व प्रथम सत्र संकलित मूल्यमापन – दिवाळी सुट्टी" },
    { days: 17, periods: 50, topics: "17) Addition by counting forward 18) Subtraction by counting backward 19) Identification of 21 to 30" },
    { days: 24, periods: 50, topics: "20) Introduction to 31 to 99 21) Number Song 22) Shapes" },
    { days: 25, periods: 54, topics: "23) Measurement 24) Timekeeping 25) Sum until the answer is 18" },
    { days: 22, periods: 48, topics: "26) Coins and Notes 27) Multiplication Prep 28) Equal Division Equal Group 29) Mathematical Puzzles" },
    { days: 24, periods: 50, topics: "Completion of remaining courses, practice" },
    { days: 21, periods: 46, topics: "सराव द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  math_mr: [
    { days: 13, periods: 28, topics: "१) माझे गाव २) कोंबडा कुठे आहे ३) आधी, नंतर ४) जवळ, दूर" },
    { days: 27, periods: 56, topics: "५) माझा आकार ६) माझे घर ७) १ ते ९ चा परिचय" },
    { days: 22, periods: 41, topics: "८ ) शून्यची ओळख ९) १० ची ओळख १०) बेरीज उत्तर ९ पर्यंत ११) वजाबाकी" },
    { days: 14, periods: 43, topics: "१२) ११ ते २० ची ओळख १३) लगतची पुढची , लगतची मागची व मधली संख्या १४) संख्यांचा लहान मोठेपणा" },
    { days: 25, periods: 28, topics: "१५) चढता क्रम व उतरता क्रम १६ ) माहिती समजून घेवू प्रथम सत्र संकलित मूल्यमापन\n\nसराव व प्रथम सत्र संकलित मूल्यमापन – दिवाळी सुट्टी" },
    { days: 17, periods: 50, topics: "१७ ) बेरीज पुढे मोजून १८) वजाबाकी मागे मोजून १९) २१ ते ३० ची ओळख" },
    { days: 24, periods: 50, topics: "२०) ३१ ते ९९ ची ओळख २१) संख्यांचे गाणे २२) आकृतीबंध" },
    { days: 25, periods: 54, topics: "२३) मापन २४) कालमापन २५) बेरीज उत्तर १८ येईपर्यंत" },
    { days: 22, periods: 48, topics: "२६) नाणी व नोटा २७) गुणाकार पूर्वतयारी २८) समान वाटणी समान गट २९) गणितीय कोडी" },
    { days: 24, periods: 50, topics: "उर्वरित अभ्यासक्रम पूर्तता , सराव" },
    { days: 21, periods: 46, topics: "सराव द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  english: [
    { days: 13, periods: 15, topics: "Unit One :- 1.1) Body Body Pop Pop 1.2) What Is Your Name? 1.3) My Home." },
    { days: 27, periods: 30, topics: "Unit One :- 1.4) Clap Your Hands 1.5) Chit Chat 1.6) Fun With Sounds b.c.p.t.a 1.7) What can you do ? 1.8) My Classroom" },
    { days: 22, periods: 22, topics: "Unit One :- 1.9) Fun with Sounds d.f.m.n.e 1.10) Tip – Tap, Tip – Tap १.११) We Want rain" },
    { days: 14, periods: 23, topics: "Unit Two :- 2.1) Vegetables. 2.2)Fingers. 2.3) In the park 2.4) Animals I know. 2.5) Fun with Sounds h.l.r.s.i 2.6) Birds can fly" },
    { days: 25, periods: 15, topics: "Unit Two :- 2.7) Birthday Party 2.8) Fun With Sounds g.j.k.q.o.2.9) Water Bell . 2.10) Who ate the butter ? प्रथम सत्र संकलित मूल्यमापन\n\nसराव व प्रथम सत्र संकलित मूल्यमापन – दिवाळी सुट्टी" },
    { days: 17, periods: 27, topics: "Unit Three :- 3.1) Traffic Signals 3.2) Vehicles 3.3) Lunch Time 3.4) Fun With Sounds v.w.x.y.z.u.3.5) Alphabet Songs" },
    { days: 24, periods: 27, topics: "Unit Three :- 3.6) Capital Letters – Small Letters . 3.7) Days of the Weeks. 3.8 ) Word Family . 3.9) Numbers. 3.10) The Ant and the Pigeon" },
    { days: 25, periods: 29, topics: "Unit Four :- 4.1) Months of the Year 4.2) Greetings . 4.3) After My Bath. 4.4) Chit Chat 4.5) Lost and Found." },
    { days: 22, periods: 26, topics: "Unit Four :- 4.6) My Kitchen 4.7) Our Community Helpers . 4.8)The Magic Fish 4.9) Thank Yopu God" },
    { days: 24, periods: 27, topics: "उर्वरित अभ्यासक्रम पूर्तता , सराव" },
    { days: 21, periods: 25, topics: "सराव  व द्वितीय सत्र संकलित मूल्यमापन" }
  ]
};

const STATIC_SUBJECT_PLANS_5TH: Record<string, { days: number; periods: number; topics: string }[]> = {
  marathi: [
    { days: 13, periods: 12, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 26, topics: "माय मराठी, वाल्हर वळवा, मुंग्याच्या जगात,शब्दांच्या जाती, बंडूची इजार, समानार्थी शब्द," },
    { days: 22, periods: 22, topics: "म्हणी, सावरपाडा एक्प्रेस, लिंग विचार,  जनाई, प्रिय बाई, माहेर, अरण्यलिपी" },
    { days: 14, periods: 23, topics: "रंग जादूचे पेटीमधील, माळीण गाव, शब्दांच्या जाती, रंग जादूचे पेटी, सण एक दिन," },
    { days: 25, periods: 13, topics: "अरण्यलिपी, शब्दसंपत्ती, कठीण समय येता प्रथम सत्र संकलित मूल्यमापन" },
    { days: 17, periods: 23, topics: "पुस्तके, सूचना पालन, आपल्या समस्या, कारगिरी,विरुद्धार्थी शब्द, स्वच्छतेचा प्रकाश" },
    { days: 24, periods: 23, topics: "कारागिरी, आपल्या समस्या व उपाय, अति तीथ माती, पाण्याची गोष्ट, शब्दांच्या जाती,अति तिथं माती, कापणी," },
    { days: 25, periods: 26, topics: "वासरू, माझं शाळेच नक्की छ. राज शाहू महाराज ,अभंग, शब्दांच्या जाती" },
    { days: 22, periods: 23, topics: "ढोल, पाण्याची गोष्ट, पत्रलेखन, शब्दसंपत्ती" },
    { days: 24, periods: 18, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 17, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  math: [
    { days: 13, periods: 16, topics: "Revision, assessment - basic skills and setu abhyas" },
    { days: 27, periods: 34, topics: "Roman Numerals, Number Work, Addition" },
    { days: 22, periods: 30, topics: "Subtraction, Multiplication, Fractions" },
    { days: 14, periods: 31, topics: "Addition and Subtraction" },
    { days: 25, periods: 18, topics: "Angles, Circles, First Semester Comprehensive Assessment" },
    { days: 17, periods: 31, topics: "Multiples and Factors, Decimal Fractions, Measuring Time" },
    { days: 24, periods: 31, topics: "Problems on Measurement, Perimeter, Nets" },
    { days: 25, periods: 35, topics: "Problems on Measurement, Measuring, Perimeter and Area" },
    { days: 22, periods: 30, topics: "Nets, Preparation for Algebra, Perimeter and Area, Area, Drawing, Graphs, Pictographs" },
    { days: 24, periods: 15, topics: "Completion of remaining courses, practice" },
    { days: 21, periods: 15, topics: "Second Semester Comprehensive Assessment" }
  ],
  math_mr: [
    { days: 13, periods: 16, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 34, topics: "रोमन अंकशास्त्रनाणकशास्त्रबेरीज" },
    { days: 22, periods: 30, topics: "वजाबाकी,गुणाकार अपूर्णांक," },
    { days: 14, periods: 31, topics: "बेरीज आणि वजाबाकी" },
    { days: 25, periods: 18, topics: "कोन, मंडळप्रथम सत्र संकलित मूल्यमापन" },
    { days: 17, periods: 31, topics: "विभाज्य आणि विभाजक , दशांश पूर्णांक, कालगणना" },
    { days: 24, periods: 31, topics: "मोजमाप वरील उदाहरणे, परिमिती, आकृत्या," },
    { days: 25, periods: 35, topics: "मोजमापावरील उदाहरणे, मोजमाप, परिमिती आणि क्षेत्रफळ" },
    { days: 22, periods: 30, topics: "आकृत्या, बीजगणिताचे उपसर्ग, परिमिती आणि क्षेत्रफळ, क्षेत्रफळ, रचना, आलेख, संख्याआकृती" },
    { days: 24, periods: 15, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 15, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  english: [
    { days: 13, periods: 14, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 30, topics: "UNIT ONE-1)Songs and Greetings2)Ato Z 3)We SpeakEnglish 4)Number Work 5)B-I-N-G-OVanishingSentences 7)Talking About Things-One 8)Sentences RaceSay Yes or No" },
    { days: 22, periods: 26, topics: ".10)Talking AboutThings-Two 11)ActionTime 12)Words We know Unit TWO-1)Cuckoo 2)The LittleRed Hen 3)Just now4)TrueFriends 5)KeepingQuiet 6)Interviews" },
    { days: 14, periods: 26, topics: "7)Friendly Plans 8)More than a Hundred WordsUNIT THREE-1)Trains2)The LittleBabul Tree 3)Lots of ThingsTogether" },
    { days: 25, periods: 16, topics: "4)Know Your Body 5)Alyonushka 6)One Things at aTime 7)Pen-friendsप्रथम सत्र संकलित मूल्यमापन" },
    { days: 17, periods: 26, topics: "UNIT FOUR-1)How CreaturesMove2)Location Games 3)CollectionOf English Texts 4)Shapes andMaps5)Tock,Tock,Tong,Tong AllDay Long" },
    { days: 24, periods: 26, topics: "6)On The Time-Line 7)I Speak,A Say,I Talk 8)Science Fun-Fair. UNIT FIVE-1)The Wind 2)Go AnCome 3)The Golden Touch 4)Where Go the Boats?" },
    { days: 25, periods: 32, topics: "5)Our Solar System 6)Guess whatUNIT SIX-1)A Book Speaks 2)George WashingtonCarver" },
    { days: 22, periods: 26, topics: "3)Question Bank 4)Dice forYour Game 5)All about Money 6)OnlyOne Mother 7)At the Market 8)He Knows the Workman." },
    { days: 24, periods: 20, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 21, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  hindi: [
    { days: 13, periods: 12, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 26, topics: "विभाग पहिला -आओ खेले|1)नंदनवन 2)बूंदे 3)योग्यचुनाव 4)कश्मीरा 5)पहचान हमारी भाग एक" },
    { days: 22, periods: 22, topics: "6)पेटूराम 7)बधाई कार्ड  8)करो ओर जानो  9)नीम  10)गडा धन" },
    { days: 14, periods: 23, topics: "11)मित्रता  12)बचत  13)पहचान हमारी भाग दोन  14 में सडक हू  15)व्यायाम" },
    { days: 25, periods: 13, topics: "15)व्यायाम 16 )बोलो ओर जानो प्रथम सत्र संकलित मूल्यमापन" },
    { days: 17, periods: 23, topics: "विभाग दुसरा- 1)गाव ओर शहर 2)जीवन 3)भाई भाई का प्रेम 4)बालिका दिवस" },
    { days: 24, periods: 23, topics: "5)रोबोट  6)जुडे हम 7)अ)बोध ब)समान विरुद्ध 8)बीज 9)मुझे पहचानो 10)मुझे जानो" },
    { days: 25, periods: 26, topics: "11)विरोंको प्रणाम 12)सपूत 13)राष्ट्रीय त्योहार 14)अ)हम अलग अलग रूप एक ब)छक छक गाडी" },
    { days: 22, periods: 23, topics: "15)ज्ञानी16 )बचाव 17)निरीक्षण 18)चलो चले" },
    { days: 24, periods: 23, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 22, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  evs1: [
    { days: 13, periods: 14, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 30, topics: "आपली पृथ्वी आपली सूर्यमाला पृथ्वीचे फिरणे 3 )पृथ्वी आणि जीवसृष्टी 4 )पर्यावरणाचे संतुलन" },
    { days: 22, periods: 26, topics: "5 )कुटुंबातील मूल्ये 6 )नियम सर्वांसाठी 7 )आपणच सोडवू आपले प्रश्न" },
    { days: 14, periods: 26, topics: "8 )सार्वजनिक सुविधा आणि माझी शाळा 9 )नकाशा :आपला सोबती 10 )ओळख भारताची" },
    { days: 25, periods: 16, topics: "11 )आपले घर व पर्यावरण 12 )सर्वांसाठी अन्न प्रथम सत्र संकलित मूल्यमापन" },
    { days: 17, periods: 26, topics: "13 )अन्न टिकविण्याच्या पद्धती 14 )वाहतुक 15 )संदेशवहन व प्रसार माध्यमे 16)पाणी" },
    { days: 24, periods: 26, topics: "17)वस्त्र आपली गरज18)पर्यावरण आणि आपण 19)अन्नघटक" },
    { days: 25, periods: 32, topics: "20)आपले भावनिक जग 21)कामांत व्यस्त आपली आंतरद्रिये 22 )वाढ आणि व्यक्तिमत्व विकास" },
    { days: 22, periods: 26, topics: "संसर्गजन्य रोग आणि रोगप्रतिबंधपदार्थ,वस्तू आणि ऊर्जा 25)सामाजिक आरोग्य" },
    { days: 24, periods: 20, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 21, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ],
  evs2: [
    { days: 13, periods: 10, topics: "उजळणी मूल्यमापन – मुलभूत क्षमता व पुनर्रचित सेतू अभ्यास" },
    { days: 27, periods: 22, topics: "१)इतिहास म्हणजे काय?२)इतिहास आणि कालसंकल्पना" },
    { days: 22, periods: 19, topics: "3)पृथ्वीवरील सजीव" },
    { days: 14, periods: 19, topics: "4)उत्क्रांती" },
    { days: 25, periods: 11, topics: "5)मानवाची वाटचाल" },
    { days: 17, periods: 19, topics: "6)अश्मयुग:दगडाची हत्यारे निवारा ते गाव वसाहती" },
    { days: 24, periods: 19, topics: "स्थिर जीवनाची सुरुवात" },
    { days: 25, periods: 22, topics: "स्थिर जीवन आणि नागरी ९) संस्कृती" },
    { days: 22, periods: 19, topics: "10)ऐतिहासिक काळ" },
    { days: 24, periods: 19, topics: "उर्वरित अभ्यासक्रम पूर्तता,सराव" },
    { days: 21, periods: 18, topics: "द्वितीय सत्र संकलित मूल्यमापन" }
  ]
};

const CLASS_MR_MAP: Record<string, string> = {
  "1st": "पहिली",
  "2nd": "दुसरी",
  "3rd": "तिसरी",
  "4th": "चौथी",
  "5th": "पाचवी",
  "6th": "सहावी",
  "7th": "सातवी",
  "8th": "आठवी",
  "9th": "नववी",
  "10th": "दहावी"
};

const getSubjectKeysForClass = (cls: string) => {
  if (cls === "1st" || cls === "2nd") {
    return ["marathi", "math", "english"];
  }
  if (cls === "3rd" || cls === "4th") {
    return ["marathi", "math", "english", "evs1", "evs2"];
  }
  return ["marathi", "math", "english", "hindi", "evs1", "evs2"];
};

const getStaticPlansForClass = (cls: string, med: string) => {
  if (cls === "1st") {
    return STATIC_SUBJECT_PLANS;
  }
  if (cls === "5th") {
    return STATIC_SUBJECT_PLANS_5TH;
  }
  
  // For other classes, dynamically generate empty plans with standard days and periods
  const standardDays = [13, 27, 22, 14, 25, 17, 24, 25, 22, 24, 21];
  const standardPeriods: Record<string, number[]> = {
    marathi: [35, 69, 51, 53, 35, 61, 61, 67, 59, 61, 56],
    math: [28, 56, 41, 43, 28, 50, 50, 54, 48, 50, 46],
    english: [15, 30, 22, 23, 15, 27, 27, 29, 26, 27, 25],
    hindi: [12, 26, 22, 23, 13, 23, 23, 26, 23, 23, 22],
    evs1: [14, 30, 26, 26, 16, 26, 26, 32, 26, 20, 21],
    evs2: [10, 22, 19, 19, 11, 19, 19, 22, 19, 19, 18]
  };

  const generated: Record<string, { days: number; periods: number; topics: string }[]> = {};
  
  // Initialize all subjects
  ["marathi", "math", "english", "hindi", "evs1", "evs2"].forEach(subKey => {
    generated[subKey] = MONTHS_LIST.map((mId, mIdx) => {
      const days = standardDays[mIdx];
      const pList = standardPeriods[subKey] || standardPeriods.marathi;
      const periods = pList[mIdx];
      return { days, periods, topics: "" };
    });
  });

  // Alias math_mr
  generated.math_mr = generated.math;
  

  return generated;
};

// ─── Teaching Diary Files per class ───────────────────────────────────────────
const DIARY_CLASSES = [
  { id: "1", label: "Class 1 / पहिली" },
  { id: "2", label: "Class 2 / दुसरी" },
  { id: "3", label: "Class 3 / तिसरी" },
  { id: "4", label: "Class 4 / चौथी" },
  { id: "5", label: "Class 5 / पाचवी" },
  { id: "6", label: "Class 6 / सहावी" },
  { id: "7", label: "Class 7 / सातवी" },
];

const DIARY_FILES: Record<string, { title: string; subtitle: string }[]> = {
  "1": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग पहिली" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग पहिली" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग पहिली" },
  ],
  "2": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग दुसरी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग दुसरी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग दुसरी" },
  ],
  "3": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग तिसरी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग तिसरी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग तिसरी" },
  ],
  "4": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग चौथी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग चौथी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग चौथी" },
  ],
  "5": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग पाचवी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग पाचवी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग पाचवी" },
  ],
  "6": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग सहावी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग सहावी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग सहावी" },
  ],
  "7": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग सातवी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग सातवी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग सातवी" },
  ],
};

function TeachingDiaryEditor({
  data,
  onChange,
}: {
  data: any;
  onChange: (val: any) => void;
}) {
  const [selectedDiaryClass, setSelectedDiaryClass] = useState<string | null>(null);
  const files = selectedDiaryClass ? DIARY_FILES[selectedDiaryClass] || [] : [];

  return (
    <div className="space-y-8 text-slate-800 max-w-[900px] mx-auto">
      {/* Step 1 – Select Class */}
      <div className="bg-white border border-[#C7D2FE]/80 rounded-[2.5rem] p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">1</div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3563C9]">
            Select Class / वर्ग निवडा
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIARY_CLASSES.map((cls) => {
            const isSelected = selectedDiaryClass === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedDiaryClass(cls.id)}
                className={`py-3.5 px-4 rounded-2xl font-black text-[10px] uppercase tracking-wider border transition-all duration-300 cursor-pointer text-center ${
                  isSelected
                    ? "bg-[#4B7BE5] text-white border-[#4B7BE5] shadow-md scale-105"
                    : "bg-white text-slate-500 border-[#C7D2FE] hover:border-[#4B7BE5] hover:text-[#4B7BE5] hover:shadow-sm"
                }`}
              >
                {cls.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 – Files */}
      {selectedDiaryClass && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border border-[#C7D2FE]/80 rounded-[2.5rem] p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">2</div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3563C9]">
              Teaching Diary Files / शिक्षण डायरी फाइल्स
            </h3>
          </div>
          <div className="space-y-4">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-[#C7D2FE]/60 rounded-2xl hover:border-[#4B7BE5]/40 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-[#4B7BE5]/10 flex items-center justify-center text-[#4B7BE5] flex-shrink-0">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{file.title}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{file.subtitle}</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    type="button"
                    className="px-5 py-2.5 border border-[#C7D2FE] rounded-xl text-[9px] font-black uppercase tracking-wider text-[#3563C9] bg-white hover:bg-[#EEF2FF] hover:border-[#4B7BE5] transition-all cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-[#4B7BE5] text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Academic Planning Editor ──────────────────────────────────────────────────
function AcademicPlanningEditor({

  data,
  onChange,
}: {
  data: any;
  onChange: (val: any) => void;
}) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const dict = PLANNING_LANG_DICT[lang === "mr" ? "mr" : "en"];

  const [selectedClass, setSelectedClass] = useState("1st");
  const [selectedMedium, setSelectedMedium] = useState("marathi");
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);

  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const subjectKeys = getSubjectKeysForClass(selectedClass);

  const matchSubject = (pSubject: string, subKey: string) => {
    const pSub = pSubject.toLowerCase();
    const key = subKey.toLowerCase();
    if (pSub === key) return true;
    if (key === 'math' && pSub === 'गणित') return true;
    if (key === 'marathi' && pSub === 'मराठी') return true;
    if (key === 'english' && pSub === 'इंग्रजी') return true;
    if (key === 'hindi' && pSub === 'हिंदी') return true;
    if (key === 'evs1' && (pSub === 'परिसर अभ्यास भाग – १' || pSub === 'परिसर अभ्यास भाग - १' || pSub === 'परिसर अभ्यास भाग 1')) return true;
    if (key === 'evs2' && (pSub === 'परिसर अभ्यास भाग – २' || pSub === 'परिसर अभ्यास भाग - २' || pSub === 'परिसर अभ्यास भाग 2')) return true;
    return false;
  };

  const renderPDFHeader = () => (
    <div style={{
      border: "1px solid #cbd5e1",
      borderRadius: "24px",
      padding: "16px 24px",
      marginBottom: "20px",
      backgroundColor: "#ffffff",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Left Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>
            <span>शाळा:</span>
            <span style={{
              border: "1px solid #e2e8f0",

              borderRadius: "15px",
              padding: "4px 12px",
              color: "#1e293b",
              fontWeight: "600",
              backgroundColor: "#f8fafc",
              display: "inline-block",
              minWidth: "100px"
            }}>
              {schoolName}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>
            <span>वर्गशिक्षक नाव:</span>
            <span style={{
              border: "1px solid #e2e8f0",
              borderRadius: "15px",
              padding: "4px 12px",
              color: "#1e293b",
              fontWeight: "600",
              backgroundColor: "#f8fafc",
              display: "inline-block",
              minWidth: "100px"
            }}>
              {teacherName}
            </span>
          </div>
        </div>

        {/* Center Side */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: 0, padding: 0 }}>वार्षिक नियोजन</h2>
          <p style={{ fontSize: "11px", fontWeight: "bold", color: "#d6b97a", margin: "4px 0 0 0", padding: 0, letterSpacing: "0.1em" }}>
            शैक्षणिक वर्ष २०२६-२०२७
          </p>
        </div>

        {/* Right Side */}
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>
            इयत्ता: <span style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", marginLeft: "4px" }}>
              {(CLASS_MR_MAP[selectedClass] || selectedClass) + (selectedMedium === "marathi" ? "" : " सेमी")}
            </span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>
            माध्यम: <span style={{ color: "#d6b97a", fontWeight: "800" }}>
              {selectedMedium === "marathi" ? "मराठी" : "इंग्रजी"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPDFSignature = () => (
    <div className="signature-section">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ height: "60px" }} /> {/* Space for signing */}
        <div style={{ width: "180px", borderTop: "1px solid #000", paddingTop: "4px", textAlign: "center" }}>
          शिक्षक स्वाक्षरी
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ height: "60px" }} /> {/* Space for signing */}
        <div style={{ width: "180px", borderTop: "1px solid #000", paddingTop: "4px", textAlign: "center" }}>
          मुख्याध्यापक स्वाक्षरी
        </div>
      </div>
    </div>
  );

  const renderScreenSignature = () => (
    <div className="flex justify-between items-center mt-12 px-8 text-xs font-bold text-slate-600">
      <div className="flex flex-col items-center">
        <div className="h-16" /> {/* Space for signing */}
        <div className="w-48 border-t border-slate-400 pt-1 text-center">शिक्षक स्वाक्षरी</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="h-16" /> {/* Space for signing */}
        <div className="w-48 border-t border-slate-400 pt-1 text-center">मुख्याध्यापक स्वाक्षरी</div>
      </div>
    </div>
  );

  // Track active medium for each class
  const [classMediums, setClassMediums] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    PLANNING_CLASSES.forEach((c) => {
      initial[c.id] = "marathi";
    });
    return initial;
  });

  // Track which class dropdown is open
  const [openClassDropdown, setOpenClassDropdown] = useState<string | null>(null);

  // Load class-medium configuration from setup and teacher profile
  useEffect(() => {
    async function loadConfigAndProfile() {
      if (!user) return;
      try {
        const tDoc = await getDoc(doc(db, "teachers", user.uid));
        if (tDoc.exists()) {
          const tData = tDoc.data();
          setTeacherName((prev) => prev || safeData.teacherName || tData.fullName || user.displayName || "शिक्षक");
          setSchoolName((prev) => prev || safeData.schoolName || tData.schoolName || "ZP School");

          const udise = tData.udise;
          if (udise) {
            const configDoc = await getDoc(doc(db, "school_data", `${udise}_class_config`));
            if (configDoc.exists() && configDoc.data().config) {
              const cfg = configDoc.data().config;
              const loadedMediums: Record<string, string> = {};
              PLANNING_CLASSES.forEach((c) => {
                const val = cfg[c.id];
                if (val === "english") {
                  loadedMediums[c.id] = "english";
                } else {
                  loadedMediums[c.id] = "marathi";
                }
              });
              setClassMediums(loadedMediums);
              if (loadedMediums[selectedClass]) {
                setSelectedMedium(loadedMediums[selectedClass]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading configuration and profile:", err);
      }
    }
    loadConfigAndProfile();
  }, [user, selectedClass, data]);

  // Sync state values with document metadata if loaded later
  useEffect(() => {
    if (safeData.schoolName && !schoolName) {
      setSchoolName(safeData.schoolName);
    }
    if (safeData.teacherName && !teacherName) {
      setTeacherName(safeData.teacherName);
    }
  }, [data]);

  const handleSchoolNameChange = (val: string) => {
    setSchoolName(val);
    const updatedData = { ...safeData, schoolName: val };
    onChange(updatedData);
  };

  const handleTeacherNameChange = (val: string) => {
    setTeacherName(val);
    const updatedData = { ...safeData, teacherName: val };
    onChange(updatedData);
  };

  const handleWorkingDaysCellChange = (rowIdx: number, field: string, value: string) => {
    const updatedData = { ...safeData };
    const currentList = updatedData.workingDays ? [...updatedData.workingDays] : JSON.parse(JSON.stringify(WORKING_DAYS_ROWS));
    
    currentList[rowIdx][field] = value;
    updatedData.workingDays = currentList;
    onChange(updatedData);
  };

  const handleWeeklyPeriodsCellChange = (rowIdx: number, field: string, value: string) => {
    const updatedData = { ...safeData };
    const currentList = updatedData.weeklyPeriods ? [...updatedData.weeklyPeriods] : JSON.parse(JSON.stringify(WEEKLY_PERIODS_ROWS));
    
    currentList[rowIdx][field] = value;
    updatedData.weeklyPeriods = currentList;
    onChange(updatedData);
  };

  const handleLearningOutcomesCellChange = (rowIdx: number, field: string, value: string) => {
    const updatedData = { ...safeData };
    const currentList = updatedData.learningOutcomes ? [...updatedData.learningOutcomes] : JSON.parse(JSON.stringify(LEARNING_OUTCOMES_ROWS));
    
    currentList[rowIdx][field] = value;
    updatedData.learningOutcomes = currentList;
    onChange(updatedData);
  };

  const handleSubjectPlanFieldChange = (
    subject: string,
    month: string,
    field: "topic" | "workingDays" | "periodsCount" | "completionStatus" | "signature" | "principalSignature",
    value: string
  ) => {
    const updatedData = { ...safeData };
    if (!updatedData[selectedClass]) updatedData[selectedClass] = {};
    if (typeof updatedData[selectedClass] !== "object") {
      updatedData[selectedClass] = {};
    }

    const plansList = [...currentPlans];

    const itemIdx = plansList.findIndex(p => {
      return matchSubject(p.subject, subject) && p.month.toLowerCase() === month.toLowerCase();
    });

    if (itemIdx > -1) {
      plansList[itemIdx] = { ...plansList[itemIdx], [field]: value };
    } else {
      const staticPlansSource = getStaticPlansForClass(selectedClass, selectedMedium);
      const staticPlans = subject === "math" && selectedMedium === "marathi"
        ? staticPlansSource.math_mr
        : staticPlansSource[subject];
      const mIdx = MONTHS_LIST.indexOf(month);
      const staticRow = staticPlans ? staticPlans[mIdx] : { days: 0, periods: 0, topics: "" };

      const newItem: PlanningItem = {
        id: Math.random().toString(36).substring(2, 9),
        month: month,
        subject: subject,
        topic: field === "topic" ? value : staticRow.topics,
        periods: 1,
        status: "Planned",
        workingDays: field === "workingDays" ? value : String(staticRow.days),
        periodsCount: field === "periodsCount" ? value : String(staticRow.periods),
        completionStatus: field === "completionStatus" ? value : "",
        signature: field === "signature" ? value : "",
        principalSignature: field === "principalSignature" ? value : ""
      };
      plansList.push(newItem);
    }

    updatedData[selectedClass][selectedMedium] = plansList;

    PLANNING_DIVISIONS.forEach((div) => {
      if (updatedData[selectedClass][div]) {
        delete updatedData[selectedClass][div];
      }
    });

    onChange(updatedData);
  };

  const getSubjectTotals = (subKey: string, staticPlans: any[]) => {
    let totalDays = 0;
    let totalPeriods = 0;

    MONTHS_LIST.forEach((mId, mIdx) => {
      const staticRow = staticPlans[mIdx];
      const item = currentPlans.find(p => {
        return matchSubject(p.subject, subKey) && p.month.toLowerCase() === mId.toLowerCase();
      });

      const daysVal = item?.workingDays !== undefined ? item.workingDays : String(staticRow.days);
      const periodsVal = item?.periodsCount !== undefined ? item.periodsCount : String(staticRow.periods);

      const parseNumber = (val: string) => {
        const marathiMap: Record<string, string> = {
          "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
          "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
        };
        let converted = "";
        for (let char of String(val)) {
          converted += marathiMap[char] || char;
        }
        const num = parseFloat(converted);
        return isNaN(num) ? 0 : num;
      };

      totalDays += parseNumber(daysVal);
      totalPeriods += parseNumber(periodsVal);
    });

    return { totalDays, totalPeriods };
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenClassDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Form State
  const [newMonth, setNewMonth] = useState("June");
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const handleDownloadPDF = async (type: "annual" | "monthly") => {
    const element = document.getElementById("academic-planning-pdf-content");
    if (!element) return;

    setIsDownloading(true);

    // Hide/show sections based on download type
    const annualSection = element.querySelector(".pdf-annual-section") as HTMLElement;
    const monthlySection = element.querySelector(".pdf-monthly-section") as HTMLElement;
    
    if (type === "annual") {
      if (annualSection) annualSection.style.display = "block";
      if (monthlySection) monthlySection.style.display = "none";
    } else {
      if (annualSection) annualSection.style.display = "none";
      if (monthlySection) monthlySection.style.display = "block";
    }

    try {
      // @ts-ignore
      let html2pdfFn = html2pdf;
      // @ts-ignore
      if (html2pdfFn && html2pdfFn.default) {
        // @ts-ignore
        html2pdfFn = html2pdfFn.default;
      }
      if (typeof html2pdfFn !== 'function') {
        // @ts-ignore
        if (typeof window !== 'undefined' && typeof window.html2pdf === 'function') {
          // @ts-ignore
          html2pdfFn = window.html2pdf;
        }
      }

      if (typeof html2pdfFn !== 'function') {
        throw new Error("html2pdf library is not loaded properly.");
      }

      const opt = {
        margin:       5,
        filename:     type === "annual" 
          ? `Annual_Planning_Structure_Class_${selectedClass.replace(/[^0-9]/g, '')}_${selectedMedium === "marathi" ? "Marathi" : "Semi"}.pdf`
          : `Monthly_Planning_Roadmap_Class_${selectedClass.replace(/[^0-9]/g, '')}_${selectedMedium === "marathi" ? "Marathi" : "Semi"}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };
      await html2pdfFn().set(opt).from(element).save();
    } catch (err: any) {
      console.error("Failed to download PDF", err);
      const errMsg = err?.message || String(err);
      toast.error(
        lang === "en"
          ? `Failed to download PDF: ${errMsg}`
          : `PDF डाउनलोड करण्यात अयशस्वी: ${errMsg}`
      );
    } finally {
      // Restore displays
      if (annualSection) annualSection.style.display = "block";
      if (monthlySection) monthlySection.style.display = "block";
      setIsDownloading(false);
    }
  };

  const safeData = typeof data === "object" && data !== null ? data : {};

  // Extract plans with fallback and migration
  const currentPlans: PlanningItem[] = (() => {
    // 1. Direct array under medium: safeData[selectedClass][selectedMedium]
    if (Array.isArray(safeData[selectedClass]?.[selectedMedium])) {
      return safeData[selectedClass][selectedMedium];
    }

    // 2. Old division-nested under medium: safeData[selectedClass][selectedMedium][division]
    const nestedByDiv = safeData[selectedClass]?.[selectedMedium];
    if (nestedByDiv && typeof nestedByDiv === "object") {
      const merged: PlanningItem[] = [];
      Object.values(nestedByDiv).forEach((divPlans) => {
        if (Array.isArray(divPlans)) {
          merged.push(...divPlans);
        }
      });
      if (merged.length > 0) return merged;
    }

    // 3. Old flat division structure: safeData[selectedClass][division]
    const oldFlatDiv = safeData[selectedClass];
    if (oldFlatDiv && typeof oldFlatDiv === "object") {
      const merged: PlanningItem[] = [];
      Object.entries(oldFlatDiv).forEach(([key, divPlans]) => {
        if (key !== "marathi" && key !== "english" && Array.isArray(divPlans)) {
          merged.push(...divPlans);
        }
      });
      if (merged.length > 0) return merged;
    }

    return [];
  })();

  const workingDaysData = safeData.workingDays || WORKING_DAYS_ROWS;
  const weeklyPeriodsData = safeData.weeklyPeriods || WEEKLY_PERIODS_ROWS;
  const learningOutcomesData = safeData.learningOutcomes || LEARNING_OUTCOMES_ROWS;

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) {
      toast.error(lang === "mr" ? "कृपया विषय आणि घटक भरा!" : "Please fill subject and topic name!");
      return;
    }

    const newItem: PlanningItem = {
      id: Math.random().toString(36).substring(2, 9),
      month: newMonth,
      subject: newSubject,
      topic: newTopic,
      periods: 1,
      status: "Planned",
    };

    const updatedData = { ...safeData };
    if (!updatedData[selectedClass]) updatedData[selectedClass] = {};
    if (typeof updatedData[selectedClass] !== "object") {
      updatedData[selectedClass] = {};
    }

    updatedData[selectedClass][selectedMedium] = [
      ...currentPlans,
      newItem,
    ];

    // Clean up old division keys
    PLANNING_DIVISIONS.forEach((div) => {
      if (updatedData[selectedClass][div]) {
        delete updatedData[selectedClass][div];
      }
    });

    onChange(updatedData);

    // Reset Form
    setNewSubject("");
    setNewTopic("");

    toast.success(dict.successAdd);
  };

  const handleDeletePlan = (id: string) => {
    const updatedData = { ...safeData };
    if (!updatedData[selectedClass]) updatedData[selectedClass] = {};
    if (typeof updatedData[selectedClass] !== "object") {
      updatedData[selectedClass] = {};
    }

    updatedData[selectedClass][selectedMedium] = currentPlans.filter((item: PlanningItem) => item.id !== id);

    // Clean up old division keys
    PLANNING_DIVISIONS.forEach((div) => {
      if (updatedData[selectedClass][div]) {
        delete updatedData[selectedClass][div];
      }
    });

    onChange(updatedData);
    toast.success(dict.successDel);
  };


  return (
    <div className="space-y-12 text-slate-800">
      {/* Dynamic Selector Flow Container */}
      <div className="bg-[#ffffff] border border-[#C7D2FE]/80 p-8 rounded-[2.5rem] shadow-sm space-y-8 max-w-[1200px] mx-auto">
        {/* Step 1: Select Class */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">1</div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3563C9]">Select Class / वर्ग निवडा</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PLANNING_CLASSES.map((cls) => {
              const isSelected = selectedClass === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    setSelectedClass(cls.id);
                    const activeMedium = classMediums[cls.id] || "marathi";
                    setSelectedMedium(activeMedium);
                    setShowSpreadsheet(false);
                  }}
                  className={`py-3.5 px-5 rounded-2xl font-black text-[10px] uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-[#4B7BE5] text-white border-[#4B7BE5] shadow-md scale-105"
                      : "bg-white text-slate-500 border-blue-100 hover:border-blue-300 hover:text-[#4B7BE5] hover:shadow-sm"
                  }`}
                >
                  {lang === "mr" ? cls.mr : cls.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Medium */}
        {selectedClass && (
          <div className="space-y-4 pt-6 border-t border-blue-100/60">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">2</div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3563C9]">Select Medium / माध्यम निवडा</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {PLANNING_MEDIUMS.map((med) => {
                const isSelected = selectedMedium === med.id;
                return (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => {
                      setSelectedMedium(med.id);
                      const newMediums = { ...classMediums, [selectedClass]: med.id };
                      setClassMediums(newMediums);
                      setShowSpreadsheet(false);
                    }}
                    className={`py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#4B7BE5] text-white border-[#4B7BE5] shadow-md scale-[1.02]"
                        : "bg-white text-slate-500 border-blue-100/80 hover:border-blue-300 hover:text-[#4B7BE5] hover:shadow-sm"
                    }`}
                  >
                    <span>{med.id === "english" ? "Semi English / सेमी इंग्रजी" : "Marathi / मराठी"}</span>
                    {isSelected && <CheckCircle2 className="size-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Show Files */}
        {selectedClass && selectedMedium && (
          <div className="space-y-4 pt-6 border-t border-blue-100/60 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">3</div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3563C9]">Show Files / फायली आणि अहवाल</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Card 1: Annual Planning */}
              <div className="bg-white border border-blue-100 p-6 rounded-[2rem] flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <div className="space-y-2">
                  <div className="size-10 rounded-xl bg-[#4B7BE5]/10 flex items-center justify-center text-[#4B7BE5]">
                    <FileSpreadsheet className="size-5" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Annual Planning PDF / वार्षिक नियोजन</h4>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    वार्षिक कामाचे दिवस, साप्ताहिक तासिका वाटप आणि एकूण अध्ययन निष्पत्ती संख्या अहवाल.
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpreadsheet(true);
                      setTimeout(() => {
                        document.querySelector(".sheet-editor-container")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="flex-1 py-3 px-4 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-[#3563C9] bg-[#ffffff] hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF("annual")}
                    disabled={isDownloading}
                    className="flex-1 py-3 px-4 bg-[#4B7BE5] text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="size-3.5 text-white" />
                    Download
                  </button>
                </div>
              </div>

              {/* Card 2: Monthly Planning */}
              <div className="bg-white border border-blue-100 p-6 rounded-[2rem] flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <div className="space-y-2">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4B7BE5]">
                    <Calendar className="size-5" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Monthly Planning PDF / मासिक नियोजन</h4>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    जून ते एप्रिल मधील सर्व विषयांचे महिनावार अभ्यासक्रम घटक नियोजन अहवाल.
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpreadsheet(true);
                      setTimeout(() => {
                        document.querySelector(".sheet-editor-container")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="flex-1 py-3 px-4 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-[#3563C9] bg-[#ffffff] hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF("monthly")}
                    disabled={isDownloading}
                    className="flex-1 py-3 px-4 bg-[#4B7BE5] text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="size-3.5 text-white" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form & Planner List Container */}
      {showSpreadsheet && (selectedMedium === "english" || selectedMedium === "marathi") && (
        <div className="space-y-6 max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center px-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B7BE5]">Planning Workspace / संपादन क्षेत्र</h3>
            <button
              type="button"
              onClick={() => setShowSpreadsheet(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
            >
              Hide Editor / बंद करा
            </button>
          </div>
          <div className="bg-white border border-[#C7D2FE] p-12 rounded-[2.5rem] shadow-xl space-y-12 text-black overflow-x-auto relative sheet-editor-container">
          <style>{`
            .sheet-editor-container {
              background: #ffffff !important;
            }
            .sheet-editor table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .sheet-editor th, .sheet-editor td {
              border: 1px solid #e2e8f0;
              padding: 10px 8px;
              font-size: 11px;
              text-align: center;
              vertical-align: middle;
            }
            .sheet-editor th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #334155;
            }
            .sheet-editor td.text-left {
              text-align: left;
              padding-left: 12px;
            }
            .sheet-editor textarea {
              width: 100%;
              min-height: 50px;
              border: 1px solid transparent;
              background-color: #fafaf9;
              padding: 6px 8px;
              font-size: 11px;
              border-radius: 6px;
              outline: none;
              resize: vertical;
              font-family: inherit;
              line-height: 1.4;
              transition: all 0.2s;
              color: #000;
            }
            .sheet-editor textarea:focus {
              border-color: #4B7BE5;
              background-color: #fff;
              box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
            }
            .sheet-editor input.cell-input {
              width: 100%;
              border: 1px solid transparent;
              background-color: transparent;
              padding: 6px 4px;
              font-size: 11px;
              text-align: center;
              outline: none;
              font-family: inherit;
              transition: all 0.2s;
              color: #000;
            }
            .sheet-editor input.cell-input:focus {
              border-color: #4B7BE5;
              background-color: #ffffff;
              border-radius: 4px;
              box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
            }
          `}</style>

          {/* Header Info block */}
          <div className="border-2 border-slate-200 p-6 rounded-2xl bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">शाळा:</span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => handleSchoolNameChange(e.target.value)}
                    placeholder="शाळेचे नाव प्रविष्ट करा..."
                    className="flex-1 px-3 py-1.5 border border-blue-100 rounded-lg text-xs font-semibold bg-white outline-none focus:border-[#4B7BE5] focus:ring-1 focus:ring-[#4B7BE5] text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">वर्गशिक्षक नाव:</span>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => handleTeacherNameChange(e.target.value)}
                    placeholder="शिक्षक नाव प्रविष्ट करा..."
                    className="flex-1 px-3 py-1.5 border border-blue-100 rounded-lg text-xs font-semibold bg-white outline-none focus:border-[#4B7BE5] focus:ring-1 focus:ring-[#4B7BE5] text-slate-800"
                  />
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">वार्षिक नियोजन</h2>
                <p className="text-xs font-bold text-[#4B7BE5] uppercase tracking-[0.2em] mt-2">शैक्षणिक वर्ष २०२६-२०२७</p>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs font-black text-slate-800">
                  इयत्ता: <span className="bg-[#4B7BE5] text-white px-2 py-0.5 rounded text-[10px] ml-1">
                    {(CLASS_MR_MAP[selectedClass] || selectedClass) + (selectedMedium === "marathi" ? "" : " सेमी")}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  माध्यम: <span className="text-[#4B7BE5]">
                    {selectedMedium === "marathi" ? "मराठी" : "इंग्रजी"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sheet-editor space-y-10">
            {/* Table 1: कामाचे दिवस */}
            <div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#4B7BE5]" /> वार्षिक कामाचे दिवस ( सन -२०२६/२०२७ )
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table>
                  <thead>
                    <tr>
                      <th>महिना</th>
                      <th>सोमवार</th>
                      <th>मंगळवार</th>
                      <th>बुधवार</th>
                      <th>गुरुवार</th>
                      <th>शुक्रवार</th>
                      <th>शनिवार</th>
                      <th>एकूण</th>
                      <th>रविवार व सुट्टी</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workingDaysData.map((row: any, idx: number) => (
                      <tr key={idx} className={idx >= 11 ? "bg-slate-50 font-bold" : ""}>
                        <td className="font-semibold text-slate-800">{row.month}</td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.mon}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "mon", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.tue}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "tue", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.wed}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "wed", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.thu}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "thu", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.fri}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "fri", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.sat}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "sat", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="font-bold text-slate-900">
                          <input
                            type="text"
                            value={row.total}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "total", e.target.value)}
                            className="cell-input font-bold"
                          />
                        </td>
                        <td className="text-slate-500">
                          <input
                            type="text"
                            value={row.holidays}
                            onChange={(e) => handleWorkingDaysCellChange(idx, "holidays", e.target.value)}
                            className="cell-input text-slate-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: साप्ताहिक तासिका */}
            <div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#D6B97A]" /> साप्ताहिक तासिका – २०२६/२०२७
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table>
                  <thead>
                    <tr>
                      <th>विषय</th>
                      <th>१ ली</th>
                      <th>२ री</th>
                      <th>३ री</th>
                      <th>४ थी</th>
                      <th>५ वी</th>
                      <th>६ वी</th>
                      <th>७ वी</th>
                      <th>८ वी</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyPeriodsData.map((row: any, idx: number) => (
                      <tr key={idx} className={row.subject === "एकूण" ? "bg-slate-50 font-bold" : ""}>
                        <td className="text-left font-semibold text-slate-800">
                          <input
                            type="text"
                            value={row.subject}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "subject", e.target.value)}
                            className="cell-input text-left font-semibold"
                            style={{ textAlign: "left" }}
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c1}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c1", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c2}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c2", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c3}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c3", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c4}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c4", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c5}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c5", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c6}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c6", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c7}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c7", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c8}
                            onChange={(e) => handleWeeklyPeriodsCellChange(idx, "c8", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: अध्ययन निष्पत्ती संख्या */}
            <div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#D6B97A]" /> अध्ययन निष्पत्ती संख्या ( १ ली ते ८ वी )
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table>
                  <thead>
                    <tr>
                      <th>विषय</th>
                      <th>विषय कोड</th>
                      <th>1 ली</th>
                      <th>२ री</th>
                      <th>३ री</th>
                      <th>४ थी</th>
                      <th>५ वी</th>
                      <th>६ वी</th>
                      <th>७ वी</th>
                      <th>८ वी</th>
                      <th>एकूण</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learningOutcomesData.map((row: any, idx: number) => (
                      <tr key={idx} className={row.subject === "एकूण" ? "bg-slate-50 font-bold" : ""}>
                        <td className="text-left font-semibold text-slate-800">
                          <input
                            type="text"
                            value={row.subject}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "subject", e.target.value)}
                            className="cell-input text-left font-semibold"
                            style={{ textAlign: "left" }}
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.code}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "code", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c1}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c1", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c2}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c2", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c3}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c3", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c4}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c4", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c5}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c5", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c6}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c6", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c7}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c7", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="text-slate-800">
                          <input
                            type="text"
                            value={row.c8}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "c8", e.target.value)}
                            className="cell-input"
                          />
                        </td>
                        <td className="font-bold text-slate-900">
                          <input
                            type="text"
                            value={row.total}
                            onChange={(e) => handleLearningOutcomesCellChange(idx, "total", e.target.value)}
                            className="cell-input font-bold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Plans */}
            {subjectKeys.map((subKey) => {
              const subTitleMap: Record<string, string> = {
                marathi: "विषय – मराठी",
                math: selectedMedium === "marathi" ? "विषय – गणित" : "विषय – Math",
                english: "विषय – इंग्रजी",
                hindi: "विषय – हिंदी",
                evs1: "विषय – परिसर अभ्यास भाग – १",
                evs2: "विषय – परिसर अभ्यास भाग – २"
              };
              const staticPlansSource = getStaticPlansForClass(selectedClass, selectedMedium);
              const staticPlans = subKey === "math" && selectedMedium === "marathi"
                ? staticPlansSource.math_mr
                : staticPlansSource[subKey];
              
              return (
                <div key={subKey} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      इयत्ता – {CLASS_MR_MAP[selectedClass] || selectedClass}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{subTitleMap[subKey]}</h4>
                    <span className="text-xs font-bold text-[#D6B97A] uppercase tracking-wider">वार्षिक नियोजन २०२६-२७</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "10%" }}>महिना</th>
                          <th style={{ width: "8%" }}>कामाचे दिवस</th>
                          <th style={{ width: "8%" }}>प्राप्त तासिका</th>
                          <th style={{ width: "44%" }}>घटक (अभ्यासक्रम नियोजन)</th>
                          <th style={{ width: "10%" }}>पुरा /अपुरा</th>
                          <th style={{ width: "10%" }}>शिक्षक स्वाक्षरी</th>
                          <th style={{ width: "10%" }}>मुख्याध्यापक स्वाक्षरी</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS_LIST.map((mId, mIdx) => {
                          const monthNameMr = MONTHS_MR_MAP[mId];
                          const staticRow = staticPlans[mIdx];
                          
                          // Load dynamic text or fallback
                          const item = currentPlans.find(p => {
                            return matchSubject(p.subject, subKey) && p.month.toLowerCase() === mId.toLowerCase();
                          });
                          const displayVal = item ? item.topic : staticRow.topics;
                          const finalDays = item?.workingDays !== undefined ? item.workingDays : String(staticRow.days);
                          const finalPeriods = item?.periodsCount !== undefined ? item.periodsCount : String(staticRow.periods);
                          const finalStatus = item?.completionStatus !== undefined ? item.completionStatus : "";
                          const finalSignature = item?.signature !== undefined ? item.signature : "";
                          const finalPrincipalSignature = item?.principalSignature !== undefined ? item.principalSignature : "";

                          return (
                            <tr key={mId}>
                              <td className="font-bold text-slate-700">{monthNameMr}</td>
                              <td>
                                <input
                                  type="text"
                                  value={finalDays}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "workingDays", e.target.value)}
                                  className="cell-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={finalPeriods}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "periodsCount", e.target.value)}
                                  className="cell-input"
                                />
                              </td>
                              <td className="p-2">
                                <textarea
                                  value={displayVal}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "topic", e.target.value)}
                                  placeholder={`${monthNameMr} साठी घटक नियोजन लिहा...`}
                                  rows={2}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={finalStatus}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "completionStatus", e.target.value)}
                                  placeholder="उदा. पुरा / अपुरा"
                                  className="cell-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={finalSignature}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "signature", e.target.value)}
                                  placeholder="स्वाक्षरी"
                                  className="cell-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={finalPrincipalSignature}
                                  onChange={(e) => handleSubjectPlanFieldChange(subKey, mId, "principalSignature", e.target.value)}
                                  placeholder="स्वाक्षरी"
                                  className="cell-input"
                                />
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Total Row */}
                        <tr className="bg-slate-50 font-bold">
                          <td>एकूण</td>
                          <td>
                            {getSubjectTotals(subKey, staticPlans).totalDays}
                          </td>
                          <td>
                            {getSubjectTotals(subKey, staticPlans).totalPeriods}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {renderScreenSignature()}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* Offscreen A4 Landscape PDF Print Content */}
      <div
        id="academic-planning-pdf-content"
        style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "1120px" }}
        className="bg-white p-8 space-y-8 text-black font-sans pdf-layout"
      >
        <style>{`
          .pdf-layout {
            font-family: 'Inter', 'Arial', sans-serif;
            color: #000 !important;
            background: #fff !important;
          }
          .pdf-layout h2 {
            font-size: 20px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 2px;
            color: #000;
          }
          .pdf-layout h3 {
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            color: #000;
          }
          .pdf-layout table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .pdf-layout th, .pdf-layout td {
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            font-size: 10px !important;
            text-align: center;
            vertical-align: middle;
            color: #000 !important;
          }
          .pdf-layout th {
            background-color: #f3f4f6 !important;
            font-weight: 700;
          }
          .pdf-layout td.text-left {
            text-align: left !important;
            padding-left: 8px !important;
          }
          .pdf-page-break {
            page-break-before: always;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            font-size: 11px;
            font-weight: 700;
            padding: 0 10px;
            page-break-inside: avoid;
          }
        `}</style>
        
        <div className="pdf-annual-section space-y-8">
          {/* Header Info Block */}
          {renderPDFHeader()}

          {/* Table 1: कामाचे दिवस */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", marginBottom: "6px" }}>वार्षिक कामाचे दिवस ( सन -२०२६/२०२७ )</h3>
            <table>
              <thead>
                <tr>
                  <th>महिना</th>
                  <th>सोमवार</th>
                  <th>मंगळवार</th>
                  <th>बुधवार</th>
                  <th>गुरुवार</th>
                  <th>शुक्रवार</th>
                  <th>शनिवार</th>
                  <th>एकूण</th>
                  <th>रविवार व सुट्टी</th>
                </tr>
              </thead>
              <tbody>
                {workingDaysData.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: idx >= 11 ? "bold" : "normal" }}>{row.month}</td>
                    <td>{row.mon}</td>
                    <td>{row.tue}</td>
                    <td>{row.wed}</td>
                    <td>{row.thu}</td>
                    <td>{row.fri}</td>
                    <td>{row.sat}</td>
                    <td style={{ fontWeight: "bold" }}>{row.total}</td>
                    <td>{row.holidays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 2: साप्ताहिक तासिका */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", marginBottom: "6px" }}>साप्ताहिक तासिका – २०२६/२०२७</h3>
            <table>
              <thead>
                <tr>
                  <th>विषय</th>
                  <th>१ ली</th>
                  <th>२ री</th>
                  <th>३ री</th>
                  <th>४ थी</th>
                  <th>५ वी</th>
                  <th>६ वी</th>
                  <th>७ वी</th>
                  <th>८ वी</th>
                </tr>
              </thead>
              <tbody>
                {weeklyPeriodsData.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="text-left" style={{ fontWeight: row.subject === "एकूण" ? "bold" : "normal" }}>{row.subject}</td>
                    <td>{row.c1}</td>
                    <td>{row.c2}</td>
                    <td>{row.c3}</td>
                    <td>{row.c4}</td>
                    <td>{row.c5}</td>
                    <td>{row.c6}</td>
                    <td>{row.c7}</td>
                    <td>{row.c8}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pdf-page-break" />

          {/* Header Info Block */}
          {renderPDFHeader()}

          {/* Table 3: अध्ययन निष्पत्ती संख्या */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", marginBottom: "6px" }}>अध्ययन निष्पत्ती संख्या ( १ ली ते ८ वी )</h3>
            <table>
              <thead>
                <tr>
                  <th>विषय</th>
                  <th>विषय कोड</th>
                  <th>1 ली</th>
                  <th>२ री</th>
                  <th>३ री</th>
                  <th>४ थी</th>
                  <th>५ वी</th>
                  <th>६ वी</th>
                  <th>७ वी</th>
                  <th>८ वी</th>
                  <th>एकूण</th>
                </tr>
              </thead>
              <tbody>
                {learningOutcomesData.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="text-left" style={{ fontWeight: row.subject === "एकूण" ? "bold" : "normal" }}>{row.subject}</td>
                    <td>{row.code}</td>
                    <td>{row.c1}</td>
                    <td>{row.c2}</td>
                    <td>{row.c3}</td>
                    <td>{row.c4}</td>
                    <td>{row.c5}</td>
                    <td>{row.c6}</td>
                    <td>{row.c7}</td>
                    <td>{row.c8}</td>
                    <td style={{ fontWeight: "bold" }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pdf-monthly-section">
          {/* Subject Monthly Plans (Tables 4, 5, 6) */}
        {subjectKeys.map((subKey) => {
          const subTitleMap: Record<string, string> = {
            marathi: "विषय – मराठी",
            math: selectedMedium === "marathi" ? "विषय – गणित" : "विषय – Math",
            english: "विषय – इंग्रजी",
            hindi: "विषय – हिंदी",
            evs1: "विषय – परिसर अभ्यास भाग – १",
            evs2: "विषय – परिसर अभ्यास भाग – २"
          };
          const staticPlansSource = getStaticPlansForClass(selectedClass, selectedMedium);
          const staticPlans = subKey === "math" && selectedMedium === "marathi"
            ? staticPlansSource.math_mr
            : staticPlansSource[subKey];
          
          return (
            <div key={subKey} className="pdf-page-break" style={{ paddingBottom: "10px" }}>
              {/* Header Info Block */}
              {renderPDFHeader()}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #000", paddingBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>
                  इयत्ता – {CLASS_MR_MAP[selectedClass] || selectedClass}
                </span>
                <h3 style={{ fontSize: "13px", fontWeight: "800", margin: 0 }}>वार्षिक नियोजन सन - २०२६-२०२७</h3>
                <span style={{ fontSize: "11px", fontWeight: "bold" }}>{subTitleMap[subKey]}</span>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "12%" }}>महिना</th>
                    <th style={{ width: "10%" }}>कामाचे दिवस</th>
                    <th style={{ width: "10%" }}>प्राप्त तासिका</th>
                    <th style={{ width: "48%" }}>घटक</th>
                    <th style={{ width: "10%" }}>पुरा /अपुरा</th>
                    <th style={{ width: "10%" }}>शिक्षक स्वाक्षरी</th>
                    <th style={{ width: "10%" }}>मुख्याध्यापक स्वाक्षरी</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS_LIST.map((mId, mIdx) => {
                    const monthNameMr = MONTHS_MR_MAP[mId];
                    const staticRow = staticPlans[mIdx];
                    
                    const item = currentPlans.find(p => {
                      return matchSubject(p.subject, subKey) && p.month.toLowerCase() === mId.toLowerCase();
                    });

                    const finalTopics = item ? item.topic : staticRow.topics;
                    const finalDays = item?.workingDays !== undefined ? item.workingDays : String(staticRow.days);
                    const finalPeriods = item?.periodsCount !== undefined ? item.periodsCount : String(staticRow.periods);
                    const finalStatus = item?.completionStatus !== undefined ? item.completionStatus : "";
                    const finalSignature = item?.signature !== undefined ? item.signature : "";
                    const finalPrincipalSignature = item?.principalSignature !== undefined ? item.principalSignature : "";
                    
                    return (
                      <tr key={mId}>
                        <td style={{ fontWeight: "bold" }}>{monthNameMr}</td>
                        <td>{finalDays}</td>
                        <td>{finalPeriods}</td>
                        <td className="text-left" style={{ fontSize: "9.5px", lineHeight: "1.2", whiteSpace: "pre-wrap" }}>
                          {finalTopics}
                        </td>
                        <td>{finalStatus}</td>
                        <td>{finalSignature}</td>
                        <td>{finalPrincipalSignature}</td>
                      </tr>
                    );
                  })}
                  
                  {/* Total Row */}
                  <tr style={{ fontWeight: "bold" }}>
                    <td>एकूण</td>
                    <td>
                      {getSubjectTotals(subKey, staticPlans).totalDays}
                    </td>
                    <td>
                      {getSubjectTotals(subKey, staticPlans).totalPeriods}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              
              {renderPDFSignature()}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
