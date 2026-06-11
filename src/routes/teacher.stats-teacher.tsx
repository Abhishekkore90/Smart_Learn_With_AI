import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  FolderOpen,
  Save,
  Printer,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import saraswatiMataImg from "@/assets/saraswatimata.png";

export const Route = createFileRoute("/teacher/stats-teacher")({
  component: TeacherStatsTeacherPage,
});

// Helper to create empty rows for tables
const createEmptyRows = (count: number, keys: string[]) => {
  return Array.from({ length: count }, () => {
    const obj: Record<string, string> = {};
    keys.forEach((key) => {
      obj[key] = "";
    });
    return obj;
  });
};

function TeacherStatsTeacherPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherPhoto, setTeacherPhoto] = useState<string>("");

  // Form State
  const [schoolInfo, setSchoolInfo] = useState({
    udiseCode: "",
    classTeacherName: "",
    schoolName: "",
    post: "",
    center: "",
    taluka: "",
    district: "",
    pin: "",
    class: "",
    division: "",
    mobile: "",
  });

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    dob: "",
    pob: "",
    designation: "",
    caste: "",
    category: "",
    aadhaar: "",
    user_id: "",
    shalarth_id: "",
    mobile: "",
    pran_code: "",
    pan: "",
    voter_card: "",
    ration_card: "",
    email: "",
  });

  const [physicalServiceInfo, setPhysicalServiceInfo] = useState({
    bloodGroup: "",
    weight: "",
    height: "",
    retirementDate: "",
    joiningDate: "",
    schoolJoiningDate: "",
    talukaJoiningDate: "",
    districtJoiningDate: "",
    disabilityNo: "",
    drivingLicenceNo: "",
    vehicleNo: "",
    incomeTaxNo: "",
    npsDcpsNo: "",
    eduQualification: "",
    profQualification: "",
  });

  const [otherDetails, setOtherDetails] = useState({
    hobby: "",
    schoolDuties: "",
    languages: "",
    currentAddress: "",
    permanentAddress: "",
    correspondenceAddress: "",
    altMobile: "",
    secondAltMobile: "",
  });

  // Table States
  const [eduQualifications, setEduQualifications] = useState<any[]>(() =>
    createEmptyRows(5, ["qualification", "board", "grade", "year"])
  );
  const [profQualifications, setProfQualifications] = useState<any[]>(() =>
    createEmptyRows(4, ["qualification", "board", "grade", "year"])
  );
  const [otherQualifications, setOtherQualifications] = useState<any[]>(() =>
    createEmptyRows(5, ["qualification", "board", "grade", "year"])
  );
  const [bankDetails, setBankDetails] = useState<any[]>(() =>
    createEmptyRows(4, ["bankName", "branch", "accountNo", "ifsc"])
  );
  const [serviceHistory, setServiceHistory] = useState<any[]>(() =>
    createEmptyRows(13, ["school", "duration", "totalService", "orderNo"])
  );
  const [familyDetails, setFamilyDetails] = useState<any[]>(() =>
    createEmptyRows(9, ["memberName", "relationship", "dob", "aadhaar"])
  );
  const [favBooks, setFavBooks] = useState<any[]>(() =>
    createEmptyRows(14, ["bookName", "author", "message"])
  );
  const [publishedWorks, setPublishedWorks] = useState<any[]>(() =>
    createEmptyRows(12, ["topic", "details", "year"])
  );
  const [trainings, setTrainings] = useState<any[]>(() =>
    createEmptyRows(10, ["name", "location", "level", "duration", "days"])
  );

  // Authentication Check
  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        // Super Admin allowed
      } else if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/stats-teacher", role: "teacher" } as any,
        });
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Load data from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, "teacher_sanchika", user.uid);
        const docSnap = await getDoc(docRef);

        const defaultSchool = {
          udiseCode: profile?.udise || "",
          classTeacherName: profile?.fullName || "",
          schoolName: profile?.schoolName || "",
          post: "",
          center: "",
          taluka: "",
          district: "",
          pin: "",
          class: "",
          division: "",
          mobile: profile?.phone || "",
        };

        const defaultPersonal = {
          fullName: profile?.fullName || "",
          dob: "",
          pob: "",
          designation: "",
          caste: "",
          category: "",
          aadhaar: "",
          user_id: "",
          shalarth_id: "",
          mobile: profile?.phone || "",
          pran_code: "",
          pan: "",
          voter_card: "",
          ration_card: "",
          email: user.email || "",
        };

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchoolInfo({ ...defaultSchool, ...data.schoolInfo });
          setPersonalInfo({ ...defaultPersonal, ...data.personalInfo });
          setPhysicalServiceInfo((prev) => ({ ...prev, ...data.physicalServiceInfo }));
          setOtherDetails((prev) => ({ ...prev, ...data.otherDetails }));

          if (data.eduQualifications) setEduQualifications(data.eduQualifications);
          if (data.profQualifications) setProfQualifications(data.profQualifications);
          if (data.otherQualifications) setOtherQualifications(data.otherQualifications);
          if (data.bankDetails) setBankDetails(data.bankDetails);
          if (data.serviceHistory) setServiceHistory(data.serviceHistory);
          if (data.familyDetails) setFamilyDetails(data.familyDetails);
          if (data.favBooks) setFavBooks(data.favBooks);
          if (data.publishedWorks) setPublishedWorks(data.publishedWorks);
          if (data.trainings) setTrainings(data.trainings);
          if (data.teacherPhoto) setTeacherPhoto(data.teacherPhoto);
        } else {
          setSchoolInfo(defaultSchool);
          setPersonalInfo(defaultPersonal);
        }
      } catch (err) {
        console.error("Error loading sanchika data:", err);
        toast.error("Failed to load sanchika data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  // Save data to Firestore
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "teacher_sanchika", user.uid);
      await setDoc(docRef, {
        schoolInfo,
        personalInfo,
        physicalServiceInfo,
        otherDetails,
        eduQualifications,
        profQualifications,
        otherQualifications,
        bankDetails,
        serviceHistory,
        familyDetails,
        favBooks,
        publishedWorks,
        trainings,
        teacherPhoto,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Shikshak Sanchika saved successfully!");
    } catch (err) {
      console.error("Error saving sanchika:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        toast.error("कृपया ८०० KB पेक्षा लहान फोटो निवडा. (Photo must be smaller than 800 KB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTeacherPhoto(event.target.result as string);
          toast.success("फोटो अपलोड केला! बदल जतन करण्यासाठी 'Save' करा.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeacherPhoto("");
    toast.info("फोटो काढला");
  };

  // Table Input Handler
  const handleTableChange = (
    index: number,
    field: string,
    value: string,
    stateSetter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    stateSetter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Loading Sanchika...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white print:p-0">
      {/* Hide layout and navigation during printing */}
      <div className="print:hidden">
        <TeacherHeader />
        <TeacherSidebar />
      </div>

      <main className="lg:pl-64 pt-16 min-h-screen print:pl-0 print:pt-0">
        <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto print:p-0 flex flex-col items-center">
          
          {/* Header Controls Banner (Hidden on print) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm print:hidden w-full max-w-[210mm]">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                <FolderOpen className="size-9 text-blue-600" />
                शिक्षक संचिका
              </h1>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">
                Edit and type directly in the booklet below
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3.5 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Portfolio
              </button>

              <button
                onClick={handlePrint}
                className="px-6 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <Printer className="size-4" /> Print / Save as PDF
              </button>
            </div>
          </div>

          {/* PRINT BOOKLET replica layout - fully interactive */}
          <div id="sanchika-print-area" className="w-full max-w-[210mm] md:w-[210mm] space-y-8 print:space-y-0 print:w-full">
            
            {/* PAGE 1: COVER PAGE */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm]">
              {/* Star Border overlay configured to not block mouse clicks */}
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col items-center justify-between text-center select-none py-6">
                
                {/* Goddess Saraswati Line Art */}
                <div className="w-full max-w-[110mm] aspect-square flex items-center justify-center mt-6">
                  <img
                    src={saraswatiMataImg}
                    alt="Goddess Saraswati"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Cover Title */}
                <div className="space-y-6">
                  <h1 className="text-6xl font-black text-red-600 tracking-widest font-serif leading-tight">
                    शिक्षक संचिका
                  </h1>
                </div>

                {/* Inline Editing details on cover page */}
                <div className="w-full max-w-[120mm] text-left px-4 sm:pl-10 pb-12 space-y-5 text-red-600 font-extrabold text-base sm:text-xl pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0">• शिक्षकाचे नाव:-</span>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className="flex-1 min-w-0 bg-transparent border-b border-red-400 focus:border-red-600 outline-none text-slate-800 font-bold px-2 py-0.5 text-base sm:text-lg"
                      placeholder="येथे नाव प्रविष्ट करा"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0">• मोबाईल नं:-</span>
                    <input
                      type="text"
                      value={schoolInfo.mobile}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, mobile: e.target.value })}
                      className="flex-1 min-w-0 bg-transparent border-b border-red-400 focus:border-red-600 outline-none text-slate-800 font-bold px-2 py-0.5 text-base sm:text-lg"
                      placeholder="येथे मोबाईल नंबर प्रविष्ट करा"
                    />
                  </div>
                </div>

                {/* Tiny watermark text */}
                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 2: SCHOOL & CLASS INFO */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  {/* Photo Box Top-Right */}
                  <div className="flex justify-end pr-2 pointer-events-auto">
                    <input
                      type="file"
                      id="teacher-photo-input"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => document.getElementById("teacher-photo-input")?.click()}
                      className="size-[30mm] border border-slate-900 flex items-center justify-center text-[10px] text-red-500 font-bold text-center relative cursor-pointer overflow-hidden group print:cursor-default"
                    >
                      {teacherPhoto ? (
                        <>
                          <img
                            src={teacherPhoto}
                            alt="Teacher Profile"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={handleRemovePhoto}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                            title="फोटो काढा"
                          >
                            <X className="size-3" />
                          </button>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden pointer-events-none">
                            बदला
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2">
                          <Plus className="size-4 text-red-500 print:hidden" />
                          <span>फोटो अपलोड</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purple Text Table */}
                  <table className="w-full border-collapse border border-slate-900 text-purple-700 font-black text-sm">
                    <tbody>
                      {[
                        { label: "शाळा संकेतांक", key: "udiseCode", state: schoolInfo, setter: setSchoolInfo },
                        { label: "वर्गशिक्षकाचे नाव", key: "classTeacherName", state: schoolInfo, setter: setSchoolInfo },
                        { label: "शाळेचे नाव", key: "schoolName", state: schoolInfo, setter: setSchoolInfo },
                        { label: "पोस्ट", key: "post", state: schoolInfo, setter: setSchoolInfo },
                        { label: "केंद्र", key: "center", state: schoolInfo, setter: setSchoolInfo },
                        { label: "तालुका", key: "taluka", state: schoolInfo, setter: setSchoolInfo },
                        { label: "जिल्हा", key: "district", state: schoolInfo, setter: setSchoolInfo },
                        { label: "पिन", key: "pin", state: schoolInfo, setter: setSchoolInfo },
                        { label: "इयत्ता", key: "class", state: schoolInfo, setter: setSchoolInfo },
                        { label: "तुकडी", key: "division", state: schoolInfo, setter: setSchoolInfo },
                        { label: "मोबाईल", key: "mobile", state: schoolInfo, setter: setSchoolInfo },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-900 last:border-0 h-10">
                          <td className="w-1/3 px-4 border-r border-slate-900 font-bold">{row.label}</td>
                          <td className="w-2/3 px-2">
                            <input
                              type="text"
                              value={(row.state as any)[row.key]}
                              onChange={(e) => row.setter({ ...row.state, [row.key]: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-slate-800 font-bold font-sans px-2 focus:bg-slate-50 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 3: PERSONAL INFO */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6 pt-4">
                  {/* Red Text Table */}
                  <table className="w-full border-collapse border border-slate-900 text-red-600 font-black text-xs leading-normal">
                    <tbody>
                      {[
                        { label: "शिक्षकाचे नाव", key: "fullName", state: personalInfo, setter: setPersonalInfo },
                        { label: "जन्मतारीख", key: "dob", state: personalInfo, setter: setPersonalInfo },
                        { label: "जन्मस्थळ", key: "pob", state: personalInfo, setter: setPersonalInfo },
                        { label: "पद", key: "designation", state: personalInfo, setter: setPersonalInfo },
                        { label: "जात", key: "caste", state: personalInfo, setter: setPersonalInfo },
                        { label: "प्रवर्ग", key: "category", state: personalInfo, setter: setPersonalInfo },
                        { label: "आधार क्र.", key: "aadhaar", state: personalInfo, setter: setPersonalInfo },
                        { label: "युझर ID क्र.", key: "user_id", state: personalInfo, setter: setPersonalInfo },
                        { label: "शालार्थ ID", key: "shalarth_id", state: personalInfo, setter: setPersonalInfo },
                        { label: "मोबाईल", key: "mobile", state: personalInfo, setter: setPersonalInfo },
                        { label: "प्राण कोड क्र.", key: "pran_code", state: personalInfo, setter: setPersonalInfo },
                        { label: "PAN नं.", key: "pan", state: personalInfo, setter: setPersonalInfo },
                        { label: "निवडणूक कार्ड नं.", key: "voter_card", state: personalInfo, setter: setPersonalInfo },
                        { label: "रेशनकार्ड नं.", key: "ration_card", state: personalInfo, setter: setPersonalInfo },
                        { label: "ई-मेल ID", key: "email", state: personalInfo, setter: setPersonalInfo },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-900 last:border-0 h-[8.8mm]">
                          <td className="w-1/3 px-4 border-r border-slate-900 font-bold">{row.label}</td>
                          <td className="w-2/3 px-2">
                            <input
                              type="text"
                              value={(row.state as any)[row.key]}
                              onChange={(e) => row.setter({ ...row.state, [row.key]: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-slate-800 font-bold font-sans px-2 focus:bg-slate-50 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 4: PHYSICAL & SERVICE DATES */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6 pt-4">
                  <table className="w-full border-collapse border border-slate-900 text-slate-800 font-black text-xs">
                    <tbody>
                      {[
                        { label: "रक्तगट", key: "bloodGroup", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "वजन (kg)", key: "weight", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "उंची (cm)", key: "height", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "सेवानिवृत्ती दिनांक", key: "retirementDate", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "प्रथम सेवा रुजू दिनांक", key: "joiningDate", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "या शाळेवर हजर दिनांक", key: "schoolJoiningDate", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "या तालुक्यात हजर दिनांक", key: "talukaJoiningDate", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "या जिल्ह्यात हजर दिनांक", key: "districtJoiningDate", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "अपंगत्व प्रमाणपत्र क्र.", key: "disabilityNo", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "वाहन लायसन्स क्र.", key: "drivingLicenceNo", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "वाहन क्र.", key: "vehicleNo", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "इन्कमतॅक्स नं. (PAN)", key: "incomeTaxNo", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "NPS/DCPS क्र.", key: "npsDcpsNo", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "शैक्षणिक पात्रता", key: "eduQualification", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                        { label: "व्यावसायिक पात्रता", key: "profQualification", state: physicalServiceInfo, setter: setPhysicalServiceInfo },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-900 last:border-0 h-[8.8mm]">
                          <td className="w-1/3 px-4 border-r border-slate-900 font-bold">{row.label}</td>
                          <td className="w-2/3 px-2">
                            <input
                              type="text"
                              value={(row.state as any)[row.key]}
                              onChange={(e) => row.setter({ ...row.state, [row.key]: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-slate-800 font-bold font-sans px-2 focus:bg-slate-50 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 5: HOBBIES & ADDRESSES */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6 pt-4">
                  <table className="w-full border-collapse border border-slate-900 text-slate-800 font-black text-xs">
                    <tbody>
                      {[
                        { label: "आवड", key: "hobby", state: otherDetails, setter: setOtherDetails },
                        { label: "शालेय काम", key: "schoolDuties", state: otherDetails, setter: setOtherDetails },
                        { label: "अवगत असलेल्या भाषा", key: "languages", state: otherDetails, setter: setOtherDetails },
                        { label: "सध्याचा पत्ता", key: "currentAddress", state: otherDetails, setter: setOtherDetails },
                        { label: "कायमचा पत्ता", key: "permanentAddress", state: otherDetails, setter: setOtherDetails },
                        { label: "पत्रव्यवहाराचा पत्ता", key: "correspondenceAddress", state: otherDetails, setter: setOtherDetails },
                        { label: "मोबाईल क्र. १", key: "altMobile", state: otherDetails, setter: setOtherDetails },
                        { label: "मोबाईल क्र. २", key: "secondAltMobile", state: otherDetails, setter: setOtherDetails },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-900 last:border-0 h-[17.5mm]">
                          <td className="w-1/3 px-4 border-r border-slate-900 font-bold">{row.label}</td>
                          <td className="w-2/3 px-2">
                            <textarea
                              rows={2}
                              value={(row.state as any)[row.key]}
                              onChange={(e) => row.setter({ ...row.state, [row.key]: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-slate-800 font-bold font-sans px-2 resize-none leading-relaxed focus:bg-slate-50 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 6: ACADEMIC QUALIFICATIONS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">शैक्षणिक पात्रता</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">शैक्षणिक पात्रता</th>
                        <th className="border-r border-slate-900 px-4">विद्यापीठ / मंडळ</th>
                        <th className="border-r border-slate-900 px-4">श्रेणी/टक्केवारी</th>
                        <th className="px-4">वर्ष</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eduQualifications.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["qualification", "board", "grade", "year"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setEduQualifications)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 7: PROFESSIONAL QUALIFICATIONS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">व्यावसायिक पात्रता</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">व्यावसायिक पात्रता</th>
                        <th className="border-r border-slate-900 px-4">विद्यापीठ / मंडळ</th>
                        <th className="border-r border-slate-900 px-4">श्रेणी/टक्केवारी</th>
                        <th className="px-4">वर्ष</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profQualifications.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["qualification", "board", "grade", "year"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setProfQualifications)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 8: OTHER QUALIFICATIONS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">इतर पात्रता</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">पात्रता</th>
                        <th className="border-r border-slate-900 px-4">विद्यापीठ / मंडळ</th>
                        <th className="border-r border-slate-900 px-4">श्रेणी/टक्केवारी</th>
                        <th className="px-4">वर्ष</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherQualifications.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["qualification", "board", "grade", "year"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setOtherQualifications)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 9: BANK DETAILS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">बँक खात्याविषयी माहिती</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">बँकेचे नाव</th>
                        <th className="border-r border-slate-900 px-4">शाखा</th>
                        <th className="border-r border-slate-900 px-4">खाते क्र.</th>
                        <th className="px-4">IFSC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankDetails.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["bankName", "branch", "accountNo", "ifsc"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setBankDetails)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 10: SERVICE HISTORY */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">शैक्षणिक सेवा तपशील</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-[10px] text-center font-bold leading-tight">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-12">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">बदली हजर झालेली शाळा</th>
                        <th className="border-r border-slate-900 px-4">कालावधी</th>
                        <th className="border-r border-slate-900 px-4">एकूण सेवा</th>
                        <th className="px-4">बदली आदेश क्र.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceHistory.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-[17.5px] min-h-[17.5px]">
                          <td className="border-r border-slate-900 px-1">{idx + 1}</td>
                          {["school", "duration", "totalService", "orderNo"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setServiceHistory)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-[10px] focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 11: FAMILY INFO */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">कौटुंबिक माहिती</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">कुटुंबातील व्यक्तीचे नाव</th>
                        <th className="border-r border-slate-900 px-4">नाते</th>
                        <th className="border-r border-slate-900 px-4">जन्मतारीख</th>
                        <th className="px-4">आधार क्र.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyDetails.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["memberName", "relationship", "dob", "aadhaar"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setFamilyDetails)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 12: FAVORITE BOOKS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">आवडलेली पुस्तके</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">पुस्तकाचे नाव</th>
                        <th className="border-r border-slate-900 px-4">लेखक</th>
                        <th className="px-4">आशय</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favBooks.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["bookName", "author", "message"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setFavBooks)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 13: PUBLISHED LITERATURE */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">प्रकाशित साहित्य/कवितासंग्रह</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">विषय</th>
                        <th className="border-r border-slate-900 px-4">तपशील</th>
                        <th className="px-4">वर्ष</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishedWorks.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["topic", "details", "year"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setPublishedWorks)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

            {/* PAGE 14: TRAINING DETAILS */}
            <div className="sanchika-page w-full max-w-[210mm] md:w-[210mm] min-h-auto md:min-h-[297mm] bg-white border border-slate-200 p-4 sm:p-[15mm] relative box-border flex flex-col justify-between print:border-none print:m-0 print:p-[10mm] print:break-before-page">
              <div className="absolute inset-2 sm:inset-[10mm] border-4 sm:border-[6px] border-double border-slate-900 pointer-events-none z-0" />
              
              <div className="z-10 w-full h-full flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-center text-slate-900 border-b border-slate-900 pb-2">प्रशिक्षण</h2>
                  
                  <div className="w-full overflow-x-auto"><table className="w-full border-collapse border border-slate-900 text-xs text-center font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 h-10 bg-slate-50">
                        <th className="border-r border-slate-900 px-2 w-16">अ.न.</th>
                        <th className="border-r border-slate-900 px-4">प्रशिक्षणाचे नाव</th>
                        <th className="border-r border-slate-900 px-4">ठिकाण</th>
                        <th className="border-r border-slate-900 px-4">स्तर</th>
                        <th className="border-r border-slate-900 px-4">कालावधी</th>
                        <th className="px-4">दिवस</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainings.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 last:border-0 h-12">
                          <td className="border-r border-slate-900 px-2">{idx + 1}</td>
                          {["name", "location", "level", "duration", "days"].map((col) => (
                            <td key={col} className="border-r last:border-r-0 border-slate-900 px-1">
                              <input
                                type="text"
                                value={row[col]}
                                onChange={(e) => handleTableChange(idx, col, e.target.value, setTrainings)}
                                className="w-full bg-transparent border-none outline-none text-center text-slate-800 font-bold font-sans px-1 text-xs focus:bg-slate-50 rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                <div className="w-full text-right pr-6 text-[8px] text-slate-400 font-mono italic">
                  rajugangurde-9552404950
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* PRINT STYLES */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          /* Hide all screen layouts */
          body * {
            visibility: hidden;
          }
          /* Show print container only */
          #sanchika-print-area, #sanchika-print-area * {
            visibility: visible;
          }
          #sanchika-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .sanchika-page {
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 15mm !important;
            border: none !important;
            box-shadow: none !important;
            position: relative !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          
          /* Enforce double border position and size on print */
          .sanchika-page .border-double {
            position: absolute !important;
            top: 10mm !important;
            right: 10mm !important;
            bottom: 10mm !important;
            left: 10mm !important;
            border-width: 6px !important;
            border-style: double !important;
            box-sizing: border-box !important;
          }

          /* Force tables to render properly without horizontal scroll or clipping */
          .overflow-x-auto {
            overflow: visible !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
          }
          
          /* Force standard colors during printing */
          h1.text-red-600 {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-red-600 {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-purple-700 {
            color: #7c3aed !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-slate-50 {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Hide input boundaries / outline inside printable page */
          input, textarea {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          
          /* Hide placeholder during print */
          input::placeholder, textarea::placeholder {
            color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
