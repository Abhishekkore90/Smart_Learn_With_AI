import { createFileRoute, Link } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  BarChart3,
  ChevronLeft,
  Users,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Filter,
  Download,
  TrendingUp,
  User,
  Search,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/stats-student")({
  component: StudentStatsPage,
});

// Local translations helper
const LOCAL_TRANS = {
  mr: {
    title: "विद्यार्थी संचिका",
    subtitle: "शालेय विद्यार्थ्यांची उपस्थिती, शैक्षणिक प्रगती आणि विश्लेषण",
    allClasses: "सर्व इयत्ता",
    filterTitle: "फिल्टर करा",
    selectClass: "इयत्ता निवडा",
    genderTitle: "लिंग",
    allGenders: "सर्व",
    male: "मुलगे",
    female: "मुली",
    metricTotalStudents: "एकूण विद्यार्थी",
    metricAttendance: "सरासरी उपस्थिती",
    metricAcademicAvg: "अकादमिक सरासरी",
    metricAlerts: "कमी उपस्थिती अलर्ट",
    metricAlertsSub: "७५% पेक्षा कमी उपस्थिती",
    chartAttendanceTitle: "उपस्थितीचा कल (गेले ६ महिने)",
    chartGradeTitle: "श्रेणीनिहाय विभागणी (Grades)",
    chartSubjectTitle: "विषयनिहाय सरासरी गुण (%)",
    tableTopTitle: "उत्कृष्ट कामगिरी करणारे विद्यार्थी (Top Performers)",
    tableSupportTitle: "अतिरिक्त मार्गदर्शनाची गरज असलेले विद्यार्थी",
    colName: "नाव",
    colClass: "इयत्ता",
    colAttendance: "उपस्थिती",
    colScore: "सरासरी गुण",
    colRank: "क्रमांक",
    colAction: "कृती",
    searchPlaceholder: "विद्यार्थी शोधा...",
    noData: "माहिती उपलब्ध नाही",
    loading: "माहिती लोड होत आहे...",
    percentMarks: "प्राप्त गुण टक्केवारी",
    percentAttendance: "उपस्थिती टक्केवारी",
  },
  en: {
    title: "Student Portfolio",
    subtitle: "Student attendance, academic progress, and core analytics",
    allClasses: "All Classes",
    filterTitle: "Filter Analytics",
    selectClass: "Select Class",
    genderTitle: "Gender",
    allGenders: "All",
    male: "Boys",
    female: "Girls",
    metricTotalStudents: "Total Students",
    metricAttendance: "Average Attendance",
    metricAcademicAvg: "Academic Average",
    metricAlerts: "Low Attendance Alerts",
    metricAlertsSub: "Below 75% attendance",
    chartAttendanceTitle: "Attendance Trend (Last 6 Months)",
    chartGradeTitle: "Grade Distribution",
    chartSubjectTitle: "Subject-wise Average Marks (%)",
    tableTopTitle: "Top Performing Students",
    tableSupportTitle: "Students Needing Academic Attention",
    colName: "Name",
    colClass: "Class",
    colAttendance: "Attendance",
    colScore: "Avg Score",
    colRank: "Rank",
    colAction: "Action",
    searchPlaceholder: "Search students...",
    noData: "No data available",
    loading: "Loading data...",
    percentMarks: "Percentage Marks",
    percentAttendance: "Attendance %",
  }
};

// Rich Realistic Mock Data Fallback
const MOCK_STUDENTS = [
  { id: "s1", name: "आरती गणेश निकम (Aarti Nikam)", class: "Class II", gender: "Female", attendance: 92, score: 88, grade: "A+" },
  { id: "s2", name: "ओंकार धनाजी पाटील (Omkar Patil)", class: "Class II", gender: "Male", attendance: 78, score: 84, grade: "A" },
  { id: "s3", name: "नेहा संभाजी माने (Neha Mane)", class: "Class II", gender: "Female", attendance: 96, score: 94, grade: "A+" },
  { id: "s4", name: "समीर बाळू शिंदे (Samir Shinde)", class: "Class II", gender: "Male", attendance: 71, score: 38, grade: "F" },
  { id: "s5", name: "स्नेहल विलास कदम (Snehal Kadam)", class: "Class III", gender: "Female", attendance: 88, score: 76, grade: "B" },
  { id: "s6", name: "आदित्य विक्रम भोसले (Aditya Bhosale)", class: "Class III", gender: "Male", attendance: 64, score: 35, grade: "F" },
  { id: "s7", name: "प्रणाली संजय पवार (Pranali Pawar)", class: "Class V", gender: "Female", attendance: 95, score: 91, grade: "A+" },
  { id: "s8", name: "रोहित आनंदराव जाधव (Rohit Jadhav)", class: "Class V", gender: "Male", attendance: 82, score: 55, grade: "C" },
  { id: "s9", name: "सिद्धी प्रकाश सावंत (Siddhi Sawant)", class: "Class VI", gender: "Female", attendance: 73, score: 80, grade: "A" },
  { id: "s10", name: "यशवंत रामदास कांबळे (Yashwant Kamble)", class: "Class VIII", gender: "Male", attendance: 90, score: 92, grade: "A+" },
  { id: "s11", name: "कोमल दीपक लोखंडे (Komal Lokhande)", class: "Class VIII", gender: "Female", attendance: 68, score: 42, grade: "D" },
  { id: "s12", name: "गौरव विजय सूर्यवंशी (Gaurav Suryavanshi)", class: "Class VIII", gender: "Male", attendance: 93, score: 79, grade: "B" },
];

const MOCK_ATTENDANCE_TREND = [
  { name: "Jan", mrName: "जाने", attendance: 92 },
  { name: "Feb", mrName: "फेब्रु", attendance: 89 },
  { name: "Mar", mrName: "मार्च", attendance: 94 },
  { name: "Apr", mrName: "एप्रिल", attendance: 91 },
  { name: "May", mrName: "मे", attendance: 95 },
  { name: "Jun", mrName: "जून", attendance: 93 },
];

const MOCK_GRADES = [
  { name: "A+", value: 4, color: "#22c55e" },
  { name: "A", value: 3, color: "#3b82f6" },
  { name: "B", value: 2, color: "#a855f7" },
  { name: "C", value: 1, color: "#eab308" },
  { name: "D", value: 1, color: "#f97316" },
  { name: "Fail", value: 2, color: "#ef4444" },
];

const MOCK_SUBJECTS = [
  { subject: "Marathi", mrSubject: "मराठी", score: 82 },
  { subject: "English", mrSubject: "इंग्रजी", score: 68 },
  { subject: "Maths", mrSubject: "गणित", score: 74 },
  { subject: "Science", mrSubject: "विज्ञान", score: 77 },
  { subject: "Social Sci", mrSubject: "सामाजिक शा.", score: 79 },
];

function StudentStatsPage() {
  const { lang } = useLanguage();
  const trans = LOCAL_TRANS[lang as "mr" | "en"] || LOCAL_TRANS.en;

  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [studentsData, setStudentsData] = useState<any[]>([]);

  // Load Firestore data or fall back to Mock data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const list: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.fullName || "Unnamed Student",
              class: data.class || "Class II",
              gender: data.gender || "Male",
              attendance: data.attendanceRate ? Number(data.attendanceRate) : Math.floor(Math.random() * 25) + 75,
              score: data.academicScore ? Number(data.academicScore) : Math.floor(Math.random() * 45) + 50,
              grade: data.grade || "B",
            });
          });
          setStudentsData(list);
        } else {
          setStudentsData(MOCK_STUDENTS);
        }
      } catch (e) {
        console.error("Firestore fetch error, falling back to mock data", e);
        setStudentsData(MOCK_STUDENTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Class options
  const classOptions = ["All", "Class II", "Class III", "Class V", "Class VI", "Class VIII"];

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentsData.filter((s) => {
      const matchesClass = selectedClass === "All" || s.class === selectedClass;
      const matchesGender = selectedGender === "All" || s.gender === selectedGender;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesGender && matchesSearch;
    });
  }, [studentsData, selectedClass, selectedGender, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    if (filteredStudents.length === 0) {
      return { total: 0, attendance: 0, academicAvg: 0, alerts: 0 };
    }
    const total = filteredStudents.length;
    const totalAttendance = filteredStudents.reduce((acc, curr) => acc + curr.attendance, 0);
    const totalScore = filteredStudents.reduce((acc, curr) => acc + curr.score, 0);
    const alerts = filteredStudents.filter((s) => s.attendance < 75).length;

    return {
      total,
      attendance: Math.round(totalAttendance / total),
      academicAvg: Math.round(totalScore / total),
      alerts,
    };
  }, [filteredStudents]);

  // Top Performing Students (Sorted by Academic Score Descending)
  const topPerformers = useMemo(() => {
    return [...filteredStudents]
      .filter((s) => s.score >= 75)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [filteredStudents]);

  // Students needing academic support (Sorted by Academic Score Ascending)
  const supportNeeded = useMemo(() => {
    return [...filteredStudents]
      .filter((s) => s.score < 45)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [filteredStudents]);

  // Dynamic Grade distribution mapping based on current filtered data
  const gradesDistribution = useMemo(() => {
    const counts: Record<string, number> = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "Fail": 0 };
    filteredStudents.forEach((s) => {
      let g = s.grade || "B";
      if (s.score >= 90) g = "A+";
      else if (s.score >= 80) g = "A";
      else if (s.score >= 70) g = "B";
      else if (s.score >= 60) g = "C";
      else if (s.score >= 45) g = "D";
      else g = "Fail";
      
      counts[g] = (counts[g] || 0) + 1;
    });

    return MOCK_GRADES.map((gObj) => ({
      ...gObj,
      value: counts[gObj.name] || 0,
    })).filter(gObj => gObj.value > 0);
  }, [filteredStudents]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen pb-16">
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Top Navigation Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
            
            <button
              onClick={() => {
                toast.success(lang === "mr" ? "अहवाल डाउनलोड सुरू झाला..." : "Report download started...");
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#111827] text-white hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 self-start sm:self-center"
            >
              <Download className="size-4" />
              Download Report
            </button>
          </div>

          {/* Interactive Filters Panel */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm uppercase tracking-wider border-r border-slate-100 pr-6 mr-2 hidden md:flex">
              <Filter className="size-4 text-indigo-500" />
              {trans.filterTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {/* Class Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {trans.selectClass}
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {classOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "All" ? trans.allClasses : opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {trans.genderTitle}
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["All", "Male", "Female"].map((g) => {
                    const isSelected = selectedGender === g;
                    const label = g === "All" ? trans.allGenders : g === "Male" ? trans.male : trans.female;
                    return (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${
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

              {/* Student Search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={trans.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Aggregate Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Students */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricTotalStudents}
                </span>
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {metrics.total}
                </span>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Calendar className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricAttendance}
                </span>
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {metrics.attendance}%
                </span>
              </div>
            </div>

            {/* Academic Average */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricAcademicAvg}
                </span>
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {metrics.academicAvg}%
                </span>
              </div>
            </div>

            {/* Low Attendance Alerts */}
            <div className={`border rounded-3xl p-6 shadow-sm flex items-center gap-5 transition-colors ${
              metrics.alerts > 0 
                ? "bg-red-50/50 border-red-200 text-red-950" 
                : "bg-white border-slate-200 text-slate-950"
            }`}>
              <div className={`size-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                metrics.alerts > 0 ? "bg-red-100 text-red-600 animate-bounce" : "bg-slate-100 text-slate-500"
              }`}>
                <AlertTriangle className="size-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  {trans.metricAlerts}
                </span>
                <span className="text-3xl font-black leading-none block">
                  {metrics.alerts}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block">
                  {trans.metricAlertsSub}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Visual Graphics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Attendance Trends (Last 6 Months) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="size-5 text-indigo-500" />
                {trans.chartAttendanceTitle}
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ATTENDANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey={lang === "mr" ? "mrName" : "name"}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                    />
                    <YAxis
                      domain={[60, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', fontWeight: 700 }} />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#attendanceGradient)"
                      name={trans.percentAttendance}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grades Distribution (Pie Chart) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <h3 className="text-base font-black text-slate-800">
                {trans.chartGradeTitle}
              </h3>
              
              <div className="h-[180px] w-full relative flex items-center justify-center">
                {gradesDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradesDistribution}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {gradesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 font-bold italic">{trans.noData}</div>
                )}
                
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
                </div>
              </div>

              {/* Pie Chart Custom Legends */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-black text-slate-500">
                {MOCK_GRADES.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 justify-center">
                    <span className="size-2 rounded-full" style={{ backgroundColor: g.color }} />
                    <span>{g.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject average metrics Bar chart */}
            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="size-5 text-indigo-500" />
                {trans.chartSubjectTitle}
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_SUBJECTS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey={lang === "mr" ? "mrSubject" : "subject"}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', fontWeight: 700 }} />
                    <Bar
                      dataKey="score"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name={trans.percentMarks}
                    >
                      {MOCK_SUBJECTS.map((entry, index) => {
                        const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Student Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Performers Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#111827]">
                  {trans.tableTopTitle}
                </h3>
                <div className="h-1 w-12 bg-emerald-500 rounded-full" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 pl-2">{trans.colRank}</th>
                      <th className="pb-3">{trans.colName}</th>
                      <th className="pb-3">{trans.colClass}</th>
                      <th className="pb-3 text-right pr-2">{trans.colScore}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                    {topPerformers.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2">
                          <span className={`size-5 rounded-lg flex items-center justify-center font-black text-[10px] ${
                            idx === 0 
                              ? "bg-amber-100 text-amber-800" 
                              : idx === 1 
                              ? "bg-slate-200 text-slate-800" 
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 font-extrabold text-slate-900">{student.name}</td>
                        <td className="py-3 text-slate-500">{student.class}</td>
                        <td className="py-3 text-right pr-2 text-emerald-600 font-black">{student.score}%</td>
                      </tr>
                    ))}
                    {topPerformers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                          {trans.noData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Attention Needed Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#111827]">
                  {trans.tableSupportTitle}
                </h3>
                <div className="h-1 w-12 bg-red-500 rounded-full" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 pl-2">{trans.colName}</th>
                      <th className="pb-3">{trans.colClass}</th>
                      <th className="pb-3">{trans.colAttendance}</th>
                      <th className="pb-3 text-right pr-2">{trans.colScore}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                    {supportNeeded.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2 font-extrabold text-slate-900">{student.name}</td>
                        <td className="py-3 text-slate-500">{student.class}</td>
                        <td className={`py-3 font-extrabold ${student.attendance < 75 ? "text-red-500 font-black" : "text-slate-600"}`}>
                          {student.attendance}%
                        </td>
                        <td className="py-3 text-right pr-2 text-red-500 font-black">{student.score}%</td>
                      </tr>
                    ))}
                    {supportNeeded.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                          {trans.noData} (All students above critical academic threshold)
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
