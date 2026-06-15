import { createFileRoute } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Edit3,
  Printer,
  X
} from "lucide-react";

export const Route = createFileRoute("/teacher/timetable/")({
  component: TimetablePage,
});

const CLASSES = [
  { value: "Class 1", label: "इयत्ता - पहिली (Class 1)" },
  { value: "Class 2", label: "इयत्ता - दुसरी (Class 2)" },
  { value: "Class 3", label: "इयत्ता - तिसरी (Class 3)" },
  { value: "Class 4", label: "इयत्ता - चौथी (Class 4)" },
  { value: "Class 5", label: "इयत्ता - पाचवी (Class 5)" },
  { value: "Class 6", label: "इयत्ता - सहावी (Class 6)" },
  { value: "Class 7", label: "इयत्ता - सातवी (Class 7)" },
];

const DIVISIONS = [
  { value: "A", label: "तुकडी अ (Div A)" },
  { value: "B", label: "तुकडी ब (Div B)" },
];

// Row definitions for Mon-Wed
const MON_WED_ROWS = [
  { period: "", time: "10:20-10:30" },
  { period: "", time: "10:30-10:40" },
  { period: "१", time: "10:40-11:20" },
  { period: "२", time: "11:20-11:55" },
  { period: "", time: "11:55-12:05" },
  { period: "३", time: "12:05-12:40" },
  { period: "४", time: "12:40-13:15" },
  { period: "", time: "13:15-13:55" },
  { period: "५", time: "13:55-14:30" },
  { period: "६", time: "14:30-15:05" },
  { period: "", time: "15:05-15:15" },
  { period: "७", time: "15:15-15:50" },
  { period: "८", time: "15:50-16:25" },
  { period: "", time: "16:25-16:30" },
];

// Row definitions for Thu-Fri
const THU_FRI_ROWS = [
  { period: "", time: "10:20-10:30" },
  { period: "", time: "10:30-10:40" },
  { period: "१", time: "10:40-11:20" },
  { period: "२", time: "11:20-11:50" },
  { period: "", time: "11:50-12:00" },
  { period: "३", time: "12:00-12:30" },
  { period: "४", time: "12:30-13:00" },
  { period: "५", time: "13:00-13:30" },
  { period: "", time: "13:30-14:10" },
  { period: "६", time: "14:10-14:45" },
  { period: "७", time: "14:45-15:15" },
  { period: "", time: "15:15-15:25" },
  { period: "८", time: "15:25-15:55" },
  { period: "९", time: "15:55-16:25" },
  { period: "", time: "16:25-16:30" },
];

// Row definitions for Saturday
const SAT_ROWS = [
  { period: "", time: "7:20-7:30" },
  { period: "", time: "7:30-7:40" },
  { period: "१", time: "7:40-8:10" },
  { period: "२", time: "8:10-8:40" },
  { period: "३", time: "8:40-9:10" },
  { period: "", time: "9:10-9:25" },
  { period: "४", time: "9:25-9:55" },
  { period: "५", time: "9:55-10:25" },
  { period: "६", time: "10:25-10:55" },
  { period: "", time: "10:55-11:00" },
];

// Default Marathi timetable data from the spreadsheet screenshot
const DEFAULT_MON_WED = [
  ["शालेय परिसर स्वच्छता", "शालेय परिसर स्वच्छता", "शालेय परिसर स्वच्छता"],
  ["परिपाठ", "परिपाठ", "परिपाठ"],
  ["मराठी", "मराठी", "मराठी"],
  ["मराठी", "मराठी", "मराठी"],
  ["लहान सुट्टी", "लहान सुट्टी", "लहान सुट्टी"],
  ["गणित", "गणित", "गणित"],
  ["गणित", "गणित", "गणित"],
  ["मोठी सुट्टी", "मोठी सुट्टी", "मोठी सुट्टी"],
  ["इंग्रजी", "इंग्रजी", "इंग्रजी"],
  ["कला", "कला", "मराठी"],
  ["लहान सुट्टी", "लहान सुट्टी", "लहान सुट्टी"],
  ["कार्या.", "कार्या.", "इंग्रजी"],
  ["शा.शि.", "शा.शि.", "शा.शि."],
  ["पुढील दिवसाचे नियोजन व राष्ट्रगीत", "पुढील दिवसाचे नियोजन व राष्ट्रगीत", "पुढील दिवसाचे नियोजन व राष्ट्रगीत"]
];

const DEFAULT_THU_FRI = [
  ["शालेय परिसर स्वच्छता", "शालेय परिसर स्वच्छता"],
  ["परिपाठ", "परिपाठ"],
  ["मराठी", "मराठी"],
  ["मराठी", "मराठी"],
  ["लहान सुट्टी", "लहान सुट्टी"],
  ["गणित", "गणित"],
  ["गणित", "गणित"],
  ["इंग्रजी", "इंग्रजी"],
  ["मोठी सुट्टी", "मोठी सुट्टी"],
  ["मराठी", "मराठी"],
  ["गणित", "मराठी"],
  ["लहान सुट्टी", "लहान सुट्टी"],
  ["कला", "कला"],
  ["कार्या.", "कार्या."],
  ["पुढील दिवसाचे नियोजन व राष्ट्रगीत", "पुढील दिवसाचे नियोजन व राष्ट्रगीत"]
];

const DEFAULT_SAT = [
  "शालेय परिसर स्वच्छता",
  "परिपाठ",
  "शा.शि.",
  "मराठी",
  "मराठी",
  "मोठी सुट्टी",
  "गणित",
  "गणित",
  "इंग्रजी",
  "वंदेमातरम्"
];

const STANDARD_SUBJECTS = ["मराठी", "गणित", "इंग्रजी", "कला", "कार्या.", "शा.शि."];

function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedDivision, setSelectedDivision] = useState("A");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [schoolName, setSchoolName] = useState("जिल्हा परिषद शाळा धोंडेवाडी (पेड)");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Split schedules state
  const [monWedSchedule, setMonWedSchedule] = useState<string[][]>(() => JSON.parse(JSON.stringify(DEFAULT_MON_WED)));
  const [thuFriSchedule, setThuFriSchedule] = useState<string[][]>(() => JSON.parse(JSON.stringify(DEFAULT_THU_FRI)));
  const [satSchedule, setSatSchedule] = useState<string[]>(() => [...DEFAULT_SAT]);

  // Editing cell tracker: { type: "monWed" | "thuFri" | "sat", rowIndex: number, colIndex?: number }
  const [editingCell, setEditingCell] = useState<{
    type: "monWed" | "thuFri" | "sat";
    rowIndex: number;
    colIndex?: number;
  } | null>(null);

  const [cellInputValue, setCellInputValue] = useState("");
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load timetable from database
  useEffect(() => {
    async function loadTimetable() {
      setLoading(true);
      try {
        const docRef = doc(db, "timetable_v2", `${selectedClass}_${selectedDivision}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.monWedSchedule) setMonWedSchedule(data.monWedSchedule);
          if (data.thuFriSchedule) setThuFriSchedule(data.thuFriSchedule);
          if (data.satSchedule) setSatSchedule(data.satSchedule);
          if (data.schoolName) setSchoolName(data.schoolName);
          if (data.academicYear) setAcademicYear(data.academicYear);
        } else {
          // If no doc, reset to defaults matching the class structure
          setMonWedSchedule(JSON.parse(JSON.stringify(DEFAULT_MON_WED)));
          setThuFriSchedule(JSON.parse(JSON.stringify(DEFAULT_THU_FRI)));
          setSatSchedule([...DEFAULT_SAT]);
        }
      } catch (err) {
        console.error("Error loading timetable:", err);
        toast.error("वेळापत्रक लोड करण्यात त्रुटी आली.");
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, [selectedClass, selectedDivision]);

  // Save changes to database
  const handleSaveTimetable = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "timetable_v2", `${selectedClass}_${selectedDivision}`);
      await setDoc(docRef, {
        class: selectedClass,
        division: selectedDivision,
        academicYear,
        schoolName,
        monWedSchedule,
        thuFriSchedule,
        satSchedule,
        updatedAt: new Date().toISOString()
      });
      toast.success("वेळापत्रक यशस्वीरित्या जतन केले!");
    } catch (err) {
      console.error("Error saving timetable:", err);
      toast.error("वेळापत्रक जतन करण्यात अडचण आली.");
    } finally {
      setSaving(false);
    }
  };

  // Click handler to start editing a cell
  const handleCellClick = (type: "monWed" | "thuFri" | "sat", rowIndex: number, colIndex?: number) => {
    setEditingCell({ type, rowIndex, colIndex });
    if (type === "monWed" && colIndex !== undefined) {
      setCellInputValue(monWedSchedule[rowIndex][colIndex] || "");
    } else if (type === "thuFri" && colIndex !== undefined) {
      setCellInputValue(thuFriSchedule[rowIndex][colIndex] || "");
    } else if (type === "sat") {
      setCellInputValue(satSchedule[rowIndex] || "");
    }
  };

  // Save edited cell value
  const handleSaveCell = (value: string) => {
    if (!editingCell) return;
    const val = value.trim();

    if (editingCell.type === "monWed" && editingCell.colIndex !== undefined) {
      setMonWedSchedule(prev => {
        const updated = prev.map((row, rIdx) => {
          if (rIdx === editingCell.rowIndex) {
            // If it's a merged non-period row, update all 3 columns
            if (MON_WED_ROWS[rIdx].period === "") {
              return [val, val, val];
            }
            const newRow = [...row];
            newRow[editingCell.colIndex!] = val;
            return newRow;
          }
          return row;
        });
        return updated;
      });
    } else if (editingCell.type === "thuFri" && editingCell.colIndex !== undefined) {
      setThuFriSchedule(prev => {
        const updated = prev.map((row, rIdx) => {
          if (rIdx === editingCell.rowIndex) {
            // If it's a merged non-period row, update both columns
            if (THU_FRI_ROWS[rIdx].period === "") {
              return [val, val];
            }
            const newRow = [...row];
            newRow[editingCell.colIndex!] = val;
            return newRow;
          }
          return row;
        });
        return updated;
      });
    } else if (editingCell.type === "sat") {
      setSatSchedule(prev => {
        const updated = [...prev];
        updated[editingCell.rowIndex] = val;
        return updated;
      });
    }
    setEditingCell(null);
  };

  // Calculate subject counts dynamically
  const calculateSubjectCount = (subName: string) => {
    let count = 0;

    // Scan Mon-Wed periods: P1, P2 (rows 2, 3), P3, P4 (rows 5, 6), P5, P6 (rows 8, 9), P7, P8 (rows 11, 12)
    const monWedPeriodRows = [2, 3, 5, 6, 8, 9, 11, 12];
    monWedPeriodRows.forEach(rowIndex => {
      const row = monWedSchedule[rowIndex] || [];
      row.forEach(cell => {
        if (cell && cell.trim() === subName) count++;
      });
    });

    // Scan Thu-Fri periods: P1, P2 (rows 2, 3), P3, P4, P5 (rows 5, 6, 7), P6, P7 (rows 9, 10), P8, P9 (rows 12, 13)
    const thuFriPeriodRows = [2, 3, 5, 6, 7, 9, 10, 12, 13];
    thuFriPeriodRows.forEach(rowIndex => {
      const row = thuFriSchedule[rowIndex] || [];
      row.forEach(cell => {
        if (cell && cell.trim() === subName) count++;
      });
    });

    // Scan Saturday periods: P1, P2, P3 (rows 2, 3, 4), P4, P5, P6 (rows 6, 7, 8)
    const satPeriodRows = [2, 3, 4, 6, 7, 8];
    satPeriodRows.forEach(rowIndex => {
      const cell = satSchedule[rowIndex];
      if (cell && cell.trim() === subName) count++;
    });

    return count;
  };

  // Summarize all subjects and calculate grand total
  const subjectSummaries = STANDARD_SUBJECTS.map(sub => ({
    name: sub,
    count: calculateSubjectCount(sub)
  }));
  const grandTotalPeriods = subjectSummaries.reduce((sum, s) => sum + s.count, 0);

  // Trigger print dialog for landscape timetable layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto print:p-0 print:m-0 print:max-w-none">
          
          <div className="w-full bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0 print:rounded-none">
            
            {/* Control Panel (Hide in Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 relative z-10 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-2.5 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">वेळापत्रक (Timetable Dashboard)</h1>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">ZP Maharashtra Timetable Layout</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>प्रिंट (Print Layout)</span>
                </button>
                <button
                  onClick={handleSaveTimetable}
                  disabled={saving || loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
                >
                  {saving ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  <span>वेळापत्रक जतन करा (Save)</span>
                </button>
              </div>
            </div>

            {/* Selectors Panel (Hide in Print) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-3xl mb-8 relative z-10 print:hidden">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-500" />
                  वर्ग निवडा (Select Class)
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 cursor-pointer shadow-sm"
                >
                  {CLASSES.map(cls => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-500" />
                  तुकडी निवडा (Select Division)
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 cursor-pointer shadow-sm"
                >
                  {DIVISIONS.map(div => (
                    <option key={div.value} value={div.value}>{div.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar size={12} className="text-blue-500" />
                  शैक्षणिक वर्ष (Academic Year)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-blue-500" />
                  शाळेचे नाव (School Name)
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                />
              </div>
            </div>

            {/* Timetable Print & Preview Layout */}
            <div ref={printAreaRef} className="w-full relative z-10 print-layout">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-blue-500 font-bold gap-3">
                  <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>वेळापत्रक लोड होत आहे...</span>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  
                  {/* Spreadsheet Header Title */}
                  <div className="text-center pb-2 border-b border-slate-300 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-sm md:text-base px-2">
                      <span>इयत्ता - {CLASSES.find(c => c.value === selectedClass)?.label.split(" (")[0] || selectedClass}</span>
                      <span className="text-xl md:text-2xl font-black tracking-widest text-slate-900">वेळापत्रक</span>
                      <span>सन - {academicYear}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      शाळा - {schoolName}
                    </div>
                  </div>

                  {/* Split Table Grid */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse border border-slate-800 text-slate-900 text-xs min-w-[1100px]">
                      <thead>
                        <tr className="bg-slate-100 text-center font-bold border-b border-slate-800">
                          {/* Mon-Wed Header */}
                          <th className="border border-slate-800 p-2 w-10">तासिका</th>
                          <th className="border border-slate-800 p-2 w-24">वेळ</th>
                          <th className="border border-slate-800 p-2 w-28">सोमवार</th>
                          <th className="border border-slate-800 p-2 w-28">मंगळवार</th>
                          <th className="border border-slate-800 p-2 w-28">बुधवार</th>
                          
                          {/* Thu-Fri Header */}
                          <th className="border border-slate-800 p-2 w-10">तासिका</th>
                          <th className="border border-slate-800 p-2 w-24">वेळ</th>
                          <th className="border border-slate-800 p-2 w-28">गुरुवार</th>
                          <th className="border border-slate-800 p-2 w-28">शुक्रवार</th>
                          
                          {/* Saturday Header */}
                          <th className="border border-slate-800 p-2 w-24">वेळ</th>
                          <th className="border border-slate-800 p-2 w-28">शनिवार</th>
                          
                          {/* Summary Header */}
                          <th className="border border-slate-800 p-2 w-36">विषय निहाय तासिका</th>
                          <th className="border border-slate-800 p-2 w-16">तासिका</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array(15).fill(null).map((_, idx) => {
                          const hasMonWed = idx < 14;
                          const hasThuFri = idx < 15;
                          const hasSat = idx < 10;
                          const hasSummary = idx < 8;

                          const monWedRow = MON_WED_ROWS[idx];
                          const thuFriRow = THU_FRI_ROWS[idx];
                          const satRow = SAT_ROWS[idx];

                          const isMonWedMerged = hasMonWed && monWedRow.period === "";
                          const isThuFriMerged = hasThuFri && thuFriRow.period === "";

                          return (
                            <tr key={idx} className="h-10 text-center hover:bg-slate-50/50 transition-colors">
                              
                              {/* 1. Mon-Wed block */}
                              {hasMonWed ? (
                                <>
                                  <td className="border border-slate-800 p-1 bg-slate-50/50 font-bold">{monWedRow.period}</td>
                                  <td className="border border-slate-800 p-1 text-[10px] font-semibold bg-slate-50/20">{monWedRow.time}</td>
                                  {isMonWedMerged ? (
                                    <td 
                                      colSpan={3} 
                                      onClick={() => handleCellClick("monWed", idx, 0)}
                                      className="border border-slate-800 p-1 font-semibold italic text-slate-500 text-center cursor-pointer hover:bg-blue-50/30"
                                    >
                                      {monWedSchedule[idx]?.[0]}
                                    </td>
                                  ) : (
                                    <>
                                      <td onClick={() => handleCellClick("monWed", idx, 0)} className="border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 min-w-[70px]">
                                        {monWedSchedule[idx]?.[0]}
                                      </td>
                                      <td onClick={() => handleCellClick("monWed", idx, 1)} className="border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 min-w-[70px]">
                                        {monWedSchedule[idx]?.[1]}
                                      </td>
                                      <td onClick={() => handleCellClick("monWed", idx, 2)} className="border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 min-w-[70px]">
                                        {monWedSchedule[idx]?.[2]}
                                      </td>
                                    </>
                                  )}
                                </>
                              ) : (
                                <td colSpan={5} className="border border-slate-800 bg-slate-100/50"></td>
                              )}

                              {/* 2. Thu-Fri block */}
                              {hasThuFri ? (
                                <>
                                  <td className="border border-slate-800 p-1 bg-slate-50/50 font-bold">{thuFriRow.period}</td>
                                  <td className="border border-slate-800 p-1 text-[10px] font-semibold bg-slate-50/20">{thuFriRow.time}</td>
                                  {isThuFriMerged ? (
                                    <td 
                                      colSpan={2} 
                                      onClick={() => handleCellClick("thuFri", idx, 0)}
                                      className="border border-slate-800 p-1 font-semibold italic text-slate-500 text-center cursor-pointer hover:bg-blue-50/30"
                                    >
                                      {thuFriSchedule[idx]?.[0]}
                                    </td>
                                  ) : (
                                    <>
                                      <td onClick={() => handleCellClick("thuFri", idx, 0)} className="border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 min-w-[70px]">
                                        {thuFriSchedule[idx]?.[0]}
                                      </td>
                                      <td onClick={() => handleCellClick("thuFri", idx, 1)} className="border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 min-w-[70px]">
                                        {thuFriSchedule[idx]?.[1]}
                                      </td>
                                    </>
                                  )}
                                </>
                              ) : (
                                <td colSpan={4} className="border border-slate-800 bg-slate-100/50"></td>
                              )}

                              {/* 3. Saturday block */}
                              {hasSat ? (
                                <>
                                  <td className="border border-slate-800 p-1 text-[10px] font-semibold bg-slate-50/20">{satRow.time}</td>
                                  <td 
                                    onClick={() => handleCellClick("sat", idx)} 
                                    className={`border border-slate-800 p-1 font-medium cursor-pointer hover:bg-blue-50/30 ${
                                      satRow.period === "" ? "font-semibold italic text-slate-500" : ""
                                    }`}
                                  >
                                    {satSchedule[idx]}
                                  </td>
                                </>
                              ) : (
                                <td colSpan={2} className="border border-slate-800 bg-slate-100/50"></td>
                              )}

                              {/* 4. Subject summary block */}
                              {hasSummary ? (
                                idx === 0 ? (
                                  <>
                                    <td className="border border-slate-800 p-1 bg-slate-100 font-bold">विषय निहाय तासिका</td>
                                    <td className="border border-slate-800 p-1 bg-slate-100 font-bold">तासिका</td>
                                  </>
                                ) : idx === 7 ? (
                                  <>
                                    <td className="border border-slate-800 p-1 bg-slate-50 font-bold text-center">एकूण</td>
                                    <td className="border border-slate-800 p-1 bg-slate-50 font-extrabold text-center text-blue-600">{grandTotalPeriods}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="border border-slate-800 p-1 font-semibold text-center">{subjectSummaries[idx - 1]?.name}</td>
                                    <td className="border border-slate-800 p-1 font-bold text-center bg-slate-50/50">{subjectSummaries[idx - 1]?.count}</td>
                                  </>
                                )
                              ) : (
                                <td colSpan={2} className="border border-slate-800 bg-slate-100/50"></td>
                              )}

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures Footer */}
                  <div className="flex items-center justify-between pt-8 px-4 font-bold text-slate-800 text-xs md:text-sm">
                    <div className="space-y-4">
                      <p>वर्गशिक्षक</p>
                      <p className="text-slate-400 font-medium font-mono">नाव - ___________________</p>
                    </div>
                    <div className="space-y-4 text-center">
                      <p>मुख्याध्यापक</p>
                      <p className="text-slate-300 font-medium select-none">सही / शिक्का</p>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Cell Editing Autocomplete Modal Overlay */}
            <AnimatePresence>
              {editingCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl text-slate-850 relative"
                  >
                    <button 
                      onClick={() => setEditingCell(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      <X size={18} />
                    </button>

                    <h3 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <Edit3 size={16} className="text-blue-500" />
                      विषय किंवा शेरा भरा (Edit Cell Content)
                    </h3>

                    <div className="space-y-4">
                      {/* Standard Subjects Quick Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Quick Subjects (विषय निवडा)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {STANDARD_SUBJECTS.map(sub => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => {
                                setCellInputValue(sub);
                                handleSaveCell(sub);
                              }}
                              className="px-2 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-700 hover:text-blue-600 rounded-lg transition-colors cursor-pointer text-center"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recesses/Other Quick Options */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Other (इतर पर्याय)</label>
                        <div className="flex flex-wrap gap-2">
                          {["लहान सुट्टी", "मोठी सुट्टी", "शालेय परिसर स्वच्छता", "परिपाठ", "राष्ट्रगीत", "वंदेमातरम्"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setCellInputValue(opt);
                                handleSaveCell(opt);
                              }}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600 rounded-md transition-colors cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Input field */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Or Type Custom (किंवा स्वतः टाईप करा)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cellInputValue}
                            onChange={(e) => setCellInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveCell(cellInputValue);
                            }}
                            placeholder="विषयाचे नाव लिहा..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCell(cellInputValue)}
                            className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Instruction Tip (Hide in Print) */}
            <div className="bg-slate-50 border border-slate-200/60 text-slate-500 p-4 rounded-3xl text-[11px] leading-relaxed mt-6 relative z-10 flex items-start gap-2.5 print:hidden">
              <BookOpen size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">वेळापत्रक वापरण्याची पद्धत (Guide):</span>
                १. वेळापत्रकातील कोणत्याही विषयावर किंवा वेळेच्या रकान्यावर बदल करण्यासाठी त्या रकान्यावर (Cell) थेट क्लिक करा.
                २. यामुळे उघडणाऱ्या पॉपअपमधून थेट विषय निवडा किंवा नवीन लिहून जतन करा.
                ३. उजवीकडील **'विषय निहाय तासिका' (Subject Summary)** कोष्टक तुमच्या विषयांच्या संख्येचे मोजमाप स्वयंचलित (Automatically) गणना करून दाखवते!
                ४. बदल पूर्ण झाल्यानंतर वर दिलेल्या **"वेळापत्रक जतन करा" (Save)** बटणावर क्लिक करा. प्रिंट काढण्यासाठी **"प्रिंट" (Print Layout)** बटण वापरा.
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Global CSS Styles for beautiful landscape printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-layout, .print-layout * {
            visibility: visible;
          }
          .print-layout {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid black !important;
            padding: 4px !important;
            font-size: 9px !important;
          }
        }
      `}</style>
    </div>
  );
}
