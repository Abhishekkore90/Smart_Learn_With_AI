import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  FileText, 
  X, 
  User, 
  Sparkles,
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
  addDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  class: string;
  usid?: string;
  gender?: string;
  email?: string;
}

interface CCEStudentListProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
  onViewReport: (studentName: string) => void;
}

export function CCEStudentList({ selectedClass, academicYear, onBack, onViewReport }: CCEStudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Menu States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [usid, setUsid] = useState("");
  const [gender, setGender] = useState("Male");
  
  // Real-time student sync
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
          usid: data.usid || "",
          gender: data.gender || "Male",
          email: data.email || ""
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

  // Handle Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("कृपया विद्यार्थ्याचे नाव प्रविष्ट करा!");
      return;
    }
    
    const finalUsid = usid.trim() || `USID${Math.floor(100000 + Math.random() * 900000)}`;
    
    try {
      const newStudentData = {
        fullName: fullName.trim(),
        class: selectedClass,
        role: "student",
        gender,
        usid: finalUsid,
        email: `student_${finalUsid.toLowerCase()}@smartlearn.com`,
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "users"), newStudentData);
      toast.success("विद्यार्थी यशस्वीरित्या जोडला गेला!");
      
      // Reset & Close
      setFullName("");
      setUsid("");
      setGender("Male");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("विद्यार्थी जोडण्यास अपयश आले.");
    }
  };

  // Handle Edit Student
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !fullName.trim()) {
      toast.error("कृपया विद्यार्थ्याचे नाव प्रविष्ट करा!");
      return;
    }
    
    try {
      const studentRef = doc(db, "users", selectedStudent.id);
      await updateDoc(studentRef, {
        fullName: fullName.trim(),
        gender,
        usid: usid.trim(),
      });
      
      toast.success("विद्यार्थ्याची माहिती यशस्वीरित्या अपडेट झाली!");
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("माहिती अपडेट करण्यास अपयश आले.");
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`तुम्हाला खात्री आहे की तुम्ही ${name} ला डिलीट करू इच्छिता?`)) return;
    
    try {
      await deleteDoc(doc(db, "users", studentId));
      toast.success("विद्यार्थी यशस्वीरित्या डिलीट केला गेला.");
      setActiveMenuId(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("डिलीट करण्यास अपयश आले.");
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFullName(student.fullName);
    setUsid(student.usid || "");
    setGender(student.gender || "Male");
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm animate-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">विद्यार्थी</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Student Management</p>
          </div>
        </div>
        
        <span className="text-xs font-bold text-blue-600 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100/50 shadow-inner">
          {selectedClass} ({students.length})
        </span>
      </div>

      {/* Main Student List */}
      <div className="relative z-10 space-y-3 min-h-[300px] pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-500 font-bold gap-3">
            <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>विद्यार्थी यादी लोड होत आहे...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-200/50">
            <User className="size-12 mb-3 text-slate-400" />
            <p className="text-sm">या वर्गात कोणतेही विद्यार्थी उपलब्ध नाहीत.</p>
            <p className="text-xs text-slate-400 mt-1">नवीन विद्यार्थी जोडण्यासाठी खालील + बटणावर क्लिक करा.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => (
              <div 
                key={student.id} 
                className="bg-white border border-slate-200/70 hover:border-blue-400/50 hover:bg-blue-50/10 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Circular Index Badge */}
                  <div className="size-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-base font-bold text-slate-800 tracking-wide group-hover:text-blue-600 transition-colors">
                      {student.fullName}
                    </span>
                    {student.usid && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">USID: {student.usid}</span>
                    )}
                  </div>
                </div>
                
                {/* Options Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {activeMenuId === student.id && (
                    <>
                      {/* Backdrop for closing */}
                      <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 overflow-hidden font-medium text-xs text-slate-700">
                        <button
                          onClick={() => {
                            onViewReport(student.fullName);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 text-blue-600 hover:text-blue-500 flex items-center gap-2 transition-all cursor-pointer text-left font-bold"
                        >
                          <FileText size={14} />
                          अहवाल पहा (Report)
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 flex items-center gap-2 transition-all cursor-pointer text-left"
                        >
                          <Edit3 size={14} />
                          माहिती बदला (Edit)
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.fullName)}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 text-red-500 hover:text-red-400 flex items-center gap-2 transition-all cursor-pointer text-left border-t border-slate-100"
                        >
                          <Trash2 size={14} />
                          डिलीट करा (Delete)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => {
          setFullName("");
          setUsid("");
          setGender("Male");
          setIsAddModalOpen(true);
        }}
        className="absolute bottom-6 right-6 size-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/10 transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
      >
        <Plus size={24} />
      </button>

      {/* ADD STUDENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 text-slate-800 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-blue-550">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-800">नवीन विद्यार्थी जोडा</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Add New Student</p>
                </div>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">विद्यार्थ्याचे नाव (Student Full Name) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="उदा. सिद्धांत आनंदराव सुर्यवंशी"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">USID किंवा रोल नंबर (पर्यायी)</label>
                  <input 
                    type="text"
                    placeholder="उदा. USID203498"
                    value={usid}
                    onChange={(e) => setUsid(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">लिंग (Gender)</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-blue-600 cursor-pointer shadow-sm"
                  >
                    <option value="Male">Male (पुरुष)</option>
                    <option value="Female">Female (स्त्री)</option>
                    <option value="Other">Other (इतर)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6 text-xs uppercase tracking-wider text-white"
                >
                  <Sparkles size={16} />
                  विद्यार्थी जोडा (Save Student)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT STUDENT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 text-slate-800 shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-blue-550">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-800">विद्यार्थी माहिती बदला</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Edit Student Details</p>
                </div>
              </div>

              <form onSubmit={handleEditStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">विद्यार्थ्याचे नाव (Student Full Name) *</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">USID किंवा रोल नंबर</label>
                  <input 
                    type="text"
                    value={usid}
                    onChange={(e) => setUsid(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">लिंग (Gender)</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-blue-600 cursor-pointer shadow-sm"
                  >
                    <option value="Male">Male (पुरुष)</option>
                    <option value="Female">Female (स्त्री)</option>
                    <option value="Other">Other (इतर)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6 text-xs uppercase tracking-wider text-white"
                >
                  माहिती जतन करा (Save Changes)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
