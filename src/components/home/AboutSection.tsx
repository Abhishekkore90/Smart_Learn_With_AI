import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Target,
  Zap,
  Globe,
  Building,
  FileText,
  MapPin,
  CheckCircle2,
  Cpu,
  Database,
  LineChart,
  BookOpen,
  Maximize2,
  X,
  Award,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

import sgkLogo from "@/assets/logo.jpeg";
import certificateImg from "@/assets/certificate_of_incorporation.png";
import addressSnippetImg from "@/assets/address_snippet.png";

type TranslationType = {
  badge: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_desc1: string;
  about_desc2: string;
  about_desc3: string;
  vision_title: string;
  vision_desc: string;
  mission_title: string;
  mission_items: string[];
  offer_title: string;
  offer_items: { title: string; desc: string }[];
  company_info_title: string;
  company_name: string;
  cin: string;
  reg_address: string;
  pan: string;
  tan: string;
  inc_cert: string;
  view_cert: string;
  address_snippet: string;
  commitment_title: string;
  commitment_desc: string;
};

const LOCAL_TRANSLATIONS: Record<"en" | "mr" | "hi", TranslationType> = {
  en: {
    badge: "SGK BRAINOVA PRIVATE LIMITED",
    hero_title: "Shaping the Future of Learning with AI",
    hero_subtitle: "Bridging the gap between traditional learning and future-ready education through intelligent digital solutions and smart academic platforms.",
    about_title: "About Us",
    about_desc1: "SGK Brainova Private Limited is an innovative educational technology company dedicated to transforming learning through Artificial Intelligence (AI), digital solutions, and smart educational tools. Our mission is to empower students, teachers, schools, and educational institutions with modern technology that makes learning more engaging, accessible, and effective.",
    about_desc2: "Founded with a vision to bridge the gap between traditional education and future-ready learning, SGK Brainova focuses on developing intelligent educational platforms, digital learning resources, academic management systems, and AI-powered solutions that enhance the overall learning experience.",
    about_desc3: "We believe that every learner deserves access to quality education supported by technology. Through our innovative products and services, we aim to create a smarter, more connected, and knowledge-driven educational ecosystem.",
    vision_title: "Our Vision",
    vision_desc: "To become a leading educational technology company that revolutionizes learning through innovation, creativity, and Artificial Intelligence.",
    mission_title: "Our Mission",
    mission_items: [
      "Deliver smart and effective learning solutions.",
      "Empower students with technology-driven education.",
      "Support schools and institutions with modern digital tools.",
      "Promote innovation, creativity, and lifelong learning.",
      "Build a future where education is accessible, engaging, and intelligent."
    ],
    offer_title: "What We Offer",
    offer_items: [
      {
        title: "AI-Powered Learning Solutions",
        desc: "Personalized tutoring, smart content recommendations, and virtual assistants."
      },
      {
        title: "School & College Management Systems",
        desc: "End-to-end digitization of academic records, operations, and communication."
      },
      {
        title: "Digital Education Platforms",
        desc: "Immersive learning environments for interactive classroom teaching."
      },
      {
        title: "Student Progress & Performance Analytics",
        desc: "Data-driven insights and diagnostic reporting for students and parents."
      },
      {
        title: "Smart Academic Tools",
        desc: "Tools designed to help educators create, assign, and grade effortlessly."
      },
      {
        title: "Educational Content & Resources",
        desc: "Rich repository of multi-lingual, syllabus-aligned digital resources."
      },
      {
        title: "Innovation-Driven Learning Experiences",
        desc: "Fostering critical thinking, creativity, and future skills."
      }
    ],
    company_info_title: "Corporate Information",
    company_name: "Company Name",
    cin: "Corporate Identification Number (CIN)",
    reg_address: "Registered Address",
    pan: "Permanent Account Number (PAN)",
    tan: "Tax Deduction Account Number (TAN)",
    inc_cert: "Certificate of Incorporation",
    view_cert: "Click to View Certificate",
    address_snippet: "Address Verification Snippet",
    commitment_title: "Our Commitment",
    commitment_desc: "At SGK Brainova, we are committed to creating meaningful educational experiences that inspire curiosity, encourage innovation, and prepare learners for the challenges of tomorrow. By combining technology, intelligence, and education, we strive to make learning smarter, simpler, and more impactful."
  },
  mr: {
    badge: "एसजीके ब्रेनोव्हा प्रायव्हेट लिमिटेड",
    hero_title: "एआय (AI) च्या मदतीने शिक्षणाचे भविष्य घडवत आहोत",
    hero_subtitle: "स्मार्ट डिजिटल सोल्यूशन्स आणि प्रगत शैक्षणिक प्लॅटफॉर्मच्या माध्यमातून पारंपारिक शिक्षण आणि भविष्यातील शिक्षण यामधील अंतर कमी करत आहोत.",
    about_title: "आमच्याबद्दल",
    about_desc1: "एसजीके ब्रेनोव्हा प्रायव्हेट लिमिटेड ही एक नाविन्यपूर्ण शैक्षणिक तंत्रज्ञान कंपनी आहे जी कृत्रिम बुद्धिमत्ता (AI), डिजिटल सोल्यूशन्स आणि स्मार्ट शैक्षणिक साधनांद्वारे शिक्षणात बदल घडवून आणण्यासाठी समर्पित आहे. आमचे ध्येय विद्यार्थी, शिक्षक, शाळा आणि शैक्षणिक संस्थांना आधुनिक तंत्रज्ञानासह सक्षम करणे आहे ज्यामुळे शिक्षण अधिक आकर्षक, सुलभ आणि प्रभावी होईल.",
    about_desc2: "पारंपारिक शिक्षण आणि भविष्यातील शिक्षण यामधील दरी सांधण्याच्या दृष्टीकोनातून स्थापित, एसजीके ब्रेनोव्हा हे बुद्धिमान शैक्षणिक प्लॅटफॉर्म, डिजिटल शिक्षण संसाधने, शैक्षणिक व्यवस्थापन प्रणाली आणि एआय-संचालित सोल्यूशन्स विकसित करण्यावर लक्ष केंद्रित करते जे संपूर्ण शिक्षण अनुभव सुधारतात.",
    about_desc3: "आमचा असा विश्वास आहे कि प्रत्येक विद्यार्थ्याला तंत्रज्ञानाचा पाठबळ असलेल्या दर्जेदार शिक्षणाचा अधिकार आहे. आमच्या नाविन्यपूर्ण उत्पादनांद्वारे आणि सेवांद्वारे, आम्ही एक स्मार्ट, अधिक कनेक्टेड आणि ज्ञानावर आधारित शैक्षणिक इकोसिस्टम तयार करण्याचे ध्येय ठेवतो.",
    vision_title: "आमची दृष्टी (Our Vision)",
    vision_desc: "नाविन्यता, सर्जनशीलता आणि कृत्रिम बुद्धिमत्तेद्वारे (AI) शिक्षणात क्रांती घडवणारी एक अग्रगाय शैक्षणिक तंत्रज्ञान कंपनी बनणे.",
    mission_title: "आमचे ध्येय (Our Mission)",
    mission_items: [
      "स्मार्ट आणि प्रभावी शिक्षण उपाय प्रदान करणे.",
      "तंत्रज्ञान-चालित शिक्षणासह विद्यार्थ्यांना सक्षम करणे.",
      "शाळा आणि संस्थांना आधुनिक डिजिटल साधनांसह सहाय्य करणे.",
      "नाविन्यता, सर्जनशीलता आणि आयुष्यभर शिकण्यास प्रोत्साहन देणे.",
      "असे भविष्य निर्माण करणे जिथे शिक्षण सुलभ, आकर्षक आणि बुद्धिमान असेल."
    ],
    offer_title: "आम्ही काय ऑफर करतो",
    offer_items: [
      {
        title: "एआय-संचालित शिक्षण उपाय",
        desc: "वैयक्तिकृत ट्युटोरिंग, स्मार्ट सामग्री शिफारसी आणि व्हर्च्युअल मार्गदर्शक."
      },
      {
        title: "शाळा आणि कॉलेज व्यवस्थापन प्रणाली",
        desc: "शैक्षणिक नोंदी, कामकाज आणि संपर्काचे संपूर्ण संगणकीकरण."
      },
      {
        title: "डिजिटल शिक्षण प्लॅटफॉर्म",
        desc: "परस्परसंवादी वर्ग अध्यापनासाठी इमर्सिव्ह शिक्षण वातावरण."
      },
      {
        title: "विद्यार्थी प्रगती आणि कामगिरी विश्लेषण",
        desc: "विद्यार्थी आणि पालकांसाठी डेटा-चालित विश्लेषण आणि प्रगती अहवाल."
      },
      {
        title: "स्मार्ट शैक्षणिक साधने",
        desc: "शिक्षकांना गृहपाठ व गुण देणे सुलभ करणारी प्रगत शैक्षणिक साधने."
      },
      {
        title: "शैक्षणिक सामग्री आणि संसाधने",
        desc: "बहुभाषिक, अभ्यासक्रमाशी सुसंगत डिजिटल संसाधनांचा समृद्ध साठा."
      },
      {
        title: "नाविन्यता-चालित शिक्षण अनुभव",
        desc: "विद्यार्थ्यांमध्ये सर्जनशीलता, तर्कशुद्ध विचार आणि भविष्यातील कौशल्ये वाढवणे."
      }
    ],
    company_info_title: "कॉर्पोरेट माहिती",
    company_name: "कंपनीचे नाव",
    cin: "कॉर्पोरेट ओळख क्रमांक (CIN)",
    reg_address: "नोंदणीकृत पत्ता",
    pan: "पॅन नंबर (PAN)",
    tan: "टॅन नंबर (TAN)",
    inc_cert: "नोंदणी प्रमाणपत्र (Certificate of Incorporation)",
    view_cert: "प्रमाणपत्र पाहण्यासाठी क्लिक करा",
    address_snippet: "पत्ता पडताळणी स्निपेट",
    commitment_title: "आमची वचनबद्धता",
    commitment_desc: "एसजीके ब्रेनोव्हा मध्ये, आम्ही अर्थपूर्ण शैक्षणिक अनुभव तयार करण्यासाठी वचनबद्ध आहोत जे उत्सुकता वाढवतात, नाविन्यतेला प्रोत्साहन देतात आणि विद्यार्थ्यांना उद्याच्या आव्हानांसाठी तयार करतात. तंत्रज्ञान, बुद्धिमत्ता आणि शिक्षण यांचा मेळ घालून, आम्ही शिकणे अधिक स्मार्ट, सोपे आणि प्रभावी बनवण्याचा प्रयत्न करतो."
  },
  hi: {
    badge: "एसजीके ब्रेनोवा प्राइवेट लिमिटेड",
    hero_title: "एआई (AI) के साथ शिक्षा के भविष्य का निर्माण",
    hero_subtitle: "स्मार्ट डिजिटल समाधानों और शैक्षणिक प्लेटफार्मों के माध्यम से पारंपरिक शिक्षा और भविष्य की शिक्षा के बीच की दूरी को पाटते हैं.",
    about_title: "हमारे बारे में",
    about_desc1: "एसजीके ब्रेनोवा प्राइवेट लिमिटेड एक अभिनव शैक्षिक प्रौद्योगिकी कंपनी है जो आर्टिफिशियल इंटेलिजेंस (AI), डिजिटल समाधान और स्मार्ट शैक्षिक उपकरणों के माध्यम से सीखने की प्रक्रिया को बदलने के लिए समर्पित है. हमारा मिशन छात्रों, शिक्षकों, स्कूलों और शैक्षणिक संस्थानों को आधुनिक तकनीक से सशक्त बनाना है जो सीखने को अधिक आकर्षक, सुलभ और प्रभावी बनाती है.",
    about_desc2: "पारंपरिक शिक्षा और भविष्य के लिए तैयार सीखने के बीच की दूरी को पाटने के दृष्टिकोण के साथ स्थापित, एसजीके ब्रेनोवा बुद्धिमान शैक्षिक प्लेटफॉर्म, डिजिटल शिक्षण संसाधन, शैक्षणिक प्रबंधन प्रणाली और एआई-संचालित समाधान विकसित करने पर ध्यान केंद्रित करता है जो समग्र शिक्षण अनुभव को बढ़ाते हैं.",
    about_desc3: "हमारा मानना है कि प्रत्येक शिक्षार्थी तकनीक द्वारा समर्थित गुणवत्तापूर्ण शिक्षा तक पहुंच का हकदार है. अपने अभिनव उत्पादों और सेवाओं के माध्यम से, हमारा लक्ष्य एक स्मार्ट, अधिक कनेक्टेड और ज्ञान-संचालित शैक्षिक पारिस्थितिकी तंत्र बनाना है.",
    vision_title: "हमारा दृष्टिकोण (Our Vision)",
    vision_desc: "एक अग्रणी शैक्षिक प्रौद्योगिकी कंपनी बनना जो नवाचार, रचनात्मकता और आर्टिफिशियल इंटेलिजेंस के माध्यम से सीखने में क्रांति लाए.",
    mission_title: "हमारा मिशन (Our Mission)",
    mission_items: [
      "स्मार्ट और प्रभावी शिक्षण समाधान प्रदान करना.",
      "प्रौद्योगिकी-संचालित शिक्षा के साथ छात्रों को सशक्त बनाना.",
      "स्कूलों और संस्थानों को आधुनिक डिजिटल उपकरणों के साथ सहायता देना.",
      "नवाचार, रचनात्मकता और आजीवन सीखने को बढ़ावा देना.",
      "एक ऐसा भविष्य बनाना जहाँ शिक्षा सुलभ, आकर्षक और बुद्धिमान हो."
    ],
    offer_title: "हमारी पेशकश",
    offer_items: [
      {
        title: "एआई-संचालित शिक्षण समाधान",
        desc: "व्यक्तिगत ट्यूशन, स्मार्ट सामग्री अनुशंसाएं और वर्चुअल शिक्षण सहायक."
      },
      {
        title: "स्कूल और कॉलेज प्रबंधन प्रणाली",
        desc: "शैक्षणिक रिकॉर्ड, संचालन और संचार का पूर्ण डिजिटलीकरण."
      },
      {
        title: "डिजिटल शिक्षा प्लेटफॉर्म",
        desc: "इंटरैक्टिव कक्षा शिक्षण के लिए इमर्सिव शिक्षण वातावरण."
      },
      {
        title: "छात्र प्रगति और प्रदर्शन विश्लेषण",
        desc: "डेटा-संचालित अंतर्दृष्टि और छात्रों तथा अभिभावकों के लिए रिपोर्टिंग."
      },
      {
        title: "स्मार्ट शैक्षणिक उपकरण",
        desc: "शिक्षकों के लिए आसानी से पाठ योजना और मूल्यांकन बनाने के उपकरण."
      },
      {
        title: "शैक्षिक सामग्री और संसाधन",
        desc: "बहुभाषी, पाठ्यक्रम-संरेखित डिजिटल संसाधनों का समृद्ध भंडार."
      },
      {
        title: "नवाचार-संचालित सीखने के अनुभव",
        desc: "रचनात्मकता, आलोचनात्मक सोच और भविष्य के कौशल को बढ़ावा देना."
      }
    ],
    company_info_title: "कॉर्पोरेट जानकारी",
    company_name: "कंपनी का नाम",
    cin: "कॉर्पोरेट पहचान संख्या (CIN)",
    reg_address: "पंजीकृत पता",
    pan: "पैन कार्ड नंबर (PAN)",
    tan: "टैन नंबर (TAN)",
    inc_cert: "निगमन प्रमाणपत्र (Certificate of Incorporation)",
    view_cert: "प्रमाणपत्र देखने के लिए क्लिक करें",
    address_snippet: "पता सत्यापन स्निपेट",
    commitment_title: "हमारी प्रतिबद्धता",
    commitment_desc: "एसजीके ब्रेनोवा में, हम सार्थक शैक्षिक अनुभव बनाने के लिए प्रतिबद्ध हैं जो जिज्ञासा को प्रेरित करते हैं, नवाचार को बढ़ावा देते हैं, और शिक्षार्थियों को कल की चुनौतियों के लिए तैयार करते हैं. प्रौद्योगिकी, बुद्धिमत्ता और शिक्षा को मिलाकर, हम सीखने को अधिक स्मार्ट, सरल और अधिक प्रभावशाली बनाने का प्रयास करते हैं."
  }
};

const OFFER_ICONS = [Cpu, Database, Globe, LineChart, Zap, BookOpen, Target];
const OFFER_COLORS = [
  { gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", glow: "group-hover:shadow-amber-500/20" },
  { gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", glow: "group-hover:shadow-violet-500/20" },
  { gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", glow: "group-hover:shadow-cyan-500/20" },
  { gradient: "from-rose-500 to-pink-600", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", glow: "group-hover:shadow-rose-500/20" },
  { gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", glow: "group-hover:shadow-emerald-500/20" },
  { gradient: "from-sky-500 to-indigo-600", bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400", glow: "group-hover:shadow-sky-500/20" },
  { gradient: "from-fuchsia-500 to-violet-600", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", text: "text-fuchsia-400", glow: "group-hover:shadow-fuchsia-500/20" },
];

const STATS = [
  { icon: Users, value: "1000+", label: "Students Empowered" },
  { icon: Lightbulb, value: "50+", label: "AI Tools Built" },
  { icon: TrendingUp, value: "99%", label: "Satisfaction Rate" },
  { icon: Star, value: "24/7", label: "Platform Uptime" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

export function AboutPage() {
  const { lang } = useLanguage();
  const currentLang = (lang === "mr" || lang === "hi" || lang === "en") ? lang : "en";
  const t = LOCAL_TRANSLATIONS[currentLang];

  const [activeTab, setActiveTab] = useState<"about" | "offerings" | "corporate">("about");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const openImageModal = (imgSrc: string) => {
    setModalImage(imgSrc);
    setIsModalOpen(true);
  };

  const tabs = [
    { id: "about" as const, label: t.about_title, icon: GraduationCap },
    { id: "offerings" as const, label: t.offer_title, icon: Award },
    { id: "corporate" as const, label: t.company_info_title, icon: Building },
  ];

  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden w-full font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200 relative"
      style={{ background: "linear-gradient(135deg, #0a0a14 0%, #0f0f23 25%, #141428 50%, #0d0d1f 75%, #0a0a14 100%)" }}
    >
      {/* ─── Animated Background Mesh ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] bg-indigo-600/6 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "7s" }} />

        {/* Fine grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating decorative shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-20 h-20 rounded-full border border-amber-500/15"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[55%] left-[8%] w-12 h-12 rounded-xl border border-violet-500/15 rotate-45"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] right-[12%] w-16 h-16 rounded-full border-2 border-dashed border-amber-500/10"
        />
      </div>

      {/* ═══════════════════════════════════════
          ███  HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-[0.2em] shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(168,85,247,0.08))",
                borderColor: "rgba(251,191,36,0.25)",
              }}
            >
              <Sparkles className="size-4 animate-pulse text-amber-400" />
              <span className="text-amber-300">{t.badge}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              <span className="text-white">{t.hero_title.split(" ").slice(0, -3).join(" ")} </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-violet-500">
                {t.hero_title.split(" ").slice(-3).join(" ")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg text-slate-400 max-w-2xl font-medium leading-relaxed"
            >
              {t.hero_subtitle}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4"
            >
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="p-3 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-amber-500/20 transition-all duration-300 group text-center"
                  >
                    <Icon className="size-5 text-amber-400/70 mx-auto mb-1.5 group-hover:text-amber-400 transition-colors" />
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Logo */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
              className="relative group p-4"
            >
              {/* Glowing multi-layer rings */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-violet-600 rounded-full blur-[40px] opacity-20 group-hover:opacity-35 transition-opacity duration-700" />
              <div className="absolute inset-4 bg-gradient-to-br from-violet-500 to-amber-500 rounded-full blur-[30px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />

              {/* Rotating dashed ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-8px] rounded-full border-2 border-dashed border-amber-500/15"
              />

              {/* Outer glass frame */}
              <div className="relative rounded-full p-2 border border-white/10 backdrop-blur-xl shadow-2xl"
                style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
              >
                <img
                  src={sgkLogo}
                  alt="SGK Brainova Logo"
                  className="size-64 md:size-80 rounded-full object-cover border-2 border-amber-500/20 shadow-inner group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ███  TABS NAVIGATION
          ═══════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mb-14">
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl border border-white/5 gap-1"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? "text-amber-300 shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  style={isActive ? {
                    background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(168,85,247,0.1))",
                    boxShadow: "0 4px 20px rgba(251,191,36,0.15)",
                  } : {}}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 rounded-xl border border-amber-500/25"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon className={`relative z-10 size-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          ███  TAB PANELS
          ═══════════════════════════════════════ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24 min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* ─── ABOUT TAB ─── */}
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-16"
            >
              {/* About Content + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                <div className="lg:col-span-8 space-y-6">
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
                    {t.about_title}
                  </h2>
                  <div className="space-y-5 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                    <p className="pl-5 border-l-2 border-amber-500/20">{t.about_desc1}</p>
                    <p className="pl-5 border-l-2 border-violet-500/20">{t.about_desc2}</p>
                    <p className="pl-5 border-l-2 border-amber-500/20">{t.about_desc3}</p>
                  </div>
                </div>

                {/* Sidebar - Key Focus Areas */}
                <div className="lg:col-span-4 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
                  style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/8 to-transparent rounded-bl-full pointer-events-none" />

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="size-4 text-amber-400" />
                      Key Focus Areas
                    </h3>

                    <ul className="space-y-5">
                      {[
                        { title: "AI Integration", desc: "Intelligent study bots and personalized telemetry.", color: "amber" },
                        { title: "Digital Management", desc: "Simplifying school/college administrative systems.", color: "violet" },
                        { title: "Empowerment", desc: "Enabling teachers to deliver high impact classrooms.", color: "cyan" }
                      ].map((item, index) => (
                        <li key={index} className="flex gap-3 group">
                          <div className={`size-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 ${
                            item.color === "amber" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black" :
                            item.color === "violet" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white" :
                            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black"
                          }`}>
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl border transition-all duration-300"
                        style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.15)" }}
                      >
                        <ShieldCheck className="size-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Trust & Compliance</h4>
                        <p className="text-xs text-slate-500">Incorporated under MCA India.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision & Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Vision Card */}
                <motion.div
                  whileHover={{ y: -6 }}
                  className="p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group cursor-default"
                  style={{
                    background: "linear-gradient(160deg, rgba(251,191,36,0.06), rgba(255,255,255,0.02))",
                  }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/8 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-tr-full pointer-events-none" />

                  <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-400 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                    <Target className="size-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-4">{t.vision_title}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed font-medium">{t.vision_desc}</p>
                </motion.div>

                {/* Mission Card */}
                <motion.div
                  whileHover={{ y: -6 }}
                  className="p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group cursor-default"
                  style={{
                    background: "linear-gradient(160deg, rgba(168,85,247,0.06), rgba(255,255,255,0.02))",
                  }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-500/8 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full pointer-events-none" />

                  <div className="size-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all duration-400 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                    <Zap className="size-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-4">{t.mission_title}</h3>
                  <ul className="space-y-3">
                    {t.mission_items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-300 text-base font-medium">
                        <CheckCircle2 className="size-5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ─── OFFERINGS TAB ─── */}
          {activeTab === "offerings" && (
            <motion.div
              key="offerings-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t.offer_title}</h2>
                <p className="text-slate-400 text-base font-medium">
                  Empowering the entire educational lifecycle with AI and smart technology.
                </p>
              </div>

              {/* Bento Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {t.offer_items.map((item, idx) => {
                  const Icon = OFFER_ICONS[idx % OFFER_ICONS.length] || BookOpen;
                  const colors = OFFER_COLORS[idx % OFFER_COLORS.length];
                  const isLarge = idx < 2;

                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.01 }}
                      className={`p-6 sm:p-7 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-400 flex flex-col justify-between group cursor-default ${colors.glow} hover:shadow-xl ${
                        isLarge ? "md:col-span-1 lg:col-span-1" : ""
                      }`}
                      style={{
                        background: "linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))",
                      }}
                    >
                      <div className="space-y-4">
                        {/* Number + Icon Row */}
                        <div className="flex items-center justify-between">
                          <div className={`size-12 rounded-2xl ${colors.bg} ${colors.border} border ${colors.text} flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg`}>
                            <Icon className="size-6" />
                          </div>
                          <span className="text-2xl font-black text-white/[0.06] group-hover:text-white/[0.12] transition-colors select-none">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <h3 className={`text-lg font-bold text-white group-hover:${colors.text} transition-colors duration-300`}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>

                      <div className="pt-5 mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${colors.text}`}>Learn More</span>
                        <ChevronRight className={`size-3 ${colors.text}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* ─── CORPORATE TAB ─── */}
          {activeTab === "corporate" && (
            <motion.div
              key="corporate-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Info Grid */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                  <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-purple-600" />
                  {t.company_info_title}
                </h2>

                <div className="rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl"
                  style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))" }}
                >
                  {/* Company Name */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.company_name}</span>
                    <span className="text-base font-extrabold text-white text-right">{t.badge}</span>
                  </div>

                  {/* CIN */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.cin}</span>
                    <span className="text-base font-mono font-extrabold text-amber-400 px-3 py-1 rounded-lg border"
                      style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.15)" }}
                    >
                      U85499PN2026PTC256078
                    </span>
                  </div>

                  {/* PAN & TAN */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.pan}</span>
                      <span className="text-sm font-mono font-bold text-slate-200">ABTCS8869A</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tan}</span>
                      <span className="text-sm font-mono font-bold text-slate-200">KLPS18427D</span>
                    </div>
                  </div>

                  {/* Registered Address */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="size-5 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.reg_address}
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                          145/A, 194/A/2, Plot No. 100, Shree Capital-2,<br />
                          Warnali, Willingdon College Road,<br />
                          Miraj, Sangli – 416415, Maharashtra, India.
                        </p>
                      </div>
                    </div>

                    {/* Address snippet */}
                    <div className="mt-3 p-3 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-slate-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-300">{t.address_snippet}</h4>
                          <p className="text-[10px] text-slate-600">Government Registry Matching</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openImageModal(addressSnippetImg)}
                        className="shrink-0 p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-amber-400 hover:border-amber-500/20 flex items-center gap-1 transition-colors text-[10px] font-bold"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <Maximize2 className="size-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Card */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 px-1">
                  <ShieldCheck className="size-5 text-amber-400" />
                  {t.inc_cert}
                </h3>

                <div className="p-4 rounded-3xl border border-white/5 shadow-xl space-y-4"
                  style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))" }}
                >
                  <div
                    onClick={() => openImageModal(certificateImg)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] border border-white/5"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                  >
                    <img
                      src={certificateImg}
                      alt="Certificate of Incorporation SGK Brainova"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <Maximize2 className="size-4" />
                        <span>{t.view_cert}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-600">
                    Incorporated on 23rd May 2026 under Registrar of Companies, Pune.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════════════════════════════════════
          ███  COMMITMENT SECTION
          ═══════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="p-8 sm:p-12 md:p-16 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(168,85,247,0.04), rgba(255,255,255,0.02))",
          }}
        >
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Floating dots */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-16 w-2 h-2 rounded-full bg-amber-400/30"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-16 left-20 w-3 h-3 rounded-full bg-violet-400/20"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-300/20"
          />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex size-14 rounded-full items-center justify-center mx-auto border"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(168,85,247,0.08))",
                borderColor: "rgba(251,191,36,0.2)",
              }}
            >
              <Globe className="size-7 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              {t.commitment_title}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-medium">
              {t.commitment_desc}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ███  LIGHTBOX MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 flex flex-col"
              style={{ background: "linear-gradient(160deg, #141428, #0f0f1a)" }}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-sm font-extrabold text-white">Registry Evidence Viewer</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:border-amber-500/30 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex justify-center items-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                <img
                  src={modalImage}
                  alt="Full-size Corporate registry view"
                  className="max-w-full max-h-[75vh] object-contain rounded-lg border border-white/5"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
