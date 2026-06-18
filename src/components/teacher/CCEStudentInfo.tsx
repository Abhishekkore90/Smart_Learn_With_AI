import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

interface StudentRecord {
  id: string;
  name: string;
  fullName?: string;
  rollNo: string;
  gender: string;
  parentName?: string;
  photoUrl?: string;
  class: string;
  academicYear?: string;
  role: string;
}

interface StudentDetails {
  registrationNo: string;
  dob: string;
  address: string;
  phone: string;
  aadhar: string;
  studentId: string;
  aparId: string;
  height: string;
  weight: string;
  religion: string;
  caste: string;
  sickCount: string;
  motherName: string;
  motherEducation: string;
  motherOccupation: string;
  fatherName: string;
  fatherEducation: string;
  fatherOccupation: string;
  siblingsCount: string;
  siblingsAge: string;
  motherTongue: string;
  regionType: "ग्रामीण" | "शहरी";
}

const emptyDetails = (): StudentDetails => ({
  registrationNo: "",
  dob: "",
  address: "",
  phone: "",
  aadhar: "",
  studentId: "",
  aparId: "",
  height: "",
  weight: "",
  religion: "",
  caste: "",
  sickCount: "0",
  motherName: "",
  motherEducation: "",
  motherOccupation: "",
  fatherName: "",
  fatherEducation: "",
  fatherOccupation: "",
  siblingsCount: "0",
  siblingsAge: "",
  motherTongue: "",
  regionType: "ग्रामीण",
});

// Floating label input
function FloatInput({
  label,
  value,
  onChange,
  type = "text",
  clearable,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  clearable?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative border border-[#2d4730] rounded-xl overflow-hidden bg-[#0b0e0a]">
      <span className="absolute top-2 left-3 text-[10px] text-[#6b8f6b] font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="w-full pt-6 pb-3 px-3 bg-transparent text-[#d1fae5] text-sm font-medium outline-none pr-8"
      />
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] hover:text-white text-lg leading-none cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}

// Plain input (no floating label)
function PlainInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="border border-[#2d4730] rounded-xl bg-[#0b0e0a] overflow-hidden">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-4 bg-transparent text-[#d1fae5] text-sm font-medium outline-none placeholder:text-[#3d5d41]"
      />
    </div>
  );
}

export function CCEStudentInfo({
  selectedClass,
  onBack,
}: {
  selectedClass: string;
  onBack: () => void;
}) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [details, setDetails] = useState<StudentDetails>(emptyDetails());
  const [saving, setSaving] = useState(false);

  const academicYear = localStorage.getItem("cce_academic_year") || "2025-2026";

  // Load students
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("class", "==", selectedClass)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const dd = d.data();
        return {
          id: d.id,
          name: dd.fullName || dd.name || "",
          fullName: dd.fullName || dd.name || "",
          rollNo: dd.rollNo || "",
          gender: dd.gender || "",
          parentName: dd.parentName || "",
          photoUrl: dd.photoUrl || "",
          class: dd.class || selectedClass,
          academicYear: dd.academicYear || academicYear,
          role: "student",
        } as StudentRecord;
      });
      data.sort((a, b) => parseInt(a.rollNo || "999") - parseInt(b.rollNo || "999"));
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, [selectedClass, academicYear]);

  // Open edit form for a student — load existing details from Firestore
  const openEdit = async (student: StudentRecord) => {
    setEditingStudent(student);
    try {
      const ref = doc(db, "student_details", student.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDetails({ ...emptyDetails(), ...snap.data() } as StudentDetails);
      } else {
        // prefill from base record
        setDetails({
          ...emptyDetails(),
          phone: (student as any).phone || "",
          fatherName: student.parentName || "",
        });
      }
    } catch {
      setDetails(emptyDetails());
    }
  };

  const saveDetails = async () => {
    if (!editingStudent) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "student_details", editingStudent.id), {
        ...details,
        studentId_ref: editingStudent.id,
        class: selectedClass,
        academicYear,
        updatedAt: new Date().toISOString(),
      });
      // Also update base user doc with essential fields
      await updateDoc(doc(db, "users", editingStudent.id), {
        phone: details.phone,
        aadhar: details.aadhar,
        address: details.address,
        dob: details.dob,
        religion: details.religion,
        caste: details.caste,
        motherTongue: details.motherTongue,
        updatedAt: new Date().toISOString(),
      });
      toast.success("विद्यार्थी माहिती जतन झाली!");
      setEditingStudent(null);
    } catch (err: any) {
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSaving(false);
  };

  const set = <K extends keyof StudentDetails>(key: K, val: StudentDetails[K]) =>
    setDetails((prev) => ({ ...prev, [key]: val }));

  // ─── EDIT FORM VIEW ───
  if (editingStudent) {
    const idx = students.indexOf(editingStudent);
    return (
      <div
        className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
        style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <button
            onClick={() => setEditingStudent(null)}
            className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold text-[#d1fae5]">विद्यार्थी माहिती संपादन करा</h2>
        </div>

        {/* Student name badge */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a2e1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1e4620] text-[#d1fae5] font-bold text-sm flex items-center justify-center border border-[#2d4a2d] flex-shrink-0">
              {idx + 1}
            </div>
            <span className="text-[#d1fae5] text-[14px] font-medium">
              {editingStudent.name}
            </span>
          </div>
          <span className="text-[#6b8f6b] text-xs">{selectedClass}</span>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 space-y-3">
          {/* नोंदणी क्रमांक */}
          <FloatInput label="नोंदणी क्रमांक" value={details.registrationNo} onChange={(v) => set("registrationNo", v)} />

          {/* जन्म तारीख */}
          <FloatInput label="जन्म तारीख" value={details.dob} onChange={(v) => set("dob", v)} placeholder="DD MMM YYYY" />

          {/* पत्ता */}
          <FloatInput label="पत्ता" value={details.address} onChange={(v) => set("address", v)} />

          {/* फोन नंबर */}
          <FloatInput label="फोन नंबर" value={details.phone} onChange={(v) => set("phone", v)} type="tel" />

          {/* आधार क्रमांक */}
          <FloatInput label="आधार क्रमांक" value={details.aadhar} onChange={(v) => set("aadhar", v)} />

          {/* स्टुडन्ट आयडी */}
          <PlainInput value={details.studentId} onChange={(v) => set("studentId", v)} placeholder="स्टुडन्ट आयडी" />

          {/* अपार आयडी */}
          <PlainInput value={details.aparId} onChange={(v) => set("aparId", v)} placeholder="अपार आयडी" />

          {/* उंची + वजन */}
          <div className="grid grid-cols-2 gap-3">
            <PlainInput value={details.height} onChange={(v) => set("height", v)} placeholder="उंची" />
            <PlainInput value={details.weight} onChange={(v) => set("weight", v)} placeholder="वजन" />
          </div>

          {/* धर्म */}
          <FloatInput label="धर्म" value={details.religion} onChange={(v) => set("religion", v)} clearable />

          {/* जात */}
          <FloatInput label="जात" value={details.caste} onChange={(v) => set("caste", v)} clearable />

          {/* विद्यार्थी किती वेळा आजारी पडला */}
          <div>
            <p className="text-[#d1fae5] text-sm font-medium mb-2">विद्यार्थी किती वेळा आजारी पडला आहे?</p>
            <div className="border border-[#2d4730] rounded-xl bg-[#0b0e0a] overflow-hidden">
              <input
                type="number"
                value={details.sickCount}
                onChange={(e) => set("sickCount", e.target.value)}
                className="w-full px-4 py-4 bg-transparent text-[#d1fae5] text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* आई/पालक माहिती */}
          <div>
            <p className="text-[#d1fae5] text-sm font-semibold mt-2 mb-3">आई/पालक माहिती</p>
            <div className="space-y-3">
              <FloatInput label="नाव*" value={details.motherName} onChange={(v) => set("motherName", v)} />
              <PlainInput value={details.motherEducation} onChange={(v) => set("motherEducation", v)} placeholder="शिक्षण" />
              <FloatInput label="व्यवसाय" value={details.motherOccupation} onChange={(v) => set("motherOccupation", v)} />
            </div>
          </div>

          {/* वडील/पालक माहिती */}
          <div>
            <p className="text-[#d1fae5] text-sm font-semibold mt-2 mb-3">वडील/पालक माहिती</p>
            <div className="space-y-3">
              <FloatInput label="नाव*" value={details.fatherName} onChange={(v) => set("fatherName", v)} />
              <PlainInput value={details.fatherEducation} onChange={(v) => set("fatherEducation", v)} placeholder="शिक्षण" />
              <FloatInput label="व्यवसाय" value={details.fatherOccupation} onChange={(v) => set("fatherOccupation", v)} />
            </div>
          </div>

          {/* भावंडांची संख्या */}
          <FloatInput label="भावंडांची संख्या" value={details.siblingsCount} onChange={(v) => set("siblingsCount", v)} type="number" />

          {/* भावंडांचे वय */}
          <PlainInput value={details.siblingsAge} onChange={(v) => set("siblingsAge", v)} placeholder="भावंडांचे वय" />

          {/* मातृभाषा */}
          <FloatInput label="मातृभाषा" value={details.motherTongue} onChange={(v) => set("motherTongue", v)} />

          {/* प्रदेश प्रकार */}
          <div>
            <p className="text-[#d1fae5] text-sm font-semibold mt-2 mb-3">प्रदेश प्रकार</p>
            <div className="flex items-center gap-8">
              {(["ग्रामीण", "शहरी"] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => set("regionType", opt)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      details.regionType === opt
                        ? "border-[#4ade80] bg-[#4ade80]"
                        : "border-[#2d4730] hover:border-[#4ade80]"
                    }`}
                  >
                    {details.regionType === opt && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0b0e0a]" />
                    )}
                  </div>
                  <span className="text-[#d1fae5] text-sm font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed save button */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0b0e0a] to-transparent">
          <button
            onClick={saveDetails}
            disabled={saving}
            className="w-full py-4 bg-[#8fbf7f] hover:bg-[#a2d192] active:scale-[0.99] text-black font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div
      className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col relative select-none"
      style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a2e1a]">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-[#1a231a] rounded-full transition-colors cursor-pointer text-white flex items-center justify-center"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">विद्यार्थ्यांची माहिती</h2>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]" />
            <span className="text-xs text-[#6b8f6b] font-bold">विद्यार्थी लोड होत आहेत...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#6b8f6b] font-bold text-sm">अद्याप कोणताही विद्यार्थी जोडला नाही</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {students.map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center justify-between px-2 py-3.5 rounded-xl hover:bg-[#121a12] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#1e4620] text-[#4ade80] font-bold text-sm flex items-center justify-center border border-[#2d4a2d]">
                    {idx + 1}
                  </div>
                  <span className="text-[15px] font-medium text-[#d1fae5]">{student.name}</span>
                </div>

                {/* Crescent icon — direct edit on click */}
                <button
                  onClick={() => openEdit(student)}
                  className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#1a2e1a] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#4ade80]">
                    <path
                      d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c1.66 0 3.22-.45 4.56-1.24A7 7 0 0 1 10 12a7 7 0 0 1 6.56-6.98C15.22 3.73 13.66 3 12 3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB for adding students */}
      <button
        onClick={() => toast.info("विद्यार्थी जोडण्यासाठी admin panel वापरा")}
        className="absolute bottom-6 right-6 size-14 bg-[#1e4620] hover:bg-[#275a2a] text-white rounded-full shadow-lg shadow-black/40 flex items-center justify-center hover:scale-105 transition-all cursor-pointer border border-[#2a592c]/50 z-30"
        title="विद्यार्थी जोडा"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
