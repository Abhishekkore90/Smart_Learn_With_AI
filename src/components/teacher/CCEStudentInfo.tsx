import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  X, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Trash2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  doc,
  updateDoc,
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  class: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  address?: string;
  email?: string;
  photoUrl?: string;
  division?: string;
  
  // Custom Marathi fields matching screenshots
  rollNo?: string;
  aadhaar?: string;
  studentId?: string;
  apaarId?: string;
  height?: string;
  weight?: string;
  religion?: string;
  caste?: string;
  illnessCount?: string;
  motherName?: string;
  motherEducation?: string;
  motherOccupation?: string;
  fatherName?: string;
  fatherEducation?: string;
  fatherOccupation?: string;
  siblingCount?: string;
  siblingAge?: string;
  motherTongue?: string;
  areaType?: string;
}

interface CCEStudentInfoProps {
  selectedClass: string;
  onBack: () => void;
}

export function CCEStudentInfo({ selectedClass, onBack }: CCEStudentInfoProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  
  // Custom Marathi fields states
  const [rollNo, setRollNo] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [studentId, setStudentId] = useState("");
  const [apaarId, setApaarId] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [illnessCount, setIllnessCount] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherEducation, setMotherEducation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherEducation, setFatherEducation] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [siblingCount, setSiblingCount] = useState("");
  const [siblingAge, setSiblingAge] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [areaType, setAreaType] = useState("ग्रामीण");

  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

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
          gender: data.gender || "Male",
          birthdate: data.birthdate || "",
          phone: data.phone || "",
          address: data.address || "",
          email: data.email || "",
          photoUrl: data.photoUrl || "",
          rollNo: data.rollNo || "",
          aadhaar: data.aadhaar || "",
          studentId: data.studentId || "",
          apaarId: data.apaarId || "",
          height: data.height || "",
          weight: data.weight || "",
          religion: data.religion || "",
          caste: data.caste || "",
          illnessCount: data.illnessCount || "",
          motherName: data.motherName || "",
          motherEducation: data.motherEducation || "",
          motherOccupation: data.motherOccupation || "",
          fatherName: data.fatherName || "",
          fatherEducation: data.fatherEducation || "",
          fatherOccupation: data.fatherOccupation || "",
          siblingCount: data.siblingCount || "",
          siblingAge: data.siblingAge || "",
          motherTongue: data.motherTongue || "",
          areaType: data.areaType || "ग्रामीण",
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

  // Calculate profile completion percentage based on field presence
  const calculateCompletion = (student: Student) => {
    const fields = [
      "fullName", "gender", "birthdate", "phone", "address", 
      "rollNo", "aadhaar", "motherName", "fatherName", "motherTongue"
    ];
    let filled = 0;
    fields.forEach(field => {
      const val = student[field as keyof Student];
      if (val && val.toString().trim() !== "") {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  };

  // Open inline edit and pre-fill form
  const handleEditProfile = (student: Student) => {
    setSelectedStudent(student);
    setFullName(student.fullName || "");
    setGender(student.gender || "Male");
    setBirthdate(student.birthdate || "");
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setAddress(student.address || "");
    setPhotoUrl(student.photoUrl || "");
    
    // Set custom Marathi fields
    setRollNo(student.rollNo || "");
    setAadhaar(student.aadhaar || "");
    setStudentId(student.studentId || "");
    setApaarId(student.apaarId || "");
    setHeight(student.height || "");
    setWeight(student.weight || "");
    setReligion(student.religion || "");
    setCaste(student.caste || "");
    setIllnessCount(student.illnessCount || "");
    setMotherName(student.motherName || "");
    setMotherEducation(student.motherEducation || "");
    setMotherOccupation(student.motherOccupation || "");
    setFatherName(student.fatherName || "");
    setFatherEducation(student.fatherEducation || "");
    setFatherOccupation(student.fatherOccupation || "");
    setSiblingCount(student.siblingCount || "");
    setSiblingAge(student.siblingAge || "");
    setMotherTongue(student.motherTongue || "");
    setAreaType(student.areaType || "ग्रामीण");
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("कृपया २ MB पेक्षा लहान आकाराची इमेज निवडा.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      toast.success("विद्यार्थ्याचा फोटो यशस्वीरित्या जोडला गेला!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoUrl("");
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    toast.success("फोटो हटवला गेला.");
  };

  // Save changes to Firestore
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!fullName.trim()) {
      toast.error("कृपया विद्यार्थ्याचे नाव प्रविष्ट करा!");
      return;
    }

    setSaving(true);
    try {
      const studentRef = doc(db, "users", selectedStudent.id);
      await updateDoc(studentRef, {
        fullName: fullName.trim(),
        gender,
        birthdate: birthdate.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        photoUrl: photoUrl.trim(),
        
        // Custom Marathi fields
        rollNo: rollNo.trim(),
        aadhaar: aadhaar.trim(),
        studentId: studentId.trim(),
        apaarId: apaarId.trim(),
        height: height.trim(),
        weight: weight.trim(),
        religion: religion.trim(),
        caste: caste.trim(),
        illnessCount: illnessCount.trim(),
        motherName: motherName.trim(),
        motherEducation: motherEducation.trim(),
        motherOccupation: motherOccupation.trim(),
        fatherName: fatherName.trim(),
        fatherEducation: fatherEducation.trim(),
        fatherOccupation: fatherOccupation.trim(),
        siblingCount: siblingCount.trim(),
        siblingAge: siblingAge.trim(),
        motherTongue: motherTongue.trim(),
        areaType: areaType
      });
      toast.success("विद्यार्थ्याची माहिती यशस्वीरित्या जतन केली!");
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error saving student profile:", err);
      toast.error("माहिती जतन करण्यास अपयश आले.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#0B1510] text-[#E2E8F0] rounded-[2.5rem] p-6 md:p-8 font-sans shadow-2xl border border-[#1C2C22] relative overflow-hidden min-h-[600px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1C2C22] relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedStudent ? () => setSelectedStudent(null) : onBack}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-[#1E2E24] transition-all p-2.5 bg-[#16221A] border border-[#24352B] rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {selectedStudent ? "विद्यार्थी माहिती संपादन करा" : "विद्यार्थ्यांची माहिती"}
            </h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
              {selectedStudent ? "Edit Student Profile" : "Student Profiles & Information"}
            </p>
          </div>
        </div>
        
        {selectedStudent && (
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {selectedClass}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        {selectedStudent ? (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl mx-auto">
            
            {/* Student Index & Name Row */}
            <div className="flex items-center justify-between p-4 bg-[#16221A] rounded-2xl border border-[#22352B] shadow-inner mb-6 max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                  {students.findIndex(s => s.id === selectedStudent.id) + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{fullName || "विद्यार्थ्याचे नाव"}</span>
                  <span className="text-[9px] text-slate-450 font-bold">तुकडी: {selectedStudent.division || "A"}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-450">
                पहिली १
              </span>
            </div>

            {/* Photo Section */}
            <div className="space-y-2 max-w-4xl">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">विद्यार्थी फोटो (Student Photo)</label>
              <input 
                type="file" 
                accept="image/*" 
                ref={photoInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
              {photoUrl ? (
                <div className="border border-[#22352B] rounded-2xl p-4 bg-[#16221A]/55 relative flex flex-col items-center justify-center shadow-inner">
                  <img 
                    src={photoUrl} 
                    alt="Student Photo" 
                    className="max-h-32 rounded-xl object-contain" 
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-3 right-3 p-1.5 bg-[#1C2C22] text-red-400 border border-[#24352B] hover:bg-red-950/20 rounded-lg cursor-pointer transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className="border border-dashed border-[#22352B] hover:border-emerald-600 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer bg-[#16221A]/30 hover:bg-[#1E2D23]/30 transition-all text-slate-455 gap-1.5"
                >
                  <ImageIcon size={28} />
                  <span className="text-xs font-bold">Click to add photo</span>
                </div>
              )}
            </div>

            {/* SECTION 1: वैयक्तिक माहिती (Personal Details) */}
            <div className="bg-[#16221A]/40 border border-[#22352B] p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-emerald-455 uppercase tracking-widest border-b border-[#1C2C22] pb-2">१. वैयक्तिक माहिती (Personal Details)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Student Full Name */}
                <div className="md:col-span-2 relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">विद्यार्थ्याचे पूर्ण नाव *</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* GENDER */}
                <div className="md:col-span-2 flex items-center justify-between p-4 bg-[#16221A]/30 rounded-2xl border border-[#22352B]">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gender (लिंग)</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-0.5">विद्यार्थ्याचे लिंग निवडा</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setGender("Male")}
                      className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                    >
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        gender === "Male" ? "border-emerald-500 text-emerald-500" : "border-slate-600"
                      }`}>
                        {gender === "Male" && <div className="size-2 rounded-full bg-emerald-500" />}
                      </div>
                      <span>Male (मुलगा)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("Female")}
                      className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                    >
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        gender === "Female" ? "border-emerald-500 text-emerald-500" : "border-slate-600"
                      }`}>
                        {gender === "Female" && <div className="size-2 rounded-full bg-emerald-500" />}
                      </div>
                      <span>Female (मुलगी)</span>
                    </button>
                  </div>
                </div>

                {/* USID */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">यूएसआयडी (USID)</label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* नोंदणी क्रमांक */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">नोंदणी क्रमांक</label>
                  <input 
                    type="text" 
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* जन्म तारीख */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">जन्म तारीख</label>
                  <input 
                    type="text" 
                    placeholder="उदा. 03 Jul 2019"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* आधार क्रमांक */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">आधार क्रमांक</label>
                  <input 
                    type="text" 
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* स्टुडन्ट आयडी */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">स्टुडन्ट आयडी</label>
                  <input 
                    type="text" 
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* अपार आयडी */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">अपार आयडी</label>
                  <input 
                    type="text" 
                    value={apaarId}
                    onChange={(e) => setApaarId(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* उंची */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">उंची (Height)</label>
                  <input 
                    type="text" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* वजन */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">वजन (Weight)</label>
                  <input 
                    type="text" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* धर्म */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors flex items-center">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">धर्म (Religion)</label>
                  <input 
                    type="text" 
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold pr-6" 
                  />
                  {religion && (
                    <button type="button" onClick={() => setReligion("")} className="absolute right-3 text-slate-500 hover:text-white transition-colors cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* जात */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors flex items-center">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">जात (Caste)</label>
                  <input 
                    type="text" 
                    value={caste}
                    onChange={(e) => setCaste(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold pr-6" 
                  />
                  {caste && (
                    <button type="button" onClick={() => setCaste("")} className="absolute right-3 text-slate-500 hover:text-white transition-colors cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* SECTION 2: संपर्क आणि पत्ता (Contact & Address) */}
            <div className="bg-[#16221A]/40 border border-[#22352B] p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-emerald-455 uppercase tracking-widest border-b border-[#1C2C22] pb-2">२. संपर्क आणि पत्ता (Contact & Address)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* फोन नंबर */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">फोन नंबर</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* पत्ता */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">पत्ता</label>
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: पालक माहिती (Parents Info) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* आई/पालक माहिती */}
              <div className="bg-[#16221A]/40 border border-[#22352B] p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-emerald-455 uppercase tracking-widest border-b border-[#1C2C22] pb-2">३. आई/पालक माहिती</h3>
                
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">नाव *</label>
                  <input 
                    type="text" 
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">शिक्षण</label>
                  <input 
                    type="text" 
                    value={motherEducation}
                    onChange={(e) => setMotherEducation(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">व्यवसाय</label>
                  <input 
                    type="text" 
                    value={motherOccupation}
                    onChange={(e) => setMotherOccupation(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>
              </div>

              {/* वडील/पालक माहिती */}
              <div className="bg-[#16221A]/40 border border-[#22352B] p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-emerald-455 uppercase tracking-widest border-b border-[#1C2C22] pb-2">४. वडील/पालक माहिती</h3>
                
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">नाव *</label>
                  <input 
                    type="text" 
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">शिक्षण</label>
                  <input 
                    type="text" 
                    value={fatherEducation}
                    onChange={(e) => setFatherEducation(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">व्यवसाय</label>
                  <input 
                    type="text" 
                    value={fatherOccupation}
                    onChange={(e) => setFatherOccupation(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>
              </div>

            </div>

            {/* SECTION 4: इतर माहिती (Other Info) */}
            <div className="bg-[#16221A]/40 border border-[#22352B] p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-emerald-455 uppercase tracking-widest border-b border-[#1C2C22] pb-2">५. इतर माहिती (Other Details)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* आजारी पडल्याची संख्या */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">विद्यार्थी किती वेळा आजारी पडला आहे?</label>
                  <input 
                    type="number" 
                    value={illnessCount}
                    onChange={(e) => setIllnessCount(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* भावंडांची संख्या */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">भावंडांची संख्या</label>
                  <input 
                    type="number" 
                    value={siblingCount}
                    onChange={(e) => setSiblingCount(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* भावंडांचे वय */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">भावंडांचे वय</label>
                  <input 
                    type="text" 
                    value={siblingAge}
                    onChange={(e) => setSiblingAge(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* मातृभाषा */}
                <div className="relative border border-[#22352B] focus-within:border-emerald-500 rounded-xl px-4 py-2 bg-[#16221A]/20 transition-colors">
                  <label className="absolute -top-2 left-3 bg-[#0B1510] px-1 text-[10px] text-slate-450 font-bold">मातृभाषा</label>
                  <input 
                    type="text" 
                    value={motherTongue}
                    onChange={(e) => setMotherTongue(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-sm py-1 font-semibold" 
                  />
                </div>

                {/* प्रदेश प्रकार */}
                <div className="md:col-span-2 flex flex-col gap-2 p-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">प्रदेश प्रकार</label>
                  <div className="flex items-center gap-6 mt-1">
                    <button
                      type="button"
                      onClick={() => setAreaType("ग्रामीण")}
                      className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                    >
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        areaType === "ग्रामीण" ? "border-emerald-500 text-emerald-500" : "border-slate-600"
                      }`}>
                        {areaType === "ग्रामीण" && <div className="size-2 rounded-full bg-emerald-500" />}
                      </div>
                      <span>ग्रामीण (Rural)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAreaType("शहरी")}
                      className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                    >
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        areaType === "शहरी" ? "border-emerald-500 text-emerald-500" : "border-slate-600"
                      }`}>
                        {areaType === "शहरी" && <div className="size-2 rounded-full bg-emerald-500" />}
                      </div>
                      <span>शहरी (Urban)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Save Button */}
            <div className="max-w-4xl pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-[#A3E635] hover:bg-[#86EFAC] text-[#0B1510] font-black rounded-full text-sm transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/45"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                जतन करा
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 min-h-[300px] pb-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-emerald-500 font-bold gap-3">
                <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>विद्यार्थी माहिती लोड होत आहे...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-20 text-slate-500 italic text-sm bg-[#16221A]/20 rounded-2xl border border-[#22352B]">
                या वर्गात कोणतेही विद्यार्थी उपलब्ध नाहीत.
              </div>
            ) : (
              <div className="space-y-3 max-w-xl mx-auto">
                {students.map((student, index) => {
                  const completion = calculateCompletion(student);
                  const isCompleted = completion === 100;

                  return (
                    <div 
                      key={student.id} 
                      onClick={() => handleEditProfile(student)}
                      className="bg-[#16221A] border border-[#22352B] hover:border-emerald-600/50 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer hover:bg-[#1E2D23]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Circular Index Badge */}
                        <div className="size-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[#A3E635] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                            {student.fullName}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5">
                            प्रोफाइल पूर्णता: {completion}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Completion Status Check-circle */}
                      <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                        isCompleted 
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-sm" 
                          : "border-emerald-650/40 text-transparent"
                      }`}>
                        {isCompleted ? (
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
      </div>
    </div>
  );
}
