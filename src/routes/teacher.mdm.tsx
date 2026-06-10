import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import {
  Utensils,
  Save,
  Loader2,
  Calendar,
  ClipboardList,
  Package,
  Users,
  FileSpreadsheet,
  Plus,
  Trash2,
  Sparkles,
  Check,
  ChevronRight,
  Apple,
  TrendingUp,
  Activity,
  ArrowUpRight,
  FileText,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { DICTIONARY } from "@/lib/translations";

export const Route = createFileRoute("/teacher/mdm")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: search.tab as string | undefined,
  }),
  component: TeacherMDMPage,
});

const DEFAULT_WEEKLY_MENU = [
  {
    day: "Monday",
    dayMr: "सोमवार",
    dish: "Varan Bhaat (Rice & Lentils)",
    dishMr: "वरण भात",
    calories: "450 kcal",
  },
  {
    day: "Tuesday",
    dayMr: "मंगळवार",
    dish: "Masala Bhaat (Spiced Rice)",
    dishMr: "मसाला भात",
    calories: "480 kcal",
  },
  {
    day: "Wednesday",
    dayMr: "बुधवार",
    dish: "Moong Usal & Rice (Sprouts & Rice)",
    dishMr: "मूग उसळ व भात",
    calories: "510 kcal",
  },
  {
    day: "Thursday",
    dayMr: "गुरुवार",
    dish: "Soyabean Bhaat",
    dishMr: "सोयाबीन भात",
    calories: "490 kcal",
  },
  {
    day: "Friday",
    dayMr: "शुक्रवार",
    dish: "Dal Khichdi",
    dishMr: "डाळ खिचडी",
    calories: "460 kcal",
  },
  {
    day: "Saturday",
    dayMr: "शनिवार",
    dish: "Sweet Lapshi / Kheer",
    dishMr: "गोड लापशी / खीर",
    calories: "530 kcal",
  },
];

const DEFAULT_STOCK = [
  {
    item: "Rice",
    itemMr: "तांदूळ",
    unit: "kg",
    opening: 450,
    added: 200,
    consumed: 120,
    closing: 530,
  },
  {
    item: "Pulses (Dal)",
    itemMr: "डाळ",
    unit: "kg",
    opening: 120,
    added: 50,
    consumed: 35,
    closing: 135,
  },
  {
    item: "Sprouted Moong",
    itemMr: "मूग",
    unit: "kg",
    opening: 80,
    added: 40,
    consumed: 28,
    closing: 92,
  },
  {
    item: "Soyabean Blocks",
    itemMr: "सोयाबीन वडी",
    unit: "kg",
    opening: 40,
    added: 20,
    consumed: 15,
    closing: 45,
  },
  {
    item: "Cooking Oil",
    itemMr: "गोडेतेल",
    unit: "liter",
    opening: 65,
    added: 30,
    consumed: 18,
    closing: 77,
  },
  {
    item: "Salt & Spices",
    itemMr: "मीठ व मसाले",
    unit: "kg",
    opening: 25,
    added: 10,
    consumed: 6,
    closing: 29,
  },
];

const DEFAULT_HELPERS = [
  {
    id: "1",
    name: "Sunita Devidas Shinde",
    role: "Chief Cook",
    roleMr: "मुख्य स्वयंपाकी",
    status: "Active",
    attendance: "24/26 Days",
  },
  {
    id: "2",
    name: "Rekha Ramchandra Patil",
    role: "Assistant Cook",
    roleMr: "मदतनीस स्वयंपाकी",
    status: "Active",
    attendance: "25/26 Days",
  },
];

function TeacherMDMPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const EMAIL_TO_UDISE_MAP: Record<string, string> = {
    "payal123@gmail.com": "223344556677",
    "sakshipatil151107@gmail.com": "22255588663399",
    "samuda12@gmail.com": "225588996633",
    "sakshi456@gmail.com": "2233445566",
    "ompatil151107@gmail.com": "22556644882233",
    "om123@gmail.com": "229988776655",
    "abhi12@gmail.com": "22334455",
    "palashborgave0@gmail.com": "11115554856",
    "sanu12@gmail.com": "225544669987",
    "palash12@gmail.com": "22334455667788",
    "sanu123@gmail.com": "225566331144",
    "sam123@gmail.com": "2233445566",
    "palash123@gmail.com": "22334455667788",
  };

  const getUdise = () => {
    if (profile?.udise) return profile.udise;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("teacher_udise");
      if (stored) return stored;
    }
    if (user?.email && EMAIL_TO_UDISE_MAP[user.email]) {
      return EMAIL_TO_UDISE_MAP[user.email];
    }
    return "default";
  };

  const { lang } = useLanguage();
  const t_global = DICTIONARY[lang];
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<string>("quantity");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const TABS = [
    { id: "quantity", label: t_global.mdm_quantity, icon: Activity },
    { id: "menu", label: t_global.mdm_menu, icon: ClipboardList },
    { id: "incoming", label: t_global.mdm_incoming, icon: Package },
    { id: "daily-reg", label: t_global.mdm_daily_reg, icon: Calendar },
    { id: "stock", label: t_global.mdm_stock_now, icon: Package },
    { id: "demand", label: t_global.mdm_demand, icon: FileText },
    { id: "annual-report", label: t_global.mdm_annual_report, icon: FileSpreadsheet },
    { id: "monthly-report", label: t_global.mdm_monthly_report, icon: TrendingUp },
  ];

  useEffect(() => {
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Data States
  const [dailyRecord, setDailyRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    selectedClass: "Primary (1-5)",
    totalPresent: 45,
    mealsServed: 43,
    todaysMenu: "मूग उसळ व भात",
    eggBananaCount: 43,
    remarks: "सर्व अन्न ताजे आणि स्वच्छ बनवले होते.",
  });

  const [weeklyMenu, setWeeklyMenu] = useState(DEFAULT_WEEKLY_MENU);
  const [stockInventory, setStockInventory] = useState(DEFAULT_STOCK);
  const [helpers, setHelpers] = useState(DEFAULT_HELPERS);
  const [newHelper, setNewHelper] = useState({
    name: "",
    role: "Assistant Cook",
    roleMr: "मदतनीस स्वयंपाकी",
  });

  // Daily Register Reports States
  const [showRiceReportModal, setShowRiceReportModal] = useState(false);
  const [showDailyRegisterReportModal, setShowDailyRegisterReportModal] =
    useState(false);
  const [registerRecords, setRegisterRecords] = useState<
    Record<
      string,
      {
        enrolled: string;
        beneficiary: string;
        menu?: string;
        selectedItems?: Record<string, boolean>;
        eggBananaCount?: number | string;
      }
    >
  >({});

  // Monthly & Annual Report States
  const [monthlyReportMonth, setMonthlyReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyReportYear, setMonthlyReportYear] = useState<number>(new Date().getFullYear());
  const [monthlyReportClass, setMonthlyReportClass] = useState<string>("1 To 5");
  
  const [annualReportYear, setAnnualReportYear] = useState<string>("2025-26");
  const [annualReportClass, setAnnualReportClass] = useState<string>("1 To 5");
  const [onlyShowActualMonthly, setOnlyShowActualMonthly] = useState<boolean>(false);
  const [onlyShowActualAnnual, setOnlyShowActualAnnual] = useState<boolean>(false);


  const getRegisterMonthYear = () => {
    if (!registerDate) return t("मे २०२६", "May 2026", "मई 2026");
    const d = new Date(registerDate);
    if (!isNaN(d.getTime())) {
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthsMr = [
        "जानेवारी",
        "फेब्रुवारी",
        "मार्च",
        "एप्रिल",
        "मे",
        "जून",
        "जुलै",
        "ऑगस्ट",
        "सप्टेंबर",
        "ऑक्टोबर",
        "नोव्हेंबर",
        "डिसेंबर",
      ];
      const monthsHi = [
        "जनवरी",
        "फरवरी",
        "मार्च",
        "अप्रैल",
        "मई",
        "जून",
        "जुलाई",
        "अगस्त",
        "सितंबर",
        "अक्टूबर",
        "नवंबर",
        "दिसंबर",
      ];
      const monthsEn = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return t(
        `${monthsMr[m]} ${y}`,
        `${monthsEn[m]} ${y}`,
        `${monthsHi[m]} ${y}`,
      );
    }
    return t("मे २०२६", "May 2026", "मई 2026");
  };

  const getDaysInRegisterMonth = () => {
    if (!registerDate) return [];
    const dateObj = new Date(registerDate);
    if (isNaN(dateObj.getTime())) return [];
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysList = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthStr = monthNames[month];
    for (let i = 1; i <= numDays; i++) {
      const dayStr = i.toString().padStart(2, "0");
      daysList.push({
        srNo: i,
        dateFormatted: `${dayStr}-${monthStr}-${year}`,
        dateISO: `${year}-${(month + 1).toString().padStart(2, "0")}-${dayStr}`,
      });
    }
    return daysList;
  };

  // Food Menu States
  const [menuDay, setMenuDay] = useState("Select Day");
  const [menuType, setMenuType] = useState("Select Menu");
  const [selectedMenuItems, setSelectedMenuItems] = useState<
    Record<string, boolean>
  >({
    Rice: false,
    Mugdal: false,
    Turdal: false,
    Masurdal: false,
    Matki: false,
    Moong: false,
    Cowpea: false,
    Gram: false,
    Pease: false,
    Mustard: false,
    Cumin: false,
    Turmeric: false,
    Oil: false,
    Salt: false,
    "Onion Garlic Masala": false,
    "Garam Masala": false,
    Chili: false,
    Vegetables: false,
    "Milk-Milk Powder": false,
    "Sugar-Jaggery": false,
    "Soyabean Wadi": false,
    "Ragi Satva": false,
  });
  const [menuRecords, setMenuRecords] = useState<
    Record<string, { menu: string; selectedItems: Record<string, boolean> }>
  >({
    "2. Tuesday": {
      menu: "Vegetable Pulav",
      selectedItems: { Masurdal: true, Mugdal: true, Rice: true, Turdal: true },
    },
  });
  const [showMenuReportModal, setShowMenuReportModal] = useState(false);

  const DAYS_OPTIONS = [
    { value: "1. Monday", label: "1. Monday", week: "first-third" },
    { value: "2. Tuesday", label: "2. Tuesday", week: "first-third" },
    { value: "3. Wednesday", label: "3. Wednesday", week: "first-third" },
    { value: "4. Thursday", label: "4. Thursday", week: "first-third" },
    { value: "5. Friday", label: "5. Friday", week: "first-third" },
    { value: "6. Saturday", label: "6. Saturday", week: "first-third" },
    { value: "7. Monday", label: "7. Monday", week: "second-fourth" },
    { value: "8. Tuesday", label: "8. Tuesday", week: "second-fourth" },
    { value: "9. Wednesday", label: "9. Wednesday", week: "second-fourth" },
    { value: "10. Thursday", label: "10. Thursday", week: "second-fourth" },
    { value: "11. Friday", label: "11. Friday", week: "second-fourth" },
    { value: "12. Saturday", label: "12. Saturday", week: "second-fourth" },
  ];

  const stripDayNumber = (dayStr: string) => {
    return dayStr.replace(/^\d+\.\s*/, "");
  };

  const getDayOfWeekKeyForDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const dayOfMonth = d.getDate(); // 1 to 31
    // Week 1: days 1-7, Week 2: days 8-14, Week 3: days 15-21, Week 4+: days 22-31
    const weekNum = Math.ceil(dayOfMonth / 7);
    const isSecondOrFourth = weekNum === 2 || weekNum >= 4;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[d.getDay()];
    if (dayName === "Sunday") return "";

    const dayOffsets: Record<string, number> = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const baseOffset = isSecondOrFourth ? 6 : 0;
    const dayNum = dayOffsets[dayName];
    if (!dayNum) return "";

    return `${baseOffset + dayNum}. ${dayName}`;
  };

  const getMenuForRegisterDate = (dateStr: string) => {
    if (!dateStr) return "No Menu Available";

    // 1. Check if saved in daily register record
    const savedRecord = registerRecords ? registerRecords[dateStr] : undefined;
    if (savedRecord && savedRecord.menu) {
      return savedRecord.menu;
    }

    // 2. Fall back to weekly configured menu
    const dayKey = getDayOfWeekKeyForDate(dateStr);
    if (
      dayKey &&
      menuRecords &&
      menuRecords[dayKey] &&
      menuRecords[dayKey].menu &&
      menuRecords[dayKey].menu !== "Select Menu"
    ) {
      return menuRecords[dayKey].menu;
    }

    // 3. Fall back to simple day search
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = days[d.getDay()];
      const matchKey = Object.keys(menuRecords || {}).find((key) =>
        key.toLowerCase().endsWith(dayName.toLowerCase()),
      );
      if (
        matchKey &&
        menuRecords &&
        menuRecords[matchKey].menu &&
        menuRecords[matchKey].menu !== "Select Menu"
      ) {
        return menuRecords[matchKey].menu;
      }
    }

    return "No Menu Available";
  };

  const getSelectedItemsForRegisterDate = (dateStr: string) => {
    if (!dateStr) return null;

    // 1. Check saved register record
    const savedRecord = registerRecords ? registerRecords[dateStr] : undefined;
    if (savedRecord && savedRecord.selectedItems) {
      return savedRecord.selectedItems;
    }

    // 2. Fall back to weekly configured menu
    const dayKey = getDayOfWeekKeyForDate(dateStr);
    if (
      dayKey &&
      menuRecords &&
      menuRecords[dayKey] &&
      menuRecords[dayKey].selectedItems
    ) {
      return menuRecords[dayKey].selectedItems;
    }

    // 3. Fall back to simple day search
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = days[d.getDay()];
      const matchKey = Object.keys(menuRecords || {}).find((key) =>
        key.toLowerCase().endsWith(dayName.toLowerCase()),
      );
      if (matchKey && menuRecords && menuRecords[matchKey].selectedItems) {
        return menuRecords[matchKey].selectedItems;
      }
    }

    return null;
  };

  const getRegisterMenuForDay = (dayName: string) => {
    if (!dayName) return "No Menu Available";
    const matchKey = Object.keys(menuRecords || {}).find((key) =>
      key.toLowerCase().endsWith(dayName.toLowerCase()),
    );
    if (
      matchKey &&
      menuRecords &&
      menuRecords[matchKey].menu &&
      menuRecords[matchKey].menu !== "Select Menu"
    ) {
      return menuRecords[matchKey].menu;
    }
    return "No Menu Available";
  };

  const handleMenuDayChange = (selectedDay: string) => {
    setMenuDay(selectedDay);
    if (selectedDay && selectedDay !== "Select Day") {
      const record = menuRecords[selectedDay];
      if (record) {
        setMenuType(record.menu);
        setSelectedMenuItems(record.selectedItems || {});
      } else {
        setMenuType("Select Menu");
        setSelectedMenuItems({
          Rice: false,
          Mugdal: false,
          Turdal: false,
          Masurdal: false,
          Matki: false,
          Moong: false,
          Cowpea: false,
          Gram: false,
          Pease: false,
          Mustard: false,
          Cumin: false,
          Turmeric: false,
          Oil: false,
          Salt: false,
          "Onion Garlic Masala": false,
          "Garam Masala": false,
          Chili: false,
          Vegetables: false,
          "Milk-Milk Powder": false,
          "Sugar-Jaggery": false,
          "Soyabean Wadi": false,
          "Ragi Satva": false,
        });
      }
    }
  };

  // Incoming Entry States
  const [incomingYear, setIncomingYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [incomingMonth, setIncomingMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [incomingClass, setIncomingClass] = useState("1 To 5");
  const [incomingQuantities, setIncomingQuantities] = useState<
    Record<string, string>
  >({
    Rice: "",
    Mugdal: "",
    Turdal: "",
    Masurdal: "",
    Matki: "",
    Moong: "",
    Cowpea: "",
    Gram: "",
    Pease: "",
    Cumin: "",
    Mustard: "",
    Turmeric: "",
    Chili: "",
    Oil: "",
    Salt: "",
    "Onion Garlic Masala": "",
    "Garam Masala": "",
    Vegetables: "",
    "Milk-Milk Powder": "",
    "Sugar-Jaggery": "",
    "Soyabean Wadi": "",
    "Ragi Satva": "",
  });
  const [incomingRecords, setIncomingRecords] = useState<
    Record<string, Record<string, string>>
  >({});
  const [showIncomingReportModal, setShowIncomingReportModal] = useState(false);
  const [stockRecordsHistory, setStockRecordsHistory] = useState<
    Record<
      string,
      {
        item: string;
        prev: number;
        received: number;
        cookedDays: number;
        beneficiary: number;
        used: number;
      }[]
    >
  >({});

  // Current Stock States
  const [stockYear, setStockYear] = useState("2025");
  const [showStockReportModal, setShowStockReportModal] = useState(false);
  const [stockRecords, setStockRecords] = useState([
    {
      item: "Rice",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Mugdal",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Turdal",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Masurdal",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Matki",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Moong",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Cowpea",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Gram",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Pease",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Cumin",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Mustard",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Turmeric",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Chili",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Oil",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Salt",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Onion Garlic Masala",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Garam Masala",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Vegetables",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Milk-Milk Powder",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Sugar-Jaggery",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Soyabean Wadi",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
    {
      item: "Ragi Satva",
      prev: 0,
      received: 0,
      cookedDays: 0,
      beneficiary: 0,
      used: 0,
    },
  ]);

  const handleStockRecordChange = (
    index: number,
    field: string,
    value: number,
  ) => {
    const updated = [...stockRecords];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setStockRecords(updated);
  };
  const [stockMonth, setStockMonth] = useState("May");
  const [stockClass, setStockClass] = useState("1 To 5");
  const [showStockTable, setShowStockTable] = useState(true);

  // Daily Register States
  const [registerDate, setRegisterDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [registerClass, setRegisterClass] = useState("Select Class");
  const [registerDay, setRegisterDay] = useState("");
  const [registerBeneficiary, setRegisterBeneficiary] = useState("");

  // Demand States
  const [demandFromDate, setDemandFromDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [demandToDate, setDemandToDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [demandContent, setDemandContent] = useState("Select content");
  const [demandQty, setDemandQty] = useState("");
  const [demandRecords, setDemandRecords] = useState<
    { id: string; date: string; content: string; quantity: string }[]
  >([]);
  const [showDemandReportModal, setShowDemandReportModal] = useState(false);
  const [showEggBananaReportModal, setShowEggBananaReportModal] =
    useState(false);

  // Egg & Banana States
  const [eggBananaDate, setEggBananaDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [eggBananaRemark, setEggBananaRemark] = useState("");
  const [eggBeneficiary15, setEggBeneficiary15] = useState("0");
  const [eggBeneficiary68, setEggBeneficiary68] = useState("0");
  const [bananaBeneficiary15, setBananaBeneficiary15] = useState("0");
  const [bananaBeneficiary68, setBananaBeneficiary68] = useState("0");
  const [eggBananaRecords, setEggBananaRecords] = useState<
    {
      id: string;
      date: string;
      egg15: number;
      egg68: number;
      banana15: number;
      banana68: number;
      remark: string;
    }[]
  >([]);

  // Taste Report States
  const [tasteMonth, setTasteMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );
  const [tasteYear, setTasteYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [tasteRows, setTasteRows] = useState<
    {
      day: number;
      timeLoading: string;
      foodDistTime: string;
      todaysMenu: string;
      tasterName: string;
      comment: string;
      signature: string;
    }[]
  >(
    Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      timeLoading: "",
      foodDistTime: "",
      todaysMenu: "",
      tasterName: "",
      comment: "",
      signature: "",
    })),
  );

  useEffect(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIdx = months.indexOf(tasteMonth);
    if (monthIdx === -1) return;

    const chiefCook =
      helpers.find((h) => h.role === "Chief Cook")?.name || "Sunita Shinde";

    setTasteRows((prevRows) => {
      const updated = prevRows.map((row) => {
        const dateISO = `${tasteYear}-${(monthIdx + 1).toString().padStart(2, "0")}-${row.day.toString().padStart(2, "0")}`;
        const autoMenu = getMenuForRegisterDate(dateISO);

        const todaysMenu =
          row.todaysMenu || (autoMenu !== "No Menu Available" ? autoMenu : "");
        const timeLoading = row.timeLoading || "11:30 AM";
        const foodDistTime = row.foodDistTime || "12:30 PM";
        const tasterName = row.tasterName || chiefCook;
        const comment = row.comment || "अन्न ताजे, स्वच्छ आणि चवदार होते.";
        const signature = row.signature || "S. S.";

        return {
          ...row,
          todaysMenu,
          timeLoading,
          foodDistTime,
          tasterName,
          comment,
          signature,
        };
      });

      if (JSON.stringify(prevRows) === JSON.stringify(updated)) {
        return prevRows;
      }
      return updated;
    });
  }, [tasteMonth, tasteYear, registerRecords, helpers]);

  // BMI Report States
  const [bmiClass, setBmiClass] = useState("Select Class");
  const [showQuantityReportModal, setShowQuantityReportModal] = useState(false);
  const [bmiRows, setBmiRows] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      srNo: i + 1,
      name: "",
      june: { weight: "", height: "", bmi: "" },
      september: { weight: "", height: "", bmi: "" },
      december: { weight: "", height: "", bmi: "" },
      march: { weight: "", height: "", bmi: "" },
    })),
  );

  const handleBmiRowChange = (
    index: number,
    month: "name" | "june" | "september" | "december" | "march",
    field: "weight" | "height" | "bmi" | "",
    value: string,
  ) => {
    const newRows = [...bmiRows];
    if (month === "name") {
      newRows[index].name = value;
    } else {
      newRows[index][month][field as "weight" | "height" | "bmi"] = value;
    }
    setBmiRows(newRows);
  };

  // Quantity Tab States & Logic
  const [qtyClass, setQtyClass] = useState("1-5");
  const [qtyContent, setQtyContent] = useState("");
  const [qtyAmount, setQtyAmount] = useState("");

  const INITIAL_QUANTITY_TAB_RULES = [
    { item: "Chili", qty15: "0.0008", qty68: "0.0007" },
    { item: "Cowpea", qty15: "20", qty68: "30" },
    { item: "Cumin", qty15: "0.0003", qty68: "0.0005" },
    { item: "Garam Masala", qty15: "0.0004", qty68: "0.0006" },
    { item: "Gram", qty15: "20", qty68: "30" },
    { item: "Masurdal", qty15: "20", qty68: "30" },
    { item: "Matki", qty15: "20", qty68: "30" },
    { item: "Milk-Milk Powder", qty15: "", qty68: "" },
    { item: "Moong", qty15: "20", qty68: "30" },
    { item: "Mugdal", qty15: "20", qty68: "30" },
    { item: "Mustard", qty15: "0.0003", qty68: "0.0005" },
    { item: "Oil", qty15: "0.005495", qty68: "0.008242" },
    { item: "Onion Garlic Masala", qty15: "0.0006", qty68: "0.0007" },
    { item: "Pease", qty15: "20", qty68: "30" },
    { item: "Ragi Satva", qty15: "", qty68: "" },
    { item: "Rice", qty15: "100", qty68: "150" },
    { item: "Salt", qty15: "0.0003", qty68: "0.0005" },
    { item: "Soyabean Wadi", qty15: "", qty68: "" },
    { item: "Sugar-Jaggery", qty15: "", qty68: "" },
    { item: "Turdal", qty15: "20", qty68: "30" },
    { item: "Turmeric", qty15: "0.0004", qty68: "0.0006" },
    { item: "Vegetables", qty15: "60", qty68: "75" },
    { item: "Expenses", qty15: "5.45", qty68: "8.17" },
  ];

  const [quantityRules, setQuantityRules] = useState(
    INITIAL_QUANTITY_TAB_RULES,
  );

  const handleQuantityClassChange = (selectedClass: string) => {
    setQtyClass(selectedClass);
    if (qtyContent) {
      const rule = quantityRules.find(
        (r) => r.item.toLowerCase() === qtyContent.toLowerCase(),
      );
      if (rule) {
        const val = selectedClass === "1-5" ? rule.qty15 : rule.qty68;
        setQtyAmount(val);
      }
    }
  };

  const handleQuantityContentChange = (selectedContent: string) => {
    setQtyContent(selectedContent);
    if (selectedContent) {
      const rule = quantityRules.find(
        (r) => r.item.toLowerCase() === selectedContent.toLowerCase(),
      );
      if (rule) {
        const val = qtyClass === "1-5" ? rule.qty15 : rule.qty68;
        setQtyAmount(val);
      } else {
        setQtyAmount("");
      }
    } else {
      setQtyAmount("");
    }
  };

  const handleUpdateQuantityRule = async () => {
    if (!user) return;
    if (!qtyContent) {
      toast.warning(
        t("कृपया धान्य सामग्री निवडा.", "Please select grain content first."),
      );
      return;
    }
    if (!qtyAmount || isNaN(Number(qtyAmount))) {
      toast.warning(
        t(
          "कृपया वैध प्रमाण प्रविष्ट करा.",
          "Please enter a valid quantity amount.",
        ),
      );
      return;
    }

    setSaving(true);
    try {
      const udise = getUdise();
      const updatedRules = quantityRules.map((r) => {
        if (r.item.toLowerCase() === qtyContent.toLowerCase()) {
          return {
            ...r,
            qty15: qtyClass === "1-5" ? qtyAmount : r.qty15,
            qty68: qtyClass === "6-8" ? qtyAmount : r.qty68,
          };
        }
        return r;
      });
      setQuantityRules(updatedRules);

      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          quantityTabRules: updatedRules,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );

      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t(
          "प्रमाण अद्ययावत करण्यात अडचण आली.",
          "Failed to update quantity rule",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const QUANTITY_RULES = [
    { item: "Rice", qty15: 100, qty68: 150 },
    { item: "Turdal", qty15: 20, qty68: 30 },
    { item: "Mugdal", qty15: 20, qty68: 25 },
    { item: "Masurdal", qty15: 1000, qty68: 1200 },
    { item: "Matki", qty15: 21, qty68: 25 },
    { item: "Moong", qty15: 20, qty68: 25 },
    { item: "Cowpea", qty15: 20, qty68: 25 },
    { item: "Gram", qty15: 10, qty68: 15 },
    { item: "Pease", qty15: 20, qty68: 25 },
    { item: "Cumin", qty15: 0.2, qty68: 0.3 },
    { item: "Mustard", qty15: 0.0003, qty68: 0.0005 },
    { item: "Turmeric", qty15: 0.0004, qty68: 0.0006 },
    { item: "Chili", qty15: 10, qty68: 15 },
    { item: "Oil", qty15: 0.005495, qty68: 0.0075 },
    { item: "Salt", qty15: 0.0003, qty68: 0.0005 },
    { item: "Onion Garlic Masala", qty15: 0.0008, qty68: 0.001 },
    { item: "Garam Masala", qty15: 0.0004, qty68: 0.0006 },
    { item: "Vegetables", qty15: 10, qty68: 15 },
  ];

  useEffect(() => {
    if (registerDate) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const d = new Date(registerDate);
      if (!isNaN(d.getTime())) {
        setRegisterDay(days[d.getDay()]);
      }
    }
  }, [registerDate]);

  useEffect(() => {
    if (dailyRecord.date) {
      const dayKey = getDayOfWeekKeyForDate(dailyRecord.date);
      if (
        dayKey &&
        menuRecords &&
        menuRecords[dayKey] &&
        menuRecords[dayKey].menu &&
        menuRecords[dayKey].menu !== "Select Menu"
      ) {
        setDailyRecord((prev) => {
          if (prev.todaysMenu !== menuRecords[dayKey].menu) {
            return {
              ...prev,
              todaysMenu: menuRecords[dayKey].menu,
            };
          }
          return prev;
        });
      }
    }
  }, [dailyRecord.date, menuRecords]);

  const getDailyRegisterRows = () => {
    if (
      registerClass === "Select Class" ||
      !registerBeneficiary ||
      isNaN(Number(registerBeneficiary))
    ) {
      return [
        { item: "", qty: "", beneficiary: "", total: "" },
        { item: "", qty: "", beneficiary: "", total: "" },
        { item: "", qty: "", beneficiary: "", total: "" },
      ];
    }
    const bene = Number(registerBeneficiary);
    const isPrimary = registerClass === "1 To 5";
    const selectedItems = getSelectedItemsForRegisterDate(registerDate);

    return quantityRules.map((rule) => {
      const isItemSelected = selectedItems ? !!selectedItems[rule.item] : true;
      const qtyStr = isPrimary ? rule.qty15 : rule.qty68;
      const qty = isItemSelected ? Number(qtyStr) || 0 : 0;

      // Convert to grams: if stored in kg (< 1), multiply by 1000 to get grams
      const qtyInGrams = qty > 0 ? (qty < 1 ? qty * 1000 : qty) : 0;
      const total = qtyInGrams * bene;

      return {
        item: rule.item,
        qty: qtyInGrams > 0 ? Number(qtyInGrams.toFixed(6)).toString() : "0",
        beneficiary: bene.toString(),
        total: total > 0 ? Number(total.toFixed(6)).toString() : "0",
      };
    });
  };

  const t = (mr: string, en: string, hi: string = "") => {
    if (lang === "mr") return mr;
    if (lang === "hi") return hi || mr;
    return en;
  };

  const getItemTranslationKey = (item: string) => {
    const mapping: Record<string, string> = {
      Rice: "mdm_item_rice",
      Mugdal: "mdm_item_mugdal",
      Turdal: "mdm_item_turdal",
      Masurdal: "mdm_item_masurdal",
      Matki: "mdm_item_matki",
      Moong: "mdm_item_moong",
      Cowpea: "mdm_item_cowpea",
      Gram: "mdm_item_gram",
      Pease: "mdm_item_pease",
      Mustard: "mdm_item_mustard",
      Cumin: "mdm_item_cumin",
      Turmeric: "mdm_item_turmeric",
      Oil: "mdm_item_oil",
      Salt: "mdm_item_salt",
      "Onion Garlic Masala": "mdm_item_onion_garlic",
      "Garam Masala": "mdm_item_garam_masala",
      Chili: "mdm_item_chili",
      Vegetables: "mdm_item_veg",
      "Milk-Milk Powder": "mdm_item_milk",
      "Sugar-Jaggery": "mdm_item_sugar",
      "Soyabean Wadi": "mdm_item_soyabean",
      "Ragi Satva": "mdm_item_ragi",
    };
    return mapping[item] || item;
  };

  const getTranslatedItem = (item: string) => {
    const key = getItemTranslationKey(item);
    return (t_global as any)[key] || item;
  };

  const getTranslatedMenu = (menuName: string) => {
    const menus: Record<string, { mr: string; en: string; hi: string }> = {
      "Vegetable Pulav": {
        mr: "व्हेज पुलाव",
        en: "Vegetable Pulav",
        hi: "वेज पुलाव",
      },
      "Masala Rice": { mr: "मसाला भात", en: "Masala Rice", hi: "मसाला चावल" },
      "Matar Pulav": { mr: "मटार पुलाव", en: "Matar Pulav", hi: "मटर पुलाव" },
      "Mungdal Khichadi": {
        mr: "मूग डाळ खिचडी",
        en: "Mungdal Khichadi",
        hi: "मूंगदाल खिचड़ी",
      },
      "Cowpea Khichadi": {
        mr: "चवळी उसळ व भात",
        en: "Cowpea Khichadi",
        hi: "लोबिया खिचड़ी",
      },
      "Chana Pulav": { mr: "चणा पुलाव", en: "Chana Pulav", hi: "चना पुलाव" },
      "Soyabin Pulav": {
        mr: "सोयाबीन पुलाव",
        en: "Soyabin Pulav",
        hi: "सोयाबीन पुलाव",
      },
      "Masuri Pulav": {
        mr: "मसुरी पुलाव",
        en: "Masuri Pulav",
        hi: "मसुरी पुलाव",
      },
      "Egg Pulav": { mr: "अंडी पुलाव", en: "Egg Pulav", hi: "अंडा पुलाव" },
      "Sprouted Matki Usal": {
        mr: "मोड आलेली मटकी उसळ",
        en: "Sprouted Matki Usal",
        hi: "अंकुरित मटकी उसल",
      },
      "Sweet Khichadi": {
        mr: "गोड खिचडी",
        en: "Sweet Khichadi",
        hi: "मीठी खिचड़ी",
      },
      "Mug Shevaga Varan Bhat": {
        mr: "मूग शेवगा वरण भात",
        en: "Mug Shevaga Varan Bhat",
        hi: "मूंग सहजन वरण भात",
      },
      "Rice pudding": {
        mr: "तांदळाची खीर",
        en: "Rice pudding",
        hi: "चावल की खीर",
      },
      "ragi porridge": {
        mr: "नाचणीची पेज",
        en: "Ragi porridge",
        hi: "रागी दलिया",
      },
      "Sprouted pulses": {
        mr: "मोड आलेली कडधान्ये",
        en: "Sprouted pulses",
        hi: "अंकुरित अनाज",
      },
      Other: { mr: "इतर", en: "Other", hi: "अन्य" },
    };
    const m = menus[menuName];
    if (!m) return menuName;
    return t(m.mr, m.en, m.hi);
  };

  const getTranslatedDay = (dayStr: string) => {
    const daysMap: Record<string, { mr: string; en: string; hi: string }> = {
      Monday: { mr: "सोमवार", en: "Monday", hi: "सोमवार" },
      Tuesday: { mr: "मंगळवार", en: "Tuesday", hi: "मंगलवार" },
      Wednesday: { mr: "बुधवार", en: "Wednesday", hi: "बुधवार" },
      Thursday: { mr: "गुरुवार", en: "Thursday", hi: "गुरुवार" },
      Friday: { mr: "शुक्रवार", en: "Friday", hi: "शुक्रवार" },
      Saturday: { mr: "शनिवार", en: "Saturday", hi: "शनिवार" },
      Sunday: { mr: "रविवार", en: "Sunday", hi: "रविवार" },
    };
    const match = dayStr.match(/^(\d+\.\s*)(.*)$/);
    if (match) {
      const prefix = match[1];
      const name = match[2];
      const d = daysMap[name];
      if (d) return prefix + t(d.mr, d.en, d.hi);
    }
    const d = daysMap[dayStr];
    if (d) return t(d.mr, d.en, d.hi);
    return dayStr;
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/mdm", role: "teacher" } as any,
        });
        return;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (
      incomingYear !== "Select Year" &&
      incomingMonth !== "Select Month" &&
      incomingClass !== "Select Class"
    ) {
      const recordKey = `${incomingYear}_${incomingMonth}_${incomingClass}`;
      if (incomingRecords && incomingRecords[recordKey]) {
        setIncomingQuantities(incomingRecords[recordKey]);
      } else {
        setIncomingQuantities({
          Rice: "",
          Mugdal: "",
          Turdal: "",
          Masurdal: "",
          Matki: "",
          Moong: "",
          Cowpea: "",
          Gram: "",
          Pease: "",
          Cumin: "",
          Mustard: "",
          Turmeric: "",
          Chili: "",
          Oil: "",
          Salt: "",
          "Onion Garlic Masala": "",
          "Garam Masala": "",
          Vegetables: "",
          "Milk-Milk Powder": "",
          "Sugar-Jaggery": "",
          "Soyabean Wadi": "",
          "Ragi Satva": "",
        });
      }
    } else {
      setIncomingQuantities({
        Rice: "",
        Mugdal: "",
        Turdal: "",
        Masurdal: "",
        Matki: "",
        Moong: "",
        Cowpea: "",
        Gram: "",
        Pease: "",
        Cumin: "",
        Mustard: "",
        Turmeric: "",
        Chili: "",
        Oil: "",
        Salt: "",
        "Onion Garlic Masala": "",
        "Garam Masala": "",
        Vegetables: "",
        "Milk-Milk Powder": "",
        "Sugar-Jaggery": "",
        "Soyabean Wadi": "",
        "Ragi Satva": "",
      });
    }
  }, [incomingYear, incomingMonth, incomingClass, incomingRecords]);

  // ─── Stock Calculation Helpers ────────────────────────────────────────────

  // Returns "YYYY_MonthName_ClassName" key for the month before the given one
  const getPreviousMonthKey = (
    monthName: string,
    yearStr: string,
    classStr: string,
  ): string => {
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const idx = MONTHS.indexOf(monthName);
    if (idx === -1) return "";
    const prevIdx = idx === 0 ? 11 : idx - 1;
    const prevYear = idx === 0 ? Number(yearStr) - 1 : Number(yearStr);
    return `${prevYear}_${MONTHS[prevIdx]}_${classStr}`;
  };

  // Returns total kg consumed for an item in a given month from Daily Register logs
  const getUsedForMonth = (
    monthName: string,
    yearStr: string,
    classStr: string,
    itemName: string,
  ): number => {
    let totalUsed = 0;
    const isPrimary = classStr === "1 To 5";

    Object.keys(registerRecords || {}).forEach((dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;

      const recYear = d.getFullYear().toString();
      const recMonth = d.toLocaleString("default", { month: "long" });
      if (
        recYear !== yearStr ||
        recMonth.toLowerCase() !== monthName.toLowerCase()
      )
        return;

      const record = registerRecords[dateStr];
      const bene = Number(record.beneficiary) || 0;
      if (bene === 0) return;

      // Only count this item if it was actively selected/used that day
      const wasSelected = record.selectedItems
        ? !!record.selectedItems[itemName]
        : false;
      if (!wasSelected) return;

      const rule = quantityRules.find(
        (r) => r.item.toLowerCase() === itemName.toLowerCase(),
      );
      if (!rule) return;

      const qtyStr = isPrimary ? rule.qty15 : rule.qty68;
      const qty = Number(qtyStr) || 0; // qty is already in kg (e.g. 0.1 kg = 100 g)
      if (qty <= 0) return;

      // If qty >= 1, the rule is stored in grams → convert to kg; otherwise already in kg
      const qtyKg = qty >= 1 ? qty / 1000 : qty;
      totalUsed += qtyKg * bene;
    });

    return Number(totalUsed.toFixed(6));
  };

  // Returns the opening (previous month closing) balance for an item.
  // Looks up history chain up to 12 months back, never reads current month's saved prev.
  const getOpeningStock = (
    monthName: string,
    yearStr: string,
    classStr: string,
    itemName: string,
    depth = 0,
  ): number => {
    if (depth > 12) return 0;

    const prevKey = getPreviousMonthKey(monthName, yearStr, classStr);
    if (!prevKey) return 0;

    // Split correctly: key format is "YYYY_MonthName_ClassName" where ClassName may contain spaces
    // So split only on first two underscores
    const firstUnderscore = prevKey.indexOf("_");
    const secondUnderscore = prevKey.indexOf("_", firstUnderscore + 1);
    if (firstUnderscore === -1 || secondUnderscore === -1) return 0;

    const prevYear = prevKey.substring(0, firstUnderscore);
    const prevMonth = prevKey.substring(firstUnderscore + 1, secondUnderscore);
    const prevClass = prevKey.substring(secondUnderscore + 1);

    // Does a saved history snapshot exist for the previous month?
    const prevSaved = stockRecordsHistory[prevKey];
    if (prevSaved) {
      const prevItem = prevSaved.find((r) => r.item === itemName);
      if (prevItem) {
        const closing =
          (Number(prevItem.prev) || 0) +
          (Number(prevItem.received) || 0) -
          (Number(prevItem.used) || 0);
        return Math.max(0, Number(closing.toFixed(6)));
      }
    }

    // No saved snapshot → calculate previous month's closing on the fly
    const prevOpening = getOpeningStock(
      prevMonth,
      prevYear,
      prevClass,
      itemName,
      depth + 1,
    );
    const prevKeyData = incomingRecords[prevKey] || {};
    const prevReceived = Number(prevKeyData[itemName]) || 0;
    const prevUsed = getUsedForMonth(prevMonth, prevYear, prevClass, itemName);
    const closing = prevOpening + prevReceived - prevUsed;
    return Math.max(0, Number(closing.toFixed(6)));
  };

  // ─── Reactive Stock Recalculation ─────────────────────────────────────────
  useEffect(() => {
    if (
      stockYear === "Select Year" ||
      stockMonth === "Select Month" ||
      stockClass === "Select Class"
    )
      return;

    const recordKey = `${stockYear}_${stockMonth}_${stockClass}`;
    const incomingData = incomingRecords[recordKey] || {};
    const isPrimary = stockClass === "1 To 5";

    setStockRecords((prevRecords) => {
      const updated = prevRecords.map((item) => {
        // ── 1. Received this month (from Incoming Entry tab) ────────────────
        const received = Number(incomingData[item.item]) || 0;

        // ── 2. Previous month closing stock (carry-forward chain) ───────────
        const prev = getOpeningStock(
          stockMonth,
          stockYear,
          stockClass,
          item.item,
        );

        // ── 3. Used this month (from Daily Register + Quantity Rules + Menu) ─
        let totalUsedKg = 0;
        let cookedDays = 0;
        let benefSum = 0;
        const seenDates = new Set<string>();

        Object.keys(registerRecords || {}).forEach((dateStr) => {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return;

          const recYear = d.getFullYear().toString();
          const recMonth = d.toLocaleString("default", { month: "long" });
          if (
            recYear !== stockYear ||
            recMonth.toLowerCase() !== stockMonth.toLowerCase()
          )
            return;

          const record = registerRecords[dateStr];
          const bene = Number(record.beneficiary) || 0;

          // Count cooked days & total beneficiaries (once per date)
          if (bene > 0 && !seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            cookedDays++;
            benefSum += bene;
          }

          // Only count this item if it was used this day
          const wasSelected = record.selectedItems
            ? !!record.selectedItems[item.item]
            : false;
          if (!wasSelected || bene === 0) return;

          const rule = quantityRules.find(
            (r) => r.item.toLowerCase() === item.item.toLowerCase(),
          );
          if (!rule) return;

          const qtyStr = isPrimary ? rule.qty15 : rule.qty68;
          const qty = Number(qtyStr) || 0;
          if (qty <= 0) return;

          // qty >= 1 means value is stored in grams → convert to kg
          const qtyKg = qty >= 1 ? qty / 1000 : qty;
          totalUsedKg += qtyKg * bene;
        });

        const used = Number(totalUsedKg.toFixed(6));
        const beneficiary = benefSum; // total beneficiaries this month

        return {
          ...item,
          prev,
          received,
          used,
          cookedDays,
          beneficiary,
        };
      });

      // Avoid unnecessary re-renders
      return JSON.stringify(prevRecords) === JSON.stringify(updated)
        ? prevRecords
        : updated;
    });
  }, [
    stockYear,
    stockMonth,
    stockClass,
    incomingRecords,
    registerRecords,
    quantityRules,
    stockRecordsHistory,
  ]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Subscribe to MDM data specific to school
    const udise = getUdise();
    const unsubscribe = onSnapshot(
      doc(db, "school_data", `${udise}_mdm`),
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          if (firestoreData.dailyRecord)
            setDailyRecord(firestoreData.dailyRecord);
          // Fetch or auto-update quantity rules to match standard quantities from user's screenshots
          if (firestoreData.quantityTabRules) {
            const rules = firestoreData.quantityTabRules;
            const needsUpdate = INITIAL_QUANTITY_TAB_RULES.some((initRule) => {
              const match = rules.find((r: any) => r.item === initRule.item);
              return (
                !match ||
                match.qty15 !== initRule.qty15 ||
                match.qty68 !== initRule.qty68
              );
            });
            if (needsUpdate) {
              setDoc(
                doc(db, "school_data", `${udise}_mdm`),
                {
                  quantityTabRules: INITIAL_QUANTITY_TAB_RULES,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true },
              ).catch(console.error);
              setQuantityRules(INITIAL_QUANTITY_TAB_RULES);
            } else {
              setQuantityRules(rules);
            }
          } else {
            setDoc(
              doc(db, "school_data", `${udise}_mdm`),
              {
                quantityTabRules: INITIAL_QUANTITY_TAB_RULES,
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            ).catch(console.error);
            setQuantityRules(INITIAL_QUANTITY_TAB_RULES);
          }
          if (firestoreData.weeklyMenu) setWeeklyMenu(firestoreData.weeklyMenu);
          if (firestoreData.stockInventory)
            setStockInventory(firestoreData.stockInventory);
          if (firestoreData.helpers) setHelpers(firestoreData.helpers);
          if (firestoreData.incomingRecord) {
            if (firestoreData.incomingRecord.year)
              setIncomingYear(firestoreData.incomingRecord.year);
            if (firestoreData.incomingRecord.month)
              setIncomingMonth(firestoreData.incomingRecord.month);
            if (firestoreData.incomingRecord.class)
              setIncomingClass(firestoreData.incomingRecord.class);
            if (firestoreData.incomingRecord.quantities)
              setIncomingQuantities(firestoreData.incomingRecord.quantities);
          }
          if (firestoreData.menuRecords) {
            setMenuRecords(firestoreData.menuRecords);
          }
          if (firestoreData.incomingRecords) {
            setIncomingRecords(firestoreData.incomingRecords);
          }
          if (firestoreData.stockRecordsHistory) {
            setStockRecordsHistory(firestoreData.stockRecordsHistory);
          }
          if (firestoreData.registerRecords) {
            setRegisterRecords(firestoreData.registerRecords);
          }
          if (firestoreData.stockRecords) {
            setStockRecords(firestoreData.stockRecords);
          }
          if (firestoreData.menuRecord) {
            if (firestoreData.menuRecord.day)
              setMenuDay(firestoreData.menuRecord.day);
            if (firestoreData.menuRecord.type)
              setMenuType(firestoreData.menuRecord.type);
            if (firestoreData.menuRecord.selectedItems)
              setSelectedMenuItems(firestoreData.menuRecord.selectedItems);
          }
          if (firestoreData.registerRecord) {
            if (firestoreData.registerRecord.date)
              setRegisterDate(firestoreData.registerRecord.date);
            if (firestoreData.registerRecord.class)
              setRegisterClass(firestoreData.registerRecord.class);
            if (firestoreData.registerRecord.day)
              setRegisterDay(firestoreData.registerRecord.day);
            if (firestoreData.registerRecord.beneficiary)
              setRegisterBeneficiary(firestoreData.registerRecord.beneficiary);
          }
          if (firestoreData.stockRecord) {
            if (firestoreData.stockRecord.year)
              setStockYear(firestoreData.stockRecord.year);
            if (firestoreData.stockRecord.month)
              setStockMonth(firestoreData.stockRecord.month);
            if (firestoreData.stockRecord.class)
              setStockClass(firestoreData.stockRecord.class);
          }
          if (firestoreData.demandRecord) {
            if (firestoreData.demandRecord.fromDate)
              setDemandFromDate(firestoreData.demandRecord.fromDate);
            if (firestoreData.demandRecord.toDate)
              setDemandToDate(firestoreData.demandRecord.toDate);
            if (firestoreData.demandRecord.content)
              setDemandContent(firestoreData.demandRecord.content);
            if (firestoreData.demandRecord.quantity)
              setDemandQty(firestoreData.demandRecord.quantity);
            if (firestoreData.demandRecord.records)
              setDemandRecords(firestoreData.demandRecord.records);
          }
          if (firestoreData.tasteReport) {
            if (firestoreData.tasteReport.month)
              setTasteMonth(firestoreData.tasteReport.month);
            if (firestoreData.tasteReport.year)
              setTasteYear(firestoreData.tasteReport.year);
            if (firestoreData.tasteReport.rows)
              setTasteRows(firestoreData.tasteReport.rows);
          }
          if (firestoreData.eggBananaRecord) {
            if (firestoreData.eggBananaRecord.date)
              setEggBananaDate(firestoreData.eggBananaRecord.date);
            if (firestoreData.eggBananaRecord.remark)
              setEggBananaRemark(firestoreData.eggBananaRecord.remark);
            if (firestoreData.eggBananaRecord.egg15)
              setEggBeneficiary15(firestoreData.eggBananaRecord.egg15);
            if (firestoreData.eggBananaRecord.egg68)
              setEggBeneficiary68(firestoreData.eggBananaRecord.egg68);
            if (firestoreData.eggBananaRecord.banana15)
              setBananaBeneficiary15(firestoreData.eggBananaRecord.banana15);
            if (firestoreData.eggBananaRecord.banana68)
              setBananaBeneficiary68(firestoreData.eggBananaRecord.banana68);
            if (firestoreData.eggBananaRecord.records)
              setEggBananaRecords(firestoreData.eggBananaRecord.records);
          }
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const udise = getUdise();
      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("माहिती जतन करण्यात अडचण आली.", "Failed to save database sync"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIncoming = async () => {
    if (!user) return;
    if (
      incomingYear === "Select Year" ||
      incomingMonth === "Select Month" ||
      incomingClass === "Select Class"
    ) {
      toast.warning(
        t(
          "कृपया वर्ष, महिना आणि इयत्ता निवडा.",
          "Please select Year, Month, and Class first.",
        ),
      );
      return;
    }
    setSaving(true);
    try {
      const udise = getUdise();
      const recordKey = `${incomingYear}_${incomingMonth}_${incomingClass}`;

      const updatedRecords = {
        ...incomingRecords,
        [recordKey]: incomingQuantities,
      };
      setIncomingRecords(updatedRecords);

      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          incomingRecords: updatedRecords,
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("आवक जतन करण्यात अडचण आली.", "Failed to save incoming entry"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleIncomingReport = () => {
    if (
      incomingYear === "Select Year" ||
      incomingMonth === "Select Month" ||
      incomingClass === "Select Class"
    ) {
      toast.warning(
        t(
          "कृपया वर्ष, महिना आणि इयत्ता निवडा.",
          "Please select Year, Month, and Class.",
        ),
      );
      return;
    }
    setShowIncomingReportModal(true);
  };

  const handleSaveMenu = async () => {
    if (!user) return;
    if (menuDay === "Select Day") {
      toast.warning(t("कृपया दिवस निवडा.", "Please select a Day first."));
      return;
    }
    setSaving(true);
    try {
      const udise = getUdise();
      const updatedRecords = {
        ...menuRecords,
        [menuDay]: {
          menu: menuType,
          selectedItems: selectedMenuItems,
        },
      };
      setMenuRecords(updatedRecords);

      await setDoc(
        doc(db, "school_data", `${getUdise()}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: demandContent,
            quantity: demandQty,
            records: demandRecords,
          },
          eggBananaRecord: {
            date: eggBananaDate,
            remark: eggBananaRemark,
            egg15: eggBeneficiary15,
            egg68: eggBeneficiary68,
            banana15: bananaBeneficiary15,
            banana68: bananaBeneficiary68,
            records: eggBananaRecords,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          menuRecords: updatedRecords,
          stockRecords,
          registerRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("मेन्यू जतन करण्यात अडचण आली.", "Failed to save food menu"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReportMenu = () => {
    setShowMenuReportModal(true);
  };

  const handleSaveRegister = async () => {
    if (!user) return;
    if (!registerDate) {
      toast.warning(t("कृपया तारीख निवडा.", "Please select a Date first."));
      return;
    }
    setSaving(true);
    try {
      const udise = getUdise();
      const currentMenu = getMenuForRegisterDate(registerDate);
      const currentSelectedItems =
        getSelectedItemsForRegisterDate(registerDate) || {};

      const updatedRecords = {
        ...registerRecords,
        [registerDate]: {
          enrolled: "45",
          beneficiary: registerBeneficiary || "0",
          menu: currentMenu,
          selectedItems: currentSelectedItems,
        },
      };
      setRegisterRecords(updatedRecords);

      await setDoc(
        doc(db, "school_data", `${getUdise()}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          menuRecords,
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: demandContent,
            quantity: demandQty,
            records: demandRecords,
          },
          eggBananaRecord: {
            date: eggBananaDate,
            remark: eggBananaRemark,
            egg15: eggBeneficiary15,
            egg68: eggBeneficiary68,
            banana15: bananaBeneficiary15,
            banana68: bananaBeneficiary68,
            records: eggBananaRecords,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          registerRecords: updatedRecords,
          stockRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("नोंदवही जतन करण्यात अडचण आली.", "Failed to save daily register"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRiceReport = () => {
    setShowRiceReportModal(true);
  };

  const handleGeneralReport = () => {
    setShowDailyRegisterReportModal(true);
  };

  const handleSaveStock = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const udise = getUdise();
      const recordKey = `${stockYear}_${stockMonth}_${stockClass}`;
      const updatedHistory = {
        ...stockRecordsHistory,
        [recordKey]: stockRecords,
      };
      setStockRecordsHistory(updatedHistory);

      await setDoc(
        doc(db, "school_data", `${getUdise()}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          menuRecords,
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          registerRecords,
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          stockRecords,
          stockRecordsHistory: updatedHistory,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("साठा जतन करण्यात अडचण आली.", "Failed to save current stock"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewStockData = () => {
    if (
      stockYear === "Select Year" ||
      stockMonth === "Select Month" ||
      stockClass === "Select Class"
    ) {
      toast.warning(
        t(
          "कृपया वर्ष, महिना आणि इयत्ता निवडा.",
          "Please select Year, Month, and Class.",
        ),
      );
      return;
    }
    setShowStockTable(true);
  };

  const handleStockReport = () => {
    setShowStockReportModal(true);
  };

  const handleDemandContentChange = (contentName: string) => {
    setDemandContent(contentName);
    if (contentName && contentName !== "Select content") {
      const rule = quantityRules.find(
        (r) => r.item.toLowerCase() === contentName.toLowerCase(),
      );
      if (rule) {
        const qtyPerStudentStr =
          stockClass === "1 To 5" ? rule.qty15 : rule.qty68;
        const qtyPerStudent = Number(qtyPerStudentStr) || 0;

        const dayCount = stockRecords.reduce(
          (acc, r) => acc + (r.cookedDays || 0),
          0,
        );
        const beneficiarySum = stockRecords.reduce(
          (acc, r) => acc + (r.beneficiary || 0),
          0,
        );
        const avgBeneficiaries =
          dayCount > 0 ? Math.round(beneficiarySum / stockRecords.length) : 45;

        const standardNeed =
          qtyPerStudent >= 1
            ? (qtyPerStudent * avgBeneficiaries * 24) / 1000
            : qtyPerStudent * avgBeneficiaries * 24;

        const stockItem = stockRecords.find(
          (r) => r.item.toLowerCase() === contentName.toLowerCase(),
        );
        const totalGoods = stockItem
          ? Number(stockItem.prev) + Number(stockItem.received)
          : 0;
        const remaining = stockItem ? totalGoods - Number(stockItem.used) : 0;

        const suggested = Math.max(0, Math.ceil(standardNeed - remaining));
        setDemandQty(suggested > 0 ? suggested.toString() : "50");
      } else {
        setDemandQty("");
      }
    } else {
      setDemandQty("");
    }
  };

  const handleSaveDemand = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const udise = getUdise();
      let updatedRecords = [...demandRecords];
      if (demandContent && demandContent !== "Select content" && demandQty) {
        const newRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          content: demandContent,
          quantity: demandQty,
        };
        updatedRecords.push(newRecord);
        setDemandRecords(updatedRecords);
        setDemandContent("Select content");
        setDemandQty("");
      }

      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: "Select content",
            quantity: "",
            records: updatedRecords,
          },
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("मागणी जतन करण्यात अडचण आली.", "Failed to save demand record"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDemandRecord = async (id: string) => {
    if (!user) return;
    const updated = demandRecords.filter((r) => r.id !== id);
    setDemandRecords(updated);
    setSaving(true);
    try {
      const udise = getUdise();
      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: demandContent,
            quantity: demandQty,
            records: updated,
          },
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(
        t(
          "मागणी यशस्वीरित्या काढून टाकली!",
          "Demand Record Removed Successfully!",
        ),
      );
    } catch (e) {
      console.error(e);
      toast.error(
        t("मागणी काढून टाकण्यात अडचण आली.", "Failed to remove demand record"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDemandReport = () => {
    setShowDemandReportModal(true);
  };

  const handleSaveEggBanana = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const udise = getUdise();
      let updatedRecords = [...eggBananaRecords];

      const egg15 = Number(eggBeneficiary15) || 0;
      const egg68 = Number(eggBeneficiary68) || 0;
      const banana15 = Number(bananaBeneficiary15) || 0;
      const banana68 = Number(bananaBeneficiary68) || 0;

      if (eggBananaDate) {
        const newRecord = {
          id: Date.now().toString(),
          date: eggBananaDate,
          egg15,
          egg68,
          banana15,
          banana68,
          remark: eggBananaRemark,
        };
        updatedRecords.push(newRecord);
        setEggBananaRecords(updatedRecords);
        setEggBananaRemark("");
        setEggBeneficiary15("0");
        setEggBeneficiary68("0");
        setBananaBeneficiary15("0");
        setBananaBeneficiary68("0");
      }

      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: demandContent,
            quantity: demandQty,
            records: demandRecords,
          },
          eggBananaRecord: {
            date: "",
            remark: "",
            egg15: "0",
            egg68: "0",
            banana15: "0",
            banana68: "0",
            records: updatedRecords,
          },
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(t("नोंद जतन करण्यात अडचण आली.", "Failed to save record"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEggBananaRecord = async (id: string) => {
    if (!user) return;
    const updated = eggBananaRecords.filter((r) => r.id !== id);
    setEggBananaRecords(updated);
    setSaving(true);
    try {
      const udise = getUdise();
      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          incomingRecord: {
            year: incomingYear,
            month: incomingMonth,
            class: incomingClass,
            quantities: incomingQuantities,
          },
          menuRecord: {
            day: menuDay,
            type: menuType,
            selectedItems: selectedMenuItems,
          },
          registerRecord: {
            date: registerDate,
            class: registerClass,
            day: registerDay,
            beneficiary: registerBeneficiary,
          },
          stockRecord: {
            year: stockYear,
            month: stockMonth,
            class: stockClass,
          },
          demandRecord: {
            fromDate: demandFromDate,
            toDate: demandToDate,
            content: demandContent,
            quantity: demandQty,
            records: demandRecords,
          },
          eggBananaRecord: {
            date: eggBananaDate,
            remark: eggBananaRemark,
            egg15: eggBeneficiary15,
            egg68: eggBeneficiary68,
            banana15: bananaBeneficiary15,
            banana68: bananaBeneficiary68,
            records: updated,
          },
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(
        t("नोंद यशस्वीरित्या काढून टाकली!", "Record Removed Successfully!"),
      );
    } catch (e) {
      console.error(e);
      toast.error(
        t("नोंद काढून टाकण्यात अडचण आली.", "Failed to remove record"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEggBananaReport = () => {
    setShowEggBananaReportModal(true);
  };

  const handleTasteRowChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...tasteRows];
    (updated[index] as any)[field] = value;
    setTasteRows(updated);
  };

  const handleSaveTaste = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const udise = getUdise();
      await setDoc(
        doc(db, "school_data", `${udise}_mdm`),
        {
          dailyRecord,
          weeklyMenu,
          stockInventory,
          helpers,
          tasteReport: {
            month: tasteMonth,
            year: tasteYear,
            rows: tasteRows,
          },
          stockRecords,
          registerRecords,
          menuRecords,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      toast.success(t("माहिती यशस्वीरित्या जतन केली!", "Saved Successfully!"));
    } catch (e) {
      console.error(e);
      toast.error(
        t("अहवाल जतन करण्यात अडचण आली.", "Failed to save taste report"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTasteReport = () => {
    const schoolName = profile?.schoolName || "A B C";
    const taluka = profile?.taluka || "";
    const udise = getUdise();

    const tableRows = tasteRows
      .map((row) => {
        return `<tr>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;width:40px;">${row.day}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.timeLoading}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.foodDistTime}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.todaysMenu}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.tasterName}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.comment}</td>
        <td style="border:1px solid #000;padding:4px 6px;text-align:center;font-size:11px;">${row.signature}</td>
      </tr>`;
      })
      .join("");

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Taste Report - School Nutrition Scheme</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #000; padding: 30px 40px; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 10px 20px; }
          }
        </style>
      </head>
      <body>
        <div style="max-width:750px;margin:0 auto;background:#fff;padding:30px;border:1px solid #ddd;border-radius:8px;">
          <!-- Header -->
          <div style="text-align:center;margin-bottom:10px;">
            <p style="font-size:14px;font-weight:700;letter-spacing:4px;">${schoolName}</p>
            <p style="font-size:11px;color:#555;margin:2px 0;">Taluka : ${taluka} &nbsp;&nbsp; Office</p>
            <p style="font-size:16px;font-weight:700;color:#004C99;margin:6px 0;">School Nutrition Scheme</p>
          </div>

          <!-- Sub-header -->
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;">
            <span style="background:#004C99;color:#fff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:600;">Register about providing cooked food at the school level</span>
            <span style="font-size:11px;font-weight:600;">Month : ${tasteMonth}</span>
            <span style="font-size:11px;font-weight:600;">${tasteYear}</span>
          </div>

          <!-- Table -->
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;width:40px;">Date</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Time of loading</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Food distribution Time</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Today's Menu</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Name of the taster</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Comment on taste</th>
                <th style="border:1px solid #000;padding:6px;text-align:center;font-size:10px;font-weight:700;">Signature of the taster</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <!-- Footer -->
          <div style="margin-top:30px;display:flex;justify-content:space-between;font-size:11px;">
            <div style="text-align:center;">
              <p style="font-weight:700;">Principal</p>
              <p style="color:#555;">Signature and Stamp</p>
            </div>
            <div style="text-align:center;">
              <p style="font-weight:700;">President</p>
              <p style="color:#555;">Village/Ward/School Management Committee</p>
            </div>
          </div>

          <div style="text-align:center;margin-top:15px;font-size:9px;color:#888;">
            <p>Indir: Bhimasena Businesai Cookin Tool From Number: ${udise}</p>
          </div>

          <!-- Print Button -->
          <div class="no-print" style="text-align:right;margin-top:20px;">
            <button onclick="window.print()" style="background:#2196F3;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-weight:700;font-size:13px;">Print</button>
          </div>
        </div>
      </body>
      </html>
    `;

    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      reportWindow.document.write(reportHTML);
      reportWindow.document.close();
    }
    toast.success(t("चव चाचणी अहवाल तयार झाला!", "Taste Report Generated!"));
  };

  const handleAddHelper = () => {
    if (!newHelper.name) return;
    const added = [
      ...helpers,
      {
        id: Date.now().toString(),
        name: newHelper.name,
        role: newHelper.role,
        roleMr:
          newHelper.role === "Chief Cook"
            ? "मुख्य स्वयंपाकी"
            : "मदतनीस स्वयंपाकी",
        status: "Active",
        attendance: "0/26 Days",
      },
    ];
    setHelpers(added);
    setNewHelper({
      name: "",
      role: "Assistant Cook",
      roleMr: "मदतनीस स्वयंपाकी",
    });
    toast.success(t("मदतनीस यशस्वीपणे जोडला!", "Helper Added Successfully!"));
  };

  const handleDeleteHelper = (id: string) => {
    const filtered = helpers.filter((h) => h.id !== id);
    setHelpers(filtered);
    toast.info(t("मदतनीस काढून टाकला", "Helper removed successfully"));
  };

  const handleStockChange = (
    index: number,
    field: "opening" | "added" | "consumed",
    value: number,
  ) => {
    const updated = [...stockInventory];
    updated[index][field] = value;
    // Auto calculate closing
    updated[index].closing =
      updated[index].opening + updated[index].added - updated[index].consumed;
    setStockInventory(updated);
  };

  const handleWeeklyMenuChange = (
    index: number,
    field: "dish" | "dishMr",
    value: string,
  ) => {
    const updated = [...weeklyMenu];
    updated[index][field] = value;
    setWeeklyMenu(updated);
  };

  const isQuantityChanged = (() => {
    if (!qtyContent) return false;
    const rule = quantityRules.find(
      (r) => r.item.toLowerCase() === qtyContent.toLowerCase(),
    );
    if (!rule) return false;
    const originalVal = qtyClass === "1-5" ? rule.qty15 : rule.qty68;
    return qtyAmount !== originalVal;
  })();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
            Establishing Educator Protocols...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      {/* Luxury Glowing Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 size-[800px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-48 size-[900px] bg-indigo-500/5 rounded-full blur-[140px] animate-blob" />
        <div className="absolute -bottom-64 left-1/4 size-[800px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-20 min-h-screen pb-20 relative z-10">
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
          {/* Main Content Workspace Panel */}
          {loading ? (
            <div className="h-[450px] bg-slate-100/50 border border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-500 gap-6">
              <Loader2 className="size-12 animate-spin text-teal-500" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
                Synchronizing Secure MDM Archives...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-slate-200 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5)] overflow-hidden p-6 md:p-10"
              >
                {/* 1. QUANTITY TAB */}
                {activeTab === "quantity" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t_global.mdm_quantity}
                        </h2>
                      </div>

                      {/* Input Form */}
                      <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold block">
                            {t_global.mdm_class_label}
                          </label>
                          <select
                            value={qtyClass}
                            onChange={(e) =>
                              handleQuantityClassChange(e.target.value)
                            }
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          >
                            <option value="1-5">
                              {t("१ ते ५", "1 To 5", "1 से 5")}
                            </option>
                            <option value="6-8">
                              {t("६ ते ८", "6 To 8", "6 से 8")}
                            </option>
                          </select>
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold block">
                            {t_global.mdm_contents_label}
                          </label>
                          <select
                            value={qtyContent}
                            onChange={(e) =>
                              handleQuantityContentChange(e.target.value)
                            }
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          >
                            <option value="">
                              {t_global.mdm_select_content}
                            </option>
                            <option value="Chili">
                              {t_global.mdm_item_chili}
                            </option>
                            <option value="Cowpea">
                              {t_global.mdm_item_cowpea}
                            </option>
                            <option value="Cumin">
                              {t_global.mdm_item_cumin}
                            </option>
                            <option value="Garam Masala">
                              {t_global.mdm_item_garam_masala}
                            </option>
                            <option value="Gram">
                              {t_global.mdm_item_gram}
                            </option>
                            <option value="Masurdal">
                              {t_global.mdm_item_masurdal}
                            </option>
                            <option value="Matki">
                              {t_global.mdm_item_matki}
                            </option>
                            <option value="Milk-Milk Powder">
                              {t_global.mdm_item_milk}
                            </option>
                            <option value="Moong">
                              {t_global.mdm_item_moong}
                            </option>
                            <option value="Mugdal">
                              {t_global.mdm_item_mugdal}
                            </option>
                            <option value="Mustard">
                              {t_global.mdm_item_mustard}
                            </option>
                            <option value="Oil">{t_global.mdm_item_oil}</option>
                            <option value="Onion Garlic Masala">
                              {t_global.mdm_item_onion_garlic}
                            </option>
                            <option value="Pease">
                              {t_global.mdm_item_pease}
                            </option>
                            <option value="Ragi Satva">
                              {t_global.mdm_item_ragi}
                            </option>
                            <option value="Rice">
                              {t_global.mdm_item_rice}
                            </option>
                            <option value="Salt">
                              {t_global.mdm_item_salt}
                            </option>
                            <option value="Soyabean Wadi">
                              {t_global.mdm_item_soyabean}
                            </option>
                            <option value="Sugar-Jaggery">
                              {t_global.mdm_item_sugar}
                            </option>
                          </select>
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold block">
                            {t_global.mdm_qty_gram_note}
                          </label>
                          <input
                            type="text"
                            value={qtyAmount}
                            onChange={(e) => setQtyAmount(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="py-2 flex gap-4">
                        <button
                          onClick={() => setShowQuantityReportModal(true)}
                          className="px-5 py-2 bg-[#007bff] text-white rounded text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
                        >
                          {t_global.mdm_report_btn}
                        </button>
                        {isQuantityChanged && (
                          <button
                            onClick={handleUpdateQuantityRule}
                            className="px-5 py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded text-xs font-bold shadow-md transition-colors"
                          >
                            {t("अद्यतन करा", "Update", "अपडेट करें")}
                          </button>
                        )}
                      </div>

                      {/* Quantity Report Modal (Overlay without dark background) */}
                      {showQuantityReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[650px] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-y-auto print:overflow-visible bg-white print:border-none"
                              id="quantity-report-print"
                            >
                              {/* Header */}
                              <div className="text-center text-black border-b border-black py-4 print:border-b-2">
                                <h3 className="font-bold text-sm tracking-[0.2em] uppercase">
                                  A B C
                                </h3>
                                <p className="text-[10px] mt-1">
                                  Taluka: , Jilha:
                                </p>
                                <p className="text-[10px] mb-2">
                                  Mobile Number: 8010926852 , Email:
                                </p>

                                <div className="flex justify-center mt-1">
                                  <div className="bg-black text-white px-5 py-1 text-xs font-bold rounded shadow-sm print:border print:border-black print:text-black print:bg-white">
                                    {t(
                                      "पोषण आहार",
                                      "Nutritional intake",
                                      "पोषण आहार",
                                    )}{" "}
                                    ( {t("इयत्ता", "Class", "कक्षा")}{" "}
                                    {qtyClass === "1-5"
                                      ? t("१ ते ५", "1 To 5", "1 से 5")
                                      : t("६ ते ८", "6 To 8", "6 से 8")}{" "}
                                    )
                                  </div>
                                </div>
                              </div>

                              {/* Table */}
                              <table className="w-full border-collapse text-black text-[11px] text-center">
                                <thead>
                                  <tr>
                                    <th className="border-b border-r border-black py-2 font-bold w-[20%]">
                                      {t("अ.क्र.", "Sr.No", "क्र.")}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[45%]">
                                      {t(
                                        "धान्य साहित्य",
                                        "Grain content",
                                        "अनाज सामग्री",
                                      )}
                                    </th>
                                    <th className="border-b border-black py-2 font-bold w-[35%]">
                                      {t(
                                        "प्रमाण (ग्राम मध्ये)",
                                        "Amount (in grams)",
                                        "मात्रा (ग्राम में)",
                                      )}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {quantityRules.map((row, idx) => (
                                    <tr key={idx}>
                                      <td className="border-b border-r border-black py-1.5">
                                        {idx + 1}
                                      </td>
                                      <td className="border-b border-r border-black py-1.5">
                                        {getTranslatedItem(row.item)}
                                      </td>
                                      <td className="border-b border-black py-1.5">
                                        {qtyClass === "1-5"
                                          ? row.qty15
                                          : row.qty68}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #quantity-report-print, #quantity-report-print * {
                                  visibility: visible;
                                }
                                #quantity-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-4 print:hidden">
                              <button
                                onClick={() => window.print()}
                                className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("प्रिंट", "Print", "प्रिंट")}
                              </button>
                              <button
                                onClick={() =>
                                  setShowQuantityReportModal(false)
                                }
                                className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("बंद करा", "Close", "बंद करें")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="h-px w-full bg-slate-300" />

                      {/* Table Section */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-medium">
                            {t_global.mdm_per_student_note}
                          </p>
                        </div>

                        <div className="w-full">
                          <table className="w-full border-collapse border border-black">
                            <thead>
                              <tr className="bg-white">
                                <th className="border border-black p-2 text-sm font-bold text-center">
                                  {t("इयत्ता", "Class", "कक्षा")}
                                </th>
                                <th className="border border-black p-2 text-sm font-bold text-center">
                                  {t("साहित्य", "Contents", "सामग्री")}
                                </th>
                                <th className="border border-black p-2 text-sm font-bold text-center">
                                  {t(
                                    "प्रमाण (ग्राम मध्ये)",
                                    "Quantity (in grams)",
                                    "मात्रा (ग्राम में)",
                                  )}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {quantityRules.map((row, i) => (
                                <tr key={i} className="bg-white">
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {qtyClass === "1-5"
                                      ? t("१ ते ५", "1 To 5", "1 से 5")
                                      : t("६ ते ८", "6 To 8", "6 से 8")}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {getTranslatedItem(row.item)}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {qtyClass === "1-5" ? row.qty15 : row.qty68}
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

                {/* 2. MENU TAB */}
                {activeTab === "menu" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t("अन्न मेनू", "Food Menu", "खाद्य मेनू")}
                        </h2>
                      </div>

                      {/* Dropdowns row */}
                      <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {t("दिवस:", "Day:")}
                          </span>
                          <select
                            value={menuDay}
                            onChange={(e) =>
                              handleMenuDayChange(e.target.value)
                            }
                            className="h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          >
                            <option value="Select Day">
                              {t("दिवस निवडा", "Select Day")}
                            </option>
                            <option disabled>
                              {t(
                                "—— पहिली आणि तिसरी आठवडा ——",
                                "—— First And Third Week ——",
                                "—— पहला और तीसरा सप्ताह ——",
                              )}
                            </option>
                            <option value="1. Monday">
                              {getTranslatedDay("1. Monday")}
                            </option>
                            <option value="2. Tuesday">
                              {getTranslatedDay("2. Tuesday")}
                            </option>
                            <option value="3. Wednesday">
                              {getTranslatedDay("3. Wednesday")}
                            </option>
                            <option value="4. Thursday">
                              {getTranslatedDay("4. Thursday")}
                            </option>
                            <option value="5. Friday">
                              {getTranslatedDay("5. Friday")}
                            </option>
                            <option value="6. Saturday">
                              {getTranslatedDay("6. Saturday")}
                            </option>
                            <option disabled>
                              {t(
                                "—— दुसरी आणि चौथी आठवडा ——",
                                "—— Second And Fourth Week ——",
                                "—— दूसरा और चौथा सप्ताह ——",
                              )}
                            </option>
                            <option value="7. Monday">
                              {getTranslatedDay("7. Monday")}
                            </option>
                            <option value="8. Tuesday">
                              {getTranslatedDay("8. Tuesday")}
                            </option>
                            <option value="9. Wednesday">
                              {getTranslatedDay("9. Wednesday")}
                            </option>
                            <option value="10. Thursday">
                              {getTranslatedDay("10. Thursday")}
                            </option>
                            <option value="11. Friday">
                              {getTranslatedDay("11. Friday")}
                            </option>
                            <option value="12. Saturday">
                              {getTranslatedDay("12. Saturday")}
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {t("मेनू:", "Menu:")}
                          </span>
                          <select
                            value={menuType}
                            onChange={(e) => setMenuType(e.target.value)}
                            className="h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium min-w-[120px]"
                          >
                            <option value="Select Menu">
                              {t("मेनू निवडा", "Select Menu")}
                            </option>
                            <option value="Vegetable Pulav">
                              {getTranslatedMenu("Vegetable Pulav")}
                            </option>
                            <option value="Masala Rice">
                              {getTranslatedMenu("Masala Rice")}
                            </option>
                            <option value="Matar Pulav">
                              {getTranslatedMenu("Matar Pulav")}
                            </option>
                            <option value="Mungdal Khichadi">
                              {getTranslatedMenu("Mungdal Khichadi")}
                            </option>
                            <option value="Cowpea Khichadi">
                              {getTranslatedMenu("Cowpea Khichadi")}
                            </option>
                            <option value="Chana Pulav">
                              {getTranslatedMenu("Chana Pulav")}
                            </option>
                            <option value="Soyabin Pulav">
                              {getTranslatedMenu("Soyabin Pulav")}
                            </option>
                            <option value="Masuri Pulav">
                              {getTranslatedMenu("Masuri Pulav")}
                            </option>
                            <option value="Egg Pulav">
                              {getTranslatedMenu("Egg Pulav")}
                            </option>
                            <option value="Sprouted Matki Usal">
                              {getTranslatedMenu("Sprouted Matki Usal")}
                            </option>
                            <option value="Sweet Khichadi">
                              {getTranslatedMenu("Sweet Khichadi")}
                            </option>
                            <option value="Mug Shevaga Varan Bhat">
                              {getTranslatedMenu("Mug Shevaga Varan Bhat")}
                            </option>
                            <option value="Rice pudding">
                              {getTranslatedMenu("Rice pudding")}
                            </option>
                            <option value="ragi porridge">
                              {getTranslatedMenu("ragi porridge")}
                            </option>
                            <option value="Sprouted pulses">
                              {getTranslatedMenu("Sprouted pulses")}
                            </option>
                            <option value="Other">
                              {getTranslatedMenu("Other")}
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Double Divider */}
                      <div className="space-y-1 w-full">
                        <div className="h-px w-full bg-slate-300" />
                        <div className="h-px w-full bg-slate-300" />
                      </div>

                      {/* Checkbox Checklist Panel */}
                      <div className="w-full border border-black bg-[#F5F5F5] rounded p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                          {/* Left Column Checkboxes */}
                          <div className="space-y-4">
                            {[
                              "Rice",
                              "Mugdal",
                              "Turdal",
                              "Masurdal",
                              "Matki",
                              "Moong",
                              "Cowpea",
                              "Gram",
                              "Pease",
                              "Mustard",
                              "Cumin",
                            ].map((item) => (
                              <label
                                key={item}
                                className="flex items-center gap-4 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selectedMenuItems[item]}
                                  onChange={(e) =>
                                    setSelectedMenuItems({
                                      ...selectedMenuItems,
                                      [item]: e.target.checked,
                                    })
                                  }
                                  className="size-5 border border-slate-400 bg-white checked:bg-blue-600 focus:ring-0 rounded outline-none"
                                />
                                <span className="text-sm font-bold text-slate-800">
                                  {getTranslatedItem(item)}
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* Right Column Checkboxes */}
                          <div className="space-y-4">
                            {[
                              "Turmeric",
                              "Oil",
                              "Salt",
                              "Onion Garlic Masala",
                              "Garam Masala",
                              "Chili",
                              "Vegetables",
                              "Milk-Milk Powder",
                              "Sugar-Jaggery",
                              "Soyabean Wadi",
                              "Ragi Satva",
                            ].map((item) => (
                              <label
                                key={item}
                                className="flex items-center gap-4 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selectedMenuItems[item]}
                                  onChange={(e) =>
                                    setSelectedMenuItems({
                                      ...selectedMenuItems,
                                      [item]: e.target.checked,
                                    })
                                  }
                                  className="size-5 border border-slate-400 bg-white checked:bg-blue-600 focus:ring-0 rounded outline-none"
                                />
                                <span className="text-sm font-bold text-slate-800">
                                  {getTranslatedItem(item)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Buttons Row */}
                      <div className="w-full flex justify-between items-center py-2">
                        <button
                          onClick={handleSaveMenu}
                          className="px-5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-xs font-bold shadow-md transition-colors"
                        >
                          {t("जतन करा", "Save", "सहेजें")}
                        </button>
                        <button
                          onClick={handleReportMenu}
                          className="px-5 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-white rounded text-xs font-bold shadow-md transition-colors"
                        >
                          {t("अहवाल", "Report", "रिपोर्ट")}
                        </button>
                      </div>

                      {/* Food Menu Report Modal */}
                      {showMenuReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[650px] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-y-auto print:overflow-visible bg-white print:border-none"
                              id="menu-report-print"
                            >
                              {/* Header */}
                              <div className="text-center text-black border-b border-black py-4 print:border-b-2">
                                <h3 className="font-bold text-sm tracking-[0.2em] uppercase">
                                  A B C
                                </h3>
                                <p className="text-[10px] mt-1">
                                  Taluka: , Jilha:
                                </p>
                                <p className="text-[10px] mb-2">
                                  Mobile Number: 8010926852 , Email:
                                </p>

                                <div className="flex justify-center mt-1">
                                  <div className="bg-black text-white px-5 py-1 text-xs font-bold rounded shadow-sm print:border print:border-black print:text-black print:bg-white">
                                    {t("अन्न मेनू", "Food Menu", "खाद्य मेनू")}
                                  </div>
                                </div>
                              </div>

                              {/* Table */}
                              <table className="w-full border-collapse text-black text-[11px] text-center">
                                <thead>
                                  <tr>
                                    <th className="border-b border-r border-black py-2 font-bold w-[25%]">
                                      {t("दिवस", "Day", "दिन")}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[35%]">
                                      {t("अन्न", "Food", "भोजन")}
                                    </th>
                                    <th className="border-b border-black py-2 font-bold w-[40%]">
                                      {t("तपशील", "Details", "विवरण")}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* First and Third Week Group */}
                                  <tr className="bg-slate-50 font-semibold text-slate-500">
                                    <td
                                      colSpan={3}
                                      className="border-b border-black py-1 text-center font-bold"
                                    >
                                      {t(
                                        "पहिली आणि तिसरी आठवडा",
                                        "First And Third Week",
                                        "पहला और तीसरा सप्ताह",
                                      )}
                                    </td>
                                  </tr>
                                  {DAYS_OPTIONS.filter(
                                    (d) => d.week === "first-third",
                                  ).map((dayOpt, idx) => {
                                    const record = menuRecords[dayOpt.value];
                                    if (
                                      !record ||
                                      record.menu === "Select Menu"
                                    )
                                      return null;
                                    const detailsList = Object.keys(
                                      record.selectedItems,
                                    )
                                      .filter((k) => record.selectedItems[k])
                                      .map((k) => getTranslatedItem(k))
                                      .join(", ");
                                    return (
                                      <tr key={dayOpt.value}>
                                        <td className="border-b border-r border-black py-2">
                                          {getTranslatedDay(
                                            stripDayNumber(dayOpt.value),
                                          )}
                                        </td>
                                        <td className="border-b border-r border-black py-2">
                                          {getTranslatedMenu(record.menu)}
                                        </td>
                                        <td className="border-b border-black py-2 text-left px-3">
                                          {detailsList}
                                        </td>
                                      </tr>
                                    );
                                  })}

                                  {/* Second and Fourth Week Group */}
                                  <tr className="bg-slate-50 font-semibold text-slate-500">
                                    <td
                                      colSpan={3}
                                      className="border-b border-black py-1 text-center font-bold"
                                    >
                                      {t(
                                        "दुसरी आणि चौथी आठवडा",
                                        "Second And Fourth Week",
                                        "दूसरा और चौथा सप्ताह",
                                      )}
                                    </td>
                                  </tr>
                                  {DAYS_OPTIONS.filter(
                                    (d) => d.week === "second-fourth",
                                  ).map((dayOpt, idx) => {
                                    const record = menuRecords[dayOpt.value];
                                    if (
                                      !record ||
                                      record.menu === "Select Menu"
                                    )
                                      return null;
                                    const detailsList = Object.keys(
                                      record.selectedItems,
                                    )
                                      .filter((k) => record.selectedItems[k])
                                      .map((k) => getTranslatedItem(k))
                                      .join(", ");
                                    return (
                                      <tr key={dayOpt.value}>
                                        <td className="border-b border-r border-black py-2">
                                          {getTranslatedDay(
                                            stripDayNumber(dayOpt.value),
                                          )}
                                        </td>
                                        <td className="border-b border-r border-black py-2">
                                          {getTranslatedMenu(record.menu)}
                                        </td>
                                        <td className="border-b border-black py-2 text-left px-3">
                                          {detailsList}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #menu-report-print, #menu-report-print * {
                                  visibility: visible;
                                }
                                #menu-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-4 print:hidden">
                              <button
                                onClick={() => window.print()}
                                className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("प्रिंट", "Print", "प्रिंट")}
                              </button>
                              <button
                                onClick={() => setShowMenuReportModal(false)}
                                className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("बंद करा", "Close", "बंद करें")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. INCOMING ENTRY TAB */}
                {activeTab === "incoming" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t("येणारी नोंद", "Incoming entry", "आगम प्रविष्टि")}
                        </h2>
                      </div>

                      {/* Dropdowns row */}
                      <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {t("वर्ष:", "Year:")}
                          </span>
                          <select
                            value={incomingYear}
                            onChange={(e) => setIncomingYear(e.target.value)}
                            className="h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          >
                            <option value="Select Year">
                              {t("वर्ष निवडा", "Select Year")}
                            </option>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                            <option value="2029">2029</option>
                            <option value="2030">2030</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {t("महिना:", "Month:")}
                          </span>
                          <select
                            value={incomingMonth}
                            onChange={(e) => setIncomingMonth(e.target.value)}
                            className="h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium min-w-[120px]"
                          >
                            <option value="Select Month">
                              {t("महिना निवडा", "Select Month")}
                            </option>
                            {[
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].map((m) => (
                              <option key={m} value={m}>
                                {t(
                                  m === "January"
                                    ? "जानेवारी"
                                    : m === "February"
                                      ? "फेब्रुवारी"
                                      : m === "March"
                                        ? "मार्च"
                                        : m === "April"
                                          ? "एप्रिल"
                                          : m === "May"
                                            ? "मे"
                                            : m === "June"
                                              ? "जून"
                                              : m === "July"
                                                ? "जुलै"
                                                : m === "August"
                                                  ? "ऑगस्ट"
                                                  : m === "September"
                                                    ? "सप्टेंबर"
                                                    : m === "October"
                                                      ? "ऑक्टोबर"
                                                      : m === "November"
                                                        ? "नोव्हेंबर"
                                                        : "डिसेंबर",
                                  m,
                                  m === "January"
                                    ? "जनवरी"
                                    : m === "February"
                                      ? "फरवरी"
                                      : m === "March"
                                        ? "मार्च"
                                        : m === "April"
                                          ? "अप्रैल"
                                          : m === "May"
                                            ? "मई"
                                            : m === "June"
                                              ? "जून"
                                              : m === "July"
                                                ? "जुलाई"
                                                : m === "August"
                                                  ? "अगस्त"
                                                  : m === "September"
                                                    ? "सितंबर"
                                                    : m === "October"
                                                      ? "अक्टूबर"
                                                      : m === "November"
                                                        ? "नवंबर"
                                                        : "दिसंबर",
                                )}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {t("इयत्ता:", "Class:")}
                          </span>
                          <select
                            value={incomingClass}
                            onChange={(e) => setIncomingClass(e.target.value)}
                            className="h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium"
                          >
                            <option value="Select Class">
                              {t("इयत्ता निवडा", "Select Class")}
                            </option>
                            <option value="1 To 5">
                              {t("१ ते ५", "1 To 5", "1 से 5")}
                            </option>
                            <option value="6 To 8">
                              {t("६ ते ८", "6 To 8", "6 से 8")}
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-slate-300" />

                      {/* Table Section */}
                      <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse border border-black text-slate-900 bg-white">
                          <thead>
                            <tr className="bg-white">
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t("साहित्य", "Items", "सामग्री")}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t(
                                  "प्रमाण (१ ग्राम = ०.००१ किलो)",
                                  "Quantity(1gram = 0.001 kilo)",
                                  "मात्रा (1 ग्राम = 0.001 किलोग्राम)",
                                )}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t("साहित्य", "Items", "सामग्री")}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t(
                                  "प्रमाण (१ ग्राम = ०.००१ किलो)",
                                  "Quantity(1gram = 0.001 kilo)",
                                  "मात्रा (1 ग्राम = 0.001 किलोग्राम)",
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { left: "Rice", right: "Turmeric" },
                              { left: "Mugdal", right: "Chili" },
                              { left: "Turdal", right: "Oil" },
                              { left: "Masurdal", right: "Salt" },
                              { left: "Matki", right: "Onion Garlic Masala" },
                              { left: "Moong", right: "Garam Masala" },
                              { left: "Cowpea", right: "Vegetables" },
                              { left: "Gram", right: "Milk-Milk Powder" },
                              { left: "Pease", right: "Sugar-Jaggery" },
                              { left: "Cumin", right: "Soyabean Wadi" },
                              { left: "Mustard", right: "Ragi Satva" },
                            ].map((row, i) => (
                              <tr key={i} className="bg-white">
                                <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                  {getTranslatedItem(row.left)}
                                </td>
                                <td className="border border-black p-2 text-center text-xs font-medium">
                                  <input
                                    type="text"
                                    value={incomingQuantities[row.left] || ""}
                                    onChange={(e) =>
                                      setIncomingQuantities({
                                        ...incomingQuantities,
                                        [row.left]: e.target.value,
                                      })
                                    }
                                    className="w-[80%] mx-auto text-center border-t-0 border-l-0 border-r-0 border-b border-slate-400 focus:border-black outline-none bg-transparent text-slate-850 font-bold"
                                  />
                                </td>
                                <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                  {getTranslatedItem(row.right)}
                                </td>
                                <td className="border border-black p-2 text-center text-xs font-medium">
                                  <input
                                    type="text"
                                    value={incomingQuantities[row.right] || ""}
                                    onChange={(e) =>
                                      setIncomingQuantities({
                                        ...incomingQuantities,
                                        [row.right]: e.target.value,
                                      })
                                    }
                                    className="w-[80%] mx-auto text-center border-t-0 border-l-0 border-r-0 border-b border-slate-400 focus:border-black outline-none bg-transparent text-slate-850 font-bold"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Save & Report Buttons Row */}
                      <div className="py-2 w-full flex justify-start gap-4">
                        <button
                          onClick={handleSaveIncoming}
                          className="px-5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-xs font-bold shadow-md transition-colors"
                        >
                          {t("जतन करा", "Save", "सहेजें")}
                        </button>
                        <button
                          onClick={handleIncomingReport}
                          className="px-5 py-2 bg-[#007bff] hover:bg-blue-700 text-white rounded text-xs font-bold shadow-md transition-colors"
                        >
                          {t("अहवाल", "Report", "रिपोर्ट")}
                        </button>
                      </div>

                      {/* Incoming Report Modal */}
                      {showIncomingReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[650px] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-y-auto print:overflow-visible bg-white print:border-none"
                              id="incoming-report-print"
                            >
                              {/* Header */}
                              <div className="text-center text-black border-b border-black py-4 print:border-b-2">
                                <h3 className="font-bold text-sm tracking-[0.2em] uppercase">
                                  {profile?.schoolName || "A B C"}
                                </h3>
                                <p className="text-[10px] mt-1">
                                  {t("तालुका:", "Taluka:")}{" "}
                                  {profile?.taluka || ""}, UDISE: {getUdise()}
                                </p>
                                <p className="text-[10px] mb-2">
                                  {t(
                                    "येणारा साठा अहवाल",
                                    "Incoming Stock Report",
                                    "आगम स्टॉक रिपोर्ट",
                                  )}{" "}
                                  (
                                  {t(
                                    incomingMonth === "January"
                                      ? "जानेवारी"
                                      : incomingMonth === "February"
                                        ? "फेब्रुवारी"
                                        : incomingMonth === "March"
                                          ? "मार्च"
                                          : incomingMonth === "April"
                                            ? "एप्रिल"
                                            : incomingMonth === "May"
                                              ? "मे"
                                              : incomingMonth === "June"
                                                ? "जून"
                                                : incomingMonth === "July"
                                                  ? "जुलै"
                                                  : incomingMonth === "August"
                                                    ? "ऑगस्ट"
                                                    : incomingMonth ===
                                                        "September"
                                                      ? "सप्टेंबर"
                                                      : incomingMonth ===
                                                          "October"
                                                        ? "ऑक्टोबर"
                                                        : incomingMonth ===
                                                            "November"
                                                          ? "नोव्हेंबर"
                                                          : incomingMonth ===
                                                              "December"
                                                            ? "डिसेंबर"
                                                            : incomingMonth,
                                    incomingMonth,
                                    incomingMonth === "January"
                                      ? "जनवरी"
                                      : incomingMonth === "February"
                                        ? "फरवरी"
                                        : incomingMonth === "March"
                                          ? "मार्च"
                                          : incomingMonth === "April"
                                            ? "अप्रैल"
                                            : incomingMonth === "May"
                                              ? "मई"
                                              : incomingMonth === "June"
                                                ? "जून"
                                                : incomingMonth === "July"
                                                  ? "जुलाई"
                                                  : incomingMonth === "August"
                                                    ? "अगस्त"
                                                    : incomingMonth ===
                                                        "September"
                                                      ? "सितंबर"
                                                      : incomingMonth ===
                                                          "October"
                                                        ? "अक्टूबर"
                                                        : incomingMonth ===
                                                            "November"
                                                          ? "नवंबर"
                                                          : incomingMonth ===
                                                              "December"
                                                            ? "दिसंबर"
                                                            : incomingMonth,
                                  )}{" "}
                                  {incomingYear})
                                </p>

                                <div className="flex justify-center mt-1">
                                  <div className="bg-black text-white px-5 py-1 text-xs font-bold rounded shadow-sm print:border print:border-black print:text-black print:bg-white">
                                    {t(
                                      "येणारा साठा",
                                      "Incoming Stock",
                                      "आगम स्टॉक",
                                    )}{" "}
                                    ( {t("इयत्ता", "Class", "कक्षा")}{" "}
                                    {incomingClass === "1 To 5"
                                      ? t("१ ते ५", "1 To 5", "1 से 5")
                                      : t("६ ते ८", "6 To 8", "6 से 8")}{" "}
                                    )
                                  </div>
                                </div>
                              </div>

                              {/* Table */}
                              <table className="w-full border-collapse text-black text-[11px] text-center">
                                <thead>
                                  <tr>
                                    <th className="border-b border-r border-black py-2 font-bold w-[20%]">
                                      {t("अ.क्र.", "Sr.No", "क्र.")}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[45%]">
                                      {t(
                                        "साहित्याचे नाव",
                                        "Item name",
                                        "सामग्री का नाम",
                                      )}
                                    </th>
                                    <th className="border-b border-black py-2 font-bold w-[35%]">
                                      {t(
                                        "प्राप्त प्रमाण (ग्राम / युनिट्स)",
                                        "Quantity Received (grams / units)",
                                        "मात्रा प्राप्त (ग्राम / इकाइयां)",
                                      )}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.keys(incomingQuantities).map(
                                    (item, idx) => {
                                      const qty = incomingQuantities[item];
                                      return (
                                        <tr key={item}>
                                          <td className="border-b border-r border-black py-1.5">
                                            {idx + 1}
                                          </td>
                                          <td className="border-b border-r border-black py-1.5">
                                            {getTranslatedItem(item)}
                                          </td>
                                          <td className="border-b border-black py-1.5">
                                            {qty || "0"}
                                          </td>
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                              </table>
                            </div>

                            <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #incoming-report-print, #incoming-report-print * {
                                  visibility: visible;
                                }
                                #incoming-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-4 print:hidden">
                              <button
                                onClick={() => window.print()}
                                className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t(
                                  "प्रिंट / पीडीएफ",
                                  "Print / PDF",
                                  "प्रिंट / पीडीएफ",
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setShowIncomingReportModal(false)
                                }
                                className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("बंद करा", "Close", "बंद करें")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. DAILY REGISTER TAB */}
                {activeTab === "daily-reg" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t(
                            "दैनिक नोंदवही",
                            "Daily register",
                            "दैनिक रजिस्टर",
                          )}
                        </h2>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 text-slate-800">
                        <div className="space-y-2">
                          <span className="text-sm font-bold block">
                            {t("दिनांक:", "Date:")}
                          </span>
                          <input
                            type="date"
                            value={registerDate}
                            onChange={(e) => setRegisterDate(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-bold block">
                            {t("इयत्ता:", "Class:")}
                          </span>
                          <select
                            value={registerClass}
                            onChange={(e) => setRegisterClass(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium outline-none"
                          >
                            <option value="Select Class">
                              {t("इयत्ता निवडा", "Select Class")}
                            </option>
                            <option value="1 To 5">
                              {t("१ ते ५", "1 To 5", "1 से 5")}
                            </option>
                            <option value="6 To 8">
                              {t("६ ते ८", "6 To 8", "6 से 8")}
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-bold block">
                            {t("दिवस:", "Day:")}
                          </span>
                          <input
                            type="text"
                            value={registerDay}
                            onChange={(e) => setRegisterDay(e.target.value)}
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-bold block">
                            {t("लाभार्थी संख्या:", "Beneficiary:", "लाभार्थी:")}
                          </span>
                          <input
                            type="text"
                            value={registerBeneficiary}
                            onChange={(e) =>
                              setRegisterBeneficiary(e.target.value)
                            }
                            className="w-full h-8 px-2 bg-white border border-black rounded shadow-sm text-sm font-medium outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-bold block">
                            {t("मेनू:", "Menu:")}
                          </span>
                          <div className="h-8 flex items-center text-sm font-medium text-slate-500">
                            {getTranslatedMenu(
                              getMenuForRegisterDate(registerDate),
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-slate-300" />

                      {/* Buttons Row */}
                      <div className="w-full flex justify-between items-center py-2">
                        <button
                          onClick={handleSaveRegister}
                          className="px-5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-xs font-bold shadow-md transition-colors"
                        >
                          {t("जतन करा", "Save", "सहेजें")}
                        </button>
                        <div className="flex gap-4">
                          <button
                            onClick={handleRiceReport}
                            className="px-5 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-white rounded text-xs font-bold shadow-md transition-colors"
                          >
                            {t("तांदूळ अहवाल", "Rice Report", "चावल रिपोर्ट")}
                          </button>
                          <button
                            onClick={handleGeneralReport}
                            className="px-5 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-white rounded text-xs font-bold shadow-md transition-colors"
                          >
                            {t("अहवाल", "Report", "रिपोर्ट")}
                          </button>
                        </div>
                      </div>

                      {/* Table Section */}
                      <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse border border-black text-slate-900 bg-white">
                          <thead>
                            <tr className="bg-white">
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t(
                                  "मेनू साहित्य",
                                  "Menu Content",
                                  "मेनू सामग्री",
                                )}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t(
                                  "प्रमाण (ग्राम मध्ये)",
                                  "Quantity (In Gram)",
                                  "मात्रा (ग्राम में)",
                                )}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t("लाभार्थी", "Beneficiary", "लाभार्थी")}
                              </th>
                              <th className="border border-black p-2 text-sm font-bold text-center w-[25%]">
                                {t(
                                  "एकूण (ग्राम मध्ये)",
                                  "Total (In Gram)",
                                  "कुल (ग्राम में)",
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const rows = getDailyRegisterRows();
                              return rows.map((row, i) => (
                                <tr key={i} className="bg-white h-8">
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {getTranslatedItem(row.item)}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {row.qty}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {row.beneficiary}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-medium text-slate-700">
                                    {row.total}
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* 1. Daily Register General Report Modal (Part-II Accounting of Cereals - In Kilogram) */}
                      {showDailyRegisterReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[95%] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-auto print:overflow-visible bg-white print:border-none"
                              id="general-report-print"
                            >
                              {/* Header */}
                              <div className="text-center text-black border-b border-black py-4 print:border-b-2">
                                <h3 className="font-bold text-sm tracking-[0.2em] uppercase">
                                  {profile?.schoolName || "A B C"}
                                </h3>
                                <p className="text-[10px] mt-1">
                                  {t("तालुका:", "Taluka:")}{" "}
                                  {profile?.taluka || ""},{" "}
                                  {t("जिल्हा:", "District:")}{" "}
                                  {profile?.district || ""}
                                </p>
                                <p className="text-[10px] mb-1">
                                  {t(
                                    "प्रधानमंत्री पोषण शक्ती निर्माण योजना",
                                    "Pradhan Mantri Poshan Shakti Nirman Yojana",
                                  )}
                                </p>
                              </div>

                              <table className="w-full border-collapse text-black text-[9px] text-center table-fixed">
                                <thead>
                                  <tr className="bg-slate-50 font-bold">
                                    <th className="border-b border-r border-black p-1 w-[6%]">
                                      {t("दिनांक", "Date", "दिनांक")}
                                    </th>
                                    <th className="border-b border-r border-black p-1 w-[4%]">
                                      {t(
                                        "एकूण विद्यार्थी",
                                        "Total Student",
                                        "कुल छात्र",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black p-1 w-[4%]">
                                      {t(
                                        "लाभार्थी संख्या",
                                        "Plate Count",
                                        "लाभार्थी संख्या",
                                      )}
                                    </th>
                                    {[
                                      "Mugdal",
                                      "Turdal",
                                      "Masurdal",
                                      "Matki",
                                      "Moong",
                                      "Cowpea",
                                      "Gram",
                                      "Pease",
                                      "Cumin",
                                      "Mustard",
                                      "Turmeric",
                                      "Chili",
                                      "Oil",
                                      "Salt",
                                      "Onion Garlic Masala",
                                      "Garam Masala",
                                      "Vegetables",
                                    ].map((item) => (
                                      <th
                                        key={item}
                                        className="border-b border-r border-black p-0.5 text-[8px] truncate"
                                      >
                                        {getTranslatedItem(item)}
                                      </th>
                                    ))}
                                    <th className="border-b border-r border-black p-1 w-[6%]">
                                      {t(
                                        "पूरक आहार",
                                        "Supplementary food",
                                        "पूरक आहार",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black p-1 w-[5%]">
                                      {t(
                                        "लाभार्थीनिहाय खर्च",
                                        "Beneficiary wise expenditure",
                                        "लाभार्थीवार व्यय",
                                      )}
                                    </th>
                                    <th className="border-b border-black p-1 w-[5%]">
                                      {t(
                                        "भेट देणाऱ्या अधिकाऱ्याची स्वाक्षरी",
                                        "Signature of Visiting Officer",
                                        "निरीक्षण अधिकारी के हस्ताक्षर",
                                      )}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const days = getDaysInRegisterMonth();

                                    let sumTotalStudent = 0;
                                    let sumPlateCount = 0;
                                    let sumExpenditure = 0;

                                    const cerealSums = {
                                      Mugdal: 0,
                                      Turdal: 0,
                                      Masurdal: 0,
                                      Matki: 0,
                                      Moong: 0,
                                      Cowpea: 0,
                                      Gram: 0,
                                      Pease: 0,
                                      Cumin: 0,
                                      Mustard: 0,
                                      Turmeric: 0,
                                      Chili: 0,
                                      Oil: 0,
                                      Salt: 0,
                                      "Onion Garlic Masala": 0,
                                      "Garam Masala": 0,
                                      Vegetables: 0,
                                    };

                                    const getVal = (
                                      item: keyof typeof cerealSums,
                                      bene: number,
                                      record: any,
                                      day: any,
                                    ) => {
                                      const rule = quantityRules.find(
                                        (r) =>
                                          r.item.toLowerCase() ===
                                          item.toLowerCase(),
                                      );
                                      if (rule) {
                                        const selectedItems =
                                          record.selectedItems ||
                                          getSelectedItemsForRegisterDate(
                                            day.dateISO,
                                          );
                                        const isItemSelected = selectedItems
                                          ? !!selectedItems[rule.item]
                                          : true;
                                        if (!isItemSelected) {
                                          return "";
                                        }
                                        const qtyStr =
                                          registerClass === "6 To 8"
                                            ? rule.qty68
                                            : rule.qty15;
                                        const qty = Number(qtyStr) || 0;
                                        const val = (qty * bene) / 1000;
                                        cerealSums[item] += val;
                                        return val
                                          .toFixed(4)
                                          .replace(/\.?0+$/, "");
                                      }
                                      return "";
                                    };

                                    const rowsJSX = days.map((day) => {
                                      const record = registerRecords
                                        ? registerRecords[day.dateISO]
                                        : undefined;
                                      if (record) {
                                        const enrolled =
                                          Number(record.enrolled) || 45;
                                        const bene =
                                          Number(record.beneficiary) || 0;

                                        sumTotalStudent += enrolled;
                                        sumPlateCount += bene;

                                        const exp =
                                          bene *
                                          (registerClass === "6 To 8"
                                            ? 8.17
                                            : 5.45);
                                        sumExpenditure += exp;

                                        return (
                                          <tr key={day.srNo} className="h-5">
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.dateFormatted}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {enrolled}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5 font-bold">
                                              {bene}
                                            </td>
                                            {Object.keys(cerealSums).map(
                                              (item) => (
                                                <td
                                                  key={item}
                                                  className="border-b border-r border-black p-0.5"
                                                >
                                                  {getVal(
                                                    item as keyof typeof cerealSums,
                                                    bene,
                                                    record,
                                                    day,
                                                  )}
                                                </td>
                                              ),
                                            )}
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5 font-bold">
                                              {exp.toFixed(2)}
                                            </td>
                                            <td className="border-b border-black p-0.5"></td>
                                          </tr>
                                        );
                                      } else {
                                        return (
                                          <tr
                                            key={day.srNo}
                                            className="h-5 text-slate-400"
                                          >
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.dateFormatted}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            {Object.keys(cerealSums).map(
                                              (item) => (
                                                <td
                                                  key={item}
                                                  className="border-b border-r border-black p-0.5"
                                                ></td>
                                              ),
                                            )}
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-black p-0.5"></td>
                                          </tr>
                                        );
                                      }
                                    });

                                    const totalRowJSX = (
                                      <tr className="bg-slate-100 font-bold h-6 text-black">
                                        <td className="border-b border-r border-black p-0.5">
                                          {t("एकूण", "Total", "कुल")}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumTotalStudent}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumPlateCount}
                                        </td>
                                        {Object.keys(cerealSums).map((item) => (
                                          <td
                                            key={item}
                                            className="border-b border-r border-black p-0.5"
                                          >
                                            {cerealSums[
                                              item as keyof typeof cerealSums
                                            ]
                                              .toFixed(4)
                                              .replace(/\.?0+$/, "")}
                                          </td>
                                        ))}
                                        <td className="border-b border-r border-black p-0.5"></td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumExpenditure.toFixed(2)}
                                        </td>
                                        <td className="border-b border-black p-0.5"></td>
                                      </tr>
                                    );

                                    return (
                                      <>
                                        {rowsJSX}
                                        {totalRowJSX}
                                      </>
                                    );
                                  })()}
                                </tbody>
                              </table>

                              {/* Certificate */}
                              <div className="p-6 text-black border-t border-black print:border-t-2">
                                <h4 className="text-center font-bold text-xs mb-3">
                                  {t(
                                    "प्रमाणपत्र",
                                    "Certificate",
                                    "प्रमाण पत्र",
                                  )}
                                </h4>
                                <p className="text-[9.5px] leading-relaxed text-justify px-4">
                                  {t(
                                    "याद्वारे प्रमाणित करण्यात येते की, वरील नमूद केलेली रक्कम शालेय पोषण आहार योजनेच्या लाभार्थ्यांसाठी आवश्यक असलेल्या भाजीपाला, पूरक आहार, जळण आणि धान्यांच्या खरेदीवर खर्च करण्यात आली आहे. खर्च योग्य आहे आणि शालेय पोषण आहार योजनेसाठी सरकारच्या विहित मार्गदर्शक तत्त्वांनुसार दैनंदिन स्वयंपाकात साहित्याचा वापर करण्यात आला आहे. मला खात्री आहे की या साहित्याचा वापर अचूक आणि योग्य आहे. म्हणून, हे प्रमाणपत्र जारी केले जात आहे.",
                                    "It is hereby certified that the amount mentioned above has been spent on the purchase of vegetables, supplementary food, fuel, and grains required for the beneficiaries of the school nutrition program. The expenditure is appropriate, and the items have been used in the daily cooking as per the prescribed guidelines of the government for the school nutrition meal scheme. I am confident that the use of these materials is accurate and correct. Therefore, this certificate is being issued.",
                                    "यह प्रमाणित किया जाता है कि उपरोक्त राशि स्कूल पोषण कार्यक्रम के लाभार्थियों के लिए आवश्यक सब्जियों, पूरक आहार, ईंधन और खाद्यान्न की खरीद पर खर्च की गई है। व्यय उचित है, और सरकार के निर्धारित दिशानिर्देशों के अनुसार दैनिक भोजन पकाने में इन सामग्रियों का उपयोग किया गया है। मुझे विश्वास है कि इन सामग्रियों का उपयोग सटीक और सही है। इसलिए, यह प्रमाण पत्र जारी किया जा रहा है।",
                                  )}
                                </p>

                                <div className="flex justify-between items-center mt-10 px-8 text-[10px] font-bold">
                                  <div className="text-center">
                                    <p>
                                      {t(
                                        "मुख्याध्यापकांची स्वाक्षरी",
                                        "Signature of Principal",
                                        "प्रधानाध्यापक के हस्ताक्षर",
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p>
                                      {t("अध्यक्ष", "President", "अध्यक्ष")}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-normal">
                                      {t(
                                        "शाळा व्यवस्थापन समिती",
                                        "School Management Committee",
                                        "विद्यालय प्रबंधन समिति",
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #general-report-print, #general-report-print * {
                                  visibility: visible;
                                }
                                #general-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-4 print:hidden">
                              <button
                                onClick={() => window.print()}
                                className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("प्रिंट", "Print", "प्रिंट")}
                              </button>
                              <button
                                onClick={() =>
                                  setShowDailyRegisterReportModal(false)
                                }
                                className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("बंद करा", "Close", "बंद करें")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Rice Report Modal (Accounting of Cereals - Rice In Kilogram) */}
                      {showRiceReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[780px] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-auto print:overflow-visible bg-white print:border-none"
                              id="rice-report-print"
                            >
                              {/* Header */}
                              <div className="text-center text-black border-b border-black py-4 print:border-b-2">
                                <h3 className="font-bold text-sm tracking-[0.2em] uppercase">
                                  {profile?.schoolName || "A B C"}
                                </h3>
                                <p className="text-[10px] mt-1">
                                  {t("तालुका:", "Taluka:")}{" "}
                                  {profile?.taluka || ""},{" "}
                                  {t("जिल्हा:", "District:")}{" "}
                                  {profile?.district || ""}
                                </p>
                                <p className="text-[10px] mb-1">
                                  {t(
                                    "प्रधानमंत्री पोषण शक्ती निर्माण योजना",
                                    "Pradhan Mantri Poshan Shakti Nirman Yojana",
                                  )}
                                </p>

                                <div className="flex justify-center mt-1">
                                  <div className="bg-black text-white px-5 py-1 text-xs font-bold rounded shadow-sm print:border print:border-black print:text-black print:bg-white max-w-[90%]">
                                    {t(
                                      "शाळा स्तरावर ठेवायची दैनिक नोंदवही भाग-२ (धान्य हिशोब)",
                                      "Daily Register to be maintained at school level Part-II (Accounting of Cereals)",
                                      "विद्यालय स्तर पर रखी जाने वाली दैनिक पंजी भाग-II (खाद्यान्न लेखा)",
                                    )}{" "}
                                    ( {t("इयत्ता", "Class", "कक्षा")}{" "}
                                    {registerClass === "6 To 8"
                                      ? t("६ ते ८", "6 To 8", "6 से 8")
                                      : t("१ ते ५", "1 To 5", "1 से 5")}{" "}
                                    )
                                  </div>
                                </div>
                                <div className="flex justify-between items-center px-4 text-[10px] font-bold mt-2">
                                  <span>
                                    {t(
                                      "तांदूळ (किलोग्राम मध्ये)",
                                      "Rice In Kilogram",
                                      "चावल (किलोग्राम में)",
                                    )}
                                  </span>
                                  <span>
                                    {t("महिना:", "Month:")}{" "}
                                    {getRegisterMonthYear()}
                                  </span>
                                </div>
                              </div>

                              {/* Table */}
                              <table className="w-full border-collapse text-black text-[9.5px] text-center">
                                <thead>
                                  <tr className="bg-slate-50 font-bold">
                                    <th className="border-b border-r border-black py-2 font-bold w-[7%]">
                                      {t("अ.क्र.", "Sr. No", "क्र.")}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[12%]">
                                      {t("दिनांक", "Date", "दिनांक")}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "पटसंख्या",
                                        "Students Strength",
                                        "छात्र संख्या",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[12%]">
                                      {t(
                                        "मागील महिन्यातील शिल्लक तांदूळ",
                                        "Left over rice from last month",
                                        "पिछले महीने का शेष चावल",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[12%]">
                                      {t(
                                        "चालू महिन्यात प्राप्त तांदूळ",
                                        "Rice received in current month",
                                        "चालू माह में प्राप्त चावल",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "एकूण तांदूळ",
                                        "Total Rice",
                                        "कुल चावल",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "लाभार्थी संख्या",
                                        "Beneficiary count",
                                        "लाभार्थी संख्या",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "शिजवलेला तांदूळ",
                                        "Cooked rice",
                                        "पकाया गया चावल",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "शिल्लक तांदूळ",
                                        "Leftover rice",
                                        "शेष चावल",
                                      )}
                                    </th>
                                    <th className="border-b border-r border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "मुख्याध्यापकांची स्वाक्षरी",
                                        "Principal signature",
                                        "प्रधानाध्यापक के हस्ताक्षर",
                                      )}
                                    </th>
                                    <th className="border-b border-black py-2 font-bold w-[10%]">
                                      {t(
                                        "भेट देणाऱ्या अधिकाऱ्याची स्वाक्षरी",
                                        "Signature of Visiting Officer",
                                        "निरीक्षण अधिकारी के हस्ताक्षर",
                                      )}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const days = getDaysInRegisterMonth();

                                    let sumTotalStudent = 0;
                                    let sumOpeningRice = 120.0; // Realistic sample opening stock
                                    let sumRiceReceived = 200.0; // Realistic sample received stock
                                    let sumTotalRice =
                                      sumOpeningRice + sumRiceReceived;
                                    let sumPlateCount = 0;
                                    let sumCookedRice = 0;
                                    let sumLeftoverRice = sumTotalRice;

                                    let currentOpening = sumOpeningRice;
                                    let currentReceived = sumRiceReceived;

                                    const rowsJSX = days.map((day, idx) => {
                                      const record = registerRecords
                                        ? registerRecords[day.dateISO]
                                        : undefined;

                                      // Day 1 has rice receipt, others 0
                                      const dayRecv =
                                        idx === 0 ? currentReceived : 0;
                                      const dayTotal = currentOpening + dayRecv;

                                      if (record) {
                                        const enrolled =
                                          Number(record.enrolled) || 45;
                                        const bene =
                                          Number(record.beneficiary) || 0;

                                        sumTotalStudent += enrolled;
                                        sumPlateCount += bene;

                                        // Rice quantity rule: 100g or 150g per student
                                        const selectedItems =
                                          record.selectedItems ||
                                          getSelectedItemsForRegisterDate(
                                            day.dateISO,
                                          );
                                        const isRiceSelected = selectedItems
                                          ? !!selectedItems["Rice"]
                                          : true;
                                        const riceRule = quantityRules.find(
                                          (r) =>
                                            r.item.toLowerCase() === "rice",
                                        );
                                        const customRiceQty = riceRule
                                          ? registerClass === "6 To 8"
                                            ? Number(riceRule.qty68) || 0
                                            : Number(riceRule.qty15) || 0
                                          : registerClass === "6 To 8"
                                            ? 150
                                            : 100;
                                        const riceQtyPerStudent = isRiceSelected
                                          ? customRiceQty / 1000
                                          : 0;
                                        const dayCooked =
                                          bene * riceQtyPerStudent;
                                        sumCookedRice += dayCooked;

                                        const dayLeftover =
                                          dayTotal - dayCooked;
                                        currentOpening = dayLeftover; // Carry forward to next day

                                        return (
                                          <tr key={day.srNo} className="h-5">
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.srNo}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.dateFormatted}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {enrolled}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {(dayTotal - dayRecv).toFixed(2)}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {dayRecv.toFixed(2)}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {dayTotal.toFixed(2)}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5 font-bold">
                                              {bene}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5 font-bold">
                                              {dayCooked.toFixed(2)}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5 font-bold">
                                              {dayLeftover.toFixed(2)}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-black p-0.5"></td>
                                          </tr>
                                        );
                                      } else {
                                        // Carry forward opening stock
                                        const dayLeftover = dayTotal;
                                        currentOpening = dayLeftover;

                                        return (
                                          <tr
                                            key={day.srNo}
                                            className="h-5 text-slate-400"
                                          >
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.srNo}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5">
                                              {day.dateFormatted}
                                            </td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-r border-black p-0.5"></td>
                                            <td className="border-b border-black p-0.5"></td>
                                          </tr>
                                        );
                                      }
                                    });

                                    sumLeftoverRice = currentOpening;

                                    const totalRowJSX = (
                                      <tr className="bg-slate-100 font-bold h-6 text-black">
                                        <td
                                          className="border-b border-r border-black p-0.5"
                                          colSpan={2}
                                        >
                                          {t("एकूण", "Total", "कुल")}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumTotalStudent}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumOpeningRice.toFixed(2)}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumRiceReceived.toFixed(2)}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumTotalRice.toFixed(2)}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumPlateCount}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumCookedRice.toFixed(2)}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5">
                                          {sumLeftoverRice.toFixed(2)}
                                        </td>
                                        <td className="border-b border-r border-black p-0.5"></td>
                                        <td className="border-b border-black p-0.5"></td>
                                      </tr>
                                    );

                                    return (
                                      <>
                                        {rowsJSX}
                                        {totalRowJSX}
                                      </>
                                    );
                                  })()}
                                </tbody>
                              </table>

                              {/* Certificate */}
                              <div className="p-6 text-black border-t border-black print:border-t-2">
                                <h4 className="text-center font-bold text-xs mb-3">
                                  {t(
                                    "प्रमाणपत्र",
                                    "Certificate",
                                    "प्रमाण पत्र",
                                  )}
                                </h4>
                                <p className="text-[9.5px] leading-relaxed text-justify px-4">
                                  {t(
                                    "याद्वारे प्रमाणित करण्यात येते की, वरील नमूद केलेली रक्कम शालेय पोषण आहार योजनेच्या लाभार्थ्यांसाठी आवश्यक असलेल्या भाजीपाला, पूरक आहार, जळण आणि धान्यांच्या खरेदीवर खर्च करण्यात आली आहे. खर्च योग्य आहे आणि शालेय पोषण आहार योजनेसाठी सरकारच्या विहित मार्गदर्शक तत्त्वांनुसार दैनंदिन स्वयंपाकात साहित्याचा वापर करण्यात आला आहे. मला खात्री आहे की या साहित्याचा वापर अचूक आणि योग्य आहे. म्हणून, हे प्रमाणपत्र जारी केले जात आहे.",
                                    "It is hereby certified that the amount mentioned above has been spent on the purchase of vegetables, supplementary food, fuel, and grains required for the beneficiaries of the school nutrition program. The expenditure is appropriate, and the items have been used in the daily cooking as per the prescribed guidelines of the government for the school nutrition meal scheme. I am confident that the use of these materials is accurate and correct. Therefore, this certificate is being issued.",
                                    "यह प्रमाणित किया जाता है कि उपरोक्त राशि स्कूल पोषण कार्यक्रम के लाभार्थियों के लिए आवश्यक सब्जियों, पूरक आहार, ईंधन और खाद्यान्न की खरीद पर खर्च की गई है। व्यय उचित है, और सरकार के निर्धारित दिशानिर्देशों के अनुसार दैनिक भोजन पकाने में इन सामग्रियों का उपयोग किया गया है। मुझे विश्वास है कि इन सामग्रियों का उपयोग सटीक और सही है। इसलिए, यह प्रमाण पत्र जारी किया जा रहा है।",
                                  )}
                                </p>

                                <div className="flex justify-between items-center mt-10 px-8 text-[10px] font-bold">
                                  <div className="text-center">
                                    <p>
                                      {t(
                                        "मुख्याध्यापकांची स्वाक्षरी",
                                        "Signature of Principal",
                                        "प्रधानाध्यापक के हस्ताक्षर",
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p>
                                      {t("अध्यक्ष", "President", "अध्यक्ष")}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-normal">
                                      {t(
                                        "शाळा व्यवस्थापन समिती",
                                        "School Management Committee",
                                        "विद्यालय प्रबंधन समिति",
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #rice-report-print, #rice-report-print * {
                                  visibility: visible;
                                }
                                #rice-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-4 print:hidden">
                              <button
                                onClick={() => window.print()}
                                className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("प्रिंट", "Print", "प्रिंट")}
                              </button>
                              <button
                                onClick={() => setShowRiceReportModal(false)}
                                className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                              >
                                {t("बंद करा", "Close", "बंद करें")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. STOCK TAB */}
                {activeTab === "stock" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t_global.mdm_stock_now}
                        </h2>
                      </div>

                      {/* Dropdowns Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 text-slate-800 w-full">
                        <div className="space-y-2">
                          <label className="text-sm font-bold block text-slate-800">
                            {t("वर्ष:", "Year:")}
                          </label>
                          <select
                            value={stockYear}
                            onChange={(e) => {
                              setStockYear(e.target.value);
                            }}
                            className="w-full h-10 px-3 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          >
                            <option value="Select Year">
                              {t("वर्ष निवडा", "Select Year")}
                            </option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold block text-slate-800">
                            {t("महिना:", "Month:")}
                          </label>
                          <select
                            value={stockMonth}
                            onChange={(e) => {
                              setStockMonth(e.target.value);
                            }}
                            className="w-full h-10 px-3 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          >
                            <option value="Select Month">
                              {t("महिना निवडा", "Select Month")}
                            </option>
                            {[
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].map((m) => (
                              <option key={m} value={m}>
                                {t(
                                  m === "January"
                                    ? "जानेवारी"
                                    : m === "February"
                                      ? "फेब्रुवारी"
                                      : m === "March"
                                        ? "मार्च"
                                        : m === "April"
                                          ? "एप्रिल"
                                          : m === "May"
                                            ? "मे"
                                            : m === "June"
                                              ? "जून"
                                              : m === "July"
                                                ? "जुलै"
                                                : m === "August"
                                                  ? "ऑगस्ट"
                                                  : m === "September"
                                                    ? "सप्टेंबर"
                                                    : m === "October"
                                                      ? "ऑक्टोबर"
                                                      : m === "November"
                                                        ? "नोव्हेंबर"
                                                        : "डिसेंबर",
                                  m,
                                  m === "January"
                                    ? "जनवरी"
                                    : m === "February"
                                      ? "फरवरी"
                                      : m === "March"
                                        ? "मार्च"
                                        : m === "April"
                                          ? "अप्रैल"
                                          : m === "May"
                                            ? "मई"
                                            : m === "June"
                                              ? "जून"
                                              : m === "July"
                                                ? "जुलाई"
                                                : m === "August"
                                                  ? "अगस्त"
                                                  : m === "September"
                                                    ? "सितंबर"
                                                    : m === "October"
                                                      ? "अक्टूबर"
                                                      : m === "November"
                                                        ? "नवंबर"
                                                        : "दिसंबर",
                                )}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold block text-slate-800">
                            {t("इयत्ता:", "Class:")}
                          </label>
                          <select
                            value={stockClass}
                            onChange={(e) => {
                              setStockClass(e.target.value);
                            }}
                            className="w-full h-10 px-3 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          >
                            <option value="Select Class">
                              {t("इयत्ता निवडा", "Select Class")}
                            </option>
                            <option value="1 To 5">
                              {t("१ ते ५", "1 To 5", "1 से 5")}
                            </option>
                            <option value="6 To 8">
                              {t("६ ते ८", "6 To 8", "6 से 8")}
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Buttons Row */}
                      <div className="flex justify-center items-center gap-6 py-4 w-full">
                        <button
                          onClick={handleViewStockData}
                          className="px-6 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-sm font-semibold transition-colors"
                        >
                          {t("माहिती पहा", "View Data")}
                        </button>
                        <button
                          onClick={handleStockReport}
                          className="px-6 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-white rounded text-sm font-semibold transition-colors"
                        >
                          {t("अहवाल", "Report")}
                        </button>
                      </div>

                      {showStockTable && (
                        <>
                          {/* Divider */}
                          <div className="h-px w-full bg-slate-300" />

                          {/* Table Section */}
                          <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse border border-black text-slate-900 bg-white">
                              <thead>
                                <tr className="bg-slate-50 font-bold">
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[15%]">
                                    {t("धान्य/माल", "Goods", "सामग्री")}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "मागील साठा",
                                      "Previous Stock",
                                      "पिछला स्टॉक",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "प्राप्त धान्य",
                                      "Received Goods",
                                      "प्राप्त स्टॉक",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "एकूण धान्य",
                                      "Total Goods",
                                      "कुल स्टॉक",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "भोजन शिजवलेले दिवस",
                                      "Food Cooked Days",
                                      "भोजन पकाने के दिन",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "लाभार्थी - चालू महिन्यात",
                                      "Beneficiary - in current month",
                                      "लाभार्थी - चालू माह",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[12%]">
                                    {t(
                                      "भोजनासाठी वापरलेले साहित्य",
                                      "Items used for cooking food",
                                      "पकाने में प्रयुक्त सामग्री",
                                    )}
                                  </th>
                                  <th className="border border-black p-2 text-xs font-bold text-center w-[13%]">
                                    {t(
                                      "शिल्लक धान्य",
                                      "Remaining Goods",
                                      "शेष सामग्री",
                                    )}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {stockRecords.map((item, idx) => {
                                  const totalGoods =
                                    Number(item.prev) + Number(item.received);
                                  const remainingGoods =
                                    totalGoods - Number(item.used);

                                  return (
                                    <tr
                                      key={idx}
                                      className="bg-white h-8 text-xs"
                                    >
                                      {/* Goods */}
                                      <td className="border border-black p-1 text-center font-bold text-slate-800">
                                        {t(
                                          item.item === "Rice"
                                            ? "तांदूळ"
                                            : item.item === "Mugdal"
                                              ? "मूग डाळ"
                                              : item.item === "Turdal"
                                                ? "तूर डाळ"
                                                : item.item === "Masurdal"
                                                  ? "मसूर डाळ"
                                                  : item.item === "Matki"
                                                    ? "मटकी"
                                                    : item.item === "Moong"
                                                      ? "मूग"
                                                      : item.item === "Cowpea"
                                                        ? "चवळी"
                                                        : item.item === "Gram"
                                                          ? "हरभरा"
                                                          : item.item ===
                                                              "Pease"
                                                            ? "वाटाणा"
                                                            : item.item ===
                                                                "Cumin"
                                                              ? "जिरे"
                                                              : item.item ===
                                                                  "Mustard"
                                                                ? "मोहरी"
                                                                : item.item ===
                                                                    "Turmeric"
                                                                  ? "हळद"
                                                                  : item.item ===
                                                                      "Chili"
                                                                    ? "मिरची"
                                                                    : item.item ===
                                                                        "Oil"
                                                                      ? "तेल"
                                                                      : item.item ===
                                                                          "Salt"
                                                                        ? "मीठ"
                                                                        : item.item ===
                                                                            "Onion Garlic Masala"
                                                                          ? "कांदा लसूण मसाला"
                                                                          : item.item ===
                                                                              "Garam Masala"
                                                                            ? "गरम मसाला"
                                                                            : item.item ===
                                                                                "Vegetables"
                                                                              ? "भाजीपाला"
                                                                              : item.item ===
                                                                                  "Milk-Milk Powder"
                                                                                ? "दूध/दूध पावडर"
                                                                                : item.item ===
                                                                                    "Sugar-Jaggery"
                                                                                  ? "साखर/गूळ"
                                                                                  : item.item ===
                                                                                      "Soyabean Wadi"
                                                                                    ? "सोयाबीन वडी"
                                                                                    : item.item ===
                                                                                        "Ragi Satva"
                                                                                      ? "नाचणी सत्व"
                                                                                      : item.item ===
                                                                                          "Expenses"
                                                                                        ? "खर्च"
                                                                                        : item.item,
                                          item.item,
                                          item.item === "Rice"
                                            ? "चावल"
                                            : item.item === "Mugdal"
                                              ? "मूग दाल"
                                              : item.item === "Turdal"
                                                ? "अरहर दाल (तूर दाल)"
                                                : item.item === "Masurdal"
                                                  ? "मसूर दाल"
                                                  : item.item === "Matki"
                                                    ? "मटकी"
                                                    : item.item === "Moong"
                                                      ? "मूग"
                                                      : item.item === "Cowpea"
                                                        ? "लोबिया"
                                                        : item.item === "Gram"
                                                          ? "चना"
                                                          : item.item ===
                                                              "Pease"
                                                            ? "मटर"
                                                            : item.item ===
                                                                "Cumin"
                                                              ? "जीरा"
                                                              : item.item ===
                                                                  "Mustard"
                                                                ? "सरसों"
                                                                : item.item ===
                                                                    "Turmeric"
                                                                  ? "हल्दी"
                                                                  : item.item ===
                                                                      "Chili"
                                                                    ? "मिर्च"
                                                                    : item.item ===
                                                                        "Oil"
                                                                      ? "तेल"
                                                                      : item.item ===
                                                                          "Salt"
                                                                        ? "नमक"
                                                                        : item.item ===
                                                                            "Onion Garlic Masala"
                                                                          ? "प्याज लहसुन मसाला"
                                                                          : item.item ===
                                                                              "Garam Masala"
                                                                            ? "गरम मसाला"
                                                                            : item.item ===
                                                                                "Vegetables"
                                                                              ? "सब्जियाँ"
                                                                              : item.item ===
                                                                                  "Milk-Milk Powder"
                                                                                ? "दूध पाउडर"
                                                                                : item.item ===
                                                                                    "Sugar-Jaggery"
                                                                                  ? "चीनी/गुड़"
                                                                                  : item.item ===
                                                                                      "Soyabean Wadi"
                                                                                    ? "सोयाबीन वडी"
                                                                                    : item.item ===
                                                                                        "Ragi Satva"
                                                                                      ? "रागी सत्व"
                                                                                      : item.item ===
                                                                                          "Expenses"
                                                                                        ? "खर्च"
                                                                                        : item.item,
                                        )}
                                      </td>

                                      {/* Previous Stock */}
                                      <td className="border border-black p-1 text-center">
                                        <input
                                          type="number"
                                          value={item.prev}
                                          readOnly
                                          className="w-[90%] mx-auto text-center border border-slate-200 rounded p-1 outline-none bg-slate-50 text-slate-500 font-bold"
                                        />
                                      </td>

                                      {/* Received Goods */}
                                      <td className="border border-black p-1 text-center">
                                        <input
                                          type="number"
                                          value={item.received}
                                          readOnly
                                          className="w-[90%] mx-auto text-center border border-slate-200 rounded p-1 outline-none bg-slate-50 text-slate-500 font-bold"
                                        />
                                      </td>

                                      {/* Total Goods */}
                                      <td className="border border-black p-1 text-center font-bold text-slate-700">
                                        {totalGoods}
                                      </td>

                                      {/* Food Cooked Days */}
                                      <td className="border border-black p-1 text-center">
                                        <input
                                          type="number"
                                          value={item.cookedDays}
                                          readOnly
                                          className="w-[90%] mx-auto text-center border border-slate-200 rounded p-1 outline-none bg-slate-50 text-slate-500 font-bold"
                                        />
                                      </td>

                                      {/* Beneficiary - in current month */}
                                      <td className="border border-black p-1 text-center">
                                        <input
                                          type="number"
                                          value={item.beneficiary}
                                          readOnly
                                          className="w-[90%] mx-auto text-center border border-slate-200 rounded p-1 outline-none bg-slate-50 text-slate-500 font-bold"
                                        />
                                      </td>

                                      {/* Items used for cooking food */}
                                      <td className="border border-black p-1 text-center">
                                        <input
                                          type="number"
                                          value={item.used}
                                          readOnly
                                          className="w-[90%] mx-auto text-center border border-slate-200 rounded p-1 outline-none bg-slate-50 text-slate-500 font-bold"
                                        />
                                      </td>

                                      {/* Remaining Goods */}
                                      <td className="border border-black p-1 text-center font-bold text-teal-600">
                                        {remainingGoods}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Save Button Row */}
                          <div className="py-2 w-full flex justify-start">
                            <button
                              onClick={handleSaveStock}
                              className="px-5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-xs font-bold shadow-md transition-colors"
                            >
                              {t("जतन करा", "Save")}
                            </button>
                          </div>
                        </>
                      )}

                      {/* B-Form Report Modal (Current Stock "B" Form Report Overlay) */}
                      {showStockReportModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm font-sans p-4">
                          <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[95%] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto font-sans text-slate-900 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)]">
                            {/* Printable Area */}
                            <div
                              className="border border-black flex-1 overflow-auto print:overflow-visible bg-white print:border-none"
                              id="stock-report-print"
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center text-black border-b border-black p-4 font-sans print:border-b-2">
                                {/* Left Column */}
                                <div className="text-left text-[11px] leading-relaxed w-[30%]">
                                  <p>{t("केंद्र :", "Center :")}</p>
                                  <p className="font-bold">
                                    {t("शाळेचे नाव :", "School Name :")}{" "}
                                    {profile?.schoolName || "A B C"}
                                  </p>
                                  <p>{t("तालुका , जिल्हा", "Tal , Dist.")}</p>
                                </div>

                                {/* Center Column */}
                                <div className="text-center flex flex-col items-center flex-1 w-[40%]">
                                  <p className="text-[11px] font-semibold tracking-wide">
                                    {t(
                                      "प्रधानमंत्री पोषण शक्ती निर्माण योजना",
                                      "Pradhan Mantri Poshan Shakti Nirman Yojana",
                                    )}
                                  </p>
                                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                    {t("इयत्ता", "Class")}{" "}
                                    {stockClass === "6 To 8"
                                      ? "VI To VIII"
                                      : "I To V"}
                                  </p>

                                  <div className="mt-2 bg-black text-white px-5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide">
                                    {t('मासिक "ब" पत्रक', 'Monthly "B" Form')}
                                  </div>
                                </div>

                                {/* Right Column Box */}
                                <div className="text-right w-[30%] flex justify-end">
                                  <div className="border border-black p-2 rounded text-[11px] bg-slate-50 print:bg-white text-left font-medium w-[220px] leading-relaxed">
                                    <p>
                                      <span className="font-bold">
                                        {t("एकूण लाभार्थी:", "Students count:")}
                                      </span>{" "}
                                      {stockRecords.reduce(
                                        (acc, item) => acc + item.beneficiary,
                                        0,
                                      )}{" "}
                                      &nbsp;&nbsp;{" "}
                                      <span className="font-bold">
                                        {t("कामकाजाचे दिवस:", "Working Days:")}
                                      </span>{" "}
                                      {stockRecords.reduce(
                                        (acc, item) => acc + item.cookedDays,
                                        0,
                                      )}
                                    </p>
                                    <p className="mt-1">
                                      <span className="font-bold">
                                        {t("महिना:", "Month:")}
                                      </span>{" "}
                                      {t(
                                        stockMonth === "January"
                                          ? "जानेवारी"
                                          : stockMonth === "February"
                                            ? "फेब्रुवारी"
                                            : stockMonth === "March"
                                              ? "मार्च"
                                              : stockMonth === "April"
                                                ? "एप्रिल"
                                                : stockMonth === "May"
                                                  ? "मे"
                                                  : stockMonth === "June"
                                                    ? "जून"
                                                    : stockMonth === "July"
                                                      ? "जुलै"
                                                      : stockMonth === "August"
                                                        ? "ऑगस्ट"
                                                        : stockMonth ===
                                                            "September"
                                                          ? "सप्टेंबर"
                                                          : stockMonth ===
                                                              "October"
                                                            ? "ऑक्टोबर"
                                                            : stockMonth ===
                                                                "November"
                                                              ? "नोव्हेंबर"
                                                              : "डिसेंबर",
                                        stockMonth,
                                        stockMonth === "January"
                                          ? "जनवरी"
                                          : stockMonth === "February"
                                            ? "फरवरी"
                                            : stockMonth === "March"
                                              ? "मार्च"
                                              : stockMonth === "April"
                                                ? "अप्रैल"
                                                : stockMonth === "May"
                                                  ? "मई"
                                                  : stockMonth === "June"
                                                    ? "जून"
                                                    : stockMonth === "July"
                                                      ? "जुलाई"
                                                      : stockMonth === "August"
                                                        ? "अगस्त"
                                                        : stockMonth ===
                                                            "September"
                                                          ? "सितंबर"
                                                          : stockMonth ===
                                                              "October"
                                                            ? "अक्टूबर"
                                                            : stockMonth ===
                                                                "November"
                                                              ? "नवंबर"
                                                              : "दिसंबर",
                                      )}{" "}
                                      {stockYear}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Table */}
                              <table className="w-full border-collapse text-black text-[9px] text-center table-fixed">
                                <thead>
                                  <tr className="bg-slate-100 font-bold">
                                    <th className="border-b border-r border-black p-1 w-[5%]">
                                      {t("अ.क्र.", "Sr. No.", "क्र.")}
                                    </th>
                                    <th className="border-b border-r border-black p-1 w-[12%]">
                                      {t("साहित्य", "Items", "सामग्री")}
                                    </th>
                                    {stockRecords.slice(0, 17).map((item) => (
                                      <th
                                        key={item.item}
                                        className="border-b border-r border-black p-0.5 text-[8.5px] truncate"
                                      >
                                        {getTranslatedItem(item.item)}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    {
                                      label: t(
                                        "मागील शिल्लक साठा (१)",
                                        "Opening Balance (Previous Month Balance)",
                                        "पिछला शेष स्टॉक (१)",
                                      ),
                                      field: "prev",
                                    },
                                    {
                                      label: t(
                                        "चालू महिन्यात प्राप्त झालेला साठा (२)",
                                        "Received In Current Month",
                                        "चालू माह में प्राप्त स्टॉक (२)",
                                      ),
                                      field: "received",
                                    },
                                    {
                                      label: t(
                                        "एकूण साठा (३) (१ + २)",
                                        "Total Stock (1 + 2)",
                                        "कुल स्टॉक (३) (१ + २)",
                                      ),
                                      isSum: true,
                                    },
                                    {
                                      label: t(
                                        "भोजन शिजवलेले दिवस (४)",
                                        "Cooked Food Days",
                                        "भोजन पकाने के दिन (४)",
                                      ),
                                      field: "cookedDays",
                                    },
                                    {
                                      label: t(
                                        "चालू महिन्यातील एकूण लाभार्थी (५)",
                                        "Beneficiary - current Month",
                                        "चालू माह के कुल लाभार्थी (५)",
                                      ),
                                      field: "beneficiary",
                                    },
                                    {
                                      label: t(
                                        "प्रत्यक्षात भोजनासाठी वापरलेले धान्य (६)",
                                        "Cooked rice and grains",
                                        "भोजन पकाने में प्रयुक्त सामग्री (६)",
                                      ),
                                      field: "used",
                                    },
                                    {
                                      label: t(
                                        "महिन्याच्या शेवटी शिल्लक राहिलेला साठा (७) (३ - ६)",
                                        "Month End Balance (3 - 6)",
                                        "माह के अंत में शेष स्टॉक (७) (३ - ६)",
                                      ),
                                      isRemaining: true,
                                    },
                                  ].map((rowDef, rIdx) => (
                                    <tr key={rIdx} className="h-6">
                                      <td className="border-b border-r border-black p-0.5 font-bold">
                                        {rIdx + 1}
                                      </td>
                                      <td className="border-b border-r border-black p-1 text-left font-medium leading-tight">
                                        {rowDef.label}
                                      </td>
                                      {stockRecords.slice(0, 17).map((item) => {
                                        let val = 0;
                                        if (rowDef.isSum) {
                                          val =
                                            Number(item.prev) +
                                            Number(item.received);
                                        } else if (rowDef.isRemaining) {
                                          val =
                                            Number(item.prev) +
                                            Number(item.received) -
                                            Number(item.used);
                                        } else {
                                          val = rowDef.field
                                            ? (item[
                                                rowDef.field as keyof typeof item
                                              ] as number) || 0
                                            : 0;
                                        }
                                        return (
                                          <td
                                            key={item.item}
                                            className="border-b border-r border-black p-0.5 font-bold"
                                          >
                                            {val}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Additional details row */}
                            <div className="flex flex-col lg:flex-row border-t border-black p-4 justify-between items-stretch gap-6 print:border-t-2">
                              {/* Left table for details of vegetables, milk, sugar, soybean, ragi satva */}
                              <div className="w-[300px] border border-black rounded p-2 bg-white">
                                <table className="w-full text-[9px] text-center border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 font-bold border-b border-black">
                                      <th className="p-1 border-r border-black w-[50%]">
                                        {t("तपशील", "Details", "विवरण")}
                                      </th>
                                      <th className="p-1 w-[50%]">
                                        {t(
                                          "एकूण वापर (कि.ग्रॅ./लीटर)",
                                          "Consumption kg/litre",
                                          "कुल खपत",
                                        )}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      {
                                        label: t(
                                          "भाजीपाला",
                                          "vegetables",
                                          "सब्जियाँ",
                                        ),
                                        itemKey: "Vegetables",
                                        suffix: t(
                                          "कि.ग्रॅ.",
                                          "k.g.",
                                          "कि.ग्रा.",
                                        ),
                                      },
                                      {
                                        label: t(
                                          "दूध / दूध पावडर",
                                          "milk / milk powder",
                                          "दूध पाउडर",
                                        ),
                                        itemKey: "Milk-Milk Powder",
                                        suffix: t("लीटर", "liter", "लीटर"),
                                      },
                                      {
                                        label: t(
                                          "साखर / गूळ",
                                          "sugar / jaggery",
                                          "चीनी/गुड़",
                                        ),
                                        itemKey: "Sugar-Jaggery",
                                        suffix: t(
                                          "कि.ग्रॅ.",
                                          "k.g.",
                                          "कि.ग्रा.",
                                        ),
                                      },
                                      {
                                        label: t(
                                          "सोयाबीन वडी",
                                          "Soybean wadi",
                                          "सोयाबीन वड़ी",
                                        ),
                                        itemKey: "Soyabean Wadi",
                                        suffix: t(
                                          "कि.ग्रॅ.",
                                          "k.g.",
                                          "कि.ग्रा.",
                                        ),
                                      },
                                      {
                                        label: t(
                                          "नाचणी सत्व",
                                          "ragi satva",
                                          "रागी सत्व",
                                        ),
                                        itemKey: "Ragi Satva",
                                        suffix: t(
                                          "कि.ग्रॅ.",
                                          "k.g.",
                                          "कि.ग्रा.",
                                        ),
                                      },
                                    ].map((rowDef, rIdx) => {
                                      const s = stockRecords.find(
                                        (n) => n.item === rowDef.itemKey,
                                      );
                                      const usedVal = s ? s.used : 0;
                                      return (
                                        <tr
                                          key={rIdx}
                                          className="border-b border-black last:border-b-0 h-5 text-black"
                                        >
                                          <td className="p-0.5 border-r border-black text-left pl-2 font-medium">
                                            {rowDef.label}
                                          </td>
                                          <td className="p-0.5 font-bold">
                                            {usedVal} {rowDef.suffix}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Center counts */}
                              <div className="flex flex-col justify-start gap-4 text-[9.5px] font-bold text-black min-w-[220px]">
                                <div className="border border-black p-2 rounded bg-white">
                                  {t(
                                    "एकूण स्वयंपाकी व मदतनीस - ",
                                    "No. of cooks and helpers - ",
                                    "कुल रसोइया और सहायक - ",
                                  )}{" "}
                                  {helpers.length}
                                </div>
                                <div className="border border-black p-2 rounded bg-white">
                                  {t(
                                    "एकूण लाभार्थी संख्या - ",
                                    "Beneficiary Count - ",
                                    "कुल लाभार्थी संख्या - ",
                                  )}{" "}
                                  {stockRecords.reduce(
                                    (acc, item) => acc + item.beneficiary,
                                    0,
                                  )}
                                </div>
                              </div>

                              {/* Right Principal signature & stamp */}
                              <div className="flex-1 flex flex-col justify-between text-right text-[9.5px] text-black pr-4 min-h-[100px]">
                                <div className="space-y-1 font-bold text-left pl-6 leading-relaxed">
                                  <p>
                                    {t(
                                      "मासिक ब पत्रकातील माहिती तपासली असून शाळा स्तरावरील साठा नोंदवही जुळते व अचूक आहे.",
                                      "The monthly B sheet of this has been checked and the stock register is correct and accurate.",
                                      "मासिक बी पत्रक की जानकारी जांची गई है और स्कूल स्तर के स्टॉक रजिस्टर से मेल खाती है और सटीक है।",
                                    )}
                                  </p>
                                  <p className="text-slate-500 font-normal">
                                    {t(
                                      "मासिक ब पत्रक महिन्याच्या १ तारखेपर्यंत केंद्रप्रमुखांना सादर करण्यात यावे.",
                                      "The monthly B sheet should be submitted to the Head of the Centre by the 1st of the month.",
                                      "मासिक बी पत्रक महीने की १ तारीख तक केंद्र प्रमुख को प्रस्तुत किया जाना चाहिए।",
                                    )}
                                  </p>
                                </div>
                                <div className="font-bold mt-8">
                                  {t(
                                    "मुख्याध्यापकाची सही व शिक्का",
                                    "Principal Signature and Stamp",
                                    "प्रधानाध्यापक के हस्ताक्षर और मुहर",
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <style>{`
                            @media print {
                              body * {
                                visibility: hidden;
                              }
                              #stock-report-print, #stock-report-print * {
                                visibility: visible;
                              }
                              #stock-report-print {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                margin: 0;
                                padding: 0;
                              }
                            }
                          `}</style>

                          <div className="flex justify-end gap-3 mt-4 print:hidden">
                            <button
                              onClick={() => window.print()}
                              className="px-5 py-1.5 bg-[#007bff] hover:bg-blue-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                            >
                              {t("प्रिंट", "Print", "प्रिंट")}
                            </button>
                            <button
                              onClick={() => setShowStockReportModal(false)}
                              className="px-5 py-1.5 bg-[#f44336] hover:bg-red-700 text-white rounded text-[13px] font-semibold shadow-md transition-colors"
                            >
                              {t("बंद करा", "Close", "बंद करें")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. DEMAND TAB */}
                {activeTab === "demand" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[800px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t("मागणी", "Demand", "मांग")}
                        </h2>
                      </div>

                      {/* Dropdowns Row 1 */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 text-slate-800 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {t(
                              "पासून दिनांक :",
                              "From Date :",
                              "प्रारंभ तिथि :",
                            )}
                          </span>
                          <input
                            type="date"
                            value={demandFromDate}
                            onChange={(e) => setDemandFromDate(e.target.value)}
                            className="h-8 px-2 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {t(
                              "धान्य सामग्री :",
                              "Menu content:",
                              "खाद्य सामग्री :",
                            )}
                          </span>
                          <select
                            value={demandContent}
                            onChange={(e) =>
                              handleDemandContentChange(e.target.value)
                            }
                            className="h-8 px-2 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400 min-w-[140px]"
                          >
                            <option value="Select content">
                              {t(
                                "सामग्री निवडा",
                                "Select content",
                                "सामग्री चुनें",
                              )}
                            </option>
                            {[
                              "Rice",
                              "Mugdal",
                              "Turdal",
                              "Masurdal",
                              "Matki",
                              "Moong",
                              "Cowpea",
                              "Gram",
                              "Pease",
                              "Oil",
                              "Salt",
                              "Onion Garlic Masala",
                              "Garam Masala",
                              "Chili",
                              "Vegetables",
                              "Milk-Milk Powder",
                              "Sugar-Jaggery",
                              "Soyabean Wadi",
                              "Ragi Satva",
                            ].map((c) => (
                              <option key={c} value={c}>
                                {getTranslatedItem(c)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {t("मागणी :", "Demand :", "मांग :")}
                          </span>
                          <input
                            type="text"
                            value={demandQty}
                            onChange={(e) => setDemandQty(e.target.value)}
                            className="h-8 w-36 px-2 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>

                      {/* Dropdowns Row 2 */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 text-slate-800 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {t("पर्यंत दिनांक :", "To Date:", "अंतिम तिथि :")}
                          </span>
                          <input
                            type="date"
                            value={demandToDate}
                            onChange={(e) => setDemandToDate(e.target.value)}
                            className="h-8 px-2 bg-white border border-[#ccc] rounded shadow-none text-sm font-normal text-slate-800 outline-none focus:border-slate-400"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={handleSaveDemand}
                            className="px-5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded text-xs font-bold shadow-md transition-colors"
                          >
                            {t("जतन करा", "Save", "सहेजें")}
                          </button>
                          <button
                            onClick={handleDemandReport}
                            className="px-5 py-2 bg-[#D4A017] hover:bg-[#B8860B] text-white rounded text-xs font-bold shadow-md transition-colors"
                          >
                            {t("अहवाल", "Report", "रिपोर्ट")}
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-slate-300" />

                      {/* Table Section */}
                      <div className="w-full overflow-x-auto font-sans">
                        <table className="w-full border-collapse border border-black text-slate-900 bg-white">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="border border-black p-3 text-sm font-bold text-center w-[25%]">
                                {t("दिनांक", "Date", "दिनांक")}
                              </th>
                              <th className="border border-black p-3 text-sm font-bold text-center w-[30%]">
                                {t(
                                  "धान्य सामग्री",
                                  "Menu content",
                                  "खाद्य सामग्री",
                                )}
                              </th>
                              <th className="border border-black p-3 text-sm font-bold text-center w-[30%]">
                                {t(
                                  "मागणी (किलोग्राम मध्ये)",
                                  "Demand (In Kilo Gram)",
                                  "मांग (किलोग्राम में)",
                                )}
                              </th>
                              <th className="border border-black p-3 text-sm font-bold text-center w-[15%]">
                                {t("कृती", "Actions", "कार्रवाई")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const filtered = demandRecords.filter((rec) => {
                                return (
                                  rec.date >= demandFromDate &&
                                  rec.date <= demandToDate
                                );
                              });

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="border border-black p-4 text-center text-sm font-medium text-slate-500 bg-white"
                                    >
                                      {t(
                                        "निवडलेल्या तारखांमध्ये कोणतीही नोंद आढळली नाही.",
                                        "No records found within selected dates.",
                                        "चयनित तिथियों में कोई रिकॉर्ड नहीं मिला।",
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              return filtered.map((row) => (
                                <tr
                                  key={row.id}
                                  className="bg-white hover:bg-slate-50 h-10"
                                >
                                  <td className="border border-black p-2 text-center text-xs font-semibold text-slate-800">
                                    {(() => {
                                      const parts = row.date.split("-");
                                      if (parts.length !== 3) return row.date;
                                      const [y, m, d] = parts;
                                      const monthsEn = [
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                      ];
                                      const monthsMr = [
                                        "जाने",
                                        "फेब्रु",
                                        "मार्च",
                                        "एप्रि",
                                        "मे",
                                        "जून",
                                        "जुलै",
                                        "ऑग",
                                        "सप्टें",
                                        "ऑक्टो",
                                        "नोव्हें",
                                        "डिसें",
                                      ];
                                      const monthsHi = [
                                        "जन",
                                        "फर",
                                        "मार्च",
                                        "अप्रै",
                                        "मई",
                                        "जून",
                                        "जुला",
                                        "अग",
                                        "सित",
                                        "अक्टू",
                                        "नवं",
                                        "दिस",
                                      ];
                                      const mIdx = parseInt(m, 10) - 1;
                                      const mName = t(
                                        monthsMr[mIdx] || m,
                                        monthsEn[mIdx] || m,
                                        monthsHi[mIdx] || m,
                                      );
                                      return `${d}-${mName}-${y}`;
                                    })()}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-semibold text-slate-800">
                                    {getTranslatedItem(row.content)}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-semibold text-slate-800">
                                    {row.quantity}
                                  </td>
                                  <td className="border border-black p-2 text-center text-xs font-semibold">
                                    <button
                                      onClick={() =>
                                        handleDeleteDemandRecord(row.id)
                                      }
                                      className="text-red-600 hover:text-red-800 font-bold uppercase text-[10px]"
                                    >
                                      {t("काढून टाका", "Delete", "हटाएं")}
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Demand Report Modal */}
                    {showDemandReportModal && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm font-sans p-4">
                        <div className="bg-white p-6 rounded-md shadow-2xl border border-slate-200 w-full max-w-[650px] max-h-[95vh] flex flex-col relative print:shadow-none print:border-none print:w-full print:max-w-full print:p-0 print:h-auto font-sans text-slate-900 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)]">
                          {/* Printable Area */}
                          <div
                            className="border border-black flex-1 overflow-auto bg-white p-6 print:border-none print:p-0"
                            id="demand-report-print"
                          >
                            {/* Header */}
                            <div className="text-center text-black pb-4 border-b border-dashed border-slate-400">
                              <h3 className="font-bold text-lg tracking-wider">
                                {profile?.schoolName || "A B C"}
                              </h3>
                              <p className="text-xs mt-1">
                                {t("तालुका:", "Taluka:")}{" "}
                                {profile?.taluka || ""},{" "}
                                {t("जिल्हा:", "District:")}{" "}
                                {profile?.district || ""}
                              </p>
                              <p className="text-xs">
                                {t("मोबाईल नंबर:", "Mobile Number:")}{" "}
                                {profile?.phone || "8010926852"} ,{" "}
                                {t("ईमेल:", "Email:")} {profile?.email || ""}
                              </p>

                              <div className="flex justify-center my-2">
                                <div className="bg-black text-white px-5 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide print:border print:border-black print:text-black print:bg-white">
                                  {t(
                                    "शालेय पोषण आहार (ब) मागणी पत्रक",
                                    "School Nutrition (B) Demand Sheet",
                                    "विद्यालय पोषण आहार (ब) मांग पत्रक",
                                  )}
                                </div>
                              </div>
                              <p className="text-xs font-medium mt-1">
                                {t(
                                  "(तांदूळ व इतर धान्य साहित्य)",
                                  "(Rice and other grains)",
                                  "(चावल और अन्य अनाज)",
                                )}
                              </p>
                              <p className="text-xs font-bold mt-1.5 text-slate-700">
                                {(() => {
                                  const formatDemandDate = (
                                    dateStr: string,
                                  ) => {
                                    if (!dateStr) return "—";
                                    const d = new Date(dateStr);
                                    if (isNaN(d.getTime())) return dateStr;
                                    const day = d.getDate();
                                    const monthsEn = [
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ];
                                    const monthsMr = [
                                      "जाने",
                                      "फेब्रु",
                                      "मार्च",
                                      "एप्रि",
                                      "मे",
                                      "जून",
                                      "जुलै",
                                      "ऑग",
                                      "सप्टें",
                                      "ऑक्टो",
                                      "नोव्हें",
                                      "डिसें",
                                    ];
                                    const monthsHi = [
                                      "जन",
                                      "फर",
                                      "मार्च",
                                      "अप्रै",
                                      "मई",
                                      "जून",
                                      "जुला",
                                      "अग",
                                      "सित",
                                      "अक्टू",
                                      "नवं",
                                      "दिस",
                                    ];
                                    const mIdx = d.getMonth();
                                    const month = t(
                                      monthsMr[mIdx],
                                      monthsEn[mIdx],
                                      monthsHi[mIdx],
                                    );
                                    const year = d.getFullYear();
                                    return `${day}-${month}-${year}`;
                                  };
                                  return `${formatDemandDate(demandFromDate)} ${t("ते", "To", "से")} ${formatDemandDate(demandToDate)}`;
                                })()}
                              </p>
                            </div>

                            {/* Table */}
                            <table className="w-full border-collapse text-black text-xs text-center mt-4">
                              <thead>
                                <tr className="bg-slate-50 font-bold border-b border-black">
                                  <th className="border-r border-black p-2 w-[15%]">
                                    {t("अ.क्र.", "Sr.No", "क्र.")}
                                  </th>
                                  <th className="border-r border-black p-2 w-[50%]">
                                    {t(
                                      "धान्य साहित्य यादी",
                                      "List Of Grains",
                                      "अनाज सामग्री सूची",
                                    )}
                                  </th>
                                  <th className="p-2 w-[35%]">
                                    {t(
                                      "प्रमाण (किलोग्राम मध्ये)",
                                      "Quantity (in Kilo gram)",
                                      "मात्रा (किलोग्राम में)",
                                    )}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const filtered = demandRecords.filter(
                                    (rec) => {
                                      return (
                                        rec.date >= demandFromDate &&
                                        rec.date <= demandToDate
                                      );
                                    },
                                  );

                                  const rows = filtered.map((row, idx) => (
                                    <tr
                                      key={row.id}
                                      className="border-b border-black last:border-b-0 h-8"
                                    >
                                      <td className="border-r border-black p-2">
                                        {idx + 1}
                                      </td>
                                      <td className="border-r border-black p-2">
                                        {getTranslatedItem(row.content)}
                                      </td>
                                      <td className="p-2">{row.quantity}</td>
                                    </tr>
                                  ));

                                  // Add a blank row if empty or to match screen styling
                                  if (rows.length === 0) {
                                    return (
                                      <tr className="border-b border-black last:border-b-0 h-8 text-slate-500">
                                        <td
                                          colSpan={3}
                                          className="p-4 text-center"
                                        >
                                          {t(
                                            "निवडलेल्या तारीख श्रेणीसाठी कोणतेही धान्य मागवले नाही",
                                            "No grains demanded for selected date range",
                                            "चयनित तिथि सीमा के लिए कोई अनाज नहीं मांगा गया",
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                  return rows;
                                })()}
                              </tbody>
                            </table>
                          </div>

                          <style>{`
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #demand-report-print, #demand-report-print * {
                                  visibility: visible;
                                }
                                #demand-report-print {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `}</style>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 mt-4 print:hidden">
                            <button
                              onClick={() => window.print()}
                              className="px-6 py-2 bg-[#007bff] hover:bg-blue-700 text-white rounded text-sm font-semibold shadow-md transition-all active:scale-95"
                            >
                              {t("प्रिंट", "Print", "प्रिंट")}
                            </button>
                            <button
                              onClick={() => setShowDemandReportModal(false)}
                              className="px-6 py-2 bg-[#f44336] hover:bg-red-700 text-white rounded text-sm font-semibold shadow-md transition-all active:scale-95 ml-3"
                            >
                              {t("बंद करा", "Close", "बंद करें")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. ANNUAL REPORT TAB */}
                {activeTab === "annual-report" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[900px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t("वार्षिक अहवाल", "Annual Report", "वार्षिक रिपोर्ट")}
                        </h2>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 text-slate-800 w-full border-b pb-6 border-slate-200">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              {t("शैक्षणिक वर्ष:", "Academic Year:", "शैक्षणिक वर्ष:")}
                            </span>
                            <select
                              value={annualReportYear}
                              onChange={(e) => setAnnualReportYear(e.target.value)}
                              className="h-9 px-3 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value="2024-25">2024-25</option>
                              <option value="2025-26">2025-26</option>
                              <option value="2026-27">2026-27</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              {t("इयत्ता:", "Class:", "कक्षा:")}
                            </span>
                            <select
                              value={annualReportClass}
                              onChange={(e) => setAnnualReportClass(e.target.value)}
                              className="h-9 px-3 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value="1 To 5">{t("१ ते ५ (प्राथमिक)", "1 To 5 (Primary)", "1 से 5 (प्राथमिक)")}</option>
                              <option value="6 To 8">{t("६ ते ८ (उच्च प्राथमिक)", "6 To 8 (Upper Primary)", "6 से 8 (उच्च प्राथमिक)")}</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600">
                            <input
                              type="checkbox"
                              checked={onlyShowActualAnnual}
                              onChange={(e) => setOnlyShowActualAnnual(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{t("फक्त वास्तविक नोंदी", "Only Actual Records", "केवल वास्तविक रिकॉर्ड")}</span>
                          </label>
                        </div>
                      </div>

                      {/* Calculations & Summary Cards */}
                      {(() => {
                        // Academic year months & years
                        const startYear = parseInt(annualReportYear.split("-")[0]) + 2000; // e.g. 2025
                        const endYear = startYear + 1; // e.g. 2026
                        const monthsList = [
                          { nameMr: "जून", nameEn: "June", nameHi: "जून", m: 6, y: startYear },
                          { nameMr: "जुलै", nameEn: "July", nameHi: "जुलाई", m: 7, y: startYear },
                          { nameMr: "ऑगस्ट", nameEn: "August", nameHi: "अगस्त", m: 8, y: startYear },
                          { nameMr: "सप्टेंबर", nameEn: "September", nameHi: "सितंबर", m: 9, y: startYear },
                          { nameMr: "ऑक्टोबर", nameEn: "October", nameHi: "अक्टूबर", m: 10, y: startYear },
                          { nameMr: "नोव्हेंबर", nameEn: "November", nameHi: "नवंबर", m: 11, y: startYear },
                          { nameMr: "डिसेंबर", nameEn: "December", nameHi: "दिसंबर", m: 12, y: startYear },
                          { nameMr: "जानेवारी", nameEn: "January", nameHi: "जनवरी", m: 1, y: endYear },
                          { nameMr: "फेब्रुवारी", nameEn: "February", nameHi: "फरवरी", m: 2, y: endYear },
                          { nameMr: "मार्च", nameEn: "March", nameHi: "मार्च", m: 3, y: endYear },
                          { nameMr: "एप्रिल", nameEn: "April", nameHi: "अप्रैल", m: 4, y: endYear },
                          { nameMr: "मे", nameEn: "May", nameHi: "मई", m: 5, y: endYear }
                        ];

                        // Quantity multipliers
                        const is68 = annualReportClass === "6 To 8";
                        const riceRate = is68 ? 0.150 : 0.100; // kg per meal
                        const dalRate = is68 ? 0.030 : 0.020;  // kg per meal
                        const oilRate = is68 ? 0.0075 : 0.005; // kg per meal
                        const costRate = is68 ? 8.17 : 5.45;  // Rs per meal

                        // Check if we have any actual records for this academic year
                        let hasAnyActualRecords = false;
                        const actualRecordsByMonth = monthsList.map(item => {
                          const monthStr = String(item.m).padStart(2, "0");
                          const prefix = `${item.y}-${monthStr}`;
                          const monthlyKeys = Object.keys(registerRecords || {}).filter(k => k.startsWith(prefix));
                          
                          if (monthlyKeys.length > 0) {
                            hasAnyActualRecords = true;
                          }

                          let totalDays = 0;
                          let totalMeals = 0;
                          
                          monthlyKeys.forEach(k => {
                            const rec = registerRecords[k];
                            if (rec && Number(rec.beneficiary) > 0) {
                              totalDays++;
                              totalMeals += Number(rec.beneficiary);
                            }
                          });

                          return {
                            hasActual: monthlyKeys.length > 0,
                            days: totalDays,
                            meals: totalMeals,
                          };
                        });

                        // Now compile rows: either actual or simulated
                        const compiledRows = monthsList.map((item, idx) => {
                          const actual = actualRecordsByMonth[idx];
                          
                          let days = 0;
                          let meals = 0;
                          let isSimulated = false;

                          if (actual.hasActual) {
                            days = actual.days;
                            meals = actual.meals;
                          } else if (!onlyShowActualAnnual && !hasAnyActualRecords) {
                            // Generate realistic simulation if no actual data at all
                            isSimulated = true;
                            // Simulated school working days per month (excluding May which is usually very short / vacation)
                            const workingDaysMap: Record<number, number> = {
                              6: 15, 7: 24, 8: 22, 9: 21, 10: 16, 11: 18, 12: 23, 1: 22, 2: 20, 3: 22, 4: 20, 5: 5
                            };
                            days = workingDaysMap[item.m] || 20;
                            // Average attendance around 40 students
                            meals = days * Math.floor(38 + Math.random() * 5);
                          }

                          const rice = meals * riceRate;
                          const dal = meals * dalRate;
                          const oil = meals * oilRate;
                          const cost = meals * costRate;

                          return {
                            ...item,
                            days,
                            meals,
                            rice,
                            dal,
                            oil,
                            cost,
                            isSimulated
                          };
                        });

                        // Sums
                        const totalDays = compiledRows.reduce((sum, r) => sum + r.days, 0);
                        const totalMeals = compiledRows.reduce((sum, r) => sum + r.meals, 0);
                        const totalRice = compiledRows.reduce((sum, r) => sum + r.rice, 0);
                        const totalDal = compiledRows.reduce((sum, r) => sum + r.dal, 0);
                        const totalOil = compiledRows.reduce((sum, r) => sum + r.oil, 0);
                        const totalCost = compiledRows.reduce((sum, r) => sum + r.cost, 0);

                        // SVG Chart settings
                        const maxMeals = Math.max(...compiledRows.map(r => r.meals), 100);
                        const padding = 40;
                        const chartHeight = 200;
                        const chartWidth = 800;
                        const graphHeight = chartHeight - 2 * padding;
                        const graphWidth = chartWidth - 2 * padding;

                        // Create points for SVG path
                        const points = compiledRows.map((r, i) => {
                          const x = padding + (i * graphWidth) / 11;
                          const y = chartHeight - padding - (r.meals / maxMeals) * graphHeight;
                          return { x, y, meals: r.meals, name: t(r.nameMr, r.nameEn, r.nameHi) };
                        });

                        // SVG Path string
                        let pathD = "";
                        if (points.length > 0) {
                          pathD = `M ${points[0].x} ${points[0].y}`;
                          for (let i = 1; i < points.length; i++) {
                            pathD += ` L ${points[i].x} ${points[i].y}`;
                          }
                        }

                        // SVG Area Path (for gradient fill below the line)
                        let areaD = "";
                        if (points.length > 0) {
                          areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
                        }

                        // CSV Export logic
                        const exportToCSV = () => {
                          const headers = [
                            t("महिना", "Month", "महीना"),
                            t("कामाचे दिवस", "Working Days", "कार्य दिवस"),
                            t("एकूण लाभार्थी संख्या", "Total Meals Served", "कुल लाभार्थी संख्या"),
                            t("तांदूळ (किग्रॅ)", "Rice (kg)", "चावल (किग्रा)"),
                            t("डाळ (किग्रॅ)", "Dal (kg)", "दाल (किग्रा)"),
                            t("तेल (किग्रॅ)", "Oil (kg)", "तेल (किग्रा)"),
                            t("पाककृती खर्च (रु.)", "Cooking Cost (Rs.)", "पाककला लागत (रु.)"),
                            t("नोंद प्रकार", "Record Type", "रिकॉर्ड प्रकार")
                          ];
                          
                          const csvRows = [headers.join(",")];
                          compiledRows.forEach(r => {
                            const row = [
                              `"${t(r.nameMr, r.nameEn, r.nameHi)}"`,
                              r.days,
                              r.meals,
                              r.rice.toFixed(2),
                              r.dal.toFixed(2),
                              r.oil.toFixed(2),
                              r.cost.toFixed(2),
                              `"${r.isSimulated ? t("अंदाजित", "Simulated/Est", "अनुमानित") : t("वास्तविक", "Actual", "वास्तविक")}"`
                            ];
                            csvRows.push(row.join(","));
                          });

                          // Append Total row
                          const totalRow = [
                            `"${t("एकूण", "Total", "कुल")}"`,
                            totalDays,
                            totalMeals,
                            totalRice.toFixed(2),
                            totalDal.toFixed(2),
                            totalOil.toFixed(2),
                            totalCost.toFixed(2),
                            `""`
                          ];
                          csvRows.push(totalRow.join(","));

                          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `MDM_Annual_Report_${annualReportYear}_${annualReportClass.replace(/ /g, "_")}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        };

                        return (
                          <div className="space-y-10 w-full">
                            {/* Warning Banner for Simulated Grains */}
                            {!hasAnyActualRecords && !onlyShowActualAnnual && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-sm">
                                <Sparkles className="size-5 text-amber-500 flex-shrink-0" />
                                <div>
                                  <span className="font-bold">{t("माहिती सूचित करणे : ", "Data Note: ", "सूचना: ")}</span>
                                  {t(
                                    "सध्या डेटाबेसमध्ये कोणतेही रेकॉर्ड सापडले नाही, म्हणून अहवाल दर्शवण्यासाठी नमुना अंदाज डेटा दर्शविला गेला आहे.",
                                    "No records found in database for this year, displaying simulated estimates for presentation purposes.",
                                    "वर्तमान में डेटाबेस में कोई रिकॉर्ड नहीं मिला, इसलिए रिपोर्ट दिखाने के लिए नमूना अनुमानित डेटा प्रदर्शित किया गया है."
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Summary Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {/* Meals served card */}
                              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                  {t("एकूण लाभार्थी", "Meals Served", "कुल लाभार्थी")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {totalMeals.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("ताट", "Meals", "भोजन")}</span>
                                </div>
                              </div>

                              {/* Rice Card */}
                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                  {t("तांदूळ वापर", "Rice Consumed", "चावल खपत")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {totalRice.toFixed(1)}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("किग्रॅ", "kg", "किग्रा")}</span>
                                </div>
                              </div>

                              {/* Cooking Cost Card */}
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                                  {t("पाककृती खर्च", "Cooking Cost", "पाककला लागत")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-1">
                                  <span className="text-xs font-bold text-slate-400">₹</span>
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {totalCost.toFixed(0).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Working Days Card */}
                              <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-3xl border border-rose-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                                  {t("कामाचे दिवस", "Working Days", "कार्य दिवस")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {totalDays}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("दिवस", "Days", "दिन")}</span>
                                </div>
                              </div>
                            </div>

                            {/* SVG chart section */}
                            {totalMeals > 0 && (
                              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-700">
                                  {t("मासिक लाभार्थी संख्या आलेख", "Monthly Meals Trend", "मासिक लाभार्थी संख्या ग्राफ़")}
                                </h3>
                                <div className="overflow-x-auto w-full">
                                  <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    className="w-full min-w-[700px] h-[200px]"
                                  >
                                    {/* Grid Lines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                      const y = padding + ratio * graphHeight;
                                      const val = Math.round(maxMeals * (1 - ratio));
                                      return (
                                        <g key={idx}>
                                          <line
                                            x1={padding}
                                            y1={y}
                                            x2={chartWidth - padding}
                                            y2={y}
                                            stroke="#e2e8f0"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                          />
                                          <text
                                            x={padding - 8}
                                            y={y + 4}
                                            fill="#94a3b8"
                                            fontSize="10"
                                            textAnchor="end"
                                            fontWeight="600"
                                          >
                                            {val}
                                          </text>
                                        </g>
                                      );
                                    })}

                                    {/* Area Fill Gradient */}
                                    <defs>
                                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                      </linearGradient>
                                    </defs>
                                    {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                                    {/* Curved/Line Path */}
                                    {pathD && (
                                      <path
                                        d={pathD}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    )}

                                    {/* Points and Text labels */}
                                    {points.map((pt, idx) => (
                                      <g key={idx} className="group">
                                        <circle
                                          cx={pt.x}
                                          cy={pt.y}
                                          r="5"
                                          fill="#4f46e5"
                                          stroke="#ffffff"
                                          strokeWidth="2"
                                        />
                                        <text
                                          x={pt.x}
                                          y={chartHeight - padding + 18}
                                          fill="#64748b"
                                          fontSize="9"
                                          fontWeight="bold"
                                          textAnchor="middle"
                                        >
                                          {pt.name.slice(0, 3)}
                                        </text>
                                        {/* Tooltip on top of point */}
                                        <text
                                          x={pt.x}
                                          y={pt.y - 10}
                                          fill="#1e293b"
                                          fontSize="9"
                                          fontWeight="bold"
                                          textAnchor="middle"
                                        >
                                          {pt.meals}
                                        </text>
                                      </g>
                                    ))}
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* Detailed Table */}
                            <div className="w-full overflow-x-auto border border-slate-300 rounded-2xl shadow-sm">
                              <table className="w-full border-collapse text-slate-800 text-sm">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-300">
                                    <th className="py-3.5 px-4 text-left font-bold">{t("महिना", "Month", "महीना")}</th>
                                    <th className="py-3.5 px-4 text-center font-bold">{t("कामाचे दिवस", "Working Days", "कार्य दिवस")}</th>
                                    <th className="py-3.5 px-4 text-center font-bold">{t("लाभार्थी संख्या", "Meals Served", "लाभार्थी संख्या")}</th>
                                    <th className="py-3.5 px-4 text-right font-bold">{t("तांदूळ (किग्रॅ)", "Rice (kg)", "चावल (किग्रा)")}</th>
                                    <th className="py-3.5 px-4 text-right font-bold">{t("डाळ (किग्रॅ)", "Dal (kg)", "दाल (किग्रा)")}</th>
                                    <th className="py-3.5 px-4 text-right font-bold">{t("पाककृती खर्च", "Cooking Cost", "लागत (रु.)")}</th>
                                    <th className="py-3.5 px-4 text-center font-bold">{t("नोंद प्रकार", "Type", "प्रकार")}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {compiledRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                      <td className="py-3 px-4 font-semibold text-slate-900">
                                        {t(row.nameMr, row.nameEn, row.nameHi)}
                                      </td>
                                      <td className="py-3 px-4 text-center font-medium">{row.days}</td>
                                      <td className="py-3 px-4 text-center font-bold text-slate-900">{row.meals}</td>
                                      <td className="py-3 px-4 text-right font-medium">{row.rice.toFixed(2)}</td>
                                      <td className="py-3 px-4 text-right font-medium">{row.dal.toFixed(2)}</td>
                                      <td className="py-3 px-4 text-right font-bold text-indigo-600">₹{row.cost.toFixed(2)}</td>
                                      <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                          row.isSimulated 
                                            ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}>
                                          {row.isSimulated ? t("अंदाजित", "Est", "अनुमानित") : t("वास्तविक", "Actual", "वास्तविक")}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Totals Row */}
                                  <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                                    <td className="py-4 px-4 text-slate-900 font-extrabold">{t("एकूण (Total)", "Total", "कुल")}</td>
                                    <td className="py-4 px-4 text-center text-slate-900 font-extrabold">{totalDays}</td>
                                    <td className="py-4 px-4 text-center text-slate-900 font-extrabold">{totalMeals}</td>
                                    <td className="py-4 px-4 text-right text-slate-900 font-extrabold">{totalRice.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-right text-slate-900 font-extrabold">{totalDal.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-right text-indigo-600 font-extrabold">₹{totalCost.toFixed(2)}</td>
                                    <td className="py-4 px-4"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Action Row */}
                            <div className="flex justify-end gap-3 mt-6 print:hidden">
                              <button
                                onClick={exportToCSV}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                              >
                                <FileSpreadsheet className="size-4" />
                                {t("एक्सेल निर्यात", "Export to CSV", "एक्सेल निर्यात")}
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                              >
                                <Calendar className="size-4" />
                                {t("अहवाल प्रिंट करा", "Print Report", "रिपोर्ट प्रिंट करें")}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 8. MONTHLY REPORT TAB */}
                {activeTab === "monthly-report" && (
                  <div className="bg-white p-12 border border-slate-300 w-full min-h-[800px] flex flex-col items-center">
                    <div className="w-full max-w-[950px] space-y-10">
                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-2xl font-bold text-[#004C99]">
                          {t("मासिक अहवाल", "Monthwise Report", "मासिक रिपोर्ट")}
                        </h2>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 text-slate-800 w-full border-b pb-6 border-slate-200">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              {t("महिना निवडा:", "Select Month:", "महीना चुनें:")}
                            </span>
                            <select
                              value={monthlyReportMonth}
                              onChange={(e) => setMonthlyReportMonth(Number(e.target.value))}
                              className="h-9 px-3 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                            >
                              {[
                                { val: 1, labelEn: "January", labelMr: "जानेवारी", labelHi: "जनवरी" },
                                { val: 2, labelEn: "February", labelMr: "फेब्रुवारी", labelHi: "फरवरी" },
                                { val: 3, labelEn: "March", labelMr: "मार्च", labelHi: "मार्च" },
                                { val: 4, labelEn: "April", labelMr: "एप्रिल", labelHi: "अप्रैल" },
                                { val: 5, labelEn: "May", labelMr: "मे", labelHi: "मई" },
                                { val: 6, labelEn: "June", labelMr: "जून", labelHi: "जून" },
                                { val: 7, labelEn: "July", labelMr: "जुलै", labelHi: "जुलाई" },
                                { val: 8, labelEn: "August", labelMr: "ऑगस्ट", labelHi: "अगस्त" },
                                { val: 9, labelEn: "September", labelMr: "सप्टेंबर", labelHi: "सितंबर" },
                                { val: 10, labelEn: "October", labelMr: "ऑक्टोबर", labelHi: "अक्टूबर" },
                                { val: 11, labelEn: "November", labelMr: "नोव्हेंबर", labelHi: "नवंबर" },
                                { val: 12, labelEn: "December", labelMr: "डिसेंबर", labelHi: "दिसंबर" }
                              ].map(item => (
                                <option key={item.val} value={item.val}>
                                  {t(item.labelMr, item.labelEn, item.labelHi)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              {t("वर्ष निवडा:", "Select Year:", "वर्ष चुनें:")}
                            </span>
                            <select
                              value={monthlyReportYear}
                              onChange={(e) => setMonthlyReportYear(Number(e.target.value))}
                              className="h-9 px-3 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value={2024}>2024</option>
                              <option value={2025}>2025</option>
                              <option value={2026}>2026</option>
                              <option value={2027}>2027</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              {t("इयत्ता निवडा:", "Class:", "कक्षा:")}
                            </span>
                            <select
                              value={monthlyReportClass}
                              onChange={(e) => setMonthlyReportClass(e.target.value)}
                              className="h-9 px-3 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value="1 To 5">{t("१ ते ५ (प्राथमिक)", "1 To 5 (Primary)", "1 से 5 (प्राथमिक)")}</option>
                              <option value="6 To 8">{t("६ ते ८ (उच्च प्राथमिक)", "6 To 8 (Upper Primary)", "6 से 8 (उच्च प्राथमिक)")}</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600">
                            <input
                              type="checkbox"
                              checked={onlyShowActualMonthly}
                              onChange={(e) => setOnlyShowActualMonthly(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{t("फक्त वास्तविक नोंदी", "Only Actual Records", "केवल वास्तविक रिकॉर्ड")}</span>
                          </label>
                        </div>
                      </div>

                      {/* Calculations & Rendering */}
                      {(() => {
                        const numDays = new Date(monthlyReportYear, monthlyReportMonth, 0).getDate();
                        const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);

                        const is68 = monthlyReportClass === "6 To 8";
                        const riceRate = is68 ? 0.150 : 0.100;
                        const dalRate = is68 ? 0.030 : 0.020;
                        const oilRate = is68 ? 0.0075 : 0.005;
                        const costRate = is68 ? 8.17 : 5.45;

                        // Check actual records count
                        let actualCount = 0;
                        for (let d = 1; d <= numDays; d++) {
                          const dateISO = `${monthlyReportYear}-${String(monthlyReportMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                          if (registerRecords[dateISO]) {
                            actualCount++;
                          }
                        }

                        // Generate day-by-day records
                        const daysData = daysArray.map(day => {
                          const dateISO = `${monthlyReportYear}-${String(monthlyReportMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const dObj = new Date(monthlyReportYear, monthlyReportMonth - 1, day);
                          const dayOfWeek = dObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                          const daysOfWeekEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          const daysOfWeekMr = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
                          const daysOfWeekHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

                          const dayName = t(daysOfWeekMr[dayOfWeek], daysOfWeekEn[dayOfWeek], daysOfWeekHi[dayOfWeek]);
                          const isSunday = dayOfWeek === 0;

                          const record = registerRecords[dateISO];
                          let enrolled = 0;
                          let beneficiary = 0;
                          let isSimulated = false;

                          if (record) {
                            enrolled = Number(record.enrolled) || 45;
                            beneficiary = Number(record.beneficiary) || 0;
                          } else if (!onlyShowActualMonthly && actualCount === 0 && !isSunday) {
                            // Generate mock records only if database is completely empty of actual records
                            isSimulated = true;
                            enrolled = 45;
                            beneficiary = dayOfWeek === 6 ? 36 : Math.floor(39 + Math.random() * 5);
                          }

                          const rice = beneficiary * riceRate;
                          const dal = beneficiary * dalRate;
                          const oil = beneficiary * oilRate;
                          const cost = beneficiary * costRate;

                          // Egg banana
                          let eggBanana = 0;
                          if (record && record.eggBananaCount) {
                            eggBanana = Number(record.eggBananaCount);
                          } else if (isSimulated && (dayOfWeek === 3 || dayOfWeek === 5)) {
                            // egg banana on Wed/Fri in mock
                            eggBanana = beneficiary;
                          }

                          return {
                            day,
                            dateISO,
                            dateFormatted: `${String(day).padStart(2, "0")}/${String(monthlyReportMonth).padStart(2, "0")}/${monthlyReportYear}`,
                            dayName,
                            enrolled,
                            beneficiary,
                            rice,
                            dal,
                            oil,
                            cost,
                            eggBanana,
                            isSunday,
                            isSimulated
                          };
                        });

                        // Sums
                        const activeDays = daysData.filter(d => !d.isSunday && d.beneficiary > 0).length;
                        const sumEnrolled = daysData.reduce((sum, d) => sum + d.enrolled, 0);
                        const avgEnrolled = activeDays > 0 ? Math.round(sumEnrolled / activeDays) : 0;
                        const sumBeneficiaries = daysData.reduce((sum, d) => sum + d.beneficiary, 0);
                        const sumRice = daysData.reduce((sum, d) => sum + d.rice, 0);
                        const sumDal = daysData.reduce((sum, d) => sum + d.dal, 0);
                        const sumOil = daysData.reduce((sum, d) => sum + d.oil, 0);
                        const sumCost = daysData.reduce((sum, d) => sum + d.cost, 0);
                        const sumEggBanana = daysData.reduce((sum, d) => sum + d.eggBanana, 0);

                        // Export as CSV
                        const exportToCSV = () => {
                          const headers = [
                            t("तारीख", "Date", "तारीख"),
                            t("वार", "Day", "दिन"),
                            t("पटसंख्या", "Registered", "पंजीकृत"),
                            t("लाभार्थी संख्या", "Beneficiary", "लाभार्थी"),
                            t("तांदूळ (किग्रॅ)", "Rice (kg)", "चावल (किग्रा)"),
                            t("डाळ (किग्रॅ)", "Dal (kg)", "दाल (किग्रा)"),
                            t("तेल (किग्रॅ)", "Oil (kg)", "तेल (किग्रा)"),
                            t("खर्च (रु.)", "Cooking Cost (Rs.)", "पाककला लागत (रु.)"),
                            t("अंडी/केळी संख्या", "Egg/Banana", "अंडा/केला"),
                            t("प्रकार", "Type", "प्रकार")
                          ];

                          const csvRows = [headers.join(",")];
                          daysData.forEach(d => {
                            const row = [
                              d.dateFormatted,
                              `"${d.dayName}"`,
                              d.enrolled,
                              d.beneficiary,
                              d.rice.toFixed(2),
                              d.dal.toFixed(2),
                              d.oil.toFixed(2),
                              d.cost.toFixed(2),
                              d.eggBanana,
                              `"${d.isSunday ? t("सुट्टी", "Sunday", "रविवार") : (d.isSimulated ? t("अंदाजित", "Est", "अनुमानित") : t("वास्तविक", "Actual", "वास्तविक"))}"`
                            ];
                            csvRows.push(row.join(","));
                          });

                          // Append Totals Row
                          const totalRow = [
                            `"${t("एकूण", "Total", "कुल")}"`,
                            `""`,
                            avgEnrolled,
                            sumBeneficiaries,
                            sumRice.toFixed(2),
                            sumDal.toFixed(2),
                            sumOil.toFixed(2),
                            sumCost.toFixed(2),
                            sumEggBanana,
                            `""`
                          ];
                          csvRows.push(totalRow.join(","));

                          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `MDM_Monthly_Report_${monthlyReportMonth}_${monthlyReportYear}_${monthlyReportClass.replace(/ /g, "_")}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        };

                        return (
                          <div className="space-y-10 w-full">
                            {/* Summary Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                  {t("महिन्यातील एकूण लाभार्थी", "Meals Served", "कुल लाभार्थी")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {sumBeneficiaries.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("ताट", "Meals", "भोजन")}</span>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                  {t("तांदूळ वापर (किग्रॅ)", "Rice Consumed", "चावल खपत")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {sumRice.toFixed(1)}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("किग्रॅ", "kg", "किग्रा")}</span>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                                  {t("एकूण पाककृती खर्च", "Cooking Cost", "पाककला लागत")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-1">
                                  <span className="text-xs font-bold text-slate-400">₹</span>
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {sumCost.toFixed(0).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-3xl border border-rose-100 flex flex-col justify-between hover:shadow-md transition-all group duration-300">
                                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                                  {t("कार्य दिवस", "Active Days", "सक्रिय दिन")}
                                </span>
                                <div className="mt-4 flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 block">
                                    {activeDays}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{t("दिवस", "Days", "दिन")}</span>
                                </div>
                              </div>
                            </div>

                            {/* Warning Banner for Simulated Grains */}
                            {actualCount === 0 && !onlyShowActualMonthly && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-sm">
                                <Sparkles className="size-5 text-amber-500 flex-shrink-0" />
                                <div>
                                  <span className="font-bold">{t("माहिती सूचित करणे : ", "Data Note: ", "सूचना: ")}</span>
                                  {t(
                                    "सध्या या महिन्यासाठी कोणतेही रेकॉर्ड डेटाबेसमध्ये सापडले नाही. अहवाल दर्शवण्यासाठी नमुना अंदाज डेटा दर्शविला गेला आहे.",
                                    "No register records found for this month, showing simulated data for presentation purposes.",
                                    "इस महीने के लिए वर्तमान में कोई रिकॉर्ड डेटाबेस में नहीं मिला. रिपोर्ट दिखाने के लिए अनुमानित डेटा प्रदर्शित किया गया है."
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Detailed Table */}
                            <div className="w-full overflow-x-auto border border-slate-300 rounded-2xl shadow-sm max-h-[500px] overflow-y-auto">
                              <table className="w-full border-collapse text-slate-800 text-sm">
                                <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
                                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-300 font-sans">
                                    <th className="py-3 px-3 text-left font-bold">{t("तारीख", "Date", "तारीख")}</th>
                                    <th className="py-3 px-3 text-left font-bold">{t("वार", "Day", "दिन")}</th>
                                    <th className="py-3 px-3 text-center font-bold">{t("पटसंख्या", "Registered", "पंजीकृत")}</th>
                                    <th className="py-3 px-3 text-center font-bold">{t("लाभार्थी", "Meals Served", "लाभार्थी")}</th>
                                    <th className="py-3 px-3 text-right font-bold">{t("तांदूळ (किग्रॅ)", "Rice (kg)", "चावल")}</th>
                                    <th className="py-3 px-3 text-right font-bold">{t("डाळ (किग्रॅ)", "Dal (kg)", "दाल")}</th>
                                    <th className="py-3 px-3 text-right font-bold">{t("खर्च (रु.)", "Cost (Rs.)", "लागत")}</th>
                                    <th className="py-3 px-3 text-center font-bold">{t("अंडी/केळी", "Egg/Banana", "अंडा/केला")}</th>
                                    <th className="py-3 px-3 text-center font-bold">{t("नोंद", "Type", "प्रकार")}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {daysData.map((row, idx) => (
                                    <tr 
                                      key={idx} 
                                      className={`hover:bg-slate-50 transition-colors ${row.isSunday ? "bg-red-50/20 text-slate-400" : ""}`}
                                    >
                                      <td className="py-2.5 px-3 font-semibold">{row.dateFormatted}</td>
                                      <td className="py-2.5 px-3 font-medium">{row.dayName}</td>
                                      <td className="py-2.5 px-3 text-center">{row.isSunday ? "—" : row.enrolled}</td>
                                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                                        {row.isSunday ? "—" : row.beneficiary}
                                      </td>
                                      <td className="py-2.5 px-3 text-right font-medium">
                                        {row.isSunday ? "—" : row.rice.toFixed(2)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right font-medium">
                                        {row.isSunday ? "—" : row.dal.toFixed(2)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                                        {row.isSunday ? "—" : `₹${row.cost.toFixed(2)}`}
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-bold text-amber-700">
                                        {row.isSunday ? "—" : (row.eggBanana > 0 ? row.eggBanana : "0")}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        {row.isSunday ? (
                                          <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">
                                            {t("रविवार", "Sunday", "रविवार")}
                                          </span>
                                        ) : (
                                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                                            row.isSimulated 
                                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          }`}>
                                            {row.isSimulated ? t("अंदाजित", "Est", "अनुमानित") : t("वास्तविक", "Actual", "वास्तविक")}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Totals Row */}
                                  <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                                    <td className="py-3 px-3 text-slate-900 font-extrabold">{t("एकूण", "Total", "कुल")}</td>
                                    <td className="py-3 px-3"></td>
                                    <td className="py-3 px-3 text-center text-slate-900 font-extrabold">{avgEnrolled} ({t("सरासरी", "Avg", "औसत")})</td>
                                    <td className="py-3 px-3 text-center text-slate-900 font-extrabold">{sumBeneficiaries}</td>
                                    <td className="py-3 px-3 text-right text-slate-900 font-extrabold">{sumRice.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right text-slate-900 font-extrabold">{sumDal.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right text-indigo-600 font-extrabold">₹{sumCost.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-center text-amber-700 font-extrabold">{sumEggBanana}</td>
                                    <td className="py-3 px-3"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Action Row */}
                            <div className="flex justify-end gap-3 mt-6 print:hidden">
                              <button
                                onClick={exportToCSV}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                              >
                                <FileSpreadsheet className="size-4" />
                                {t("एक्सेल निर्यात", "Export to CSV", "एक्सेल निर्यात")}
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                              >
                                <Calendar className="size-4" />
                                {t("अहवाल प्रिंट करा", "Print Report", "रिपोर्ट प्रिंट करें")}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
