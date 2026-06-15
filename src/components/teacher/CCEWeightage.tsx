import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  X, 
  Check, 
  HelpCircle,
  Sparkles,
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
  rollNo?: number;
}

interface WeightageSubject {
  akarik_todi: number | "";
  akarik_pratyakshik: number | "";
  akarik_upakram: number | "";
  akarik_prakalp: number | "";
  akarik_chachani: number | "";
  akarik_swadhyay: number | "";
  akarik_itar: number | "";
  
  sankalik_todi: number | "";
  sankalik_pratyakshik: number | "";
  sankalik_lekhi: number | "";
}

interface WeightageGroup {
  id: string;
  name: string;
  studentIds: string[];
  subjects?: Record<string, WeightageSubject>;
}

interface CCEWeightageProps {
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

export function CCEWeightage({ selectedClass, academicYear, onBack }: CCEWeightageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Term/Semester state
  const [activeTerm, setActiveTerm] = useState<"first" | "second">("first");
  
  // Weightage Groups State
  const [groups, setGroups] = useState<WeightageGroup[]>([]);
  
  // Modals & Menu States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [saving, setSaving] = useState(false);

  // Detailed group edit screen states
  const [editingGroup, setEditingGroup] = useState<WeightageGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editSubjectIndex, setEditSubjectIndex] = useState(0);
  const [editGroupSubjects, setEditGroupSubjects] = useState<Record<string, WeightageSubject>>({});

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
      let index = 1;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          fullName: data.fullName || "Unnamed Student",
          rollNo: data.rollNo || index++
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

  // Load Weightage Settings from Firestore
  useEffect(() => {
    if (students.length === 0) return;
    
    async function loadWeightages() {
      try {
        const docRef = doc(db, "weightages", `${selectedClass}_${academicYear}_${activeTerm}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.groups && Array.isArray(data.groups)) {
            setGroups(data.groups);
            return;
          }
        }
        
        // Fallback: Create one default group containing all students
        setGroups([
          {
            id: "group_default",
            name: "भारांश निश्चिती 1",
            studentIds: students.map(s => s.id)
          }
        ]);
      } catch (err) {
        console.error("Error loading weightages:", err);
      }
    }
    
    loadWeightages();
  }, [students, selectedClass, academicYear, activeTerm]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, studentId: string, sourceGroupId: string) => {
    e.dataTransfer.setData("text/plain", studentId);
    e.dataTransfer.setData("sourceGroupId", sourceGroupId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("text/plain");
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    
    if (sourceGroupId === targetGroupId) return;
    
    setGroups(prevGroups => {
      const updated = prevGroups.map(group => {
        // Remove from source
        if (group.id === sourceGroupId) {
          return {
            ...group,
            studentIds: group.studentIds.filter(id => id !== studentId)
          };
        }
        // Add to target
        if (group.id === targetGroupId) {
          return {
            ...group,
            studentIds: [...group.studentIds, studentId]
          };
        }
        return group;
      });
      
      // Auto-save the drag and drop configuration to Firestore
      saveAllWeightages(updated);
      return updated;
    });
  };

  // Add a new weightage group
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("कृपया भारांश नाव प्रविष्ट करा!");
      return;
    }
    
    const newGroup: WeightageGroup = {
      id: `group_${Date.now()}`,
      name: groupName.trim(),
      studentIds: []
    };
    
    const updated = [...groups, newGroup];
    setGroups(updated);
    setGroupName("");
    setIsAddModalOpen(false);
    toast.success("नवीन भारांश बॉक्स जोडला गेला!");
    saveAllWeightages(updated);
  };

  // Start detailed group edit
  const startEditGroup = (group: WeightageGroup) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditSubjectIndex(0);
    
    const initialSubjects: Record<string, WeightageSubject> = {};
    SUBJECTS_LIST.forEach(sub => {
      const existing = group.subjects?.[sub.id];
      initialSubjects[sub.id] = {
        akarik_todi: existing?.akarik_todi ?? "",
        akarik_pratyakshik: existing?.akarik_pratyakshik ?? "",
        akarik_upakram: existing?.akarik_upakram ?? "",
        akarik_prakalp: existing?.akarik_prakalp ?? "",
        akarik_chachani: existing?.akarik_chachani ?? "",
        akarik_swadhyay: existing?.akarik_swadhyay ?? "",
        akarik_itar: existing?.akarik_itar ?? "",
        sankalik_todi: existing?.sankalik_todi ?? "",
        sankalik_pratyakshik: existing?.sankalik_pratyakshik ?? "",
        sankalik_lekhi: existing?.sankalik_lekhi ?? ""
      };
    });
    setEditGroupSubjects(initialSubjects);
  };

  // Detailed group input change helper
  const handleDetailedInputChange = (subId: string, field: keyof WeightageSubject, value: string) => {
    let numVal: number | "" = value === "" ? "" : Number(value);
    if (numVal !== "") {
      if (isNaN(numVal) || numVal < 0) return;
    }
    
    setEditGroupSubjects(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: numVal
      }
    }));
  };

  // Sum helpers
  const getFormativeSum = (subId: string) => {
    const data = editGroupSubjects[subId];
    if (!data) return 0;
    return (
      (Number(data.akarik_todi) || 0) +
      (Number(data.akarik_pratyakshik) || 0) +
      (Number(data.akarik_upakram) || 0) +
      (Number(data.akarik_prakalp) || 0) +
      (Number(data.akarik_chachani) || 0) +
      (Number(data.akarik_swadhyay) || 0) +
      (Number(data.akarik_itar) || 0)
    );
  };

  const getSummativeSum = (subId: string) => {
    const data = editGroupSubjects[subId];
    if (!data) return 0;
    return (
      (Number(data.sankalik_todi) || 0) +
      (Number(data.sankalik_pratyakshik) || 0) +
      (Number(data.sankalik_lekhi) || 0)
    );
  };

  // Save detailed group configurations
  const handleSaveGroupDetailed = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingGroup || !editGroupName.trim()) {
      toast.error("कृपया भारांश नाव प्रविष्ट करा!");
      return;
    }

    const updatedGroups = groups.map(g => {
      if (g.id === editingGroup.id) {
        return {
          ...g,
          name: editGroupName.trim(),
          subjects: editGroupSubjects
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    setEditingGroup(null);
    await saveAllWeightages(updatedGroups);
  };

  // Pager navigation or save
  const handleNextSubject = async () => {
    if (editSubjectIndex < SUBJECTS_LIST.length - 1) {
      setEditSubjectIndex(prev => prev + 1);
    } else {
      await handleSaveGroupDetailed();
    }
  };

  // Duplicate group layout
  const handleDuplicateGroup = (group: WeightageGroup) => {
    const duplicatedGroup: WeightageGroup = {
      id: `group_${Date.now()}`,
      name: `${group.name} (Copy)`,
      studentIds: [...group.studentIds],
      subjects: group.subjects ? JSON.parse(JSON.stringify(group.subjects)) : undefined
    };
    const updated = [...groups, duplicatedGroup];
    setGroups(updated);
    toast.success("भारांश बॉक्स कॉपी केला गेला!");
    saveAllWeightages(updated);
  };

  // Delete weightage group
  const handleDeleteGroup = (groupId: string, name: string) => {
    if (groups.length <= 1) {
      toast.error("किमान एक भारांश बॉक्स असणे आवश्यक आहे!");
      return;
    }
    if (!confirm(`तुम्हाला खात्री आहे की तुम्ही ${name} डिलीट करू इच्छिता? (यातील विद्यार्थी अनअसाईन होतील)`)) return;
    
    const groupToDelete = groups.find(g => g.id === groupId);
    const orphanIds = groupToDelete ? groupToDelete.studentIds : [];
    
    const updated = groups.filter(g => g.id !== groupId);
    if (updated.length > 0 && orphanIds.length > 0) {
      updated[0].studentIds = [...updated[0].studentIds, ...orphanIds];
    }
    
    setGroups(updated);
    toast.success("भारांश बॉक्स डिलीट केला गेला.");
    saveAllWeightages(updated);
  };

  // Save Settings to Firebase Firestore
  const saveAllWeightages = async (updatedGroups: WeightageGroup[]) => {
    setSaving(true);
    try {
      const docRef = doc(db, "weightages", `${selectedClass}_${academicYear}_${activeTerm}`);
      await setDoc(docRef, {
        class: selectedClass,
        academicYear,
        term: activeTerm,
        groups: updatedGroups,
        updatedAt: new Date().toISOString()
      });
      toast.success("सर्व माहिती यशस्वीरित्या सेव्ह केली गेली!");
    } catch (err) {
      console.error("Error saving weightages:", err);
      toast.error("माहिती जतन करण्यात अडचण आली.");
    } finally {
      setSaving(false);
    }
  };

  // Get student detail helpers
  const getStudentRollNo = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.rollNo || 0;
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.fullName || "Student";
  };

  // ══════════════════════════════════════════════════
  // RENDER: DETAILED WEIGHTAGE EDIT SCREEN (DARK THEME)
  // ══════════════════════════════════════════════════
  if (editingGroup) {
    const activeSub = SUBJECTS_LIST[editSubjectIndex];
    const subWeight = editGroupSubjects[activeSub.id] || {
      akarik_todi: "", akarik_pratyakshik: "", akarik_upakram: "", 
      akarik_prakalp: "", akarik_chachani: "", akarik_swadhyay: "", akarik_itar: "",
      sankalik_todi: "", sankalik_pratyakshik: "", sankalik_lekhi: ""
    };

    const formativeSum = getFormativeSum(activeSub.id);
    const summativeSum = getSummativeSum(activeSub.id);

    return (
      <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[500px]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#1C2C22] relative z-10">
          <button 
            onClick={() => setEditingGroup(null)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">भारांश निश्चिती संपादन करा</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Edit Weightage Settings</p>
          </div>
        </div>

        {/* Group Name Field */}
        <div className="space-y-1.5 mb-6 relative z-10">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">भारांश निश्चितीचे नाव*</label>
          <input 
            type="text"
            required
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            className="w-full bg-[#16221A] border border-[#24352B] rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:border-emerald-600 transition-colors text-white"
          />
        </div>

        {/* Subject Pager */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10 bg-[#16221A]/30 border border-[#22352B]/40 p-3 rounded-2xl">
          <span className="text-sm font-black text-white px-2">
            {SUBJECT_DISPLAY_NAMES[activeSub.id] || activeSub.name}
          </span>

          <div className="flex items-center gap-3 bg-[#16221A] border border-[#24352B] px-3.5 py-1.5 rounded-xl shrink-0">
            <button
              onClick={() => editSubjectIndex > 0 && setEditSubjectIndex(prev => prev - 1)}
              disabled={editSubjectIndex === 0}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black text-white tracking-widest min-w-[35px] text-center">
              {editSubjectIndex + 1} / {SUBJECTS_LIST.length}
            </span>
            <button
              onClick={() => editSubjectIndex < SUBJECTS_LIST.length - 1 && setEditSubjectIndex(prev => prev + 1)}
              disabled={editSubjectIndex === SUBJECTS_LIST.length - 1}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Formative & Summative Weightages */}
        <div className="space-y-6 relative z-10 pb-20">
          
          {/* Formative Settings */}
          <div className="bg-[#16221A]/60 border border-[#22352B] p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#22352B]/60">
              <h4 className="text-sm font-black text-emerald-400 tracking-wide">आकारिक मूल्यमापन</h4>
              <span className="text-xs font-extrabold text-slate-400">एकूण गुण: {formativeSum}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* तोंडीकाम */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">तोंडीकाम</span>
                <input 
                  type="number"
                  placeholder="उदा. 20"
                  value={subWeight.akarik_todi}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_todi", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* प्रात्यक्षिक / प्रयोग */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">प्रात्यक्षिक / प्रयोग</span>
                <input 
                  type="number"
                  placeholder="उदा. 15"
                  value={subWeight.akarik_pratyakshik}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_pratyakshik", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* उपक्रम / कृती */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">उपक्रम / कृती</span>
                <input 
                  type="number"
                  placeholder="उदा. 15"
                  value={subWeight.akarik_upakram}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_upakram", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* प्रकल्प */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">प्रकल्प</span>
                <input 
                  type="number"
                  placeholder="उदा. 10"
                  value={subWeight.akarik_prakalp}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_prakalp", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* चाचणी (लेखी) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">चाचणी (लेखी)</span>
                <input 
                  type="number"
                  placeholder="उदा. 20"
                  value={subWeight.akarik_chachani}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_chachani", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* स्वाध्याय / वर्गकार्य */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">स्वाध्याय / वर्गकार्य</span>
                <input 
                  type="number"
                  placeholder="उदा. 15"
                  value={subWeight.akarik_swadhyay}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_swadhyay", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* इतर */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">इतर</span>
                <input 
                  type="number"
                  placeholder="उदा. 10"
                  value={subWeight.akarik_itar}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "akarik_itar", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 pt-2 border-t border-[#22352B]/40">
              <span>एकूण गुण: <span className="text-[#A3E635] font-black text-base">{formativeSum}</span></span>
            </div>
          </div>

          {/* Summative Settings */}
          <div className="bg-[#16221A]/60 border border-[#22352B] p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#22352B]/60">
              <h4 className="text-sm font-black text-emerald-400 tracking-wide">संकलित मूल्यमापन</h4>
              <span className="text-xs font-extrabold text-slate-400">एकूण गुण: {summativeSum}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* तोंडी */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">तोंडी</span>
                <input 
                  type="number"
                  placeholder="उदा. 10"
                  value={subWeight.sankalik_todi}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "sankalik_todi", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* प्रात्यक्षिक */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">प्रात्यक्षिक</span>
                <input 
                  type="number"
                  placeholder="उदा. 10"
                  value={subWeight.sankalik_pratyakshik}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "sankalik_pratyakshik", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>

              {/* लेखी */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold">लेखी</span>
                <input 
                  type="number"
                  placeholder="उदा. 20"
                  value={subWeight.sankalik_lekhi}
                  onChange={(e) => handleDetailedInputChange(activeSub.id, "sankalik_lekhi", e.target.value)}
                  className="bg-[#0B1510] border border-[#24352B] focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-black text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 pt-2 border-t border-[#22352B]/40">
              <span>एकूण गुण: <span className="text-[#A3E635] font-black text-base">{summativeSum}</span></span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 mt-8 relative z-10 pt-4 border-t border-[#1C2C22]">
          <button 
            onClick={() => handleSaveGroupDetailed()}
            className="flex-1 py-3.5 border border-[#24352B] bg-[#16221A] hover:bg-[#1E2F23]/80 hover:border-emerald-600 text-white font-extrabold rounded-2xl transition-all cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            जतन करा (Save Changes)
          </button>
          
          <button 
            onClick={handleNextSubject}
            disabled={saving}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/20 cursor-pointer text-xs sm:text-sm tracking-wide"
          >
            {saving ? "जतन होत आहे..." : editSubjectIndex < SUBJECTS_LIST.length - 1 ? "पुढे" : "पूर्ण करा"}
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
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">भारांश निश्चिती</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Grade Weightage Settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#24352B] bg-[#16221A]/40 rounded-2xl p-1 mb-6 relative z-10 max-w-sm">
        <button
          onClick={() => setActiveTerm("first")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTerm === "first" ? "bg-[#1E3A27] text-emerald-400 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          प्रथम सत्र
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

      {/* Description Panel */}
      <div className="bg-[#132A1C]/60 border border-[#1E432D]/60 text-[#A3E635] p-4 rounded-3xl text-xs leading-relaxed mb-6 flex items-start gap-3 relative z-10">
        <HelpCircle size={16} className="shrink-0 mt-0.5" />
        <span>
          आता तुम्ही एकाधिक भारांश निश्चित करू शकता. विद्यार्थ्यांच्या गरजेनुसार प्रकल्प किंवा इतर भारांश ठरवता येतील. विद्यार्थ्यांचा हजेरी क्रमांक असलेले वर्तुळ योग्य भारांश निश्चितीच्या बॉक्समध्ये ड्रॅग आणि ड्रॉप करावे.
        </span>
      </div>

      {/* Main Drag-Drop Workspace */}
      <div className="relative z-10 space-y-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-500 font-bold gap-3">
            <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>भारांश डेटा लोड होत आहे...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="bg-[#16221A] border border-[#22352B] rounded-3xl p-5 shadow-sm"
              >
                {/* Group Header Actions */}
                <div className="flex items-center justify-between mb-4 border-b border-[#24352B] pb-2">
                  <h4 className="text-sm font-extrabold text-white">{group.name} ({group.studentIds.length})</h4>
                  
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button 
                      onClick={() => startEditGroup(group)}
                      className="p-1.5 hover:bg-[#1E2E24] hover:text-emerald-400 transition-colors rounded-lg cursor-pointer"
                      title="Edit Group Details"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDuplicateGroup(group)}
                      className="p-1.5 hover:bg-[#1E2E24] hover:text-emerald-400 transition-colors rounded-lg cursor-pointer"
                      title="Duplicate Layout"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-1.5 hover:bg-[#1E2E24] hover:text-red-400 transition-colors rounded-lg cursor-pointer"
                      title="Delete Group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Draggable container Drop Zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, group.id)}
                  className="min-h-[70px] flex flex-wrap gap-2.5 p-3.5 bg-[#0B1510] border border-[#24352B] rounded-2xl transition-colors focus:border-emerald-600"
                >
                  {group.studentIds.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic m-auto select-none pointer-events-none">
                      विद्यार्थी ड्रॅग करून येथे जोडा
                    </span>
                  ) : (
                    group.studentIds.map((studentId) => {
                      const rollNo = getStudentRollNo(studentId);
                      const sName = getStudentName(studentId);
                      if (rollNo === 0) return null; // Filter deleted
                      
                      return (
                        <div 
                          key={studentId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, studentId, group.id)}
                          className="size-9 rounded-full bg-[#1E3A27] border border-emerald-800 text-[#A3E635] hover:text-white hover:bg-emerald-600 hover:border-emerald-500 flex items-center justify-center font-bold text-sm cursor-grab active:cursor-grabbing transition-all hover:scale-110 shadow-sm shrink-0"
                          title={sName}
                        >
                          {rollNo}
                        </div>
                      );
                    })
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
          setGroupName("");
          setIsAddModalOpen(true);
        }}
        className="absolute bottom-6 right-6 size-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
      >
        <Plus size={24} />
      </button>

      {/* ADD GROUP MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1510] border border-[#24352B] w-full max-w-md rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-emerald-950/40 p-2 rounded-xl text-emerald-400">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">नवीन भारांश बॉक्स जोडा</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Add Weightage Group</p>
                </div>
              </div>

              <form onSubmit={handleAddGroup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">नाव (Group Name) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="उदा. भारांश निश्चिती 2"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-[#16221A] border border-[#24352B] rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-600 transition-colors text-white"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  <Sparkles size={16} />
                  बॉक्स तयार करा (Add Box)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
