import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { T as TeacherHeader, a as TeacherSidebar } from "./TeacherHeader-B0j7ec0U.js";
import { useState, useEffect } from "react";
import { g as Route, b as useLanguage, d as db } from "./router-BCVN4cfk.js";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Calendar, Save, Undo2, Edit2, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import "framer-motion";
import "./translations-RzKVqU65.js";
import "@tanstack/react-query";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
const CLASSES = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const CLASS_NAME_MAP = {
  "1st": {
    mr: "पहिली",
    en: "1st Standard",
    hi: "पहली"
  },
  "2nd": {
    mr: "दुसरी",
    en: "2nd Standard",
    hi: "दूसरी"
  },
  "3rd": {
    mr: "तिसरी",
    en: "3rd Standard",
    hi: "तीसरी"
  },
  "4th": {
    mr: "चौथी",
    en: "4th Standard",
    hi: "चौथी"
  },
  "5th": {
    mr: "पाचवी",
    en: "5th Standard",
    hi: "पांचवीं"
  },
  "6th": {
    mr: "सहावी",
    en: "6th Standard",
    hi: "छठी"
  },
  "7th": {
    mr: "सातवी",
    en: "7th Standard",
    hi: "सातवीं"
  },
  "8th": {
    mr: "आठवी",
    en: "8th Standard",
    hi: "आठवीं"
  },
  "9th": {
    mr: "नववी",
    en: "9th Standard",
    hi: "नौवीं"
  },
  "10th": {
    mr: "दहावी",
    en: "10th Standard",
    hi: "दसवीं"
  }
};
const DEFAULT_MON_WED = [{
  period: "",
  time: "१०:२०-१०:३०",
  mon: "शालेय परिसर स्वच्छता",
  tue: "शालेय परिसर स्वच्छता",
  wed: "शालेय परिसर स्वच्छता"
}, {
  period: "",
  time: "१०:३०-१०:४०",
  mon: "परिपाठ",
  tue: "परिपाठ",
  wed: "परिपाठ"
}, {
  period: "१",
  time: "१०:४०-११:२०",
  mon: "मराठी",
  tue: "मराठी",
  wed: "मराठी"
}, {
  period: "२",
  time: "११:२०-११:५५",
  mon: "मराठी",
  tue: "मराठी",
  wed: "मराठी"
}, {
  period: "",
  time: "११:५५-१२:०५",
  mon: "लहान सुट्टी",
  tue: "लहान सुट्टी",
  wed: "लहान सुट्टी"
}, {
  period: "३",
  time: "१२:०५-१२:४०",
  mon: "गणित",
  tue: "गणित",
  wed: "गणित"
}, {
  period: "४",
  time: "१२:४०-१३:१५",
  mon: "गणित",
  tue: "गणित",
  wed: "गणित"
}, {
  period: "",
  time: "१३:१५-१३:५५",
  mon: "मोठी सुट्टी",
  tue: "मोठी सुट्टी",
  wed: "मोठी सुट्टी"
}, {
  period: "५",
  time: "१३:५५-१४:३०",
  mon: "इंग्रजी",
  tue: "इंग्रजी",
  wed: "इंग्रजी"
}, {
  period: "६",
  time: "१४:३०-१५:०५",
  mon: "कला",
  tue: "कला",
  wed: "मराठी"
}, {
  period: "",
  time: "१५:०५-१५:१५",
  mon: "लहान सुट्टी",
  tue: "लहान सुट्टी",
  wed: "लहान सुट्टी"
}, {
  period: "७",
  time: "१५:१५-१५:५०",
  mon: "कार्या.",
  tue: "कार्या.",
  wed: "इंग्रजी"
}, {
  period: "८",
  time: "१५:५०-१६:२५",
  mon: "शा.शि.",
  tue: "शा.शि.",
  wed: "शा.शि."
}, {
  period: "",
  time: "१६:२५-१६:३०",
  mon: "पुढील दिवसाचे नियोजन व वंदे मातरम",
  tue: "पुढील दिवसाचे नियोजन व वंदे मातरम",
  wed: "पुढील दिवसाचे नियोजन व वंदे मातरम"
}];
const DEFAULT_THU_FRI = [{
  period: "",
  time: "१०:२०-१०:३०",
  thu: "शालेय परिसर स्वच्छता",
  fri: "शालेय परिसर स्वच्छता"
}, {
  period: "",
  time: "१०:३०-१०:४०",
  thu: "परिपाठ",
  fri: "परिपाठ"
}, {
  period: "१",
  time: "१०:४०-११:२०",
  thu: "मराठी",
  fri: "मराठी"
}, {
  period: "२",
  time: "११:२०-११:५०",
  thu: "मराठी",
  fri: "मराठी"
}, {
  period: "",
  time: "११:५०-१२:००",
  thu: "लहान सुट्टी",
  fri: "लहान सुट्टी"
}, {
  period: "३",
  time: "१२:००-१२:३०",
  thu: "गणित",
  fri: "गणित"
}, {
  period: "४",
  time: "१२:३०-१३:००",
  thu: "गणित",
  fri: "गणित"
}, {
  period: "५",
  time: "१३:००-१३:३०",
  thu: "इंग्रजी",
  fri: "इंग्रजी"
}, {
  period: "",
  time: "१३:३०-१४:१०",
  thu: "मोठी सुट्टी",
  fri: "मोठी सुट्टी"
}, {
  period: "६",
  time: "१४:१०-१४:४५",
  thu: "मराठी",
  fri: "मराठी"
}, {
  period: "७",
  time: "१४:४५-१५:१५",
  thu: "गणित",
  fri: "मराठी"
}, {
  period: "",
  time: "१५:१५-१५:२५",
  thu: "लहान सुट्टी",
  fri: "लहान सुट्टी"
}, {
  period: "८",
  time: "१५:२५-१५:५५",
  thu: "कला",
  fri: "कला"
}, {
  period: "९",
  time: "१५:५५-१६:२५",
  thu: "कार्या.",
  fri: "कार्या."
}, {
  period: "",
  time: "१६:२५-१६:३०",
  thu: "पुढील दिवसाचे नियोजन व वंदे मातरम",
  fri: "पुढील दिवसाचे नियोजन व वंदे मातरम"
}];
const DEFAULT_SAT = [{
  time: "७:२०-७:३०",
  sat: "शा. प. स्वच्छता"
}, {
  time: "७:३०-७:४०",
  sat: "परिपाठ"
}, {
  time: "७:४०-८:१०",
  sat: "शा.शि."
}, {
  time: "८:१०-८:४०",
  sat: "मराठी"
}, {
  time: "८:४०-९:१०",
  sat: "मराठी"
}, {
  time: "९:१०-९:२५",
  sat: "मोठी सुट्टी"
}, {
  time: "९:२५-९:५५",
  sat: "गणित"
}, {
  time: "९:५५-१०:२५",
  sat: "गणित"
}, {
  time: "१०:२५-१०:५५",
  sat: "इंग्रजी"
}, {
  time: "१०:५५-११:००",
  sat: "वंदेमातरम्"
}];
function ClassTimetablePage() {
  const {
    class: selectedClass
  } = Route.useSearch();
  const navigate = useNavigate();
  const {
    lang
  } = useLanguage();
  const [schoolName, setSchoolName] = useState("शाळा - Z.P. School");
  const [year, setYear] = useState("२०२५-२०२६");
  const [classTeacher, setClassTeacher] = useState("");
  const [monWed, setMonWed] = useState([]);
  const [thuFri, setThuFri] = useState([]);
  const [sat, setSat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const snapshotData = snapshot.data();
        setSchoolName(snapshotData.schoolName || "");
        setYear(snapshotData.year || "२०२५-२०२६");
        setClassTeacher(snapshotData.classTeacher || "");
        setMonWed(snapshotData.monWed || DEFAULT_MON_WED);
        setThuFri(snapshotData.thuFri || DEFAULT_THU_FRI);
        setSat(snapshotData.sat || DEFAULT_SAT);
      } else {
        setSchoolName("शाळा - ");
        setYear("२०२५-२०२६");
        setClassTeacher("");
        setMonWed(DEFAULT_MON_WED);
        setThuFri(DEFAULT_THU_FRI);
        setSat(DEFAULT_SAT);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      toast.error("Firestore values could not be loaded");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedClass]);
  const handleClassChange = (cls) => {
    setEditMode(false);
    navigate({
      to: "/teacher/timetable/class",
      search: {
        class: cls
      }
    });
  };
  const handleCellChange = (tableType, rowIndex, field, value) => {
    if (tableType === "monWed") {
      const updated = [...monWed];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value
      };
      setMonWed(updated);
    } else if (tableType === "thuFri") {
      const updated = [...thuFri];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value
      };
      setThuFri(updated);
    } else if (tableType === "sat") {
      const updated = [...sat];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value
      };
      setSat(updated);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
      await setDoc(docRef, {
        schoolName,
        year,
        classTeacher,
        monWed,
        thuFri,
        sat,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      toast.success(lang === "en" ? "Timetable saved successfully!" : "वेळापत्रक यशस्वीरीत्या जतन केले!");
      setEditMode(false);
    } catch (error) {
      console.error("Firestore saving error:", error);
      toast.error(lang === "en" ? "Failed to save timetable" : "वेळापत्रक जतन करण्यात अयशस्वी");
    } finally {
      setSaving(false);
    }
  };
  const handleDownloadPDF = async () => {
    const element = document.getElementById("timetable-print-content");
    if (!element) return;
    setIsDownloading(true);
    try {
      let html2pdfFn = html2pdf;
      if (html2pdfFn && html2pdfFn.default) {
        html2pdfFn = html2pdfFn.default;
      }
      if (typeof html2pdfFn !== "function") {
        if (typeof window !== "undefined" && typeof window.html2pdf === "function") {
          html2pdfFn = window.html2pdf;
        }
      }
      if (typeof html2pdfFn !== "function") {
        throw new Error("html2pdf library is not loaded properly.");
      }
      const opt = {
        margin: 5,
        filename: `Timetable_${selectedClass}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape"
        }
      };
      await html2pdfFn().set(opt).from(element).save();
    } catch (err) {
      console.error("Failed to download PDF", err);
      const errMsg = err?.message || String(err);
      toast.error(lang === "en" ? `Failed to download PDF: ${errMsg}` : `PDF डाउनलोड करण्यात अयशस्वी: ${errMsg}`);
    } finally {
      setIsDownloading(false);
    }
  };
  const summary = (() => {
    const counts = {
      "मराठी": 0,
      "गणित": 0,
      "इंग्रजी": 0,
      "कला": 0,
      "कार्या.": 0,
      "शा.शि.": 0
    };
    const countVal = (val) => {
      if (!val) return;
      const clean = val.trim();
      if (clean.includes("मराठी")) counts["मराठी"]++;
      else if (clean.includes("गणित")) counts["गणित"]++;
      else if (clean.includes("इंग्रजी")) counts["इंग्रजी"]++;
      else if (clean.includes("कला")) counts["कला"]++;
      else if (clean.includes("कार्या")) counts["कार्या."]++;
      else if (clean.includes("शा.शि")) counts["शा.शि."]++;
    };
    monWed.forEach((row) => {
      const isPeriod = row.period && row.period.trim() !== "";
      if (isPeriod) {
        countVal(row.mon);
        countVal(row.tue);
        countVal(row.wed);
      }
    });
    thuFri.forEach((row) => {
      const isPeriod = row.period && row.period.trim() !== "";
      if (isPeriod) {
        countVal(row.thu);
        countVal(row.fri);
      }
    });
    sat.forEach((row, idx) => {
      if (idx !== 0 && idx !== 1 && idx !== 5 && idx !== 9) {
        countVal(row.sat);
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      counts,
      total
    };
  })();
  const selectedClassNameMr = CLASS_NAME_MAP[selectedClass]?.mr || selectedClass;
  const selectedClassNameEn = CLASS_NAME_MAP[selectedClass]?.en || selectedClass;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50/50 font-sans flex flex-col", children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media print {
          /* Reset page, body, and all wrappers to natural flow to prevent truncation */
          html, body, #root, main, .print-card {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            width: 100% !important;
          }
          /* Hide non-print navigation, sidebars, headers, and editor buttons */
          header, aside, .no-print, button, select, label {
            display: none !important;
          }
          /* Remove layout paddings */
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-row-container {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 10px !important;
            width: 100% !important;
            align-items: start !important;
            overflow: visible !important;
          }
          .print-row-container > div {
            min-width: 0 !important;
            flex: 1 1 0 !important;
          }
          table {
            border-color: #475569 !important;
          }
          /* Keep the footer grouped and prevent page break splits inside it */
          .print-card > div:last-child {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: landscape;
            margin: 5mm;
          }
          
          /* Compact table layouts when printing */
          .print-card {
            padding: 8px !important;
          }
          .print-card .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 10px !important;
          }
          .print-card .border.bg-slate-50\\/50 {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 6px 12px !important;
          }
          .print-card table th,
          .print-card table td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
            padding-left: 1px !important;
            padding-right: 1px !important;
            font-size: 10px !important;
            line-height: 1.15 !important;
          }
          .print-card table input {
            font-size: 9px !important;
            padding: 1px !important;
          }
          .print-card .space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 4px !important;
          }
        }
        
        /* Styles that apply when generating PDF via html2pdf (using class .pdf-layout) */
        .pdf-layout {
          width: 1120px !important;
          max-width: 1120px !important;
          padding: 12px !important;
          background-color: white !important;
          color: black !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .pdf-layout .print-row-container {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          gap: 12px !important;
          width: 100% !important;
          align-items: start !important;
        }
        
        .pdf-layout .print-row-container > div {
          min-width: 0 !important;
          flex: 1 1 0 !important;
        }
        
        .pdf-layout .border.bg-slate-50\\/50 {
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 8px 12px !important;
        }
        
        .pdf-layout table th,
        .pdf-layout table td {
          padding-top: 3px !important;
          padding-bottom: 3px !important;
          padding-left: 2px !important;
          padding-right: 2px !important;
          font-size: 10px !important;
          line-height: 1.15 !important;
        }
        
        .pdf-layout table input {
          font-size: 9px !important;
          padding: 1px !important;
        }
        
        /* Reduce space utility class spacing */
        .pdf-layout.space-y-6 > :not([hidden]) ~ :not([hidden]),
        .pdf-layout .space-y-6 > :not([hidden]) ~ :not([hidden]) {
          margin-top: 10px !important;
        }
        
        .pdf-layout .space-y-4 > :not([hidden]) ~ :not([hidden]) {
          margin-top: 4px !important;
        }
      ` }),
    /* @__PURE__ */ jsx(TeacherHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 mt-16 print:mt-0", children: [
      /* @__PURE__ */ jsx(TeacherSidebar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 lg:pl-64 p-4 md:p-8 space-y-6", children: [
        /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md", children: /* @__PURE__ */ jsx(Calendar, { className: "size-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-slate-800 tracking-tight", children: lang === "en" ? "Spreadsheet Timetable Manager" : "परस्परसंवादी वेळापत्रक व्यवस्थापक" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400", children: lang === "en" ? `Timetable for Class ${selectedClassNameEn}` : `इयत्ता ${selectedClassNameMr} वेळापत्रक` })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: lang === "en" ? "Grade:" : "इयत्ता:" }),
              /* @__PURE__ */ jsx("select", { value: selectedClass, onChange: (e) => handleClassChange(e.target.value), className: "px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-white", children: CLASSES.map((cls) => /* @__PURE__ */ jsx("option", { value: cls, children: lang === "en" ? `Class ${CLASS_NAME_MAP[cls]?.en || cls}` : `इयत्ता ${CLASS_NAME_MAP[cls]?.mr || cls}` }, cls)) })
            ] }),
            editMode ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: handleSave, disabled: saving, className: "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50", children: [
                /* @__PURE__ */ jsx(Save, { className: "size-3.5" }),
                saving ? lang === "en" ? "Saving..." : "जतन करत आहे..." : lang === "en" ? "Save" : "जतन करा"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => setEditMode(false), className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm transition-all", children: [
                /* @__PURE__ */ jsx(Undo2, { className: "size-3.5" }),
                lang === "en" ? "Cancel" : "रद्द करा"
              ] })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => setEditMode(true), className: "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all", children: [
                /* @__PURE__ */ jsx(Edit2, { className: "size-3.5" }),
                lang === "en" ? "Edit Timetable" : "वेळापत्रक संपादित करा"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleDownloadPDF, disabled: isDownloading, className: `flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all ${isDownloading ? "opacity-75 cursor-not-allowed" : ""}`, children: [
                isDownloading ? /* @__PURE__ */ jsx("div", { className: "size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
                isDownloading ? lang === "en" ? "Downloading..." : "डाउनलोड करत आहे..." : lang === "en" ? "Save as PDF" : "PDF डाउनलोड करा"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => window.print(), className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all", children: [
                /* @__PURE__ */ jsx(Printer, { className: "size-3.5" }),
                lang === "en" ? "Print / Save PDF" : "प्रिंट / PDF जतन करा"
              ] })
            ] })
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl h-96 flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "size-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wider animate-pulse", children: lang === "en" ? "Loading spreadsheet view..." : "वेळापत्रक लोड होत आहे..." })
        ] }) : /* @__PURE__ */ jsxs("div", { id: "timetable-print-content", className: `bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden space-y-6 print-card ${isDownloading ? "pdf-layout" : ""}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-slate-300 p-4 bg-slate-50/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-600", children: lang === "en" ? "Class:" : "इयत्ता:" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-slate-900 bg-blue-100/50 px-2 py-0.5 rounded-md border border-blue-200", children: lang === "en" ? `Class - ${selectedClassNameEn}` : `इयत्ता - ${selectedClassNameMr}` })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-600", children: lang === "en" ? "School:" : "शाळा:" }),
                editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: schoolName, onChange: (e) => setSchoolName(e.target.value), placeholder: "शाळेचे नाव", className: "px-2 py-0.5 border border-blue-300 rounded text-xs font-bold bg-white text-slate-800 w-64" }) : /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-800", children: schoolName || "—" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-slate-800 tracking-tight", children: lang === "en" ? "TIMETABLE" : "वेळापत्रक" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-black tracking-widest text-slate-400", children: "Smart Learn AI" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 items-end", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-600", children: lang === "en" ? "Year:" : "सन / वर्ष:" }),
                editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: year, onChange: (e) => setYear(e.target.value), className: "px-2 py-0.5 border border-blue-300 rounded text-xs font-bold bg-white text-slate-800 w-24 text-center" }) : /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200", children: year })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-600", children: lang === "en" ? "Class Teacher:" : "वर्गशिक्षक:" }),
                editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: classTeacher, onChange: (e) => setClassTeacher(e.target.value), placeholder: "शिक्षक नाव", className: "px-2 py-0.5 border border-blue-300 rounded text-xs font-bold bg-white text-slate-800 w-32" }) : /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-800", children: classTeacher || "—" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-6 items-start overflow-x-auto pb-4 print-row-container", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[380px] border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#eaf4fe] p-2 text-center border-b border-slate-300", children: /* @__PURE__ */ jsx("h3", { className: "text-xs font-black text-[#1e40af] uppercase tracking-wider", children: "सोमवार ते बुधवार" }) }),
              /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-center border-collapse", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-300", children: [
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold w-12", children: "तासिका" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold w-20", children: "वेळ" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold", children: "सोमवार" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold", children: "मंगळवार" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 font-bold", children: "बुधवार" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200", children: monWed.map((row, idx) => {
                  const isBreakRow = row.period === "";
                  return /* @__PURE__ */ jsxs("tr", { className: `${isBreakRow ? "bg-slate-50/80 font-bold text-slate-500 italic" : "hover:bg-slate-50/30"}`, children: [
                    /* @__PURE__ */ jsx("td", { className: "py-2 px-1 border-r border-slate-300 font-bold text-slate-700 bg-slate-50/50", children: row.period }),
                    /* @__PURE__ */ jsx("td", { className: "py-2 px-1 border-r border-slate-300 text-[11px] font-medium text-slate-500 bg-slate-50/30", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.time, onChange: (e) => handleCellChange("monWed", idx, "time", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 text-[10px] outline-none animate-pulse bg-blue-50/30" }) : row.time }),
                    isBreakRow ? /* @__PURE__ */ jsx("td", { colSpan: 3, className: "py-2 px-2 text-center text-[11px] text-slate-500 bg-slate-100/50 font-bold tracking-wide", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.mon, onChange: (e) => {
                      handleCellChange("monWed", idx, "mon", e.target.value);
                      handleCellChange("monWed", idx, "tue", e.target.value);
                      handleCellChange("monWed", idx, "wed", e.target.value);
                    }, className: "w-full text-center border border-blue-200 rounded p-0.5 text-[11px] font-bold outline-none animate-pulse bg-blue-50/30" }) : row.mon }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1 border-r border-slate-300", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.mon, onChange: (e) => handleCellChange("monWed", idx, "mon", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 outline-none font-medium bg-blue-50/20 focus:bg-white animate-pulse" }) : row.mon }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1 border-r border-slate-300", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.tue, onChange: (e) => handleCellChange("monWed", idx, "tue", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 outline-none font-medium bg-blue-50/20 focus:bg-white animate-pulse" }) : row.tue }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.wed, onChange: (e) => handleCellChange("monWed", idx, "wed", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 outline-none font-medium bg-blue-50/20 focus:bg-white animate-pulse" }) : row.wed })
                    ] })
                  ] }, idx);
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[320px] border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#eaf4fe] p-2 text-center border-b border-slate-300", children: /* @__PURE__ */ jsx("h3", { className: "text-xs font-black text-[#1e40af] uppercase tracking-wider", children: "गुरुवार आणि शुक्रवार" }) }),
              /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-center border-collapse", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-300", children: [
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold w-12", children: "तासिका" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold w-20", children: "वेळ" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold", children: "गुरुवार" }),
                  /* @__PURE__ */ jsx("th", { className: "py-2 px-1 font-bold", children: "शुक्रवार" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200", children: thuFri.map((row, idx) => {
                  const isBreakRow = row.period === "";
                  return /* @__PURE__ */ jsxs("tr", { className: `${isBreakRow ? "bg-slate-50/80 font-bold text-slate-500 italic" : "hover:bg-slate-50/30"}`, children: [
                    /* @__PURE__ */ jsx("td", { className: "py-2 px-1 border-r border-slate-300 font-bold text-slate-700 bg-slate-50/50", children: row.period }),
                    /* @__PURE__ */ jsx("td", { className: "py-2 px-1 border-r border-slate-300 text-[11px] font-medium text-slate-500 bg-slate-50/30", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.time, onChange: (e) => handleCellChange("thuFri", idx, "time", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 text-[10px] outline-none animate-pulse bg-blue-50/30" }) : row.time }),
                    isBreakRow ? /* @__PURE__ */ jsx("td", { colSpan: 2, className: "py-2 px-2 text-center text-[11px] text-slate-500 bg-slate-100/50 font-bold tracking-wide", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.thu, onChange: (e) => {
                      handleCellChange("thuFri", idx, "thu", e.target.value);
                      handleCellChange("thuFri", idx, "fri", e.target.value);
                    }, className: "w-full text-center border border-blue-200 rounded p-0.5 text-[11px] font-bold outline-none animate-pulse bg-blue-50/30" }) : row.thu }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1 border-r border-slate-300", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.thu, onChange: (e) => handleCellChange("thuFri", idx, "thu", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 outline-none font-medium bg-blue-50/20 focus:bg-white animate-pulse" }) : row.thu }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.fri, onChange: (e) => handleCellChange("thuFri", idx, "fri", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 outline-none font-medium bg-blue-50/20 focus:bg-white animate-pulse" }) : row.fri })
                    ] })
                  ] }, idx);
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[280px] space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white", children: [
                /* @__PURE__ */ jsx("div", { className: "bg-[#eaf4fe] p-2 text-center border-b border-slate-300", children: /* @__PURE__ */ jsx("h3", { className: "text-xs font-black text-[#1e40af] uppercase tracking-wider", children: "शनिवार" }) }),
                /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-center border-collapse", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-300", children: [
                    /* @__PURE__ */ jsx("th", { className: "py-2 px-1 border-r border-slate-300 font-bold w-20", children: "वेळ" }),
                    /* @__PURE__ */ jsx("th", { className: "py-2 px-1 font-bold", children: "शनिवार" })
                  ] }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200", children: sat.map((row, idx) => {
                    const isSpecialRow = idx === 0 || idx === 1 || idx === 5 || idx === 9;
                    return /* @__PURE__ */ jsxs("tr", { className: `${isSpecialRow ? "bg-slate-50/80 font-bold text-slate-500 italic" : "hover:bg-slate-50/30"}`, children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 px-1 border-r border-slate-300 text-[11px] font-medium text-slate-500 bg-slate-50/30", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.time, onChange: (e) => handleCellChange("sat", idx, "time", e.target.value), className: "w-full text-center border border-blue-200 rounded p-0.5 text-[10px] outline-none animate-pulse bg-blue-50/30" }) : row.time }),
                      /* @__PURE__ */ jsx("td", { className: "py-1 px-1", children: editMode ? /* @__PURE__ */ jsx("input", { type: "text", value: row.sat, onChange: (e) => handleCellChange("sat", idx, "sat", e.target.value), className: `w-full text-center border border-blue-200 rounded p-0.5 outline-none focus:bg-white animate-pulse ${isSpecialRow ? "font-bold text-[11px]" : "font-medium"}` }) : row.sat })
                    ] }, idx);
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white", children: [
                /* @__PURE__ */ jsx("div", { className: "bg-[#f8fafc] p-2 text-center border-b border-slate-300", children: /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-700 tracking-wider", children: "विषय निहाय तासिका (Summary)" }) }),
                /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-center border-collapse", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-300 text-slate-500", children: [
                    /* @__PURE__ */ jsx("th", { className: "py-2 font-bold border-r border-slate-300", children: "विषय" }),
                    /* @__PURE__ */ jsx("th", { className: "py-2 font-bold", children: "एकूण तासिका" })
                  ] }) }),
                  /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-slate-200 font-medium", children: [
                    Object.entries(summary.counts).map(([subName, count]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/30", children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 border-r border-slate-300 text-slate-600", children: subName }),
                      /* @__PURE__ */ jsx("td", { className: "py-2 font-bold text-slate-800", children: count })
                    ] }, subName)),
                    /* @__PURE__ */ jsxs("tr", { className: "bg-[#f1f5f9] font-black text-slate-800 border-t border-slate-300", children: [
                      /* @__PURE__ */ jsx("td", { className: "py-2 border-r border-slate-300", children: "एकूण तासिका" }),
                      /* @__PURE__ */ jsx("td", { className: "py-2 text-blue-600", children: summary.total })
                    ] })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-slate-300 bg-slate-50/50 p-4 rounded-2xl flex justify-around items-center text-center text-xs font-black text-slate-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-6 flex items-center justify-center" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "border-t border-slate-400 pt-1 w-48 mx-auto", children: "वर्गशिक्षक स्वाक्षरी" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: classTeacher || "नाव प्रविष्ट करा" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-6 flex items-center justify-center" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "border-t border-slate-400 pt-1 w-48 mx-auto", children: "मुख्याध्यापक स्वाक्षरी" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: schoolName ? "ZP Headmaster" : "—" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ClassTimetablePage as component
};
