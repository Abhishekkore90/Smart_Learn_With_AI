import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const EXAMS_SEM1 = [
  { key: "test1",    label: "चाचणी १" },
  { key: "test2",    label: "चाचणी २" },
  { key: "semester1", label: "सत्र परीक्षा १" },
];
const EXAMS_SEM2 = [
  { key: "test3",    label: "चाचणी ३" },
  { key: "test4",    label: "चाचणी ४" },
  { key: "semester2", label: "सत्र परीक्षा २" },
];

const DEFAULT_SUBJECTS = [
  "प्रथम भाषा : मराठी",
  "द्वितीय भाषा : इंग्रजी",
  "गणित",
  "कला",
  "कार्यानुभव",
  "शारीरिक शिक्षण",
];

interface SubjectMarks {
  tondiKaam: number;
  upakram: number;
  chaachani: number;
  swadhyay: number;
  sankalitTondi: number;
  sankalitLekhi: number;
}

const emptySubjectMarks = (): SubjectMarks => ({
  tondiKaam: 0, upakram: 0, chaachani: 0,
  swadhyay: 0, sankalitTondi: 0, sankalitLekhi: 0,
});

const MARK_COLS = [
  { key: "tondiKaam" as keyof SubjectMarks,     label: "तोंडीकाम",        max: 20 },
  { key: "upakram" as keyof SubjectMarks,       label: "उपक्रम / कृती",   max: 15 },
  { key: "chaachani" as keyof SubjectMarks,     label: "चाचणी (लेखी)",    max: 20 },
  { key: "swadhyay" as keyof SubjectMarks,      label: "स्वाध्याय / वर्गकार्य", max: 15 },
  { key: "sankalitTondi" as keyof SubjectMarks, label: "तोंडी",           max: 10 },
  { key: "sankalitLekhi" as keyof SubjectMarks, label: "लेखी",            max: 20 },
];

interface Student { id: string; fullName?: string; name?: string; rollNo?: string; [key: string]: any; }
type Semester = "sem1" | "sem2";
type ViewTab = "student" | "subject";

// ── Shared theme tokens ──
const T = {
  bg:       "#080f08",
  card:     "#0f1a0f",
  border:   "#1a2e1a",
  accent:   "#4ade80",
  accentDim:"#2d6e3a",
  textHi:   "#d1fae5",
  textLo:   "#6b8f6b",
  input:    "#0a120a",
};

function MarksInput({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center rounded-xl overflow-hidden" style={{ background: T.input, border: `1px solid ${T.border}` }}>
      <input
        type="number" min="0" max={max}
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
        placeholder="0"
        className="flex-1 px-3 py-3.5 bg-transparent text-base font-bold outline-none w-0"
        style={{ color: T.textHi }}
      />
      <span className="pr-3 text-sm whitespace-nowrap" style={{ color: T.textLo }}>/ {max}</span>
    </div>
  );
}

export function CCEMarksEntry({ selectedClass, academicYear, onBack }: {
  selectedClass: string; academicYear: string; onBack: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSemester, setActiveSemester] = useState<Semester>("sem1");
  const [activeView, setActiveView] = useState<ViewTab>("student");
  const [selectedExamKey, setSelectedExamKey] = useState(EXAMS_SEM1[0].key);
  const [allMarks, setAllMarks] = useState<Record<string, Record<string, SubjectMarks>>>({});

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  const currentExams = activeSemester === "sem1" ? EXAMS_SEM1 : EXAMS_SEM2;

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"), where("class", "==", selectedClass));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(data.sort((a, b) => parseInt(a.rollNo || "999") - parseInt(b.rollNo || "999")));
    });
    return () => unsub();
  }, [selectedClass]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const settingsSnap = await getDoc(doc(db, "cce_settings", `${selectedClass}_${academicYear}`));
        if (settingsSnap.exists() && settingsSnap.data().subjects) setSubjects(settingsSnap.data().subjects);
        const marksSnap = await getDoc(doc(db, "cce_marks_v2", `${selectedClass}_${academicYear}_${selectedExamKey}`));
        setAllMarks(marksSnap.exists() ? marksSnap.data().records || {} : {});
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [selectedClass, academicYear, selectedExamKey]);

  useEffect(() => {
    const exams = activeSemester === "sem1" ? EXAMS_SEM1 : EXAMS_SEM2;
    setSelectedExamKey(exams[0].key);
    setEditingStudent(null);
    setEditingSubject(null);
  }, [activeSemester]);

  const getSubjectMarks = (studentId: string, subject: string): SubjectMarks =>
    allMarks[studentId]?.[subject] || emptySubjectMarks();

  const setSubjectMark = <K extends keyof SubjectMarks>(
    studentId: string, subject: string, field: K, value: number
  ) => {
    setAllMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: { ...getSubjectMarks(studentId, subject), [field]: value },
      },
    }));
  };

  const saveMarks = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "cce_marks_v2", `${selectedClass}_${academicYear}_${selectedExamKey}`),
        { class: selectedClass, academicYear, exam: selectedExamKey, records: allMarks, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      toast.success("गुण जतन झाले!");
    } catch (err: any) { toast.error("जतन अयशस्वी: " + err.message); }
    setSaving(false);
  };

  const containerStyle = {
    fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
    background: T.bg,
    color: T.textHi,
  };

  // ── STUDENT MARKS EDITOR ──
  if (editingStudent) {
    const student = editingStudent;
    const studentIdx = students.indexOf(student);
    const subject = subjects[subjectIndex];
    const sm = getSubjectMarks(student.id, subject);
    const akarTotal = sm.tondiKaam + sm.upakram + sm.chaachani + sm.swadhyay;
    const sankalitTotal = sm.sankalitTondi + sm.sankalitLekhi;

    return (
      <div className="rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden" style={{ ...containerStyle, borderColor: T.border }}>
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => setEditingStudent(null)} className="cursor-pointer transition-colors" style={{ color: T.textHi }}>
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold" style={{ color: T.textHi }}>
            गुण नोंदणी - {activeSemester === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}
          </h2>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center border flex-shrink-0"
            style={{ background: T.accentDim, color: T.accent, borderColor: T.border }}>
            {studentIdx + 1}
          </div>
          <span className="text-[14px] font-medium flex-1" style={{ color: T.textHi }}>{student.fullName || student.name || "-"}</span>
        </div>
        <div className="flex-1 overflow-y-auto pb-28 px-5 py-4">
          {/* Subject nav */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-base font-bold" style={{ color: T.textHi }}>{subject}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSubjectIndex(Math.max(0, subjectIndex - 1))} disabled={subjectIndex === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40"
                style={{ background: T.card, color: T.textLo }}>
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm" style={{ color: T.textLo }}>{subjectIndex + 1}/{subjects.length}</span>
              <button onClick={() => setSubjectIndex(Math.min(subjects.length - 1, subjectIndex + 1))} disabled={subjectIndex === subjects.length - 1}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40"
                style={{ background: T.card, color: T.textLo }}>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* आकारिक मूल्यमापन */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: T.textHi }}>आकारिक मूल्यमापन</h3>
              <span className="text-xs" style={{ color: T.textLo }}>एकूण गुण 70</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>तोंडीकाम</p><MarksInput value={sm.tondiKaam} max={20} onChange={v => setSubjectMark(student.id, subject, "tondiKaam", v)} /></div>
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>उपक्रम / कृती</p><MarksInput value={sm.upakram} max={15} onChange={v => setSubjectMark(student.id, subject, "upakram", v)} /></div>
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>चाचणी (लेखी)</p><MarksInput value={sm.chaachani} max={20} onChange={v => setSubjectMark(student.id, subject, "chaachani", v)} /></div>
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>स्वाध्याय / वर्गकार्य</p><MarksInput value={sm.swadhyay} max={15} onChange={v => setSubjectMark(student.id, subject, "swadhyay", v)} /></div>
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs" style={{ color: T.textLo }}>एकूण प्राप्त गुण: <span className="font-bold" style={{ color: T.textHi }}>{akarTotal}</span></span>
              <span className="text-xs" style={{ color: T.textLo }}>पैकी गुण: 70</span>
            </div>
          </div>

          <div className="my-4" style={{ borderTop: `1px solid ${T.border}` }} />

          {/* संकलित मूल्यमापन */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: T.textHi }}>संकलित मूल्यमापन</h3>
              <span className="text-xs" style={{ color: T.textLo }}>एकूण गुण 30</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>तोंडी</p><MarksInput value={sm.sankalitTondi} max={10} onChange={v => setSubjectMark(student.id, subject, "sankalitTondi", v)} /></div>
              <div><p className="text-xs mb-1" style={{ color: T.textLo }}>लेखी</p><MarksInput value={sm.sankalitLekhi} max={20} onChange={v => setSubjectMark(student.id, subject, "sankalitLekhi", v)} /></div>
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs" style={{ color: T.textLo }}>एकूण प्राप्त गुण: <span className="font-bold" style={{ color: T.textHi }}>{sankalitTotal}</span></span>
              <span className="text-xs" style={{ color: T.textLo }}>पैकी गुण: 30</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3 flex gap-3" style={{ background: `linear-gradient(to top, ${T.bg}, transparent)` }}>
          <button onClick={saveMarks} disabled={saving}
            className="flex-1 py-4 font-bold text-sm rounded-2xl cursor-pointer disabled:opacity-50 transition-all"
            style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textHi }}>
            {saving ? "जतन..." : "जतन करा"}
          </button>
          <button onClick={async () => { await saveMarks(); if (subjectIndex < subjects.length - 1) setSubjectIndex(subjectIndex + 1); }}
            disabled={saving}
            className="flex-[2] py-4 font-extrabold text-sm rounded-2xl cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
            style={{ background: T.accent, color: "#0a1f0a" }}>
            {saving ? "जतन होत आहे..." : "जतन करा & पुढे जा"}
          </button>
        </div>
      </div>
    );
  }

  // ── SUBJECT MARKS EDITOR ──
  if (editingSubject) {
    const subject = editingSubject;
    const totalMax = MARK_COLS.reduce((s, c) => s + c.max, 0);
    const getTotal = (studentId: string) =>
      MARK_COLS.reduce((s, c) => s + (getSubjectMarks(studentId, subject)[c.key] || 0), 0);

    return (
      <div className="rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden" style={{ ...containerStyle, borderColor: T.border }}>
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => setEditingSubject(null)} className="cursor-pointer" style={{ color: T.textHi }}>
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold" style={{ color: T.textHi }}>गुण नोंदणी</h2>
        </div>
        <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <span className="text-xs font-medium" style={{ color: T.textLo }}>{selectedClass}</span>
          <span className="text-xs font-bold" style={{ color: T.textHi }}>{subject}</span>
          <span className="text-xs font-medium" style={{ color: T.textLo }}>{activeSemester === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}</span>
        </div>

        {/* Mark column pills */}
        <div className="px-4 py-3 overflow-x-auto flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            {MARK_COLS.map((col) => (
              <span key={col.key} className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textLo }}>
                {col.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 px-4 py-3 space-y-4">
          {students.length === 0 ? (
            <div className="flex justify-center py-20 text-sm" style={{ color: T.textLo }}>विद्यार्थी सापडले नाहीत</div>
          ) : students.map((student, idx) => {
            const sm = getSubjectMarks(student.id, subject);
            const total = getTotal(student.id);
            return (
              <div key={student.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center border flex-shrink-0"
                      style={{ background: T.accentDim, color: T.accent, borderColor: T.border }}>
                      {idx + 1}
                    </div>
                    <span className="text-[14px] font-medium" style={{ color: T.textHi }}>{student.fullName || student.name || "-"}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: T.textLo }}>{total}/{totalMax}</span>
                </div>
                <div className="overflow-x-auto pb-1">
                  <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                    {MARK_COLS.map((col) => (
                      <div key={col.key} className="flex-shrink-0" style={{ width: "100px" }}>
                        <p className="text-[10px] mb-1 truncate" style={{ color: T.textLo }}>{col.label}</p>
                        <div className="flex items-center rounded-xl overflow-hidden h-12" style={{ background: T.input, border: `1px solid ${T.border}` }}>
                          <input
                            type="number" min="0" max={col.max}
                            value={(sm[col.key] as number) === 0 ? "" : sm[col.key]}
                            onChange={(e) => setSubjectMark(student.id, subject, col.key, Math.min(col.max, Math.max(0, parseInt(e.target.value) || 0)))}
                            placeholder="0"
                            className="flex-1 px-2 py-2 bg-transparent text-sm font-bold outline-none w-0 min-w-0"
                            style={{ color: T.textHi }}
                          />
                          <span className="pr-2 text-xs whitespace-nowrap" style={{ color: T.textLo }}>/{col.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3" style={{ background: `linear-gradient(to top, ${T.bg}, transparent)` }}>
          <button onClick={saveMarks} disabled={saving}
            className="w-full py-4 font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-[0.99]"
            style={{ background: T.accent, color: "#0a1f0a" }}>
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN LIST VIEW ──
  return (
    <div className="rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
      style={{ ...containerStyle, borderColor: T.border }}>

      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onBack} className="p-1.5 rounded-full transition-colors cursor-pointer" style={{ color: T.textHi }}>
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-base font-bold tracking-tight" style={{ color: T.textHi }}>गुण नोंदणी</h2>
      </div>

      {/* Semester Tabs */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex p-1 rounded-xl" style={{ background: T.card }}>
          {(["sem1", "sem2"] as Semester[]).map((sem) => (
            <button key={sem} onClick={() => setActiveSemester(sem)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer`}
              style={{
                background: activeSemester === sem ? T.accentDim : "transparent",
                color: activeSemester === sem ? T.accent : T.textLo,
              }}>
              {sem === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}
            </button>
          ))}
        </div>
      </div>

      {/* View sub-tabs (विद्यार्थी निहाय | विषय निहाय) */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        {(["student", "subject"] as ViewTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveView(tab)}
            className="flex-1 py-3 text-sm font-bold text-center transition-colors cursor-pointer"
            style={{
              color: activeView === tab ? T.accent : T.textLo,
              borderBottom: activeView === tab ? `2px solid ${T.accent}` : "2px solid transparent",
            }}>
            {tab === "student" ? "विद्यार्थी निहाय" : "विषय निहाय"}
          </button>
        ))}
      </div>

      {/* Exam pills */}
      <div className="px-4 py-3 overflow-x-auto flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          {currentExams.map((e) => (
            <button key={e.key} onClick={() => setSelectedExamKey(e.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
              style={{
                background: e.key === selectedExamKey ? T.accent : T.card,
                color: e.key === selectedExamKey ? "#0a1f0a" : T.textLo,
                border: `1px solid ${e.key === selectedExamKey ? T.accent : T.border}`,
              }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: T.accent }} />
            <span className="text-xs font-bold" style={{ color: T.textLo }}>लोड होत आहे...</span>
          </div>
        ) : activeView === "student" ? (
          <div className="space-y-0.5">
            {students.length === 0 ? (
              <div className="flex justify-center py-20 text-sm" style={{ color: T.textLo }}>विद्यार्थी सापडले नाहीत</div>
            ) : students.map((student, idx) => {
              const hasMarks = subjects.some(sub => {
                const sm = getSubjectMarks(student.id, sub);
                return sm.tondiKaam > 0 || sm.chaachani > 0 || sm.sankalitLekhi > 0;
              });
              return (
                <div key={student.id} className="flex items-center justify-between px-2 py-3.5 rounded-xl transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.card)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border"
                      style={{ background: T.accentDim, color: T.accent, borderColor: T.border }}>
                      {idx + 1}
                    </div>
                    <span className="text-[15px] font-medium" style={{ color: T.textHi }}>{student.fullName || student.name || "-"}</span>
                  </div>
                  <button
                    onClick={() => { setEditingStudent(student); setSubjectIndex(0); }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    style={{
                      borderColor: T.accent,
                      background: hasMarks ? T.accent : "transparent",
                    }}>
                    {hasMarks && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "#0a1f0a" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {subjects.map((sub) => {
              const hasMarks = students.some(s => {
                const sm = getSubjectMarks(s.id, sub);
                return sm.tondiKaam > 0 || sm.chaachani > 0 || sm.sankalitLekhi > 0;
              });
              return (
                <div key={sub} className="flex items-center justify-between px-2 py-4 rounded-xl transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.card)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <span className="text-[15px] font-medium" style={{ color: T.textHi }}>{sub}</span>
                  <button
                    onClick={() => setEditingSubject(sub)}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    style={{
                      borderColor: T.accent,
                      background: hasMarks ? T.accent : "transparent",
                    }}>
                    {hasMarks && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "#0a1f0a" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
