import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  CreditCard,
  UserCheck,
  Plus,
  MessageSquare,
  Trash2,
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

const CLASS_DATA = [
  { name: "Class II", students: 25 },
  { name: "Class III", students: 1 },
  { name: "Class V", students: 1 },
  { name: "Class VI", students: 1 },
  { name: "Class VIII", students: 1 },
];

const GENDER_DATA = [
  { name: "Female", value: 15, color: "#FF6B91" },
  { name: "Male", value: 14, color: "#33A0FF" },
];

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notices, setNotices] = useState<any[]>([]);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [mdmMenu, setMdmMenu] = useState("No Menu");
  const [mdmMeals, setMdmMeals] = useState("0");

  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        return;
      }
      if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher", role: "teacher" } as any,
        });
        return;
      }
    }

    // 1. Subscribe to Notices
    const q = query(collection(db, "notices"), orderBy("date", "desc"));
    const unsubscribeNotices = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotices(data);
    });

    // 2. Subscribe to MDM Data
    const udise =
      profile?.udise ||
      (typeof window !== "undefined"
        ? localStorage.getItem("teacher_udise")
        : null) ||
      "default";
    const mdmDocRef = doc(db, "school_data", `${udise}_mdm`);
    const unsubscribeMdm = onSnapshot(mdmDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const todayISO = new Date().toISOString().split("T")[0];

        // Fetch meals served today
        if (data.registerRecords && data.registerRecords[todayISO]) {
          setMdmMeals(data.registerRecords[todayISO].beneficiary || "0");
        } else if (data.dailyRecord && data.dailyRecord.mealsServed) {
          setMdmMeals(data.dailyRecord.mealsServed.toString());
        }

        // Fetch today's weekday menu
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = days[new Date().getDay()];
        const dayOffsets: Record<string, number> = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        const dayNum = dayOffsets[dayName];
        if (dayNum) {
          const dayKey = `${dayNum}. ${dayName}`;
          const dayKeyAlt = `${dayNum + 6}. ${dayName}`;

          if (
            data.menuRecords &&
            data.menuRecords[dayKey] &&
            data.menuRecords[dayKey].menu &&
            data.menuRecords[dayKey].menu !== "Select Menu"
          ) {
            setMdmMenu(data.menuRecords[dayKey].menu);
          } else if (
            data.menuRecords &&
            data.menuRecords[dayKeyAlt] &&
            data.menuRecords[dayKeyAlt].menu &&
            data.menuRecords[dayKeyAlt].menu !== "Select Menu"
          ) {
            setMdmMenu(data.menuRecords[dayKeyAlt].menu);
          } else if (data.dailyRecord && data.dailyRecord.todaysMenu) {
            setMdmMenu(data.dailyRecord.todaysMenu);
          }
        }
      }
    });

    return () => {
      unsubscribeNotices();
      unsubscribeMdm();
    };
  }, [user, profile, authLoading, navigate]);

  if (authLoading || !user)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Verifying Educator Credentials...
          </p>
        </div>
      </div>
    );

  const handleAddNotice = async () => {
    if (!newNoticeText) return;
    try {
      await addDoc(collection(db, "notices"), {
        text: newNoticeText,
        date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        createdAt: new Date().toISOString(),
      });
      setNewNoticeText("");
      toast.success("Notice published!");
    } catch (e) {
      toast.error("Failed to publish notice");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notices", id));
      toast.info("Notice removed");
    } catch (e) {
      toast.error("Failed to remove notice");
    }
  };

  const stats = [
    { label: "Total Students", value: 29, icon: "🎓", color: "text-red-500" },
    {
      label: "Today's Menu",
      value: mdmMenu,
      icon: "🍱",
      color: "text-emerald-500",
    },
    {
      label: "Meals Served",
      value: mdmMeals,
      icon: "🍲",
      color: "text-amber-500",
    },
    { label: "Present Teachers", value: 1, icon: "👨‍🏫", color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen bg-slate-50/50">
        <div className="p-6 space-y-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-4 rounded-md shadow-sm flex items-center justify-between"
              >
                <div className="flex flex-col items-center gap-1 border-r border-slate-100 pr-6">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter text-center leading-tight">
                    {s.label.split(" ")[0]}
                    <br />
                    {s.label.split(" ")[1]}
                  </span>
                </div>
                <div className="text-4xl font-normal text-blue-500 pl-4 flex-1 text-center">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students By Class */}
            <div className="bg-white border border-slate-200 rounded-md p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Students By Class
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CLASS_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#33A0FF"
                      fill="#33A0FF"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      dot={{ fill: "#33A0FF", r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Boy-Girl Ratio */}
            <div className="bg-white border border-slate-200 rounded-md p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Boy-Girl Ratio
              </h3>
              <div className="h-[300px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={GENDER_DATA}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {GENDER_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <div className="flex gap-1">
                    <span>👦</span>
                    <span>👧</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="absolute top-0 right-0 flex gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1">
                    <div className="size-2 bg-[#33A0FF]"></div> Male
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-2 bg-[#FF6B91]"></div> Female
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white border border-slate-200 rounded-md p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Calendar
              </h3>
              <div className="flex justify-center">
                <div className="border border-blue-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-blue-400 text-white py-1 px-4 text-center text-xs font-bold">
                    May 2026
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3"
                  />
                </div>
              </div>
            </div>

            {/* Notice Board */}
            <div className="bg-white border border-slate-200 rounded-md p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Notice Board
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoticeText}
                    onChange={(e) => setNewNoticeText(e.target.value)}
                    placeholder="Enter new notice..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                  <button
                    onClick={handleAddNotice}
                    className="bg-blue-600 text-white rounded-xl px-4 py-2 shadow-sm hover:bg-blue-700 transition-colors text-[10px] font-black uppercase"
                  >
                    Post
                  </button>
                </div>
              </div>
              <div className="border border-slate-100 rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                {notices.length > 0 ? (
                  notices.map((notice, idx) => (
                    <div
                      key={notice.id}
                      className={`flex items-center justify-between px-4 py-3 text-xs border-b border-slate-50 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <div className="flex gap-2 text-slate-700 font-medium">
                        <span className="w-4 text-slate-400">{idx + 1})</span>
                        <span className="w-20 text-indigo-600 font-bold">
                          {notice.date}:
                        </span>
                        <span className="font-bold">{notice.text}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="size-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest">
                    No active notices
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
