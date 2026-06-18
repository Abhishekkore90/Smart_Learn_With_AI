import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";

interface Student { id: string; fullName?: string; name?: string; rollNo?: string; [key: string]: any; }
type Semester = "sem1" | "sem2";

// Subjects and preset remark suggestions
const REMARK_SUBJECTS = [
  {
    key: "prathambhasha",
    label: "प्रथम भाषा : मराठी",
    suggestions: [
      "स्वाध्याय अचूक सोडवितो.",
      "प्रकटवाचन प्रभावीपणे करतो.",
      "कविता चालीमध्ये म्हणतो.",
      "लक्षपूर्वक ऐकतो.",
      "स्पष्ट उच्चारात बोलतो.",
      "शब्दसंग्रह चांगला आहे.",
      "लेखन सुवाच्य आहे.",
      "व्याकरण चांगले समजते.",
    ],
  },
  {
    key: "dvitiybhasha",
    label: "द्वितीय भाषा : इंग्रजी",
    suggestions: [
      "Reads fluently.",
      "Good pronunciation.",
      "Writes neatly.",
      "Understands grammar well.",
      "Participates in conversations.",
      "Good vocabulary.",
    ],
  },
  {
    key: "ganit",
    label: "गणित",
    suggestions: [
      "गणिती क्रिया अचूक करतो.",
      "तोंडी गणित वेगाने सोडवतो.",
      "आकृत्या नीटनेटक्या काढतो.",
      "गणिताची आवड आहे.",
      "समस्या सोडवण्याची क्षमता चांगली.",
    ],
  },
  {
    key: "kala",
    label: "कला",
    suggestions: [
      "चित्रकलेत प्राविण्य आहे.",
      "रंगसंगती उत्तम वापरतो.",
      "सर्जनशीलता दाखवतो.",
      "हस्तकला कौशल्य उत्तम.",
    ],
  },
  {
    key: "karyanubhav",
    label: "कार्यानुभव",
    suggestions: [
      "हाताने काम करण्याची आवड.",
      "सहकार्याने काम करतो.",
      "प्रकल्प नीटनेटका सादर करतो.",
    ],
  },
  {
    key: "sharirik",
    label: "शारीरिक शिक्षण",
    suggestions: [
      "शारीरिक तंदुरुस्त आहे.",
      "खेळात सक्रिय सहभाग.",
      "संघ भावनेने खेळतो.",
      "क्रीडा स्पर्धेत यश मिळवतो.",
    ],
  },
  {
    key: "visheshpragati",
    label: "विशेष प्रगती",
    suggestions: [
      "सर्वांगीण विकास होत आहे.",
      "प्रगती समाधानकारक आहे.",
      "अभ्यासात सातत्य ठेवतो.",
    ],
  },
  {
    key: "aavad",
    label: "आवड / छंद",
    suggestions: [
      "वाचनाची आवड आहे.",
      "चित्रकला आवडते.",
      "गाणे म्हणण्याची आवड.",
      "खेळांमध्ये रस आहे.",
    ],
  },
  {
    key: "sudharna",
    label: "सुधारणा आवश्यक",
    suggestions: [
      "नियमित अभ्यास आवश्यक.",
      "लेखनात सुधारणा हवी.",
      "लक्ष केंद्रित करणे आवश्यक.",
      "गृहपाठ वेळेत पूर्ण करावा.",
    ],
  },
  {
    key: "vyaktimatva",
    label: "व्यक्तिमत्व गुणविशेष",
    suggestions: [
      "शिस्तप्रिय विद्यार्थी.",
      "मिलनसार स्वभाव.",
      "नेतृत्वगुण दिसतात.",
      "आत्मविश्वासपूर्ण आहे.",
      "इतरांना मदत करतो.",
    ],
  },
];

// Student remarks data structure: { [subjectKey]: string[] }
type StudentRemarks = Record<string, string[]>;

export function CCERemarks({ selectedClass, academicYear, onBack }: { selectedClass: string; academicYear: string; onBack: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSemester, setActiveSemester] = useState<Semester>("sem1");
  const [allRemarks, setAllRemarks] = useState<Record<string, StudentRemarks>>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Per-student editor state
  const [studentRemarks, setStudentRemarks] = useState<StudentRemarks>({});
  const [expandedSubject, setExpandedSubject] = useState<string | null>(REMARK_SUBJECTS[0].key);
  const [writeMode, setWriteMode] = useState<string | null>(null); // subjectKey for custom write
  const [writeText, setWriteText] = useState("");

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
        const ref = doc(db, "cce_remarks_v2", `${selectedClass}_${academicYear}_${activeSemester}`);
        const snap = await getDoc(ref);
        setAllRemarks(snap.exists() ? snap.data().records || {} : {});
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [selectedClass, academicYear, activeSemester]);

  const openStudent = async (student: Student) => {
    setEditingStudent(student);
    setStudentRemarks(allRemarks[student.id] || {});
    setExpandedSubject(REMARK_SUBJECTS[0].key);
    setWriteMode(null);
    setWriteText("");
  };

  const removeRemark = (subKey: string, text: string) => {
    setStudentRemarks(prev => ({
      ...prev,
      [subKey]: (prev[subKey] || []).filter(r => r !== text),
    }));
  };

  const addRemark = (subKey: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setStudentRemarks(prev => ({
      ...prev,
      [subKey]: [...new Set([...(prev[subKey] || []), trimmed])],
    }));
  };

  const toggleSuggestion = (subKey: string, text: string) => {
    const existing = studentRemarks[subKey] || [];
    if (existing.includes(text)) {
      removeRemark(subKey, text);
    } else {
      addRemark(subKey, text);
    }
  };

  const saveStudentRemarks = async () => {
    if (!editingStudent) return;
    setSaving(true);
    try {
      const updated = { ...allRemarks, [editingStudent.id]: studentRemarks };
      const ref = doc(db, "cce_remarks_v2", `${selectedClass}_${academicYear}_${activeSemester}`);
      await setDoc(ref, {
        class: selectedClass, academicYear, semester: activeSemester,
        records: updated, updatedAt: new Date().toISOString(),
      }, { merge: true });
      setAllRemarks(updated);
      toast.success("नोंदी जतन झाल्या!");
      setEditingStudent(null);
    } catch (err: any) {
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSaving(false);
  };

  // ── STUDENT REMARK EDITOR ──
  if (editingStudent) {
    return (
      <div
        className="text-white rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
        style={{
          fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
          background: "linear-gradient(160deg, #0d0a1e 0%, #120f2a 60%, #0f0b20 100%)",
          borderColor: "#2a2050",
          boxShadow: "0 0 60px rgba(139,92,246,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #1e1a3a" }}>
          <button
            onClick={() => setEditingStudent(null)}
            className="transition-colors cursor-pointer"
            style={{ color: "#c4b5fd" }}
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold" style={{ color: "#ede9fe" }}>वर्णनात्मक नोंदी</h2>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 py-3 space-y-1">
          {REMARK_SUBJECTS.map((sub) => {
            const remarks = studentRemarks[sub.key] || [];
            const isExpanded = expandedSubject === sub.key;

            return (
              <div key={sub.key} style={{ borderBottom: "1px solid #1e1a3a" }}>
                {/* Subject accordion header */}
                <button
                  onClick={() => { setExpandedSubject(isExpanded ? null : sub.key); setWriteMode(null); setWriteText(""); }}
                  className="w-full flex items-center justify-between py-4 px-1 cursor-pointer"
                >
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: isExpanded ? "#ede9fe" : "#a78bfa" }}
                  >
                    {sub.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {remarks.length > 0 && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "#2d1f5e", border: "1px solid #4c3a9e" }}
                      >
                        <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>
                          {remarks.length}
                        </span>
                      </div>
                    )}
                    {isExpanded
                      ? <ChevronUp className="size-4" style={{ color: "#7c6db5" }} />
                      : <ChevronDown className="size-4" style={{ color: "#7c6db5" }} />
                    }
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="pb-4 space-y-3">
                    {/* Selected remarks as chips */}
                    {remarks.map((remark) => (
                      <div
                        key={remark}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: "#1e1542", border: "1px solid #3b2f7e" }}
                      >
                        <span className="text-sm font-medium flex-1 pr-2" style={{ color: "#ede9fe" }}>
                          {remark}
                        </span>
                        <button
                          onClick={() => removeRemark(sub.key, remark)}
                          className="transition-colors cursor-pointer flex-shrink-0"
                          style={{ color: "#7c6db5" }}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}

                    {/* Write mode: custom text input */}
                    {writeMode === sub.key && (
                      <div className="space-y-2">
                        <textarea
                          value={writeText}
                          onChange={(e) => setWriteText(e.target.value)}
                          placeholder="नोंद लिहा..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium resize-none outline-none transition-all"
                          style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid #3b2f7e",
                            color: "white",
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { addRemark(sub.key, writeText); setWriteText(""); setWriteMode(null); }}
                            className="flex-1 py-2.5 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                            style={{ background: "#2d1f5e", color: "#a78bfa", border: "1px solid #4c3a9e" }}
                          >
                            जोडा
                          </button>
                          <button
                            onClick={() => { setWriteMode(null); setWriteText(""); }}
                            className="flex-1 py-2.5 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                            style={{ background: "transparent", color: "#7c6db5", border: "1px solid #2a2050" }}
                          >
                            रद्द करा
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Suggestions list */}
                    {writeMode !== sub.key && (
                      <div className="space-y-1">
                        {sub.suggestions.map((s) => {
                          const selected = (studentRemarks[sub.key] || []).includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => toggleSuggestion(sub.key, s)}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                              style={{
                                background: selected ? "#2d1f5e" : "transparent",
                                border: selected ? "1px solid #7c3aed" : "1px solid #2a2050",
                                color: selected ? "#ede9fe" : "#7c6db5",
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* निवडा / लिहा buttons */}
                    {writeMode !== sub.key && (
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setExpandedSubject(sub.key)}
                          className="flex-1 py-3 font-bold text-sm rounded-2xl cursor-pointer transition-colors"
                          style={{ background: "transparent", border: "1px solid #3b2f7e", color: "#ede9fe" }}
                        >
                          निवडा
                        </button>
                        <button
                          onClick={() => { setWriteMode(sub.key); setWriteText(""); }}
                          className="flex-1 py-3 font-bold text-sm rounded-2xl cursor-pointer transition-colors"
                          style={{ background: "transparent", border: "1px solid #3b2f7e", color: "#ede9fe" }}
                        >
                          लिहा
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fixed Save button */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3"
          style={{ background: "linear-gradient(to top, #0d0a1e, transparent)" }}
        >
          <button
            onClick={saveStudentRemarks}
            disabled={saving}
            className="w-full py-4 font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white",
              boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
            }}
          >
            {saving ? "जतन होत आहे..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div
      className="text-white rounded-[2.5rem] border shadow-2xl min-h-[600px] flex flex-col relative select-none"
      style={{
        fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
        background: "linear-gradient(160deg, #0d0a1e 0%, #120f2a 60%, #0f0b20 100%)",
        borderColor: "#2a2050",
        boxShadow: "0 0 60px rgba(139,92,246,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid #1e1a3a" }}>
        <button
          onClick={onBack}
          className="p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
          style={{ color: "white" }}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "#ede9fe" }}>
          वर्णनात्मक नोंदी
        </h2>
      </div>

      {/* Semester Tabs */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid #1e1a3a" }}>
        <div className="flex rounded-xl p-1" style={{ background: "#1a1535" }}>
          {(["sem1", "sem2"] as Semester[]).map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer"
              style={{
                background: activeSemester === sem ? "#2d1f5e" : "transparent",
                color: activeSemester === sem ? "#a78bfa" : "#7c6db5",
                boxShadow: activeSemester === sem ? "0 2px 8px rgba(139,92,246,0.2)" : "none",
              }}
            >
              {sem === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8" style={{ borderBottom: "2px solid #a78bfa" }} />
            <span className="text-xs font-bold" style={{ color: "#7c6db5" }}>लोड होत आहे...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex justify-center py-20 text-sm" style={{ color: "#7c6db5" }}>
            विद्यार्थी सापडले नाहीत
          </div>
        ) : (
          <div className="space-y-0.5">
            {students.map((student, idx) => {
              const sr = allRemarks[student.id] || {};
              const totalCount = Object.values(sr).reduce((s, arr) => s + arr.length, 0);
              return (
                <div key={student.id}
                  className="flex items-center justify-between px-2 py-3.5 rounded-xl hover:bg-[#121a12] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e4620] text-[#4ade80] font-bold text-sm flex items-center justify-center border border-[#2d4a2d]">{idx + 1}</div>
                    <span className="text-[15px] font-medium text-[#d1fae5]">{student.fullName || student.name || "-"}</span>
                  </div>
                  <button
                    onClick={() => openStudent(student)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                      totalCount > 0 ? "border-[#4ade80] bg-[#4ade80]" : "border-[#4ade80] bg-transparent hover:border-[#86efac]"
                    }`}>
                    {totalCount > 0 && (
                      <svg className="w-4 h-4 text-[#0a1f0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
