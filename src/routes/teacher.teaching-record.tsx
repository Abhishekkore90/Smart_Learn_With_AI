import { createFileRoute } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  ArrowLeft, 
  Search, 
  Quote, 
  Calendar,
  School,
  UserCheck,
  Sparkles,
  Trash2,
  Plus,
  Eye,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import parsedDiaryData from "./parsed_diary.json";
import { showToast as toast } from "@/lib/custom-toast";
import { db } from "@/lib/firebase";

const getMarathiDayName = (dateStr: string, fallbackDay: string) => {
  if (fallbackDay) return fallbackDay;
  if (!dateStr) return "सोमवार";
  try {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const dayIndex = date.getDay();
      const days = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
      return days[dayIndex] || "सोमवार";
    }
  } catch (e) {
    // ignore
  }
  return "सोमवार";
};

const formatDateToInput = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const d = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return "";
};

const formatDateFromInput = (inputVal: string) => {
  if (!inputVal) return "";
  const parts = inputVal.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return "";
};

const getMonthFromDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const monthNum = parseInt(parts[1], 10);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNum - 1] || "";
  }
  return "";
};

const toEnglishDigits = (str: string) => {
  const marathiToEnglish: Record<string, string> = {
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
  };
  return str.split("").map(c => marathiToEnglish[c] || c).join("");
};

const getStandardDayMonth = (dateStr: string) => {
  if (!dateStr) return "";
  const cleanStr = toEnglishDigits(dateStr);
  const parts = cleanStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    if (parts[0].length === 4) {
      const m = parts[1].padStart(2, "0");
      const d = parts[2].padStart(2, "0");
      return `${d}/${m}`;
    } else {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      return `${d}/${m}`;
    }
  }
  return "";
};

const getDynamicDinvishesh = (id: number, dateStr: string) => {
  const DINVISHESH_LIST = [
    "१६३३: गॅलेलिओ गॅलिली याने पोपच्या दबावाखाली पृथ्वी हाच सूर्यमालेचा केंद्रबिंदू आहे असे कबूल केले.",
    "१९२८: सर सी. व्ही. रमण यांनी रामन परिणाम (Raman Effect) या शोध निबंधाची घोषणा केली.",
    "१९४७: भारताला ब्रिटीश राजवटीपासून स्वातंत्र्य मिळाले.",
    "१८८८: महान गणितज्ञ श्रीनिवास रामानुजन यांचा जन्म.",
    "१९८४: राकेश शर्मा अंतरिक्ष प्रवास करणारे पहिले भारतीय अंतराळवीर बनले.",
    "१८४८: क्रांतीज्योती सावित्रीबाई फुले यांनी पुण्यात पहिली मुलींची शाळा सुरू केली.",
    "१९५०: भारत एक सार्वभौम लोकशाही प्रजासत्ताक देश बनला.",
    "२०००: भारताची लोकसंख्या १०० कोटींवर पोहोचली.",
  ];
  const index = id ? (id % DINVISHESH_LIST.length) : 0;
  return DINVISHESH_LIST[index];
};

const getMockParsedDataForClass = (classId: string, dateStr: string, fileName: string) => {
  const className = DIARY_CLASSES.find((c) => c.id === classId)?.mr.replace("इयत्ता ", "") || "";
  
  const thoughts = [
    "सुंदर विचार हाच खरा अलंकार आहे.",
    "वाचाल तर वाचाल.",
    "ज्ञानासारखे पवित्र वस्तू या जगात दुसरी कोणतीही नाही.",
    "प्रयत्न वाळूचे कण रगडीता तेलही गळे.",
    "यशाची गुरुकिल्ली म्हणजे सतत कष्ट करणे.",
    "सत्य आणि प्रामाणिकपणा हाच खरा धर्म आहे."
  ];
  
  const dinvisheshList = [
    "१९४७: भारताला स्वातंत्र्य मिळाले.",
    "१९९९: कारगिल विजय दिन साजरा केला जातो.",
    "१८८८: महान गणितज्ञ श्रीनिवास रामानुजन यांचा जन्मदिवस.",
    "१८४८: क्रांतीज्योती सावित्रीबाई फुले यांनी पहिली मुलींची शाळा सुरू केली.",
    "१९७४: भारताने पोखरण येथे पहिली अणुचाचणी यशस्वी केली."
  ];

  const hash = dateStr.split("/").reduce((acc, val) => acc + parseInt(val || "0", 10), 0) || 0;
  const thought = thoughts[hash % thoughts.length];
  const dinvishesh = dinvisheshList[hash % dinvisheshList.length];

  const highlights = `आजच्या दिवशी वर्गामध्ये ${className} च्या विद्यार्थ्यांना नियोजित अभ्यासक्रमानुसार विविध विषयांचे सविस्तर अध्यापन करण्यात आले. शैक्षणिक साहित्याचा वापर करून संकल्पना स्पष्ट करण्यात आल्या. सर्व विद्यार्थ्यांनी विचारलेल्या प्रश्नांची उत्तरे दिली व गृहपाठ वेळेत पूर्ण केला.`;

  let periods: any[] = [];
  
  if (classId === "1") {
    periods = [
      {
        period: "1",
        class: className,
        subject: "मराठी",
        topic: "मुळाक्षरे ओळख: 'अ' आणि 'आ' स्वरांचे वाचन व लेखन सराव करणे.",
        experience: "शिक्षकांनी फळ्यावर अक्षरे लिहून दाखवली व चित्र दाखवून उच्चार सराव घेतला. विद्यार्थ्यांनी गिरवले.",
        tools: "चित्रवाचन, अक्षरगट चर्चा",
        materials: "अक्षरकार्ड, रंगीत खडू",
        outcome: "विद्यार्थ्यांनी 'अ' व 'आ' अक्षरे अचूक ओळखली व लिहिली."
      },
      {
        period: "2",
        class: className,
        subject: "गणित",
        topic: "अंक ओळख: १ ते ५ अंकांची ओळख व मोजणी करणे.",
        experience: "मण्यांच्या साहाय्याने अंक मोजण्याचा खेळ घेतला व लेखन सराव घेतला. विद्यार्थ्यांनी मणी मोजले.",
        tools: "मोजणी खेळ, गट कार्य",
        materials: "रंगीत मणी, मोजणी तक्ता",
        outcome: "विद्यार्थ्यांना १ ते ५ अंकांची ओळख झाली व अचूक मोजणी करता आली."
      },
      {
        period: "3",
        class: className,
        subject: "इंग्रजी",
        topic: "Letters: Rhyme and shape identification for 'A' and 'B'.",
        experience: "Teacher demonstrated writing letters and sang the alphabet song.",
        tools: "Rhyme, visual board work",
        materials: "Chart of letters",
        outcome: "Students could identify and repeat letters A and B."
      },
      {
        period: "4",
        class: className,
        subject: "क्रीडा",
        topic: "मैदानी खेळ: लहान-मोठे गट करून पळण्याचे खेळ.",
        experience: "शिक्षकांनी विद्यार्थ्यांना मैदानावर नेऊन विविध मनोरंजक खेळ घेतले.",
        tools: "प्रत्यक्ष कृती",
        materials: "शिट्टी, पाण्याचे बॉटल",
        outcome: "विद्यार्थ्यांचे मनोरंजन झाले व सांघिक भावना वाढीस लागली."
      }
    ];
  } else if (classId === "2") {
    periods = [
      {
        period: "1",
        class: className,
        subject: "मराठी",
        topic: "जोडाक्षरे: 'स्व' आणि 'प्र' युक्त शब्दांचे वाचन व लेखन सराव करणे.",
        experience: "शिक्षकांनी जोडाक्षरांचे उच्चार नियम सांगितले व फळ्यावर शब्द लिहून दिले. विद्यार्थ्यांनी अनुलेखन केले.",
        tools: "शब्द वाचन सराव, वैयक्तिक कार्य",
        materials: "जोडाक्षर शब्दकार्ड, फळा",
        outcome: "विद्यार्थ्यांनी जोडाक्षरांचे योग्य उच्चारासह वाचन व लेखन केले."
      },
      {
        period: "2",
        class: className,
        subject: "गणित",
        topic: "बेरीज: दोन अंकी संख्यांची बिनहाच्याची बेरीज शिकणे.",
        experience: "उदाहरणे फळ्यावर सोडवून दाखवली व नंतर विद्यार्थ्यांना वहीत सोडवण्यास दिली. सराव घेतला.",
        tools: "उदाहरणे सोडवणे, प्रश्नोत्तरांचा सराव",
        materials: "गणित पेटी, सराव तक्ता",
        outcome: "विद्यार्थ्यांना दोन अंकी संख्यांची बेरीज बिनचूक करता आली."
      },
      {
        period: "3",
        class: className,
        subject: "इंग्रजी",
        topic: "Action Words: Learning words like jump, run, write, read.",
        experience: "Teacher demonstrated action words and students performed actions accordingly.",
        tools: "Action game, TPR",
        materials: "Action flashcards",
        outcome: "Students learned common action words and used them in sentences."
      }
    ];
  } else if (classId === "3") {
    periods = [
      {
        period: "1",
        class: className,
        subject: "मराठी",
        topic: "कविता वाचन: 'रानपाखरा' कविता तालासुरात गाणे व भावार्थ समजणे.",
        experience: "शिक्षकांनी कविता गायन करून दाखवले व पक्ष्यांच्या जीवनाबद्दल माहिती दिली.",
        tools: "काव्य गायन, चर्चा",
        materials: "पाठ्यपुस्तक, पक्ष्यांची चित्रे",
        outcome: "विद्यार्थ्यांनी कविता तालासुरात गायली व त्याचा अर्थ समजून घेतला."
      },
      {
        period: "2",
        class: className,
        subject: "गणित",
        topic: "वजाबाकी: तीन अंकी संख्यांची हातच्याची वजाबाकी शिकणे.",
        experience: "हातच्याची वजाबाकी करताना दशकाचे सुटे कसे करायचे हे दाखवले व विद्यार्थ्यांकडून सोडवून घेतली.",
        tools: "समस्या निवारण, गट सराव",
        materials: "वजाबाकी तक्ता, मणी",
        outcome: "विद्यार्थ्यांनी तीन अंकी हातच्याची वजाबाकी अचूकपणे सोडवली."
      },
      {
        period: "3",
        class: className,
        subject: "इंग्रजी",
        topic: "Naming Words: Nouns (Names of animals, places, things).",
        experience: "Played noun game where children listed names of things around them.",
        tools: "Noun game, listing activity",
        materials: "Chart of nouns",
        outcome: "Students understood naming words and identified nouns correctly."
      },
      {
        period: "4",
        class: className,
        subject: "परिसर अभ्यास",
        topic: "आपली पाण्याची गरज: पाण्याचे महत्त्व व पाण्याचे विविध स्रोत समजणे.",
        experience: "शिक्षकांनी पाण्याचे विविध स्रोत सांगून पाण्याची बचत कशी करावी यावर चर्चा केली.",
        tools: "गटचर्चा, प्रश्नोत्तरे",
        materials: "पाण्याच्या स्रोतांचा तक्ता",
        outcome: "विद्यार्थ्यांना पाण्याचे महत्त्व व संवर्धनाचे महत्त्व समजले."
      }
    ];
  } else if (classId === "4") {
    periods = [
      {
        period: "1",
        class: className,
        subject: "मराठी",
        topic: "व्याकरण: नाम आणि सर्वनाम ओळखणे व वाक्यात वापर करणे.",
        experience: "शिक्षकांनी नामाच्या जागी येणारे शब्द (सर्वनाम) स्पष्ट केले व सराव वाक्ये दिली.",
        tools: "वाक्य विश्लेषण, व्याकरण सराव",
        materials: "व्याकरण तक्ता, शब्दकार्ड",
        outcome: "विद्यार्थ्यांनी वाक्यातील नाम व सर्वनाम अचूकपणे ओळखले."
      },
      {
        period: "2",
        class: className,
        subject: "गणित",
        topic: "गुणाकार: तीन अंकी संख्येला दोन अंकी संख्येने गुणणे.",
        experience: "शिक्षकांनी गुणाकाराची पायरी-पायरी समजावली व फळ्यावर सोडवले. विद्यार्थ्यांना सराव दिला.",
        tools: "गणितीय क्रिया, वैयक्तिक सराव",
        materials: "गुणाकार तक्ता",
        outcome: "विद्यार्थ्यांनी गुणाकाराची उदाहरणे अचूक सोडवली."
      },
      {
        period: "3",
        class: className,
        subject: "इंग्रजी",
        topic: "Pronouns: Replacing naming words with He, She, It, They.",
        experience: "Teacher wrote sentences on board and asked students to change nouns to pronouns.",
        tools: "Sentence conversion, drill",
        materials: "Sentence cards",
        outcome: "Students learned correct usage of pronouns in conversation."
      },
      {
        period: "4",
        class: className,
        subject: "परिसर अभ्यास १",
        topic: "अन्नातील विविधता: वेगवेगळ्या प्रदेशातील अन्नपदार्थ समजणे.",
        experience: "शिक्षकांनी भारताच्या विविध राज्यांमधील मुख्य अन्नाबद्दल माहिती दिली व नकाशा दाखवला.",
        tools: "नकाशा वाचन, चर्चा",
        materials: "खाद्यपदार्थांचे तक्ते, भारताचा नकाशा",
        outcome: "विद्यार्थ्यांना भारतातील अन्नविविधतेबद्दल माहिती मिळाली."
      },
      {
        period: "5",
        class: className,
        subject: "परिसर अभ्यास २",
        topic: "शिवछत्रपतींचे बालपण: शिवरायांचे संगोपन व जिजाबाईंनी दिलेले संस्कार.",
        experience: "जिजाबाईंनी शिवरायांना सांगितलेल्या वीरकथा आणि मावळ्यांसोबतचे त्यांचे बालपण स्पष्ट केले.",
        tools: "कथाकथन, ऐतिहासिक चर्चा",
        materials: "ऐतिहासिक चित्रे, पाठ्यपुस्तक",
        outcome: "विद्यार्थ्यांना शिवरायांच्या बालपणीच्या संस्कारांचे महत्त्व समजले."
      }
    ];
  } else {
    // Classes 5, 6, 7 (e.g. includes Class 7 / सातवी)
    periods = [
      {
        period: "1",
        class: className,
        subject: "मराठी",
        topic: "पाठ ९: 'शब्दांचे घर' - पाठाचे सविस्तर वाचन व क्रियाविशेषण अव्यय शिकणे.",
        experience: "शिक्षकांनी पाठाचे स्पष्ट उच्चारांसह वाचन केले व कठीण शब्द स्पष्ट केले. क्रियाविशेषणाचा सराव घेतला.",
        tools: "प्रकट वाचन, व्याकरण चर्चा",
        materials: "मराठी पाठ्यपुस्तक, व्याकरण तक्ता",
        outcome: "विद्यार्थ्यांना शब्दांचे घर समजले आणि क्रियाविशेषण अव्यय ओळखता आले."
      },
      {
        period: "2",
        class: className,
        subject: "गणित",
        topic: "घटक: अपूर्णांकांचा गुणाकार व भागाकार क्रिया समजून घेणे.",
        experience: "शिक्षकांनी अपूर्णांकांचा गुणाकार कसा करावा व भागाकार करताना व्यस्त कसा घ्यावा हे समजावून दिले.",
        tools: "गणिते सोडवणे, स्पष्टीकरण",
        materials: "सराव तक्ता, अपूर्णांक मॉडेल",
        outcome: "विद्यार्थ्यांनी अपूर्णांकांच्या गुणाकार व भागाकाराची गणिते अचूकपणे सोडवली."
      },
      {
        period: "3",
        class: className,
        subject: "इंग्रजी",
        topic: "Grammar: Understanding Direct and Indirect Speech in simple sentences.",
        experience: "Teacher explained the rules of changing direct speech to indirect speech with examples.",
        tools: "Board work, sentence exercise",
        materials: "Speech rules chart",
        outcome: "Students converted simple direct speech sentences into indirect speech correctly."
      },
      {
        period: "4",
        class: className,
        subject: "हिंदी",
        topic: "पाठ: 'मेला' - संवाद वाचन और नए शब्दों का वाक्य में प्रयोग करना.",
        experience: "छात्रों से संवाद का पठन करवाया गया और नए शब्दों के अर्थ लिखकर उनका वाक्य में प्रयोग सिखाया गया.",
        tools: "अभिनय वाचन, शब्दार्थ सराव",
        materials: "हिंदी पाठ्यपुस्तक",
        outcome: "छात्रों ने शुद्ध उच्चारण के साथ पाठ पढ़ा और नए शब्दों का वाक्य प्रयोग किया।"
      },
      {
        period: "5",
        class: className,
        subject: "विज्ञान",
        topic: "सजीवांमधील पोषण: स्वयंपोषी आणि परपोषी वनस्पतींमधील फरक समजणे.",
        experience: "शिक्षकांनी वनस्पतींच्या प्रकाशसंश्लेषण प्रक्रियेची आकृती काढून स्पष्टीकरण दिले व फरक समजावला.",
        tools: "आकृती स्पष्टीकरण, प्रश्नोत्तरे",
        materials: "प्रकाशसंश्लेषण तक्ता, वनस्पतीची आकृती",
        outcome: "विद्यार्थ्यांना स्वयंपोषी व परपोषी वनस्पतींमधील मूलभूत फरक समजला."
      },
      {
        period: "6",
        class: className,
        subject: "सामाजिक शास्त्र",
        topic: "इतिहास: शिवपूर्वकालीन महाराष्ट्र व संतांची कामगिरी समजणे.",
        experience: "संत ज्ञानेश्वर, संत नामदेव व संत तुकाराम यांच्या महाराष्ट्रातील समाज प्रबोधनावरील कार्याची माहिती दिली.",
        tools: "कथाकथन, ऐतिहासिक विहंगम",
        materials: "संतांची चित्रे, पाठ्यपुस्तक",
        outcome: "विद्यार्थ्यांना संतांच्या कार्याची माहिती झाली व समाज सुधारणेचे महत्त्व पटले."
      },
      {
        period: "7",
        class: className,
        subject: "कार्यानुभव",
        topic: "हस्तकला: कागदी फुले व विविध शोभेच्या वस्तू तयार करणे.",
        experience: "शिक्षकांनी प्रत्यक्ष ओरिगामी कागदापासून फुले कशी बनवावीत याचे प्रात्यक्षिक दाखवले. विद्यार्थ्यांनी फुले बनवली.",
        tools: "प्रत्यक्ष प्रात्यक्षिक, कला सराव",
        materials: "रंगीत कागद, कात्री, फेव्हिकॉल",
        outcome: "विद्यार्थ्यांनी सुंदर कागदी फुले तयार करून आनंद मिळवला."
      },
      {
        period: "8",
        class: className,
        subject: "शा. शि.",
        topic: "मैदानी खेळ: खो-खो खेळाचे मैदान व नियमांचे प्रात्यक्षिक करणे.",
        experience: "शिक्षकांनी विद्यार्थ्यांना मैदानावर नेऊन खो-खो खेळाच्या नियमांची माहिती दिली व एक सामना घेतला.",
        tools: "क्रीडा प्रत्यक्ष सराव, सांघिक समन्वय",
        materials: "खो-खो खांब, चुना, शिट्टी",
        outcome: "विद्यार्थ्यांना खो-खो खेळाचे नियम समजले व संघभावना विकसित झाली."
      }
    ];
  }

  return {
    thought,
    dinvishesh,
    highlights,
    periods
  };
};

export const Route = createFileRoute("/teacher/teaching-record")({
  head: () => ({
    meta: [{ title: "Teaching Diary (टाचणवही) — Teacher Portal" }],
  }),
  component: TeachingRecordPage,
});

/* ─── Class & File Data ─── */
const DIARY_CLASSES = [
  { id: "1", en: "Class 1", mr: "इयत्ता पहिली" },
  { id: "2", en: "Class 2", mr: "इयत्ता दुसरी" },
  { id: "3", en: "Class 3", mr: "इयत्ता तिसरी" },
  { id: "4", en: "Class 4", mr: "इयत्ता चौथी" },
  { id: "5", en: "Class 5", mr: "इयत्ता पाचवी" },
  { id: "6", en: "Class 6", mr: "इयत्ता सहावी" },
  { id: "7", en: "Class 7", mr: "इयत्ता सातवी" },
];

const DIARY_FILES: Record<string, { title: string; subtitle: string }[]> = {
  "1": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग पहिली" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग पहिली" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग पहिली" },
  ],
  "2": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग दुसरी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग दुसरी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग दुसरी" },
  ],
  "3": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग तिसरी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग तिसरी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग तिसरी" },
  ],
  "4": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग चौथी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग चौथी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग चौथी" },
  ],
  "5": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग पाचवी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग पाचवी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग पाचवी" },
  ],
  "6": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग सहावी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग सहावी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग सहावी" },
  ],
  "7": [
    { title: "Teaching Diary – Term 1", subtitle: "जून ते ऑक्टोबर | वर्ग सातवी" },
    { title: "Teaching Diary – Term 2", subtitle: "नोव्हेंबर ते मार्च | वर्ग सातवी" },
    { title: "Annual Teaching Summary", subtitle: "वार्षिक सारांश | वर्ग सातवी" },
  ],
};

/* ─── Generic Fallback Generator ─── */
const getDiaryDataForClass = (classId: string) => {
  if (classId === "1") {
    return parsedDiaryData.map(day => ({
      id: day.id,
      date: day.date || "",
      day: day.day || getMarathiDayName(day.date, ""),
      class: day.class || "पहिली",
      thought: "",
      dinvishesh: "",
      highlights: "",
      label: "टाचन बुक",
      highlightsTitle: "दिवसातील प्रमुख उपक्रम",
      signature1: "वर्गशिक्षक स्वाक्षरी",
      signature2: "मुख्याध्यापक स्वाक्षरी",
      periods: (day.periods || []).map((p: any) => ({
        period: p.period || "",
        class: p.class || day.class || "पहिली",
        subject: "",
        topic: "",
        outcome: "",
        experience: "",
        tools: "",
        materials: ""
      }))
    }));
  }
  const className = DIARY_CLASSES.find((c) => c.id === classId)?.mr || "";
  const standardSubjects = classId === "2"
    ? ["मराठी", "गणित", "इंग्रजी"]
    : ["3", "4"].includes(classId)
      ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
      : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    date: "",
    day: "",
    class: className.replace("इयत्ता ", ""),
    thought: "",
    highlights: "",
    dinvishesh: "",
    label: "टाचन बुक",
    highlightsTitle: "दिवसातील प्रमुख उपक्रम",
    signature1: "वर्गशिक्षक स्वाक्षरी",
    signature2: "मुख्याध्यापक स्वाक्षरी",
    periods: standardSubjects.map((sub, pIdx) => ({
      period: (pIdx + 1).toString(),
      class: className.replace("इयत्ता ", ""),
      subject: "",
      topic: "",
      outcome: "",
      experience: "",
      tools: "",
      materials: ""
    }))
  }));
};

/* ═══════════════ PAGE ═══════════════ */
function TeachingRecordPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editedData, setEditedData] = useState<any[]>([]);
  
  const [adminDiaryFile, setAdminDiaryFile] = useState<any | null>(null);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [showAdminPreview, setShowAdminPreview] = useState<boolean>(false);

  const classMapper: Record<string, string> = {
    "1": "Class 1",
    "2": "Class 2",
    "3": "Class 3",
    "4": "Class 4",
    "5": "Class 5",
    "6": "Class 6",
    "7": "Class 7",
    "8": "Class 8",
  };

  // Sync data on selectedClass change
  useEffect(() => {
    if (selectedClass) {
      const initialData = getDiaryDataForClass(selectedClass);
      setEditedData(initialData);
      const firstDate = initialData[0]?.date || "";
      setSelectedDate(firstDate);
      setSelectedMonth(firstDate ? getMonthFromDate(firstDate) : "All");
      setCurrentDayIndex(0);
    } else {
      setEditedData([]);
      setSelectedDate("");
      setSelectedMonth("All");
      setCurrentDayIndex(0);
    }
  }, [selectedClass]);

  useEffect(() => {
    setShowAdminPreview(false);
    if (selectedClass && selectedMonth && selectedDate) {
      const fetchAdminFile = async () => {
        setLoadingFile(true);
        try {
          const { collection, getDocs, query, where } = await import(
            "firebase/firestore"
          );
          const targetClassName = classMapper[selectedClass] || "";
          const q = query(
            collection(db, "admin_teaching_diaries"),
            where("className", "==", targetClassName),
            where("month", "==", selectedMonth)
          );
          const snapshot = await getDocs(q);
          const targetDayMonth = getStandardDayMonth(selectedDate);
          
          const matchedDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            return getStandardDayMonth(data.date) === targetDayMonth;
          });
          
          if (matchedDoc) {
            const fileData: any = {
              id: matchedDoc.id,
              ...matchedDoc.data(),
            };
            setAdminDiaryFile(fileData);
            
            // Automatically parse and populate file contents into the table cell format below
            setEditedData(prev => prev.map(day => {
              if (day.date === selectedDate) {
                const parsedContent = getMockParsedDataForClass(selectedClass, selectedDate, fileData.name);
                return {
                  ...day,
                  thought: day.thought || parsedContent.thought,
                  dinvishesh: day.dinvishesh || parsedContent.dinvishesh,
                  highlights: day.highlights || parsedContent.highlights,
                  periods: parsedContent.periods
                };
              }
              return day;
            }));
          } else {
            setAdminDiaryFile(null);
          }
        } catch (err) {
          console.error("Error fetching admin diary file:", err);
        } finally {
          setLoadingFile(false);
        }
      };
      fetchAdminFile();
    } else {
      setAdminDiaryFile(null);
    }
  }, [selectedClass, selectedMonth, selectedDate]);

  const files = selectedClass ? DIARY_FILES[selectedClass] || [] : [];
  
  // Filter day items
  const filteredDays = editedData.filter((day) => {
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = (
        day.thought?.toLowerCase().includes(query) ||
        day.date?.toLowerCase().includes(query) ||
        day.dinvishesh?.toLowerCase().includes(query) ||
        day.periods.some((p: any) => 
          p.subject?.toLowerCase().includes(query) || 
          p.topic?.toLowerCase().includes(query) ||
          p.outcome?.toLowerCase().includes(query)
        )
      );
    }

    let matchesMonth = true;
    if (selectedMonth && selectedMonth !== "All") {
      const dayMonth = getMonthFromDate(day.date);
      matchesMonth = (dayMonth === selectedMonth);
    }

    return matchesSearch && matchesMonth;
  });

  useEffect(() => {
    if (currentDayIndex >= filteredDays.length && filteredDays.length > 0) {
      setCurrentDayIndex(filteredDays.length - 1);
    }
  }, [filteredDays.length, currentDayIndex]);



  const activeDay = filteredDays[currentDayIndex] || null;

  useEffect(() => {
    if (activeDay?.date && activeDay.date !== selectedDate) {
      setSelectedDate(activeDay.date);
    }
  }, [activeDay, selectedDate]);

  const handleFieldChange = (dayId: number, field: string, value: string) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        return { ...day, [field]: value };
      }
      return day;
    }));
  };

  const handlePeriodFieldChange = (dayId: number, periodIdx: number, field: string, value: string) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        const updatedPeriods = day.periods.map((p: any, idx: number) => {
          if (idx === periodIdx) {
            return { ...p, [field]: value };
          }
          return p;
        });
        return { ...day, periods: updatedPeriods };
      }
      return day;
    }));
  };

  const addPeriod = (dayId: number) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        const nextPeriodNum = (day.periods.length + 1).toString();
        return {
          ...day,
          periods: [
            ...day.periods,
            {
              period: nextPeriodNum,
              subject: "",
              topic: "",
              outcome: "",
              experience: "",
              tools: "",
              materials: ""
            }
          ]
        };
      }
      return day;
    }));
  };

  const deletePeriod = (dayId: number, periodIdx: number) => {
    setEditedData(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          periods: day.periods.filter((_: any, idx: number) => idx !== periodIdx)
        };
      }
      return day;
    }));
  };

  const addDay = () => {
    const nextId = editedData.length > 0 ? Math.max(...editedData.map(d => d.id)) + 1 : 1;
    const className = DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr.replace("इयत्ता ", "") || "";
    const standardSubjects = selectedClass === "2"
      ? ["मराठी", "गणित", "इंग्रजी"]
      : ["3", "4"].includes(selectedClass || "")
        ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
        : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];

    const getMonthNum = (mName: string) => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const idx = monthNames.indexOf(mName);
      return idx !== -1 ? (idx + 1).toString().padStart(2, "0") : "";
    };

    const defaultDate = selectedMonth && selectedMonth !== "All"
      ? `01/${getMonthNum(selectedMonth)}/${new Date().getFullYear()}`
      : "";

    const newDay = {
      id: nextId,
      date: defaultDate,
      day: defaultDate ? getMarathiDayName(defaultDate, "") : "",
      class: className,
      thought: "",
      dinvishesh: "",
      highlights: "",
      label: "टाचन बुक",
      highlightsTitle: "दिवसातील प्रमुख उपक्रम",
      signature1: "वर्गशिक्षक स्वाक्षरी",
      signature2: "मुख्याध्यापक स्वाक्षरी",
      periods: standardSubjects.map((sub, pIdx) => ({
        period: (pIdx + 1).toString(),
        class: className,
        subject: "",
        topic: "",
        outcome: "",
        experience: "",
        tools: "",
        materials: ""
      }))
    };

    const updatedData = [...editedData, newDay];
    setEditedData(updatedData);

    if (defaultDate) {
      setSelectedDate(defaultDate);
      
      const nextFiltered = updatedData.filter((day) => {
        let matchesSearch = true;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          matchesSearch = (
            day.thought?.toLowerCase().includes(q) ||
            day.date?.toLowerCase().includes(q) ||
            day.dinvishesh?.toLowerCase().includes(q) ||
            day.periods.some((p: any) => 
              p.subject?.toLowerCase().includes(q) || 
              p.topic?.toLowerCase().includes(q) ||
              p.outcome?.toLowerCase().includes(q)
            )
          );
        }
        let matchesMonth = true;
        if (selectedMonth && selectedMonth !== "All") {
          const dayMonth = getMonthFromDate(day.date);
          matchesMonth = (dayMonth === selectedMonth);
        }
        return matchesSearch && matchesMonth;
      });

      const idx = nextFiltered.findIndex(d => d.date === defaultDate);
      if (idx !== -1) {
        setCurrentDayIndex(idx);
      }
    }
  };

  const deleteDay = (dayId: number) => {
    if (confirm("तुम्हाला खरोखर हा दिवस हटवायचा आहे का?")) {
      setEditedData(prev => prev.filter(d => d.id !== dayId));
      if (currentDayIndex >= editedData.length - 1) {
        setCurrentDayIndex(Math.max(0, editedData.length - 2));
      }
    }
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < filteredDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden">
        <TeacherHeader />
        <TeacherSidebar />
      </div>

      <main className="lg:pl-64 pt-16 min-h-screen print:pl-0 print:pt-0">
        <div className="p-4 sm:p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 print:p-0 print:max-w-full">
          
          <AnimatePresence mode="wait">
            {!viewingFile ? (
              <motion.div
                key="selection-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 print:hidden"
              >
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4B7BE5]/20 via-transparent to-purple-600/20" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#4B7BE5]/20 backdrop-blur-xl rounded-full border border-[#4B7BE5]/30 text-[#4B7BE5] text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="size-4.5" /> Teaching Command Center
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                      Teaching Diary / <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#4B7BE5] italic">टाचणवही</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                      Select your class level to view, manage, and download the daily lesson planning schedules. Complete with standard subjects, learning goals, and activities.
                    </p>
                  </div>
                </div>

                {/* ── Select Class ── */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                      Select Class / वर्ग निवडा
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {DIARY_CLASSES.map((cls) => {
                      const isSelected = selectedClass === cls.id;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            setSelectedClass(cls.id);
                            setCurrentDayIndex(0);
                            setViewingFile(`Teaching Diary — ${cls.en} (${cls.mr})`);
                          }}
                          className={`py-5 px-4 rounded-[2rem] font-black text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer text-center ${
                            isSelected
                              ? "bg-[#4B7BE5] text-white border-[#4B7BE5] shadow-lg scale-105"
                              : "bg-slate-50 text-slate-600 border-slate-100 hover:border-[#4B7BE5] hover:text-[#4B7BE5] hover:shadow-sm"
                          }`}
                        >
                          <span className="block">{cls.en}</span>
                          <span className="block mt-1 text-[10px] opacity-80 normal-case tracking-normal">{cls.mr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ── Interactive Lesson Diary Viewer Screen ── */
              <motion.div
                key="diary-viewer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Viewer Navigation / Controls Block */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-md print:hidden">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setViewingFile(null)}
                      className="size-11 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {viewingFile}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        {DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr}
                      </p>
                    </div>
                  </div>

                  {/* Day Navigation & Search */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="विषय / घटक शोधा..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentDayIndex(0);
                        }}
                        className="pl-11 pr-4 py-2.5 w-[200px] border border-slate-200 rounded-[2rem] text-xs font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#4B7BE5] transition-all"
                      />
                    </div>

                    {/* Date Picker Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        तारीख निवडा:
                      </span>
                      <input
                        type="date"
                        value={selectedDate ? formatDateToInput(selectedDate) : ""}
                        onChange={(e) => {
                          const inputVal = e.target.value;
                          if (inputVal) {
                            const formattedDate = formatDateFromInput(inputVal);
                            const dateMonth = getMonthFromDate(formattedDate);
                            setSelectedMonth(dateMonth);
                            setSelectedDate(formattedDate);
                            
                            const exists = editedData.some(d => d.date === formattedDate);
                            let updatedData = editedData;
                            if (!exists) {
                              const nextId = editedData.length > 0 ? Math.max(...editedData.map(d => d.id)) + 1 : 1;
                              const className = DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr.replace("इयत्ता ", "") || "";
                              const standardSubjects = selectedClass === "2"
                                ? ["मराठी", "गणित", "इंग्रजी"]
                                : ["3", "4"].includes(selectedClass || "")
                                  ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
                                  : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];

                              const newDay = {
                                id: nextId,
                                date: formattedDate,
                                day: getMarathiDayName(formattedDate, ""),
                                class: className,
                                thought: "",
                                dinvishesh: "",
                                highlights: "",
                                label: "टाचन बुक",
                                highlightsTitle: "दिवसातील प्रमुख उपक्रम",
                                signature1: "वर्गशिक्षक स्वाक्षरी",
                                signature2: "मुख्याध्यापक स्वाक्षरी",
                                periods: standardSubjects.map((sub, pIdx) => ({
                                  period: (pIdx + 1).toString(),
                                  class: className,
                                  subject: "",
                                  topic: "",
                                  outcome: "",
                                  experience: "",
                                  tools: "",
                                  materials: ""
                                }))
                              };
                              updatedData = [...editedData, newDay];
                              setEditedData(updatedData);
                            }
                            
                            const nextFiltered = updatedData.filter((day) => {
                              let matchesSearch = true;
                              if (searchQuery) {
                                const q = searchQuery.toLowerCase();
                                matchesSearch = (
                                  day.thought?.toLowerCase().includes(q) ||
                                  day.date?.toLowerCase().includes(q) ||
                                  day.dinvishesh?.toLowerCase().includes(q) ||
                                  day.periods.some((p: any) => 
                                    p.subject?.toLowerCase().includes(q) || 
                                    p.topic?.toLowerCase().includes(q) ||
                                    p.outcome?.toLowerCase().includes(q)
                                  )
                                );
                              }
                              let matchesMonth = true;
                              if (dateMonth && dateMonth !== "All") {
                                const dayMonth = getMonthFromDate(day.date);
                                matchesMonth = (dayMonth === dateMonth);
                              }
                              return matchesSearch && matchesMonth;
                            });
                            
                            const targetIdx = nextFiltered.findIndex(d => d.date === formattedDate);
                            if (targetIdx !== -1) {
                              setCurrentDayIndex(targetIdx);
                            }
                          }
                        }}
                        className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:border-[#4B7BE5] outline-none cursor-pointer"
                      />
                    </div>

                    {/* Month Selector dropdown */}
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        const monthVal = e.target.value;
                        setSelectedMonth(monthVal);
                        
                        if (monthVal !== "All") {
                          const existingDay = editedData.find(d => getMonthFromDate(d.date) === monthVal);
                          let targetDateStr = "";
                          let updatedData = editedData;
                          
                          if (existingDay) {
                            targetDateStr = existingDay.date;
                            setSelectedDate(targetDateStr);
                          } else {
                            let baseYear = new Date().getFullYear();
                            if (selectedDate) {
                              const parts = selectedDate.split("/");
                              if (parts.length === 3) {
                                const yr = parseInt(parts[2], 10);
                                const mo = parseInt(parts[1], 10);
                                if (!isNaN(yr)) {
                                  baseYear = mo < 6 ? yr - 1 : yr;
                                }
                              }
                            }
                            const monthNames = [
                              "January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"
                            ];
                            const monthNum = monthNames.indexOf(monthVal) + 1;
                            const finalYear = monthNum < 6 ? baseYear + 1 : baseYear;
                            targetDateStr = `01/${monthNum.toString().padStart(2, "0")}/${finalYear}`;
                            
                            setSelectedDate(targetDateStr);
                            
                            const nextId = editedData.length > 0 ? Math.max(...editedData.map(d => d.id)) + 1 : 1;
                            const className = DIARY_CLASSES.find((c) => c.id === selectedClass)?.mr.replace("इयत्ता ", "") || "";
                            const standardSubjects = selectedClass === "2"
                              ? ["मराठी", "गणित", "इंग्रजी"]
                              : ["3", "4"].includes(selectedClass || "")
                                ? ["मराठी", "गणित", "इंग्रजी", "परिसर अभ्यास १", "परिसर अभ्यास २"]
                                : ["मराठी", "गणित", "इंग्रजी", "हिंदी", "विज्ञान", "सामाजिक शास्त्र", "कला", "शा. शि."];
                            
                            const newDay = {
                              id: nextId,
                              date: targetDateStr,
                              day: getMarathiDayName(targetDateStr, ""),
                              class: className,
                              thought: "",
                              dinvishesh: "",
                              highlights: "",
                              label: "टाचन बुक",
                              highlightsTitle: "दिवसातील प्रमुख उपक्रम",
                              signature1: "वर्गशिक्षक स्वाक्षरी",
                              signature2: "मुख्याध्यापक स्वाक्षरी",
                              periods: standardSubjects.map((sub, pIdx) => ({
                                period: (pIdx + 1).toString(),
                                class: className,
                                subject: "",
                                topic: "",
                                outcome: "",
                                experience: "",
                                tools: "",
                                materials: ""
                              }))
                            };
                            updatedData = [...editedData, newDay];
                            setEditedData(updatedData);
                          }
                          
                          // Calculate the target index in nextFiltered
                          const nextFiltered = updatedData.filter((day) => {
                            let matchesSearch = true;
                            if (searchQuery) {
                              const q = searchQuery.toLowerCase();
                              matchesSearch = (
                                day.thought?.toLowerCase().includes(q) ||
                                day.date?.toLowerCase().includes(q) ||
                                day.dinvishesh?.toLowerCase().includes(q) ||
                                day.periods.some((p: any) => 
                                  p.subject?.toLowerCase().includes(q) || 
                                  p.topic?.toLowerCase().includes(q) ||
                                  p.outcome?.toLowerCase().includes(q)
                                )
                              );
                            }
                            let matchesMonth = true;
                            if (monthVal && monthVal !== "All") {
                              const dayMonth = getMonthFromDate(day.date);
                              matchesMonth = (dayMonth === monthVal);
                            }
                            return matchesSearch && matchesMonth;
                          });
                          
                          const targetIdx = nextFiltered.findIndex(d => d.date === targetDateStr);
                          if (targetIdx !== -1) {
                            setCurrentDayIndex(targetIdx);
                          } else {
                            setCurrentDayIndex(0);
                          }
                        } else {
                          setCurrentDayIndex(0);
                        }
                      }}
                      className="py-2.5 px-4 border border-slate-200 rounded-[2rem] text-xs font-bold bg-white focus:outline-none focus:border-[#4B7BE5]"
                    >
                      <option value="All">सर्व महिने (All Months)</option>
                      <option value="June">जून (June)</option>
                      <option value="July">जुलै (July)</option>
                      <option value="August">ऑगस्ट (August)</option>
                      <option value="September">सप्टेंबर (September)</option>
                      <option value="October">ऑक्टोबर (October)</option>
                      <option value="November">नोव्हेंबर (November)</option>
                      <option value="December">डिसेंबर (December)</option>
                      <option value="January">जानेवारी (January)</option>
                      <option value="February">फेब्रुवारी (February)</option>
                      <option value="March">मार्च (March)</option>
                      <option value="April">एप्रिल (April)</option>
                      <option value="May">मे (May)</option>
                    </select>

                    {/* Day Browsing Buttons */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={handlePrevDay}
                        disabled={currentDayIndex === 0}
                        className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={handleNextDay}
                        disabled={currentDayIndex === filteredDays.length - 1}
                        className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </div>

                    {/* Add Day Button */}
                    <button
                      onClick={addDay}
                      className="h-10 px-4 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      <Plus className="size-4" /> Add Day
                    </button>

                    {/* Delete Day Button */}
                    {activeDay && (
                      <button
                        onClick={() => deleteDay(activeDay.id)}
                        className="h-10 px-4 bg-rose-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-4" /> Delete Day
                      </button>
                    )}

                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="h-10 px-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Printer className="size-4" /> Print / PDF
                    </button>
                  </div>
                </div>

                {/* Main Diary Sheet (Notebook style matching user format) */}
                {activeDay ? (
                  <div className="bg-white border-2 border-black rounded-[1.5rem] p-8 max-w-[1200px] mx-auto relative overflow-hidden print:border-2 print:border-black print:shadow-none print:bg-white print:p-8 print:rounded-[1.5rem] print:max-w-full font-sans">
                    
                    {/* Dynamic Title */}
                    <div className="text-center mb-4">
                      <input
                        type="text"
                        value={viewingFile || ""}
                        onChange={(e) => setViewingFile(e.target.value)}
                        className="w-full text-center text-3xl font-black tracking-tight text-black bg-transparent border-none outline-none focus:bg-slate-50/50 print:border-none"
                      />
                    </div>

                    <div className="space-y-6">
                      
                      {/* Top Date, day, and Center Label Row */}
                      <div className="flex items-center justify-between border-t-2 border-b-2 border-black py-4 px-6 mb-6">
                        <div className="text-[#3b82f6] text-[18px] font-black flex items-center gap-1.5">
                          <span>तारीख :</span>
                          <input
                            type="date"
                            value={activeDay.date ? formatDateToInput(activeDay.date) : ""}
                            onChange={(e) => {
                              const newDate = formatDateFromInput(e.target.value);
                              if (newDate) {
                                handleFieldChange(activeDay.id, "date", newDate);
                                const newDayName = getMarathiDayName(newDate, "");
                                handleFieldChange(activeDay.id, "day", newDayName);
                                setSelectedDate(newDate);
                                const dateMonth = getMonthFromDate(newDate);
                                if (dateMonth && dateMonth !== selectedMonth) {
                                  setSelectedMonth(dateMonth);
                                }
                              }
                            }}
                            className="bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none w-44 px-1 text-[#3b82f6] font-black focus:bg-blue-50/30 print:hidden"
                          />
                          <span className="hidden print:inline text-[#3b82f6] font-black">
                            {activeDay.date}
                          </span>
                        </div>
                        
                        <div className="bg-white text-black text-md font-black uppercase tracking-wider px-4 py-1.5 border-2 border-black flex items-center justify-center min-w-[140px]">
                          <input
                            type="text"
                            value={activeDay.label || "टाचन बुक"}
                            onChange={(e) => handleFieldChange(activeDay.id, "label", e.target.value)}
                            className="bg-transparent border-none outline-none text-center font-black text-black w-full text-md uppercase focus:bg-slate-50/50"
                          />
                        </div>
                        
                        <div className="text-[#3b82f6] text-[18px] font-black flex items-center gap-1.5">
                          <span>दिवस :</span>
                          <input
                            type="text"
                            value={activeDay.day || getMarathiDayName(activeDay.date, "")}
                            onChange={(e) => handleFieldChange(activeDay.id, "day", e.target.value)}
                            className="bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none w-32 px-1 text-[#3b82f6] font-black focus:bg-blue-50/30 print:border-none"
                          />
                        </div>
                      </div>

                      {/* Today's Thought & Dinvishesh Section */}
                      <div className="space-y-3 mb-6 px-4">
                        <div className="text-[#1A1A1A] text-[15px] font-black flex items-center gap-2 flex-wrap">
                          <span className="text-blue-900 font-extrabold flex-shrink-0">आजचा सुविचार : </span>
                          <input
                            type="text"
                            value={activeDay.thought || ""}
                            onChange={(e) => handleFieldChange(activeDay.id, "thought", e.target.value)}
                            className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none flex-1 min-w-[250px] font-bold text-[#0f172a] focus:bg-slate-50/30 print:border-none"
                          />
                        </div>
                        <div className="text-[#1A1A1A] text-[15px] font-black flex items-center gap-2 flex-wrap">
                          <span className="text-blue-900 font-extrabold flex-shrink-0">आजचा दिनविशेष : </span>
                          <input
                            type="text"
                            value={activeDay.dinvishesh || ""}
                            onChange={(e) => handleFieldChange(activeDay.id, "dinvishesh", e.target.value)}
                            className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none flex-1 min-w-[250px] font-bold text-[#0f172a] focus:bg-slate-50/30 print:border-none"
                          />
                        </div>
                      </div>

                      {/* Admin Uploaded Diary File Attachment & Preview Card */}
                      {adminDiaryFile && (
                        <div className="mx-4 mb-6 space-y-4 print:hidden animate-fade-in">
                          {/* Metadata Card */}
                          <div className="p-4 sm:p-5 bg-[#F5F8FF] border border-[#E0E7FF] rounded-3xl md:rounded-full flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 flex-shrink-0">
                                <FileText className="size-6" />
                              </div>
                              <div>
                                <div className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest">
                                  OFFICIAL ADMIN DIARY / अधिकृत दैनिक टाचणवही
                                </div>
                                <div className="text-base font-bold text-slate-800 mt-0.5 truncate max-w-[250px] sm:max-w-md md:max-w-lg" title={adminDiaryFile.name}>
                                  {adminDiaryFile.name}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                  SIZE: {adminDiaryFile.size ? adminDiaryFile.size.toUpperCase() : "N/A"} • DATE: {adminDiaryFile.date}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setShowAdminPreview(!showAdminPreview)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                                  showAdminPreview
                                    ? "bg-[#6C63FF] border border-[#6C63FF] text-white hover:bg-[#5b52e0]"
                                    : "bg-white border border-slate-200 text-slate-700 hover:text-[#6C63FF] hover:border-[#6c63ff]/30"
                                }`}
                              >
                                <Eye className="size-4" /> {showAdminPreview ? "HIDE / लपवा" : "VIEW / पहा"}
                              </button>
                              <a
                                href={adminDiaryFile.url}
                                download={adminDiaryFile.name}
                                className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-emerald-600 hover:border-emerald-250/30 hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                              >
                                <Download className="size-4" /> DOWNLOAD / डाउनलोड
                              </a>
                            </div>
                          </div>

                          {/* Inline Preview Section */}
                          <AnimatePresence>
                            {showAdminPreview && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden w-full"
                              >
                                <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-slate-50 mt-4 w-full">
                                  <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                      <Eye className="size-4 text-[#6C63FF]" />
                                      अधिकृत दैनिक टाचणवही पूर्वावलोकन (Preview)
                                    </span>
                                  </div>
                                  <div className="p-4 flex items-center justify-center min-h-[400px]">
                                    {adminDiaryFile.type.includes("pdf") || adminDiaryFile.name.endsWith(".pdf") ? (
                                      <iframe
                                        src={adminDiaryFile.url}
                                        className="w-full h-[600px] border-0 rounded-2xl bg-white"
                                        title="Admin Diary PDF Preview"
                                      />
                                    ) : adminDiaryFile.type.includes("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(adminDiaryFile.name) ? (
                                      <img
                                        src={adminDiaryFile.url}
                                        alt="Admin Diary Preview"
                                        className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-sm border border-slate-200"
                                      />
                                    ) : (
                                      <div className="text-center p-8 space-y-4">
                                        <FileText className="size-16 text-slate-400 mx-auto" />
                                        <div className="space-y-1">
                                          <p className="text-sm font-black text-slate-800">
                                            थेट पूर्वावलोकन उपलब्ध नाही (Preview Not Available)
                                          </p>
                                          <p className="text-xs text-slate-550 font-bold">
                                            सदर फाईल Word (.docx) किंवा इतर स्वरूपात असल्यामुळे ब्राउझरमध्ये थेट दाखवता येत नाही.
                                          </p>
                                        </div>
                                        <a
                                          href={adminDiaryFile.url}
                                          download={adminDiaryFile.name}
                                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C63FF] hover:bg-[#5b52e0] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer font-sans"
                                        >
                                          <Download className="size-4" /> फाईल डाउनलोड करा
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Daily Lessons Table Grid */}
                      <div className="overflow-x-auto border-2 border-black rounded-2xl bg-white shadow-sm">
                        <table className="min-w-full border-collapse">
                          <thead className="bg-slate-50 text-blue-950">
                            <tr className="border-b-2 border-black">
                              <th className="px-3 py-3 text-center text-xs font-black border-r-2 border-black w-[60px]">तास</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[150px]">वर्ग / विषय</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[180px]">अध्याय समस्या / धडा उद्दीष्ट</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[180px]">अभ्यासाच्या अनुभवाचे स्वरूप</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[120px]">साधन तंत्र</th>
                              <th className="px-3 py-3 text-left text-xs font-black border-r-2 border-black w-[120px]">आवश्यक साहित्य</th>
                              <th className="px-3 py-3 text-left text-xs font-black">परिणाम / निष्कर्ष</th>
                              <th className="px-1 py-3 text-center text-xs font-black print:hidden w-12 border-l-2 border-black">कृती</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {activeDay.periods.length > 0 ? (
                              activeDay.periods.map((period: any, pIdx: number) => (
                                <tr key={pIdx} className="border-b border-black last:border-b-0 hover:bg-slate-50 transition-all">
                                  <td className="px-2 py-2 text-center text-xs font-black border-r-2 border-black text-slate-800">
                                    <input
                                      type="text"
                                      value={period.period || ""}
                                      onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "period", e.target.value)}
                                      className="bg-transparent border-none outline-none w-full text-center text-xs font-black text-slate-800 focus:bg-slate-100/50"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-black border-r-2 border-black text-slate-900">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        value={period.class || activeDay.class || ""}
                                        onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "class", e.target.value)}
                                        className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none w-14 text-xs font-black text-slate-750 text-right print:border-none focus:bg-slate-50/50"
                                      />
                                      <span className="text-slate-400 text-xs font-bold">/</span>
                                      <input
                                        type="text"
                                        value={period.subject || ""}
                                        onChange={(e) => handlePeriodFieldChange(activeDay.id, pIdx, "subject", e.target.value)}
                                        className="bg-transparent border-b border-slate-200 focus:border-slate-500 outline-none w-full min-w-[50px] text-xs font-black text-slate-900 print:border-none focus:bg-slate-50/50"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-bold border-r-2 border-black text-slate-850">
                                    <textarea
                                      value={period.topic || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "topic", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-800 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.experience || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "experience", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.tools || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "tools", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium border-r-2 border-black text-slate-600">
                                    <textarea
                                      value={period.materials || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "materials", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-left text-xs font-medium text-slate-600 leading-relaxed border-r-2 border-black md:border-r-0">
                                    <textarea
                                      value={period.outcome || ""}
                                      onChange={(e) => {
                                        handlePeriodFieldChange(activeDay.id, pIdx, "outcome", e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                      }}
                                      ref={(el) => {
                                        if (el) {
                                          el.style.height = "auto";
                                          el.style.height = el.scrollHeight + "px";
                                        }
                                      }}
                                      className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-600 resize-none leading-relaxed focus:bg-slate-100/30 overflow-hidden"
                                      rows={2}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center print:hidden border-l-2 border-black">
                                    <button
                                      onClick={() => deletePeriod(activeDay.id, pIdx)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                      title="तासिका काढून टाका"
                                    >
                                      <Trash2 className="size-4.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-5 py-12 text-center text-xs font-bold text-slate-400">
                                  या दिवसासाठी कोणतेही तासिका नियोजन उपलब्ध नाही.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Period Button */}
                      <div className="flex justify-start print:hidden">
                        <button
                          onClick={() => addPeriod(activeDay.id)}
                          className="px-6 py-3 bg-[#4B7BE5] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-[#3563C9] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="size-4" /> Add Period / तासिका जोडा
                        </button>
                      </div>

                      {/* bottom Box - Days Activities */}
                      <div className="border-2 border-black rounded-3xl mt-6 overflow-hidden bg-white">
                        <div className="border-b-2 border-black py-3 text-center text-md font-black text-blue-900 bg-slate-50">
                          <input
                            type="text"
                            value={activeDay.highlightsTitle || "दिवसातील प्रमुख उपक्रम"}
                            onChange={(e) => handleFieldChange(activeDay.id, "highlightsTitle", e.target.value)}
                            className="bg-transparent border-none outline-none text-center font-black text-blue-900 w-full text-md focus:bg-slate-50/50"
                          />
                        </div>
                        <textarea
                          value={activeDay.highlights || ""}
                          onChange={(e) => {
                            handleFieldChange(activeDay.id, "highlights", e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = el.scrollHeight + "px";
                            }
                          }}
                          className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-700 p-6 leading-relaxed resize-none focus:bg-slate-50/50 overflow-hidden"
                          rows={3}
                          placeholder="शाळेत आज विविध अध्ययन पूरक उपक्रमांचे यशस्वी आयोजन करण्यात आले. सर्व विद्यार्थ्यांनी उत्साहाने सहभाग घेतला."
                        />
                      </div>

                      {/* Signatures Row */}
                      <div className="flex justify-between items-center mt-8 px-6 pt-6 print:mt-12">
                        <div className="text-center">
                          <div className="w-40 border-b border-black mb-2" />
                          <input
                            type="text"
                            value={activeDay.signature1 || "वर्गशिक्षक स्वाक्षरी"}
                            onChange={(e) => handleFieldChange(activeDay.id, "signature1", e.target.value)}
                            className="bg-transparent border-none outline-none text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-40 focus:bg-slate-50/50"
                          />
                        </div>
                        <div className="text-center">
                          <div className="w-40 border-b border-black mb-2" />
                          <input
                            type="text"
                            value={activeDay.signature2 || "मुख्याध्यापक स्वाक्षरी"}
                            onChange={(e) => handleFieldChange(activeDay.id, "signature2", e.target.value)}
                            className="bg-transparent border-none outline-none text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-40 focus:bg-slate-50/50"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-md">
                    <p className="text-sm font-bold text-slate-400">तुमच्या शोध संज्ञेनुसार एकही नोंद सापडली नाही.</p>
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
