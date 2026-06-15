import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Printer, 
  Search,
  BookOpen,
  Award,
  Users,
  Grid,
  List,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  class: string;
  gender?: string;
  usid?: string;
  rollNo?: number;
  division?: string;
}

interface SubjectMarks {
  akarik: number | "";
  sankalik: number | "";
}

interface StudentMarksDoc {
  studentId: string;
  studentName: string;
  class: string;
  academicYear: string;
  term: "first" | "second";
  subjects: Record<string, SubjectMarks>;
}

interface CCEOverallResultProps {
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
  { id: "social", name: "सामाजिक शास्त्रे (Social)" }
];

export function CCEOverallResult({ selectedClass, academicYear, onBack }: CCEOverallResultProps) {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [marksDocs, setMarksDocs] = useState<StudentMarksDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<"first" | "second">("first");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Layout view mode: 'table' (grid) or 'list' (cards)
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Firestore Sync - Students list
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
          class: data.class || selectedClass,
          gender: data.gender || "",
          usid: data.usid || "",
          rollNo: data.rollNo || undefined,
          division: data.division || "A"
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

  // Firestore Sync - Marks
  useEffect(() => {
    const q = query(
      collection(db, "marks"),
      where("class", "==", selectedClass),
      where("academicYear", "==", academicYear),
      where("term", "==", activeTerm)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: StudentMarksDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as StudentMarksDoc;
        docs.push(data);
      });
      setMarksDocs(docs);
    }, (error) => {
      console.error("Error fetching marks:", error);
    });

    return () => unsubscribe();
  }, [selectedClass, academicYear, activeTerm]);

  // Auto-detect mobile screen to switch view mode default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("list");
      } else {
        setViewMode("table");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const divisions = ["All", ...Array.from(new Set(students.map(s => s.division || "A"))).sort()];

  // Grade Computation Logic
  const getGrade = (total: number) => {
    if (total >= 91) return "A1";
    if (total >= 81) return "A2";
    if (total >= 71) return "B1";
    if (total >= 61) return "B2";
    if (total >= 51) return "C1";
    if (total >= 41) return "C2";
    if (total >= 33) return "D1";
    if (total >= 21) return "D2";
    return "Ab";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A1": return "text-emerald-400";
      case "A2": return "text-emerald-500";
      case "B1": return "text-teal-400";
      case "B2": return "text-teal-500";
      case "C1": return "text-yellow-400";
      case "C2": return "text-yellow-500";
      case "D1": return "text-orange-400";
      case "D2": return "text-orange-500";
      default: return "text-rose-500";
    }
  };

  // Find marks document for a student
  const getStudentMarks = (studentId: string) => {
    return marksDocs.find(doc => doc.studentId === studentId)?.subjects || {};
  };

  // Filter students by division and search text
  const filteredStudents = students
    .filter(s => {
      const matchesDiv = selectedDivision === "All" || s.division === selectedDivision;
      const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDiv && matchesSearch;
    })
    .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));

  // Trigger Print View
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const schoolName = profile?.schoolName || "जिल्हा परिषद शाळा";
    const academicYearStr = academicYear;
    const termLabel = activeTerm === "first" ? "प्रथम सत्र (First Term)" : "द्वितीय सत्र (Second Term)";

    let tableRowsHTML = filteredStudents.map((s, index) => {
      const marks = getStudentMarks(s.id);
      
      const subjectCols = SUBJECTS_LIST.map(sub => {
        const subMarks = marks[sub.id] || { akarik: "", sankalik: "" };
        const akarik = subMarks.akarik !== "" ? Number(subMarks.akarik) : 0;
        const sanklik = subMarks.sankalik !== "" ? Number(subMarks.sankalik) : 0;
        const total = akarik + sanklik;
        const grade = getGrade(total);
        return `
          <td>${subMarks.akarik !== "" ? subMarks.akarik : "-"}</td>
          <td>${subMarks.sankalik !== "" ? subMarks.sankalik : "-"}</td>
          <td style="font-weight: bold">${total > 0 ? total : "-"}</td>
          <td>${total > 0 ? grade : "-"}</td>
        `;
      }).join("");

      return `
        <tr>
          <td>${s.rollNo || index + 1}</td>
          <td style="text-align: left">${s.fullName}</td>
          <td>${s.division || "A"}</td>
          ${subjectCols}
        </tr>
      `;
    }).join("");

    const subjectHeadersHTML = SUBJECTS_LIST.map(sub => `
      <th colspan="4">${sub.name}</th>
    `).join("");

    const subjectSubheadersHTML = SUBJECTS_LIST.map(() => `
      <th>आकारिक</th>
      <th>संकलित</th>
      <th>एकूण</th>
      <th>श्रेणी</th>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>एकत्रित निकाल पत्रक - ${selectedClass}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 8mm; }
            }
            body { font-family: 'Noto Sans', Arial, sans-serif; font-size: 10px; margin: 0; padding: 10px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { font-size: 18px; margin: 0 0 5px 0; }
            .header h2 { font-size: 13px; margin: 0; color: #555; }
            table { width: 100%; border-collapse: collapse; text-align: center; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 4px 2px; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${schoolName}</h1>
            <h2>एकत्रित निकाल पत्रक - वर्ग: ${selectedClass} | शैक्षणिक वर्ष: ${academicYearStr} | सत्र: ${termLabel}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th rowspan="2" style="width: 40px">ह.क्र.</th>
                <th rowspan="2" style="min-width: 150px">विद्यार्थ्याचे नाव</th>
                <th rowspan="2" style="width: 40px">तुकडी</th>
                ${subjectHeadersHTML}
              </tr>
              <tr>
                ${subjectSubheadersHTML}
              </tr>
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full max-w-[1250px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[600px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm animate-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">एकत्रित निकाल पत्रक</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Overall Student Performance Sheet</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#132A1C] hover:bg-[#1E432D] border border-emerald-800/60 hover:border-emerald-600 text-emerald-400 hover:text-white rounded-2xl text-xs font-black tracking-wide transition-all shadow-md cursor-pointer shrink-0"
        >
          <Printer size={16} />
          प्रिंट (Print)
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
        {/* Term Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">सत्र निवडा (Term)</label>
          <div className="flex bg-[#16221A] border border-[#24352B] rounded-xl p-1">
            <button 
              onClick={() => setActiveTerm("first")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                activeTerm === "first" ? "bg-[#1E3A27] text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
            >
              प्रथम सत्र
            </button>
            <button 
              onClick={() => setActiveTerm("second")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                activeTerm === "second" ? "bg-[#1E3A27] text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
            >
              द्वितीय सत्र
            </button>
          </div>
        </div>

        {/* Division Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">तुकडी (Division)</label>
          <select 
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-[#16221A] border border-[#24352B] text-emerald-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-emerald-600 w-full"
          >
            {divisions.map(div => (
              <option key={div} value={div}>{div === "All" ? "सर्व तुकड्या (All)" : `${div} तुकडी`}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">विद्यार्थी शोधा (Search Student)</label>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="विद्यार्थ्याचे नाव प्रविष्ट करा..."
              className="w-full bg-[#16221A] border border-[#24352B] focus:border-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none text-white transition-colors placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle (For Tablet/Responsive override) */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase">
          विद्यार्थी संख्या: <span className="text-white font-black">{filteredStudents.length}</span>
        </span>
        <div className="flex items-center border border-[#24352B] bg-[#16221A] rounded-xl p-0.5 shrink-0">
          <button 
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "table" ? "bg-[#1E3A27] text-emerald-400" : "text-slate-400 hover:text-white"}`}
            title="Table View"
          >
            <Grid size={14} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#1E3A27] text-emerald-400" : "text-slate-400 hover:text-white"}`}
            title="Card List View"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* main data area */}
      <div className="relative z-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-500 font-bold gap-3">
            <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>निकाल पत्रक लोड होत आहे...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-24 bg-[#16221A] border border-[#1C2C22] rounded-[2rem] text-slate-550 italic text-sm">
            कोणतेही विद्यार्थी आढळले नाहीत.
          </div>
        ) : viewMode === "table" ? (
          
          /* DESKTOP STICKY TABLE VIEW */
          <div className="w-full overflow-x-auto rounded-[2rem] border border-[#1C2C22] bg-[#0A110D] shadow-inner">
            <table className="w-full border-collapse text-center text-xs text-[#E2E8F0]">
              <thead className="bg-[#132319] border-b border-[#1C2C22]">
                {/* Level 1: Subjects */}
                <tr>
                  <th rowSpan={2} className="p-3 border-r border-[#1C2C22] text-[10px] font-black text-slate-400 uppercase tracking-wider sticky left-0 bg-[#132319] z-20 min-w-[50px]">ह.क्र.</th>
                  <th rowSpan={2} className="p-3 border-r border-[#1C2C22] text-[10px] font-black text-slate-400 uppercase tracking-wider sticky left-[50px] bg-[#132319] z-20 min-w-[150px] text-left">विद्यार्थ्याचे नाव</th>
                  <th rowSpan={2} className="p-3 border-r border-[#1C2C22] text-[10px] font-black text-slate-400 uppercase tracking-wider min-w-[60px]">तुकडी</th>
                  {SUBJECTS_LIST.map(sub => (
                    <th key={sub.id} colSpan={4} className="p-3 border-r border-[#1C2C22] text-[10px] font-extrabold text-emerald-400 tracking-wider">
                      {sub.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
                {/* Level 2: Sub-headers */}
                <tr className="border-b border-[#1C2C22]">
                  {SUBJECTS_LIST.map((sub, sIdx) => (
                    <React.Fragment key={`${sub.id}-sub`}>
                      <th className="p-2 border-r border-[#1C2C22]/65 text-[9px] font-bold text-slate-400 bg-[#111E16]">आका.</th>
                      <th className="p-2 border-r border-[#1C2C22]/65 text-[9px] font-bold text-slate-400 bg-[#111E16]">संक.</th>
                      <th className="p-2 border-r border-[#1C2C22]/65 text-[9px] font-bold text-emerald-500 bg-[#111E16]">एकूण</th>
                      <th className="p-2 border-r border-[#1C2C22] text-[9px] font-bold text-slate-400 bg-[#111E16]">श्रेणी</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2C22]/70">
                {filteredStudents.map((s, index) => {
                  const marks = getStudentMarks(s.id);
                  
                  return (
                    <tr key={s.id} className="hover:bg-[#16221A] transition-colors">
                      <td className="p-2.5 border-r border-[#1C2C22] font-semibold sticky left-0 bg-[#0A110D] z-10">{s.rollNo || index + 1}</td>
                      <td className="p-2.5 border-r border-[#1C2C22] font-bold text-white text-left sticky left-[50px] bg-[#0A110D] z-10 truncate max-w-[180px]">{s.fullName}</td>
                      <td className="p-2.5 border-r border-[#1C2C22] font-semibold text-slate-400">{s.division || "A"}</td>
                      {SUBJECTS_LIST.map((sub, sIdx) => {
                        const subMarks = marks[sub.id] || { akarik: "", sankalik: "" };
                        const akarik = subMarks.akarik !== "" ? Number(subMarks.akarik) : 0;
                        const sanklik = subMarks.sankalik !== "" ? Number(subMarks.sankalik) : 0;
                        const total = akarik + sanklik;
                        const grade = getGrade(total);
                        const hasAny = subMarks.akarik !== "" || subMarks.sankalik !== "";

                        return (
                          <React.Fragment key={`${s.id}-${sub.id}`}>
                            <td className="p-2.5 border-r border-[#1C2C22]/50 text-slate-300">
                              {subMarks.akarik !== "" ? subMarks.akarik : "-"}
                            </td>
                            <td className="p-2.5 border-r border-[#1C2C22]/50 text-slate-300">
                              {subMarks.sankalik !== "" ? subMarks.sankalik : "-"}
                            </td>
                            <td className="p-2.5 border-r border-[#1C2C22]/50 font-black text-[#A3E635]">
                              {hasAny ? total : "-"}
                            </td>
                            <td className="p-2.5 border-r border-[#1C2C22] font-extrabold">
                              <span className={hasAny ? getGradeColor(grade) : "text-slate-600"}>
                                {hasAny ? grade : "-"}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          
          /* MOBILE RESPONSIVE CARDS VIEW */
          <div className="space-y-4">
            {filteredStudents.map((s, index) => {
              const marks = getStudentMarks(s.id);
              const isExpanded = expandedStudentId === s.id;
              
              // Calculate summary stats
              let totalS = 0;
              let subjectCount = 0;
              SUBJECTS_LIST.forEach(sub => {
                const subMarks = marks[sub.id];
                if (subMarks && (subMarks.akarik !== "" || subMarks.sankalik !== "")) {
                  totalS += (Number(subMarks.akarik) || 0) + (Number(subMarks.sankalik) || 0);
                  subjectCount++;
                }
              });
              const avgScore = subjectCount > 0 ? Math.round(totalS / subjectCount) : 0;
              const overallGrade = subjectCount > 0 ? getGrade(avgScore) : "-";

              return (
                <div 
                  key={s.id}
                  className="bg-[#16221A] border border-[#22352B] rounded-3xl p-4 transition-all"
                >
                  {/* Card Header clickable to expand details */}
                  <div 
                    onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-9 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-xs shadow-inner">
                        {s.rollNo || index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-white">{s.fullName}</span>
                        <span className="text-[10px] text-slate-450 font-bold mt-0.5">तुकडी: {s.division || "A"} | निकाल</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {subjectCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-[#0B1510] border border-[#24352B] px-3 py-1 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase">सरासरी:</span>
                          <span className={`text-xs font-black ${getGradeColor(overallGrade)}`}>{overallGrade}</span>
                        </div>
                      )}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded subject wise cards detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-[#1C2C22] space-y-2.5"
                      >
                        <div className="grid grid-cols-12 gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 px-2 pb-1">
                          <div className="col-span-5">विषय</div>
                          <div className="col-span-2 text-center">आका.</div>
                          <div className="col-span-2 text-center">संक.</div>
                          <div className="col-span-3 text-right">एकूण/श्रेणी</div>
                        </div>

                        {SUBJECTS_LIST.map(sub => {
                          const subMarks = marks[sub.id] || { akarik: "", sankalik: "" };
                          const akarik = subMarks.akarik !== "" ? Number(subMarks.akarik) : 0;
                          const sanklik = subMarks.sankalik !== "" ? Number(subMarks.sankalik) : 0;
                          const total = akarik + sanklik;
                          const grade = getGrade(total);
                          const hasAny = subMarks.akarik !== "" || subMarks.sankalik !== "";

                          return (
                            <div 
                              key={sub.id} 
                              className="grid grid-cols-12 items-center gap-1.5 bg-[#0B1510]/50 border border-[#1C2C22]/40 p-2.5 rounded-2xl text-[11px]"
                            >
                              <div className="col-span-5 font-bold text-white truncate flex items-center gap-1.5">
                                <BookOpen size={12} className="text-emerald-500" />
                                {sub.name.split(" ")[0]}
                              </div>
                              <div className="col-span-2 text-center text-slate-350">
                                {subMarks.akarik !== "" ? subMarks.akarik : "-"}
                              </div>
                              <div className="col-span-2 text-center text-slate-350">
                                {subMarks.sankalik !== "" ? subMarks.sankalik : "-"}
                              </div>
                              <div className="col-span-3 text-right font-black text-[#A3E635] flex items-center justify-end gap-1.5">
                                <span>{hasAny ? total : "-"}</span>
                                {hasAny && (
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded bg-[#16221A] border border-[#22352B] ${getGradeColor(grade)}`}>
                                    {grade}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
