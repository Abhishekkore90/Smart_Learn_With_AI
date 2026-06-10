import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import {
  Camera,
  ChevronDown,
  User,
  MapPin,
  School,
  FileText,
  Users,
  CreditCard,
  Calendar,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/teacher/stats-student")({
  head: () => ({
    meta: [{ title: "Register New Student — Educator Portal" }],
  }),
  component: RegisterStudentPage,
});

function RegisterStudentPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Core Fields
  const [bookNo, setBookNo] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [saralId, setSaralId] = useState("");
  const [apaarId, setApaarId] = useState("");
  const [studentPen, setStudentPen] = useState("");
  const [educationalYear, setEducationalYear] = useState("2026-2027");
  const [admissionClass, setAdmissionClass] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [division, setDivision] = useState("");
  const [dateOfAdmission, setDateOfAdmission] = useState("2026-06-10");
  const [isActive, setIsActive] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);

  // Bottom Details Sections States
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    birthPlace: "",
    religion: "",
    caste: "",
    category: "",
    motherTongue: "",
    nationality: "Indian",
    aadhaarNo: "",
    bloodGroup: "",
  });

  const [addressDetails, setAddressDetails] = useState({
    houseNo: "",
    city: "",
    taluka: "",
    district: "",
    state: "Maharashtra",
    pinCode: "",
    isSameAsPermanent: false,
    correspondenceAddress: "",
    mobile: "",
    altMobile: "",
    email: "",
  });

  const [previousSchoolDetails, setPreviousSchoolDetails] = useState({
    schoolName: "",
    board: "",
    lastClass: "",
    passingYear: "",
    marksObtained: "",
    outOfMarks: "",
    grade: "",
    tcNumber: "",
    tcIssueDate: "",
  });

  const [otherDetails, setOtherDetails] = useState({
    disabilityType: "None",
    disabilityPercentage: "",
    minorityStatus: "No",
    mediumOfInstruction: "Marathi",
    heightCm: "",
    weightKg: "",
    identificationMark: "",
    transportRequired: "No",
  });

  const [parentsDetails, setParentsDetails] = useState({
    fatherName: "",
    fatherOccupation: "",
    fatherIncome: "",
    fatherPhone: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNo: "",
    confirmAccountNo: "",
    ifscCode: "",
    branchName: "",
    holderName: "",
    aadhaarLinked: "Yes",
  });

  // Accordion Expand/Collapse States
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: false,
    address: false,
    previous: false,
    other: false,
    parents: false,
    bank: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Dynamic Suggest Register Number on Mount
  useEffect(() => {
    const fetchNextRegNo = async () => {
      try {
        const udise = profile?.udise || localStorage.getItem("teacher_udise") || "default";
        // Query the latest students collection
        const q = query(collection(db, "students"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        
        let maxNum = 1000;
        snap.forEach((doc) => {
          const data = doc.data();
          const parsed = parseInt(data.registerNo, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        });
        
        setRegisterNo((maxNum + 1).toString());
      } catch (err) {
        console.error("Error determining next register no:", err);
        setRegisterNo("1001"); // default fallback
      }
    };
    fetchNextRegNo();
  }, [profile]);

  // Dynamic Age calculation
  const calculatedAge = (() => {
    const dobString = personalDetails.dateOfBirth;
    if (!dobString) return "";
    const dob = new Date(dobString);
    const today = new Date();
    if (isNaN(dob.getTime())) return "";

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    if (today.getDate() < dob.getDate()) {
      months--;
    }

    if (years < 0) return "";
    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` & ${months} month${months !== 1 ? "s" : ""}` : ""}`;
  })();

  // Dynamic Percentage Calculation
  const calculatedPercentage = (() => {
    const obs = parseFloat(previousSchoolDetails.marksObtained);
    const tot = parseFloat(previousSchoolDetails.outOfMarks);
    if (!isNaN(obs) && !isNaN(tot) && tot > 0) {
      return ((obs / tot) * 100).toFixed(2) + "%";
    }
    return "";
  })();

  // Sync Admission Class to Current Class
  const handleAdmissionClassChange = (val: string) => {
    setAdmissionClass(val);
    if (!currentClass || currentClass === "") {
      setCurrentClass(val);
    }
  };

  // Sync Address Details to Correspondence address
  const handleAddressPartChange = (field: string, val: any) => {
    setAddressDetails((prev) => {
      const next = { ...prev, [field]: val };
      if (next.isSameAsPermanent) {
        const parts = [
          next.houseNo,
          next.city,
          next.taluka,
          next.district,
          next.state,
        ].filter(Boolean);
        const suffix = next.pinCode ? ` - ${next.pinCode}` : "";
        next.correspondenceAddress = parts.join(", ") + suffix;
      }
      return next;
    });
  };

  // Handle Photo Picker
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast.success("Student photo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset all states
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel and clear all fields?")) {
      setBookNo("");
      setRegisterNo("");
      setSaralId("");
      setApaarId("");
      setStudentPen("");
      setEducationalYear("2026-2027");
      setAdmissionClass("");
      setCurrentClass("");
      setDivision("");
      setDateOfAdmission("2026-06-10");
      setIsActive(true);
      setPhoto(null);

      setPersonalDetails({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        birthPlace: "",
        religion: "",
        caste: "",
        category: "",
        motherTongue: "",
        nationality: "Indian",
        aadhaarNo: "",
        bloodGroup: "",
      });

      setAddressDetails({
        houseNo: "",
        city: "",
        taluka: "",
        district: "",
        state: "Maharashtra",
        pinCode: "",
        isSameAsPermanent: false,
        correspondenceAddress: "",
        mobile: "",
        altMobile: "",
        email: "",
      });

      setPreviousSchoolDetails({
        schoolName: "",
        board: "",
        lastClass: "",
        passingYear: "",
        marksObtained: "",
        outOfMarks: "",
        grade: "",
        tcNumber: "",
        tcIssueDate: "",
      });

      setOtherDetails({
        disabilityType: "None",
        disabilityPercentage: "",
        minorityStatus: "No",
        mediumOfInstruction: "Marathi",
        heightCm: "",
        weightKg: "",
        identificationMark: "",
        transportRequired: "No",
      });

      setParentsDetails({
        fatherName: "",
        fatherOccupation: "",
        fatherIncome: "",
        fatherPhone: "",
        motherName: "",
        motherOccupation: "",
        motherPhone: "",
        guardianName: "",
        guardianRelation: "",
        guardianPhone: "",
      });

      setBankDetails({
        bankName: "",
        accountNo: "",
        confirmAccountNo: "",
        ifscCode: "",
        branchName: "",
        holderName: "",
        aadhaarLinked: "Yes",
      });

      toast.info("Registration cleared.");
    }
  };

  // Submit Logic
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!registerNo.trim()) {
      toast.error("Please enter the Register Number!");
      return;
    }
    if (!admissionClass) {
      toast.error("Please select an Admission Class!");
      return;
    }
    if (!currentClass) {
      toast.error("Please select a Current Class!");
      return;
    }
    if (!division) {
      toast.error("Please select a Division!");
      return;
    }
    if (!personalDetails.firstName.trim() || !personalDetails.lastName.trim()) {
      toast.error("Please fill in Student's First Name and Last Name in Personal Details!");
      setExpandedSections((prev) => ({ ...prev, personal: true }));
      return;
    }
    if (bankDetails.accountNo !== bankDetails.confirmAccountNo) {
      toast.error("Bank Account Number and Confirm Account Number do not match!");
      setExpandedSections((prev) => ({ ...prev, bank: true }));
      return;
    }

    try {
      const udise = profile?.udise || localStorage.getItem("teacher_udise") || "default";
      const studentData = {
        schoolUdise: udise,
        bookNo,
        registerNo,
        saralId,
        apaarId,
        studentPen,
        educationalYear,
        admissionClass,
        currentClass,
        division,
        dateOfAdmission,
        isActive,
        photo,
        personalDetails,
        addressDetails,
        previousSchoolDetails,
        otherDetails,
        parentsDetails,
        bankDetails,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "students"), studentData);
      toast.success("Student Registered Successfully!");
      navigate({ to: "/teacher" });
    } catch (error) {
      console.error("Error saving student to firestore:", error);
      toast.error("Error registering student. Please try again.");
    }
  };

  const CLASSES_LIST = [
    "1st (Class I)",
    "2nd (Class II)",
    "3rd (Class III)",
    "4th (Class IV)",
    "5th (Class V)",
    "6th (Class VI)",
    "7th (Class VII)",
    "8th (Class VIII)",
    "9th (Class IX)",
    "10th (Class X)",
    "11th (Class XI)",
    "12th (Class XII)",
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-20 min-h-screen pb-16">
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <h2 className="text-3xl font-extrabold text-center text-[#1e3a8a] tracking-tight mb-8">
              Register New Student
            </h2>

            <form onSubmit={handleRegister} className="space-y-8" autoComplete="new-password">
              {/* Form Grid + Sidebar Column */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Fields Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Book No */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Book No
                    </label>
                    <select
                      value={bookNo}
                      onChange={(e) => setBookNo(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    >
                      <option value="">Select Book No</option>
                      <option value="Book 01">Book 01</option>
                      <option value="Book 02">Book 02</option>
                      <option value="Book 03">Book 03</option>
                      <option value="Book 04">Book 04</option>
                    </select>
                  </div>

                  {/* Register NO */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Register NO
                    </label>
                    <input
                      type="text"
                      value={registerNo}
                      onChange={(e) => setRegisterNo(e.target.value)}
                      placeholder="Enter Register NO"
                      autoComplete="new-password"
                      name="student-register-no-autofill-prevent"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    />
                  </div>

                  {/* Student SARAL ID */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Student SARAL ID
                    </label>
                    <input
                      type="text"
                      value={saralId}
                      onChange={(e) => setSaralId(e.target.value)}
                      placeholder="Enter SARAL ID"
                      autoComplete="new-password"
                      name="student-saral-id-autofill-prevent"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    />
                  </div>

                  {/* Student APAAR ID */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Student APAAR ID
                    </label>
                    <input
                      type="text"
                      value={apaarId}
                      onChange={(e) => setApaarId(e.target.value)}
                      placeholder="Enter APAAR ID"
                      autoComplete="new-password"
                      name="student-apaar-id-autofill-prevent"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    />
                  </div>

                  {/* Student PEN */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Student PEN
                    </label>
                    <input
                      type="text"
                      value={studentPen}
                      onChange={(e) => setStudentPen(e.target.value)}
                      placeholder="Enter Student PEN"
                      autoComplete="new-password"
                      name="student-pen-autofill-prevent"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    />
                  </div>

                  {/* Educational Year */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Educational Year
                    </label>
                    <select
                      value={educationalYear}
                      onChange={(e) => setEducationalYear(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    >
                      <option value="2026-2027">2026-2027</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2027-2028">2027-2028</option>
                    </select>
                  </div>

                  {/* Admission Class */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Admission Class
                    </label>
                    <select
                      value={admissionClass}
                      onChange={(e) => handleAdmissionClassChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    >
                      <option value="">Select Class</option>
                      {CLASSES_LIST.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Class */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Current Class
                    </label>
                    <select
                      value={currentClass}
                      onChange={(e) => setCurrentClass(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    >
                      <option value="">Select Class</option>
                      {CLASSES_LIST.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Division */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Division
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                    >
                      <option value="">division</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  {/* Date Of Admission */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1">
                      Date Of Admission
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateOfAdmission}
                        onChange={(e) => setDateOfAdmission(e.target.value)}
                        className="w-full h-10 pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Photo & Register Column */}
                <div className="w-full lg:w-64 flex flex-col items-center lg:items-stretch gap-6 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                      <div className="w-28 h-28 bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-xl flex items-center justify-center overflow-hidden shadow-sm hover:border-[#38bdf8] transition-all">
                        {photo ? (
                          <img src={photo} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-sky-400">
                            <svg
                              className="w-16 h-16 text-sky-500 opacity-80"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-1 right-1 size-6 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors">
                        <Camera className="size-3" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                      Student's Photo:
                    </span>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? "bg-sky-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-sm font-black text-slate-900 uppercase">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#dc2626] font-semibold text-center lg:text-left leading-relaxed max-w-[200px]">
                      The student is currently active. Click the switch to inactive the student.
                    </p>
                  </div>

                  <hr className="border-slate-200 my-1 w-full" />

                  {/* Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#15803d] hover:bg-[#166534] text-white rounded-lg font-bold text-[14px] uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold text-[14px] uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordion Sections */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                {/* 1. Personal Details */}
                <AccordionSection
                  title="Student's Personal Details"
                  icon={<User className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.personal}
                  onToggle={() => toggleSection("personal")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">First Name *</label>
                      <input
                        type="text"
                        value={personalDetails.firstName}
                        autoComplete="new-password"
                        name="student-firstname-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, firstName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Middle Name</label>
                      <input
                        type="text"
                        value={personalDetails.middleName}
                        autoComplete="new-password"
                        name="student-middlename-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, middleName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Middle Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Last Name *</label>
                      <input
                        type="text"
                        value={personalDetails.lastName}
                        autoComplete="new-password"
                        name="student-lastname-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, lastName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Gender</label>
                      <select
                        value={personalDetails.gender}
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, gender: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                        <span>Date of Birth</span>
                        {calculatedAge && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shadow-sm">
                            Age: {calculatedAge}
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={personalDetails.dateOfBirth}
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Birth Place</label>
                      <input
                        type="text"
                        value={personalDetails.birthPlace}
                        autoComplete="new-password"
                        name="student-birthplace-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, birthPlace: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="City / Village"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Religion</label>
                      <input
                        type="text"
                        value={personalDetails.religion}
                        autoComplete="new-password"
                        name="student-religion-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, religion: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Religion"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Caste</label>
                      <input
                        type="text"
                        value={personalDetails.caste}
                        autoComplete="new-password"
                        name="student-caste-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, caste: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Caste"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Category</label>
                      <select
                        value={personalDetails.category}
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, category: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="">Select Category</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="VJNT">VJNT</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Mother Tongue</label>
                      <input
                        type="text"
                        value={personalDetails.motherTongue}
                        autoComplete="new-password"
                        name="student-mothertongue-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, motherTongue: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Mother Tongue"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Nationality</label>
                      <input
                        type="text"
                        value={personalDetails.nationality}
                        autoComplete="new-password"
                        name="student-nationality-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, nationality: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Aadhaar Card No</label>
                      <input
                        type="text"
                        value={personalDetails.aadhaarNo}
                        autoComplete="new-password"
                        name="student-aadhaar-autofill-prevent"
                        onChange={(e) =>
                          setPersonalDetails({ ...personalDetails, aadhaarNo: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="12 digit Aadhaar"
                      />
                    </div>
                  </div>
                </AccordionSection>

                {/* 2. Address Details */}
                <AccordionSection
                  title="Address Details"
                  icon={<MapPin className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.address}
                  onToggle={() => toggleSection("address")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">Permanent Address</label>
                      <input
                        type="text"
                        value={addressDetails.houseNo}
                        autoComplete="new-password"
                        name="student-address-house-no"
                        onChange={(e) => handleAddressPartChange("houseNo", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="House No, Street name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">City / Village</label>
                      <input
                        type="text"
                        value={addressDetails.city}
                        autoComplete="new-password"
                        name="student-address-city"
                        onChange={(e) => handleAddressPartChange("city", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Taluka</label>
                      <input
                        type="text"
                        value={addressDetails.taluka}
                        autoComplete="new-password"
                        name="student-address-taluka"
                        onChange={(e) => handleAddressPartChange("taluka", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Taluka"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">District</label>
                      <input
                        type="text"
                        value={addressDetails.district}
                        autoComplete="new-password"
                        name="student-address-district"
                        onChange={(e) => handleAddressPartChange("district", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="District"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">State</label>
                      <input
                        type="text"
                        value={addressDetails.state}
                        autoComplete="new-password"
                        name="student-address-state"
                        onChange={(e) => handleAddressPartChange("state", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Pin Code</label>
                      <input
                        type="text"
                        value={addressDetails.pinCode}
                        autoComplete="new-password"
                        name="student-address-pincode"
                        onChange={(e) => handleAddressPartChange("pinCode", e.target.value)}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Pincode"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-3 flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isSameAsPermanent"
                        checked={addressDetails.isSameAsPermanent}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAddressDetails((prev) => {
                            const next = {
                              ...prev,
                              isSameAsPermanent: checked,
                            };
                            if (checked) {
                              const parts = [
                                next.houseNo,
                                next.city,
                                next.taluka,
                                next.district,
                                next.state,
                              ].filter(Boolean);
                              const suffix = next.pinCode ? ` - ${next.pinCode}` : "";
                              next.correspondenceAddress = parts.join(", ") + suffix;
                            } else {
                              next.correspondenceAddress = "";
                            }
                            return next;
                          });
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isSameAsPermanent" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Correspondence Address Same as Permanent Address
                      </label>
                    </div>

                    {!addressDetails.isSameAsPermanent && (
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-xs font-semibold text-slate-600">Correspondence Address</label>
                        <input
                          type="text"
                          value={addressDetails.correspondenceAddress}
                          autoComplete="new-password"
                          name="student-address-correspondence"
                          onChange={(e) =>
                            setAddressDetails({ ...addressDetails, correspondenceAddress: e.target.value })
                          }
                          className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                          placeholder="Correspondence Address"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Mobile Number</label>
                      <input
                        type="text"
                        value={addressDetails.mobile}
                        autoComplete="new-password"
                        name="student-address-mobile"
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, mobile: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Student / Parent Mobile"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Alternative Mobile</label>
                      <input
                        type="text"
                        value={addressDetails.altMobile}
                        autoComplete="new-password"
                        name="student-address-altmobile"
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, altMobile: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Alternative contact"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Email Address</label>
                      <input
                        type="email"
                        value={addressDetails.email}
                        autoComplete="new-password"
                        name="student-address-email"
                        onChange={(e) =>
                          setAddressDetails({ ...addressDetails, email: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="name@domain.com"
                      />
                    </div>
                  </div>
                </AccordionSection>

                {/* 3. Previous School Details */}
                <AccordionSection
                  title="Previous School Details"
                  icon={<School className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.previous}
                  onToggle={() => toggleSection("previous")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">School Name</label>
                      <input
                        type="text"
                        value={previousSchoolDetails.schoolName}
                        autoComplete="new-password"
                        name="student-prevschool-name"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, schoolName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Previous School Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">School Board</label>
                      <select
                        value={previousSchoolDetails.board}
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, board: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="">Select Board</option>
                        <option value="State Board">State Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="IB">IB</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Last Class Attended</label>
                      <input
                        type="text"
                        value={previousSchoolDetails.lastClass}
                        autoComplete="new-password"
                        name="student-prevschool-class"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, lastClass: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Class"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Passing Year</label>
                      <input
                        type="text"
                        value={previousSchoolDetails.passingYear}
                        autoComplete="new-password"
                        name="student-prevschool-year"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, passingYear: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="YYYY"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                        <span>Marks Obtained / Grade</span>
                        {calculatedPercentage && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm">
                            {calculatedPercentage}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={previousSchoolDetails.marksObtained}
                        autoComplete="new-password"
                        name="student-prevschool-marks"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, marksObtained: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Marks / Grade"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Out Of Marks</label>
                      <input
                        type="text"
                        value={previousSchoolDetails.outOfMarks}
                        autoComplete="new-password"
                        name="student-prevschool-outof"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, outOfMarks: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Total Marks"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Transfer Certificate (TC) No</label>
                      <input
                        type="text"
                        value={previousSchoolDetails.tcNumber}
                        autoComplete="new-password"
                        name="student-prevschool-tc"
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, tcNumber: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="TC Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">TC Date of Issue</label>
                      <input
                        type="date"
                        value={previousSchoolDetails.tcIssueDate}
                        onChange={(e) =>
                          setPreviousSchoolDetails({ ...previousSchoolDetails, tcIssueDate: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </AccordionSection>

                {/* 4. Other Details */}
                <AccordionSection
                  title="Other Details"
                  icon={<FileText className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.other}
                  onToggle={() => toggleSection("other")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Disability Category</label>
                      <select
                        value={otherDetails.disabilityType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOtherDetails({
                            ...otherDetails,
                            disabilityType: val,
                            disabilityPercentage: val === "None" ? "" : otherDetails.disabilityPercentage,
                          });
                        }}
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="None">None</option>
                        <option value="Visually Impaired">Visually Impaired</option>
                        <option value="Hearing Impaired">Hearing Impaired</option>
                        <option value="Physically Disabled">Physically Disabled</option>
                        <option value="Intellectual Disability">Intellectual Disability</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Disability Percentage (%)</label>
                      <input
                        type="number"
                        value={otherDetails.disabilityPercentage}
                        disabled={otherDetails.disabilityType === "None"}
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, disabilityPercentage: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="%"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Minority Category</label>
                      <select
                        value={otherDetails.minorityStatus}
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, minorityStatus: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Medium of Instruction</label>
                      <select
                        value={otherDetails.mediumOfInstruction}
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, mediumOfInstruction: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="Marathi">Marathi</option>
                        <option value="English">English</option>
                        <option value="Semi-English">Semi-English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Urdu">Urdu</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Student Height (cm)</label>
                      <input
                        type="number"
                        value={otherDetails.heightCm}
                        autoComplete="new-password"
                        name="student-other-height"
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, heightCm: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="cm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Student Weight (kg)</label>
                      <input
                        type="number"
                        value={otherDetails.weightKg}
                        autoComplete="new-password"
                        name="student-other-weight"
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, weightKg: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="kg"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">Identification Marks</label>
                      <input
                        type="text"
                        value={otherDetails.identificationMark}
                        autoComplete="new-password"
                        name="student-other-idmarks"
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, identificationMark: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Mole on left cheek, etc."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Transportation Needed</label>
                      <select
                        value={otherDetails.transportRequired}
                        onChange={(e) =>
                          setOtherDetails({ ...otherDetails, transportRequired: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </AccordionSection>

                {/* 5. Parents Details */}
                <AccordionSection
                  title="Parents Details"
                  icon={<Users className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.parents}
                  onToggle={() => toggleSection("parents")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Father's Full Name</label>
                      <input
                        type="text"
                        value={parentsDetails.fatherName}
                        autoComplete="new-password"
                        name="student-parent-father"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, fatherName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Father's Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Father's Occupation</label>
                      <input
                        type="text"
                        value={parentsDetails.fatherOccupation}
                        autoComplete="new-password"
                        name="student-parent-father-occ"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, fatherOccupation: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Occupation"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Father's Contact Number</label>
                      <input
                        type="text"
                        value={parentsDetails.fatherPhone}
                        autoComplete="new-password"
                        name="student-parent-father-phone"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, fatherPhone: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Mother's Full Name</label>
                      <input
                        type="text"
                        value={parentsDetails.motherName}
                        autoComplete="new-password"
                        name="student-parent-mother"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, motherName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Mother's Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Mother's Occupation</label>
                      <input
                        type="text"
                        value={parentsDetails.motherOccupation}
                        autoComplete="new-password"
                        name="student-parent-mother-occ"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, motherOccupation: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Occupation"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Mother's Contact Number</label>
                      <input
                        type="text"
                        value={parentsDetails.motherPhone}
                        autoComplete="new-password"
                        name="student-parent-mother-phone"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, motherPhone: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Guardian Name (Optional)</label>
                      <input
                        type="text"
                        value={parentsDetails.guardianName}
                        autoComplete="new-password"
                        name="student-parent-guardian"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, guardianName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Guardian's Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Guardian Relation</label>
                      <input
                        type="text"
                        value={parentsDetails.guardianRelation}
                        autoComplete="new-password"
                        name="student-parent-guardian-rel"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, guardianRelation: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Relation"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Guardian Contact Number</label>
                      <input
                        type="text"
                        value={parentsDetails.guardianPhone}
                        autoComplete="new-password"
                        name="student-parent-guardian-phone"
                        onChange={(e) =>
                          setParentsDetails({ ...parentsDetails, guardianPhone: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </AccordionSection>

                {/* 6. Bank Details */}
                <AccordionSection
                  title="Bank Details"
                  icon={<CreditCard className="size-5 text-indigo-500" />}
                  isOpen={expandedSections.bank}
                  onToggle={() => toggleSection("bank")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Bank Name</label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        autoComplete="new-password"
                        name="student-bank-name"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, bankName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Bank Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Account Number</label>
                      <input
                        type="password"
                        value={bankDetails.accountNo}
                        autoComplete="new-password"
                        name="student-bank-acct"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, accountNo: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Account Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Confirm Account Number</label>
                      <input
                        type="text"
                        value={bankDetails.confirmAccountNo}
                        autoComplete="new-password"
                        name="student-bank-acct-confirm"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, confirmAccountNo: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Re-enter Account Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">IFSC Code</label>
                      <input
                        type="text"
                        value={bankDetails.ifscCode}
                        autoComplete="new-password"
                        name="student-bank-ifsc"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="IFSC Code"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Branch Name</label>
                      <input
                        type="text"
                        value={bankDetails.branchName}
                        autoComplete="new-password"
                        name="student-bank-branch"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, branchName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Branch Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankDetails.holderName}
                        autoComplete="new-password"
                        name="student-bank-holder"
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, holderName: e.target.value })
                        }
                        className="w-full h-9 px-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700"
                        placeholder="Account Holder Name"
                      />
                    </div>
                  </div>
                </AccordionSection>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// Collapsible Accordion Component
interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, icon, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-transparent data-[state=open]:border-slate-100"
        data-state={isOpen ? "open" : "closed"}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#64748b] text-[10px] select-none flex-shrink-0">
            <svg
              className={`size-3 fill-current transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 21L2 3h20L12 21z" strokeWidth={1} />
            </svg>
          </span>
          <span className="text-base font-bold text-[#1e293b]">{title}</span>
        </div>
        <div>
          {icon}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
