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
  Download,
  FolderX,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import parsedDiaryData from "./parsed_diary.json";
import { showToast as toast } from "@/lib/custom-toast";
import { db } from "@/lib/firebase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parse } from "date-fns";

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

const getDayFromDate = (dateStr: string) => {
  if (!dateStr) return "";
  const cleanStr = toEnglishDigits(dateStr);
  const parts = cleanStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    if (parts[0].length === 4) {
      return parts[2].padStart(2, "0");
    } else {
      return parts[0].padStart(2, "0");
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
  const [isDateFocus, setIsDateFocus] = useState<boolean>(false);
  const [showDiary, setShowDiary] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  const isPdf =
    adminDiaryFile?.type?.includes("pdf") ||
    adminDiaryFile?.name?.endsWith(".pdf") ||
    (adminDiaryFile?.url && (
      adminDiaryFile.url.startsWith("data:application/pdf") ||
      adminDiaryFile.url.startsWith("data:application/octet-stream;base64,JVBERi")
    ));

  const isImage =
    adminDiaryFile?.type?.includes("image") ||
    adminDiaryFile?.name?.match(/\.(png|jpe?g|gif|webp)$/i) ||
    (adminDiaryFile?.url && adminDiaryFile.url.startsWith("data:image/"));

  useEffect(() => {
    setDocxHtml(null);
    if (adminDiaryFile?.url) {
      if (adminDiaryFile.url.startsWith("data:")) {
        try {
          let type = adminDiaryFile.type || "application/pdf";
          if (isPdf) {
            type = "application/pdf";
          } else if (isImage) {
            const ext = adminDiaryFile.name?.split('.').pop() || "png";
            type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          }
          const base64Data = adminDiaryFile.url;
          const base64Clean = base64Data.split(",")[1] || base64Data;
          const byteCharacters = atob(base64Clean);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          if (!isPdf && !isImage && (adminDiaryFile.name?.endsWith(".docx") || adminDiaryFile.type?.includes("document"))) {
            import("mammoth").then(mammoth => {
              mammoth.convertToHtml({ arrayBuffer: byteArray.buffer as ArrayBuffer })
                .then(result => {
                  setDocxHtml(result.value);
                })
                .catch(err => {
                  console.error("Error converting DOCX with mammoth:", err);
                });
            });
          }

          const blob = new Blob([byteArray], { type });
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);

          return () => {
            URL.revokeObjectURL(url);
          };
        } catch (err) {
          console.error("Error creating Blob URL:", err);
          setBlobUrl(null);
        }
      } else {
        setBlobUrl(adminDiaryFile.url);
      }
    } else {
      setBlobUrl(null);
    }
  }, [adminDiaryFile, isPdf, isImage]);

  const handleDownloadFile = () => {
    if (!blobUrl || !adminDiaryFile) {
      toast.error("No teaching diary file available to download.");
      return;
    }
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", blobUrl);
    downloadAnchor.setAttribute("download", adminDiaryFile.name || `teaching_diary_class_${selectedClass}_${selectedDate.replace(/\//g, "-")}.pdf`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClassChange = (clsId: string) => {
    setSelectedClass(clsId);
    setCurrentDayIndex(0);
    const cls = DIARY_CLASSES.find((c) => c.id === clsId);
    if (cls) {
      setViewingFile(`Teaching Diary — ${cls.en} (${cls.mr})`);
    }
    setShowDiary(false);
  };

  const handleDateChange = (date: Date) => {
    const formattedDate = format(date, "dd/MM/yyyy");
    setSelectedDate(formattedDate);
    setSelectedMonth(getMonthFromDate(formattedDate));
    
    // Check if date exists in editedData
    const dateExists = editedData.some(d => d.date === formattedDate);
    if (!dateExists) {
      const targetClassName = classMapper[selectedClass || "1"] || "";
      const newDay = {
        id: Math.max(...editedData.map(d => d.id), 0) + 1,
        date: formattedDate,
        day: getMarathiDayName(formattedDate, ""),
        class: targetClassName.replace("Class ", ""),
        thought: "",
        highlights: "",
        dinvishesh: "",
        label: "टाचन बुक",
        highlightsTitle: "दिवसातील प्रमुख उपक्रम",
        signature1: "वर्गशिक्षक स्वाक्षरी",
        signature2: "मुख्याध्यापक स्वाक्षरी",
        periods: Array.from({ length: 8 }, (_, idx) => ({
          period: (idx + 1).toString(),
          class: targetClassName.replace("Class ", ""),
          subject: "",
          topic: "",
          outcome: "",
          experience: "",
          tools: "",
          materials: ""
        }))
      };
      const updatedData = [newDay, ...editedData];
      setEditedData(updatedData);
      setCurrentDayIndex(0);
    } else {
      const index = editedData.findIndex(d => d.date === formattedDate);
      if (index !== -1) {
        setCurrentDayIndex(index);
      }
    }
  };

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

  // Sync data on selectedClass change and load the latest uploaded diary if it exists
  useEffect(() => {
    if (selectedClass) {
      const initialData = getDiaryDataForClass(selectedClass);
      
      const fetchAllAdminDiaries = async () => {
        try {
          const { collection, getDocs, query, where } = await import(
            "firebase/firestore"
          );
          const targetClassName = classMapper[selectedClass] || "";
          const q = query(
            collection(db, "admin_teaching_diaries"),
            where("className", "==", targetClassName)
          );
          const snapshot = await getDocs(q);
          const uploadedDiaries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];
          
          if (uploadedDiaries.length > 0) {
            const parseDateStr = (dateStr: string) => {
              if (!dateStr) return new Date(0);
              const parts = dateStr.split("/");
              if (parts.length === 3) {
                return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
              }
              return new Date(0);
            };
            
            uploadedDiaries.sort((a, b) => parseDateStr(b.date).getTime() - parseDateStr(a.date).getTime());
            const latestDiary = uploadedDiaries[0];
            
            const dateExists = initialData.some(d => d.date === latestDiary.date);
            if (!dateExists && latestDiary.date) {
              const newDay = {
                id: Math.max(...initialData.map(d => d.id), 0) + 1,
                date: latestDiary.date,
                day: getMarathiDayName(latestDiary.date, ""),
                class: targetClassName.replace("Class ", ""),
                thought: "",
                highlights: "",
                dinvishesh: "",
                label: "टाचन बुक",
                highlightsTitle: "दिवसातील प्रमुख उपक्रम",
                signature1: "वर्गशिक्षक स्वाक्षरी",
                signature2: "मुख्याध्यापक स्वाक्षरी",
                periods: Array.from({ length: 8 }, (_, idx) => ({
                  period: (idx + 1).toString(),
                  class: targetClassName.replace("Class ", ""),
                  subject: "",
                  topic: "",
                  outcome: "",
                  experience: "",
                  tools: "",
                  materials: ""
                }))
              };
              initialData.unshift(newDay);
            }
            
            setEditedData(initialData);
            setSelectedDate(latestDiary.date);
            setSelectedMonth(latestDiary.month || getMonthFromDate(latestDiary.date));
            
            const index = initialData.findIndex(d => d.date === latestDiary.date);
            if (index !== -1) {
              setCurrentDayIndex(index);
            }
          } else {
            setEditedData(initialData);
            const firstDate = initialData[0]?.date || "";
            setSelectedDate(firstDate);
            setSelectedMonth(firstDate ? getMonthFromDate(firstDate) : "All");
            setCurrentDayIndex(0);
          }
        } catch (err) {
          console.error("Error fetching all admin diaries:", err);
          setEditedData(initialData);
          const firstDate = initialData[0]?.date || "";
          setSelectedDate(firstDate);
          setSelectedMonth(firstDate ? getMonthFromDate(firstDate) : "All");
          setCurrentDayIndex(0);
        }
      };
      
      fetchAllAdminDiaries();
    } else {
      setEditedData([]);
      setSelectedDate("");
      setSelectedMonth("All");
      setCurrentDayIndex(0);
    }
  }, [selectedClass]);

  useEffect(() => {
    setShowAdminPreview(false);
    if (selectedClass && selectedDate) {
      const fetchAdminFile = async () => {
        setLoadingFile(true);
        try {
          const { collection, getDocs, query, where } = await import(
            "firebase/firestore"
          );
          const targetClassName = classMapper[selectedClass] || "";
          const q = query(
            collection(db, "admin_teaching_diaries"),
            where("className", "==", targetClassName)
          );
          const snapshot = await getDocs(q);
          const targetDayMonth = getStandardDayMonth(selectedDate);
          const targetDay = getDayFromDate(selectedDate);
          const targetMonthName = getMonthFromDate(selectedDate);
          
          const matchedDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            if (getStandardDayMonth(data.date) === targetDayMonth) {
              return true;
            }
            const docDay = getDayFromDate(data.date);
            const docMonth = data.month || getMonthFromDate(data.date);
            return docDay === targetDay && docMonth?.toLowerCase() === targetMonthName?.toLowerCase();
          });
          
          if (matchedDoc) {
            setAdminDiaryFile({
              id: matchedDoc.id,
              ...matchedDoc.data(),
            });
          } else {
            setAdminDiaryFile(null);
          }
        } catch (err) {
          console.error("Error fetching admin diary file:", err);
          setAdminDiaryFile(null);
        } finally {
          setLoadingFile(false);
        }
      };
      fetchAdminFile();
    } else {
      setAdminDiaryFile(null);
    }
  }, [selectedClass, selectedDate]);

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
        <div className="p-4 sm:p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 print:p-0 print:max-w-full font-sans">
          
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
                      Select your class level to view, manage, and download the daily lesson planning schedules. Complete with uploaded teaching diaries.
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
                            setShowDiary(false);
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
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedClass(null);
                        setViewingFile(null);
                        setShowDiary(false);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer mr-2 flex items-center justify-center border border-slate-200"
                      title="Back to Class List"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] min-w-max">
                      GRADE:
                    </span>
                    <select
                      value={selectedClass || ""}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer mr-2"
                    >
                      {DIARY_CLASSES.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.en} ({cls.mr})
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] min-w-max">
                      DATE:
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[140px] mr-2">
                          <span>{selectedDate || "DD/MM/YYYY"}</span>
                          <Calendar className="size-4 text-slate-400" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50">
                        <CalendarComponent
                          mode="single"
                          selected={
                            selectedDate
                              ? parse(selectedDate, "dd/MM/yyyy", new Date())
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              handleDateChange(date);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <button
                      onClick={() => setShowDiary(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-indigo-100"
                    >
                      <Eye className="size-4" /> View
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadFile}
                    disabled={!showDiary || !blobUrl}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                      showDiary && blobUrl
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Download className="size-4" /> {isPdf ? "Download PDF" : "Download File"}
                  </button>
                </div>

                {/* Main Diary Sheet (PDF/Image Previewer) */}
                {!showDiary ? (
                  /* Prompt to Click View */
                  <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm print:hidden">
                    <div className="size-16 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
                      <BookOpen className="size-8" />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        Ready to View Teaching Diary
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Select a class grade and click the "View" button above to display the teaching diary.
                      </p>
                    </div>
                  </div>
                ) : loadingFile ? (
                  <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm print:hidden">
                    <div className="size-12 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                      Fetching Teaching Diary...
                    </p>
                  </div>
                ) : blobUrl ? (
                  <div className="border border-slate-200 rounded-[2.5rem] overflow-hidden bg-white shadow-sm p-4 flex items-center justify-center min-h-[600px]">
                    {isPdf ? (
                      <iframe
                        src={blobUrl}
                        className="w-full h-[850px] rounded-2xl border border-slate-200/50"
                        title="Class Teaching Diary PDF"
                      />
                    ) : isImage ? (
                      <img
                        src={blobUrl}
                        alt="Class Teaching Diary"
                        className="max-w-full max-h-[850px] object-contain rounded-2xl border border-slate-250 bg-white"
                      />
                    ) : docxHtml ? (
                      <div
                        className="p-8 w-full max-h-[850px] overflow-auto prose prose-sm prose-slate max-w-none"
                        style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
                        dangerouslySetInnerHTML={{ __html: docxHtml }}
                      />
                    ) : (
                      <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                        <Loader2 className="size-6 animate-spin text-indigo-500" />
                        <p className="text-sm font-bold">
                          Loading document preview...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-[#4B7BE5] gap-4 shadow-sm">
                    <div className="size-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                      <FolderX className="size-8" />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                        No Teaching Diary Uploaded
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed text-center">
                        No teaching diary file has been uploaded for Class {selectedClass} on {selectedDate}. Please check again later.
                      </p>
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
