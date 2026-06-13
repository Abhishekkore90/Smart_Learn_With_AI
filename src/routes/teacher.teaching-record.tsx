import { createFileRoute } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect, useRef } from "react";
import {
  Printer, Plus, Trash2, ChevronDown, ChevronUp,
  Save, BookOpen, Calendar, Loader2, RefreshCw, PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/teaching-record")({
  component: TeachingRecordPage,
});

/* ─── helpers ─── */
const MARATHI_DAYS = ["रविवार","सोमवार","मंगळवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const toDisplay = (iso: string) => {
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const getDayName = (iso: string) => {
  if (!iso) return "सोमवार";
  const d = new Date(iso + "T00:00:00");
  return MARATHI_DAYS[d.getDay()];
};

/* ─── types ─── */
interface SubRow {
  srNo: string;
  vishay: string;
  adhyayanMudda: string;
  adhyayanNishpatti: string;
  adhyayanAnubhav: string;
  sadhanTantra: string;
  shaikshanikSahitya: string;
}

interface Period {
  id: string;
  tasika: string;
  subRows: SubRow[];
}

interface RecordData {
  dateISO: string;
  var_: string;
  vargShikshak: string;
  shala: string;
  suvichar: string;
  iyatta: string;
  san: string;
  pageNo: string;
  periods: Period[];
}

const newSubRow = (srNo: string): SubRow => ({
  srNo,
  vishay: "",
  adhyayanMudda: "",
  adhyayanNishpatti: "",
  adhyayanAnubhav: "",
  sadhanTantra: "",
  shaikshanikSahitya: "",
});

const newPeriod = (n: number): Period => ({
  id: crypto.randomUUID(),
  tasika: String(n),
  subRows: [newSubRow("1"), newSubRow("2")],
});

const defaultPeriods = () => Array.from({ length: 7 }, (_, i) => newPeriod(i + 1));

/* ═══════════════ PAGE ═══════════════ */
function TeachingRecordPage() {
  const { user, profile } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const today = toISO(new Date());

  /* ── state ── */
  const [dateISO, setDateISO] = useState(today);
  const [var_, setVar] = useState(getDayName(today));
  const [vargShikshak, setVargShikshak] = useState(user?.displayName || "");
  const [shala, setShala] = useState((profile as any)?.schoolName || "");
  const [suvichar, setSuvichar] = useState("प्रयत्नांती परमेश्वर.");
  const [iyatta, setIyatta] = useState("पहिली व दुसरी");
  const [san, setSan] = useState("२०२४-२५");
  const [pageNo, setPageNo] = useState("1");
  const [periods, setPeriods] = useState<Period[]>(defaultPeriods());
  const [openPeriods, setOpenPeriods] = useState<string[]>([]); // for mobile accordion
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── sync user info ── */
  useEffect(() => {
    if (user?.displayName) setVargShikshak(user.displayName);
  }, [user]);

  /* ── date change ── */
  const handleDateChange = (iso: string) => {
    setDateISO(iso);
    setVar(getDayName(iso));
  };

  /* ── Firestore helpers ── */
  const docId = () => `${user?.uid || "guest"}_${dateISO}`;

  const handleSave = async () => {
    if (!user) { toast.error("Please login to save"); return; }
    setSaving(true);
    try {
      const data: RecordData = {
        dateISO, var_, vargShikshak, shala, suvichar, iyatta, san, pageNo, periods,
      };
      await setDoc(doc(db, "teaching-records", docId()), data);
      toast.success("✅ टाचण सेव्ह झाली!");
    } catch {
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async () => {
    if (!user) { toast.error("Please login"); return; }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "teaching-records", docId()));
      if (snap.exists()) {
        const d = snap.data() as RecordData;
        setVar(d.var_); setVargShikshak(d.vargShikshak);
        setShala(d.shala); setSuvichar(d.suvichar);
        setIyatta(d.iyatta); setSan(d.san);
        setPageNo(d.pageNo); setPeriods(d.periods);
        toast.success("📂 टाचण लोड झाली!");
      } else {
        toast.info("या दिनांकाची नोंद नाही. नवीन सुरू करा.");
        setPeriods(defaultPeriods());
      }
    } catch {
      toast.error("Load failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ── period actions ── */
  const addPeriod = () => setPeriods(prev => [...prev, newPeriod(prev.length + 1)]);
  const removePeriod = (id: string) => {
    setPeriods(prev => {
      const next = prev.filter(p => p.id !== id);
      return next.map((p, i) => ({ ...p, tasika: String(i + 1) }));
    });
  };

  const addSubRow = (pid: string) => {
    setPeriods(prev => prev.map(p => p.id !== pid ? p : {
      ...p,
      subRows: [...p.subRows, newSubRow(String(p.subRows.length + 1))],
    }));
  };

  const removeSubRow = (pid: string, sIdx: number) => {
    setPeriods(prev => prev.map(p => p.id !== pid ? p : {
      ...p,
      subRows: p.subRows.filter((_, i) => i !== sIdx)
        .map((s, i) => ({ ...s, srNo: String(i + 1) })),
    }));
  };

  const updateSubRow = (pid: string, sIdx: number, field: keyof SubRow, val: string) => {
    setPeriods(prev => prev.map(p => p.id !== pid ? p : {
      ...p,
      subRows: p.subRows.map((s, i) => i !== sIdx ? s : { ...s, [field]: val }),
    }));
  };

  /* ── accordion (mobile) ── */
  const togglePeriod = (id: string) => {
    setOpenPeriods(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const expandAll = () => setOpenPeriods(periods.map(p => p.id));
  const collapseAll = () => setOpenPeriods([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-3 sm:p-5 md:p-8 max-w-[1300px] mx-auto">

          {/* ── Top Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 sm:size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="size-5 sm:size-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-none">
                  दैनंदिन पाठ टाचण
                </h1>
                <p className="text-slate-400 text-[11px] sm:text-sm font-medium mt-0.5">
                  Daily Teaching Diary — Edit, Save & Print
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoad}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span className="hidden sm:inline">लोड करा</span>
                <span className="sm:hidden">Load</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span className="hidden sm:inline">सेव्ह करा</span>
                <span className="sm:hidden">Save</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print / PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════ */}
          {/* PRINTABLE DOCUMENT                    */}
          {/* ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={printRef}
            id="tachan-print"
            className="bg-white border-2 sm:border-4 border-slate-800 rounded-xl sm:rounded-sm shadow-2xl mx-auto overflow-hidden"
          >
            {/* Page number */}
            <div className="px-3 sm:px-5 pt-2 sm:pt-3 flex justify-between items-center">
              <input
                className="w-10 text-xs sm:text-sm font-bold text-slate-600 border-b border-dashed border-slate-300 outline-none text-center bg-transparent"
                value={pageNo}
                onChange={e => setPageNo(e.target.value)}
                title="Page Number"
              />
              <span className="text-[10px] text-slate-400 no-print">(Page No.)</span>
            </div>

            {/* Title */}
            <div className="text-center py-2 sm:py-3 border-b-2 border-slate-800 px-4">
              <h2 className="text-xl sm:text-3xl font-black text-red-600 tracking-wide"
                style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
                दैनंदिन पाठ टाचण
              </h2>
            </div>

            {/* Header Info */}
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-300"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>

              {/* Row 1: Date + Day */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                {/* Date with calendar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">दिनांक:</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{toDisplay(dateISO)}</span>
                  <div className="relative no-print">
                    <input
                      type="date"
                      value={dateISO}
                      onChange={e => handleDateChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] sm:text-xs font-bold hover:bg-indigo-100 transition-all"
                    >
                      <Calendar size={11} /> 📅 Calendar
                    </button>
                  </div>
                </div>

                {/* Day */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">वार:</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{var_}</span>
                </div>
              </div>

              {/* Row 2: Teacher + School */}
              <div className="flex flex-wrap gap-3 mb-2">
                <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                  <span className="text-xs sm:text-sm font-bold text-red-600 whitespace-nowrap">वर्गशिक्षक:</span>
                  <input
                    className="text-xs sm:text-sm font-bold text-red-700 border-b border-dashed border-red-300 outline-none flex-1 bg-transparent min-w-[80px]"
                    value={vargShikshak}
                    onChange={e => setVargShikshak(e.target.value)}
                    placeholder="नाव"
                  />
                </div>
                <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                  <span className="text-xs sm:text-sm font-bold text-red-600 whitespace-nowrap">शाळा:</span>
                  <input
                    className="text-xs sm:text-sm font-bold text-red-700 border-b border-dashed border-red-300 outline-none flex-1 bg-transparent min-w-[80px]"
                    value={shala}
                    onChange={e => setShala(e.target.value)}
                    placeholder="शाळेचे नाव"
                  />
                </div>
              </div>
            </div>

            {/* Suvichar */}
            <div className="px-3 sm:px-5 py-1.5 sm:py-2 border-b-2 border-slate-800 flex flex-wrap items-center gap-1 sm:gap-2"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
              <span className="text-xs sm:text-sm font-black text-slate-800 whitespace-nowrap">आजचा सुविचार :</span>
              <input
                className="text-xs sm:text-sm font-bold text-slate-700 border-b border-dashed border-slate-400 outline-none flex-1 bg-transparent min-w-[150px]"
                value={suvichar}
                onChange={e => setSuvichar(e.target.value)}
              />
            </div>

            {/* Iyatta & San */}
            <div className="px-3 sm:px-5 py-1.5 sm:py-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black text-red-600 whitespace-nowrap">इयत्ता:</span>
                <input
                  className="text-xs sm:text-sm font-bold text-slate-800 border-b border-dashed border-slate-400 outline-none bg-transparent min-w-[100px]"
                  value={iyatta}
                  onChange={e => setIyatta(e.target.value)}
                  placeholder="उदा. पहिली व दुसरी"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-800 whitespace-nowrap">सन:</span>
                <input
                  className="text-xs sm:text-sm font-bold text-slate-800 border-b border-dashed border-slate-400 outline-none bg-transparent w-24"
                  value={san}
                  onChange={e => setSan(e.target.value)}
                />
              </div>
            </div>

            {/* ════ DESKTOP TABLE (lg+) ════ */}
            <div className="hidden lg:block overflow-x-auto"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
              <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "4.5%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8.5%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-blue-50 border border-slate-800">
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      तासिका
                    </th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                      इयत्ता
                    </th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">विषय</th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">अध्ययन मुद्दा पाठांश / पाठघटक</th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">अध्ययन निष्पत्ती / अध्ययन दर्शके</th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">अध्ययन अनुभवाचे स्वरूप</th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">साधन तंत्र</th>
                    <th className="border border-slate-800 p-1.5 text-center font-black text-slate-800">शैक्षणिक साहित्य</th>
                    <th className="border border-slate-800 p-1 text-center font-black text-slate-400 text-[10px] no-print">क्रिया</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, pIdx) =>
                    period.subRows.map((sub, sIdx) => (
                      <tr
                        key={`${period.id}-${sIdx}`}
                        className={`border-b border-slate-200 ${sIdx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}
                      >
                        {sIdx === 0 && (
                          <td
                            rowSpan={period.subRows.length}
                            className="border border-slate-800 text-center font-black text-slate-800 align-middle p-1 bg-blue-100/60"
                          >
                            <div>{period.tasika}</div>
                            {/* Delete period btn */}
                            <button
                              onClick={() => removePeriod(period.id)}
                              className="mt-1 text-red-400 hover:text-red-600 transition-colors no-print"
                              title="तासिका काढा"
                            >
                              <Trash2 size={11} />
                            </button>
                          </td>
                        )}
                        <td className="border border-slate-800 text-center font-bold text-slate-600 p-1 text-[11px]">{sub.srNo}</td>
                        {(["vishay","adhyayanMudda","adhyayanNishpatti","adhyayanAnubhav","sadhanTantra","shaikshanikSahitya"] as (keyof SubRow)[]).map(field => (
                          <td key={field} className="border border-slate-800 p-0.5">
                            <textarea
                              className="w-full resize-none outline-none text-[11px] text-slate-800 bg-transparent leading-snug p-0.5 focus:bg-indigo-50/30 rounded transition-colors"
                              rows={2}
                              value={sub[field]}
                              onChange={e => updateSubRow(period.id, sIdx, field, e.target.value)}
                              placeholder={field === "vishay" ? "विषय" : field === "adhyayanMudda" ? "पाठांश" : field === "sadhanTantra" ? "साधन" : field === "shaikshanikSahitya" ? "साहित्य" : "लिहा..."}
                            />
                          </td>
                        ))}
                        <td className="border border-slate-800 p-0.5 text-center align-middle no-print">
                          <div className="flex flex-col gap-1 items-center">
                            {sIdx === period.subRows.length - 1 && (
                              <button onClick={() => addSubRow(period.id)} className="text-green-600 hover:text-green-800" title="ओळ जोडा">
                                <Plus size={13} />
                              </button>
                            )}
                            {period.subRows.length > 1 && (
                              <button onClick={() => removeSubRow(period.id, sIdx)} className="text-red-400 hover:text-red-600" title="ओळ काढा">
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Add Period btn */}
              <div className="p-3 flex justify-center no-print">
                <button
                  onClick={addPeriod}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  <PlusCircle size={14} /> नवीन तासिका जोडा
                </button>
              </div>
            </div>

            {/* ════ MOBILE CARDS (< lg) ════ */}
            <div className="lg:hidden"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
              {/* Column headers legend */}
              <div className="bg-blue-50 border-b border-slate-300 px-3 py-2 text-[10px] text-slate-500 font-bold no-print flex flex-wrap gap-x-3 gap-y-0.5">
                <span>विषय</span><span>•</span>
                <span>पाठांश</span><span>•</span>
                <span>निष्पत्ती</span><span>•</span>
                <span>अनुभव</span><span>•</span>
                <span>साधन</span><span>•</span>
                <span>साहित्य</span>
              </div>

              {/* Expand/Collapse all (mobile) */}
              <div className="flex gap-2 px-3 py-2 border-b border-slate-200 no-print">
                <button onClick={expandAll} className="text-[10px] font-bold text-indigo-600 hover:underline">सर्व उघडा</button>
                <span className="text-slate-300">|</span>
                <button onClick={collapseAll} className="text-[10px] font-bold text-slate-500 hover:underline">सर्व बंद करा</button>
              </div>

              <div className="divide-y divide-slate-200">
                {periods.map((period, pIdx) => {
                  const isOpen = openPeriods.includes(period.id);
                  return (
                    <div key={period.id} className="bg-white">
                      {/* Period header */}
                      <button
                        onClick={() => togglePeriod(period.id)}
                        className="w-full flex items-center justify-between px-3 py-3 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-7 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                            {period.tasika}
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            तासिका {period.tasika}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({period.subRows.length} ओळी)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Delete period */}
                          {periods.length > 1 && (
                            <button
                              onClick={e => { e.stopPropagation(); removePeriod(period.id); }}
                              className="text-red-400 hover:text-red-600 p-1 transition-colors no-print"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {isOpen
                            ? <ChevronUp size={16} className="text-slate-400" />
                            : <ChevronDown size={16} className="text-slate-400" />
                          }
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-3">
                              {period.subRows.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className={`rounded-xl border p-3 space-y-2 ${sIdx % 2 === 0 ? "bg-white border-slate-200" : "bg-blue-50/40 border-blue-100"}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                      ओळ {sub.srNo}
                                    </span>
                                    {period.subRows.length > 1 && (
                                      <button
                                        onClick={() => removeSubRow(period.id, sIdx)}
                                        className="text-red-400 hover:text-red-600 p-0.5 transition-colors no-print"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>

                                  {/* Fields as label+textarea pairs */}
                                  {[
                                    { field: "vishay" as keyof SubRow, label: "विषय" },
                                    { field: "adhyayanMudda" as keyof SubRow, label: "अध्ययन मुद्दा पाठांश / पाठघटक" },
                                    { field: "adhyayanNishpatti" as keyof SubRow, label: "अध्ययन निष्पत्ती / अध्ययन दर्शके" },
                                    { field: "adhyayanAnubhav" as keyof SubRow, label: "अध्ययन अनुभवाचे स्वरूप" },
                                    { field: "sadhanTantra" as keyof SubRow, label: "साधन तंत्र" },
                                    { field: "shaikshanikSahitya" as keyof SubRow, label: "शैक्षणिक साहित्य" },
                                  ].map(({ field, label }) => (
                                    <div key={field}>
                                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{label}</label>
                                      <textarea
                                        className="w-full resize-none outline-none text-xs text-slate-800 bg-white rounded-lg border border-slate-200 p-2 leading-snug focus:border-indigo-400 transition-colors"
                                        rows={2}
                                        value={sub[field]}
                                        onChange={e => updateSubRow(period.id, sIdx, field, e.target.value)}
                                        placeholder={`${label} लिहा...`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              ))}

                              {/* Add sub-row */}
                              <button
                                onClick={() => addSubRow(period.id)}
                                className="w-full py-2 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-1 no-print"
                              >
                                <Plus size={13} /> ओळ जोडा
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Add Period btn */}
              <div className="p-4 flex justify-center no-print border-t border-slate-200">
                <button
                  onClick={addPeriod}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
                >
                  <PlusCircle size={14} /> नवीन तासिका जोडा
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 sm:py-3 border-t-2 border-slate-800 text-center"
              style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600">
                अधिक माहितीसाठी Whats App क्रमांक : 85 85 85 10 85
              </p>
            </div>
          </motion.div>

          <div className="h-10" />
        </div>
      </main>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #tachan-print, #tachan-print * { visibility: visible !important; }
          #tachan-print {
            position: fixed !important;
            top: 0; left: 0;
            width: 100vw !important; max-width: 100vw !important;
            border: none !important; box-shadow: none !important;
            margin: 0 !important; padding: 0 !important; border-radius: 0 !important;
          }
          .no-print { display: none !important; }
          .lg\\:block { display: block !important; }
          .lg\\:hidden { display: none !important; }
          textarea { border: none !important; resize: none !important; background: transparent !important; }
          input, select { border-bottom: none !important; background: transparent !important; }
        }
        @media (max-width: 1023px) {
          .lg\\:block { display: none; }
          .lg\\:hidden { display: block; }
        }
        @media (min-width: 1024px) {
          .lg\\:block { display: block; }
          .lg\\:hidden { display: none; }
        }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}
