import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Student { id: string; fullName?: string; name?: string; rollNo?: string; [key: string]: any; }

const EXAMS = ["test1", "test2", "semester1", "test3", "test4", "semester2"];
const EXAM_LABELS: Record<string, string> = {
  test1: "चाचणी १", test2: "चाचणी २", semester1: "सत्र १",
  test3: "चाचणी ३", test4: "चाचणी ४", semester2: "सत्र २",
};

const calculateGrade = (marks: number): string => {
  if (marks >= 91) return "A1";
  if (marks >= 81) return "A2";
  if (marks >= 71) return "B1";
  if (marks >= 61) return "B2";
  if (marks >= 51) return "C1";
  if (marks >= 41) return "C2";
  if (marks >= 33) return "D";
  return "E";
};

const gradeColor = (grade: string) => {
  if (grade.startsWith("A")) return { color: "#34d399", background: "#052e16" };
  if (grade.startsWith("B")) return { color: "#60a5fa", background: "#0e2a54" };
  if (grade.startsWith("C")) return { color: "#fbbf24", background: "#3d2c00" };
  if (grade.startsWith("D")) return { color: "#fb923c", background: "#3d1a00" };
  return { color: "#f87171", background: "#3d0a0a" };
};

// Blue theme tokens
const T = {
  bg:       "linear-gradient(160deg, #040d1f 0%, #071428 60%, #050f1c 100%)",
  border:   "#0e2044",
  divider:  "#0a1a38",
  cardBg:   "#0e2a54",
  cardBdr:  "#1a4282",
  accent:   "#60a5fa",
  accentDk: "#1d4ed8",
  text:     "#e0f2fe",
  muted:    "#4a7ab8",
  hoverBg:  "#071c40",
  numBg:    "#0e2a54",
  shadow:   "0 0 60px rgba(59,130,246,0.1)",
};

export function CCEOverallResult({ selectedClass, academicYear, onBack }: { selectedClass: string; academicYear: string; onBack: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMarks, setAllMarks] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"), where("class", "==", selectedClass));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(data.sort((a, b) => parseInt(a.rollNo || "999") - parseInt(b.rollNo || "999")));
    });
    return () => unsub();
  }, [selectedClass]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const result: Record<string, Record<string, Record<string, number>>> = {};
      for (const examKey of EXAMS) {
        try {
          const ref = doc(db, "cce_marks", `${selectedClass}_${academicYear}_${examKey}`);
          const snap = await getDoc(ref);
          result[examKey] = snap.exists() ? (snap.data().records || {}) : {};
        } catch { result[examKey] = {}; }
      }
      setAllMarks(result);
      setLoading(false);
    };
    loadAll();
  }, [selectedClass, academicYear]);

  const getStudentOverall = (studentId: string) => {
    let total = 0, count = 0;
    for (const examKey of EXAMS) {
      const rec = allMarks[examKey]?.[studentId] || {};
      const vals = Object.values(rec).filter((v): v is number => typeof v === "number" && v > 0);
      if (vals.length > 0) {
        total += vals.reduce((s, v) => s + v, 0) / vals.length;
        count++;
      }
    }
    return count > 0 ? Math.round(total / count) : 0;
  };

  const containerStyle = {
    fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
    background: T.bg,
    borderColor: T.border,
    boxShadow: T.shadow,
  };

  // ── STUDENT DETAIL VIEW ──
  if (selectedStudentId) {
    const student = students.find(s => s.id === selectedStudentId);
    const overall = getStudentOverall(selectedStudentId);
    const overallGrade = calculateGrade(overall);
    const overallGC = gradeColor(overallGrade);

    return (
      <div
        className="text-white rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col"
        style={containerStyle}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.divider}` }}>
          <button
            onClick={() => setSelectedStudentId(null)}
            className="p-1.5 rounded-full transition-colors cursor-pointer"
            style={{ color: T.text }}
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: T.text }}>
            {student?.fullName || student?.name || "-"}
          </h2>
        </div>

        {/* Exam-wise marks */}
        <div className="flex-1 px-4 py-3 space-y-1">
          {EXAMS.map(examKey => {
            const rec = allMarks[examKey]?.[selectedStudentId] || {};
            const vals = Object.values(rec).filter((v): v is number => typeof v === "number" && v > 0);
            const avg = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
            const grade = calculateGrade(avg);
            const gc = gradeColor(grade);
            return (
              <div
                key={examKey}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors"
                style={{ cursor: "default" }}
              >
                <span className="text-[15px] font-medium" style={{ color: T.text }}>
                  {EXAM_LABELS[examKey]}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: T.muted }}>
                    {avg > 0 ? `${avg}%` : "—"}
                  </span>
                  {avg > 0 && (
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ color: gc.color, background: gc.background }}
                    >
                      {grade}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Overall summary card */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-center justify-between"
            style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}` }}
          >
            <span className="font-bold" style={{ color: T.text }}>एकत्रित सरासरी</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold" style={{ color: T.accent }}>{overall}%</span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ color: overallGC.color, background: overallGC.background }}
              >
                {overallGrade}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LIST VIEW ──
  return (
    <div
      className="text-white rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative"
      style={containerStyle}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.divider}` }}>
        <button
          onClick={onBack}
          className="p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
          style={{ color: T.text }}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: T.text }}>
          एकत्रित निकाल
        </h2>
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="animate-spin rounded-full h-8 w-8"
              style={{ borderBottom: `2px solid ${T.accent}` }}
            />
            <span className="text-xs font-bold" style={{ color: T.muted }}>लोड होत आहे...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm" style={{ color: T.muted }}>विद्यार्थी सापडले नाहीत</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {students.map((student, idx) => {
              const overall = getStudentOverall(student.id);
              const grade = calculateGrade(overall);
              const gc = gradeColor(grade);

              // Progress bar width
              const barWidth = overall > 0 ? `${overall}%` : "0%";

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className="px-3 py-3.5 rounded-xl transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${T.divider}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: T.numBg, color: T.accent, border: `1px solid ${T.cardBdr}` }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-[15px] font-medium" style={{ color: T.text }}>
                          {student.fullName || student.name || "-"}
                        </p>
                        {overall > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                            सरासरी: {overall}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {overall > 0 && (
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ color: gc.color, background: gc.background }}
                        >
                          {grade}
                        </span>
                      )}
                      <ChevronRight className="size-4" style={{ color: T.muted }} />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {overall > 0 && (
                    <div
                      className="h-1 rounded-full ml-12 overflow-hidden"
                      style={{ background: "#0a1a38" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: barWidth,
                          background: `linear-gradient(90deg, ${T.accentDk}, ${T.accent})`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
