import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import html2pdf from "html2pdf.js";
import {
  Calendar as CalendarIcon,
  User,
  Edit2,
  Save,
  Undo2,
  Download,
  Printer,
} from "lucide-react";
import { showToast as toast } from "@/lib/custom-toast";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";


export const Route = createFileRoute("/teacher/timetable/class")({
  validateSearch: (search: Record<string, unknown>) => ({
    class: (search.class as string) || "1st",
  }),
  component: ClassTimetablePage,
});

const CLASSES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

const CLASS_NAME_MAP: Record<string, { mr: string; en: string; hi: string }> = {
  "1st": { mr: "पहिली", en: "1st Standard", hi: "पहली" },
  "2nd": { mr: "दुसरी", en: "2nd Standard", hi: "दूसरी" },
  "3rd": { mr: "तिसरी", en: "3rd Standard", hi: "तीसरी" },
  "4th": { mr: "चौथी", en: "4th Standard", hi: "चौथी" },
  "5th": { mr: "पाचवी", en: "5th Standard", hi: "पांचवीं" },
  "6th": { mr: "सहावी", en: "6th Standard", hi: "छठी" },
  "7th": { mr: "सातवी", en: "7th Standard", hi: "सातवीं" },
  "8th": { mr: "आठवी", en: "8th Standard", hi: "आठवीं" },
  "9th": { mr: "नववी", en: "9th Standard", hi: "नौवीं" },
  "10th": { mr: "दहावी", en: "10th Standard", hi: "दसवीं" },
};

const DEFAULT_MON_THU = [
  { period: "सफाई", time: "10.30 ते 10.45", mon: "सफाई", tue: "सफाई", wed: "सफाई", thu: "सफाई" },
  { period: "परिपाठ", time: "10.45 ते 10.55", mon: "परिपाठ", tue: "परिपाठ", wed: "परिपाठ", thu: "परिपाठ" },
  { period: "१ ला तास", time: "10.55 ते 11.35", mon: "मराठी", tue: "इंग्रजी", wed: "मराठी", thu: "इंग्रजी" },
  { period: "२ रा तास", time: "11.35 ते 12.10", mon: "मराठी", tue: "इंग्रजी", wed: "मराठी", thu: "इंग्रजी" },
  { period: "लहान सुट्टी", time: "12.10 ते 12.20", mon: "लहान सुट्टी", tue: "लहान सुट्टी", wed: "लहान सुट्टी", thu: "लहान सुट्टी" },
  { period: "३ रा तास", time: "12.20 ते 12.55", mon: "गणित", tue: "हिंदी", wed: "गणित", thu: "हिंदी" },
  { period: "४ था तास", time: "12.55 ते 1.30", mon: "गणित", tue: "हिंदी", wed: "गणित", thu: "हिंदी" },
  { period: "मोठी सुट्टी", time: "1.30 ते 2.30", mon: "मोठी सुट्टी", tue: "मोठी सुट्टी", wed: "मोठी सुट्टी", thu: "मोठी सुट्टी" },
  { period: "५ वा तास", time: "2.30 ते 3.05", mon: "प.अभ्यास", tue: "प.अभ्यास", wed: "प.अभ्यास", thu: "प.अभ्यास" },
  { period: "६ वा तास", time: "3.05 ते 3.40", mon: "प.अभ्यास", tue: "प.अभ्यास", wed: "प.अभ्यास", thu: "प.अभ्यास" },
  { period: "लहान सुट्टी", time: "3.40 ते 3.50", mon: "लहान सुट्टी", tue: "लहान सुट्टी", wed: "लहान सुट्टी", thu: "लहान सुट्टी" },
  { period: "७ वा तास", time: "3.50 ते 4.25", mon: "इंग्रजी", tue: "गणित", wed: "कार्यानुभव", thu: "कार्यानुभव" },
  { period: "८ वा तास", time: "4.25 ते 5.00", mon: "कला", tue: "शा.शिक्षण", wed: "शा.शिक्षण", thu: "कार्यानुभव" }
];

const DEFAULT_FRI = [
  { period: "सफाई", time: "10.30 ते 10.45", fri: "सफाई" },
  { period: "परिपाठ", time: "10.45 ते 10.55", fri: "परिपाठ" },
  { period: "१ ला तास", time: "10.55 ते 11.35", fri: "मराठी" },
  { period: "२ रा तास", time: "11.35 ते 12.05", fri: "मराठी" },
  { period: "३ रा तास", time: "12.05 ते 12.35", fri: "इंग्रजी" },
  { period: "लहान सुट्टी", time: "12.35 ते 12.45", fri: "लहान सुट्टी" },
  { period: "४ था तास", time: "12.45 ते 1.15", fri: "गणित" },
  { period: "५ वा तास", time: "1.15 ते 1.45", fri: "गणित" },
  { period: "मोठी सुट्टी", time: "1.45 ते 2.45", fri: "मोठी सुट्टी" },
  { period: "६ वा तास", time: "2.45 ते 3.15", fri: "प.अभ्यास" },
  { period: "७ वा तास", time: "3.15 ते 3.45", fri: "प.अभ्यास" },
  { period: "लहान सुट्टी", time: "3.45 ते 3.55", fri: "लहान सुट्टी" },
  { period: "८ वा तास", time: "3.55 ते 4.25", fri: "इंग्रजी" },
  { period: "९ वा तास", time: "4.25 ते 5.00", fri: "कला" }
];

const DEFAULT_SAT = [
  { period: "सफाई", time: "9.00 ते 9.10", sat: "परिपाठ" },
  { period: "१ ला तास", time: "9.10 ते 9.40", sat: "शा.शिक्षण" },
  { period: "२ रा तास", time: "9.40 ते 10.05", sat: "गणित" },
  { period: "३ रा तास", time: "10.05 ते 10.30", sat: "कला" },
  { period: "४ था तास", time: "10.30 ते 10.55", sat: "हिंदी" },
  { period: "मोठी सुट्टी", time: "10.55 ते 11.15", sat: "मोठी सुट्टी" },
  { period: "५ वा तास", time: "11.15 ते 11.40", sat: "हिंदी" },
  { period: "६ वा तास", time: "11.40 ते 12.05", sat: "प.अभ्यास" },
  { period: "७ वा तास", time: "12.05 ते 12.30", sat: "प.अभ्यास" }
];

function ClassTimetablePage() {
  const { class: selectedClass } = Route.useSearch();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = DICTIONARY[lang];

  const [schoolName, setSchoolName] = useState("जिल्हा परिषद प्राथमिक शाळा");
  const [kendra, setKendra] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("सोलापूर");
  const [year, setYear] = useState("2025-26");
  const [classTeacher, setClassTeacher] = useState("");
  const [headmasterName, setHeadmasterName] = useState("ZP Headmaster");

  const [monThu, setMonThu] = useState<any[]>([]);
  const [fri, setFri] = useState<any[]>([]);
  const [sat, setSat] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"monThu" | "fri" | "sat">("monThu");

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const snapshotData = snapshot.data();
          setSchoolName(snapshotData.schoolName || "जिल्हा परिषद प्राथमिक शाळा");
          setKendra(snapshotData.kendra || "");
          setTaluka(snapshotData.taluka || "");
          setDistrict(snapshotData.district || "सोलापूर");
          setYear(snapshotData.year || "2025-26");
          setClassTeacher(snapshotData.classTeacher || "");
          setHeadmasterName(snapshotData.headmasterName || "ZP Headmaster");

          if (snapshotData.monThu) {
            setMonThu(snapshotData.monThu);
          } else if (snapshotData.monWed) {
            const migrated = snapshotData.monWed.map((row: any, idx: number) => {
              const thuFriRow = (snapshotData.thuFri && snapshotData.thuFri[idx]) || {};
              return {
                period: row.period || "",
                time: row.time || "",
                mon: row.mon || "",
                tue: row.tue || "",
                wed: row.wed || "",
                thu: thuFriRow.thu || ""
              };
            });
            setMonThu(migrated);
          } else {
            setMonThu(DEFAULT_MON_THU);
          }

          if (snapshotData.fri) {
            setFri(snapshotData.fri);
          } else if (snapshotData.thuFri) {
            const migrated = DEFAULT_FRI.map((defRow, idx) => {
              const matchedRow = snapshotData.thuFri.find((r: any) => r.period === defRow.period);
              return {
                period: defRow.period,
                time: defRow.time,
                fri: matchedRow ? matchedRow.fri : defRow.fri
              };
            });
            setFri(migrated);
          } else {
            setFri(DEFAULT_FRI);
          }

          if (snapshotData.sat) {
            setSat(snapshotData.sat);
          } else {
            setSat(DEFAULT_SAT);
          }
        } else {
          setSchoolName("जिल्हा परिषद प्राथमिक शाळा");
          setKendra("");
          setTaluka("");
          setDistrict("सोलापूर");
          setYear("2025-26");
          setClassTeacher("");
          setHeadmasterName("ZP Headmaster");
          setMonThu(DEFAULT_MON_THU);
          setFri(DEFAULT_FRI);
          setSat(DEFAULT_SAT);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error:", error);
        toast.error("Firestore values could not be loaded");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedClass]);

  // Auto-save changes to Firestore
  useEffect(() => {
    if (loading) return; // Don't save during initial fetch

    const timer = setTimeout(() => {
      handleSave(false);
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [
    selectedClass,
    schoolName,
    kendra,
    taluka,
    district,
    year,
    classTeacher,
    headmasterName,
    monThu,
    fri,
    sat,
    loading
  ]);

  const handleClassChange = (cls: string) => {
    navigate({
      to: "/teacher/timetable/class",
      search: { class: cls } as any,
    });
  };

  const handleCellChange = (
    tableType: "monThu" | "fri" | "sat",
    rowIndex: number,
    field: string,
    value: string
  ) => {
    if (tableType === "monThu") {
      const updated = [...monThu];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      setMonThu(updated);
    } else if (tableType === "fri") {
      const updated = [...fri];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      setFri(updated);
    } else if (tableType === "sat") {
      const updated = [...sat];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      setSat(updated);
    }
  };

  const handleSave = async (showToast = false) => {
    setSaving(true);
    try {
      const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
      await setDoc(docRef, {
        schoolName,
        kendra,
        taluka,
        district,
        year,
        classTeacher,
        headmasterName,
        monThu,
        fri,
        sat,
        updatedAt: new Date().toISOString(),
      });
      if (showToast) {
        toast.success(lang === "en" ? "Timetable saved successfully!" : "वेळापत्रक यशस्वीरीत्या जतन केले!");
      }
    } catch (error) {
      console.error("Firestore saving error:", error);
      if (showToast) {
        toast.error(lang === "en" ? "Failed to save timetable" : "वेळापत्रक जतन करण्यात अयशस्वी");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("timetable-print-content");
    if (!element) {
      toast.error("Failed to generate PDF: content element not found.");
      return;
    }
    
    setIsDownloading(true);
    let tempWrapper: HTMLDivElement | null = null;
    try {
      // First, save the current state to Firebase Firestore immediately so any unsaved input text is captured
      await handleSave(false);

      // Prepare html2pdf
      // @ts-ignore
      let html2pdfFn = html2pdf;
      // @ts-ignore
      if (html2pdfFn && html2pdfFn.default) { html2pdfFn = html2pdfFn.default; }
      if (typeof html2pdfFn !== 'function') {
        if (typeof window !== 'undefined' && typeof (window as any).html2pdf === 'function') {
          html2pdfFn = (window as any).html2pdf;
        }
      }
      if (typeof html2pdfFn !== 'function') { 
        throw new Error("html2pdf library is not loaded properly."); 
      }

      // Clone the element into a properly-sized landscape off-screen container so html2canvas
      // can measure and render it with correct landscape full dimensions (approx 1123px width for A4 landscape)
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Replace all input, textarea, and select elements in the clone with static text elements
      // to resolve overlapping/squashed text issues in html2canvas rendering.
      const originalInputs = Array.from(element.querySelectorAll('input, textarea, select'));
      const clonedInputs = Array.from(clone.querySelectorAll('input, textarea, select'));
      
      clonedInputs.forEach((clonedEl, idx) => {
        const originalEl = originalInputs[idx] as HTMLElement;
        if (!originalEl) return;
        
        const parent = clonedEl.parentNode;
        if (!parent) return;
        
        let replacement: HTMLElement;
        const val = (originalEl as any).value || '';
        
        if (clonedEl.tagName === 'TEXTAREA') {
          replacement = document.createElement('div');
          replacement.className = clonedEl.className;
          replacement.style.whiteSpace = 'pre-wrap';
          replacement.style.wordBreak = 'break-word';
          replacement.style.minHeight = '1.2em';
          replacement.style.border = 'none';
          replacement.style.outline = 'none';
          replacement.style.background = 'transparent';
          replacement.textContent = val;
        } else if (clonedEl.tagName === 'SELECT') {
          replacement = document.createElement('span');
          replacement.className = clonedEl.className;
          const selectEl = originalEl as HTMLSelectElement;
          const selectedText = selectEl.options[selectEl.selectedIndex]?.text || val;
          replacement.style.border = 'none';
          replacement.style.outline = 'none';
          replacement.style.background = 'transparent';
          replacement.textContent = selectedText;
        } else {
          replacement = document.createElement('span');
          replacement.className = clonedEl.className;
          replacement.style.display = 'inline-block';
          replacement.style.border = 'none';
          replacement.style.outline = 'none';
          replacement.style.background = 'transparent';
          replacement.textContent = val;
        }
        
        parent.replaceChild(replacement, clonedEl);
      });

      // Force all timetable tab content columns to be visible in the clone
      const clonedTabs = clone.querySelectorAll('.timetable-tab-content');
      clonedTabs.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove('hidden');
        htmlEl.classList.add('block');
        htmlEl.style.setProperty('display', 'block', 'important');
      });

      // Force the print row container to flex row layout in the clone
      const clonedContainer = clone.querySelector('.print-row-container') as HTMLElement;
      if (clonedContainer) {
        clonedContainer.style.setProperty('display', 'flex', 'important');
        clonedContainer.style.setProperty('flex-direction', 'row', 'important');
        clonedContainer.style.setProperty('flex-wrap', 'nowrap', 'important');
        clonedContainer.style.setProperty('gap', '12px', 'important');
      }

      tempWrapper = document.createElement('div');
      tempWrapper.setAttribute('data-pdf-temp', 'true');
      tempWrapper.style.position = 'fixed';
      tempWrapper.style.top = '-99999px';
      tempWrapper.style.left = '0px';
      tempWrapper.style.width = '1123px'; // A4 landscape width at 96 DPI
      tempWrapper.style.background = '#fffdf0'; // Timetable background color
      tempWrapper.style.zIndex = '-9999';
      tempWrapper.style.overflow = 'visible';
      tempWrapper.style.pointerEvents = 'none';
      tempWrapper.appendChild(clone);
      document.body.appendChild(tempWrapper);

      // Allow browser to fully lay out the cloned element before capturing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const opt = {
        margin: 5,
        filename: `Timetable_Class_${selectedClassNameEn.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: {
          scale: 2.0,
          useCORS: true,
          logging: false,
          width: 1123,
          windowWidth: 1123,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const, compress: true },
        pagebreak: { mode: ['css' as const, 'legacy' as const] },
      };

      await html2pdfFn().set(opt).from(clone).save();
      toast.success(lang === "en" ? 'PDF Downloaded Successfully!' : 'PDF यशस्वीरित्या डाउनलोड झाले!');
    } catch (err: any) {
      toast.error(`Failed to download PDF: ${err?.message || String(err)}`);
    } finally {
      if (tempWrapper && tempWrapper.parentNode) {
        tempWrapper.parentNode.removeChild(tempWrapper);
      }
      setIsDownloading(false);
    }
  };

  const isBreakRow = (period: string) => {
    const p = (period || "").trim();
    return ["सफाई", "परिपाठ", "लहान सुट्टी", "मोठी सुट्टी", "लहान", "मोठी", "सुट्टी", "वंदेमातरम्", "वंदे"].some(b => p.includes(b));
  };

  const summary = (() => {
    const counts: Record<string, number> = {
      "मराठी": 0,
      "गणित": 0,
      "इंग्रजी": 0,
      "हिंदी": 0,
      "प.अभ्यास": 0,
      "कला": 0,
      "कार्यानुभव": 0,
      "शा.शिक्षण": 0,
    };

    const countVal = (val: string) => {
      if (!val) return;
      const clean = val.trim();
      if (isBreak(clean)) return;

      if (clean.includes("मराठी")) counts["मराठी"]++;
      else if (clean.includes("गणित")) counts["गणित"]++;
      else if (clean.includes("इंग्रजी")) counts["इंग्रजी"]++;
      else if (clean.includes("हिंदी")) counts["हिंदी"]++;
      else if (clean.includes("प.अभ्यास") || clean.includes("परिसर") || clean.includes("विज्ञान")) counts["प.अभ्यास"]++;
      else if (clean.includes("कला")) counts["कला"]++;
      else if (clean.includes("कार्या")) counts["कार्यानुभव"]++;
      else if (clean.includes("शा.शि") || clean.includes("शारीरिक") || clean.includes("शिक्षण")) counts["शा.शिक्षण"]++;
    };

    const isBreak = (v: string) => {
      return ["सफाई", "परिपाठ", "सुट्टी", "वंदे", "नियोजन"].some(b => v.includes(b)) || v === "";
    };

    monThu.forEach((row) => {
      if (!isBreakRow(row.period)) {
        countVal(row.mon);
        countVal(row.tue);
        countVal(row.wed);
        countVal(row.thu);
      }
    });

    fri.forEach((row) => {
      if (!isBreakRow(row.period)) {
        countVal(row.fri);
      }
    });

    sat.forEach((row) => {
      if (!isBreakRow(row.period)) {
        countVal(row.sat);
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return { counts, total };
  })();

  const selectedClassNameMr = CLASS_NAME_MAP[selectedClass]?.mr || selectedClass;
  const selectedClassNameEn = CLASS_NAME_MAP[selectedClass]?.en || selectedClass;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col">
      <style>{`
        @media print {
          html, body, #root, main, .print-card {
            background-color: #fffdf0 !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            width: 100% !important;
          }
          header, aside, .no-print, button, select, label {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 4px !important;
            margin: 0 !important;
            background-color: #fffdf0 !important;
          }
          .print-row-container {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
            width: 100% !important;
            align-items: stretch !important;
            overflow: visible !important;
          }
          .print-row-container > div {
            min-width: 0 !important;
          }
          table {
            border-color: black !important;
          }
          td, th {
            border-color: black !important;
          }
          .print-card table th,
          .print-card table td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
            padding-left: 2px !important;
            padding-right: 2px !important;
            font-size: 10px !important;
            line-height: 1.15 !important;
            border: 1px solid black !important;
          }
          .print-card table input {
            font-size: 9px !important;
            padding: 0px !important;
            border: none !important;
            background: transparent !important;
          }
          @page {
            size: landscape;
            margin: 4mm;
          }
        }
      `}</style>

      <TeacherHeader />
      <div className="flex flex-1 mt-16 print:mt-0">
        <TeacherSidebar />
        <main className="flex-1 lg:pl-64 p-4 md:p-6 space-y-4">
          
          <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {lang === "en" ? "Grade:" : "इयत्ता:"}
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-white min-w-[120px]"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {lang === "en" ? `Class ${CLASS_NAME_MAP[cls]?.en || cls}` : `इयत्ता ${CLASS_NAME_MAP[cls]?.mr || cls}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-stretch sm:justify-end gap-3 mt-2 sm:mt-0">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="size-3.5" />
                {isDownloading 
                  ? (lang === "en" ? "Downloading..." : "डाउनलोड होत आहे...") 
                  : (lang === "en" ? "Download PDF" : "PDF डाउनलोड")}
              </button>
            </div>
          </header>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl h-96 flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm">
              <div className="size-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider animate-pulse">
                {lang === "en" ? "Loading timetable structure..." : "वेळापत्रक रचना लोड होत आहे..."}
              </p>
            </div>
          ) : (
            <div 
              id="timetable-print-content" 
              className="bg-[#fffdf0] border-2 border-black rounded-[1.5rem] p-3 md:p-5 shadow-md overflow-hidden space-y-4 print-card w-full max-w-full"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b-2 border-black pb-3 w-full">
                <div className="flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="size-16 print:size-14">
                    <circle cx="50" cy="50" r="46" fill="white" stroke="#047857" strokeWidth="2.5"/>
                    <circle cx="50" cy="50" r="41" fill="none" stroke="#047857" strokeWidth="0.8" strokeDasharray="3 1.5"/>
                    <circle cx="50" cy="50" r="37" fill="none" stroke="#047857" strokeWidth="1"/>
                    
                    <path id="curve-top-zp" d="M 16 50 A 34 34 0 0 1 84 50" fill="none" />
                    <path id="curve-bottom-zp" d="M 84 50 A 34 34 0 0 1 16 50" fill="none" />
                    
                    <text className="text-[7px] font-black fill-emerald-800" letterSpacing="0.3">
                      <textPath href="#curve-top-zp" startOffset="50%" textAnchor="middle">
                        जिल्हा परिषद सोलापूर
                      </textPath>
                    </text>
                    <text className="text-[6.5px] font-black fill-emerald-800" letterSpacing="0.2">
                      <textPath href="#curve-bottom-zp" startOffset="50%" textAnchor="middle">
                        * ज्ञान पवित्र व गुणवत्ता *
                      </textPath>
                    </text>
                    
                    <path d="M 36 62 C 36 57, 41 51, 50 51 C 59 51, 64 57, 64 62 Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                    <path d="M 50 51 Q 48 45, 50 35 Q 52 45, 50 51" fill="#f59e0b" />
                    <path d="M 28 66 L 72 66" stroke="#047857" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>

                <div className="w-full md:flex-1 text-center bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 border-2 border-black py-1.5 px-4 rounded shadow-sm text-slate-900 font-extrabold text-base md:text-[20px] tracking-wide">
                  वेळापत्रक &nbsp; ( इयत्ता :- {selectedClassNameMr} )
                </div>

                <div className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 border-2 border-black py-1.5 px-4 rounded shadow-sm text-slate-900 font-extrabold text-sm md:text-[16px] w-full md:w-44 text-center flex items-center justify-center gap-1">
                  <span>सन</span>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-transparent border-none outline-none text-center font-extrabold text-slate-900 w-24"
                  />
                </div>
              </div>

              <div className="border-2 border-black p-2 bg-[#fffdf0] flex flex-col lg:flex-row lg:items-center justify-between text-[11px] font-black text-slate-800 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full lg:w-auto">
                  <span>जिल्हा परिषद प्राथमिक शाळा :</span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="px-2 py-0.5 bg-transparent border-b border-dashed border-slate-400 text-[11px] text-slate-900 w-full sm:w-64 outline-none focus:border-blue-500 print:border-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-2 w-full lg:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap">केंद्र :-</span>
                    <input
                      type="text"
                      value={kendra}
                      onChange={(e) => setKendra(e.target.value)}
                      className="px-2 py-0.5 bg-transparent border-b border-dashed border-slate-400 text-[11px] text-slate-900 w-full sm:w-28 outline-none focus:border-blue-500 print:border-none"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap">तालुका :-</span>
                    <input
                      type="text"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      className="px-2 py-0.5 bg-transparent border-b border-dashed border-slate-400 text-[11px] text-slate-900 w-full sm:w-28 outline-none focus:border-blue-500 print:border-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                    <span className="whitespace-nowrap">जिल्हा :-</span>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="px-2 py-0.5 bg-transparent border-b border-dashed border-slate-400 text-[11px] text-slate-900 w-full sm:w-24 outline-none focus:border-blue-500 print:border-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile view Tab selector */}
              <div className="xl:hidden no-print bg-[#fefce8] p-1 rounded-xl flex gap-1 border-2 border-black max-w-md mx-auto my-2 w-full">
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("monThu")}
                  className={`flex-1 py-2 px-3 text-center text-xs font-black rounded-lg transition-all ${
                    activeMobileTab === "monThu"
                      ? "bg-cyan-400 text-slate-900 border border-black shadow-sm"
                      : "text-slate-600 hover:bg-[#fef9c3]"
                  }`}
                >
                  सोमवार - गुरुवार
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("fri")}
                  className={`flex-1 py-2 px-3 text-center text-xs font-black rounded-lg transition-all ${
                    activeMobileTab === "fri"
                      ? "bg-cyan-400 text-slate-900 border border-black shadow-sm"
                      : "text-slate-600 hover:bg-[#fef9c3]"
                  }`}
                >
                  शुक्रवार
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("sat")}
                  className={`flex-1 py-2 px-3 text-center text-xs font-black rounded-lg transition-all ${
                    activeMobileTab === "sat"
                      ? "bg-cyan-400 text-slate-900 border border-black shadow-sm"
                      : "text-slate-600 hover:bg-[#fef9c3]"
                  }`}
                >
                  शनिवार
                </button>
              </div>

              <div className="flex flex-col xl:flex-row gap-4 items-stretch overflow-x-auto pb-2 print-row-container">
                <div className={`w-full xl:w-auto xl:flex-[2] xl:min-w-[450px] print:flex-[2] overflow-x-auto timetable-tab-content ${activeMobileTab === "monThu" ? "block" : "hidden xl:block"}`}>
                  <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white">
                    <thead>
                      <tr className="border-b-2 border-black font-black">
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-12 text-slate-900 text-center font-black">तासिका</th>
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-24 text-slate-900 text-center font-black">वेळ</th>
                        <th className="py-2 px-1 border-r border-black bg-[#fef08a] text-slate-900 text-center font-black">सोमवार</th>
                        <th className="py-2 px-1 border-r border-black bg-[#fef08a] text-slate-900 text-center font-black">मंगळवार</th>
                        <th className="py-2 px-1 border-r border-black bg-[#fef08a] text-slate-900 text-center font-black">बुधवार</th>
                        <th className="py-2 px-1 bg-[#fef08a] text-slate-900 text-center font-black">गुरुवार</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monThu.map((row, idx) => {
                        const breakRow = isBreakRow(row.period);
                        if (breakRow) {
                          return (
                            <tr key={idx} className="bg-[#dcfce7] font-black text-emerald-950 border-b border-black">
                              <td className="py-2 px-1 border-r-2 border-black font-black bg-[#d9f99d]/60 text-slate-800">
                                <input
                                  type="text"
                                  value={row.period}
                                  onChange={(e) => handleCellChange("monThu", idx, "period", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none font-bold"
                                />
                              </td>
                              <td className="py-2 px-1 border-r-2 border-black font-semibold bg-[#d9f99d]/30 text-slate-700">
                                <input
                                  type="text"
                                  value={row.time}
                                  onChange={(e) => handleCellChange("monThu", idx, "time", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none"
                                />
                              </td>
                              <td colSpan={4} className="py-2 px-2 text-center text-[11px] font-black tracking-wide text-emerald-900">
                                <input
                                  type="text"
                                  value={row.mon}
                                  onChange={(e) => {
                                    handleCellChange("monThu", idx, "mon", e.target.value);
                                    handleCellChange("monThu", idx, "tue", e.target.value);
                                    handleCellChange("monThu", idx, "wed", e.target.value);
                                    handleCellChange("monThu", idx, "thu", e.target.value);
                                  }}
                                  className="w-full text-center bg-transparent border-none outline-none font-black text-emerald-950"
                                />
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50/20 border-b border-black text-slate-900 font-semibold text-[11px]">
                            <td className="py-1.5 px-1 border-r-2 border-black font-black bg-[#d9f99d]/20 text-slate-700">
                              <input
                                type="text"
                                value={row.period}
                                onChange={(e) => handleCellChange("monThu", idx, "period", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-1 border-r-2 border-black text-[10px] font-semibold text-slate-500 bg-[#d9f99d]/10">
                              <input
                                type="text"
                                value={row.time}
                                onChange={(e) => handleCellChange("monThu", idx, "time", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-[10px]"
                              />
                            </td>
                            <td className="py-1 px-1 border-r border-black">
                              <input
                                type="text"
                                value={row.mon}
                                onChange={(e) => handleCellChange("monThu", idx, "mon", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                            <td className="py-1 px-1 border-r border-black">
                              <input
                                type="text"
                                value={row.tue}
                                onChange={(e) => handleCellChange("monThu", idx, "tue", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                            <td className="py-1 px-1 border-r border-black">
                              <input
                                type="text"
                                value={row.wed}
                                onChange={(e) => handleCellChange("monThu", idx, "wed", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                            <td className="py-1 px-1">
                              <input
                                type="text"
                                value={row.thu}
                                onChange={(e) => handleCellChange("monThu", idx, "thu", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={`w-full xl:w-auto xl:flex-1 xl:min-w-[250px] print:flex-[1] overflow-x-auto timetable-tab-content ${activeMobileTab === "fri" ? "block" : "hidden xl:block"}`}>
                  <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white">
                    <thead>
                      <tr className="border-b-2 border-black font-black">
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-12 text-slate-900 text-center font-black">तासिका</th>
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-24 text-slate-900 text-center font-black">वेळ</th>
                        <th className="py-2 px-1 bg-[#fef08a] text-slate-900 text-center font-black">शुक्रवार</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fri.map((row, idx) => {
                        const breakRow = isBreakRow(row.period);
                        if (breakRow) {
                          return (
                            <tr key={idx} className="bg-[#dcfce7] font-black text-emerald-950 border-b border-black">
                              <td className="py-2 px-1 border-r-2 border-black font-black bg-[#d9f99d]/60 text-slate-800">
                                <input
                                  type="text"
                                  value={row.period}
                                  onChange={(e) => handleCellChange("fri", idx, "period", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none font-bold"
                                />
                              </td>
                              <td className="py-2 px-1 border-r-2 border-black font-semibold bg-[#d9f99d]/30 text-slate-700">
                                <input
                                  type="text"
                                  value={row.time}
                                  onChange={(e) => handleCellChange("fri", idx, "time", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 text-center text-[11px] font-black tracking-wide text-emerald-900">
                                <input
                                  type="text"
                                  value={row.fri}
                                  onChange={(e) => handleCellChange("fri", idx, "fri", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none font-black text-emerald-950"
                                />
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50/20 border-b border-black text-slate-900 font-semibold text-[11px]">
                            <td className="py-1.5 px-1 border-r-2 border-black font-black bg-[#d9f99d]/20 text-slate-700">
                              <input
                                type="text"
                                value={row.period}
                                onChange={(e) => handleCellChange("fri", idx, "period", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-1 border-r-2 border-black text-[10px] font-semibold text-slate-500 bg-[#d9f99d]/10">
                              <input
                                type="text"
                                value={row.time}
                                onChange={(e) => handleCellChange("fri", idx, "time", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-[10px]"
                              />
                            </td>
                            <td className="py-1 px-1">
                              <input
                                type="text"
                                value={row.fri}
                                onChange={(e) => handleCellChange("fri", idx, "fri", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={`w-full xl:w-auto xl:flex-1 xl:min-w-[250px] print:flex-[1] flex flex-col justify-between overflow-x-auto timetable-tab-content ${activeMobileTab === "sat" ? "block" : "hidden xl:block"}`}>
                  <table className="w-full text-xs text-center border-collapse border-2 border-black bg-white">
                    <thead>
                      <tr className="border-b-2 border-black font-black">
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-12 text-slate-900 text-center font-black">तासिका</th>
                        <th className="py-2 px-1 border-r-2 border-black bg-[#d9f99d] w-24 text-slate-900 text-center font-black">वेळ</th>
                        <th className="py-2 px-1 bg-[#fef08a] text-slate-900 text-center font-black">शनिवार</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sat.map((row, idx) => {
                        const breakRow = isBreakRow(row.period);
                        if (breakRow) {
                          return (
                            <tr key={idx} className="bg-[#dcfce7] font-black text-emerald-955 border-b border-black">
                              <td className="py-2 px-1 border-r-2 border-black font-black bg-[#d9f99d]/60 text-slate-800">
                                <input
                                  type="text"
                                  value={row.period}
                                  onChange={(e) => handleCellChange("sat", idx, "period", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none font-bold"
                                />
                              </td>
                              <td className="py-2 px-1 border-r-2 border-black font-semibold bg-[#d9f99d]/30 text-slate-700">
                                <input
                                  type="text"
                                  value={row.time}
                                  onChange={(e) => handleCellChange("sat", idx, "time", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 text-center text-[11px] font-black tracking-wide text-emerald-900">
                                <input
                                  type="text"
                                  value={row.sat}
                                  onChange={(e) => handleCellChange("sat", idx, "sat", e.target.value)}
                                  className="w-full text-center bg-transparent border-none outline-none font-black text-emerald-950"
                                />
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50/20 border-b border-black text-slate-900 font-semibold text-[11px]">
                            <td className="py-1.5 px-1 border-r-2 border-black font-black bg-[#d9f99d]/20 text-slate-700">
                              <input
                                type="text"
                                value={row.period}
                                onChange={(e) => handleCellChange("sat", idx, "period", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-1 border-r-2 border-black text-[10px] font-semibold text-slate-500 bg-[#d9f99d]/10">
                              <input
                                type="text"
                                value={row.time}
                                onChange={(e) => handleCellChange("sat", idx, "time", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-[10px]"
                              />
                            </td>
                            <td className="py-1 px-1">
                              <input
                                type="text"
                                value={row.sat}
                                onChange={(e) => handleCellChange("sat", idx, "sat", e.target.value)}
                                className="w-full text-center bg-transparent border-none outline-none text-slate-800 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-cyan-200/40 border-b border-black h-9">
                        <td colSpan={3} className="py-1.5"></td>
                      </tr>
                      <tr className="bg-[#ffedd5] border-b border-black text-center">
                        <td colSpan={3} className="py-5 px-3">
                          <input
                            type="text"
                            value={classTeacher}
                            onChange={(e) => setClassTeacher(e.target.value)}
                            placeholder="वर्गशिक्षक स्वाक्षरी"
                            className="w-full text-center bg-transparent border-none outline-none font-medium text-[10px] text-slate-700 italic placeholder-slate-400"
                          />
                          <p className="font-extrabold text-[12px] text-amber-950 mt-1">वर्गशिक्षक</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 mt-2">
                <div className="flex-1 overflow-x-auto">
                  <table className="border-2 border-black border-collapse text-xs font-black text-center w-full bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black text-slate-800 text-[10px]">
                        <th className="border-r border-black py-1.5 px-2 bg-blue-100 text-center whitespace-nowrap text-slate-900 font-extrabold">
                          <span>तासिका विभागणी ➔</span>
                        </th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">मराठी</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">गणित</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">इंग्रजी</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">हिंदी</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">प.अभ्यास</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">कला</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">कार्यानुभव</th>
                        <th className="border-r border-black py-1.5 px-1.5 font-extrabold">शा.शिक्षण</th>
                        <th className="py-1.5 px-2 bg-yellow-100 text-yellow-950 font-black">एकूण</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white text-[12px] font-black">
                        <td className="border-r border-black py-1 px-1 bg-slate-50/50 text-[10px] text-slate-500 font-bold">-</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["मराठी"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["गणित"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["इंग्रजी"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["हिंदी"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["प.अभ्यास"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["कला"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["कार्यानुभव"]}</td>
                        <td className="border-r border-black py-1 px-1 text-slate-900">{summary.counts["शा.शिक्षण"]}</td>
                        <td className="py-1 px-1 bg-yellow-100 text-yellow-950 font-black text-[13px]">{summary.total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="w-full md:w-60 border-2 border-black p-3 bg-white flex flex-col justify-between items-center text-center rounded">
                  <div className="h-4 flex items-center justify-center text-[10px] text-slate-400 font-medium italic w-full">
                    <input
                      type="text"
                      value={headmasterName}
                      onChange={(e) => setHeadmasterName(e.target.value)}
                      placeholder="शिक्षक नाव लिहा"
                      className="w-full text-center bg-transparent border-none outline-none text-[9.5px] italic text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <p className="border-t border-black pt-1 w-44 font-black text-xs text-slate-800">मुख्याध्यापक</p>
                </div>
              </div>


            </div>
          )}

        </main>
      </div>
    </div>
  );
}

