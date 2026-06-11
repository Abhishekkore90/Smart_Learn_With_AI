import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Printer,
  FileText,
  Shield,
  UserCheck,
  X,
  Sparkles,
  Globe,
  Info,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Edit2,
  Save,
  Download,
  UserPlus,
} from "lucide-react";

export const Route = createFileRoute("/teacher/meeting")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    committeeId?: string;
    meetingId?: string;
    tab?: "form" | "history";
    edit?: boolean;
  } => ({
    committeeId: search.committeeId as string | undefined,
    meetingId: search.meetingId as string | undefined,
    tab: search.tab as "form" | "history" | undefined,
    edit: search.edit === "true" || search.edit === true || undefined,
  }),
  component: TeacherMeetingPage,
});

interface Committee {
  id: string;
  name: string;
  description: string;
  icon: any;
  defaultMembers: { name: string; post: string; role: string }[];
}

const COMMITTEES: Committee[] = [
  {
    id: "smc",
    name: "शाळा व्यवस्थापन समिती (SMC)",
    description:
      "शाळेच्या दैनंदिन कामकाजावर आणि विकासावर नियंत्रण ठेवणारी समिती.",
    icon: Shield,
    defaultMembers: [
      { name: "श्री. रमेश तांबे", post: "पालक प्रतिनिधी", role: "अध्यक्ष" },
      { name: "सौ. सुनीता पाटील", post: "पालक प्रतिनिधी", role: "उपाध्यक्ष" },
      { name: "श्री. संजय कदम", post: "मुख्याध्यापक", role: "सदस्य सचिव" },
      { name: "सौ. विद्या जोशी", post: "शिक्षक प्रतिनिधी", role: "सदस्य" },
      {
        name: "श्री. अनिल गायकवाड",
        post: "स्थानिक प्राधिकरण प्रतिनिधी",
        role: "सदस्य",
      },
      { name: "सौ. मीना शेलार", post: "पालक प्रतिनिधी", role: "सदस्य" },
    ],
  },
  {
    id: "safety",
    name: "विद्यार्थी सुरक्षा व भौतिक सुविधा विकास समिती",
    description:
      "विद्यार्थ्यांच्या सुरक्षिततेसाठी आणि शाळेतील पायाभूत सुविधांच्या विकासासाठी समिती.",
    icon: UserCheck,
    defaultMembers: [
      { name: "श्री. बाबासाहेब तुकाराम कोले", post: "सरपंच", role: "अध्यक्ष" },
      {
        name: "सौ. पुनम नंदकुमार जाधव",
        post: "स्था.प्रा. प्रतिनिधी",
        role: "सदस्य",
      },
      { name: "श्री. विशाल विष्णू खाडे", post: "शिक्षक", role: "सदस्य" },
      { name: "सौ. कविता हरिभाऊ जाधव", post: "आशा सेविका", role: "सदस्य" },
      {
        name: "श्री. नारायण बाळकृष्ण जाधव",
        post: "स्थानिक शिक्षणतज्ञ",
        role: "सदस्य",
      },
      {
        name: "सौ. आशाराणी प्रविण जाधव",
        post: "अंगणवाडी सेविका",
        role: "सदस्य",
      },
      { name: "श्री. राजाराम सुखदेव हातेकर", post: "ग्रामसेवक", role: "सदस्य" },
      { name: "सौ. चित्राताई नारायण जाधव", post: "पोलीस पाटील", role: "सदस्य" },
      {
        name: "श्री. पांडुरंग दिनकर जाधव",
        post: "माजी विद्यार्थी",
        role: "सदस्य",
      },
      {
        name: "श्री. युवराज धोंडीराम जाधव",
        post: "माजी विद्यार्थी",
        role: "सदस्य",
      },
      { name: "श्री. मंगलसिंग भगवान जाधव", post: "पालक", role: "सदस्य" },
      { name: "श्री. शंकर वसंत कोकरे", post: "पालक", role: "सदस्य" },
      { name: "श्री. अमोल नारायण केंगार", post: "केंद्रप्रमुख", role: "सदस्य" },
      {
        name: "श्री. बाबासाहेब रामकिशन केंद्रे",
        post: "मुख्याध्यापक",
        role: "सचिव",
      },
    ],
  },
  {
    id: "women",
    name: "महिला तक्रार निवारण समिती",
    description:
      "शाळेतील महिला शिक्षक व विद्यार्थिनींच्या तक्रारींचे निवारण करणारी समिती.",
    icon: Users,
    defaultMembers: [
      { name: "सौ. विद्या जोशी", post: "शिक्षिका", role: "अध्यक्ष" },
      { name: "सौ. मीना शेलार", post: "पालक प्रतिनिधी", role: "सदस्य" },
      { name: "सौ. पुनम जाधव", post: "पालक प्रतिनिधी", role: "सदस्य" },
      { name: "सौ. आशा जाधव", post: "अंगणवाडी सेविका", role: "सदस्य" },
      { name: "श्री. संजय कदम", post: "मुख्याध्यापक", role: "सचिव" },
    ],
  },
  {
    id: "sakhi",
    name: "सखी सावित्री समिती",
    description:
      "मुलींच्या गळतीचे प्रमाण रोखणे, उपस्थिती वाढवणे आणि सक्षमीकरणासाठी समिती.",
    icon: Sparkles,
    defaultMembers: [
      {
        name: "सौ. सुलोचना कदम",
        post: "सामाजिक कार्यकर्त्या",
        role: "अध्यक्ष",
      },
      { name: "सौ. संगीता कोळी", post: "पालक प्रतिनिधी", role: "सदस्य" },
      { name: "सौ. विद्या जोशी", post: "शिक्षिका", role: "सदस्य" },
      { name: "कु. अनुष्का माने", post: "विद्यार्थी प्रतिनिधी", role: "सदस्य" },
      { name: "श्री. संजय कदम", post: "मुख्याध्यापक", role: "सचिव" },
    ],
  },
  {
    id: "eco",
    name: "इको क्लब (Eco Club)",
    description:
      "शाळेत पर्यावरण पूरक उपक्रम राबवून विद्यार्थ्यांमध्ये पर्यावरण जाणीव जागृती करणे.",
    icon: Globe,
    defaultMembers: [
      { name: "श्री. विशाल खाडे", post: "शिक्षक", role: "अध्यक्ष" },
      { name: "श्री. सचिन गुरव", post: "पालक प्रतिनिधी", role: "सदस्य" },
      { name: "कु. वेदांत कदम", post: "विद्यार्थी प्रतिनिधी", role: "सदस्य" },
      { name: "कु. संस्कृती कदम", post: "विद्यार्थी प्रतिनिधी", role: "सदस्य" },
      { name: "श्री. संजय कदम", post: "मुख्याध्यापक", role: "सचिव" },
    ],
  },
  {
    id: "alumni",
    name: "माजी विद्यार्थी संघ",
    description:
      "शाळेच्या प्रगतीमध्ये आणि विकासामध्ये माजी विद्यार्थ्यांचे योगदान मिळवणे.",
    icon: ClipboardList,
    defaultMembers: [
      { name: "श्री. युवराज जाधव", post: "माजी विद्यार्थी", role: "अध्यक्ष" },
      { name: "श्री. पांडुरंग जाधव", post: "माजी विद्यार्थी", role: "सदस्य" },
      { name: "सौ. स्वाती थोरात", post: "माजी विद्यार्थिनी", role: "सदस्य" },
      { name: "श्री. विशाल खाडे", post: "शिक्षक प्रतिनिधी", role: "सदस्य" },
      { name: "श्री. संजय कदम", post: "मुख्याध्यापक", role: "सचिव" },
    ],
  },
];

function TeacherMeetingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const udise =
    profile?.udise ||
    (typeof window !== "undefined"
      ? localStorage.getItem("teacher_udise")
      : null) ||
    "default";

  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        // Allow
      } else if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/meeting", role: "teacher" } as any,
        });
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Sidebar committee selection (null by default to show card list first)
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  );

  // Tab control: 'form' or 'history'
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Form State
  const [schoolName, setSchoolName] = useState("");
  const [headmasterName, setHeadmasterName] = useState("");
  const [presidentName, setPresidentName] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingNumber, setMeetingNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [formMembers, setFormMembers] = useState<any[]>([]);
  const [formResolutions, setFormResolutions] = useState<any[]>([]);
  const [committeeName, setCommitteeName] = useState("");

  // Saved Meetings List State
  const [savedMeetings, setSavedMeetings] = useState<any[]>([]);
  const [selectedPastMeeting, setSelectedPastMeeting] = useState<any | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode States
  const isEditing = search.edit === true;
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editHeadmasterName, setEditHeadmasterName] = useState("");
  const [editPresidentName, setEditPresidentName] = useState("");
  const [editMeetingDate, setEditMeetingDate] = useState("");
  const [editMeetingTime, setEditMeetingTime] = useState("");
  const [editMeetingNumber, setEditMeetingNumber] = useState("");
  const [editAcademicYear, setEditAcademicYear] = useState("");
  const [editMembers, setEditMembers] = useState<any[]>([]);
  const [editResolutions, setEditResolutions] = useState<any[]>([]);
  const [editCommitteeName, setEditCommitteeName] = useState("");
  const [editIntroText, setEditIntroText] = useState("");

  // Sync search parameters to local states
  useEffect(() => {
    // 1. Sync selected committee
    if (search.committeeId) {
      if (selectedCommittee?.id !== search.committeeId) {
        const foundComm = COMMITTEES.find((c) => c.id === search.committeeId);
        if (foundComm) {
          setSelectedCommittee(foundComm);
        }
      }
    } else {
      if (selectedCommittee !== null) {
        setSelectedCommittee(null);
      }
    }

    // 2. Sync tab selection
    if (search.tab) {
      if (activeTab !== search.tab) {
        setActiveTab(search.tab);
      }
    } else {
      if (activeTab !== "form") {
        setActiveTab("form");
      }
    }

    // 3. Sync selected past meeting
    if (search.meetingId) {
      if (selectedPastMeeting?.id !== search.meetingId) {
        const foundMeeting = savedMeetings.find(
          (m) => m.id === search.meetingId,
        );
        if (foundMeeting) {
          setSelectedPastMeeting(foundMeeting);
        }
      }
    } else {
      if (selectedPastMeeting !== null) {
        setSelectedPastMeeting(null);
      }
    }
  }, [search.committeeId, search.meetingId, search.tab, savedMeetings]);

  // Prefill form with previous meeting details or default committee members when tab, committee, or meetings list length changes
  useEffect(() => {
    if (activeTab === "form" && selectedCommittee) {
      if (savedMeetings.length > 0) {
        const prevMeeting = savedMeetings[0];
        setSchoolName(prevMeeting.schoolName || "");
        setHeadmasterName(prevMeeting.headmasterName || "");
        setPresidentName(prevMeeting.presidentName || "");
        setAcademicYear(prevMeeting.academicYear || "");
        setFormMembers(
          prevMeeting.members
            ? JSON.parse(JSON.stringify(prevMeeting.members))
            : [],
        );
      } else {
        setSchoolName("");
        setHeadmasterName("");
        setPresidentName("");
        setAcademicYear("२०२५-२६");
        setFormMembers(
          selectedCommittee.defaultMembers
            ? JSON.parse(JSON.stringify(selectedCommittee.defaultMembers))
            : [],
        );
      }
      setMeetingDate("");
      setMeetingTime("");
      setMeetingNumber("");
      setFormResolutions([]);
      setCommitteeName(selectedCommittee.name);
    } else if (!selectedCommittee) {
      setFormMembers([]);
      setFormResolutions([]);
      setCommitteeName("");
    }
  }, [activeTab, selectedCommittee?.id, savedMeetings.length]);

  // Sync saved meetings from Firestore
  useEffect(() => {
    if (!selectedCommittee) return;
    const q = query(
      collection(db, "monthly_meetings"),
      where("udise", "==", udise),
      where("committeeId", "==", selectedCommittee.id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Sort meetings in memory by createdAt descending to avoid composite index requirement
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setSavedMeetings(data);
    });

    return () => unsubscribe();
  }, [selectedCommittee?.id, udise]);

  // Switch committee
  useEffect(() => {
    if (!selectedCommittee) return;
    setSelectedPastMeeting(null);
  }, [selectedCommittee]);

  // Sync edit states when entering edit mode or selecting a past meeting
  useEffect(() => {
    if (selectedPastMeeting && isEditing) {
      setEditSchoolName(selectedPastMeeting.schoolName || "");
      setEditHeadmasterName(selectedPastMeeting.headmasterName || "");
      setEditPresidentName(selectedPastMeeting.presidentName || "");
      setEditMeetingDate(selectedPastMeeting.date || "");
      setEditMeetingTime(selectedPastMeeting.time || "");
      setEditMeetingNumber(selectedPastMeeting.meetingNumber || "");
      setEditAcademicYear(selectedPastMeeting.academicYear || "२०२५-२६");
      setEditMembers(selectedPastMeeting.members || []);
      setEditResolutions(selectedPastMeeting.resolutions || []);
      setEditCommitteeName(selectedPastMeeting.committeeName || "");

      const formattedDate = selectedPastMeeting.date
        ? selectedPastMeeting.date.split("-").reverse().join(".")
        : "________";
      const defaultIntro =
        selectedPastMeeting.introText ||
        `आज दि. ${formattedDate} रोजी ${selectedPastMeeting.schoolName || "________"} येथे ${selectedPastMeeting.committeeName || "________"} चे अध्यक्ष ${selectedPastMeeting.presidentName || "________"} यांच्या अध्यक्षतेखाली सभा घेण्यात आली. सदर सभेस खालील प्रमाणे सदस्य उपस्थित होते.`;
      setEditIntroText(defaultIntro);
    }
  }, [selectedPastMeeting, isEditing]);

  // Members edit action handlers
  const handleAddMemberRow = () => {
    setEditMembers([
      ...editMembers,
      { name: "", post: "सदस्य", role: "सदस्य" },
    ]);
  };

  const handleUpdateMemberField = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...editMembers];
    updated[index] = { ...updated[index], [field]: value };
    setEditMembers(updated);
  };

  const handleRemoveMemberRow = (index: number) => {
    const updated = editMembers.filter((_, i) => i !== index);
    setEditMembers(updated);
  };

  // Resolutions edit action handlers
  const handleAddResolutionRow = () => {
    const nextSubjectNo = editResolutions.length + 1;
    const currentMaxNo =
      editResolutions.length > 0
        ? Math.max(...editResolutions.map((r) => Number(r.resolutionNo) || 0))
        : 34;
    const nextResolutionNo = currentMaxNo + 1;

    setEditResolutions([
      ...editResolutions,
      {
        subjectNo: nextSubjectNo,
        resolutionNo: nextResolutionNo,
        subject: "",
        discussion: "",
        resolution: "",
        remark: "",
        proposer: "",
        seconder: "",
        statusText: "ठराव सर्वानुमते मंजूर करण्यात आला.",
      },
    ]);
  };

  const handleUpdateResolutionField = (
    index: number,
    field: string,
    value: any,
  ) => {
    const updated = [...editResolutions];
    updated[index] = { ...updated[index], [field]: value };
    setEditResolutions(updated);
  };

  const handleRemoveResolutionRow = (index: number) => {
    const updated = editResolutions
      .filter((_, i) => i !== index)
      .map((res, i) => ({
        ...res,
        subjectNo: i + 1,
      }));
    setEditResolutions(updated);
  };

  // formMembers edit action handlers
  const handleAddFormMemberRow = () => {
    setFormMembers([
      ...formMembers,
      { name: "", post: "सदस्य", role: "सदस्य" },
    ]);
  };

  const handleUpdateFormMemberField = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...formMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormMembers(updated);
  };

  const handleRemoveFormMemberRow = (index: number) => {
    const updated = formMembers.filter((_: any, i: number) => i !== index);
    setFormMembers(updated);
  };

  // formResolutions edit action handlers
  const handleAddFormResolutionRow = () => {
    const nextSubjectNo = formResolutions.length + 1;
    const currentMaxNo =
      formResolutions.length > 0
        ? Math.max(
            ...formResolutions.map((r: any) => Number(r.resolutionNo) || 0),
          )
        : 34;
    const nextResolutionNo = currentMaxNo + 1;

    setFormResolutions([
      ...formResolutions,
      {
        subjectNo: nextSubjectNo,
        resolutionNo: nextResolutionNo,
        subject: "",
        discussion: "",
        resolution: "",
        remark: "",
        proposer: "",
        seconder: "",
        statusText: "ठराव सर्वानुमते मंजूर करण्यात आला.",
      },
    ]);
  };

  const handleUpdateFormResolutionField = (
    index: number,
    field: string,
    value: any,
  ) => {
    const updated = [...formResolutions];
    updated[index] = { ...updated[index], [field]: value };
    setFormResolutions(updated);
  };

  const handleRemoveFormResolutionRow = (index: number) => {
    const updated = formResolutions
      .filter((_, i) => i !== index)
      .map((res, i) => ({
        ...res,
        subjectNo: i + 1,
      }));
    setFormResolutions(updated);
  };

  // Submit/Save Form to Firestore
  const handleSaveMeeting = async () => {
    if (!selectedCommittee) return;
    if (!schoolName) {
      toast.error("कृपया शाळेचे नाव प्रविष्ट करा!");
      return;
    }
    if (!headmasterName) {
      toast.error("कृपया मुख्याध्यापकांचे नाव प्रविष्ट करा!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = meetingDate
        ? meetingDate.split("-").reverse().join(".")
        : "________";
      const defaultIntroText = `आज दि. ${formattedDate} रोजी ${schoolName || "________"} येथे ${committeeName || selectedCommittee.name || "________"} चे अध्यक्ष ${presidentName || formMembers.find((m: any) => m.role === "अध्यक्ष")?.name || "" || "________"} यांच्या अध्यक्षतेखाली सभा घेण्यात आली. सदर सभेस खालील प्रमाणे सदस्य उपस्थित होते.`;

      const meetingData = {
        committeeId: selectedCommittee.id,
        committeeName: committeeName || selectedCommittee.name,
        schoolName,
        headmasterName,
        presidentName:
          presidentName ||
          formMembers.find((m: any) => m.role === "अध्यक्ष")?.name ||
          "",
        date: meetingDate,
        time: meetingTime,
        meetingNumber,
        academicYear,
        createdAt: new Date().toISOString(),
        udise,
        members: formMembers,
        resolutions: formResolutions,
        introText: defaultIntroText,
      };

      const docRef = await addDoc(
        collection(db, "monthly_meetings"),
        meetingData,
      );

      toast.success("बैठक नोंद यशस्वीरित्या जतन केली गेली!");
      // Update local state directly to prevent split-second flash
      setSelectedPastMeeting({ id: docRef.id, ...meetingData });
      // Update URL query parameters
      navigate({
        search: (prev) => ({
          ...prev,
          tab: "history",
          meetingId: docRef.id,
          edit: undefined,
        }),
      });
    } catch (e: any) {
      console.error(e);
      toast.error("माहिती जतन करण्यात अडचण आली!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing meeting record in Firestore
  const handleUpdateMeetingRecord = async () => {
    if (!selectedPastMeeting) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "monthly_meetings", selectedPastMeeting.id);
      await updateDoc(docRef, {
        schoolName: editSchoolName,
        headmasterName: editHeadmasterName,
        presidentName: editPresidentName,
        date: editMeetingDate,
        time: editMeetingTime,
        meetingNumber: editMeetingNumber,
        academicYear: editAcademicYear,
        members: editMembers,
        resolutions: editResolutions,
        committeeName: editCommitteeName,
        introText: editIntroText,
      });

      // Update local state
      setSelectedPastMeeting({
        ...selectedPastMeeting,
        schoolName: editSchoolName,
        headmasterName: editHeadmasterName,
        presidentName: editPresidentName,
        date: editMeetingDate,
        time: editMeetingTime,
        meetingNumber: editMeetingNumber,
        academicYear: editAcademicYear,
        members: editMembers,
        resolutions: editResolutions,
        committeeName: editCommitteeName,
        introText: editIntroText,
      });

      toast.success("बदल यशस्वीरित्या जतन केले गेले!");
      navigate({ search: (prev) => ({ ...prev, edit: undefined }) });
    } catch (e: any) {
      console.error(e);
      toast.error("बदल जतन करण्यात अडचण आली!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete saved meeting record
  const handleDeleteMeeting = async (id: string) => {
    if (
      !window.confirm(
        "तुम्हाला खात्री आहे की तुम्ही हा बैठक अहवाल डिलीट करू इच्छिता?",
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "monthly_meetings", id));
      toast.success("बैठक अहवाल यशस्वीरित्या डिलीट केला गेला!");
      if (selectedPastMeeting?.id === id) {
        setSelectedPastMeeting(null);
        navigate({
          search: (prev) => ({
            ...prev,
            meetingId: undefined,
            tab: "history",
            edit: undefined,
          }),
        });
      }
    } catch (e: any) {
      console.error(e);
      toast.error("अहवाल डिलीट करण्यात अडचण आली!");
    }
  };

  // Print friendly view handler
  const handlePrint = () => {
    window.print();
  };

  if (authLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            माहिती लोड होत आहे...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFEFF]">
      <TeacherHeader />
      <TeacherSidebar />

      {/* Main Container */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto print:p-0 print:pl-0">
          {/* Header section (Hidden on print) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Users className="size-8 text-blue-600" />
                मासिक सभा <span className="text-blue-600">समित्या</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                शाळेतील विविध मासिक सभा आणि समित्यांचे इतिवृत्त, सदस्य आणि ठराव
                व्यवस्थापन करा.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <div className="size-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                स्वयंचलित संचयन (Auto-Sync)
              </span>
            </div>
          </div>

          {/* Core Content Layout Area */}
          <AnimatePresence mode="wait">
            {!selectedCommittee ? (
              // Option 1: Card Grid View (No Committee Selected)
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 print:hidden"
              >
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="size-5 text-indigo-600" /> समिती निवड
                    </h2>
                    <p className="text-xs font-bold text-slate-500">
                      माहिती भरण्यासाठी किंवा मागील अहवाल पाहण्यासाठी खालीलपैकी
                      कोणतीही एक समिती निवडा.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                    <span>एकूण ६ सक्रिय समित्या</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                  {COMMITTEES.map((comm) => {
                    const CommIcon = comm.icon;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.04, y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        key={comm.id}
                        onClick={() =>
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              committeeId: comm.id,
                              tab: "form",
                              edit: undefined,
                            }),
                          })
                        }
                        className="h-64 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white rounded-[2.5rem] p-8 shadow-md hover:shadow-[0_20px_45px_rgba(139,92,246,0.3)] text-left flex flex-col justify-between transition-all border border-[#7c3aed]/30 relative overflow-hidden group cursor-pointer"
                      >
                        {/* Watermark background icon */}
                        <div className="absolute right-[-10%] bottom-[-10%] opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                          <CommIcon className="size-48" strokeWidth={1} />
                        </div>

                        {/* Small Icon Badge */}
                        <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <CommIcon className="size-6 text-white" />
                        </div>

                        {/* Committee Name */}
                        <div className="space-y-2">
                          <h3 className="text-xl font-black leading-tight tracking-tight pr-4">
                            {comm.name}
                          </h3>
                          <p className="text-[11px] text-violet-100/70 font-semibold line-clamp-2 leading-relaxed">
                            {comm.description}
                          </p>
                        </div>

                        {/* Footer Arrow Action */}
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-violet-200 mt-2">
                          प्रवेश करा{" "}
                          <ArrowRight className="size-3 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // Option 2: Active Committee Form & History View (Full Width)
              <motion.div
                key="form-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none"
              >
                {/* Header/Tab Navigation (Hidden on print) */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            committeeId: undefined,
                            tab: undefined,
                            meetingId: undefined,
                            edit: undefined,
                          }),
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                    >
                      ← मागे जा
                    </button>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <selectedCommittee.icon className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-800 leading-tight">
                          {selectedCommittee.name}
                        </h2>
                        <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                          {selectedCommittee.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex bg-slate-200/60 p-1 rounded-xl shrink-0 self-start md:self-center">
                    <button
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            tab: "form",
                            meetingId: undefined,
                            edit: undefined,
                          }),
                        })
                      }
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "form" && !selectedPastMeeting
                          ? "bg-white text-slate-900 shadow-sm font-black"
                          : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      नवीन बैठक नोंदवा
                    </button>
                    <button
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            tab: "history",
                            edit: undefined,
                          }),
                        })
                      }
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "history" || selectedPastMeeting
                          ? "bg-white text-slate-900 shadow-sm font-black"
                          : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      मागील अहवाल ({savedMeetings.length})
                    </button>
                  </div>
                </div>

                {/* Tab Content - View 1: History & Details View */}
                {activeTab === "history" && (
                  <div className="p-6 md:p-10">
                    {selectedPastMeeting ? (
                      // Detail Report View / Print View
                      <div className="space-y-8 register-print-area">
                        {/* Action Bar (Hidden on print) */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6 print:hidden">
                          <button
                            onClick={() => {
                              if (isEditing) {
                                navigate({
                                  search: (prev) => ({
                                    ...prev,
                                    edit: undefined,
                                  }),
                                });
                              } else {
                                navigate({
                                  search: (prev) => ({
                                    ...prev,
                                    meetingId: undefined,
                                  }),
                                });
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                          >
                            <X className="size-4" /> मागे जा
                          </button>
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleUpdateMeetingRecord}
                                  disabled={isSubmitting}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs tracking-wider transition-colors shadow-md disabled:opacity-50"
                                >
                                  <Save className="size-4" /> बदल जतन करा
                                </button>
                                <button
                                  onClick={() => {
                                    navigate({
                                      search: (prev) => ({
                                        ...prev,
                                        edit: undefined,
                                      }),
                                    });
                                  }}
                                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                  रद्द करा
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    navigate({
                                      search: (prev) => ({
                                        ...prev,
                                        edit: true,
                                      }),
                                    });
                                  }}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs tracking-wider transition-colors shadow-md cursor-pointer"
                                >
                                  <Edit2 className="size-4" /> संपादन करा
                                </button>
                                <button
                                  onClick={handlePrint}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs tracking-wider transition-colors shadow-md cursor-pointer"
                                >
                                  <Printer className="size-4" /> प्रिंट / PDF
                                  डाउनलोड
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteMeeting(selectedPastMeeting.id)
                                  }
                                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs tracking-wider transition-colors shadow-md cursor-pointer"
                                >
                                  <Trash2 className="size-4" /> डिलीट करा
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Register notebook styling */}
                        <style>{`
                          @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
                          
                          .register-container {
                            background-color: #fdfcf7; /* Ledger Cream background */
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                            font-family: 'Kalam', cursive, 'Inter', sans-serif;
                            position: relative;
                            border-left: 2px solid #ef4444; /* double red margin */
                            padding: 3rem 2.5rem 3rem 4.5rem;
                            min-height: 1000px;
                            border-radius: 1.5rem;
                          }
                          
                          .register-container::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 3.5rem;
                            width: 3px;
                            border-left: 1px solid #ef4444;
                            border-right: 1px solid #ef4444;
                            height: 100%;
                            pointer-events: none;
                          }

                          /* Ledger notebook page grid background */
                          .register-page-bg {
                            background-image: linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px);
                            background-size: 100% 2.4rem;
                            line-height: 2.4rem;
                          }

                          .register-header-text {
                            font-size: 1.3rem;
                            color: #1e293b;
                            line-height: 2.4rem;
                            text-indent: 3rem;
                            text-align: justify;
                            margin-bottom: 2rem;
                            font-weight: 600;
                          }

                          .register-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 2rem;
                            font-size: 1.2rem;
                          }

                          .register-table th, .register-table td {
                            border: 1px solid #475569;
                            padding: 0.5rem 0.8rem;
                            text-align: left;
                          }

                          .register-table th {
                            background-color: rgba(71, 85, 105, 0.05);
                            font-weight: 700;
                            color: #0f172a;
                          }

                          .register-table td {
                            color: #334155;
                          }

                          .register-res-section {
                            margin-top: 3rem;
                            border-top: 1px dashed #94a3b8;
                            padding-top: 2rem;
                          }

                          .register-res-item {
                            margin-bottom: 3rem;
                            font-size: 1.25rem;
                            line-height: 2.6rem;
                            border-bottom: 1px dotted #cbd5e1;
                            padding-bottom: 1.5rem;
                          }

                          .register-res-title {
                            font-weight: 700;
                            color: #0f172a;
                            display: inline-block;
                            min-width: 6.5rem;
                          }

                          .register-signature-area {
                            margin-top: 6rem;
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 2rem;
                            text-align: center;
                            font-size: 1.15rem;
                            font-weight: 700;
                          }
                          
                          .ledger-input {
                            background: transparent;
                            border: none;
                            border-bottom: 1px dashed rgba(59, 130, 246, 0.4);
                            color: #1e3a8a; /* Blue handwriting ink */
                            font-family: 'Kalam', cursive, 'Inter', sans-serif;
                            font-size: inherit;
                            font-weight: 700;
                            outline: none;
                            padding: 0 4px;
                            transition: all 0.2s ease;
                          }
                          
                          .ledger-input:focus {
                            border-bottom: 2px solid #2563eb;
                            background-color: rgba(59, 130, 246, 0.03);
                          }
                          
                          .ledger-input::placeholder {
                            color: #94a3b8;
                            font-weight: 400;
                            font-style: italic;
                          }

                          @media print {
                            body {
                              background: white !important;
                              color: black !important;
                            }
                            .print\\:hidden, 
                            header, 
                            nav, 
                            aside, 
                            button, 
                            .action-bar-print {
                              display: none !important;
                            }
                            main {
                              padding-left: 0 !important;
                              padding-top: 0 !important;
                              min-height: auto !important;
                            }
                            .register-container {
                              box-shadow: none !important;
                              border: none !important;
                              padding: 1.5rem 1rem 1.5rem 3.5rem !important;
                              background-color: #fdfcf7 !important;
                              -webkit-print-color-adjust: exact;
                              print-color-adjust: exact;
                              width: 100% !important;
                              border-radius: 0 !important;
                            }
                            .register-container::before {
                              left: 2.5rem !important;
                            }
                          }
                        `}</style>

                        {/* Notebook Ledger Sheet */}
                        <div className="register-container register-page-bg">
                          {isEditing ? (
                            // --- EDITING MODE IN-PLACE LEDGER VIEW ---
                            <div className="space-y-8 select-text">
                              {/* Meeting Ledger Letterhead */}
                              <div className="text-center pb-4 pt-2">
                                <h1 className="text-3xl font-black text-slate-900 border-b-2 border-slate-800 pb-2 tracking-wide inline-block px-8">
                                  मासिक सभा इतिवृत्त नोंदवही (संपादन)
                                </h1>
                              </div>

                              {/* Meeting Metadata Header (Editable) */}
                              <div className="flex flex-wrap justify-between gap-6 border-b-2 border-slate-300 pb-6 mb-6 text-lg font-bold text-slate-700 font-sans tracking-tight">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-black text-xs uppercase tracking-wider">
                                    सभा क्रमांक:
                                  </span>
                                  <input
                                    type="text"
                                    value={editMeetingNumber}
                                    onChange={(e) =>
                                      setEditMeetingNumber(e.target.value)
                                    }
                                    className="ledger-input w-20 text-center font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-black text-xs uppercase tracking-wider">
                                    वेळ:
                                  </span>
                                  <input
                                    type="time"
                                    value={editMeetingTime}
                                    onChange={(e) =>
                                      setEditMeetingTime(e.target.value)
                                    }
                                    className="ledger-input w-32 font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-black text-xs uppercase tracking-wider">
                                    शैक्षणिक वर्ष:
                                  </span>
                                  <input
                                    type="text"
                                    value={editAcademicYear}
                                    onChange={(e) =>
                                      setEditAcademicYear(e.target.value)
                                    }
                                    className="ledger-input w-28 text-center font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-black text-xs uppercase tracking-wider">
                                    सचिव/मुख्याध्यापक:
                                  </span>
                                  <input
                                    type="text"
                                    value={editHeadmasterName}
                                    onChange={(e) =>
                                      setEditHeadmasterName(e.target.value)
                                    }
                                    className="ledger-input w-52 font-bold"
                                  />
                                </div>
                              </div>

                              {/* Introductory Paragraph (Editable) */}
                              <div className="register-header-text leading-[3rem] w-full">
                                <textarea
                                  value={editIntroText}
                                  onChange={(e) =>
                                    setEditIntroText(e.target.value)
                                  }
                                  className="ledger-input w-full resize-y min-h-[120px] leading-[3rem] text-justify"
                                  rows={3}
                                />
                              </div>

                              {/* Committee Members Table (Editable) */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    समिती सदस्य यादी
                                  </h3>
                                  <button
                                    type="button"
                                    onClick={handleAddMemberRow}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer"
                                  >
                                    <UserPlus className="size-4" /> सदस्य जोडा
                                  </button>
                                </div>

                                <table className="register-table">
                                  <thead>
                                    <tr className="bg-slate-100/50">
                                      <th className="w-16 text-center">
                                        अ.क्र.
                                      </th>
                                      <th>सदस्याचे नाव</th>
                                      <th>पदनाम</th>
                                      <th>पद</th>
                                      <th className="w-24 text-center font-sans text-xs">
                                        कृती
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {editMembers.map(
                                      (member: any, index: number) => (
                                        <tr
                                          key={index}
                                          className="hover:bg-slate-50/30"
                                        >
                                          <td className="text-center">
                                            {index + 1}
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={member.name}
                                              onChange={(e) =>
                                                handleUpdateMemberField(
                                                  index,
                                                  "name",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="सदस्याचे नाव..."
                                              className="ledger-input w-full"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={member.post}
                                              onChange={(e) =>
                                                handleUpdateMemberField(
                                                  index,
                                                  "post",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="उदा. पालक, शिक्षक..."
                                              className="ledger-input w-full"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              value={member.role}
                                              onChange={(e) =>
                                                handleUpdateMemberField(
                                                  index,
                                                  "role",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="उदा. सदस्य, अध्यक्ष..."
                                              className="ledger-input w-full"
                                            />
                                          </td>
                                          <td className="text-center">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveMemberRow(index)
                                              }
                                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors font-sans cursor-pointer"
                                              title="काढून टाका"
                                            >
                                              <Trash2 className="size-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Resolutions Section (Editable) */}
                              <div className="register-res-section space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    विषय आणि ठराव तपशील
                                  </h3>
                                  <button
                                    type="button"
                                    onClick={handleAddResolutionRow}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer"
                                  >
                                    <Plus className="size-4" /> विषय व ठराव जोडा
                                  </button>
                                </div>

                                {editResolutions.map(
                                  (res: any, index: number) => (
                                    <div
                                      key={index}
                                      className="register-res-item relative group/res"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveResolutionRow(index)
                                        }
                                        className="absolute top-0 right-0 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover/res:opacity-100 transition-opacity font-sans text-xs flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 className="size-3.5" /> काढून
                                        टाका
                                      </button>

                                      <div className="flex gap-4 items-start">
                                        <span className="register-res-title shrink-0">
                                          विषय -
                                          <input
                                            type="number"
                                            value={res.subjectNo}
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "subjectNo",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="ledger-input w-12 text-center mx-1"
                                          />{" "}
                                          :
                                        </span>
                                        <textarea
                                          value={res.subject}
                                          onChange={(e) =>
                                            handleUpdateResolutionField(
                                              index,
                                              "subject",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="विषयाचा तपशील प्रविष्ट करा..."
                                          className="ledger-input w-full resize-none h-12 leading-relaxed"
                                          rows={1}
                                        />
                                      </div>

                                      {/* Discussion Details Field */}
                                      <div className="flex gap-4 items-start mt-2">
                                        <span className="register-res-title shrink-0">
                                          चर्चा :
                                        </span>
                                        <textarea
                                          value={res.discussion || ""}
                                          onChange={(e) =>
                                            handleUpdateResolutionField(
                                              index,
                                              "discussion",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="सभेत झालेल्या चर्चेचा तपशील प्रविष्ट करा..."
                                          className="ledger-input w-full resize-none h-16 leading-relaxed"
                                          rows={2}
                                        />
                                      </div>

                                      <div className="flex gap-4 items-start mt-2">
                                        <span className="register-res-title shrink-0">
                                          ठराव -
                                          <input
                                            type="number"
                                            value={res.resolutionNo}
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "resolutionNo",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="ledger-input w-12 text-center mx-1"
                                          />{" "}
                                          :
                                        </span>
                                        <textarea
                                          value={res.resolution}
                                          onChange={(e) =>
                                            handleUpdateResolutionField(
                                              index,
                                              "resolution",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="ठरावाचा सविस्तर तपशील प्रविष्ट करा..."
                                          className="ledger-input w-full resize-y h-24 leading-relaxed"
                                        />
                                      </div>

                                      <div className="pl-[6.5rem] mt-3 space-y-2 font-bold text-slate-700">
                                        <div className="flex items-center gap-2">
                                          <span>• सूचक :</span>
                                          <select
                                            value={res.proposer}
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "proposer",
                                                e.target.value,
                                              )
                                            }
                                            className="ledger-input bg-transparent py-0.5 max-w-xs"
                                          >
                                            <option
                                              value=""
                                              className="text-slate-800 bg-white"
                                            >
                                              -- सूचक निवडा --
                                            </option>
                                            {editMembers.map(
                                              (m, mIdx) =>
                                                m.name && (
                                                  <option
                                                    key={mIdx}
                                                    value={m.name}
                                                    className="text-slate-800 bg-white"
                                                  >
                                                    {m.name} ({m.post})
                                                  </option>
                                                ),
                                            )}
                                          </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span>• अनुमोदक :</span>
                                          <select
                                            value={res.seconder}
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "seconder",
                                                e.target.value,
                                              )
                                            }
                                            className="ledger-input bg-transparent py-0.5 max-w-xs"
                                          >
                                            <option
                                              value=""
                                              className="text-slate-800 bg-white"
                                            >
                                              -- अनुमोदक निवडा --
                                            </option>
                                            {editMembers.map(
                                              (m, mIdx) =>
                                                m.name && (
                                                  <option
                                                    key={mIdx}
                                                    value={m.name}
                                                    className="text-slate-800 bg-white"
                                                  >
                                                    {m.name} ({m.post})
                                                  </option>
                                                ),
                                            )}
                                          </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span>• शेरा :</span>
                                          <input
                                            type="text"
                                            value={res.remark || ""}
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "remark",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="शेरा..."
                                            className="ledger-input w-72"
                                          />
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                          <span>• निर्णय/ठराव स्थिती :</span>
                                          <input
                                            type="text"
                                            value={
                                              res.statusText ||
                                              "ठराव सर्वानुमते मंजूर करण्यात आला."
                                            }
                                            onChange={(e) =>
                                              handleUpdateResolutionField(
                                                index,
                                                "statusText",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="उदा. ठराव सर्वानुमते मंजूर करण्यात आला."
                                            className="ledger-input w-96 font-bold"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : (
                            // --- READ / PRINT REGISTER NOTEBOOK VIEW ---
                            <div className="space-y-8 select-text">
                              {/* Meeting Ledger Letterhead */}
                              <div className="text-center pb-4 pt-2">
                                <h1 className="text-3xl font-black text-slate-900 border-b-2 border-slate-800 pb-2 tracking-wide inline-block px-8">
                                  मासिक सभा इतिवृत्त नोंदवही
                                </h1>
                              </div>

                              {/* Introductory Paragraph styled like handwritten ledger */}
                              <p className="register-header-text">
                                {selectedPastMeeting.introText ||
                                  `आज दि. ${selectedPastMeeting.date ? selectedPastMeeting.date.split("-").reverse().join(".") : "________"} रोजी ${selectedPastMeeting.schoolName || "________"} येथे ${selectedPastMeeting.committeeName || "________"} चे अध्यक्ष ${selectedPastMeeting.presidentName || "________"} यांच्या अध्यक्षतेखाली सभा घेण्यात आली. सदर सभेस खालील प्रमाणे सदस्य उपस्थित होते.`}
                              </p>

                              {/* Committee Members Present table with blank signature column */}
                              {selectedPastMeeting.members &&
                                selectedPastMeeting.members.length > 0 && (
                                  <div className="space-y-4">
                                    <table className="register-table">
                                      <thead>
                                        <tr className="bg-slate-100">
                                          <th className="w-16 text-center">
                                            अ.क्र.
                                          </th>
                                          <th>सदस्याचे नाव</th>
                                          <th>पदनाम</th>
                                          <th>पद</th>
                                          <th className="w-36 text-center">
                                            स्वाक्षरी
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedPastMeeting.members.map(
                                          (member: any, index: number) => (
                                            <tr
                                              key={index}
                                              className="hover:bg-slate-50/30"
                                            >
                                              <td className="text-center">
                                                {index + 1}
                                              </td>
                                              <td className="font-bold text-slate-900">
                                                {member.name}
                                              </td>
                                              <td>{member.post}</td>
                                              <td>{member.role || "सदस्य"}</td>
                                              <td className="text-center">
                                                {/* Left blank for physical signing as requested */}
                                                <div className="h-6 w-full" />
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                              {/* Resolutions Section */}
                              {selectedPastMeeting.resolutions &&
                                selectedPastMeeting.resolutions.length > 0 && (
                                  <div className="register-res-section space-y-6">
                                    {selectedPastMeeting.resolutions.map(
                                      (res: any, index: number) => (
                                        <div
                                          key={index}
                                          className="register-res-item"
                                        >
                                          <div className="flex gap-4 items-start">
                                            <span className="register-res-title shrink-0">
                                              विषय - {res.subjectNo} :
                                            </span>
                                            <span className="font-bold text-slate-800 underline decoration-dotted decoration-slate-400">
                                              {res.subject}
                                            </span>
                                          </div>
                                          <div className="flex gap-4 items-start mt-2">
                                            <span className="register-res-title shrink-0">
                                              ठराव - {res.resolutionNo} :
                                            </span>
                                            <span className="text-slate-700 text-justify">
                                              {res.resolution}
                                            </span>
                                          </div>
                                          <div className="pl-[6.5rem] mt-3 space-y-1 font-bold text-slate-700">
                                            <p>
                                              • सूचक :{" "}
                                              <span className="text-slate-900">
                                                {res.proposer || "________"}
                                              </span>
                                            </p>
                                            <p>
                                              • अनुमोदक :{" "}
                                              <span className="text-slate-900">
                                                {res.seconder || "________"}
                                              </span>
                                            </p>
                                            <p className="text-slate-800 italic font-bold">
                                              •{" "}
                                              {res.statusText ||
                                                "ठराव सर्वानुमते मंजूर करण्यात आला."}
                                            </p>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}

                              {/* Bottom Signatures Block */}
                              <div className="register-signature-area pt-16">
                                <div className="space-y-12">
                                  <p>समिती अध्यक्ष स्वाक्षरी</p>
                                  <div className="w-32 border-b border-slate-600 mx-auto" />
                                </div>
                                <div className="space-y-12">
                                  <p>शिक्षण विस्तार अधिकारी</p>
                                  <div className="w-32 border-b border-slate-600 mx-auto" />
                                </div>
                                <div className="space-y-12">
                                  <p>सचिव / मुख्याध्यापक स्वाक्षरी</p>
                                  <div className="w-32 border-b border-slate-600 mx-auto" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // List of past meetings
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            नोंदवलेले बैठक अहवाल ({savedMeetings.length})
                          </h3>
                        </div>

                        {savedMeetings.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedMeetings.map((mt) => (
                              <div
                                key={mt.id}
                                className="bg-white border border-slate-200 hover:border-blue-500/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 group relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -z-10 group-hover:bg-blue-50 transition-colors" />
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                      सभा दिनांक: {mt.date}
                                    </span>
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                      <Clock size={10} /> {mt.time} वा.
                                    </span>
                                  </div>
                                  <h4 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                    {mt.committeeName}
                                  </h4>
                                  <div className="space-y-1 text-xs text-slate-500 font-bold">
                                    <p>शाळा: {mt.schoolName}</p>
                                    <p>मुख्याध्यापक: {mt.headmasterName}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                                  <button
                                    onClick={() =>
                                      navigate({
                                        search: (prev) => ({
                                          ...prev,
                                          meetingId: mt.id,
                                          tab: "history",
                                          edit: undefined,
                                        }),
                                      })
                                    }
                                    className="text-[11px] font-black text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                                  >
                                    पूर्ण अहवाल पहा <Printer size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMeeting(mt.id);
                                    }}
                                    className="text-[11px] font-black text-red-600 hover:text-red-700 hover:underline uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                                  >
                                    डिलीट करा <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                            <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                              <FileText size={40} />
                            </div>
                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs">
                              कोणतेही अहवाल आढळले नाहीत
                            </h3>
                            <p className="text-slate-300 text-[10px] font-bold mt-2 italic">
                              या समितीची पहिली बैठक नोंदवण्यासाठी वरील 'नवीन
                              बैठक नोंदवा' बटणावर क्लिक करा.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content - View 2: Form to Fill New Meeting */}
                {activeTab === "form" && (
                  <div className="p-8 md:p-12 space-y-12">
                    {/* Basic Details Form Section */}
                    <div className="space-y-8">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-3">
                        १. बैठकीची प्राथमिक माहिती
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            शाळेचे नाव
                          </label>
                          <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder="शाळेचे नाव प्रविष्ट करा..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 shadow-md"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            मुख्याध्यापकांचे नाव
                          </label>
                          <input
                            type="text"
                            value={headmasterName}
                            onChange={(e) => setHeadmasterName(e.target.value)}
                            placeholder="मुख्याध्यापकांचे नाव..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 shadow-md"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            समिती अध्यक्षांचे नाव
                          </label>
                          <input
                            type="text"
                            value={presidentName}
                            onChange={(e) => setPresidentName(e.target.value)}
                            placeholder="समिती अध्यक्षांचे नाव प्रविष्ट करा..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 shadow-md"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            समितीचे नाव (Committee Name)
                          </label>
                          <input
                            type="text"
                            value={committeeName}
                            onChange={(e) => setCommitteeName(e.target.value)}
                            placeholder="उदा. शाळा व्यवस्थापन समिती..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 shadow-md"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            दिनांक
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 size-6" />
                            <input
                              type="date"
                              value={meetingDate}
                              onChange={(e) => setMeetingDate(e.target.value)}
                              className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 cursor-pointer shadow-md"
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            वेळ (Time)
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 size-6" />
                            <input
                              type="time"
                              value={meetingTime}
                              onChange={(e) => setMeetingTime(e.target.value)}
                              className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-950 cursor-pointer shadow-md"
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            सभा क्रमांक (Meeting Number)
                          </label>
                          <input
                            type="text"
                            value={meetingNumber}
                            onChange={(e) => setMeetingNumber(e.target.value)}
                            placeholder="उदा. १, २, ३..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-955 shadow-md"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-lg font-black text-slate-800 block">
                            शैक्षणिक वर्ष (Academic Year)
                          </label>
                          <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="उदा. २०२५-२६..."
                            className="w-full px-6 py-4.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-extrabold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all text-slate-955 shadow-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Committee Members List Section */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                          २. समिती सदस्यांची नावे
                        </h3>
                        <button
                          type="button"
                          onClick={handleAddFormMemberRow}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md"
                        >
                          <UserPlus className="size-4" /> सदस्य जोडा
                        </button>
                      </div>

                      <div className="overflow-x-auto border-2 border-slate-300 rounded-2xl bg-white shadow-sm">
                        <table className="w-full text-left border-collapse text-base">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-extrabold border-b-2 border-slate-300">
                              <th className="px-6 py-4 text-center w-20">
                                अ.क्र.
                              </th>
                              <th className="px-6 py-4">सदस्याचे नाव</th>
                              <th className="px-6 py-4">पदनाम (Designation)</th>
                              <th className="px-6 py-4">पद (Post)</th>
                              <th className="px-6 py-4 text-center w-24">
                                कृती
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-extrabold text-slate-950">
                            {formMembers.map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-center text-slate-500 font-extrabold text-lg">
                                  {idx + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <input
                                    type="text"
                                    value={m.name}
                                    onChange={(e) =>
                                      handleUpdateFormMemberField(
                                        idx,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="सदस्याचे नाव प्रविष्ट करा..."
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input
                                    type="text"
                                    value={m.post}
                                    onChange={(e) =>
                                      handleUpdateFormMemberField(
                                        idx,
                                        "post",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="उदा. सरपंच, शिक्षक, पालक..."
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <input
                                    type="text"
                                    value={m.role}
                                    onChange={(e) =>
                                      handleUpdateFormMemberField(
                                        idx,
                                        "role",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="उदा. अध्यक्ष, सदस्य, सचिव..."
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg"
                                  />
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveFormMemberRow(idx)
                                    }
                                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-transparent hover:border-red-200"
                                  >
                                    <Trash2 className="size-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dynamic Subjects and Resolutions Section */}
                    <div className="space-y-6 pt-8 border-t border-slate-100 font-sans">
                      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                          ३. विषय आणि ठराव तपशील
                        </h3>
                        <button
                          type="button"
                          onClick={handleAddFormResolutionRow}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md"
                        >
                          <Plus className="size-4" /> विषय व ठराव जोडा
                        </button>
                      </div>

                      <div className="space-y-6">
                        {formResolutions.map((res: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white border-2 border-slate-300 p-8 rounded-2xl relative space-y-6 shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFormResolutionRow(index)
                              }
                              className="absolute top-6 right-6 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-transparent hover:border-red-200"
                              title="Delete this block"
                            >
                              <Trash2 className="size-5" />
                            </button>

                            <div className="grid grid-cols-2 gap-6 w-5/6">
                              <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                                  विषय क्रमांक
                                </label>
                                <input
                                  type="number"
                                  value={res.subjectNo}
                                  onChange={(e) =>
                                    handleUpdateFormResolutionField(
                                      index,
                                      "subjectNo",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-24 px-4 py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-lg text-slate-900 bg-white"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                                  ठराव क्रमांक
                                </label>
                                <input
                                  type="number"
                                  value={res.resolutionNo}
                                  onChange={(e) =>
                                    handleUpdateFormResolutionField(
                                      index,
                                      "resolutionNo",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-24 px-4 py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-lg text-slate-900 bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-base font-black text-slate-800 tracking-wider block">
                                विषय (Subject Title)
                              </label>
                              <input
                                type="text"
                                value={res.subject}
                                onChange={(e) =>
                                  handleUpdateFormResolutionField(
                                    index,
                                    "subject",
                                    e.target.value,
                                  )
                                }
                                placeholder="उदा. मागील सभेचे इतिवृत्त वाचून मंजूर करणेबाबत."
                                className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg placeholder-slate-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-base font-black text-slate-800 tracking-wider block">
                                चर्चा तपशील (Discussion Details)
                              </label>
                              <textarea
                                value={res.discussion || ""}
                                onChange={(e) =>
                                  handleUpdateFormResolutionField(
                                    index,
                                    "discussion",
                                    e.target.value,
                                  )
                                }
                                placeholder="सभेत झालेल्या चर्चेचा सविस्तर तपशील लिहा..."
                                className="w-full h-32 px-5 py-4 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg placeholder-slate-400 resize-y leading-relaxed"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-base font-black text-slate-800 tracking-wider block">
                                ठराव तपशील (Resolution Details)
                              </label>
                              <textarea
                                value={res.resolution || ""}
                                onChange={(e) =>
                                  handleUpdateFormResolutionField(
                                    index,
                                    "resolution",
                                    e.target.value,
                                  )
                                }
                                placeholder="ठरावाचा सविस्तर तपशील लिहा..."
                                className="w-full h-40 px-5 py-4 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-950 bg-white text-lg placeholder-slate-400 resize-y leading-relaxed"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-base font-black text-slate-800 tracking-wider block">
                                शेरा / रिमार्क (Remark)
                              </label>
                              <input
                                type="text"
                                value={res.remark || ""}
                                onChange={(e) =>
                                  handleUpdateFormResolutionField(
                                    index,
                                    "remark",
                                    e.target.value,
                                  )
                                }
                                placeholder="शेरा किंवा रिमार्क लिहा..."
                                className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-955 bg-white text-lg placeholder-slate-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-base font-black text-slate-800 tracking-wider block">
                                ठराव निर्णय / स्थिती (Resolution Status)
                              </label>
                              <input
                                type="text"
                                value={res.statusText || ""}
                                onChange={(e) =>
                                  handleUpdateFormResolutionField(
                                    index,
                                    "statusText",
                                    e.target.value,
                                  )
                                }
                                placeholder="उदा. ठराव सर्वानुमते मंजूर करण्यात आला."
                                className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-extrabold text-slate-955 bg-white text-lg placeholder-slate-400"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div className="space-y-2">
                                <label className="text-base font-black text-slate-800 tracking-wider block">
                                  सूचक (Proposer)
                                </label>
                                <select
                                  value={res.proposer}
                                  onChange={(e) =>
                                    handleUpdateFormResolutionField(
                                      index,
                                      "proposer",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 bg-white font-extrabold text-slate-950 text-lg cursor-pointer shadow-sm"
                                >
                                  <option value="">-- सूचक निवडा --</option>
                                  {formMembers.map(
                                    (m: any, mIdx: number) =>
                                      m.name && (
                                        <option key={mIdx} value={m.name}>
                                          {m.name} ({m.post})
                                        </option>
                                      ),
                                  )}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-base font-black text-slate-800 tracking-wider block">
                                  अनुमोदक (Seconder)
                                </label>
                                <select
                                  value={res.seconder}
                                  onChange={(e) =>
                                    handleUpdateFormResolutionField(
                                      index,
                                      "seconder",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-5 py-3.5 border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 bg-white font-extrabold text-slate-950 text-lg cursor-pointer shadow-sm"
                                >
                                  <option value="">-- अनुमोदक निवडा --</option>
                                  {formMembers.map(
                                    (m: any, mIdx: number) =>
                                      m.name && (
                                        <option key={mIdx} value={m.name}>
                                          {m.name} ({m.post})
                                        </option>
                                      ),
                                  )}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Submission Button */}
                    <div className="border-t border-slate-100 pt-8 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleSaveMeeting}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-16 py-5 shadow-xl hover:shadow-2xl hover:opacity-95 disabled:opacity-50 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            जतन होत आहे...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} /> बैठक नोंद जतन करा
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
