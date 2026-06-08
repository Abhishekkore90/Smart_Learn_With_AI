import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Download,
  UploadCloud,
  FileText,
  Calendar,
  Layers,
  ClipboardList,
  BarChart3,
  Percent,
  Award,
  BookOpen,
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
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";



// React Router Dom wrapper imports for supporting legacy navigation inside result folder components
import {
  MemoryRouter,
  Routes,
  Route as ReactRouterRoute,
  useNavigate as useReactRouterNavigate,
  useLocation as useReactRouterLocation,
} from "react-router-dom";

// @ts-ignore
import ResultEntry from "@/result/GunaNeendani";
// @ts-ignore
import MarkEnterySSC from "@/result/MarkEnterySSC";
// @ts-ignore
import MarkEnteryHSC from "@/result/MarkEntryHSC";
// @ts-ignore
import AllMarksPath from "@/result/AllMarksPath";
// @ts-ignore
import ProgressSheet from "@/result/ProgressSheet";
// @ts-ignore
import DailyRegister from "@/result/DailyRegister";
// @ts-ignore
import SubjectWiseResult from "@/result/SubjectWiseResult";
// @ts-ignore
import GradeWise from "@/result/GradeWise";
// @ts-ignore
import BoardResult from "@/result/BoardResult";
// @ts-ignore
import SemesterResult9th10th from "@/result/CombinedResult9th10th";
// @ts-ignore
import StudentProgresswithout from "@/result/StudentProgresswithout";
// @ts-ignore
import ResultSSC from "@/result/ResultSSC";
// @ts-ignore
import ResultHSC from "@/result/ResultHSC";
// @ts-ignore
import Collectout from "@/result/Collectout";
// @ts-ignore
import PromoteStudents from "@/result/PromoteStudents";

export const Route = createFileRoute("/teacher/result")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "marks-entry",
  }),
  component: TeacherResultsPage,
});

const CLASSES = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

// Header for Marks Entry Memory Router
function MarksEntryHeader() {
  const location = useReactRouterLocation();
  const navigate = useReactRouterNavigate();

  if (location.pathname === "/") return null;

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-6 rounded-[2rem] mb-6">
      <div className="flex items-center gap-3">
        <div className="size-2 bg-blue-600 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
          Active Workspace: {location.pathname.replace("/", "").toUpperCase()}
        </span>
      </div>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all"
      >
        ← Back to Marks Menu
      </button>
    </div>
  );
}

// Wrapper for Marks Entry
function MarksEntryWrapper() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <div className="space-y-4">
        <MarksEntryHeader />
        <Routes>
          <ReactRouterRoute path="/" element={<AllMarksPath />} />
          <ReactRouterRoute path="/GunaNeendani" element={<ResultEntry />} />
          <ReactRouterRoute path="/markenterssc" element={<MarkEnterySSC />} />
          <ReactRouterRoute path="/markenterhsc" element={<MarkEnteryHSC />} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}

function TeacherResultsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        // Super admin allowed
      } else if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/result", role: "teacher" } as any,
        });
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Tab State
  const { tab } = Route.useSearch();
  const activeTab = tab || "marks-entry";

  // Form State for custom file uploads
  const [selectedClass, setSelectedClass] = useState("1st");
  const [examTitle, setExamTitle] = useState("");
  const [fileData, setFileData] = useState<{ name: string; content: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom File Uploader List States
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [resultsList, setResultsList] = useState<any[]>([]);

  // Real-time custom upload list sync
  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResultsList(data);
    });

    return () => unsubscribe();
  }, []);

  // File Upload Handler (Base64 conversion)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          name: file.name,
          type: file.type,
          content: reader.result as string,
        });
        toast.success(`File "${file.name}" loaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // File Drop Handler
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          name: file.name,
          type: file.type,
          content: reader.result as string,
        });
        toast.success(`File "${file.name}" loaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Result file to Firestore
  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast.error("Please enter the Exam Title!");
      return;
    }
    if (!fileData) {
      toast.error("Please select a result file to upload!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newResult = {
        examTitle: examTitle.trim(),
        class: selectedClass,
        fileName: fileData.name,
        fileType: fileData.type,
        fileContent: fileData.content,
        uploadedBy: profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "Educator",
        createdAt: new Date().toISOString(),
        dateStr: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
      };

      await addDoc(collection(db, "results"), newResult);
      setExamTitle("");
      setFileData(null);
      const fileInput = document.getElementById("result-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast.success("Result file uploaded successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to upload result file");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Result from Firestore
  const handleDeleteResult = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      await deleteDoc(doc(db, "results", id));
      toast.info("Result file deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete result");
    }
  };

  // Trigger File Download
  const handleDownloadFile = (result: any) => {
    try {
      const link = document.createElement("a");
      link.href = result.fileContent;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading "${result.fileName}"`);
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  // Search & Filter Memo for custom files
  const filteredData = useMemo(() => {
    return resultsList.filter((res) => {
      const matchSearch =
        res.examTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [resultsList, searchTerm]);

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

  // Tabs config
  const TABS = [
    { id: "marks-entry", label: "Marks Entry (1st-12th)", icon: FileSpreadsheet },
    { id: "progress-sheets", label: "Progress Sheet", icon: Layers },
    { id: "daily-register", label: "Daily Register", icon: ClipboardList },
    { id: "subject-wise", label: "Subject Wise", icon: BookOpen },
    { id: "grade-wise", label: "Grade Wise", icon: Percent },
    { id: "board-results", label: "Board Results", icon: Award },
    { id: "combined-results", label: "Combined (9th/10th)", icon: BarChart3 },
    { id: "student-progress", label: "Student Progress", icon: BarChart3 },
    { id: "uploads", label: "Upload Documents (PDF/Excel)", icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                Results Command <span className="text-blue-600">Hub</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
                Comprehensive Student Grading, Performance, and Report Card Center
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <div className="size-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Hub Active
              </span>
            </div>
          </div>

          {/* Render Active Tab Component */}
          <div className="min-h-[500px]">
            {activeTab === "marks-entry" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <MarksEntryWrapper />
              </motion.div>
            )}

            {activeTab === "progress-sheets" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <ProgressSheet />
              </motion.div>
            )}

            {activeTab === "daily-register" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <DailyRegister />
              </motion.div>
            )}

            {activeTab === "subject-wise" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <SubjectWiseResult />
              </motion.div>
            )}

            {activeTab === "grade-wise" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <GradeWise />
              </motion.div>
            )}

            {activeTab === "board-results" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <BoardResult />
              </motion.div>
            )}

            {activeTab === "combined-results" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <Collectout />
              </motion.div>
            )}

            {activeTab === "ssc-result" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <ResultSSC />
              </motion.div>
            )}

            {activeTab === "hsc-result" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <ResultHSC />
              </motion.div>
            )}

            {(activeTab === "view-report" || activeTab === "student-progress") && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <StudentProgresswithout />
              </motion.div>
            )}

            {activeTab === "promote-students" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <PromoteStudents />
              </motion.div>
            )}

            {activeTab === "result-9th-10th" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <SemesterResult9th10th />
              </motion.div>
            )}

            {activeTab === "uploads" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* File Upload Section */}
                <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/5 to-transparent rounded-bl-[100px]" />
                  <h3 className="text-lg font-black text-slate-900 italic tracking-tight mb-8 flex items-center gap-2">
                    <UploadCloud className="size-6 text-blue-600" /> Upload New Result File
                  </h3>

                  {/* Class Tabs Selector */}
                  <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2 border-b border-slate-100">
                    {CLASSES.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedClass === cls ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {cls} Class
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleUploadResult} className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Exam Title / Name
                      </label>
                      <div className="bg-slate-50 rounded-2xl flex items-center gap-4 px-6 border border-slate-100 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
                        <FileText className="size-5 text-slate-300 focus-within:text-blue-500" />
                        <input
                          type="text"
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          placeholder="e.g. Unit Test I (2026), First Semester"
                          className="bg-transparent outline-none w-full py-5 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Result Document
                      </label>
                      <div 
                        className="relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                      >
                        <input
                          id="result-file-input"
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                          accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.csv"
                        />
                        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-white transition-all py-4 px-6 flex items-center justify-center gap-3 shadow-inner">
                          <UploadCloud className="size-5 text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[150px]">
                            {fileData ? fileData.name : "Select File"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Plus className="size-4" /> Add Record
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Uploaded Documents List */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-10 md:p-12 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pt-10">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Uploaded Result Files
                      </h3>
                      <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">
                        List of all marksheets and results published
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-slate-50/50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-500 transition-all w-full"
                          placeholder="Search results..."
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Show
                        <select
                          className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none text-slate-900"
                          value={entriesPerPage}
                          onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 md:p-12 pt-0">
                    <div className="overflow-x-auto rounded-[2rem] border border-slate-100 mt-6">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800">
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-16">
                              Sr.No.
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white">
                              Upload Date
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white">
                              Exam Title
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white text-center">
                              Class Standard
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white">
                              File Name
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white">
                              Uploaded By
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {!mounted ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-8 py-24 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-xs italic"
                              >
                                Synchronizing...
                              </td>
                            </tr>
                          ) : paginatedData.length > 0 ? (
                            paginatedData.map((res, idx) => (
                              <tr
                                key={res.id}
                                className={`${idx % 2 === 0 ? "bg-white" : "bg-blue-50/10"} hover:bg-blue-50/20 transition-colors group`}
                              >
                                <td className="px-6 py-6 text-center">
                                  <span className="text-[10px] font-black text-slate-400">
                                    {(currentPage - 1) * entriesPerPage + idx + 1}
                                  </span>
                                </td>
                                <td className="px-8 py-6">
                                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                                    {res.dateStr || "N/A"}
                                  </span>
                                </td>
                                <td className="px-8 py-6">
                                  <span className="text-sm font-black text-slate-800">{res.examTitle}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {res.class}
                                  </span>
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-3 text-slate-600">
                                    <FileSpreadsheet className="size-4 text-emerald-600" />
                                    <span className="text-xs font-semibold max-w-[200px] truncate">{res.fileName}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <span className="text-xs font-bold text-slate-500">{res.uploadedBy}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={() => handleDownloadFile(res)}
                                      className="px-5 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                                    >
                                      <Download className="size-3.5" /> Download
                                    </button>
                                    <button
                                      onClick={() => handleDeleteResult(res.id)}
                                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-8 py-24 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs italic"
                              >
                                No result files found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Showing {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)} to{" "}
                          {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 transition-all uppercase tracking-widest"
                          >
                            Prev
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`size-8 rounded-xl text-[10px] font-black transition-all ${
                                  currentPage === p
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 transition-all uppercase tracking-widest"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
