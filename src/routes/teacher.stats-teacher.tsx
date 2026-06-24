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
  Camera,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast as toast } from "@/lib/custom-toast";
import html2pdf from "html2pdf.js";

export const Route = createFileRoute("/teacher/stats-teacher")({
  component: TeacherStatsPage,
});

// Star border component that places ★ characters absolutely around the edges
// This renders perfectly in both browsers and html2pdf export.
function StarBorder() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none p-1.5 border-2 border-slate-950 m-2">
      {/* Top Border Stars */}
      <div className="absolute top-1 left-1 right-1 flex justify-between text-[6px] md:text-[7px] text-slate-950 leading-none px-1">
        {Array.from({ length: 62 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      {/* Bottom Border Stars */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[6px] md:text-[7px] text-slate-950 leading-none px-1">
        {Array.from({ length: 62 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      {/* Left Border Stars */}
      <div className="absolute top-3 bottom-3 left-1 flex flex-col justify-between text-[6px] md:text-[7px] text-slate-950 leading-none py-0.5">
        {Array.from({ length: 88 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      {/* Right Border Stars */}
      <div className="absolute top-3 bottom-3 right-1 flex flex-col justify-between text-[6px] md:text-[7px] text-slate-950 leading-none py-0.5">
        {Array.from({ length: 88 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
    </div>
  );
}

// Pre-populated default values to match user's exact screenshot and mock details
const DEFAULT_PORTFOLIO = {
  // Page 1: School & Class Info
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

  // Page 2: Service Details
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

  // Page 3 Tables: Qualifications
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

  // Page 4 Tables: Bank & Service History
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

  // Page 5 Tables: Family & Books
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

  // Page 6 Tables: Publications & Trainings
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
  const [activeTab, setActiveTab] = useState("page1");
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printTemplateRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
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

  // Generate A4 Booklet PDF using html2pdf.js
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    toast.info("अधिकृत संचिका PDF तयार होत आहे, कृपया थांबा...");

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
          margin: [0, 0, 0, 0], // Zero margin since the pages have absolute star borders
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
        toast.success("संचिका PDF यशस्वीरीत्या डाउनलोड झाली आहे");
      } catch (error) {
        console.error("PDF Generation error:", error);
        toast.error("PDF डाउनलोड करण्यात अडचण आली");
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 500);
  };

  const watermarkText = "rajugangurde-9552404950";

  return (
    <>
      <div className="min-h-screen bg-slate-100">
        <TeacherHeader />
        <TeacherSidebar />

        <main className="lg:pl-64 pt-16 min-h-screen pb-16">
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            
            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-300 pb-5">
              <div className="space-y-1">
                <Link
                  to="/teacher"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors mb-1"
                >
                  <ChevronLeft className="size-3.5" /> Back to Dashboard
                </Link>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="size-8 text-[#4a148c]" /> शिक्षक संचिका (Official Record Booklet)
                </h1>
                <p className="text-slate-500 font-semibold text-xs md:text-sm">
                  मूळ शाळा आणि अधिकृत संचिका स्वरूपातील डिजिटल हस्तलिखित बुकलेट
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      <Save className="size-4" /> जतन करा (Save)
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                    >
                      रद्द करा
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-[#4a148c] text-white rounded-xl shadow-sm hover:bg-indigo-900 transition-all cursor-pointer"
                  >
                    <Edit className="size-4" /> माहिती भरा / संपादन (Edit)
                  </button>
                )}

                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl shadow-sm hover:from-violet-800 hover:to-indigo-800 transition-all disabled:opacity-50 cursor-pointer"
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

            {/* Booklet Navigation Tabs */}
            <div className="flex bg-slate-200/80 p-1.5 rounded-2xl overflow-x-auto gap-1 shadow-inner">
              {[
                { id: "page1", label: "पान १: शाळा व वैयक्तिक" },
                { id: "page2", label: "पान २: सेवा व पत्ता" },
                { id: "page3", label: "पान ३: शैक्षणिक व व्यावसायिक" },
                { id: "page4", label: "पान ४: बँक व बदली इतिहास" },
                { id: "page5", label: "पान ५: कुटुंब व पुस्तके" },
                { id: "page6", label: "पान ६: साहित्य व प्रशिक्षण" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white text-[#4a148c] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Booklet Page Screen Preview */}
            <div className="flex justify-center">
              <div
                className="bg-white shadow-2xl relative w-[210mm] min-h-[297mm] p-10 md:p-14 overflow-hidden border border-slate-300"
                style={{ contentVisibility: "auto" }}
              >
                {/* Visual Star Border on Screen */}
                <StarBorder />

                {/* Watermark in bottom corner */}
                <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-400 select-none pointer-events-none">
                  {watermarkText}
                </div>

                {/* PAGE 1 CONTENT */}
                {activeTab === "page1" && (
                  <div className="space-y-6 pt-2">
                    {/* Header Cover Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-950 tracking-wide uppercase">शिक्षक संचिका</h2>
                        <div className="text-xs font-bold text-slate-600">शिक्षकाचे नाव: <span className="text-[#4a148c] font-black">{portfolio.teacherName}</span></div>
                        <div className="text-xs font-bold text-slate-600">मोबाईल नं: <span className="text-[#4a148c] font-black">{portfolio.mobile}</span></div>
                      </div>

                      {/* Photo Box to match exact format */}
                      <div className="border-2 border-slate-950 w-24 h-28 flex flex-col items-center justify-center bg-slate-50 text-center flex-shrink-0 relative">
                        <span className="text-red-600 font-black text-sm">फोटो</span>
                      </div>
                    </div>

                    {/* Table 1: School Info */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शाळा व वर्गवार माहिती</h3>
                      <table className="w-full border-collapse border border-slate-400 text-xs font-bold">
                        <tbody>
                          {renderRow("शाळा संकेताक", "schoolCode", portfolio.schoolCode, isEditing, handleInputChange)}
                          {renderRow("वर्गशिक्षकाचे नाव (HM)", "headmasterName", portfolio.headmasterName, isEditing, handleInputChange)}
                          {renderRow("शाळेचे नाव", "schoolName", portfolio.schoolName, isEditing, handleInputChange)}
                          {renderRow("पोस्ट", "post", portfolio.post, isEditing, handleInputChange)}
                          {renderRow("केंद्र", "center", portfolio.center, isEditing, handleInputChange)}
                          {renderRow("तालुका", "taluka", portfolio.taluka, isEditing, handleInputChange)}
                          {renderRow("जिल्हा", "district", portfolio.district, isEditing, handleInputChange)}
                          {renderRow("पिन", "pin", portfolio.pin, isEditing, handleInputChange)}
                          {renderRow("इयत्ता", "standard", portfolio.standard, isEditing, handleInputChange)}
                          {renderRow("तुकडी", "division", portfolio.division, isEditing, handleInputChange)}
                          {renderRow("मोबाईल", "mobileSchool", portfolio.mobileSchool, isEditing, handleInputChange)}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2: Personal Details Part 1 */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शिक्षकाची वैयक्तिक माहिती (भाग १)</h3>
                      <table className="w-full border-collapse border border-slate-400 text-xs font-bold">
                        <tbody>
                          {renderRow("शिक्षकाचे नाव", "teacherName", portfolio.teacherName, isEditing, handleInputChange)}
                          {renderRow("जन्मतारीख", "dob", portfolio.dob, isEditing, handleInputChange)}
                          {renderRow("जन्मस्थळ", "birthplace", portfolio.birthplace, isEditing, handleInputChange)}
                          {renderRow("पद", "designation", portfolio.designation, isEditing, handleInputChange)}
                          {renderRow("जात", "caste", portfolio.caste, isEditing, handleInputChange)}
                          {renderRow("प्रवर्ग", "category", portfolio.category, isEditing, handleInputChange)}
                          {renderRow("आधार क्र.", "aadhaar", portfolio.aadhaar, isEditing, handleInputChange)}
                          {renderRow("सरल ID क्र.", "saralId", portfolio.saralId, isEditing, handleInputChange)}
                          {renderRow("शालार्थ ID", "shalarthId", portfolio.shalarthId, isEditing, handleInputChange)}
                          {renderRow("मोबाईल", "mobile", portfolio.mobile, isEditing, handleInputChange)}
                          {renderRow("प्रा.फंड क्र", "pfNo", portfolio.pfNo, isEditing, handleInputChange)}
                          {renderRow("PAN नं.", "pan", portfolio.pan, isEditing, handleInputChange)}
                          {renderRow("निवडणूक कार्ड नं", "voterId", portfolio.voterId, isEditing, handleInputChange)}
                          {renderRow("रेशनकार्ड नं.", "rationCard", portfolio.rationCard, isEditing, handleInputChange)}
                          {renderRow("ई-मेल ID", "email", portfolio.email, isEditing, handleInputChange)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PAGE 2 CONTENT */}
                {activeTab === "page2" && (
                  <div className="space-y-6 pt-2">
                    <h2 className="text-xl font-black text-slate-950 border-b border-slate-800 pb-1 uppercase tracking-wider">वैयक्तिक व सेवा तपशील</h2>
                    
                    {/* Table 3: Personal & Health part 2 */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">वैयक्तिक माहिती (भाग २)</h3>
                      <table className="w-full border-collapse border border-slate-400 text-xs font-bold">
                        <tbody>
                          {renderRow("रक्तगट", "bloodGroup", portfolio.bloodGroup, isEditing, handleInputChange)}
                          {renderRow("वजन", "weight", portfolio.weight, isEditing, handleInputChange)}
                          {renderRow("उंची", "height", portfolio.height, isEditing, handleInputChange)}
                          {renderRow("सेवानिवृत्ती ता.", "retirementDate", portfolio.retirementDate, isEditing, handleInputChange)}
                          {renderRow("प्रथम सेवा / प्रथम नियुक्ती", "firstJoiningDate", portfolio.firstJoiningDate, isEditing, handleInputChange)}
                          {renderRow("या शाळेवर हजर दि.", "joiningSchoolDate", portfolio.joiningSchoolDate, isEditing, handleInputChange)}
                          {renderRow("या तालुक्यात हजर दि.", "joiningTalukaDate", portfolio.joiningTalukaDate, isEditing, handleInputChange)}
                          {renderRow("या जिल्ह्यात हजर दि.", "joiningDistrictDate", portfolio.joiningDistrictDate, isEditing, handleInputChange)}
                          {renderRow("अपंगत्व प्रमाणपत्र क्र.", "handicapNo", portfolio.handicapNo, isEditing, handleInputChange)}
                          {renderRow("वाहन लायसन्स क्र.", "dlNo", portfolio.dlNo, isEditing, handleInputChange)}
                          {renderRow("वाहन क्र.", "vehicleNo", portfolio.vehicleNo, isEditing, handleInputChange)}
                          {renderRow("इन्कमटॅक्स नं.", "incomeTaxNo", portfolio.incomeTaxNo, isEditing, handleInputChange)}
                          {renderRow("NPS/DCPS क्र.", "npsNo", portfolio.npsNo, isEditing, handleInputChange)}
                          {renderRow("शैक्षणिक पात्रता", "eduQualification", portfolio.eduQualification, isEditing, handleInputChange)}
                          {renderRow("व्यावसायिक पात्रता", "profQualification", portfolio.profQualification, isEditing, handleInputChange)}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 4: Contact & Interests */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">आवड, छंद व पत्ते</h3>
                      <table className="w-full border-collapse border border-slate-400 text-xs font-bold">
                        <tbody>
                          {renderRow("आवड", "hobbies", portfolio.hobbies, isEditing, handleInputChange)}
                          {renderRow("शालेय काम", "duties", portfolio.duties, isEditing, handleInputChange)}
                          {renderRow("अवगत असलेल्या भाषा", "languages", portfolio.languages, isEditing, handleInputChange)}
                          {renderRow("सध्याचा पत्ता", "currentAddress", portfolio.currentAddress, isEditing, handleInputChange)}
                          {renderRow("कायमचा पत्ता", "permanentAddress", portfolio.permanentAddress, isEditing, handleInputChange)}
                          {renderRow("पत्रव्यवहाराचा पत्ता", "correspondenceAddress", portfolio.correspondenceAddress, isEditing, handleInputChange)}
                          {renderRow("मोबाईल क्र. १", "mobile", portfolio.mobile, isEditing, handleInputChange)}
                          {renderRow("मोबाईल क्र. २", "secondaryMobile", portfolio.secondaryMobile, isEditing, handleInputChange)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PAGE 3 CONTENT */}
                {activeTab === "page3" && (
                  <div className="space-y-6 pt-2">
                    <h2 className="text-xl font-black text-slate-950 border-b border-slate-800 pb-1 uppercase tracking-wider">पात्रता तपशील</h2>
                    
                    {/* Educational Qualification */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-[#4a148c] uppercase tracking-wider">शैक्षणिक पात्रता</h3>
                      {renderInteractiveTable("eduTable", portfolio.eduTable, isEditing, handleTableChange)}
                    </div>

                    {/* Professional Qualification */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-[#4a148c] uppercase tracking-wider">व्यावसायिक पात्रता</h3>
                      {renderInteractiveTable("profTable", portfolio.profTable, isEditing, handleTableChange)}
                    </div>

                    {/* Other Qualification */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-[#4a148c] uppercase tracking-wider">इतर पात्रता</h3>
                      {renderInteractiveTable("otherTable", portfolio.otherTable, isEditing, handleTableChange)}
                    </div>
                  </div>
                )}

                {/* PAGE 4 CONTENT */}
                {activeTab === "page4" && (
                  <div className="space-y-6 pt-2">
                    <h2 className="text-xl font-black text-slate-950 border-b border-slate-800 pb-1 uppercase tracking-wider">बँक व सेवा इतिहास</h2>
                    
                    {/* Bank Info */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">बँक खात्यांविषयी माहिती</h3>
                      <div className="overflow-x-auto border border-slate-400">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">बँकेचे नाव</th>
                              <th className="border-r border-slate-400 p-2">शाखा</th>
                              <th className="border-r border-slate-400 p-2">खाते क्र.</th>
                              <th className="p-2">IFSC Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.bankTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.bankName}
                                      onChange={(e) => handleTableChange("bankTable", row.id, "bankName", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.bankName || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.branch}
                                      onChange={(e) => handleTableChange("bankTable", row.id, "branch", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.branch || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.accNo}
                                      onChange={(e) => handleTableChange("bankTable", row.id, "accNo", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.accNo || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.ifsc}
                                      onChange={(e) => handleTableChange("bankTable", row.id, "ifsc", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1 font-mono">{row.ifsc || "-"}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Service History */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शैक्षणिक सेवा तपशील</h3>
                      <div className="overflow-x-auto border border-slate-400 max-h-[350px] overflow-y-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">बदली होऊन आलेली शाळा</th>
                              <th className="border-r border-slate-400 p-2">कालावधी</th>
                              <th className="border-r border-slate-400 p-2">एकूण सेवा</th>
                              <th className="p-2">बदली आदेश क्र.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.serviceTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.school}
                                      onChange={(e) => handleTableChange("serviceTable", row.id, "school", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.school || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.period}
                                      onChange={(e) => handleTableChange("serviceTable", row.id, "period", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.period || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.totalService}
                                      onChange={(e) => handleTableChange("serviceTable", row.id, "totalService", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.totalService || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.orderNo}
                                      onChange={(e) => handleTableChange("serviceTable", row.id, "orderNo", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1 text-slate-500">{row.orderNo || "-"}</span>
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

                {/* PAGE 5 CONTENT */}
                {activeTab === "page5" && (
                  <div className="space-y-6 pt-2">
                    <h2 className="text-xl font-black text-slate-950 border-b border-slate-800 pb-1 uppercase tracking-wider">कुटुंब व वाचन आवड</h2>
                    
                    {/* Family Table */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">कौटुंबिक माहिती</h3>
                      <div className="overflow-x-auto border border-slate-400">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">कुटुंबातील व्यक्तीचे नाव</th>
                              <th className="border-r border-slate-400 p-2">नाते</th>
                              <th className="border-r border-slate-400 p-2 text-center">जन्मतारीख</th>
                              <th className="p-2">आधार क्र.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.familyTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.name}
                                      onChange={(e) => handleTableChange("familyTable", row.id, "name", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.name || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.relation}
                                      onChange={(e) => handleTableChange("familyTable", row.id, "relation", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.relation || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1 text-center">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.dob}
                                      onChange={(e) => handleTableChange("familyTable", row.id, "dob", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-center text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.dob || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.aadhaar}
                                      onChange={(e) => handleTableChange("familyTable", row.id, "aadhaar", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.aadhaar || "-"}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Books Table */}
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">आवडीची पुस्तके</h3>
                      <div className="overflow-x-auto border border-slate-400 max-h-[350px] overflow-y-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">पुस्तकाचे नाव</th>
                              <th className="border-r border-slate-400 p-2">लेखक</th>
                              <th className="p-2">आशय परिचय</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.booksTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.title}
                                      onChange={(e) => handleTableChange("booksTable", row.id, "title", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.title || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.author}
                                      onChange={(e) => handleTableChange("booksTable", row.id, "author", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.author || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.summary}
                                      onChange={(e) => handleTableChange("booksTable", row.id, "summary", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.summary || "-"}</span>
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

                {/* PAGE 6 CONTENT */}
                {activeTab === "page6" && (
                  <div className="space-y-6 pt-2">
                    <h2 className="text-xl font-black text-slate-950 border-b border-slate-800 pb-1 uppercase tracking-wider">साहित्य, प्रशिक्षण व इतर</h2>
                    
                    {/* Publications Table */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-[#4a148c] uppercase tracking-wider">प्रकाशित साहित्य / कवितासंग्रह</h3>
                      <div className="overflow-x-auto border border-slate-400 max-h-[250px] overflow-y-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">विषय</th>
                              <th className="border-r border-slate-400 p-2">तपशील</th>
                              <th className="p-2 w-20 text-center">वर्ष</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.pubTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.topic}
                                      onChange={(e) => handleTableChange("pubTable", row.id, "topic", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.topic || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.details}
                                      onChange={(e) => handleTableChange("pubTable", row.id, "details", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.details || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1 text-center">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.year}
                                      onChange={(e) => handleTableChange("pubTable", row.id, "year", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-center text-[#4a148c]"
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
                    <div className="space-y-2 mt-4">
                      <h3 className="text-xs font-black text-[#4a148c] uppercase tracking-wider">सेवांतर्गत प्रशिक्षण नोंदी</h3>
                      <div className="overflow-x-auto border border-slate-400 max-h-[250px] overflow-y-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-400 text-[#4a148c] font-black">
                              <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
                              <th className="border-r border-slate-400 p-2">प्रशिक्षणाचे नाव</th>
                              <th className="border-r border-slate-400 p-2">ठिकाण</th>
                              <th className="border-r border-slate-400 p-2">स्तर</th>
                              <th className="border-r border-slate-400 p-2">कालावधी</th>
                              <th className="p-2 text-center">दिवस</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
                            {portfolio.trainingsTable.map((row) => (
                              <tr key={row.id}>
                                <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.name}
                                      onChange={(e) => handleTableChange("trainingsTable", row.id, "name", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.name || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.location}
                                      onChange={(e) => handleTableChange("trainingsTable", row.id, "location", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.location || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.level}
                                      onChange={(e) => handleTableChange("trainingsTable", row.id, "level", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.level || "-"}</span>
                                  )}
                                </td>
                                <td className="border-r border-slate-400 p-1">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.duration}
                                      onChange={(e) => handleTableChange("trainingsTable", row.id, "duration", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                                    />
                                  ) : (
                                    <span className="px-1">{row.duration || "-"}</span>
                                  )}
                                </td>
                                <td className="p-1 text-center">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={row.days}
                                      onChange={(e) => handleTableChange("trainingsTable", row.id, "days", e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-center text-[#4a148c]"
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

                    {/* Other Notes */}
                    <div className="space-y-1 mt-4">
                      <label className="text-xs font-black text-slate-950 uppercase tracking-wider block">इतर माहिती / नोंदी</label>
                      {isEditing ? (
                        <textarea
                          value={portfolio.otherNotes}
                          onChange={(e) => handleInputChange("otherNotes", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all h-20"
                        />
                      ) : (
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-extrabold text-slate-800 min-h-16">
                          {portfolio.otherNotes || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ==================== HIGH-FIDELITY PRINT-READY 6-PAGE A4 BOOKLET (HIDDEN ON SCREEN) ==================== */}
      <div style={{ display: "none" }}>
        <div
          ref={printTemplateRef}
          className="bg-white text-slate-950 p-0 font-serif"
          style={{ width: "210mm", minHeight: "297mm", color: "#000" }}
        >
          {/* ================= PAGE 1 ================= */}
          <div className="pdf-page relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              {/* Header Cover Row */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-slate-950 tracking-wide uppercase leading-none">शिक्षक संचिका</h1>
                  <div className="text-xs font-bold text-slate-700">शिक्षकाचे नाव: <span className="text-[#4a148c] font-black">{portfolio.teacherName}</span></div>
                  <div className="text-xs font-bold text-slate-700">मोबाईल नं: <span className="text-[#4a148c] font-black">{portfolio.mobile}</span></div>
                </div>

                {/* Photo Box styled exactly as requested */}
                <div className="border-2 border-slate-950 w-24 h-28 flex flex-col items-center justify-center bg-white text-center flex-shrink-0 relative">
                  <span className="text-red-600 font-black text-sm">फोटो</span>
                </div>
              </div>

              {/* Table 1: School Info */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शाळा व वर्गवार माहिती</h3>
                <table className="w-full border-collapse border border-slate-950 text-[10px]">
                  <tbody>
                    {renderPrintRow("शाळा संकेताक", portfolio.schoolCode)}
                    {renderPrintRow("वर्गशिक्षकाचे नाव", portfolio.headmasterName)}
                    {renderPrintRow("शाळेचे नाव", portfolio.schoolName)}
                    {renderPrintRow("पोस्ट", portfolio.post)}
                    {renderPrintRow("केंद्र", portfolio.center)}
                    {renderPrintRow("तालुका", portfolio.taluka)}
                    {renderPrintRow("जिल्हा", portfolio.district)}
                    {renderPrintRow("पिन", portfolio.pin)}
                    {renderPrintRow("इयत्ता", portfolio.standard)}
                    {renderPrintRow("तुकडी", portfolio.division)}
                    {renderPrintRow("मोबाईल", portfolio.mobileSchool)}
                  </tbody>
                </table>
              </div>

              {/* Table 2: Personal Details part 1 */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शिक्षकाची वैयक्तिक माहिती (भाग १)</h3>
                <table className="w-full border-collapse border border-slate-950 text-[10px]">
                  <tbody>
                    {renderPrintRow("शिक्षकाचे नाव", portfolio.teacherName)}
                    {renderPrintRow("जन्मतारीख", portfolio.dob)}
                    {renderPrintRow("जन्मस्थळ", portfolio.birthplace)}
                    {renderPrintRow("पद", portfolio.designation)}
                    {renderPrintRow("जात", portfolio.caste)}
                    {renderPrintRow("प्रवर्ग", portfolio.category)}
                    {renderPrintRow("आधार क्र.", portfolio.aadhaar)}
                    {renderPrintRow("सरल ID क्र.", portfolio.saralId)}
                    {renderPrintRow("शालार्थ ID", portfolio.shalarthId)}
                    {renderPrintRow("मोबाईल", portfolio.mobile)}
                    {renderPrintRow("प्रा.फंड क्र", portfolio.pfNo)}
                    {renderPrintRow("PAN नं.", portfolio.pan)}
                    {renderPrintRow("निवडणूक कार्ड नं", portfolio.voterId)}
                    {renderPrintRow("रेशनकार्ड नं.", portfolio.rationCard)}
                    {renderPrintRow("ई-मेल ID", portfolio.email)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signature Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <div className="text-center w-1/3">
                <div className="h-8"></div>
                <div className="border-t border-slate-600 text-[8px] font-bold">शिक्षकाची स्वाक्षरी</div>
              </div>
              <span className="text-[7px] text-slate-400">शिक्षक संचिका | पृष्ठ १</span>
              <div className="text-center w-1/3">
                <div className="h-8"></div>
                <div className="border-t border-slate-600 text-[8px] font-bold">मुख्याध्यापक स्वाक्षरी व शिक्का</div>
              </div>
            </div>
          </div>

          {/* ================= PAGE 2 ================= */}
          <div className="pdf-page page-break relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              <h2 className="text-base font-black text-slate-950 border-b-2 border-slate-950 pb-1 mb-2 text-center uppercase tracking-wider">वैयक्तिक व सेवा तपशील (भाग २)</h2>

              {/* Table 3: Personal part 2 */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">वैयक्तिक माहिती (भाग २)</h3>
                <table className="w-full border-collapse border border-slate-950 text-[10px]">
                  <tbody>
                    {renderPrintRow("रक्तगट", portfolio.bloodGroup)}
                    {renderPrintRow("वजन", portfolio.weight)}
                    {renderPrintRow("उंची", portfolio.height)}
                    {renderPrintRow("सेवानिवृत्ती ता.", portfolio.retirementDate)}
                    {renderPrintRow("प्रथम सेवा / प्रथम नियुक्ती", portfolio.firstJoiningDate)}
                    {renderPrintRow("या शाळेवर हजर दि.", portfolio.joiningSchoolDate)}
                    {renderPrintRow("या तालुक्यात हजर दि.", portfolio.joiningTalukaDate)}
                    {renderPrintRow("या जिल्ह्यात हजर दि.", portfolio.joiningDistrictDate)}
                    {renderPrintRow("अपंगत्व प्रमाणपत्र क्र.", portfolio.handicapNo)}
                    {renderPrintRow("वाहन लायसन्स क्र.", portfolio.dlNo)}
                    {renderPrintRow("वाहन क्र.", portfolio.vehicleNo)}
                    {renderPrintRow("इन्कमटॅक्स नं.", portfolio.incomeTaxNo)}
                    {renderPrintRow("NPS/DCPS क्र.", portfolio.npsNo)}
                    {renderPrintRow("शैक्षणिक पात्रता", portfolio.eduQualification)}
                    {renderPrintRow("व्यावसायिक पात्रता", portfolio.profQualification)}
                  </tbody>
                </table>
              </div>

              {/* Table 4: Hobbies & Address */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">आवड, छंद व पत्ते</h3>
                <table className="w-full border-collapse border border-slate-950 text-[10px]">
                  <tbody>
                    {renderPrintRow("आवड", portfolio.hobbies)}
                    {renderPrintRow("शालेय काम", portfolio.duties)}
                    {renderPrintRow("अवगत असलेल्या भाषा", portfolio.languages)}
                    {renderPrintRow("सध्याचा पत्ता", portfolio.currentAddress)}
                    {renderPrintRow("कायमचा पत्ता", portfolio.permanentAddress)}
                    {renderPrintRow("पत्रव्यवहाराचा पत्ता", portfolio.correspondenceAddress)}
                    {renderPrintRow("मोबाईल क्र. १", portfolio.mobile)}
                    {renderPrintRow("मोबाईल क्र. २", portfolio.secondaryMobile)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका</span>
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ २</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 3 ================= */}
          <div className="pdf-page page-break relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              <h2 className="text-base font-black text-slate-950 border-b-2 border-slate-950 pb-1 mb-2 text-center uppercase tracking-wider">शैक्षणिक व व्यावसायिक पात्रता</h2>

              {/* Table 5: Educational */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शैक्षणिक पात्रता</h3>
                {renderPrintTable(portfolio.eduTable)}
              </div>

              {/* Table 6: Professional */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">व्यावसायिक पात्रता</h3>
                {renderPrintTable(portfolio.profTable)}
              </div>

              {/* Table 7: Other */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">इतर पात्रता (उदा. MS-CIT / संगणक पात्रता)</h3>
                {renderPrintTable(portfolio.otherTable)}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका</span>
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ३</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 4 ================= */}
          <div className="pdf-page page-break relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              <h2 className="text-base font-black text-slate-950 border-b-2 border-slate-950 pb-1 mb-2 text-center uppercase tracking-wider">बँक तपशील व सेवा इतिहास</h2>

              {/* Table 8: Bank */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">बँक खात्यांविषयी माहिती</h3>
                <table className="w-full border-collapse border border-slate-950 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-950 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-950 p-1.5">बँकेचे नाव</th>
                      <th className="border border-slate-950 p-1.5">शाखा</th>
                      <th className="border border-slate-950 p-1.5">खाते क्रमांक</th>
                      <th className="border border-slate-950 p-1.5">IFSC Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.bankTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-950 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-950 p-1 font-bold">{row.bankName || "-"}</td>
                        <td className="border border-slate-950 p-1">{row.branch || "-"}</td>
                        <td className="border border-slate-950 p-1 font-extrabold">{row.accNo || "-"}</td>
                        <td className="border border-slate-955 p-1 font-mono">{row.ifsc || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 9: Service History */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">शैक्षणिक सेवा तपशील (बदली इतिहास)</h3>
                <table className="w-full border-collapse border border-slate-950 text-[8px] leading-tight">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-955 p-1 text-center w-8">अ.न.</th>
                      <th className="border border-slate-955 p-1">बदली होऊन आलेली शाळा</th>
                      <th className="border border-slate-955 p-1 text-center w-24">कालावधी</th>
                      <th className="border border-slate-955 p-1 text-center w-20">एकूण सेवा</th>
                      <th className="border border-slate-955 p-1">बदली आदेश क्र. व तारीख</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.serviceTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-950 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-955 p-1 font-bold">{row.school || "-"}</td>
                        <td className="border border-slate-955 p-1 text-center">{row.period || "-"}</td>
                        <td className="border border-slate-955 p-1 text-center">{row.totalService || "-"}</td>
                        <td className="border border-slate-955 p-1 text-slate-600">{row.orderNo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका</span>
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ४</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 5 ================= */}
          <div className="pdf-page page-break relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              <h2 className="text-base font-black text-slate-950 border-b-2 border-slate-950 pb-1 mb-2 text-center uppercase tracking-wider">कुटुंब व आवडलेली पुस्तके</h2>

              {/* Table 10: Family */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">कौटुंबिक माहिती</h3>
                <table className="w-full border-collapse border border-slate-950 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-950 p-1.5 text-center w-10">अ.न.</th>
                      <th className="border border-slate-955 p-1.5">कुटुंबातील व्यक्तीचे नाव</th>
                      <th className="border border-slate-955 p-1.5 text-center w-20">नाते</th>
                      <th className="border border-slate-955 p-1.5 text-center w-24">जन्मतारीख</th>
                      <th className="border border-slate-955 p-1.5 text-center">आधार क्रमांक</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.familyTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-950 p-1.5 text-center">{row.id}</td>
                        <td className="border border-slate-950 p-1.5 font-bold">{row.name || "-"}</td>
                        <td className="border border-slate-950 p-1.5 text-center">{row.relation || "-"}</td>
                        <td className="border border-slate-950 p-1.5 text-center">{row.dob || "-"}</td>
                        <td className="border border-slate-950 p-1.5 text-center font-mono">{row.aadhaar || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 11: Favorite Books */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">आवडलेली पुस्तके</h3>
                <table className="w-full border-collapse border border-slate-950 text-[8px] leading-tight">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-955 p-1 w-8 text-center">अ.न.</th>
                      <th className="border border-slate-955 p-1 w-44">पुस्तकाचे नाव</th>
                      <th className="border border-slate-955 p-1 w-36">लेखक</th>
                      <th className="border border-slate-955 p-1">आशय / परिचय</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.booksTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-950 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-950 p-1 font-bold">{row.title || "-"}</td>
                        <td className="border border-slate-950 p-1">{row.author || "-"}</td>
                        <td className="border border-slate-950 p-1 text-slate-600">{row.summary || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका</span>
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ५</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>

          {/* ================= PAGE 6 ================= */}
          <div className="pdf-page page-break relative w-[210mm] h-[297mm] p-16 flex flex-col justify-between overflow-hidden bg-white box-border">
            <StarBorder />
            <div className="absolute bottom-3.5 right-6 text-[8px] font-mono text-slate-500 select-none">{watermarkText}</div>

            <div className="space-y-6 pt-4">
              <h2 className="text-base font-black text-slate-950 border-b-2 border-slate-950 pb-1 mb-2 text-center uppercase tracking-wider">साहित्य, प्रशिक्षण व इतर नोंदी</h2>

              {/* Table 12: Publications */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">प्रकाशित साहित्य / कवितासंग्रह</h3>
                <table className="w-full border-collapse border border-slate-955 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-955 p-1 text-center w-10">अ.न.</th>
                      <th className="border border-slate-955 p-1 w-44">विषय</th>
                      <th className="border border-slate-955 p-1">साहित्याचा तपशील</th>
                      <th className="border border-slate-955 p-1 text-center w-16">वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.pubTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-955 p-1.5 text-center">{row.id}</td>
                        <td className="border border-slate-955 p-1.5 font-bold">{row.topic || "-"}</td>
                        <td className="border border-slate-955 p-1.5">{row.details || "-"}</td>
                        <td className="border border-slate-955 p-1.5 text-center font-bold">{row.year || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 13: Trainings */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">सेवांतर्गत प्रशिक्षण नोंदी</h3>
                <table className="w-full border-collapse border border-slate-955 text-[8px] leading-tight">
                  <thead>
                    <tr className="bg-slate-50 text-slate-950 font-bold">
                      <th className="border border-slate-955 p-1 text-center w-8">अ.न.</th>
                      <th className="border border-slate-955 p-1">प्रशिक्षणाचे नाव</th>
                      <th className="border border-slate-955 p-1">ठिकाण</th>
                      <th className="border border-slate-955 p-1 text-center">प्रशिक्षण स्तर</th>
                      <th className="border border-slate-955 p-1 text-center">कालावधी (दिवस)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.trainingsTable.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-slate-950 p-1 text-center">{row.id}</td>
                        <td className="border border-slate-950 p-1 font-bold">{row.name || "-"}</td>
                        <td className="border border-slate-950 p-1">{row.location || "-"}</td>
                        <td className="border border-slate-950 p-1 text-center">{row.level || "-"}</td>
                        <td className="border border-slate-950 p-1 text-center font-bold">{row.duration || "-"} ({row.days || "-"} दिवस)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Other Info */}
              <div className="space-y-1.5 mt-4">
                <h3 className="text-[10px] font-black text-slate-950 border-b border-slate-800 pb-0.5 uppercase tracking-wider">इतर माहिती / नोंदी</h3>
                <div className="border border-slate-955 p-3 text-[9px] min-h-20 font-bold leading-relaxed bg-slate-50/20">
                  {portfolio.otherNotes || "काहीही इतर नोंदी उपलब्ध नाहीत."}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="text-[8px] text-slate-400">शिक्षक संचिका</span>
              <span className="text-[8px] text-slate-400">शिक्षक संचिका | पृष्ठ ६</span>
              <span className="text-[8px] text-slate-400">नाव: {portfolio.teacherName}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Render input/view rows on screen to match exact pre-printed paper layout
function renderRow(
  label: string,
  field: keyof typeof DEFAULT_PORTFOLIO,
  value: string,
  isEditing: boolean,
  onChange: (field: keyof typeof DEFAULT_PORTFOLIO, value: string) => void
) {
  return (
    <tr className="border-b border-slate-400 hover:bg-slate-50/50 transition-colors">
      <td className="border-r border-slate-400 p-2.5 w-1/3 bg-slate-50 text-[#4a148c] font-black text-sm tracking-wide">
        {label}
      </td>
      <td className="p-2 w-2/3">
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#4a148c] focus:bg-white focus:outline-none transition-all"
          />
        ) : (
          <span className="px-2 font-extrabold text-slate-900 text-sm block min-h-5">{value || "-"}</span>
        )}
      </td>
    </tr>
  );
}

// Render standard row for PDF print template (no inputs, clean typography)
function renderPrintRow(label: string, value: string) {
  return (
    <tr className="border-b border-slate-950">
      <td className="border-r border-slate-955 p-2 w-1/3 bg-slate-50/60 text-[#4a148c] font-black text-[10px] tracking-wide">
        {label}
      </td>
      <td className="p-2 w-2/3 font-extrabold text-slate-950 text-[10px] leading-tight">
        {value || "-"}
      </td>
    </tr>
  );
}

// Render interactive qualification tables on screen
function renderInteractiveTable(
  tableName: "eduTable" | "profTable" | "otherTable",
  data: any[],
  isEditing: boolean,
  onTableChange: (tableName: any, id: number, field: string, value: string) => void
) {
  return (
    <div className="overflow-x-auto border border-slate-400">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-400 text-[#4a148c] font-black">
            <th className="border-r border-slate-400 p-2 text-center w-12">अ.न.</th>
            <th className="border-r border-slate-400 p-2">शैक्षणिक / व्यावसायिक पात्रता</th>
            <th className="border-r border-slate-400 p-2">विद्यापीठ / मंडळ</th>
            <th className="border-r border-slate-400 p-2 text-center">श्रेणी</th>
            <th className="p-2 text-center w-24">वर्ष</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300 font-bold text-slate-900">
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border-r border-slate-400 p-2 text-center text-slate-500">{row.id}</td>
              <td className="border-r border-slate-400 p-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.degree}
                    onChange={(e) => onTableChange(tableName, row.id, "degree", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                  />
                ) : (
                  <span className="px-1">{row.degree || "-"}</span>
                )}
              </td>
              <td className="border-r border-slate-400 p-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.board}
                    onChange={(e) => onTableChange(tableName, row.id, "board", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-[#4a148c]"
                  />
                ) : (
                  <span className="px-1">{row.board || "-"}</span>
                )}
              </td>
              <td className="border-r border-slate-400 p-1 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.grade}
                    onChange={(e) => onTableChange(tableName, row.id, "grade", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-center text-[#4a148c]"
                  />
                ) : (
                  <span>{row.grade || "-"}</span>
                )}
              </td>
              <td className="p-1 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={row.year}
                    onChange={(e) => onTableChange(tableName, row.id, "year", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-center text-[#4a148c]"
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

// Render clean, non-interactive tables for PDF print template
function renderPrintTable(data: any[]) {
  return (
    <table className="w-full border-collapse border border-slate-950 text-[10px]">
      <thead>
        <tr className="bg-slate-50/60 text-slate-950 font-bold border-b border-slate-950">
          <th className="border-r border-slate-955 p-1.5 text-center w-10">अ.न.</th>
          <th className="border-r border-slate-955 p-1.5">शैक्षणिक / व्यावसायिक पात्रता</th>
          <th className="border-r border-slate-955 p-1.5">विद्यापीठ / मंडळ</th>
          <th className="border-r border-slate-955 p-1.5 text-center">श्रेणी</th>
          <th className="p-1.5 text-center w-20">वर्ष</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b border-slate-950">
            <td className="border-r border-slate-955 p-1.5 text-center">{row.id}</td>
            <td className="border-r border-slate-955 p-1.5 font-bold">{row.degree || "-"}</td>
            <td className="border-r border-slate-955 p-1.5">{row.board || "-"}</td>
            <td className="border-r border-slate-955 p-1.5 text-center">{row.grade || "-"}</td>
            <td className="p-1.5 text-center font-bold">{row.year || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
