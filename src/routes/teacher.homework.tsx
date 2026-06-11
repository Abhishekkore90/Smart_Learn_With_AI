import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Book,
  Languages,
  Beaker,
  Calculator,
  Globe,
  ScrollText,
  Users,
  Plus,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit3,
  Share2,
  Download,
  MessageCircle,
  Hash,
  GraduationCap,
  ChevronRight,
  Zap,
  Send as SendIcon,
  Star,
  Trophy,
  Award,
  Rocket,
  ChevronLeft,
} from "lucide-react";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const Route = createFileRoute("/teacher/homework")({
  component: HomeworkPage,
});

const CLASSES = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SUBJECTS = [
  {
    id: "marathi",
    name: "Marathi",
    icon: Languages,
    color: "bg-pink-500",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "hindi",
    name: "Hindi",
    icon: Languages,
    color: "bg-orange-500",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "english",
    name: "English",
    icon: Book,
    color: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "science",
    name: "Science",
    icon: Beaker,
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "maths",
    name: "Maths",
    icon: Calculator,
    color: "bg-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "geography",
    name: "Geography",
    icon: Globe,
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-sky-600",
  },
  {
    id: "history",
    name: "History",
    icon: ScrollText,
    color: "bg-amber-600",
    gradient: "from-amber-600 to-yellow-700",
  },
  {
    id: "civics",
    name: "Civics",
    icon: Users,
    color: "bg-slate-600",
    gradient: "from-slate-600 to-slate-800",
  },
];

const SUBJECT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  marathi: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  hindi: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  english: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  science: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  maths: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  geography: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  history: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  civics: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

const getSubjectStyle = (subjectName?: string, subjectId?: string) => {
  const key = (subjectId || subjectName || "").toLowerCase();
  return SUBJECT_STYLES[key] || { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" };
};

const getSubjectIcon = (subjectName?: string, subjectId?: string) => {
  const name = (subjectName || subjectId || "").toLowerCase();
  const sub = SUBJECTS.find(s => s.name.toLowerCase() === name || s.id === name);
  return sub ? sub.icon : Book;
};

function HomeworkPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        // Super Admin is allowed
      } else if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/homework", role: "teacher" } as any,
        });
      }
    }
  }, [user, profile, authLoading, navigate]);
  const [selectedClass, setSelectedClass] = useState("1st");
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [homeworkText, setHomeworkText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table state
  const [activeTab, setActiveTab] = useState<'detailed' | 'analytics'>('detailed');
  const [tableClassFilter, setTableClassFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Persistence Logic (Firestore)
  const [savedHomework, setSavedHomework] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, "homework"), orderBy("postedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedHomework(data);
    });

    return () => unsubscribe();
  }, []);

  const handlePostHomework = async () => {
    if (!homeworkText) {
      toast.error("Please enter homework details!");
      return;
    }
    setIsSubmitting(true);

    try {
      const newEntry = {
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        class: selectedClass,
        text: homeworkText,
        dueDate: dueDate || "Not Set",
        timeLimit: "Untimed",
        attempts: "0/1",
        score: "-",
        postedAt: new Date().toISOString(),
        color: selectedSubject.gradient,
        teacherName:
          user?.displayName || user?.email?.split("@")[0] || "Professor",
      };

      await addDoc(collection(db, "homework"), newEntry);

      setHomeworkText("");
      toast.success(`Homework for ${selectedSubject.name} saved!`);
    } catch (error: any) {
      toast.error("Failed to post homework");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteHomework = async (id: string) => {
    try {
      await deleteDoc(doc(db, "homework", id));
      toast.info("Assignment removed.");
    } catch (error) {
      toast.error("Failed to delete homework");
    }
  };

  const filteredData = useMemo(() => {
    return savedHomework.filter((hw) => {
      const matchClass = tableClassFilter === "All" || hw.class === tableClassFilter;
      const matchSearch =
        hw.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.class?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [savedHomework, searchTerm, tableClassFilter]);

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

  const classBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    CLASSES.forEach((c) => {
      counts[c] = 0;
    });
    savedHomework.forEach((hw) => {
      if (counts[hw.class] !== undefined) {
        counts[hw.class]++;
      }
    });
    return counts;
  }, [savedHomework]);

  const subjectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    SUBJECTS.forEach((s) => {
      counts[s.name] = 0;
    });
    savedHomework.forEach((hw) => {
      const sName = hw.subjectName || "Other";
      counts[sName] = (counts[sName] || 0) + 1;
    });
    return counts;
  }, [savedHomework]);

  const scrollToCreator = () => {
    const creator = document.getElementById("assignment-creator");
    if (creator) {
      creator.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Header Dashboard Branding */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="text-indigo-600 size-6" /> Class Homeworks Manager
              </h1>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Educator Portal: {user?.displayName || user?.email?.split("@")[0] || "Professor"}
              </p>
            </div>
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40 self-start md:self-center">
              <button
                onClick={() => setActiveTab("detailed")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "detailed"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Detailed View
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "detailed" ? (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  {/* Table Controls / Filters */}
                  <div className="flex flex-col gap-6 mb-8 border-b border-slate-100 pb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Search Bar */}
                      <div className="relative flex-grow max-w-md">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350"
                          size={16}
                        />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 uppercase tracking-wider"
                          placeholder="Search assignments..."
                        />
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Entries per page */}
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2">
                          Show
                          <select
                            className="bg-transparent border-none outline-none text-slate-900 cursor-pointer font-black"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                          entries
                        </div>

                        {/* Direct Create Shortcut */}
                        <button
                          onClick={scrollToCreator}
                          className="px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                        >
                          <Plus size={14} /> Create Assignment
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Class Pills filter */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Class Filter:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setTableClassFilter("All")}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            tableClassFilter === "All"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/60"
                          }`}
                        >
                          All Classes
                        </button>
                        {CLASSES.map((cls) => (
                          <button
                            key={cls}
                            onClick={() => setTableClassFilter(cls)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              tableClassFilter === cls
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/60"
                            }`}
                          >
                            {cls} Class
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LMS Enhanced Table */}
                  <div className="overflow-x-auto rounded-[2rem] border border-slate-200/60">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200/80">
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center w-16">
                            Sr.No.
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 w-36">
                            Due Date
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Assignment Brief
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center w-28">
                            Time Limit
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center w-28">
                            Attempts
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center w-36">
                            Gradebook Score
                          </th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right w-48">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {!mounted ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs"
                            >
                              <div className="flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin text-indigo-500" />
                                <span>Synchronizing assignments...</span>
                              </div>
                            </td>
                          </tr>
                        ) : paginatedData.length > 0 ? (
                          paginatedData.map((hw, idx) => (
                            <tr
                              key={hw.id}
                              className="hover:bg-slate-50/65 transition-all duration-150 border-b border-slate-100 group"
                            >
                              <td className="px-6 py-5 text-center">
                                <span className="text-[11px] font-black text-slate-400">
                                  {(currentPage - 1) * entriesPerPage + idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                  <Calendar size={14} className="text-slate-400" />
                                  <span>
                                    {new Date(hw.dueDate).toLocaleDateString() === "Invalid Date"
                                      ? hw.dueDate
                                      : new Date(hw.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const style = getSubjectStyle(hw.subjectName, hw.subjectId);
                                      const Icon = getSubjectIcon(hw.subjectName, hw.subjectId);
                                      return (
                                        <span
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}
                                        >
                                          <Icon size={11} strokeWidth={2.5} />
                                          {hw.subjectName}
                                        </span>
                                      );
                                    })()}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                                      {hw.class} Class
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-800 tracking-wide mt-1">
                                    {hw.text}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Posted by {hw.teacherName || "Professor"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                  {hw.timeLimit || "Untimed"}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                  {hw.attempts || "0/1"}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 uppercase tracking-widest transition-all">
                                  {hw.score !== "-" ? `SEE SCORE (${hw.score})` : "SEE SCORE"}
                                </button>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-3.5">
                                  <button className="px-4 py-2 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-650 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-100 hover:border-indigo-600 transition-all shadow-sm">
                                    VIEW DETAIL
                                  </button>
                                  <button
                                    onClick={() => deleteHomework(hw.id)}
                                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100/40"
                                    title="Delete Assignment"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                                <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                  <BookOpen className="text-slate-350 size-7" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    No Assignments Found
                                  </h3>
                                  <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                                    We couldn't find any assignments listed. Go ahead and create your first homework assignment below!
                                  </p>
                                </div>
                                <button
                                  onClick={scrollToCreator}
                                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md"
                                >
                                  Add Homework Now
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer / Pagination */}
                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Showing {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)} to{" "}
                      {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all uppercase tracking-widest"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`size-9 rounded-xl text-[10px] font-black transition-all ${
                                currentPage === p
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <button
                          disabled={currentPage === totalPages || totalPages === 0}
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all uppercase tracking-widest"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Dynamic Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-[2rem] text-white shadow-lg shadow-indigo-500/10 flex items-center justify-between border border-indigo-400/20">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-150">
                        Total Assignments
                      </span>
                      <h3 className="text-4xl font-extrabold mt-1 tracking-tight">
                        {savedHomework.length}
                      </h3>
                    </div>
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
                      <BookOpen className="size-6" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-650 p-8 rounded-[2rem] text-white shadow-lg shadow-emerald-500/10 flex items-center justify-between border border-emerald-400/20">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-150">
                        Active Classes
                      </span>
                      <h3 className="text-4xl font-extrabold mt-1 tracking-tight">
                        {CLASSES.filter((c) => (classBreakdown[c] || 0) > 0).length} / {CLASSES.length}
                      </h3>
                    </div>
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
                      <GraduationCap className="size-6" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-550 p-8 rounded-[2rem] text-white shadow-lg shadow-amber-500/10 flex items-center justify-between border border-amber-400/20">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-150">
                        Top Subject
                      </span>
                      <h3 className="text-2xl font-extrabold mt-2 tracking-tight truncate">
                        {(() => {
                          let max = 0;
                          let top = "None";
                          Object.entries(subjectBreakdown).forEach(([sub, count]) => {
                            if (count > max) {
                              max = count;
                              top = sub;
                            }
                          });
                          return max > 0 ? `${top} (${max})` : "None";
                        })()}
                      </h3>
                    </div>
                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
                      <Trophy className="size-6" />
                    </div>
                  </div>
                </div>

                {/* Distribution Progress Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                    <h4 className="text-sm font-black text-slate-800 tracking-wider mb-6 flex items-center gap-2.5 uppercase">
                      <Users size={16} className="text-indigo-500" /> Class-wise Assignments
                    </h4>
                    <div className="space-y-4">
                      {CLASSES.map((cls) => {
                        const count = classBreakdown[cls] || 0;
                        const percent = savedHomework.length > 0 ? (count / savedHomework.length) * 100 : 0;
                        return (
                          <div key={cls} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span>{cls} Class</span>
                              <span className="text-indigo-600">
                                {count} Homework{count !== 1 ? "s" : ""} ({percent.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                    <h4 className="text-sm font-black text-slate-800 tracking-wider mb-6 flex items-center gap-2.5 uppercase">
                      <Book size={16} className="text-pink-500" /> Subject-wise Distribution
                    </h4>
                    <div className="space-y-4">
                      {SUBJECTS.map((sub) => {
                        const count = subjectBreakdown[sub.name] || 0;
                        const percent = savedHomework.length > 0 ? (count / savedHomework.length) * 100 : 0;
                        return (
                          <div key={sub.id} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <sub.icon size={13} className="text-slate-400" />
                                {sub.name}
                              </span>
                              <span className="text-pink-600">
                                {count} Homework{count !== 1 ? "s" : ""} ({percent.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${sub.gradient} rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posting Studio Card */}
          <div id="assignment-creator" className="xl:col-span-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              {/* Creator title */}
              <div className="border-b border-slate-100 pb-6 mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                  <Rocket className="text-indigo-500 size-5" /> Create New Assignment
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Draft and publish a new homework task to a class. It will sync automatically to student devices.
                </p>
              </div>

              {/* Class Select Grid */}
              <div className="mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                  Select Target Class
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      type="button"
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        selectedClass === cls
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/50"
                      }`}
                    >
                      {cls} Class
                    </button>
                  ))}
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Textarea Description */}
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                    Assignment Description
                  </label>
                  <div className="bg-slate-50/70 border border-slate-200/60 rounded-[2rem] p-6 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-50 transition-all shadow-inner">
                    <textarea
                      value={homeworkText}
                      onChange={(e) => setHomeworkText(e.target.value)}
                      placeholder="Describe the homework details (e.g. read chapter 5, solve exercises)..."
                      className="w-full h-44 bg-transparent outline-none text-base font-bold text-slate-700 placeholder:text-slate-300 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Subject Selector & Date */}
                <div className="lg:col-span-1 space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                      Select Subject
                    </label>
                    <select
                      value={selectedSubject.id}
                      onChange={(e) =>
                        setSelectedSubject(
                          SUBJECTS.find((s) => s.id === e.target.value) || SUBJECTS[0]
                        )
                      }
                      className="w-full h-14 px-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all cursor-pointer text-slate-700"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="lg:col-span-1 flex items-end">
                  <button
                    onClick={handlePostHomework}
                    disabled={isSubmitting}
                    type="button"
                    className="w-full h-14 lg:h-20 bg-indigo-650 text-white rounded-2xl lg:rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-650/20 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Rocket size={18} /> Publish Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
