import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  FileSpreadsheet, 
  Layers, 
  Award,
  ClipboardList
} from "lucide-react";
// @ts-ignore
import DailyRegister from "@/result/DailyRegister";
// @ts-ignore
import SubjectWiseResult from "@/result/SubjectWiseResult";
// @ts-ignore
import ProgressSheet from "@/result/ProgressSheet";
// @ts-ignore
import GradeWise from "@/result/GradeWise";
// @ts-ignore
import StudentProgresswithout from "@/result/StudentProgresswithout";

interface CCEPdfCreationProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

export function CCEPdfCreation({ selectedClass, academicYear, onBack }: CCEPdfCreationProps) {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reportOptions = [
    {
      id: "daily-register",
      title: "मूल्यांकन नोंदवही",
      subtitle: "Evaluation Register (Daily Sheets)",
      icon: <FileSpreadsheet className="size-5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      id: "subject-wise",
      title: "अध्ययन निष्पत्तीनिहाय संपादणूक प्रगतीदर्शक नोंदतक्ता (विद्यार्थीनिहाय)",
      subtitle: "Learning Outcomes Achievement Register (Student-wise)",
      icon: <ClipboardList className="size-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-100"
    },
    {
      id: "progress-sheet",
      title: "प्रगती पत्रक",
      subtitle: "Report Card / Progress Sheet",
      icon: <FileText className="size-5 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      id: "grade-wise",
      title: "वार्षिक निकाल पत्रक",
      subtitle: "Annual Result Card",
      icon: <Award className="size-5 text-purple-600" />,
      color: "bg-purple-50 border-purple-100"
    },
    {
      id: "student-progress",
      title: "श्रेणीनिहाय-निकाल-संकलन-प्रपत्र",
      subtitle: "Grade-wise Result Compilation Form",
      icon: <Layers className="size-5 text-rose-600" />,
      color: "bg-rose-50 border-rose-100"
    }
  ];

  if (activeReport) {
    return (
      <div className="w-full max-w-[1400px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200">
        {/* Sub-View Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <button 
            onClick={() => setActiveReport(null)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer"
          >
            ← मागे जा (Back to PDF List)
          </button>
          <span className="text-xs font-bold text-slate-400">वर्ग: {selectedClass} | सत्र: {academicYear}</span>
        </div>

        {/* Report Component Mount */}
        <div className="overflow-x-auto p-2">
          {activeReport === "daily-register" && (
            <DailyRegister initialClass={selectedClass} initialYear={academicYear} />
          )}
          {activeReport === "subject-wise" && (
            <SubjectWiseResult initialClass={selectedClass} initialYear={academicYear} />
          )}
          {activeReport === "progress-sheet" && (
            <ProgressSheet initialClass={selectedClass} initialYear={academicYear} />
          )}
          {activeReport === "grade-wise" && (
            <GradeWise initialClass={selectedClass} initialYear={academicYear} />
          )}
          {activeReport === "student-progress" && (
            <StudentProgresswithout initialClass={selectedClass} initialYear={academicYear} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 relative z-10">
        <button 
          onClick={onBack}
          className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm animate-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">PDF निर्मिती</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Generate Report Card PDFs</p>
        </div>
      </div>

      {/* Options List */}
      <div className="relative z-10 space-y-4 max-w-2xl">
        {reportOptions.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => setActiveReport(opt.id)}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 hover:border-blue-400/50 hover:bg-blue-50/10 rounded-2xl transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${opt.color}`}>
                {opt.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-extrabold text-slate-800 tracking-wide group-hover:text-blue-600 transition-colors">
                  {opt.title}
                </span>
                <span className="text-[10px] text-slate-450 font-bold mt-0.5">
                  {opt.subtitle}
                </span>
              </div>
            </div>
            
            <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
