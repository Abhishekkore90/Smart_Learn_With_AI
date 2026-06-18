import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName?: string;
  name?: string;
  rollNo?: string;
  gender?: string;
  [key: string]: any;
}

const MONTHS = [
  { key: "june", label: "जून", days: 30 },
  { key: "july", label: "जुलै", days: 31 },
  { key: "august", label: "ऑगस्ट", days: 31 },
  { key: "september", label: "सप्टें.", days: 30 },
  { key: "october", label: "ऑक्टो.", days: 31 },
  { key: "november", label: "नोव्हें.", days: 30 },
  { key: "december", label: "डिसें.", days: 31 },
  { key: "january", label: "जाने.", days: 31 },
  { key: "february", label: "फेब्रु.", days: 28 },
  { key: "march", label: "मार्च", days: 31 },
  { key: "april", label: "एप्रिल", days: 30 },
  { key: "may", label: "मे", days: 31 },
];


type ViewTab = "student" | "month";
type MainView = "attendance" | "working-days";

export function CCEAttendance({ selectedClass, academicYear, onBack }: { selectedClass: string; academicYear: string; onBack: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [attendance, setAttendance] = useState<Record<string, Record<number, "P" | "A" | "">>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("student");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [selectedMonthForEdit, setSelectedMonthForEdit] = useState<typeof MONTHS[0] | null>(null);
  const [mainView, setMainView] = useState<MainView>("attendance");
  const [workingDays, setWorkingDays] = useState<Record<string, number>>(
    Object.fromEntries(MONTHS.map(m => [m.key, 0]))
  );
  const [savingWorkingDays, setSavingWorkingDays] = useState(false);

  // Today's date info
  const today = new Date();
  const todayDay = today.getDate();

  // Fetch students
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("class", "==", selectedClass)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(data.sort((a, b) => (parseInt(a.rollNo || "999") - parseInt(b.rollNo || "999"))));
    });
    return () => unsubscribe();
  }, [selectedClass]);

  // Load attendance for selected month
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "cce_attendance", `${selectedClass}_${academicYear}_${selectedMonth.key}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAttendance(snap.data().records || {});
        } else {
          setAttendance({});
        }
      } catch (err) {
        console.error("Error loading attendance:", err);
      }
      setLoading(false);
    };
    loadAttendance();
  }, [selectedClass, academicYear, selectedMonth]);

  const toggleAttendance = (studentId: string, day: number) => {
    setAttendance(prev => {
      const studentRecord = prev[studentId] || {};
      const current = studentRecord[day] || "";
      const next = current === "" ? "P" : current === "P" ? "A" : "";
      return {
        ...prev,
        [studentId]: { ...studentRecord, [day]: next }
      };
    });
  };

  // Toggle today's attendance for a student (student-wise view)
  const toggleTodayAttendance = (studentId: string) => {
    toggleAttendance(studentId, todayDay);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "cce_attendance", `${selectedClass}_${academicYear}_${selectedMonth.key}`);
      await setDoc(docRef, {
        class: selectedClass,
        academicYear,
        month: selectedMonth.key,
        records: attendance,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("उपस्थिती जतन झाली!");
    } catch (err: any) {
      console.error(err);
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSaving(false);
  };

  const getStats = (studentId: string) => {
    const rec = attendance[studentId] || {};
    let present = 0, absent = 0;
    Object.values(rec).forEach(v => { if (v === "P") present++; else if (v === "A") absent++; });
    return { present, absent };
  };

  const getTodayStatus = (studentId: string): "P" | "A" | "" => {
    return attendance[studentId]?.[todayDay] || "";
  };

  // Month-wise view for a selected student
  const renderMonthView = () => {
    if (!selectedStudentId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-[#6b7280]">
          <p className="text-sm">विद्यार्थी निवडा</p>
        </div>
      );
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return null;

    const stats = getStats(selectedStudentId);

    return (
      <div className="space-y-3">
        {/* Student info header */}
        <div className="bg-[#1a2e1a] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[#d1fae5] font-bold text-base">{student.fullName || student.name || "-"}</p>
            <p className="text-[#6b8f6b] text-xs mt-0.5">उपस्थित: {stats.present} | अनुपस्थित: {stats.absent}</p>
          </div>
          <button
            onClick={() => setSelectedStudentId(null)}
            className="text-[#6b8f6b] hover:text-[#d1fae5] transition-colors text-sm"
          >
            बदला
          </button>
        </div>

        {/* Day-wise list for selected month */}
        <div className="space-y-1">
          {Array.from({ length: selectedMonth.days }, (_, i) => {
            const day = i + 1;
            const val = attendance[selectedStudentId]?.[day] || "";
            return (
              <div
                key={day}
                onClick={() => toggleAttendance(selectedStudentId, day)}
                className="flex items-center justify-between px-4 py-3 bg-[#1a2e1a] rounded-xl cursor-pointer hover:bg-[#243524] transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#243524] border border-[#2d4a2d] flex items-center justify-center text-[#4ade80] font-bold text-sm">
                    {day}
                  </div>
                  <span className="text-[#d1fae5] text-sm font-medium">
                    दिवस {day}
                  </span>
                </div>
                {/* Status circle */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  val === "P"
                    ? "border-[#4ade80] bg-[#4ade80]"
                    : val === "A"
                      ? "border-[#ef4444] bg-[#ef4444]"
                      : "border-[#4ade80] bg-transparent"
                }`}>
                  {val === "P" && (
                    <svg className="w-4 h-4 text-[#0a1f0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {val === "A" && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Load working days from Firebase
  useEffect(() => {
    const loadWorkingDays = async () => {
      try {
        const ref = doc(db, "cce_working_days", `${selectedClass}_${academicYear}`);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().days) {
          setWorkingDays(prev => ({ ...prev, ...snap.data().days }));
        }
      } catch (err) {
        console.error("Error loading working days:", err);
      }
    };
    loadWorkingDays();
  }, [selectedClass, academicYear]);

  const saveWorkingDays = async () => {
    setSavingWorkingDays(true);
    try {
      const ref = doc(db, "cce_working_days", `${selectedClass}_${academicYear}`);
      await setDoc(ref, {
        class: selectedClass,
        academicYear,
        days: workingDays,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("कामाचे दिवस जतन झाले!");
      setMainView("attendance");
    } catch (err: any) {
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSavingWorkingDays(false);
  };

  // Student attendance editor view (when circle is clicked) — month-wise count input
  if (selectedStudentForEdit) {
    const student = selectedStudentForEdit;

    // Per-month attendance counts stored in a special namespace in attendance state
    // Key format: "m_<monthKey>" stores the attended day count as a number
    const getMonthAttended = (monthKey: string): number => {
      const raw = (attendance[student.id] as any)?.[`m_${monthKey}`];
      return typeof raw === "number" ? raw : 0;
    };

    const setMonthAttended = (monthKey: string, val: number) => {
      setAttendance(prev => ({
        ...prev,
        [student.id]: {
          ...(prev[student.id] || {}),
          [`m_${monthKey}`]: val as any,
        }
      }));
    };

    const saveMonthAttendance = async () => {
      setSaving(true);
      try {
        const ref = doc(db, "cce_attendance", `${selectedClass}_${academicYear}_monthly`);
        await setDoc(ref, {
          class: selectedClass,
          academicYear,
          records: {
            ...((await (async () => {
              const snap = await (await import("firebase/firestore")).getDoc(ref);
              return snap.exists() ? snap.data().records : {};
            })())),
            [student.id]: Object.fromEntries(
              MONTHS.map(m => [m.key, getMonthAttended(m.key)])
            ),
          },
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast.success("उपस्थिती जतन झाली!");
        setSelectedStudentForEdit(null);
      } catch (err: any) {
        toast.error("जतन अयशस्वी: " + err.message);
      }
      setSaving(false);
    };

    return (
      <div className="bg-[#0f1f0f] rounded-[2rem] overflow-hidden min-h-[80vh] relative flex flex-col" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedStudentForEdit(null)} className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-[#d1fae5] text-base font-bold">विद्यार्थी उपस्थिती</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Student name row */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1a2e1a]">
            <div className="w-8 h-8 rounded-full bg-[#1e4620] text-[#4ade80] font-bold text-sm flex items-center justify-center border border-[#2d4a2d] flex-shrink-0">
              {students.indexOf(student) + 1}
            </div>
            <span className="text-[#d1fae5] text-[15px] font-medium">
              {student.fullName || student.name || "-"}
            </span>
          </div>

          {/* Instruction */}
          <p className="px-5 py-3 text-[#6b8f6b] text-[13px] leading-relaxed border-b border-[#1a2e1a]">
            प्रत्येक महिन्यासाठी विद्यार्थ्याने उपस्थित राहिलेल्या दिवसांची संख्या प्रविष्ट करा.
          </p>

          {/* Month-wise 2-column grid */}
          <div className="grid grid-cols-2 gap-3 px-4 py-4">
            {MONTHS.map((month) => {
              const totalDays = workingDays[month.key] || 0;
              const attended = getMonthAttended(month.key);
              return (
                <div key={month.key}>
                  <p className="text-[#d1fae5] text-sm font-medium mb-1.5">{month.label}</p>
                  <div className="flex items-center bg-[#0b0e0a] border border-[#2d4730] rounded-xl overflow-hidden">
                    <input
                      type="number"
                      min="0"
                      max={totalDays || month.days}
                      value={attended === 0 ? "" : attended}
                      onChange={(e) => {
                        const val = Math.min(
                          totalDays || month.days,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        setMonthAttended(month.key, val);
                      }}
                      placeholder="0"
                      className="flex-1 px-3 py-3.5 bg-transparent text-[#d1fae5] text-base font-bold outline-none w-0"
                    />
                    <span className="pr-3 text-[#6b8f6b] text-base font-medium whitespace-nowrap">
                      / {totalDays || month.days}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed save button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0f1f0f] to-transparent">
          <button
            onClick={saveMonthAttendance}
            disabled={saving}
            className="w-full py-4 bg-[#8fbf7f] hover:bg-[#a2d192] active:scale-[0.99] text-black font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    );
  }


  // Working Days View
  if (mainView === "working-days") {
    return (
      <div className="bg-[#0f1f0f] rounded-[2rem] overflow-hidden min-h-[80vh]" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2e1a]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMainView("attendance")}
              className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-[#d1fae5] text-lg font-bold">कामाचे दिवस</h2>
          </div>
          <button
            onClick={saveWorkingDays}
            disabled={savingWorkingDays}
            className="text-[#4ade80] hover:text-[#86efac] text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {savingWorkingDays ? "जतन..." : "जतन करा"}
          </button>
        </div>

        {/* Month list with working days input */}
        <div className="px-4 py-3 space-y-0.5">
          {MONTHS.map((month) => (
            <div
              key={month.key}
              className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-[#1a2e1a]/50 transition-colors"
            >
              <span className="text-[#d1fae5] text-[15px] font-medium">{month.label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWorkingDays(prev => ({ ...prev, [month.key]: Math.max(0, (prev[month.key] || 0) - 1) }))}
                  className="w-8 h-8 rounded-full bg-[#1a2e1a] border border-[#2d4a2d] text-[#4ade80] font-bold flex items-center justify-center hover:bg-[#243524] transition-colors cursor-pointer active:scale-90"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max={month.days}
                  value={workingDays[month.key] || 0}
                  onChange={(e) => setWorkingDays(prev => ({ ...prev, [month.key]: Math.min(month.days, Math.max(0, parseInt(e.target.value) || 0)) }))}
                  className="w-14 text-center py-1.5 bg-[#0b0e0a] border border-[#2d4a2d] focus:border-[#4ade80] rounded-lg text-sm text-[#4ade80] font-bold outline-none transition-colors"
                />
                <button
                  onClick={() => setWorkingDays(prev => ({ ...prev, [month.key]: Math.min(month.days, (prev[month.key] || 0) + 1) }))}
                  className="w-8 h-8 rounded-full bg-[#1a2e1a] border border-[#2d4a2d] text-[#4ade80] font-bold flex items-center justify-center hover:bg-[#243524] transition-colors cursor-pointer active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total working days info */}
        <div className="px-5 py-4 border-t border-[#1a2e1a] mt-2">
          <div className="bg-[#1a2e1a] rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[#6b8f6b] text-sm font-medium">एकूण कामाचे दिवस</span>
            <span className="text-[#4ade80] text-lg font-bold">
              {Object.values(workingDays).reduce((sum, v) => sum + (v || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Month detail: full-page view (early return, same as selectedStudentForEdit) ──
  if (selectedMonthForEdit) {
    const month = selectedMonthForEdit;
    const totalDays = workingDays[month.key] || month.days;

    const getAttended = (studentId: string): number => {
      const raw = (attendance[studentId] as any)?.[`m_${month.key}`];
      return typeof raw === "number" ? raw : 0;
    };

    const setAttended = (studentId: string, val: number) => {
      setAttendance(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [`m_${month.key}`]: val as any,
        }
      }));
    };

    const totalAttended = students.reduce((sum, s) => sum + getAttended(s.id), 0);

    const saveMonthData = async () => {
      setSaving(true);
      try {
        const ref = doc(db, "cce_attendance", `${selectedClass}_${academicYear}_monthly`);
        const existing = await getDoc(ref);
        const existingRecords = existing.exists() ? existing.data().records || {} : {};
        const updatedRecords = { ...existingRecords };
        for (const student of students) {
          updatedRecords[student.id] = {
            ...(updatedRecords[student.id] || {}),
            [month.key]: getAttended(student.id),
          };
        }
        await setDoc(ref, {
          class: selectedClass, academicYear,
          records: updatedRecords,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast.success(`${month.label} उपस्थिती जतन झाली!`);
        setSelectedMonthForEdit(null);
      } catch (err: any) {
        toast.error("जतन अयशस्वी: " + err.message);
      }
      setSaving(false);
    };

    return (
      <div className="bg-[#0f1f0f] rounded-[2rem] overflow-hidden min-h-[80vh] relative flex flex-col" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedMonthForEdit(null)} className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-[#d1fae5] text-base font-bold">{month.label} - उपस्थिती</h2>
          </div>
          <span className="text-[#4ade80] font-bold text-lg">{totalAttended}</span>
        </div>

        {/* Students list */}
        <div className="flex-1 overflow-y-auto pb-24 px-5 py-4 space-y-4">
          {students.map((student, idx) => {
            const attended = getAttended(student.id);
            return (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#1e4620] text-[#d1fae5] font-bold text-sm flex items-center justify-center border border-[#2d4a2d] flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-[#d1fae5] text-[15px] font-medium truncate">
                    {student.fullName || student.name || "-"}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={totalDays}
                  value={attended === 0 ? "" : attended}
                  onChange={(e) => {
                    const val = Math.min(totalDays, Math.max(0, parseInt(e.target.value) || 0));
                    setAttended(student.id, val);
                  }}
                  placeholder="0"
                  className="w-16 h-14 text-center bg-[#0b0e0a] border border-[#2d4730] rounded-xl text-[#d1fae5] text-base font-bold outline-none focus:border-[#4ade80] transition-colors ml-3 flex-shrink-0"
                />
              </div>
            );
          })}
        </div>

        {/* Fixed save button */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0f1f0f] to-transparent">
          <button
            onClick={saveMonthData}
            disabled={saving}
            className="w-full py-4 bg-[#8fbf7f] hover:bg-[#a2d192] active:scale-[0.99] text-black font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-[#0f1f0f] rounded-[2rem] overflow-hidden min-h-[80vh]" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2e1a]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-[#d1fae5] text-lg font-bold">उपस्थिती</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="text-[#4ade80] hover:text-[#86efac] text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "जतन..." : "जतन करा"}
          </button>
          <button
            onClick={() => setMainView("working-days")}
            className="text-[#4ade80] hover:text-[#86efac] text-sm font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            कामाचे दिवस <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs: विद्यार्थी निहाय / महिना निहाय */}
      <div className="flex border-b border-[#1a2e1a]">
        <button
          onClick={() => setActiveTab("student")}
          className={`flex-1 py-3 text-sm font-bold text-center transition-colors cursor-pointer ${
            activeTab === "student"
              ? "text-[#4ade80] border-b-2 border-[#4ade80]"
              : "text-[#6b8f6b] hover:text-[#a3d9a3]"
          }`}
        >
          विद्यार्थी निहाय
        </button>
        <button
          onClick={() => setActiveTab("month")}
          className={`flex-1 py-3 text-sm font-bold text-center transition-colors cursor-pointer ${
            activeTab === "month"
              ? "text-[#4ade80] border-b-2 border-[#4ade80]"
              : "text-[#6b8f6b] hover:text-[#a3d9a3]"
          }`}
        >
          महिना निहाय
        </button>
      </div>

      {/* Month selector strip removed — months now shown as list below */}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]"></div>
            <span className="ml-3 text-sm text-[#6b8f6b]">लोड होत आहे...</span>
          </div>
        ) : activeTab === "student" ? (
          /* Student-wise view: list of students with today's attendance toggle */
          <div className="space-y-1">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#6b8f6b]">
                <p className="text-sm">विद्यार्थी सापडले नाहीत</p>
              </div>
            ) : (
              students.map((student, idx) => {
                const todayStatus = getTodayStatus(student.id);
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[#1a2e1a] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Green numbered circle */}
                      <div className="w-9 h-9 rounded-lg bg-[#1a2e1a] border border-[#2d4a2d] flex items-center justify-center text-[#4ade80] font-bold text-sm group-hover:bg-[#243524] transition-colors">
                        {idx + 1}
                      </div>
                      <span className="text-[#d1fae5] text-[15px] font-medium">
                        {student.fullName || student.name || "-"}
                      </span>
                    </div>
                    {/* Attendance toggle circle - opens student editor */}
                    <button
                      onClick={() => setSelectedStudentForEdit(student)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                        todayStatus === "P"
                          ? "border-[#4ade80] bg-[#4ade80]"
                          : todayStatus === "A"
                            ? "border-[#ef4444] bg-[#ef4444]"
                            : "border-[#4ade80] bg-transparent hover:border-[#86efac]"
                      }`}
                    >
                      {todayStatus === "P" && (
                        <svg className="w-4 h-4 text-[#0a1f0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {todayStatus === "A" && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Month-wise list: months with circles */
          <div className="space-y-0.5">
            {MONTHS.map((month) => (
              <div
                key={month.key}
                className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-[#1a2e1a] transition-colors"
              >
                <span className="text-[#d1fae5] text-[15px] font-medium">{month.label}</span>
                <button
                  onClick={() => { setSelectedMonthForEdit(month); setSelectedMonth(month); }}
                  className="w-9 h-9 rounded-full border-2 border-[#4ade80] bg-transparent flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:border-[#86efac]"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

