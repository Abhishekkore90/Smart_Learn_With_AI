import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  X, 
  Check, 
  Plus,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  class: string;
}

interface SubjectRemark {
  selected: string[];
  custom: string;
}

interface CCERemarksProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

const SUBJECTS_WITH_REMARKS = [
  {
    key: "marathi",
    label: "प्रथम भाषा : मराठी",
    remarks: [
      "स्वाध्याय अचूक सोडवितो.",
      "प्रकटवाचन प्रभावीपणे करतो.",
      "कविता चालीमध्ये म्हणतो.",
      "लक्षपूर्वक ऐकतो.",
      "शुद्धलेखन अचूक लिहितो.",
      "गोष्टी स्वतःच्या शब्दात सांगतो.",
      "प्रश्नांची उत्तरे अचूक देतो.",
      "सुंदर हस्ताक्षर आहे.",
      "मौखिक अभिव्यक्ती चांगली आहे.",
      "शब्दसंपत्ती चांगली आहे."
    ]
  },
  {
    key: "english",
    label: "द्वितीय भाषा : इंग्रजी",
    remarks: [
      "इंग्रजी वाचन चांगले करतो.",
      "इंग्रजी लेखन सुधारत आहे.",
      "शब्दसंग्रह चांगला आहे.",
      "व्याकरण समजते.",
      "इंग्रजी बोलण्याचा प्रयत्न करतो.",
      "स्पेलिंग अचूक लिहितो.",
      "कविता पाठ म्हणतो.",
      "लक्षपूर्वक ऐकतो.",
      "वाक्यरचना चांगली करतो.",
      "उच्चार स्पष्ट आहेत."
    ]
  },
  {
    key: "math",
    label: "गणित",
    remarks: [
      "गणिती क्रिया अचूक करतो.",
      "पाढे पाठ आहेत.",
      "सोडवलेल्या उदाहरणांची उत्तरे अचूक आहेत.",
      "गणित विषयात रस दाखवतो.",
      "शाब्दिक उदाहरणे सोडवतो.",
      "भूमिती चांगली समजते.",
      "तोंडी गणित चांगले करतो.",
      "अंकलेखन सुबक आहे.",
      "गणितीय संकल्पना समजतात.",
      "मापन व मोजमाप चांगले करतो."
    ]
  },
  {
    key: "art",
    label: "कला",
    remarks: [
      "चित्रकला छान करतो.",
      "रंगसंगती चांगली आहे.",
      "हस्तकला कौशल्य आहे.",
      "कलात्मक दृष्टी आहे.",
      "सर्जनशील विचार करतो.",
      "कलाकृती सुंदर बनवतो.",
      "संगीतात रस आहे.",
      "नाट्य अभिनयात सहभाग घेतो."
    ]
  },
  {
    key: "workExperience",
    label: "कार्यानुभव",
    remarks: [
      "स्वतःचे काम स्वतः करतो.",
      "सामूहिक कामात सहभाग घेतो.",
      "शाळा स्वच्छतेत सहभाग घेतो.",
      "कार्यानुभवात रस दाखवतो.",
      "शिस्तबद्ध काम करतो.",
      "वेळेत काम पूर्ण करतो.",
      "कृतीयुक्त शिक्षणात सहभाग.",
      "प्रकल्प व्यवस्थित पूर्ण करतो."
    ]
  },
  {
    key: "physicalEducation",
    label: "शारीरिक शिक्षण",
    remarks: [
      "खेळात उत्साहाने भाग घेतो.",
      "व्यायाम नियमित करतो.",
      "सांघिक खेळात सहभाग घेतो.",
      "शारीरिक तंदुरुस्ती चांगली आहे.",
      "खिलाडूवृत्ती दाखवतो.",
      "योगासने चांगली करतो.",
      "क्रीडा स्पर्धेत सहभाग.",
      "शारीरिक क्षमता चांगली आहे."
    ]
  },
  {
    key: "specialProgress",
    label: "विशेष प्रगती",
    remarks: [
      "सर्व विषयात उत्तम प्रगती.",
      "वाचनात विशेष प्रगती.",
      "लेखनात सुधारणा झाली.",
      "गणितात प्रगती दिसते.",
      "अभ्यासात नियमित आहे.",
      "स्पर्धेत यश मिळवले.",
      "विशेष गुणवत्ता दाखवतो.",
      "उत्कृष्ट कामगिरी."
    ]
  },
  {
    key: "hobbies",
    label: "आवड / छंद",
    remarks: [
      "वाचनाची आवड आहे.",
      "चित्रकलेची आवड आहे.",
      "खेळण्याची आवड आहे.",
      "गायनाची आवड आहे.",
      "नृत्याची आवड आहे.",
      "हस्तकलेची आवड आहे.",
      "संगणक वापरण्याची आवड.",
      "लेखनाची आवड आहे."
    ]
  },
  {
    key: "improvement",
    label: "सुधारणा आवश्यक",
    remarks: [
      "शुद्धलेखनात सुधारणा आवश्यक.",
      "गणिती क्रियांचा सराव आवश्यक.",
      "वाचनात सुधारणा आवश्यक.",
      "हस्ताक्षर सुधारणे आवश्यक.",
      "लक्ष केंद्रित करणे आवश्यक.",
      "नियमित अभ्यास आवश्यक.",
      "उपस्थिती सुधारणे आवश्यक.",
      "गृहपाठ वेळेत पूर्ण करणे आवश्यक."
    ]
  },
  {
    key: "personality",
    label: "व्यक्तिमत्व गुणविशेष",
    remarks: [
      "नेतृत्वगुण आहेत.",
      "सहकार्य करतो.",
      "विनम्र स्वभाव आहे.",
      "आत्मविश्वासी आहे.",
      "शिस्तप्रिय आहे.",
      "मदतीला तत्पर आहे.",
      "सत्यवादी आहे.",
      "जबाबदारी स्वीकारतो.",
      "सर्वांशी मिळून मिसळून राहतो.",
      "आदरशील वर्तन करतो."
    ]
  }
];

export function CCERemarks({ selectedClass, academicYear, onBack }: CCERemarksProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<"first" | "second">("first");
  const [completedStatus, setCompletedStatus] = useState<Record<string, boolean>>({});

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subjectRemarks, setSubjectRemarks] = useState<Record<string, SubjectRemark>>({});
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<Record<string, "select" | "write">>({});
  const [customInput, setCustomInput] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Fetch Students ──
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("class", "==", selectedClass)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          fullName: data.fullName || "Unnamed Student",
          class: data.class || selectedClass
        });
      });
      setStudents(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      toast.error("विद्यार्थी यादी लोड करण्यात त्रुटी आली.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClass]);

  // ── Sync Completion Status ──
  useEffect(() => {
    if (students.length === 0) return;

    const remarksQuery = query(
      collection(db, "descriptive_remarks"),
      where("class", "==", selectedClass),
      where("academicYear", "==", academicYear),
      where("term", "==", activeTerm)
    );

    const unsubscribe = onSnapshot(remarksQuery, (snapshot) => {
      const status: Record<string, boolean> = {};
      students.forEach(s => { status[s.id] = false; });

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.studentId) {
          const isDone = data.subjectRemarks
            ? Object.values(data.subjectRemarks as Record<string, SubjectRemark>).some(
                (r) => (r.selected?.length ?? 0) > 0 || (r.custom || "").trim() !== ""
              )
            : (data.specialProgress || "").trim() !== "" ||
              (data.interestsHobbies || "").trim() !== "" ||
              (data.improvementAreas || "").trim() !== "";
          status[data.studentId] = isDone;
        }
      });

      setCompletedStatus(status);
    });

    return () => unsubscribe();
  }, [students, selectedClass, academicYear, activeTerm]);

  // ── Load Remarks for Selected Student ──
  const handleEditRemarks = async (student: Student) => {
    setSelectedStudent(student);
    const initial: Record<string, SubjectRemark> = {};
    const modes: Record<string, "select" | "write"> = {};
    SUBJECTS_WITH_REMARKS.forEach(s => {
      initial[s.key] = { selected: [], custom: "" };
      modes[s.key] = "select";
    });
    setSubjectRemarks(initial);
    setInputMode(modes);
    setExpandedSubject(null);
    setCustomInput("");

    try {
      const docRef = doc(db, "descriptive_remarks", `${student.id}_${academicYear}_${activeTerm}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.subjectRemarks) {
          const loaded = data.subjectRemarks as Record<string, SubjectRemark>;
          setSubjectRemarks(prev => {
            const merged = { ...prev };
            Object.keys(loaded).forEach(key => {
              if (merged[key]) {
                merged[key] = {
                  selected: loaded[key].selected || [],
                  custom: loaded[key].custom || ""
                };
              }
            });
            return merged;
          });
        }
        // Backward compat – migrate old flat fields
        if (!data.subjectRemarks) {
          setSubjectRemarks(prev => ({
            ...prev,
            specialProgress: {
              selected: data.specialProgress ? [data.specialProgress] : [],
              custom: ""
            },
            hobbies: {
              selected: data.interestsHobbies ? [data.interestsHobbies] : [],
              custom: ""
            },
            improvement: {
              selected: data.improvementAreas ? [data.improvementAreas] : [],
              custom: ""
            },
          }));
        }
      }
    } catch (err) {
      console.error("Error loading remarks:", err);
    }
  };

  // ── Save Remarks ──
  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const docRef = doc(db, "descriptive_remarks", `${selectedStudent.id}_${academicYear}_${activeTerm}`);
      await setDoc(docRef, {
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        class: selectedClass,
        academicYear,
        term: activeTerm,
        subjectRemarks,
        // Backward compat flat fields
        specialProgress:
          subjectRemarks.specialProgress?.selected?.join(", ") ||
          subjectRemarks.specialProgress?.custom || "",
        interestsHobbies:
          subjectRemarks.hobbies?.selected?.join(", ") ||
          subjectRemarks.hobbies?.custom || "",
        improvementAreas:
          subjectRemarks.improvement?.selected?.join(", ") ||
          subjectRemarks.improvement?.custom || "",
        updatedAt: new Date().toISOString()
      });
      toast.success("वर्णनात्मक नोंदी यशस्वीरित्या जतन केल्या!");
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error saving remarks:", err);
      toast.error("नोंदी जतन करण्यास अपयश आले.");
    } finally {
      setSaving(false);
    }
  };

  // ── Remark Helpers ──
  const toggleRemark = (subjectKey: string, remark: string) => {
    setSubjectRemarks(prev => {
      const current = prev[subjectKey] || { selected: [], custom: "" };
      const isSelected = current.selected.includes(remark);
      return {
        ...prev,
        [subjectKey]: {
          ...current,
          selected: isSelected
            ? current.selected.filter(r => r !== remark)
            : [...current.selected, remark]
        }
      };
    });
  };

  const removeRemark = (subjectKey: string, remark: string) => {
    setSubjectRemarks(prev => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        selected: prev[subjectKey].selected.filter(r => r !== remark)
      }
    }));
  };

  const addCustomRemark = (subjectKey: string) => {
    if (!customInput.trim()) return;
    setSubjectRemarks(prev => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        selected: [...prev[subjectKey].selected, customInput.trim()]
      }
    }));
    setCustomInput("");
  };

  // ═══════════════════════════════════════════
  //  RENDER: SUBJECT-WISE REMARKS FORM (DARK)
  // ═══════════════════════════════════════════
  if (selectedStudent) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden">

        {/* ── Header ── */}
        <div className="sticky top-0 z-20 bg-[#0B1510]/95 backdrop-blur-md px-4 sm:px-6 pt-5 pb-4 border-b border-[#1C2C22]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-emerald-400 hover:text-emerald-300 p-2 rounded-xl bg-[#16221A] border border-[#24352B] cursor-pointer transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white tracking-tight">वर्णनात्मक नोंदी</h2>
              <p className="text-[10px] text-emerald-500 font-bold truncate">
                {selectedStudent.fullName} &bull; {activeTerm === "first" ? "प्रथम सत्र" : "द्वितीय सत्र"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Subject Accordions ── */}
        <div className="px-2 sm:px-3 py-4 space-y-0.5">
          {SUBJECTS_WITH_REMARKS.map((subject) => {
            const remarks = subjectRemarks[subject.key] || { selected: [], custom: "" };
            const count = remarks.selected.length;
            const isExpanded = expandedSubject === subject.key;
            const mode = inputMode[subject.key] || "select";

            return (
              <div key={subject.key} className="rounded-2xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => {
                    setExpandedSubject(isExpanded ? null : subject.key);
                    setCustomInput("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 transition-colors cursor-pointer ${
                    isExpanded ? "bg-[#16221A]" : "hover:bg-[#16221A]/60"
                  }`}
                >
                  <span className="text-sm font-bold text-white text-left">{subject.label}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`size-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                        count > 0
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
                          : "bg-[#1C2C22] text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-emerald-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 pt-1 space-y-3 bg-[#16221A]/40">
                        {/* ── Selected chips ── */}
                        {remarks.selected.length > 0 && (
                          <div className="space-y-2">
                            {remarks.selected.map((r, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-[#16221A] border border-[#24352B] rounded-xl px-4 py-3"
                              >
                                <span className="text-xs text-emerald-200 font-medium leading-relaxed pr-3">
                                  {r}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeRemark(subject.key, r); }}
                                  className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors shrink-0"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── Mode Toggle: निवडा / लिहा ── */}
                        <div className="flex border border-[#24352B] bg-[#0D1A12] rounded-xl overflow-hidden">
                          <button
                            onClick={() => setInputMode(p => ({ ...p, [subject.key]: "select" }))}
                            className={`flex-1 py-2.5 text-xs font-bold cursor-pointer transition-all ${
                              mode === "select"
                                ? "bg-[#1C2C22] text-emerald-400 shadow-inner"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            निवडा
                          </button>
                          <button
                            onClick={() => setInputMode(p => ({ ...p, [subject.key]: "write" }))}
                            className={`flex-1 py-2.5 text-xs font-bold cursor-pointer transition-all ${
                              mode === "write"
                                ? "bg-[#1C2C22] text-emerald-400 shadow-inner"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            लिहा
                          </button>
                        </div>

                        {/* ── Select mode: predefined remarks ── */}
                        {mode === "select" && (
                          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "#24352B transparent" }}
                          >
                            {subject.remarks
                              .filter(r => !remarks.selected.includes(r))
                              .map((r, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => toggleRemark(subject.key, r)}
                                  className="w-full text-left bg-[#0D1A12] hover:bg-[#1E2E24] border border-[#1C2C22] hover:border-emerald-700/40 rounded-xl px-4 py-3 text-xs text-slate-300 hover:text-emerald-200 font-medium cursor-pointer transition-all"
                                >
                                  {r}
                                </button>
                              ))}
                            {subject.remarks.filter(r => !remarks.selected.includes(r)).length === 0 && (
                              <p className="text-center text-slate-600 text-[11px] py-3 italic">
                                सर्व नोंदी निवडल्या आहेत
                              </p>
                            )}
                          </div>
                        )}

                        {/* ── Write mode: custom input ── */}
                        {mode === "write" && (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              placeholder="तुमची नोंद येथे लिहा..."
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              className="w-full bg-[#0D1A12] border border-[#24352B] rounded-xl px-4 py-3 text-xs text-white font-medium outline-none focus:border-emerald-600 transition-colors resize-none placeholder-slate-600"
                            />
                            <button
                              onClick={() => addCustomRemark(subject.key)}
                              disabled={!customInput.trim()}
                              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-emerald-200 cursor-pointer transition-all flex items-center justify-center gap-2"
                            >
                              <Plus size={14} />
                              नोंद जोडा
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Save Button ── */}
        <div className="sticky bottom-0 bg-[#0B1510]/95 backdrop-blur-md px-4 sm:px-6 pb-5 pt-3 border-t border-[#1C2C22]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#1A2E20] hover:bg-[#223D2A] disabled:opacity-50 border border-[#24352B] rounded-2xl text-sm font-bold text-emerald-400 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : null}
            Save
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  RENDER: STUDENT LIST
  // ═══════════════════════════════════════════
  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 relative z-10">
        <button
          onClick={onBack}
          className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">वर्णनात्मक नोंदी</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Descriptive Remarks</p>
        </div>
      </div>

      {/* Term Selector Tabs */}
      <div className="flex border border-slate-200 bg-slate-50/50 rounded-2xl p-1 mb-6 relative z-10 max-w-sm">
        <button
          onClick={() => setActiveTerm("first")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTerm === "first" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          प्रथम सत्र
        </button>
        <button
          onClick={() => setActiveTerm("second")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTerm === "second" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          द्वितीय सत्र
        </button>
      </div>

      {/* Student List */}
      <div className="relative z-10 space-y-3 min-h-[300px] pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-blue-500 font-bold gap-3">
            <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>विद्यार्थी यादी लोड होत आहे...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic text-sm bg-slate-50/50 rounded-2xl border border-slate-200/50">
            या वर्गात कोणतेही विद्यार्थी उपलब्ध नाहीत.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => {
              const isCompleted = completedStatus[student.id] || false;

              return (
                <div
                  key={student.id}
                  onClick={() => handleEditRemarks(student)}
                  className="bg-white border border-slate-200/70 hover:border-blue-400/50 hover:bg-blue-50/10 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm md:text-base font-bold text-slate-800 tracking-wide group-hover:text-blue-600 transition-colors">
                      {student.fullName}
                    </span>
                  </div>

                  <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                    isCompleted
                      ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                      : "border-slate-300 text-transparent"
                  }`}>
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <div className="size-4 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
