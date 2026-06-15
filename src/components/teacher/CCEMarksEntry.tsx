import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Plus, 
  X, 
  Check, 
  BookOpen, 
  Edit3, 
  Sparkles,
  RefreshCw,
  UserCheck
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
  getDoc,
  getDocs
} from "firebase/firestore";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  class: string;
}

interface MarksData {
  akarik: number | "";
  sankalik: number | "";
  akarik_todi?: number | "";
  akarik_upakram?: number | "";
  akarik_chachani?: number | "";
  akarik_swadhyay?: number | "";
  sankalik_todi?: number | "";
  sankalik_lekhi?: number | "";
}

interface CCEMarksEntryProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

const SUBJECTS_LIST = [
  { id: "marathi", name: "मराठी (Marathi)" },
  { id: "english", name: "इंग्रजी (English)" },
  { id: "hindi", name: "हिंदी (Hindi)" },
  { id: "maths", name: "गणित (Mathematics)" },
  { id: "science", name: "विज्ञान (Science)" },
  { id: "social", name: "सामाजिक शास्त्रे (Social Sciences)" }
];

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  marathi: "प्रथम भाषा : मराठी",
  english: "द्वितीय भाषा : इंग्रजी",
  hindi: "तृतीय भाषा : हिंदी",
  maths: "गणित",
  science: "विज्ञान",
  social: "सामाजिक शास्त्रे"
};

export function CCEMarksEntry({ selectedClass, academicYear, onBack }: CCEMarksEntryProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<"first" | "second">("first");
  const [subTab, setSubTab] = useState<"student-wise" | "subject-wise">("student-wise");
  
  // Marks cache for checking entry status: { [studentId]: true/false }
  const [markedStatus, setMarkedStatus] = useState<Record<string, boolean>>({});
  
  // Student-wise entry detailed state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFormMarks, setStudentFormMarks] = useState<Record<string, MarksData>>({});
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Subject-wise entry state
  const [activeSubject, setActiveSubject] = useState("marathi");
  const [bulkMarks, setBulkMarks] = useState<Record<string, MarksData>>({});

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

  // Sync completion/marked status for student list
  useEffect(() => {
    if (students.length === 0) return;
    
    const marksQuery = query(
      collection(db, "marks"),
      where("class", "==", selectedClass),
      where("academicYear", "==", academicYear),
      where("term", "==", activeTerm)
    );
    
    const unsubscribe = onSnapshot(marksQuery, (snapshot) => {
      const status: Record<string, boolean> = {};
      students.forEach(s => {
        status[s.id] = false;
      });
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.studentId && data.subjects) {
          // Check if at least one subject marks has been entered
          const hasMarks = Object.values(data.subjects).some((m: any) => 
            m.akarik !== "" || m.sankalik !== "" || 
            m.akarik_todi !== "" || m.akarik_upakram !== "" || 
            m.akarik_chachani !== "" || m.akarik_swadhyay !== "" || 
            m.sankalik_todi !== "" || m.sankalik_lekhi !== ""
          );
          status[data.studentId] = hasMarks;
        }
      });
      
      setMarkedStatus(status);
    });
    
    return () => unsubscribe();
  }, [students, selectedClass, academicYear, activeTerm]);

  // Load single student marks for form editing
  const loadStudentMarks = async (student: Student) => {
    setSelectedStudent(student);
    setActiveSubjectIndex(0);
    
    // Initialize empty form state with detailed fields
    const initialForm: Record<string, MarksData> = {};
    SUBJECTS_LIST.forEach(sub => {
      initialForm[sub.id] = { 
        akarik: "", 
        sankalik: "",
        akarik_todi: "",
        akarik_upakram: "",
        akarik_chachani: "",
        akarik_swadhyay: "",
        sankalik_todi: "",
        sankalik_lekhi: ""
      };
    });
    
    try {
      const docRef = doc(db, "marks", `${student.id}_${academicYear}_${activeTerm}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.subjects) {
          SUBJECTS_LIST.forEach(sub => {
            if (data.subjects[sub.id]) {
              initialForm[sub.id] = {
                akarik: data.subjects[sub.id].akarik ?? "",
                sankalik: data.subjects[sub.id].sankalik ?? "",
                akarik_todi: data.subjects[sub.id].akarik_todi ?? "",
                akarik_upakram: data.subjects[sub.id].akarik_upakram ?? "",
                akarik_chachani: data.subjects[sub.id].akarik_chachani ?? "",
                akarik_swadhyay: data.subjects[sub.id].akarik_swadhyay ?? "",
                sankalik_todi: data.subjects[sub.id].sankalik_todi ?? "",
                sankalik_lekhi: data.subjects[sub.id].sankalik_lekhi ?? ""
              };
            }
          });
        }
      }
    } catch (err) {
      console.error("Error loading student marks:", err);
    }
    
    setStudentFormMarks(initialForm);
  };

  // Helper validation & input handling
  const handleInputChange = (subId: string, field: keyof MarksData, value: string) => {
    let numVal: number | "" = value === "" ? "" : Number(value);
    
    if (numVal !== "") {
      if (isNaN(numVal) || numVal < 0) return;
      
      // Enforce maximum values per field
      let maxLimit = 100;
      if (field === "akarik_todi") maxLimit = 20;
      else if (field === "akarik_upakram") maxLimit = 15;
      else if (field === "akarik_chachani") maxLimit = 20;
      else if (field === "akarik_swadhyay") maxLimit = 15;
      else if (field === "sankalik_todi") maxLimit = 10;
      else if (field === "sankalik_lekhi") maxLimit = 20;
      
      if (numVal > maxLimit) {
        numVal = maxLimit;
      }
    }
    
    setStudentFormMarks(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: numVal
      }
    }));
  };

  // Dynamic values calculation
  const getFormativeSum = (subId: string) => {
    const data = studentFormMarks[subId];
    if (!data) return 0;
    const todi = Number(data.akarik_todi) || 0;
    const upakram = Number(data.akarik_upakram) || 0;
    const chachani = Number(data.akarik_chachani) || 0;
    const swadhyay = Number(data.akarik_swadhyay) || 0;
    return todi + upakram + chachani + swadhyay;
  };

  const getSummativeSum = (subId: string) => {
    const data = studentFormMarks[subId];
    if (!data) return 0;
    const todi = Number(data.sankalik_todi) || 0;
    const lekhi = Number(data.sankalik_lekhi) || 0;
    return todi + lekhi;
  };

  // Save single student marks
  const handleSaveStudentMarks = async (e?: React.FormEvent, silent = false) => {
    if (e) e.preventDefault();
    if (!selectedStudent) return false;
    
    setSaving(true);
    try {
      // Auto-compute total akarik and sankalik values for each subject
      const updatedSubjects = { ...studentFormMarks };
      SUBJECTS_LIST.forEach(sub => {
        const subData = updatedSubjects[sub.id];
        if (subData) {
          const aSum = getFormativeSum(sub.id);
          const sSum = getSummativeSum(sub.id);
          
          const hasAnyAkarik = [
            subData.akarik_todi, 
            subData.akarik_upakram, 
            subData.akarik_chachani, 
            subData.akarik_swadhyay
          ].some(val => val !== "" && val !== undefined);

          const hasAnySankalik = [
            subData.sankalik_todi, 
            subData.sankalik_lekhi
          ].some(val => val !== "" && val !== undefined);
          
          subData.akarik = hasAnyAkarik ? aSum : "";
          subData.sankalik = hasAnySankalik ? sSum : "";
        }
      });

      const docRef = doc(db, "marks", `${selectedStudent.id}_${academicYear}_${activeTerm}`);
      await setDoc(docRef, {
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        class: selectedClass,
        academicYear,
        term: activeTerm,
        subjects: updatedSubjects,
        updatedAt: new Date().toISOString()
      });
      
      if (!silent) {
        toast.success("गुण यशस्वीरित्या जतन केले!");
      }
      return true;
    } catch (err) {
      console.error("Error saving student marks:", err);
      toast.error("गुण जतन करण्यास अपयश आले.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save and Advance
  const handleSaveAndGoNext = async () => {
    const success = await handleSaveStudentMarks(undefined, true);
    if (!success) return;
    
    if (activeSubjectIndex < SUBJECTS_LIST.length - 1) {
      // Advance to the next subject
      setActiveSubjectIndex(prev => prev + 1);
      toast.success("विषयाचे गुण जतन केले आणि पुढील विषयावर गेले!");
    } else {
      // Advance to the next student
      const currentStudentIdx = students.findIndex(s => s.id === selectedStudent?.id);
      if (currentStudentIdx !== -1 && currentStudentIdx < students.length - 1) {
        const nextStudent = students[currentStudentIdx + 1];
        toast.success(`${selectedStudent?.fullName} चे सर्व गुण जतन केले. आता ${nextStudent.fullName} चे गुण भरा.`);
        loadStudentMarks(nextStudent);
      } else {
        // Last subject of the last student
        toast.success("सर्व विद्यार्थ्यांचे गुण यशस्वीरित्या जतन झाले आहेत! ✅");
        setSelectedStudent(null);
      }
    }
  };

  // Fetch subject-wise bulk marks
  useEffect(() => {
    if (subTab !== "subject-wise" || students.length === 0) return;
    
    async function loadBulkMarks() {
      try {
        const marksQuery = query(
          collection(db, "marks"),
          where("class", "==", selectedClass),
          where("academicYear", "==", academicYear),
          where("term", "==", activeTerm)
        );
        
        const snapshot = await getDocs(marksQuery);
        const marksMap: Record<string, MarksData> = {};
        
        students.forEach(s => {
          marksMap[s.id] = { akarik: "", sankalik: "" };
        });

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.studentId && data.subjects && data.subjects[activeSubject]) {
            marksMap[data.studentId] = {
              akarik: data.subjects[activeSubject].akarik ?? "",
              sankalik: data.subjects[activeSubject].sankalik ?? ""
            };
          }
        });
        
        setBulkMarks(marksMap);
      } catch (err) {
        console.error("Error loading bulk marks:", err);
      }
    }
    loadBulkMarks();
  }, [subTab, activeSubject, students, selectedClass, academicYear, activeTerm]);

  // Save subject-wise bulk marks
  const handleSaveBulkMarks = async () => {
    setSaving(true);
    try {
      const savePromises = Object.keys(bulkMarks).map(async (studentId) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        
        const docRef = doc(db, "marks", `${studentId}_${academicYear}_${activeTerm}`);
        const docSnap = await getDoc(docRef);
        
        let existingSubjects: Record<string, MarksData> = {};
        if (docSnap.exists()) {
          existingSubjects = docSnap.data().subjects || {};
        }
        
        existingSubjects[activeSubject] = {
          ...existingSubjects[activeSubject],
          akarik: bulkMarks[studentId].akarik,
          sankalik: bulkMarks[studentId].sankalik
        };
        
        return setDoc(docRef, {
          studentId,
          studentName: student.fullName,
          class: selectedClass,
          academicYear,
          term: activeTerm,
          subjects: existingSubjects,
          updatedAt: new Date().toISOString()
        });
      });
      
      await Promise.all(savePromises);
      toast.success("सर्व विद्यार्थ्यांचे गुण यशस्वीरित्या सेव्ह केले गेले!");
    } catch (err) {
      console.error("Error saving bulk marks:", err);
      toast.error("गुण सेव्ह करण्यास अपयश आले.");
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════════════════════
  // RENDER: DETAILED STUDENT EDIT PAGE (DARK THEME)
  // ══════════════════════════════════════════════
  if (selectedStudent) {
    const activeSub = SUBJECTS_LIST[activeSubjectIndex];
    const subjectMarks = studentFormMarks[activeSub.id] || {
      akarik: "", sankalik: "", 
      akarik_todi: "", akarik_upakram: "", akarik_chachani: "", akarik_swadhyay: "",
      sankalik_todi: "", sankalik_lekhi: ""
    };
    const studentIndex = students.findIndex(s => s.id === selectedStudent.id) + 1;

    const formativeSum = getFormativeSum(activeSub.id);
    const summativeSum = getSummativeSum(activeSub.id);

    return (
      <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[500px]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
          <button 
            onClick={() => setSelectedStudent(null)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              गुण नोंदणी - {activeTerm === "first" ? "प्रथम सत्र" : "द्वितीय सत्र"}
            </h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
              CCE Student Marks Entry
            </p>
          </div>
        </div>

        {/* ── Student Information Badge ── */}
        <div className="flex items-center gap-3.5 mb-6 bg-[#16221A]/60 border border-[#22352B] p-4 rounded-2xl relative z-10">
          <div className="size-10 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[#A3E635] flex items-center justify-center font-black text-sm shadow-inner shrink-0">
            {studentIndex}
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">विद्यार्थ्यांचे नाव</span>
            <h3 className="text-base md:text-lg font-black text-white leading-tight">
              {selectedStudent.fullName}
            </h3>
          </div>
        </div>

        {/* ── Subject Pager Dropdown & Pagination Buttons ── */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10 bg-[#16221A]/30 border border-[#22352B]/40 p-3 rounded-2xl">
          {/* Custom Select Box */}
          <div className="relative">
            <select
              value={activeSubjectIndex}
              onChange={(e) => setActiveSubjectIndex(Number(e.target.value))}
              className="appearance-none bg-[#16221A] border border-[#24352B] text-emerald-400 rounded-xl pl-4 pr-10 py-2.5 text-xs font-black cursor-pointer outline-none focus:border-emerald-600 w-[220px] sm:w-[260px] tracking-wide"
            >
              {SUBJECTS_LIST.map((sub, idx) => (
                <option key={sub.id} value={idx}>
                  {SUBJECT_DISPLAY_NAMES[sub.id] || sub.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-450">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Next/Prev Page navigation controls */}
          <div className="flex items-center gap-3 bg-[#16221A] border border-[#24352B] px-3.5 py-1.5 rounded-xl shrink-0">
            <button
              onClick={() => activeSubjectIndex > 0 && setActiveSubjectIndex(prev => prev - 1)}
              disabled={activeSubjectIndex === 0}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black text-white tracking-widest min-w-[35px] text-center">
              {activeSubjectIndex + 1} / {SUBJECTS_LIST.length}
            </span>
            <button
              onClick={() => activeSubjectIndex < SUBJECTS_LIST.length - 1 && setActiveSubjectIndex(prev => prev + 1)}
              disabled={activeSubjectIndex === SUBJECTS_LIST.length - 1}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── Formative / Summative Inputs Sheet ── */}
        <div className="space-y-6 relative z-10">
          
          {/* Section 1: आकारिक मूल्यमापन */}
          <div className="bg-[#16221A]/60 border border-[#22352B] p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#22352B]/60">
              <h4 className="text-sm font-black text-emerald-400 tracking-wide">आकारिक मूल्यमापन (Formative)</h4>
              <span className="text-xs font-extrabold text-slate-400">एकूण गुण: 70</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* तोंडीकाम /20 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">तोंडीकाम</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    placeholder="0"
                    value={subjectMarks.akarik_todi ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "akarik_todi", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 20</span>
                </div>
              </div>

              {/* उपक्रम / कृती /15 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">उपक्रम / कृती</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={15}
                    placeholder="0"
                    value={subjectMarks.akarik_upakram ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "akarik_upakram", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 15</span>
                </div>
              </div>

              {/* चाचणी (लेखी) /20 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">चाचणी (लेखी)</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    placeholder="0"
                    value={subjectMarks.akarik_chachani ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "akarik_chachani", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 20</span>
                </div>
              </div>

              {/* स्वाध्याय / वर्गकार्य /15 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">स्वाध्याय / वर्गकार्य</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={15}
                    placeholder="0"
                    value={subjectMarks.akarik_swadhyay ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "akarik_swadhyay", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 15</span>
                </div>
              </div>
            </div>

            {/* Total display */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 pt-2 border-t border-[#22352B]/40">
              <span>एकूण प्राप्त गुण: <span className="text-[#A3E635] font-black text-base">{formativeSum}</span></span>
              <span>पैकी गुण: 70</span>
            </div>
          </div>

          {/* Section 2: संकलित मूल्यमापन */}
          <div className="bg-[#16221A]/60 border border-[#22352B] p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#22352B]/60">
              <h4 className="text-sm font-black text-emerald-400 tracking-wide">संकलित मूल्यमापन (Summative)</h4>
              <span className="text-xs font-extrabold text-slate-400">एकूण गुण: 30</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* तोंडी /10 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">तोंडी</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={10}
                    placeholder="0"
                    value={subjectMarks.sankalik_todi ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "sankalik_todi", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 10</span>
                </div>
              </div>

              {/* लेखी /20 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">लेखी</span>
                <div className="flex items-center bg-[#0B1510] border border-[#24352B] focus-within:border-emerald-500 rounded-xl px-4 py-3 transition-colors">
                  <input 
                    type="number"
                    min={0}
                    max={20}
                    placeholder="0"
                    value={subjectMarks.sankalik_lekhi ?? ""}
                    onChange={(e) => handleInputChange(activeSub.id, "sankalik_lekhi", e.target.value)}
                    className="bg-transparent text-left font-black text-white outline-none w-full text-sm"
                  />
                  <span className="text-xs text-slate-500 font-extrabold shrink-0">/ 20</span>
                </div>
              </div>
            </div>

            {/* Total display */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 pt-2 border-t border-[#22352B]/40">
              <span>एकूण प्राप्त गुण: <span className="text-[#A3E635] font-black text-base">{summativeSum}</span></span>
              <span>पैकी गुण: 30</span>
            </div>
          </div>

        </div>

        {/* ── Action buttons at footer ── */}
        <div className="flex items-center justify-between gap-4 mt-8 relative z-10 pt-4 border-t border-[#1C2C22]">
          <button 
            onClick={() => handleSaveStudentMarks()}
            disabled={saving}
            className="flex-1 py-3.5 border border-[#24352B] bg-[#16221A] hover:bg-[#1E2F23]/80 hover:border-emerald-600 disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
          
          <button 
            onClick={handleSaveAndGoNext}
            disabled={saving}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/20 cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            {saving ? "जतन होत आहे..." : "जतन करा & पुढे जा"}
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
        <button 
          onClick={onBack}
          className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">गुण नोंदणी</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Marks Entry Portal</p>
        </div>
      </div>

      {/* Term Selector Tabs */}
      <div className="flex border border-[#24352B] bg-[#16221A]/40 rounded-2xl p-1 mb-6 relative z-10 max-w-sm">
        <button
          onClick={() => setActiveTerm("first")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTerm === "first" ? "bg-[#1E3A27] text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          मराठी (प्रथम सत्र)
        </button>
        <button
          onClick={() => setActiveTerm("second")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTerm === "second" ? "bg-[#1E3A27] text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          द्वितीय सत्र
        </button>
      </div>

      {/* Sub tabs: Student-wise / Subject-wise */}
      <div className="flex border-b border-[#1C2C22] mb-6 relative z-10 font-bold text-sm">
        <button
          onClick={() => setSubTab("student-wise")}
          className={`pb-3 px-4 transition-all relative cursor-pointer ${
            subTab === "student-wise" ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          विद्यार्थी निहाय
          {subTab === "student-wise" && (
            <motion.div 
              layoutId="activeMarksTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" 
            />
          )}
        </button>
        <button
          onClick={() => setSubTab("subject-wise")}
          className={`pb-3 px-4 transition-all relative cursor-pointer ${
            subTab === "subject-wise" ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          विषय निहाय
          {subTab === "subject-wise" && (
            <motion.div 
              layoutId="activeMarksTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" 
            />
          )}
        </button>
      </div>

      {/* Main Workspace Panels */}
      <div className="relative z-10">
        
        {/* STUDENT WISE MARKS CHECKLIST */}
        {subTab === "student-wise" && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-emerald-500 font-bold gap-3">
                <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>विद्यार्थी यादी लोड होत आहे...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-20 text-slate-500 italic text-sm">
                या वर्गात कोणतेही विद्यार्थी उपलब्ध नाहीत.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student, index) => {
                  const isMarked = markedStatus[student.id] || false;
                  
                  return (
                    <div 
                      key={student.id}
                      onClick={() => loadStudentMarks(student)}
                      className="bg-[#16221A] border border-[#22352B] hover:border-emerald-600/50 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer hover:bg-[#1E2D23]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Number Index Badge */}
                        <div className="size-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                          {student.fullName}
                        </span>
                      </div>
                      
                      {/* Circle indicator of completeness */}
                      <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        isMarked 
                          ? "bg-emerald-600 border-emerald-500 text-white" 
                          : "border-emerald-600/60 text-transparent"
                      }`}>
                        {isMarked ? (
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
        )}

        {/* SUBJECT WISE INPUT SCREEN */}
        {subTab === "subject-wise" && (
          <div className="space-y-6">
            
            {/* Subject Selector Header */}
            <div className="space-y-1 max-w-sm bg-[#16221A] border border-[#22352B] p-4 rounded-2xl">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">विषय निवडा (Select Subject)</label>
              <select
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="w-full bg-[#0B1510] border border-[#24352B] rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-600 text-emerald-400 cursor-pointer"
              >
                {SUBJECTS_LIST.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Inline inputs for each student */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-emerald-500 font-bold gap-3">
                <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin animate-pulse" />
                <span>माहिती लोड होत आहे...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-20 text-slate-500 italic text-sm">
                या वर्गात कोणतेही विद्यार्थी उपलब्ध नाहीत.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">
                  <div className="col-span-6">विद्यार्थ्यांचे नाव (Student Name)</div>
                  <div className="col-span-3 text-center">आकारिक गुण (Formative - 50)</div>
                  <div className="col-span-3 text-center">संकलित गुण (Summative - 50)</div>
                </div>

                <div className="space-y-3">
                  {students.map((student, index) => {
                    const studentMarks = bulkMarks[student.id] || { akarik: "", sankalik: "" };
                    
                    return (
                      <div 
                        key={student.id}
                        className="bg-[#16221A] border border-[#22352B] p-4 rounded-2xl grid grid-cols-12 items-center gap-2"
                      >
                        {/* Index + Name */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="size-9 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-xs md:text-sm font-bold text-white truncate">{student.fullName}</span>
                        </div>
                        
                        {/* Akarik Score Input */}
                        <div className="col-span-3 px-2">
                          <input 
                            type="number"
                            min={0}
                            max={50}
                            placeholder="0 - 50"
                            value={studentMarks.akarik}
                            onChange={(e) => setBulkMarks(prev => ({
                              ...prev,
                              [student.id]: {
                                ...prev[student.id],
                                akarik: e.target.value === "" ? "" : Number(e.target.value)
                              }
                            }))}
                            className="w-full bg-[#0B1510] border border-[#24352B] rounded-xl px-3 py-2 text-center text-xs font-semibold outline-none focus:border-emerald-600 text-white"
                          />
                        </div>

                        {/* Sankalik Score Input */}
                        <div className="col-span-3 px-2">
                          <input 
                            type="number"
                            min={0}
                            max={50}
                            placeholder="0 - 50"
                            value={studentMarks.sankalik}
                            onChange={(e) => setBulkMarks(prev => ({
                              ...prev,
                              [student.id]: {
                                ...prev[student.id],
                                sankalik: e.target.value === "" ? "" : Number(e.target.value)
                              }
                            }))}
                            className="w-full bg-[#0B1510] border border-[#24352B] rounded-xl px-3 py-2 text-center text-xs font-semibold outline-none focus:border-emerald-600 text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bulk Save Button */}
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={handleSaveBulkMarks}
                    disabled={saving}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {saving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    गुण जतन करा (Save Changes)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
