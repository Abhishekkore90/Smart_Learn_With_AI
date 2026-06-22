import { createFileRoute } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect } from "react";
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
  Sparkles,
  Trash2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import parsedDiaryData from "./parsed_diary.json";

const getMarathiDayName = (dateStr: string, fallbackDay: string) => {
  if (fallbackDay) return fallbackDay;
  if (!dateStr) return "सोमवार";
  try {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const dayIndex = date.getDay();
      const days = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
      return days[dayIndex] || "सोमवार";
    }
  } catch (e) {
    // ignore
  }
  return "सोमवार";
};

const getDynamicDinvishesh = (id: number, dateStr: string) => {
  const DINVISHESH_LIST = [
    "१६३३: गॅलेलिओ गॅलिली याने पोपच्या दबावाखाली पृथ्वी हाच सूर्यमालेचा केंद्रबिंदू आहे असे कबूल केले.",
    "१९२८: सर सी. व्ही. रमण यांनी रामन परिणाम (Raman Effect) या शोध निबंधाची घोषणा केली.",
    "१९४७: भारताला ब्रिटीश राजवटीपासून स्वातंत्र्य मिळाले.",
    "१८८८: महान गणितज्ञ श्रीनिवास रामानुजन यांचा जन्म.",
    "१९८४: राकेश शर्मा अंतरिक्ष प्रवास करणारे पहिले भारतीय अंतराळवीर बनले.",
    "१८४८: क्रांतीज्योती सावित्रीबाई फुले यांनी पुण्यात पहिली मुलींची शाळा सुरू केली.",
    "१९५०: भारत एक सार्वभौम लोकशाही प्रजासत्ताक देश बनला.",
    "२०००: भारताची लोकसंख्या १०० कोटींवर पोहोचली.",
  ];
  const index = id ? (id % DINVISHESH_LIST.length) : 0;
  return DINVISHESH_LIST[index];
};

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
    return parsedDiaryData.map(day => ({
      id: day.id,
      date: day.date || "",
      day: day.day || getMarathiDayName(day.date, ""),
      class: day.class || "पहिली",
      thought: "",
      dinvishesh: "",
      highlights: "",
      label: "टाचन बुक",
      highlightsTitle: "दिवसातील प्रमुख उपक्रम",
      signature1: "वर्गशिक्षक स्वाक्षरी",
      signature2: "मुख्याध्यापक स्वाक्षरी",
      periods: (day.periods || []).map((p: any) => ({
        period: p.period || "",
        class: p.class || day.class || "पहिली",
        subject: "",
        topic: "",
        outcome: "",
        experience: "",
        tools: "",
        materials: ""
      }))
    }));
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
    thought: "",
    highlights: "",
    dinvishesh: "",
    label: "टाचन बुक",
    highlightsTitle: "दिवसातील प्रमुख उपक्रम",
    signature1: "वर्गशिक्षक स्वाक्षरी",
    signature2: "मुख्याध्यापक स्वाक्षरी",
    periods: standardSubjects.map((sub, pIdx) => ({
      period: (pIdx + 1).toString(),
      class: className.replace("इयत्ता ", ""),
      subject: "",
      topic: "",
      outcome: "",
      experience: "",
      tools: "",
      materials: ""
    }))
  }));
};

/* ═══════════════ PAGE ═══════════════ */
function TeachingRecordPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editedData, setEditedData] = useState<any[]>([]);

  // Sync data on selectedClass change
  useEffect(() => {
    if (selectedClass) {
      setEditedData(getDiaryDataForClass(selectedClass));
    } else {
      setEditedData([]);
    }
  }, [selectedClass]);

  const files = selectedClass ? DIARY_FILES[selectedClass] || [] : [];
  
  // Filter day items
  const filteredDays = editedData.filter((day) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (day.thought?.toLowerCase().includes(query)) return true;
    if (day.date?.toLowerCase().includes(query)) return true;
    if (day.dinvishesh?.toLowerCase().includes(query)) return true;
    return day.periods.some((p: any) => 
      p.subject?.toLowerCase().includes(query) || 
      p.topic?.toLowerCase().includes(query) ||
      p.outcome?.toLowerCase().includes(query)
    );
  });

  const activeDay = filteredDays[currentDayIndex] || null;

  const handleFieldChange = (dayId: number, field: string, value: string) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        return { ...day, [field]: value };
      }
      return day;
    }));
  };

  const handlePeriodFieldChange = (dayId: number, periodIdx: number, field: string, value: string) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        const updatedPeriods = day.periods.map((p: any, idx: number) => {
          if (idx === periodIdx) {
            return { ...p, [field]: value };
          }
          return p;
        });
        return { ...day, periods: updatedPeriods };
      }
      return day;
    }));
  };

  const addPeriod = (dayId: number) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        const nextPeriodNum = (day.periods.length + 1).toString();
        return {
          ...day,
          periods: [
            ...day.periods,
            {
              period: nextPeriodNum,
              subject: "",
              topic: "",
              outcome: "",
              experience: "",
              tools: "",
              materials: ""
            }
          ]
        };
      }
      return day;
    }));
  };

  const deletePeriod = (dayId: number, periodIdx: number) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          periods: day.periods.filter((_: any, idx: number) => idx !== periodIdx)
        };
      }
      return day;
    }));
  };

  const addDay = () => {
    const nextId = editedData.length > 0 ? Math.max(...editedData.map(d => d.id)) + 1 : 1;
    const className = DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr.replace("इयत्ता ", "") || "";
    const standardSubjects = selectedClass === "2"
      ? ["मराठी", "गणित", "इंग्रजी"]
      : ["3", "4"].includes(selectedClass || "")
        ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
        : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];

    const newDay = {
      id: nextId,
      date: "",
      day: "",
      class: className,
      thought: "",
      dinvishesh: "",
      highlights: "",
      label: "टाचन बुक",
      highlightsTitle: "दिवसातील प्रमुख उपक्रम",
      signature1: "वर्गशिक्षक स्वाक्षरी",
      signature2: "मुख्याध्यापक स्वाक्षरी",
      periods: standardSubjects.map((sub, pIdx) => ({
        period: (pIdx + 1).toString(),
        class: className,
        subject: "",
        topic: "",
        outcome: "",
        experience: "",
        tools: "",
        materials: ""
      }))
    };

    setEditedData(prev => [...prev, newDay]);
    setCurrentDayIndex(editedData.length);
  };

  const deleteDay = (dayId: number) => {
    if (confirm("तुम्हाला खरोखर हा दिवस हटवायचा आहे का?")) {
      setEditedData(prev => prev.filter(d => d.id !== dayId));
      if (currentDayIndex >= editedData.length - 1) {
        setCurrentDayIndex(Math.max(0, editedData.length - 2));
      }
    }
  };

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

                {/* ── Select Class ── */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
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
                            setViewingFile(`Teaching Diary — ${cls.en} (${cls.mr})`);
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

                    {/* Add Day Button */}
                    <button
                      onClick={addDay}
                      className="h-10 px-4 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      <Plus className="size-4" /> Add Day
                    </button>

                    {/* Delete Day Button */}
                    {activeDay && (
                      <button
                        onClick={() => deleteDay(activeDay.id)}
                        className="h-10 px-4 bg-rose-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-4" /> Delete Day
                      </button>
                    )}

                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="h-10 px-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Printer className="size-4" /> Print / PDF
                    </button>
                  </div>
                </div>

                {/* Main Diary Sheet (Notebook style matching user format) */}
                {activeDay ? (
                  <div className="bg-white border-2 border-black rounded-[1.5rem] p-8 max-w-[1200px] mx-auto relative overflow-hidden print:border-2 print:border-black print:shadow-none print:bg-white print:p-8 print:rounded-[1.5rem] print:max-w-full font-sans">
                    
                    {/* Dynamic Title */}
                    <div className="text-center mb-4">
                      <input
                        type="text"
                        value={viewingFile || ""}
                        onChange={(e) => setViewingFile(e.target.value)}
                        className="w-full text-center text-3xl font-black tracking-tight text-black bg-transparent border-none outline-none focus:bg-slate-50/50 print:border-none"
                      />
                    </div>

                    <div className="space-y-6">
                      
                      {/* Top Date, day, and Center Label Row */}
                      <div className="flex items-center justify-between border-t-2 border-b-2 border-black py-4 px-6 mb-6">
                        <div className="text-[#3b82f6] text-[18px] font-black flex items-center gap-1.5">
                          <span>तारीख :</span>
                          <input
                            type="text"
                            value={activeDay.date || ""}
                            onChange={(e) => handleFieldChange(activeDay.id, "date", e.target.value)}
                            className="bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none w-36 px-1 text-[#3b82f6] font-black focus:bg-blue-50/30 print:border-none"
                          />
                        </div>
                        
                        <div className="bg-white text-black text-md font-black uppercase tracking-wider px-4 py-1.5 border-2 border-black flex items-center justify-center min-w-[140px]">
                          <input
                            type="text"
                            value={activeDay.label || "टाचन बुक"}
                            onChange={(e) => handleFieldChange(activeDay.id, "label", e.target.value)}
                            className="bg-transparent border-none outline-none text-center font-black text-black w-full text-md uppercase focus:bg-slate-50/50"
                          />
                        </div>
                        
                        <div className="text-[#3b82f6] text-[18px] font-black flex items-center gap-1.5">
                          <span>दिवस :</span>
                          <input
                            type="text"
                            value={activeDay.day || getMarathiDayName(activeDay.date, "")}
                            onChange={(e) => handleFieldChange(activeDay.id, "day", e.target.value)}
                            className="bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none w-32 px-1 text-[#3b82f6] font-black focus:bg-blue-50/30 print:border-none"
                          />
                        </div>
                      </div>

                      {/* Today's Thought & Dinvishesh Section */}
                      <div className="space-y-3 mb-6 px-4">
                        <div className="text-[#1A1A1A] text-[15px] font-black flex items-center gap-2 flex-wrap">
                          <span className="text-blue-900 font-extrabold flex-shrink-0">आजचा सुविचार : </span>
                          <input
                            type="text"
                            value={activeDay.thought || ""}
                            onChange={(e) => handleFieldChange(activeDay.id, "thought", e.target.value)}
                            className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none flex-1 min-w-[250px] font-bold text-[#0f172a] focus:bg-slate-50/30 print:border-none"
                          />
                        </div>
                        <div className="text-[#1A1A1A] text-[15px] font-black flex items-center gap-2 flex-wrap">
                          <span className="text-blue-900 font-extrabold flex-shrink-0">आजचा दिनविशेष : </span>
                          <input
                            type="text"
                            value={activeDay.dinvishesh || ""}
                            onChange={(e) => handleFieldChange(activeDay.id, "dinvishesh", e.target.value)}
                            className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none flex-1 min-w-[250px] font-bold text-[#0f172a] focus:bg-slate-50/30 print:border-none"
                          />
                        </div>
                      </div>

                      {/* Daily Lessons Table Grid */}
                      <div className="overflow-x-auto border-2 border-black rounded-2xl bg-white shadow-sm">
                        <table className="min-w-full border-collapse">
                          <thead className="bg-slate-50 text-blue-950">
                            <tr className="border-b-2 border-black">
                              <th className="px-3 py-3 text-center text-xs font-black border-r-2 border-black w-[60px]">तास</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[150px]">वर्ग / विषय</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[180px]">अध्याय समस्या / धडा उद्दीष्ट</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[180px]">अभ्यासाच्या अनुभवाचे स्वरूप</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[120px]">साधन तंत्र</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[120px]">आवश्यक साहित्य</th>
                              <th className="px-3 py-3 text-left text-xs font-black">परिणाम / निष्कर्ष</th>
                              <th className="px-1 py-3 text-center text-xs font-black print:hidden w-12 border-l-2 border-black">कृती</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {activeDay.periods.length > 0 ? (
                              activeDay.periods.map((period, pIdx) => (
                                <tr key={pIdx} className="border-b border-black last:border-b-0 hover:bg-slate-50 transition-all">
                                  <td className="px-2 py-2 text-center text-xs font-black border-r-2 border-black text-slate-800">
                                    <input
                                      type="text"
                                      value={period.period || ""}
                                      onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "period", e.target.value)}
                                      className="bg-transparent border-none outline-none w-full text-center text-xs font-black text-slate-800 focus:bg-slate-100/50"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-black border-r-2 border-black text-slate-900">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        value={period.class || activeDay.class || ""}
                                        onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "class", e.target.value)}
                                        className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none w-14 text-xs font-black text-slate-750 text-right print:border-none focus:bg-slate-50/50"
                                      />
                                      <span className="text-slate-400 text-xs font-bold">/</span>
                                      <input
                                        type="text"
                                        value={period.subject || ""}
                                        onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "subject", e.target.value)}
                                        className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none w-full min-w-[50px] text-xs font-black text-slate-900 print:border-none focus:bg-slate-50/50"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-bold border-r-2 border-black text-slate-850">
                                    <textarea
                                      value={period.topic || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "topic", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-800 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.experience || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "experience", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.tools || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "tools", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.materials || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "materials", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium text-slate-600 leading-relaxed border-r-2 border-black md:border-r-0">
                                    <textarea
                                      value={period.outcome || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "outcome", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center print:hidden border-l-2 border-black">
                                    <button
                                      onClick={() => deletePeriod(activeDay.id, pIdx)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                      title="तासिका काढून टाका"
                                    >
                                      <Trash2 className="size-4.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-5 py-12 text-center text-xs font-bold text-slate-400">
                                  या दिवसासाठी कोणतेही तासिका नियोजन उपलब्ध नाही.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Period Button */}
                      <div className="flex justify-start print:hidden">
                        <button
                          onClick={() => addPeriod(activeDay.id)}
                          className="px-6 py-3 bg-[#4B7BE5] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="size-4" /> Add Period / तासिका जोडा
                        </button>
                      </div>

                      {/* bottom Box - Days Activities */}
                      <div className="border-2 border-black rounded-3xl mt-6 overflow-hidden bg-white">
                        <div className="border-b-2 border-black py-3 text-center text-md font-black text-blue-900 bg-slate-50">
                          <input
                            type="text"
                            value={activeDay.highlightsTitle || "दिवसातील प्रमुख उपक्रम"}
                            onChange={(e) => handleFieldChange(activeDay.id, "highlightsTitle", e.target.value)}
                            className="bg-transparent border-none outline-none text-center font-black text-blue-900 w-full text-md focus:bg-slate-50/50"
                          />
                        </div>
                        <textarea
                          value={activeDay.highlights || ""}
                          onChange={(e) => {
                            handleFieldChange(activeDay.id, "highlights", e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = el.scrollHeight + "px";
                            }
                          }}
                          className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-700 p-6 leading-relaxed resize-none focus:bg-slate-50/50 overflow-hidden"
                          rows={3}
                          placeholder="शाळेत आज विविध अध्ययन पूरक उपक्रमांचे यशस्वी आयोजन करण्यात आले. सर्व विद्यार्थ्यांनी उत्साहाने सहभाग घेतला."
                        />
                      </div>

                      {/* Signatures Row */}
                      <div className="flex justify-between items-center mt-8 px-6 pt-6 print:mt-12">
                        <div className="text-center">
                          <div className="w-40 border-b border-black mb-2" />
                          <input
                            type="text"
                            value={activeDay.signature1 || "वर्गशिक्षक स्वाक्षरी"}
                            onChange={(e) => handleFieldChange(activeDay.id, "signature1", e.target.value)}
                            className="bg-transparent border-none outline-none text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-40 focus:bg-slate-50/50"
                          />
                        </div>
                        <div className="text-center">
                          <div className="w-40 border-b border-black mb-2" />
                          <input
                            type="text"
                            value={activeDay.signature2 || "मुख्याध्यापक स्वाक्षरी"}
                            onChange={(e) => handleFieldChange(activeDay.id, "signature2", e.target.value)}
                            className="bg-transparent border-none outline-none text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-40 focus:bg-slate-50/50"
                          />
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
