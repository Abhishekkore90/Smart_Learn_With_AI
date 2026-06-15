import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Check, 
  X, 
  Sparkles,
  Users,
  Settings
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

interface CCEAttendanceProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

export function CCEAttendance({ selectedClass, academicYear, onBack }: CCEAttendanceProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"student-wise" | "month-wise">("student-wise");
  
  // Date State for Attendance marking
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Attendance records for the selected date: { [studentId]: "present" | "absent" }
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "present" | "absent">>({});
  
  // Month-wise summaries
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYearForSummary, setSelectedYearForSummary] = useState<number>(new Date().getFullYear());
  const [allMonthAttendance, setAllMonthAttendance] = useState<any[]>([]);
  
  // Working days modal state
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false);
  const [workingDays, setWorkingDays] = useState<Record<string, number>>({
    June: 20, July: 24, August: 22, September: 21, October: 18, November: 20,
    December: 23, January: 24, February: 20, March: 22, April: 18, May: 5
  });

  // Fetch Working Days
  useEffect(() => {
    async function fetchWorkingDays() {
      try {
        const docRef = doc(db, "working_days", `${selectedClass}_${academicYear}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWorkingDays(docSnap.data() as Record<string, number>);
        }
      } catch (err) {
        console.error("Error fetching working days:", err);
      }
    }
    fetchWorkingDays();
  }, [selectedClass, academicYear]);

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
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [selectedClass]);

  // Format Date to string key
  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Fetch Attendance for the selected date
  useEffect(() => {
    if (students.length === 0) return;
    
    const dateKey = getDateKey(currentDate);
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("class", "==", selectedClass),
      where("date", "==", dateKey)
    );
    
    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const records: Record<string, "present" | "absent"> = {};
      
      // Default all to absent (as displayed in checked/unchecked state)
      students.forEach(s => {
        records[s.id] = "absent";
      });
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.studentId) {
          records[data.studentId] = data.status || "absent";
        }
      });
      
      setAttendanceRecords(records);
    });
    
    return () => unsubscribe();
  }, [currentDate, students, selectedClass]);

  // Fetch monthly summary logs
  useEffect(() => {
    if (activeTab !== "month-wise" || students.length === 0) return;
    
    async function loadMonthlySummary() {
      try {
        const yearMonthPrefix = `${selectedYearForSummary}-${String(selectedMonth + 1).padStart(2, "0")}`;
        const summaryQuery = query(
          collection(db, "attendance"),
          where("class", "==", selectedClass)
        );
        
        const snapshot = await getDocs(summaryQuery);
        const presentCounts: Record<string, number> = {};
        
        students.forEach(s => {
          presentCounts[s.id] = 0;
        });

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.date && data.date.startsWith(yearMonthPrefix) && data.status === "present") {
            if (presentCounts[data.studentId] !== undefined) {
              presentCounts[data.studentId]++;
            }
          }
        });

        setAllMonthAttendance(students.map(s => ({
          id: s.id,
          name: s.fullName,
          presentDays: presentCounts[s.id] || 0
        })));
      } catch (err) {
        console.error("Error loading monthly summary:", err);
      }
    }
    loadMonthlySummary();
  }, [activeTab, selectedMonth, selectedYearForSummary, students, selectedClass]);

  // Toggle Attendance Status
  const toggleAttendance = async (studentId: string, currentStatus: "present" | "absent") => {
    const newStatus = currentStatus === "present" ? "absent" : "present";
    const dateKey = getDateKey(currentDate);
    const docId = `${studentId}_${dateKey}`;
    
    try {
      const student = students.find(s => s.id === studentId);
      await setDoc(doc(db, "attendance", docId), {
        studentId,
        studentName: student?.fullName || "Student",
        class: selectedClass,
        date: dateKey,
        status: newStatus,
        markedAt: new Date().toISOString()
      });
      
      setAttendanceRecords(prev => ({
        ...prev,
        [studentId]: newStatus
      }));
    } catch (err) {
      console.error("Error toggling attendance:", err);
      toast.error("उपस्थिती अपडेट करताना त्रुटी आली.");
    }
  };

  // Change Date
  const adjustDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Format Date in Marathi
  const formatMarathiDate = (date: Date) => {
    const daysMarathi = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
    const monthsMarathi = [
      "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
      "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
    ];
    
    const dayName = daysMarathi[date.getDay()];
    const dayVal = date.getDate();
    const monthName = monthsMarathi[date.getMonth()];
    const yearVal = date.getFullYear();
    
    return `${dayVal} ${monthName} ${yearVal} (${dayName})`;
  };

  // Get current month name in English for working days key lookup
  const getMonthName = (monthIdx: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIdx];
  };

  // Save Working Days Configuration
  const handleSaveWorkingDays = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "working_days", `${selectedClass}_${academicYear}`), workingDays);
      toast.success("कामाचे दिवस यशस्वीरित्या जतन केले!");
      setIsWorkingDaysModalOpen(false);
    } catch (err) {
      console.error("Error saving working days:", err);
      toast.error("कामाचे दिवस जतन करण्यात अडचण आली.");
    }
  };

  const currentMonthName = getMonthName(selectedMonth);
  const currentMonthWorkingDays = workingDays[currentMonthName] || 0;

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">उपस्थिती</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Student Attendance</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsWorkingDaysModalOpen(true)}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-[#132A1C] hover:bg-[#1E432D] px-4 py-2.5 rounded-2xl border border-[#1E432D] transition-all cursor-pointer shadow-sm"
        >
          कामाचे दिवस &gt;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1C2C22] mb-6 relative z-10 font-bold text-sm">
        <button
          onClick={() => setActiveTab("student-wise")}
          className={`pb-3 px-4 transition-all relative cursor-pointer ${
            activeTab === "student-wise" ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          विद्यार्थी निहाय
          {activeTab === "student-wise" && (
            <motion.div 
              layoutId="activeAttendanceTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" 
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("month-wise")}
          className={`pb-3 px-4 transition-all relative cursor-pointer ${
            activeTab === "month-wise" ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          महिना निहाय
          {activeTab === "month-wise" && (
            <motion.div 
              layoutId="activeAttendanceTab" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" 
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10">
        
        {/* STUDENT WISE DAILY ATTENDANCE MARKING */}
        {activeTab === "student-wise" && (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-[#16221A] border border-[#22352B] rounded-2xl p-4 shadow-sm">
              <button 
                onClick={() => adjustDate(-1)}
                className="p-2 hover:bg-[#1E2E24] text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer border border-[#24352B]"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-2 text-white font-bold text-xs md:text-sm">
                <Calendar size={16} className="text-emerald-400 shrink-0" />
                <span>{formatMarathiDate(currentDate)}</span>
              </div>
              
              <button 
                onClick={() => adjustDate(1)}
                className="p-2 hover:bg-[#1E2E24] text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer border border-[#24352B]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* List */}
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
                  const status = attendanceRecords[student.id] || "absent";
                  const isPresent = status === "present";
                  
                  return (
                    <div 
                      key={student.id}
                      className="bg-[#16221A] border border-[#22352B] hover:border-emerald-600/50 rounded-2xl p-4 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Circular Number Badge */}
                        <div className="size-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                          {student.fullName}
                        </span>
                      </div>
                      
                      {/* Checkbox Toggle Button */}
                      <button
                        onClick={() => toggleAttendance(student.id, status)}
                        className={`size-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                          isPresent 
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-105" 
                            : "border-emerald-600/60 text-transparent hover:border-emerald-500 hover:bg-[#1E2E24]"
                        }`}
                      >
                        {isPresent ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (
                          <div className="size-4 rounded-full" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MONTH WISE SUMMARY LOGS */}
        {activeTab === "month-wise" && (
          <div className="space-y-6">
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#16221A] border border-[#22352B] p-4 rounded-2xl">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">महिना (Select Month)</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-[#0B1510] border border-[#24352B] rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-600 transition-colors text-emerald-400 cursor-pointer"
                >
                  <option value={5}>जून (June)</option>
                  <option value={6}>जुलै (July)</option>
                  <option value={7}>ऑगस्ट (August)</option>
                  <option value={8}>सप्टेंबर (September)</option>
                  <option value={9}>ऑक्टोबर (October)</option>
                  <option value={10}>नोव्हेंबर (November)</option>
                  <option value={11}>डिसेंबर (December)</option>
                  <option value={0}>जानेवारी (January)</option>
                  <option value={1}>फेब्रुवारी (February)</option>
                  <option value={2}>मार्च (March)</option>
                  <option value={3}>एप्रिल (April)</option>
                  <option value={4}>मे (May)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">वर्ष (Select Year)</label>
                <select
                  value={selectedYearForSummary}
                  onChange={(e) => setSelectedYearForSummary(Number(e.target.value))}
                  className="w-full bg-[#0B1510] border border-[#24352B] rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-600 transition-colors text-emerald-400 cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            {/* List */}
            {allMonthAttendance.length === 0 ? (
              <div className="text-center py-20 text-slate-500 italic text-sm">
                या महिन्यासाठी उपस्थितीचे कोणतेही रेकॉर्ड सापडले नाहीत.
              </div>
            ) : (
              <div className="space-y-3">
                {allMonthAttendance.map((rec, index) => {
                  const rate = currentMonthWorkingDays > 0 
                    ? Math.round((rec.presentDays / currentMonthWorkingDays) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={rec.id}
                      className="bg-[#16221A] border border-[#22352B] rounded-2xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm md:text-base font-bold text-white">
                          {rec.name}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-emerald-400">
                          {rec.presentDays} / {currentMonthWorkingDays} दिवस (Days)
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          rate >= 75 ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50" : "bg-red-950/50 text-red-400 border border-red-800/50"
                        }`}>
                          {rate}% उपस्थिती
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* WORKING DAYS MODAL */}
      <AnimatePresence>
        {isWorkingDaysModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1510] border border-[#24352B] w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setIsWorkingDaysModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-emerald-900/40 p-2 rounded-xl text-emerald-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">वर्गाचे एकूण कामाचे दिवस</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Set Monthly Working Days</p>
                </div>
              </div>

              <form onSubmit={handleSaveWorkingDays} className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(workingDays).map((month) => (
                    <div key={month} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">{month}</label>
                      <input 
                        type="number"
                        min={0}
                        max={31}
                        value={workingDays[month]}
                        onChange={(e) => setWorkingDays(prev => ({
                          ...prev,
                          [month]: Number(e.target.value)
                        }))}
                        className="w-full bg-[#16221A] border border-[#24352B] rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-emerald-600 text-white"
                      />
                    </div>
                  ))}
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  <Check size={16} />
                  माहिती जतन करा (Save Configuration)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
