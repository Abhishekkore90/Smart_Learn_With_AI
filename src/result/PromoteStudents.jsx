import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, UserCheck, ArrowRight, ShieldCheck, Search } from "lucide-react";

// IndexedDB Constants
const DB_NAME = "SchoolManagementDB";
const STUDENT_STORE = "studentData";
const DB_VERSION = 1;

const CLASSES = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const TARGET_CLASSES = [...CLASSES, "Alumni"];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
}

export default function PromoteStudents() {
  const [academicYear, setAcademicYear] = useState("");
  const [classValue, setClassValue] = useState("");
  const [division, setDivision] = useState("");
  const [targetClass, setTargetClass] = useState("");
  
  const [studentData, setStudentData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [divisions, setDivisions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const udiseNumber = localStorage.getItem("udiseNumber");

  // Load students from IndexedDB
  const loadStudentData = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STUDENT_STORE, "readonly");
      const store = transaction.objectStore(STUDENT_STORE);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const students = event.target.result || [];
        const activeStudents = students.filter(s => s.isActive !== false);

        // Normalize student fields
        const normalized = activeStudents.map(student => {
          const keyParts = student.id.split("-");
          const className = keyParts[0];
          const div = keyParts[1];
          const srNo = keyParts[keyParts.length - 1];
          return { ...student, className, division: div, srNo };
        });

        setStudentData(normalized);
      };
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };

  useEffect(() => {
    loadStudentData();
    
    // Fetch default academic year
    const fetchDefaultSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/defaultSettings.json`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.defaultYear) {
            setAcademicYear(data.defaultYear);
          }
        }
      } catch (error) {
        console.error("Error fetching default settings:", error);
      }
    };
    fetchDefaultSettings();
  }, [udiseNumber]);

  // Update divisions when class changes
  useEffect(() => {
    if (classValue) {
      const classDivs = studentData
        .filter(s => s.currentClass === classValue)
        .map(s => s.division)
        .filter((value, index, self) => value && self.indexOf(value) === index);
      setDivisions(classDivs);
      setDivision("");
    } else {
      setDivisions([]);
      setDivision("");
    }
  }, [classValue, studentData]);

  // Filter students based on selection & search
  useEffect(() => {
    if (classValue && division) {
      const result = studentData.filter(s => {
        const matchClass = s.currentClass === classValue;
        const matchDiv = s.division === division;
        const fullName = `${s.stdName || ""} ${s.stdFather || ""} ${s.stdSurname || ""}`.toLowerCase();
        const matchSearch = fullName.includes(searchTerm.toLowerCase()) || (s.rollNo && String(s.rollNo).includes(searchTerm));
        return matchClass && matchDiv && matchSearch;
      }).sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));

      setFilteredStudents(result);
      // Reset selections
      setSelectedStudents({});
    } else {
      setFilteredStudents([]);
      setSelectedStudents({});
    }
  }, [classValue, division, searchTerm, studentData]);

  const handleSelectStudent = (srNo) => {
    setSelectedStudents(prev => ({
      ...prev,
      [srNo]: !prev[srNo]
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const nextSelections = {};
    if (checked) {
      filteredStudents.forEach(s => {
        nextSelections[s.srNo] = true;
      });
    }
    setSelectedStudents(nextSelections);
  };

  const handlePromote = async () => {
    const selectedIds = Object.keys(selectedStudents).filter(id => selectedStudents[id]);
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student to promote!");
      return;
    }
    if (!targetClass) {
      toast.error("Please select the target class!");
      return;
    }

    setIsSubmitting(true);
    try {
      const dbInstance = await openDB();

      for (const srNo of selectedIds) {
        // Find student details
        const student = studentData.find(s => s.srNo === srNo);
        if (!student) continue;

        // 1. Update Firebase Realtime Database
        const firebaseRef = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}.json`;
        await fetch(firebaseRef, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ currentClass: targetClass })
        });

        // 2. Update local IndexedDB
        const transaction = dbInstance.transaction(STUDENT_STORE, "readwrite");
        const store = transaction.objectStore(STUDENT_STORE);
        
        await new Promise((resolve, reject) => {
          const getReq = store.get(student.id);
          getReq.onsuccess = () => {
            const data = getReq.result;
            if (data) {
              data.currentClass = targetClass;
              // Update ID if we want it to match the new class structure, but typically keeping the key same is safer to avoid orphan relations, unless we change keyPath. Let's update just the currentClass.
              const putReq = store.put(data);
              putReq.onsuccess = () => resolve(true);
              putReq.onerror = () => reject(putReq.error);
            } else {
              resolve(false);
            }
          };
          getReq.onerror = () => reject(getReq.error);
        });
      }

      toast.success(`Successfully promoted ${selectedIds.length} students to ${targetClass}!`);
      // Reload students state
      await loadStudentData();
      setSelectedStudents({});
    } catch (err) {
      console.error("Error promoting students:", err);
      toast.error("An error occurred during promotion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector Dashboard Card */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/5 to-transparent rounded-bl-[100px]" />
        
        <h3 className="text-lg font-black text-slate-900 italic tracking-tight mb-8 flex items-center gap-2">
          <Users className="size-6 text-indigo-600" /> Promote Students Command Center
        </h3>

        <div className="grid md:grid-cols-4 gap-6 items-end">
          {/* Current Class */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Current Class
            </label>
            <select
              value={classValue}
              onChange={(e) => setClassValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
            >
              <option value="">Select Current Class</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls} Class
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Division / Section
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
              disabled={!classValue}
            >
              <option value="">Select Division</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  Division {div}
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Target Class */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1 flex items-center gap-1 font-extrabold">
              <ArrowRight className="size-3" /> Promote To Target Class
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-sm font-bold text-indigo-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
              disabled={!division}
            >
              <option value="">Select Target Class</option>
              {TARGET_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls} {cls !== "Alumni" ? "Class" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handlePromote}
              disabled={isSubmitting || !targetClass || Object.keys(selectedStudents).filter(k => selectedStudents[k]).length === 0}
              className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="size-4" /> Promote Selected
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {classValue && division && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Class {classValue} - Division {division} Students
              </h3>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">
                Select the students to promote to {targetClass || "..."}
              </p>
            </div>
            
            {/* Search */}
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-500 transition-all w-full"
                placeholder="Search by name..."
              />
            </div>
          </div>

          <div className="p-10 pt-0">
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="px-6 py-5 text-center w-16">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents[s.srNo])}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-20">
                      Roll No.
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                      Student Name
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                      Current Class
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                      Target Class
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, idx) => {
                      const isChecked = !!selectedStudents[student.srNo];
                      return (
                        <tr
                          key={student.srNo}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-indigo-50/5"} hover:bg-indigo-50/10 transition-colors cursor-pointer`}
                          onClick={() => handleSelectStudent(student.srNo)}
                        >
                          <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSelectStudent(student.srNo)}
                              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-xs font-bold text-slate-500">
                              {student.rollNo || "N/A"}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-800">
                              {student.stdSurname} {student.stdName} {student.stdFather}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">
                              {student.currentClass}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-indigo-600">
                              {isChecked ? targetClass : "-"}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            {isChecked ? (
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit mx-auto">
                                <ShieldCheck className="size-3" /> Ready
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-300">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-[0.2em] text-xs italic"
                      >
                        No students found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
