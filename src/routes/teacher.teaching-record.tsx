import { createFileRoute } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  ArrowLeft, 
  Search, 
  Quote, 
  Calendar,
  School,
  UserCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import parsedDiaryData from "./parsed_diary.json";

export const Route = createFileRoute("/teacher/teaching-record")({
  head: () => ({
    meta: [{ title: "Teaching Diary (टाचणवही) — Teacher Portal" }],
  }),
  component: TeachingRecordPage,
});

/* ─── Class & File Data ─── */
const DIARY_CLASSES = [
  { id: "1", en: "Class 1", mr: "इयत्ता पहिली" },
  { id: "2", en: "Class 2", mr: "इयत्ता दुसरी" },
  { id: "3", en: "Class 3", mr: "इयत्ता तिसरी" },
  { id: "4", en: "Class 4", mr: "इयत्ता चौथी" },
  { id: "5", en: "Class 5", mr: "इयत्ता पाचवी" },
  { id: "6", en: "Class 6", mr: "इयत्ता सहावी" },
  { id: "7", en: "Class 7", mr: "इयत्ता सातवी" },
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

/* ─── Generic Fallback Generator ─── */
const getDiaryDataForClass = (classId: string) => {
  if (classId === "1") {
    return parsedDiaryData;
  }
  const className = DIARY_CLASSES.find((c) => c.id === classId)?.mr || "";
  const standardSubjects = classId === "2"
    ? ["मराठी", "गणित", "इंग्रजी"]
    : ["3", "4"].includes(classId)
      ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
      : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    date: "",
    day: "",
    class: className.replace("इयत्ता ", ""),
    thought: i === 0 ? "ज्ञान हेच सामर्थ्य." : i === 1 ? "सतत प्रयत्न करणे हेच यशाचे रहस्य आहे." : "स्वच्छता हाच परमेश्वर.",
    periods: standardSubjects.map((sub, pIdx) => ({
      period: (pIdx + 1).toString(),
      subject: sub,
      topic: `घटक ${pIdx + 1}: सराव पाठ्यांश`,
      outcome: `अध्ययन निष्पत्ती - स्तर ${pIdx + 1}`,
      experience: "विविध उदाहरणे व स्वाध्याय सोडवणे.",
      tools: "स्वाध्याय / वर्गकार्य",
      materials: "पाठ्यपुस्तक, चित्र"
    })),
    highlights: ""
  }));
};

/* ═══════════════ PAGE ═══════════════ */
function TeachingRecordPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const files = selectedClass ? DIARY_FILES[selectedClass] || [] : [];
  
  // Resolve data source
  const diaryData = selectedClass ? getDiaryDataForClass(selectedClass) : [];

  // Filter day items
  const filteredDays = diaryData.filter((day) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (day.thought.toLowerCase().includes(query)) return true;
    if (day.date.toLowerCase().includes(query)) return true;
    return day.periods.some((p) => 
      p.subject.toLowerCase().includes(query) || 
      p.topic.toLowerCase().includes(query) ||
      p.outcome.toLowerCase().includes(query)
    );
  });

  const activeDay = filteredDays[currentDayIndex] || null;

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < filteredDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden">
        <TeacherHeader />
        <TeacherSidebar />
      </div>

      <main className="lg:pl-64 pt-16 min-h-screen print:pl-0 print:pt-0">
        <div className="p-4 sm:p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 print:p-0 print:max-w-full">
          
          <AnimatePresence mode="wait">
            {!viewingFile ? (
              <motion.div
                key="selection-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 print:hidden"
              >
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4B7BE5]/20 via-transparent to-purple-600/20" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4B7BE5]/20 backdrop-blur-xl rounded-full border border-[#4B7BE5]/30 text-[#4B7BE5] text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="size-4.5" /> Teaching Command Center
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                      Teaching Diary / <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#4B7BE5] italic">टाचणवही</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                      Select your class level to view, manage, and download the daily lesson planning schedules. Complete with standard subjects, learning goals, and activities.
                    </p>
                  </div>
                </div>

                {/* ── Step 1: Select Class ── */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">1</div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                      Select Class / वर्ग निवडा
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {DIARY_CLASSES.map((cls) => {
                      const isSelected = selectedClass === cls.id;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            setSelectedClass(cls.id);
                            setCurrentDayIndex(0);
                          }}
                          className={`py-5 px-4 rounded-[2rem] font-black text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer text-center ${
                            isSelected
                              ? "bg-[#4B7BE5] text-white border-[#4B7BE5] shadow-lg scale-105"
                              : "bg-slate-50 text-slate-600 border-slate-100 hover:border-[#4B7BE5] hover:text-[#4B7BE5] hover:shadow-sm"
                          }`}
                        >
                          <span className="block">{cls.en}</span>
                          <span className="block mt-1 text-[10px] opacity-80 normal-case tracking-normal">{cls.mr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 2: Teaching Diary Files ── */}
                {selectedClass && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-full bg-[#4B7BE5] text-white flex items-center justify-center font-black text-xs">2</div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                        Teaching Diary Files / टाचणवही फाइल्स
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-[#4B7BE5]/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                        >
                          <div className="space-y-4">
                            <div className="size-12 rounded-[1.2rem] bg-[#4B7BE5]/10 flex items-center justify-center text-[#4B7BE5]">
                              <BookOpen className="size-6" />
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 leading-snug">{file.title}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1">{file.subtitle}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                              type="button"
                              onClick={() => setViewingFile(file.title)}
                              className="py-3 px-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-wider text-[#3563C9] bg-white hover:bg-[#EEF2FF] hover:border-[#4B7BE5] transition-all cursor-pointer text-center"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="py-3 px-4 bg-[#4B7BE5] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              </motion.div>
            ) : (
              /* ── Interactive Lesson Diary Viewer Screen ── */
              <motion.div
                key="diary-viewer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Viewer Navigation / Controls Block */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-md print:hidden">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setViewingFile(null)}
                      className="size-11 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {viewingFile}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        {DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr}
                      </p>
                    </div>
                  </div>

                  {/* Day Navigation & Search */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="विषय / घटक शोधा..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentDayIndex(0);
                        }}
                        className="pl-11 pr-4 py-2.5 w-[200px] border border-slate-200 rounded-[2rem] text-xs font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#4B7BE5] transition-all"
                      />
                    </div>

                    {/* Date Selector Dropdown */}
                    {filteredDays.length > 0 && (
                      <select
                        value={currentDayIndex}
                        onChange={(e) => setCurrentDayIndex(Number(e.target.value))}
                        className="py-2.5 px-4 border border-slate-200 rounded-[2rem] text-xs font-bold bg-white focus:outline-none focus:border-[#4B7BE5]"
                      >
                        {filteredDays.map((day, idx) => (
                          <option key={day.id} value={idx}>
                            दिवस {day.id} {day.date ? `(${day.date})` : ""}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Day Browsing Buttons */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={handlePrevDay}
                        disabled={currentDayIndex === 0}
                        className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={handleNextDay}
                        disabled={currentDayIndex === filteredDays.length - 1}
                        className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </div>

                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="h-10 px-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Printer className="size-4" /> Print / PDF
                    </button>
                  </div>
                </div>

                {/* Main Diary Sheet (Notebook style) */}
                {activeDay ? (
                  <div className="bg-[#FAF9F6] border border-amber-800/10 shadow-2xl rounded-[3rem] p-8 sm:p-12 max-w-[1200px] mx-auto relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0 print:rounded-none print:max-w-full">
                    
                    {/* Printable Header Info (Only visible in Print) */}
                    <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8">
                      <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        दैनंदिन पाठ टाचणवही
                      </h1>
                      <p className="text-sm font-bold text-slate-500 mt-1">
                        इयत्ता: {activeDay.class} | शैक्षणिक वर्ष: 2025-26
                      </p>
                    </div>

                    {/* Spiral Ring Binder Aesthetic (Left side decoration) */}
                    <div className="absolute left-6 top-0 bottom-0 w-2 flex flex-col justify-around pointer-events-none print:hidden">
                      {Array.from({ length: 14 }).map((_, rIdx) => (
                        <div key={rIdx} className="size-5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />
                      ))}
                    </div>

                    <div className="pl-6 sm:pl-10 space-y-8 print:pl-0">
                      
                      {/* Top Metadata Header Block */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-black text-slate-700 bg-amber-500/5 border border-amber-800/10 rounded-[2rem] p-6 shadow-inner">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-amber-700" />
                          <span>दिनांक:</span>
                          <span className="text-slate-900 ml-1 underline decoration-dotted decoration-amber-500 underline-offset-4">
                            {activeDay.date || "    /    /2025"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-amber-700" />
                          <span>वार:</span>
                          <span className="text-slate-900 ml-1 underline decoration-dotted decoration-amber-500 underline-offset-4">
                            {activeDay.day || "________________"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="size-4 text-amber-700" />
                          <span>वर्गशिक्षक:</span>
                          <span className="text-slate-900 ml-1 underline decoration-dotted decoration-amber-500 underline-offset-4">
                            ________________
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <School className="size-4 text-amber-700" />
                          <span>शाळा:</span>
                          <span className="text-slate-900 ml-1 underline decoration-dotted decoration-amber-500 underline-offset-4">
                            ________________
                          </span>
                        </div>
                      </div>

                      {/* Today's Thought Board */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-[2.5rem] p-6 shadow-sm">
                        <Quote className="absolute right-6 top-4 size-20 text-amber-500/5 pointer-events-none" />
                        <div className="space-y-2 relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800 flex items-center gap-1.5">
                            <Sparkles className="size-3.5" /> आजचा सुविचार (Thought of the Day)
                          </p>
                          <h4 className="text-lg font-black text-amber-950 leading-relaxed italic">
                            "{activeDay.thought || "यश मिळवण्यासाठी सर्वात मोठी शक्ती - आत्मविश्वास."}"
                          </h4>
                        </div>
                      </div>

                      {/* Daily Lessons Table Grid */}
                      <div className="overflow-x-auto border border-amber-800/10 rounded-[2rem] bg-white shadow-md">
                        <table className="min-w-full divide-y divide-amber-800/10">
                          <thead className="bg-[#4B7BE5] text-white">
                            <tr>
                              <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wider border-r border-white/10 w-[70px]">तासिका</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider border-r border-white/10 w-[120px]">विषय</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider border-r border-white/10 w-[180px]">अध्ययन मुद्दा / पाठ्यघटक</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider border-r border-white/10">अध्ययन निष्पत्ती</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider border-r border-white/10">अध्ययन अनुभवाचे स्वरूप</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider border-r border-white/10 w-[110px]">साधन तंत्रे</th>
                              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider w-[110px]">शैक्षणिक साहित्य</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-800/10 bg-white">
                            {activeDay.periods.length > 0 ? (
                              activeDay.periods.map((period, pIdx) => (
                                <tr key={pIdx} className="hover:bg-slate-50 transition-all">
                                  <td className="px-5 py-4 text-center text-xs font-black border-r border-amber-800/5 text-slate-800">
                                    <span className="inline-flex size-6 bg-[#4B7BE5]/10 text-[#4B7BE5] items-center justify-center rounded-full font-black">
                                      {period.period}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-black border-r border-amber-800/5 text-slate-900">
                                    {period.subject}
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-bold border-r border-amber-800/5 text-slate-800 leading-relaxed">
                                    {period.topic || "—"}
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-medium border-r border-amber-800/5 text-slate-600 leading-relaxed">
                                    {period.outcome || "—"}
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-medium border-r border-amber-800/5 text-slate-600 leading-relaxed">
                                    {period.experience || "—"}
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-medium border-r border-amber-800/5 text-slate-600">
                                    {period.tools || "—"}
                                  </td>
                                  <td className="px-5 py-4 text-left text-xs font-medium text-slate-600">
                                    {period.materials || "—"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-xs font-bold text-slate-400">
                                  या दिवसासाठी कोणतेही तासिका नियोजन उपलब्ध नाही.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Section (Highlights & Signatures) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        {/* Special Highlights block */}
                        <div className="md:col-span-2 bg-white border border-amber-800/10 rounded-[2rem] p-6 shadow-sm space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#4B7BE5]">
                            दिवसभरातील वैशिष्ट्यपूर्ण बाबी (Special Highlights)
                          </p>
                          <p className="text-xs font-medium text-slate-600 min-h-[4rem] leading-relaxed">
                            {activeDay.highlights || "शाळेत आज विविध अध्ययन पूरक उपक्रमांचे यशस्वी आयोजन करण्यात आले. सर्व विद्यार्थ्यांनी उत्साहाने सहभाग घेतला."}
                          </p>
                        </div>

                        {/* Signatures fields */}
                        <div className="bg-slate-100/50 border border-slate-200 rounded-[2rem] p-6 flex flex-col justify-between min-h-[120px]">
                          <div className="grid grid-cols-2 gap-4 text-center h-full items-end">
                            <div>
                              <div className="h-[2px] bg-slate-300 w-full mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">वर्गशिक्षक स्वाक्षरी</span>
                            </div>
                            <div>
                              <div className="h-[2px] bg-slate-300 w-full mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">मुख्याध्यापक स्वाक्षरी</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-md">
                    <p className="text-sm font-bold text-slate-400">तुमच्या शोध संज्ञेनुसार एकही नोंद सापडली नाही.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
