import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Award, 
  RefreshCw, 
  Sparkles, 
  BookOpen 
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

interface CCESubjectWiseProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

const SUBJECTS = [
  { value: "marathi", label: "प्रथम भाषा : मराठी" },
  { value: "english", label: "द्वितीय भाषा : इंग्रजी" },
  { value: "maths", label: "गणित" }
];

const OUTCOMES_BY_SUBJECT = {
  marathi: [
    { id: "m1", code: "1.LO.1.1", text: "लक्षपूर्वक ऐकून समजून घेतो (Listens carefully & understands)" },
    { id: "m2", code: "1.LO.2.1", text: "स्वतःचे विचार स्पष्टपणे मांडतो (Expresses thoughts clearly)" },
    { id: "m3", code: "1.LO.3.1", text: "समजपूर्वक व योग्य गतीने वाचन करतो (Reads with comprehension)" },
    { id: "m4", code: "1.LO.4.1", text: "शुद्ध व वळणदार लेखन करतो (Writes cleanly and correctly)" },
    { id: "m5", code: "1.LO.5.1", text: "कल्पकतेने स्वतःच्या भाषेत उत्तरे लिहितो (Writes answers creatively)" }
  ],
  english: [
    { id: "e1", code: "1.LO.1.1", text: "Listens and responds to greetings and simple instructions" },
    { id: "e2", code: "1.LO.2.1", text: "Reads simple words, sight words, and short sentences" },
    { id: "e3", code: "1.LO.3.1", text: "Writes letters of the alphabet and simple words correctly" },
    { id: "e4", code: "1.LO.4.1", text: "Uses basic vocabulary in daily conversation" },
    { id: "e5", code: "1.LO.5.1", text: "Recites rhymes and poems with proper actions and rhythm" }
  ],
  maths: [
    { id: "ma1", code: "1.LO.1.1", text: "गुणधर्मानुसार वस्तू वेगवेगळ्या करतो आणि त्यामागील नियमांचे वर्णन करतो. (उदा. समान बदलांनुसार रंगाच्या वस्तू)" },
    { id: "ma2", code: "1.LO.2.1", text: "मोजण्याच्या मदतीने सोप्या आकृतिबंधातील हरवलेला घटक ओळखतो/शोधतो. (उदा. लाल-निळा, लाल-निळा...)" },
    { id: "ma3", code: "1.LO.3.1", text: "२०पेक्षा जास्त वस्तू ९९पर्यंतच्या संख्यानामांनी मोजतो आणि १०-१०च्या टप्प्याने ९९पर्यंत संख्या मोजतो." },
    { id: "ma4", code: "1.LO.3.2", text: "विशिष्ट अंकापासून पुढे व मागे अशी मोजणी करतो. (० ते ९९)" },
    { id: "ma5", code: "1.LO.3.3", text: "दोनच्या गटातील संख्या/राशी ओळखतो. (उदा. १० चे दोन गट म्हणजे २० करतो.)" },
    { id: "ma6", code: "1.LO.4.1", text: "एकाच गटातील वस्तूंची त्यांच्या विविध गुणधर्मानुसार मांडणी करतो. (उदा. आकार, माप, लांबी, वजन)" },
    { id: "ma7", code: "1.LO.4.2", text: "दिलेल्या संख्यांची चढत्या आणि उतरत्या क्रमाने मांडणी करतो. (१ ते ९)" },
    { id: "ma8", code: "1.LO.5.1", text: "वस्तू/बाबींची अनुपस्थिती दाखवण्यासाठी शून्याचे चिन्ह ओळखतो/वापरतो." },
    { id: "ma9", code: "1.LO.5.2", text: "२०पर्यंतच्या संख्या ओळखतो व लिहितो आणि ९९पर्यंत संख्यानामे लिहितो." },
    { id: "ma10", code: "1.LO.5.3", text: "२०पर्यंतच्या दोन संख्यांची तुलना करतो व त्यापेक्षा मोठा, त्यापेक्षा लहान असा शब्दसंग्रह वापरतो." }
  ]
};

export function CCESubjectWise({ selectedClass, academicYear, onBack }: CCESubjectWiseProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<"first" | "second">("first");
  
  // Accordion state: { [subjectValue]: boolean }
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    marathi: true, // Expand first by default
    english: false,
    maths: false
  });

  // Completion status: { [subject_studentId]: boolean }
  const [completedStatus, setCompletedStatus] = useState<Record<string, boolean>>({});

  // Active editor states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Graded outcomes state: { [outcomeId]: "A" | "" }
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch Students
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

  // Sync completion status for all subjects
  useEffect(() => {
    if (students.length === 0) return;

    const outcomesQuery = query(
      collection(db, "learning_outcomes"),
      where("class", "==", selectedClass),
      where("academicYear", "==", academicYear),
      where("term", "==", activeTerm)
    );

    const unsubscribe = onSnapshot(outcomesQuery, (snapshot) => {
      const status: Record<string, boolean> = {};
      
      // Initialize false for all subject-student combinations
      SUBJECTS.forEach(sub => {
        students.forEach(s => {
          status[`${sub.value}_${s.id}`] = false;
        });
      });

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.studentId && data.subject && data.outcomes) {
          const outcomeKeys = OUTCOMES_BY_SUBJECT[data.subject as keyof typeof OUTCOMES_BY_SUBJECT]?.map(o => o.id) || [];
          const isDone = outcomeKeys.length > 0 && outcomeKeys.every(k => data.outcomes[k] !== undefined && data.outcomes[k] !== "");
          status[`${data.subject}_${data.studentId}`] = isDone;
        }
      });

      setCompletedStatus(status);
    });

    return () => unsubscribe();
  }, [students, selectedClass, academicYear, activeTerm]);

  const toggleSubject = (subValue: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subValue]: !prev[subValue]
    }));
  };

  // Open detailed editor and pre-fill grades from Firestore
  const handleOpenGrader = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    
    // Initialize empty grades
    const initialGrades: Record<string, string> = {};
    const allOutcomes = [
      ...OUTCOMES_BY_SUBJECT.marathi,
      ...OUTCOMES_BY_SUBJECT.english,
      ...OUTCOMES_BY_SUBJECT.maths
    ];
    allOutcomes.forEach(o => {
      initialGrades[o.id] = "";
    });
    
    setExpandedSubjects({
      marathi: true,
      english: false,
      maths: false
    });

    try {
      const [docMar, docEng, docMat] = await Promise.all([
        getDoc(doc(db, "learning_outcomes", `${student.id}_marathi_${academicYear}_${activeTerm}`)),
        getDoc(doc(db, "learning_outcomes", `${student.id}_english_${academicYear}_${activeTerm}`)),
        getDoc(doc(db, "learning_outcomes", `${student.id}_maths_${academicYear}_${activeTerm}`))
      ]);

      if (docMar.exists()) {
        const d = docMar.data().outcomes || {};
        Object.keys(d).forEach(k => { initialGrades[k] = d[k]; });
      }
      if (docEng.exists()) {
        const d = docEng.data().outcomes || {};
        Object.keys(d).forEach(k => { initialGrades[k] = d[k]; });
      }
      if (docMat.exists()) {
        const d = docMat.data().outcomes || {};
        Object.keys(d).forEach(k => { initialGrades[k] = d[k]; });
      }
    } catch (err) {
      console.error("Error loading outcomes grades:", err);
    }
    
    setGrades(initialGrades);
    setLoading(false);
  };

  // Save all outcomes to Firestore
  const handleSaveAllOutcomes = async (silent = false) => {
    if (!selectedStudent) return false;

    setSaving(true);
    try {
      const marathiGrades: Record<string, string> = {};
      const englishGrades: Record<string, string> = {};
      const mathsGrades: Record<string, string> = {};

      OUTCOMES_BY_SUBJECT.marathi.forEach(o => { marathiGrades[o.id] = grades[o.id] || ""; });
      OUTCOMES_BY_SUBJECT.english.forEach(o => { englishGrades[o.id] = grades[o.id] || ""; });
      OUTCOMES_BY_SUBJECT.maths.forEach(o => { mathsGrades[o.id] = grades[o.id] || ""; });

      await Promise.all([
        setDoc(doc(db, "learning_outcomes", `${selectedStudent.id}_marathi_${academicYear}_${activeTerm}`), {
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          class: selectedClass,
          subject: "marathi",
          academicYear,
          term: activeTerm,
          outcomes: marathiGrades,
          updatedAt: new Date().toISOString()
        }),
        setDoc(doc(db, "learning_outcomes", `${selectedStudent.id}_english_${academicYear}_${activeTerm}`), {
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          class: selectedClass,
          subject: "english",
          academicYear,
          term: activeTerm,
          outcomes: englishGrades,
          updatedAt: new Date().toISOString()
        }),
        setDoc(doc(db, "learning_outcomes", `${selectedStudent.id}_maths_${academicYear}_${activeTerm}`), {
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          class: selectedClass,
          subject: "maths",
          academicYear,
          term: activeTerm,
          outcomes: mathsGrades,
          updatedAt: new Date().toISOString()
        })
      ]);

      if (!silent) {
        toast.success("अध्ययन निष्पत्ती श्रेणी यशस्वीरित्या जतन केली!");
      }
      return true;
    } catch (err) {
      console.error("Error saving outcomes:", err);
      toast.error("श्रेणी जतन करण्यास अपयश आले.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Next Accordion / Save flow
  const handleNextAction = async () => {
    if (expandedSubjects.marathi) {
      setExpandedSubjects({ marathi: false, english: true, maths: false });
    } else if (expandedSubjects.english) {
      setExpandedSubjects({ marathi: false, english: false, maths: true });
    } else {
      const success = await handleSaveAllOutcomes();
      if (success) {
        setSelectedStudent(null);
      }
    }
  };

  // ═════════════════════════════════════════════════
  // RENDER: DETAILED OUTCOMES EDIT PAGE (DARK THEME)
  // ═════════════════════════════════════════════════
  if (selectedStudent) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[500px]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
          <button 
            onClick={() => setSelectedStudent(null)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">अध्ययन निष्पत्तीनिहाय प्रगती</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
              {selectedStudent.fullName}
            </p>
          </div>
        </div>

        {/* Term Select */}
        <div className="flex border border-[#24352B] bg-[#16221A]/40 rounded-2xl p-1 mb-6 relative z-10 max-w-sm">
          <button
            onClick={() => {
              setActiveTerm("first");
              handleOpenGrader(selectedStudent);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTerm === "first" ? "bg-[#1E3A27] text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            प्रथम सत्र
          </button>
          <button
            onClick={() => {
              setActiveTerm("second");
              handleOpenGrader(selectedStudent);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTerm === "second" ? "bg-[#1E3A27] text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            द्वितीय सत्र
          </button>
        </div>

        {/* Accordions */}
        <div className="relative z-10 space-y-4 pb-20">
          {SUBJECTS.map((sub) => {
            const isExpanded = expandedSubjects[sub.value];
            const outcomes = OUTCOMES_BY_SUBJECT[sub.value as keyof typeof OUTCOMES_BY_SUBJECT] || [];

            return (
              <div key={sub.value} className="bg-[#16221A] border border-[#22352B] rounded-3xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSubject(sub.value)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[#1E2E23] transition-colors text-left font-black text-sm md:text-base text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-400" />
                    {sub.label}
                  </span>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#0D1612] border-t border-[#22352B]"
                    >
                      <div className="p-5 space-y-4">
                        {outcomes.map((outcome) => {
                          const isChecked = grades[outcome.id] === "A";

                          return (
                            <div
                              key={outcome.id}
                              onClick={() => {
                                setGrades(prev => ({
                                  ...prev,
                                  [outcome.id]: isChecked ? "" : "A"
                                }));
                              }}
                              className="bg-[#16221A]/40 border border-[#22352B]/40 hover:border-emerald-600/50 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-3.5">
                                <span className="px-2.5 py-1 rounded bg-[#1C2C22] border border-[#2A3F33] text-[#A3E635] text-[10px] font-black shrink-0 tracking-wider">
                                  {outcome.code}
                                </span>
                                <span className="text-xs md:text-sm font-semibold text-slate-200 leading-relaxed">
                                  {outcome.text}
                                </span>
                              </div>

                              <button
                                type="button"
                                className={`size-6 rounded-full flex items-center justify-center border-2 transition-all shrink-0 pointer-events-none ${
                                  isChecked
                                    ? "bg-emerald-600 border-emerald-500 text-white"
                                    : "border-slate-700 text-transparent"
                                }`}
                              >
                                {isChecked && <Check size={14} strokeWidth={3} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 mt-8 relative z-10 pt-4 border-t border-[#1C2C22]">
          <button 
            onClick={() => handleSaveAllOutcomes()}
            disabled={saving}
            className="flex-1 py-3.5 border border-[#24352B] bg-[#16221A] hover:bg-[#1E2F23]/80 hover:border-emerald-600 disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
          
          <button 
            onClick={handleNextAction}
            disabled={saving}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/20 cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            {saving ? "जतन होत आहे..." : (!expandedSubjects.maths ? "पुढे" : "पूर्ण करा")}
          </button>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════
  // RENDER: STUDENT CHECKLIST SCREEN (WHITE THEME)
  // ══════════════════════════════════════════════
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
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">अध्ययन निष्पत्तीनिहाय प्रगती</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Subject-Wise Learning Outcomes</p>
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

      {/* Subject Accordions */}
      <div className="relative z-10 space-y-4 pb-20">
        {SUBJECTS.map((sub) => {
          const isExpanded = expandedSubjects[sub.value];
          return (
            <div key={sub.value} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSubject(sub.value)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left font-bold text-sm md:text-base text-slate-800 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500" />
                  {sub.label}
                </span>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white border-t border-slate-200"
                  >
                    <div className="p-4 space-y-3">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-blue-500 font-bold gap-2">
                          <div className="size-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">विद्यार्थी यादी लोड होत आहे...</span>
                        </div>
                      ) : students.length === 0 ? (
                        <p className="text-center py-6 text-slate-400 italic text-xs">कोणतेही विद्यार्थी उपलब्ध नाहीत.</p>
                      ) : (
                        students.map((student, idx) => {
                          const isDone = completedStatus[`${sub.value}_${student.id}`] || false;
                          return (
                            <div
                              key={student.id}
                              onClick={() => handleOpenGrader(student)}
                              className="bg-white border border-slate-200/70 hover:border-blue-400/50 hover:bg-blue-50/10 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                  {idx + 1}
                                </div>
                                <span className="text-sm md:text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {student.fullName}
                                </span>
                              </div>

                              <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                                isDone 
                                  ? "bg-blue-600 border-blue-500 text-white shadow-sm" 
                                  : "border-slate-300 text-transparent"
                              }`}>
                                {isDone ? (
                                  <Check size={16} strokeWidth={3} />
                                ) : (
                                  <div className="size-4 rounded-full" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}
