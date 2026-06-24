import { createFileRoute, Link } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronLeft,
  FileText,
  Edit,
  Save,
  Download,
  Plus,
  Trash2,
  User,
  BookOpen,
  Calendar,
  Briefcase,
  Layers,
  Heart,
  Phone,
  School,
  MapPin,
  Camera
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast as toast } from "@/lib/custom-toast";
import html2pdf from "html2pdf.js";

export const Route = createFileRoute("/teacher/stats-teacher")({
  component: TeacherStatsPage,
});

// Default portfolio state based on user's exact requirements
const DEFAULT_PORTFOLIO = {
  // General School Info
  schoolCode: "27200508402",
  headmasterName: "रामचंद्र विठ्ठल जाधव",
  schoolName: "जिल्हा परिषद प्राथमिक शाळा, नाशिक",
  post: "नाशिक",
  center: "ओझर",
  taluka: "निफाड",
  district: "नाशिक",
  pin: "422206",
  standard: "इयत्ता ५ वी",
  division: "तुकडी अ",
  mobileSchool: "9552404950",

  // Personal Info
  teacherName: "राजू बाळू गांगुर्डे",
  dob: "15/08/1985",
  birthplace: "ओझर (नाशिक)",
  designation: "पदवीधर शिक्षक",
  caste: "मराठा",
  category: "खुला (OPEN)",
  aadhaar: "1234 5678 9012",
  saralId: "201527200508402001",
  shalarthId: "0102TCHNASH8501",
  mobile: "9552404950",
  pfNo: "NG/P-54321",
  pan: "ABCDE1234F",
  voterId: "XYZ9876543",
  rationCard: "RC87654321",
  email: "rajugangurde9552@gmail.com",

  // Service Details
  bloodGroup: "B +ve",
  weight: "72 kg",
  height: "170 cm",
  retirementDate: "31/08/2043",
  firstJoiningDate: "01/07/2008",
  joiningSchoolDate: "15/06/2018",
  joiningTalukaDate: "01/07/2008",
  joiningDistrictDate: "01/07/2008",
  handicapNo: "N/A",
  dlNo: "MH-15 20080098765",
  vehicleNo: "MH-15-FX-9876",
  incomeTaxNo: "ABCDE1234F",
  npsNo: "110022334455",
  eduQualification: "M.A. (History)",
  profQualification: "D.Ed., B.Ed.",

  // Contact & Hobbies
  hobbies: "वाचन, ट्रेकिंग, कविता लेखन",
  duties: "सांस्कृतिक कार्यक्रम नियोजन, क्रीडा विभाग",
  languages: "मराठी, हिंदी, इंग्रजी",
  currentAddress: "फ्लॅट नं. ५, साई पॅराडाईज, ओझर टाऊनशिप, नाशिक - ४२२२०६",
  permanentAddress: "मु. पो. ओझर, ता. निफाड, जि. नाशिक - ४२२२०६",
  correspondenceAddress: "फ्लॅट नं. ५, साई पॅराडाईज, ओझर टाऊनशिप, नाशिक - ४२२२०६",
  secondaryMobile: "9552404950",

  // Tables
  eduTable: [
    { id: 1, degree: "एस.एस.सी (SSC)", board: "नाशिक बोर्ड", grade: "प्रथम श्रेणी", year: "2001" },
    { id: 2, degree: "एच.एस.सी (HSC)", board: "नाशिक बोर्ड", grade: "विशेष प्राविण्य", year: "2003" },
    { id: 3, degree: "बी.ए (B.A.)", board: "पुणे विद्यापीठ", grade: "प्रथम श्रेणी", year: "2006" },
    { id: 4, degree: "एम.ए (M.A.)", board: "पुणे विद्यापीठ", grade: "द्वितीय श्रेणी", year: "2009" },
    { id: 5, degree: "", board: "", grade: "", year: "" },
  ],
  profTable: [
    { id: 1, degree: "डी.एड (D.Ed.)", board: "नाशिक डाएट", grade: "प्रथम श्रेणी", year: "2005" },
    { id: 2, degree: "बी.एड (B.Ed.)", board: "पुणे विद्यापीठ", grade: "प्रथम श्रेणी", year: "2011" },
    { id: 3, degree: "", board: "", grade: "", year: "" },
    { id: 4, degree: "", board: "", grade: "", year: "" },
  ],
  otherTable: [
    { id: 1, degree: "MS-CIT", board: "MSBTE", grade: "उत्कृष्ट (८२%)", year: "2006" },
    { id: 2, degree: "DSC (डिजिटल साक्षरता)", board: "महाराष्ट्र शासन", grade: "उत्तीर्ण", year: "2019" },
    { id: 3, degree: "", board: "", grade: "", year: "" },
    { id: 4, degree: "", board: "", grade: "", year: "" },
    { id: 5, degree: "", board: "", grade: "", year: "" },
  ],
  bankTable: [
    { id: 1, bankName: "स्टेट बँक ऑफ इंडिया", branch: "ओझर", accNo: "30459876543", ifsc: "SBIN0001183" },
    { id: 2, bankName: "बँक ऑफ महाराष्ट्र", branch: "निफाड", accNo: "60123456789", ifsc: "MAHB0000213" },
    { id: 3, bankName: "", branch: "", accNo: "", ifsc: "" },
    { id: 4, bankName: "", branch: "", accNo: "", ifsc: "" },
  ],
  serviceTable: [
    { id: 1, school: "जि. प. प्रा. शाळा, नांदूर", period: "2008 to 2012", totalService: "4 वर्षे", orderNo: "जा.क्र.प्राथ/बदली/४५६/२००८" },
    { id: 2, school: "जि. प. प्रा. शाळा, चांदवड", period: "2012 to 2018", totalService: "6 वर्षे", orderNo: "जा.क्र.प्राथ/बदली/१२३/२०१२" },
    { id: 3, school: "जि. प. प्रा. शाळा, नाशिक", period: "2018 पासून", totalService: "चालू", orderNo: "जा.क्र.प्राथ/बदली/७८९/२०१८" },
    { id: 4, school: "", period: "", totalService: "", orderNo: "" },
    { id: 5, school: "", period: "", totalService: "", orderNo: "" },
    { id: 6, school: "", period: "", totalService: "", orderNo: "" },
    { id: 7, school: "", period: "", totalService: "", orderNo: "" },
    { id: 8, school: "", period: "", totalService: "", orderNo: "" },
    { id: 9, school: "", period: "", totalService: "", orderNo: "" },
    { id: 10, school: "", period: "", totalService: "", orderNo: "" },
    { id: 11, school: "", period: "", totalService: "", orderNo: "" },
    { id: 12, school: "", period: "", totalService: "", orderNo: "" },
    { id: 13, school: "", period: "", totalService: "", orderNo: "" },
  ],
  familyTable: [
    { id: 1, name: "गायत्री राजू गांगुर्डे", relation: "पत्नी", dob: "12/04/1990", aadhaar: "9876 5432 1098" },
    { id: 2, name: "आदित्य राजू गांगुर्डे", relation: "मुलगा", dob: "18/10/2012", aadhaar: "8765 4321 0987" },
    { id: 3, name: "श्रेया राजू गांगुर्डे", relation: "मुलगी", dob: "05/02/2016", aadhaar: "7654 3210 9876" },
    { id: 4, name: "", relation: "", dob: "", aadhaar: "" },
    { id: 5, name: "", relation: "", dob: "", aadhaar: "" },
    { id: 6, name: "", relation: "", dob: "", aadhaar: "" },
    { id: 7, name: "", relation: "", dob: "", aadhaar: "" },
    { id: 8, name: "", relation: "", dob: "", aadhaar: "" },
    { id: 9, name: "", relation: "", dob: "", aadhaar: "" },
  ],
  booksTable: [
    { id: 1, title: "श्यामची आई", author: "साने गुरुजी", summary: "मातृप्रेमाची थोरवी आणि सुसंस्कार" },
    { id: 2, title: "मृत्युंजय", author: "शिवाजी सावंत", summary: "कर्णाचे जीवन आणि त्याचा संघर्ष" },
    { id: 3, title: "वपुर्झा", author: "व. पु. काळे", summary: "जीवन जगण्याचा सुंदर दृष्टिकोन" },
    { id: 4, title: "", author: "", summary: "" },
    { id: 5, title: "", author: "", summary: "" },
    { id: 6, title: "", author: "", summary: "" },
    { id: 7, title: "", author: "", summary: "" },
    { id: 8, title: "", author: "", summary: "" },
    { id: 9, title: "", author: "", summary: "" },
    { id: 10, title: "", author: "", summary: "" },
    { id: 11, title: "", author: "", summary: "" },
    { id: 12, title: "", author: "", summary: "" },
    { id: 13, title: "", author: "", summary: "" },
    { id: 14, title: "", author: "", summary: "" },
  ],
  pubTable: [
    { id: 1, topic: "शैक्षणिक लेख", details: "साप्ताहिक साधना मध्ये 'डिजिटल शाळा' या विषयावर लेख प्रसिद्ध", year: "2020" },
    { id: 2, topic: "काव्यसंग्रह", details: "'काव्यतरंग' हस्तलिखित प्रसिद्ध", year: "2022" },
    { id: 3, topic: "", details: "", year: "" },
    { id: 4, topic: "", details: "", year: "" },
    { id: 5, topic: "", details: "", year: "" },
    { id: 6, topic: "", details: "", year: "" },
    { id: 7, topic: "", details: "", year: "" },
    { id: 8, topic: "", details: "", year: "" },
    { id: 9, topic: "", details: "", year: "" },
    { id: 10, topic: "", details: "", year: "" },
  ],
  trainingsTable: [
    { id: 1, name: "निष्ठा (NISHTHA) १.०", location: "दीक्षा ॲप (ऑनलाईन)", level: "राज्य स्तर", duration: "३ महिने", days: "९०" },
    { id: 2, name: "पायाभूत साक्षरता व संख्याज्ञान (FLN)", location: "नाशिक", level: "तालुका स्तर", duration: "५ दिवस", days: "५" },
    { id: 3, name: "डिजिटल वर्ग अध्यापन प्रशिक्षण", location: "पुणे", level: "राज्य स्तर", duration: "३ दिवस", days: "३" },
    { id: 4, name: "", location: "", level: "", duration: "", days: "" },
    { id: 5, name: "", location: "", level: "", duration: "", days: "" },
    { id: 6, name: "", location: "", level: "", duration: "", days: "" },
    { id: 7, name: "", location: "", level: "", duration: "", days: "" },
    { id: 8, name: "", location: "", level: "", duration: "", days: "" },
    { id: 9, name: "", location: "", level: "", duration: "", days: "" },
    { id: 10, name: "", location: "", level: "", duration: "", days: "" },
  ],
  otherNotes: ""
};

function TeacherStatsPage() {
  const { lang } = useLanguage();
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("school");
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printTemplateRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("teacher_portfolio");
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved portfolio", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const handleSave = () => {
    localStorage.setItem("teacher_portfolio", JSON.stringify(portfolio));
    setIsEditing(false);
    toast.success("माहिती यशस्वीरीत्या जतन केली आहे");
  };

  // Reset to default
  const handleReset = () => {
    if (confirm("तुम्हाला खात्री आहे की तुम्हाला माहिती मूळ रूपात रिसेट करायची आहे?")) {
      setPortfolio(DEFAULT_PORTFOLIO);
      localStorage.removeItem("teacher_portfolio");
      toast.info("माहिती रिसेट केली आहे");
    }
  };

  // Handle Input Changes
  const handleInputChange = (field: keyof typeof DEFAULT_PORTFOLIO, value: string) => {
    setPortfolio((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Table Input Changes
  const handleTableChange = (
    tableName: "eduTable" | "profTable" | "otherTable" | "bankTable" | "serviceTable" | "familyTable" | "booksTable" | "pubTable" | "trainingsTable",
    id: number,
    field: string,
    value: string
  ) => {
    setPortfolio((prev) => {
      const updatedTable = prev[tableName].map((row: any) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      return {
        ...prev,
        [tableName]: updatedTable,
      };
    });
  };

  // Generate PDF using html2pdf.js
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    toast.info("PDF तयार होत आहे, कृपया थोडा वेळ थांबा...");

    // Give react brief moment to ensure target rendering state
    setTimeout(async () => {
      try {
        const element = printTemplateRef.current;
        if (!element) {
          throw new Error("Print template element not found");
        }

        let html2pdfFn = html2pdf;
        if (html2pdfFn && (html2pdfFn as any).default) {
          html2pdfFn = (html2pdfFn as any).default;
        }

        const opt = {
          margin: [8, 8, 8, 8],
          filename: `Shikshak_Sanchika_${portfolio.teacherName.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] }
        };

        await html2pdfFn().set(opt).from(element).save();
        toast.success("PDF यशस्वीरीत्या डाउनलोड झाली आहे");
      } catch (error) {
        console.error("PDF Generation error:", error);
        toast.error("PDF डाउनलोड करण्यात अडचण आली");
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 500);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen pb-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <Link
                to="/teacher"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#6B7280] hover:text-indigo-600 uppercase tracking-widest transition-colors mb-1"
              >
                <ChevronLeft className="size-3.5" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                <FileText className="size-8 text-indigo-600" /> शिक्षक संचिका (Teacher Record Book)
              </h1>
              <p className="text-slate-500 font-semibold text-sm">
                शिक्षकाची वैयक्तिक, शैक्षणिक, व्यावसायिक व सेवाविषयक संपूर्ण माहिती अहवाल
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    <Save className="size-4" /> जतन करा (Save)
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    रद्द करा
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Edit className="size-4" /> माहिती भरा / संपादन (Edit)
                </button>
              )}

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="size-4" /> PDF डाउनलोड करा
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
              >
                रिसेट
              </button>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl overflow-x-auto gap-1">
            {[
              { id: "school", label: "शाळा व वर्गवार माहिती", icon: School },
              { id: "personal", label: "वैयक्तिक तपशील", icon: User },
              { id: "service", label: "सेवा तपशील व तारीख", icon: Briefcase },
              { id: "edu", label: "शैक्षणिक व व्यावसायिक पात्रता", icon: BookOpen },
              { id: "bank", label: "बँक व सेवा इतिहास", icon: Layers },
              { id: "family", label: "कुटुंब व आवड", icon: Heart },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TabIcon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Edit / View Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* TAB 1: School & Class Info */}
            {activeTab === "school" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                  <School className="size-5 text-indigo-600" /> १. शाळा व वर्गवार माहिती
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderInputField("शाळेचे नाव", "schoolName", portfolio.schoolName, isEditing, handleInputChange)}
                  {renderInputField("शाळा संकेतांक (UDISE)", "schoolCode", portfolio.schoolCode, isEditing, handleInputChange)}
                  {renderInputField("मुख्याध्यापकाचे नाव", "headmasterName", portfolio.headmasterName, isEditing, handleInputChange)}
                  {renderInputField("केंद्र", "center", portfolio.center, isEditing, handleInputChange)}
                  {renderInputField("तालुका", "taluka", portfolio.taluka, isEditing, handleInputChange)}
                  {renderInputField("जिल्हा", "district", portfolio.district, isEditing, handleInputChange)}
                  {renderInputField("पोस्ट", "post", portfolio.post, isEditing, handleInputChange)}
                  {renderInputField("पिन कोड", "pin", portfolio.pin, isEditing, handleInputChange)}
                  {renderInputField("इयत्ता", "standard", portfolio.standard, isEditing, handleInputChange)}
                  {renderInputField("तुकडी", "division", portfolio.division, isEditing, handleInputChange)}
                  {renderInputField("शाळा मोबाईल नं.", "mobileSchool", portfolio.mobileSchool, isEditing, handleInputChange)}
                </div>
              </div>
            )}

            {/* TAB 2: Personal Details */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                  <User className="size-5 text-indigo-600" /> २. वैयक्तिक तपशील
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderInputField("शिक्षकाचे नाव (पूर्ण)", "teacherName", portfolio.teacherName, isEditing, handleInputChange)}
                  {renderInputField("जन्मतारीख", "dob", portfolio.dob, isEditing, handleInputChange)}
                  {renderInputField("जन्मस्थळ", "birthplace", portfolio.birthplace, isEditing, handleInputChange)}
                  {renderInputField("पद", "designation", portfolio.designation, isEditing, handleInputChange)}
                  {renderInputField("जात", "caste", portfolio.caste, isEditing, handleInputChange)}
                  {renderInputField("प्रवर्ग", "category", portfolio.category, isEditing, handleInputChange)}
                  {renderInputField("आधार क्र.", "aadhaar", portfolio.aadhaar, isEditing, handleInputChange)}
                  {renderInputField("सरल ID क्र.", "saralId", portfolio.saralId, isEditing, handleInputChange)}
                  {renderInputField("शालार्थ ID क्र.", "shalarthId", portfolio.shalarthId, isEditing, handleInputChange)}
                  {renderInputField("मोबाईल नं.", "mobile", portfolio.mobile, isEditing, handleInputChange)}
                  {renderInputField("प्रा.फंड क्र (PF No)", "pfNo", portfolio.pfNo, isEditing, handleInputChange)}
                  {renderInputField("PAN नं.", "pan", portfolio.pan, isEditing, handleInputChange)}
                  {renderInputField("निवडणूक कार्ड नं.", "voterId", portfolio.voterId, isEditing, handleInputChange)}
                  {renderInputField("रेशनकार्ड नं.", "rationCard", portfolio.rationCard, isEditing, handleInputChange)}
                  {renderInputField("ई-मेल ID", "email", portfolio.email, isEditing, handleInputChange)}
                </div>
              </div>
            )}

            {/* TAB 3: Service Details */}
            {activeTab === "service" && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Briefcase className="size-5 text-indigo-600" /> ३. सेवा तपशील व महत्त्वाच्या तारखा
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderInputField("रक्तगट", "bloodGroup", portfolio.bloodGroup, isEditing, handleInputChange)}
                  {renderInputField("वजन", "weight", portfolio.weight, isEditing, handleInputChange)}
                  {renderInputField("उंची", "height", portfolio.height, isEditing, handleInputChange)}
                  {renderInputField("प्रथम नियुक्ती तारीख (प्रथम सेवा)", "firstJoiningDate", portfolio.firstJoiningDate, isEditing, handleInputChange)}
                  {renderInputField("या शाळेवर हजर दि.", "joiningSchoolDate", portfolio.joiningSchoolDate, isEditing, handleInputChange)}
                  {renderInputField("या तालुक्यात हजर दि.", "joiningTalukaDate", portfolio.joiningTalukaDate, isEditing, handleInputChange)}
                  {renderInputField("या जिल्ह्यात हजर दि.", "joiningDistrictDate", portfolio.joiningDistrictDate, isEditing, handleInputChange)}
                  {renderInputField("सेवानिवृत्ती तारीख", "retirementDate", portfolio.retirementDate, isEditing, handleInputChange)}
                  {renderInputField("अपंगत्व प्रमाणपत्र क्र.", "handicapNo", portfolio.handicapNo, isEditing, handleInputChange)}
                  {renderInputField("वाहन लायसन्स क्र.", "dlNo", portfolio.dlNo, isEditing, handleInputChange)}
                  {renderInputField("वाहन क्र.", "vehicleNo", portfolio.vehicleNo, isEditing, handleInputChange)}
                  {renderInputField("इन्कमटॅक्स नं.", "incomeTaxNo", portfolio.incomeTaxNo, isEditing, handleInputChange)}
                  {renderInputField("NPS/DCPS क्र.", "npsNo", portfolio.npsNo, isEditing, handleInputChange)}
                  {renderInputField("शैक्षणिक पात्रता", "eduQualification", portfolio.eduQualification, isEditing, handleInputChange)}
                  {renderInputField("व्यावसायिक पात्रता", "profQualification", portfolio.profQualification, isEditing, handleInputChange)}
                </div>
              </div>
            )}

            {/* TAB 4: Qualifications Tables */}
            {activeTab === "edu" && (
              <div className="space-y-8">
                {/* Educational Qualifications Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <BookOpen className="size-5 text-indigo-600" /> ४. शैक्षणिक पात्रता
                  </h3>
                  {renderQualificationTable("eduTable", portfolio.eduTable, isEditing, handleTableChange)}
                </div>

                {/* Professional Qualifications Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Briefcase className="size-5 text-indigo-600" /> ५. व्यावसायिक पात्रता
                  </h3>
                  {renderQualificationTable("profTable", portfolio.profTable, isEditing, handleTableChange)}
                </div>

                {/* Other Qualifications Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Layers className="size-5 text-indigo-600" /> ६. इतर पात्रता
                  </h3>
                  {renderQualificationTable("otherTable", portfolio.otherTable, isEditing, handleTableChange)}
                </div>
              </div>
            )}

            {/* TAB 5: Bank & Service History */}
            {activeTab === "bank" && (
              <div className="space-y-8">
                {/* Bank Account Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Layers className="size-5 text-indigo-600" /> ७. बँक खात्याविषयी माहिती
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                          <th className="py-3 px-4">बँकेचे नाव</th>
                          <th className="py-3 px-4">शाखा</th>
                          <th className="py-3 px-4">खाते क्र.</th>
                          <th className="py-3 px-4">IFSC Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {portfolio.bankTable.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.bankName}
                                  onChange={(e) => handleTableChange("bankTable", row.id, "bankName", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.bankName || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.branch}
                                  onChange={(e) => handleTableChange("bankTable", row.id, "branch", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.branch || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.accNo}
                                  onChange={(e) => handleTableChange("bankTable", row.id, "accNo", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.accNo || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.ifsc}
                                  onChange={(e) => handleTableChange("bankTable", row.id, "ifsc", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.ifsc || "-"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Service History Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Briefcase className="size-5 text-indigo-600" /> ८. शैक्षणिक सेवा तपशील (बदली इतिहास)
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                          <th className="py-3 px-4">बदली होऊन आलेली शाळा</th>
                          <th className="py-3 px-4">कालावधी</th>
                          <th className="py-3 px-4">एकूण सेवा</th>
                          <th className="py-3 px-4">बदली आदेश क्र.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {portfolio.serviceTable.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.school}
                                  onChange={(e) => handleTableChange("serviceTable", row.id, "school", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.school || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.period}
                                  onChange={(e) => handleTableChange("serviceTable", row.id, "period", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.period || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.totalService}
                                  onChange={(e) => handleTableChange("serviceTable", row.id, "totalService", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.totalService || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.orderNo}
                                  onChange={(e) => handleTableChange("serviceTable", row.id, "orderNo", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.orderNo || "-"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Family & Book Hobbies */}
            {activeTab === "family" && (
              <div className="space-y-8">
                {/* Contact, Hobbies & Interests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Heart className="size-5 text-rose-500" /> ९. संपर्क, आवड व इतर नोंदी
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("आवड / छंद", "hobbies", portfolio.hobbies, isEditing, handleInputChange)}
                    {renderInputField("शालेय काम / जबाबदाऱ्या", "duties", portfolio.duties, isEditing, handleInputChange)}
                    {renderInputField("अवगत असलेल्या भाषा", "languages", portfolio.languages, isEditing, handleInputChange)}
                    {renderInputField("सध्याचा पत्ता", "currentAddress", portfolio.currentAddress, isEditing, handleInputChange)}
                    {renderInputField("कायमचा पत्ता", "permanentAddress", portfolio.permanentAddress, isEditing, handleInputChange)}
                    {renderInputField("पत्रव्यवहाराचा पत्ता", "correspondenceAddress", portfolio.correspondenceAddress, isEditing, handleInputChange)}
                    {renderInputField("मोबाईल क्र. २", "secondaryMobile", portfolio.secondaryMobile, isEditing, handleInputChange)}
                  </div>
                </div>

                {/* Family Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <User className="size-5 text-indigo-600" /> १०. कौटुंबिक माहिती
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                          <th className="py-3 px-4">कुटुंबातील व्यक्तीचे नाव</th>
                          <th className="py-3 px-4">नाते</th>
                          <th className="py-3 px-4">जन्मतारीख</th>
                          <th className="py-3 px-4">आधार क्र.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {portfolio.familyTable.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleTableChange("familyTable", row.id, "name", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.name || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.relation}
                                  onChange={(e) => handleTableChange("familyTable", row.id, "relation", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.relation || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.dob}
                                  onChange={(e) => handleTableChange("familyTable", row.id, "dob", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.dob || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.aadhaar}
                                  onChange={(e) => handleTableChange("familyTable", row.id, "aadhaar", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.aadhaar || "-"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Favorite Books */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                    <BookOpen className="size-5 text-indigo-600" /> ११. आवडलेली पुस्तके
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                          <th className="py-3 px-4">पुस्तकाचे नाव</th>
                          <th className="py-3 px-4">लेखक</th>
                          <th className="py-3 px-4">आशय / थोडक्यात परिचय</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {portfolio.booksTable.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.title}
                                  onChange={(e) => handleTableChange("booksTable", row.id, "title", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.title || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.author}
                                  onChange={(e) => handleTableChange("booksTable", row.id, "author", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.author || "-"}</span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.summary}
                                  onChange={(e) => handleTableChange("booksTable", row.id, "summary", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                              ) : (
                                <span>{row.summary || "-"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Published Literature & Trainings */}
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                      <FileText className="size-5 text-indigo-600" /> १२. प्रकाशित साहित्य / कवितासंग्रह
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                            <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                            <th className="py-3 px-4">विषय</th>
                            <th className="py-3 px-4">तपशील</th>
                            <th className="py-3 px-4">वर्ष</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {portfolio.pubTable.map((row) => (
                            <tr key={row.id}>
                              <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.topic}
                                    onChange={(e) => handleTableChange("pubTable", row.id, "topic", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.topic || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.details}
                                    onChange={(e) => handleTableChange("pubTable", row.id, "details", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.details || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.year}
                                    onChange={(e) => handleTableChange("pubTable", row.id, "year", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.year || "-"}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Trainings Table */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                      <Briefcase className="size-5 text-indigo-600" /> १३. सेवांतर्गत प्रशिक्षण नोंदी
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
                            <th className="py-3 px-4 w-16 text-center">अ.न.</th>
                            <th className="py-3 px-4">प्रशिक्षणाचे नाव</th>
                            <th className="py-3 px-4">ठिकाण</th>
                            <th className="py-3 px-4">स्तर</th>
                            <th className="py-3 px-4">कालावधी</th>
                            <th className="py-3 px-4">दिवस</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {portfolio.trainingsTable.map((row) => (
                            <tr key={row.id}>
                              <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) => handleTableChange("trainingsTable", row.id, "name", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.name || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.location}
                                    onChange={(e) => handleTableChange("trainingsTable", row.id, "location", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.location || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.level}
                                    onChange={(e) => handleTableChange("trainingsTable", row.id, "level", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.level || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.duration}
                                    onChange={(e) => handleTableChange("trainingsTable", row.id, "duration", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.duration || "-"}</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.days}
                                    onChange={(e) => handleTableChange("trainingsTable", row.id, "days", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                ) : (
                                  <span>{row.days || "-"}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>

      {/* ==================== HIGH-FIDELITY PRINT-READY TEMPLATE (HIDDEN ON SCREEN) ==================== */}
      <div style={{ display: "none" }}>
        <div
          ref={printTemplateRef}
          className="bg-white text-slate-900 p-8 font-serif"
          style={{ width: "210mm", minHeight: "297mm", fontSize: "11px", color: "#111" }}
        >
          {/* ================= PAGE 1 ================= */}
          <div className="pdf-page relative min-h-[280mm] flex flex-col justify-between border-4 border-slate-900 p-6">
            <div className="space-y-6">
              {/* Header Cover */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-3xl font-black uppercase tracking-wide text-slate-950">शिक्षक संचिका</h1>
                <p className="text-sm font-bold text-slate-700 mt-1">व्यक्तिमत्त्व, शैक्षणिक, व्यावसायिक व सेवाविषयक संपूर्ण इतिहास</p>
                <div className="text-xs font-bold text-slate-500 mt-1">शाळा: {portfolio.schoolName} (UDISE: {portfolio.schoolCode})</div>
              </div>

              {/* Cover Grid info */}
              <div className="flex justify-between items-start gap-6 pt-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider block">शिक्षकाचे नाव</span>
                    <span className="text-base font-black text-slate-950">{portfolio.teacherName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider block">मोबाईल क्रमांक</span>
                      <span className="text-xs font-bold text-slate-900">{portfolio.mobile}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wider block">ई-मेल ID</span>
                      <span className="text-xs font-bold text-slate-900">{portfolio.email || "-"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Profile Photo Placeholder */}
                <div className="size-28 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-center p-2 bg-slate-50 flex-shrink-0 relative">
                  <Camera className="size-8 text-slate-400 mb-1" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">शिक्षक फोटो</span>
                  <span className="text-[7px] text-slate-300 mt-0.5">(3.5cm x 4.5cm)</span>
                </div>
              </div>

              {/* School Details Grid */}
              <div className="mt-6">
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">१. शाळा व वर्गवार माहिती</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">शाळेचे नाव</td>
                      <td className="border border-slate-400 p-2 w-3/4 font-extrabold" colSpan={3}>{portfolio.schoolName}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">शाळा संकेतांक (UDISE)</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.schoolCode}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">मुख्याध्यापकाचे नाव</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.headmasterName}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">केंद्र</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.center}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">तालुका</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.taluka}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">जिल्हा</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.district}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">पोस्ट व पिन</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.post} - {portfolio.pin}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">इयत्ता व तुकडी</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.standard} ({portfolio.division})</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">शाळा मोबाईल</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.mobileSchool}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Personal Details Grid */}
              <div className="mt-6">
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">२. वैयक्तिक तपशील</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">जन्मतारीख</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.dob}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">जन्मस्थळ</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.birthplace}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">पद</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.designation}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">जात व प्रवर्ग</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.caste} ({portfolio.category})</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">आधार क्र.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.aadhaar}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">सरल ID क्र.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.saralId}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">शालार्थ ID क्र.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.shalarthId}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">प्रा.फंड क्र (PF)</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.pfNo}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">PAN नं.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.pan}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">निवडणूक कार्ड नं.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.voterId}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">रेशनकार्ड नं.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.rationCard}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">ई-मेल ID</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.email}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signature Footer */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-300 mt-10">
              <div className="text-center w-1/3">
                <div className="h-10"></div>
                <div className="border-t border-slate-600 text-[9px] font-bold">शिक्षकाची स्वाक्षरी</div>
              </div>
              <div className="text-center w-1/3">
                <div className="h-10"></div>
                <div className="border-t border-slate-600 text-[9px] font-bold">मुख्याध्यापक स्वाक्षरी व शिक्का</div>
              </div>
            </div>
          </div>

          {/* ================= PAGE 2 ================= */}
          <div className="pdf-page page-break relative min-h-[280mm] flex flex-col justify-between border-4 border-slate-900 p-6 mt-6">
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-1 mb-4 text-center">सेवा तपशील व शैक्षणिक पात्रता</h2>

              {/* Service Dates & Health */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">३. शारीरिक व सेवाविषयक तारीख नोंदी</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">रक्तगट</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.bloodGroup}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">वजन / उंची</td>
                      <td className="border border-slate-400 p-2 w-1/4 font-extrabold">{portfolio.weight} / {portfolio.height}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">प्रथम नियुक्ती तारीख</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.firstJoiningDate}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">सेवानिवृत्ती तारीख</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.retirementDate}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">या शाळेवर हजर दि.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.joiningSchoolDate}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50|">या तालुक्यात हजर दि.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.joiningTalukaDate}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">या जिल्ह्यात हजर दि.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.joiningDistrictDate}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">अपंगत्व प्रमाण. क्र.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.handicapNo}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">ड्रायव्हिंग लायसन्स नं.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.dlNo}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">वाहन क्रमांक</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.vehicleNo}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">NPS/DCPS क्र.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.npsNo}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">इन्कमटॅक्स नं.</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.incomeTaxNo}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Educational Qualifications Tables */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">४. शैक्षणिक पात्रता तपशील</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-2 text-center w-12">अ.न.</th>
                      <th className="border border-slate-400 p-2">शैक्षणिक पात्रता</th>
                      <th className="border border-slate-400 p-2">बोर्ड / विद्यापीठ</th>
                      <th className="border border-slate-400 p-2 text-center">श्रेणी</th>
                      <th className="border border-slate-400 p-2 text-center w-20">वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.eduTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-2 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-2 font-bold">{row.degree || "-"}</td>
                        <td className="border border-slate-400 p-2">{row.board || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.grade || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Professional Qualifications Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">५. व्यावसायिक पात्रता तपशील</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-2 text-center w-12">अ.न.</th>
                      <th className="border border-slate-400 p-2">व्यावसायिक पात्रता</th>
                      <th className="border border-slate-400 p-2">बोर्ड / विद्यापीठ</th>
                      <th className="border border-slate-400 p-2 text-center">श्रेणी</th>
                      <th className="border border-slate-400 p-2 text-center w-20">वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.profTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-2 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-2 font-bold">{row.degree || "-"}</td>
                        <td className="border border-slate-400 p-2">{row.board || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.grade || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-8 border-t border-slate-300 mt-10">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ २</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 3 ================= */}
          <div className="pdf-page page-break relative min-h-[280mm] flex flex-col justify-between border-4 border-slate-900 p-6 mt-6">
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-1 mb-4 text-center">बँक खाती, इतर पात्रता व सेवा तपशील</h2>

              {/* Other Qualifications Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">६. इतर शैक्षणिक / संगणक पात्रता (उदा. MS-CIT)</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-2 text-center w-12">अ.न.</th>
                      <th className="border border-slate-400 p-2">पात्रता / परीक्षा</th>
                      <th className="border border-slate-400 p-2">मंडळ / संस्था</th>
                      <th className="border border-slate-400 p-2 text-center">श्रेणी / टक्केवारी</th>
                      <th className="border border-slate-400 p-2 text-center w-20">वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.otherTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-2 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-2 font-bold">{row.degree || "-"}</td>
                        <td className="border border-slate-400 p-2">{row.board || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.grade || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bank Account Info Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">७. बँक खात्यांविषयी तपशील</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-2 text-center w-12">अ.न.</th>
                      <th className="border border-slate-400 p-2">बँकेचे नाव</th>
                      <th className="border border-slate-400 p-2">शाखा</th>
                      <th className="border border-slate-400 p-2">खाते क्रमांक</th>
                      <th className="border border-slate-400 p-2">IFSC Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.bankTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-2 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-2 font-bold">{row.bankName || "-"}</td>
                        <td className="border border-slate-400 p-2">{row.branch || "-"}</td>
                        <td className="border border-slate-400 p-2 font-extrabold">{row.accNo || "-"}</td>
                        <td className="border border-slate-400 p-2 font-mono">{row.ifsc || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contact, Addresses & Hobbies */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">८. आवड, छंद आणि पत्ते</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50 w-1/4">वैयक्तिक आवड / छंद</td>
                      <td className="border border-slate-400 p-2 w-3/4 font-extrabold" colSpan={3}>{portfolio.hobbies}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">शालेय काम / जबाबदारी</td>
                      <td className="border border-slate-400 p-2 font-extrabold" colSpan={3}>{portfolio.duties}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">अवगत असलेल्या भाषा</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.languages}</td>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">मोबाईल क्र. २</td>
                      <td className="border border-slate-400 p-2 font-extrabold">{portfolio.secondaryMobile}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">सध्याचा पत्ता</td>
                      <td className="border border-slate-400 p-2 font-extrabold" colSpan={3}>{portfolio.currentAddress}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">कायमचा पत्ता</td>
                      <td className="border border-slate-400 p-2 font-extrabold" colSpan={3}>{portfolio.permanentAddress}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-2 font-bold bg-slate-50">पत्रव्यवहाराचा पत्ता</td>
                      <td className="border border-slate-400 p-2 font-extrabold" colSpan={3}>{portfolio.correspondenceAddress}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-300 mt-10">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ३</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 4 ================= */}
          <div className="pdf-page page-break relative min-h-[280mm] flex flex-col justify-between border-4 border-slate-900 p-6 mt-6">
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-1 mb-4 text-center">सेवा इतिहास व कौटुंबिक माहिती</h2>

              {/* Service History Details Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">९. सेवा इतिहास व बदल्यांचा तपशील</h3>
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-400 p-1.5">बदली होऊन आलेली शाळा</th>
                      <th className="border border-slate-400 p-1.5 text-center">कालावधी</th>
                      <th className="border border-slate-400 p-1.5 text-center">एकूण सेवा</th>
                      <th className="border border-slate-400 p-1.5">बदली आदेश क्र. व तारीख</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.serviceTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-1 font-bold">{row.school || "-"}</td>
                        <td className="border border-slate-400 p-1 text-center">{row.period || "-"}</td>
                        <td className="border border-slate-400 p-1 text-center">{row.totalService || "-"}</td>
                        <td className="border border-slate-400 p-1 text-xs">{row.orderNo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Family Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">१०. कौटुंबिक माहिती</h3>
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-2 text-center w-12">अ.न.</th>
                      <th className="border border-slate-400 p-2">कुटुंबातील व्यक्तीचे नाव</th>
                      <th className="border border-slate-400 p-2 text-center">नाते</th>
                      <th className="border border-slate-400 p-2 text-center">जन्मतारीख</th>
                      <th className="border border-slate-400 p-2 text-center">आधार क्रमांक</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.familyTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-2 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-2 font-bold">{row.name || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.relation || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.dob || "-"}</td>
                        <td className="border border-slate-400 p-2 text-center">{row.aadhaar || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-300 mt-10">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ४</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 5 ================= */}
          <div className="pdf-page page-break relative min-h-[280mm] flex flex-col justify-between border-4 border-slate-900 p-6 mt-6">
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-950 border-b-2 border-slate-900 pb-1 mb-4 text-center">साहित्य, आवडती पुस्तके व सेवांतर्गत प्रशिक्षण</h2>

              {/* Hobbies / Favorite Books Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">११. वाचनाची आवड - आवडलेली पुस्तके</h3>
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-400 p-1.5">पुस्तकाचे नाव</th>
                      <th className="border border-slate-400 p-1.5">लेखक</th>
                      <th className="border border-slate-400 p-1.5">आशय / थोडक्यात परिचय</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.booksTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-1 font-bold">{row.title || "-"}</td>
                        <td className="border border-slate-400 p-1">{row.author || "-"}</td>
                        <td className="border border-slate-400 p-1">{row.summary || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Published Literature */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">१२. स्वतः प्रकाशित केलेले साहित्य / कवितासंग्रह</h3>
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-400 p-1.5">विषय</th>
                      <th className="border border-slate-400 p-1.5">साहित्याचा तपशील (कादंबरी/लेख/कविता)</th>
                      <th className="border border-slate-400 p-1.5 text-center w-16">वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.pubTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-1 font-bold">{row.topic || "-"}</td>
                        <td className="border border-slate-400 p-1">{row.details || "-"}</td>
                        <td className="border border-slate-400 p-1 text-center">{row.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Service Trainings Table */}
              <div>
                <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-1 mb-3 uppercase tracking-wider">१३. सेवांतर्गत प्रशिक्षण नोंदी</h3>
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-400 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-400 p-1.5">प्रशिक्षणाचे नाव</th>
                      <th className="border border-slate-400 p-1.5">प्रशिक्षण ठिकाण</th>
                      <th className="border border-slate-400 p-1.5 text-center">प्रशिक्षण स्तर</th>
                      <th className="border border-slate-400 p-1.5 text-center">कालावधी (दिवस)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.trainingsTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-400 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-400 p-1 font-bold">{row.name || "-"}</td>
                        <td className="border border-slate-400 p-1">{row.location || "-"}</td>
                        <td className="border border-slate-400 p-1 text-center">{row.level || "-"}</td>
                        <td className="border border-slate-400 p-1 text-center">{row.duration || "-"} ({row.days || "-"} दिवस)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-300 mt-10">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ५</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper to render responsive input/view fields
function renderInputField(
  label: string,
  field: keyof typeof DEFAULT_PORTFOLIO,
  value: string,
  isEditing: boolean,
  onChange: (field: keyof typeof DEFAULT_PORTFOLIO, value: string) => void
) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{label}</label>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
        />
      ) : (
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-800">
          {value || "-"}
        </div>
      )}
    </div>
  );
}

// Helper to render reusable qualification tables
function renderQualificationTable(
  tableName: "eduTable" | "profTable" | "otherTable",
  data: any[],
  isEditing: boolean,
  onTableChange: (tableName: any, id: number, field: string, value: string) => void
) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 text-[10px] md:text-xs uppercase tracking-wider">
            <th className="py-3 px-4 w-16 text-center">अ.न.</th>
            <th className="py-3 px-4">शैक्षणिक / व्यावसायिक पात्रता</th>
            <th className="py-3 px-4">मंडळ / विद्यापीठ</th>
            <th className="py-3 px-4 text-center">श्रेणी / टक्केवारी</th>
            <th className="py-3 px-4 text-center w-32">वर्ष</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
          {data.map((row) => (
            <tr key={row.id}>
              <td className="py-3 px-4 text-center text-slate-400">{row.id}</td>
              <td className="py-2 px-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.degree}
                    onChange={(e) => onTableChange(tableName, row.id, "degree", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                ) : (
                  <span>{row.degree || "-"}</span>
                )}
              </td>
              <td className="py-2 px-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.board}
                    onChange={(e) => onTableChange(tableName, row.id, "board", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                ) : (
                  <span>{row.board || "-"}</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.grade}
                    onChange={(e) => onTableChange(tableName, row.id, "grade", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none text-center"
                  />
                ) : (
                  <span>{row.grade || "-"}</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.year}
                    onChange={(e) => onTableChange(tableName, row.id, "year", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none text-center"
                  />
                ) : (
                  <span>{row.year || "-"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
