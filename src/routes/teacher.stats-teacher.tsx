import { createFileRoute, Link } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronLeft,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  HelpCircle,
  Clock3,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Sliders,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/teacher/stats-teacher")({
  component: TeacherStatsPage,
});

// Translation entries
const LOCAL_TRANS = {
  mr: {
    title: "शिक्षक संचिका",
    subtitle: "माझी उपस्थिती, अभ्यासक्रम प्रगती आणि व्यावसायिक प्रशिक्षण अहवाल",
    metricTrainingHours: "एकूण प्रशिक्षण वेळ",
    metricSyllabusProgress: "अभ्यासक्रम प्रगती",
    metricAttendance: "माझी उपस्थिती दर",
    metricClasses: "अध्यापन वर्ग संख्या",
    hoursUnit: "तास",
    syllabusSectionTitle: "विषयनिहाय अभ्यासक्रम प्रगती (Syllabus Completion)",
    trainingSectionTitle: "निष्ठा (NISHTHA) प्रशिक्षण आणि कोर्सेस",
    leaveSectionTitle: "मासिक उपस्थिती व रजा अहवाल",
    colModuleName: "प्रशिक्षण मोड्युलचे नाव",
    colStatus: "स्थिती",
    colCompletedDate: "पूर्ण केल्याची तारीख",
    statusCompleted: "पूर्ण",
    statusInProgress: "सुरू आहे",
    colMonth: "महीना",
    colPresent: "हजर दिवस",
    colLeaveCl: "किरकोळ रजा (CL)",
    colLeaveMed: "वैद्यकीय रजा (ML)",
    colLeaveDuty: "कर्तव्य रजा (DL)",
    noData: "नोंद उपलब्ध नाही",
    chapters: "धडे",
    chapterCompleted: "पूर्ण प्रकरणे",
  },
  en: {
    title: "Teacher Portfolio",
    subtitle: "My attendance tracking, syllabus progress, and NISHTHA professional training logs",
    metricTrainingHours: "Total Training Hours",
    metricSyllabusProgress: "Syllabus Progress",
    metricAttendance: "Attendance Rate",
    metricClasses: "Classes Assigned",
    hoursUnit: "hours",
    syllabusSectionTitle: "Subject-wise Syllabus Progress",
    trainingSectionTitle: "NISHTHA & Professional Training Logs",
    leaveSectionTitle: "Monthly Attendance & Leave Log",
    colModuleName: "Training Module Title",
    colStatus: "Status",
    colCompletedDate: "Completion Date",
    statusCompleted: "Completed",
    statusInProgress: "In Progress",
    colMonth: "Month",
    colPresent: "Present Days",
    colLeaveCl: "Casual Leave (CL)",
    colLeaveMed: "Medical Leave (ML)",
    colLeaveDuty: "Duty Leave (DL)",
    noData: "No log records found",
    chapters: "chapters",
    chapterCompleted: "completed",
  }
};

// Realistic mock data
const SYLLABUS_PROGRESS = [
  { subject: "Mathematics", mrSubject: "गणित", class: "Class V", completed: 12, total: 15, color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
  { subject: "Marathi", mrSubject: "मराठी", class: "Class II", completed: 11, total: 12, color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
  { subject: "Science", mrSubject: "विज्ञान", class: "Class VIII", completed: 9, total: 14, color: "bg-gradient-to-r from-amber-500 to-orange-500" },
  { subject: "English", mrSubject: "इंग्रजी", class: "Class VI", completed: 9, total: 12, color: "bg-gradient-to-r from-blue-500 to-sky-500" },
];

const TRAINING_LOGS = [
  { id: "t1", name: "FLN 1.0: पायाभूत साक्षरता व संख्याज्ञान अभियान ओळख (Introduction to FLN Mission)", status: "Completed", date: "15-01-2026" },
  { id: "t2", name: "FLN 2.0: अध्ययन निष्पत्ती व क्षमताधारित शिक्षण (Competency-Based Education)", status: "Completed", date: "10-02-2026" },
  { id: "t3", name: "FLN 3.0: आनंददायी अध्ययन अध्यापन पद्धती (Joyful & Experiential Learning)", status: "Completed", date: "08-03-2026" },
  { id: "t4", name: "FLN 4.0: शालेय मूल्यमापन आणि HPC वापर (School Assessment & HPC Integration)", status: "InProgress", date: "-" },
  { id: "t5", name: "ICT 1.0: वर्ग अध्यापनात डिजिटल तंत्रज्ञानाचा वापर (Using ICT in Teaching)", status: "InProgress", date: "-" },
];

const ATTENDANCE_LEAVES = [
  { month: "Jan 2026", mrMonth: "जानेवारी २०२६", present: 22, cl: 1, ml: 0, dl: 1 },
  { month: "Feb 2026", mrMonth: "फेब्रुवारी २०२६", present: 20, cl: 0, ml: 0, dl: 2 },
  { month: "Mar 2026", mrMonth: "मार्च २०२६", present: 23, cl: 1, ml: 0, dl: 0 },
  { month: "Apr 2026", mrMonth: "एप्रिल २०२६", present: 21, cl: 1, ml: 1, dl: 0 },
  { month: "May 2026", mrMonth: "मे २०२६", present: 10, cl: 0, ml: 0, dl: 0 }, // School vacation
  { month: "Jun 2026", mrMonth: "जून २०२६", present: 12, cl: 1, ml: 0, dl: 1 },
];

function TeacherStatsPage() {
  const { lang } = useLanguage();
  const trans = LOCAL_TRANS[lang as "mr" | "en"] || LOCAL_TRANS.en;
  const { profile } = useAuth();

  // Active training tab
  const [trainingFilter, setTrainingFilter] = useState<"All" | "Completed" | "InProgress">("All");

  const filteredTrainings = TRAINING_LOGS.filter((t) => {
    if (trainingFilter === "All") return true;
    return t.status === trainingFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen pb-16">
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Header Row */}
          <div className="space-y-1">
            <Link
              to="/teacher"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#6B7280] hover:text-indigo-600 uppercase tracking-widest transition-colors mb-2"
            >
              <ChevronLeft className="size-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              {trans.title}
            </h1>
            <p className="text-slate-500 font-bold text-sm tracking-wide mt-1">
              {trans.subtitle}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Training Hours */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricTrainingHours}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  72 {trans.hoursUnit}
                </span>
              </div>
            </div>

            {/* Syllabus progress percentage */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricSyllabusProgress}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  78%
                </span>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricAttendance}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  96.5%
                </span>
              </div>
            </div>

            {/* Classes/Courses Taught */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sliders className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricClasses}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  4 {lang === "mr" ? "वर्ग" : "classes"}
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Syllabus progress indicators */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {trans.syllabusSectionTitle}
                </h3>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mt-1" />
              </div>

              <div className="space-y-5">
                {SYLLABUS_PROGRESS.map((item, idx) => {
                  const percent = Math.round((item.completed / item.total) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <div>
                          <span className="font-extrabold text-slate-950">
                            {lang === "mr" ? item.mrSubject : item.subject}
                          </span>
                          <span className="text-slate-400 ml-2">({item.class})</span>
                        </div>
                        <span className="text-indigo-600 font-black">{percent}%</span>
                      </div>
                      
                      <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{item.completed} {trans.chapters} {trans.chapterCompleted}</span>
                        <span>{item.total} {trans.chapters}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave and monthly attendance records */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {trans.leaveSectionTitle}
                </h3>
                <div className="h-1 w-12 bg-blue-500 rounded-full mt-1" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 pl-2">{trans.colMonth}</th>
                      <th className="pb-3 text-center">{trans.colPresent}</th>
                      <th className="pb-3 text-center">{trans.colLeaveCl}</th>
                      <th className="pb-3 text-center">{trans.colLeaveMed}</th>
                      <th className="pb-3 text-center">{trans.colLeaveDuty}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {ATTENDANCE_LEAVES.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2 font-extrabold text-slate-900">
                          {lang === "mr" ? record.mrMonth : record.month}
                        </td>
                        <td className="py-3 text-center text-emerald-600 font-black">{record.present}</td>
                        <td className="py-3 text-center text-amber-600">{record.cl}</td>
                        <td className="py-3 text-center text-red-500">{record.ml}</td>
                        <td className="py-3 text-center text-indigo-600">{record.dl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NISHTHA Training Courses */}
            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {trans.trainingSectionTitle}
                  </h3>
                  <div className="h-1 w-12 bg-amber-500 rounded-full" />
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl self-start">
                  {[
                    { id: "All", labelKey: "allGenders" },
                    { id: "Completed", labelKey: "statusCompleted" },
                    { id: "InProgress", labelKey: "statusInProgress" }
                  ].map((tab) => {
                    const isSelected = trainingFilter === tab.id;
                    const label = trans[tab.labelKey as keyof typeof trans] || tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setTrainingFilter(tab.id as any)}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                          isSelected
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 pl-2">#</th>
                      <th className="pb-3">{trans.colModuleName}</th>
                      <th className="pb-3 text-center">{trans.colStatus}</th>
                      <th className="pb-3 text-right pr-2">{trans.colCompletedDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {filteredTrainings.map((log, idx) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-2 text-slate-400">#{idx + 1}</td>
                        <td className="py-4 font-extrabold text-slate-900 max-w-sm sm:max-w-md truncate md:max-w-xl">
                          {log.name}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.status === "Completed" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            <span className={`size-1.5 rounded-full ${
                              log.status === "Completed" ? "bg-emerald-600" : "bg-amber-600 animate-pulse"
                            }`} />
                            {log.status === "Completed" ? trans.statusCompleted : trans.statusInProgress}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2 text-slate-500">{log.date}</td>
                      </tr>
                    ))}
                    {filteredTrainings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                          {trans.noData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
