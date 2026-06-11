import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  School,
  CalendarDays,
  Star,
  FileText,
  BookCheck,
  ClipboardList,
  BookOpen,
  Award,
  Users2,
  Utensils,
  PieChart,
  Table,
  Calculator,
  Edit3,
  Clock,
  Download,
  Share2,
  Info,
  Loader2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { toast as sonnerToast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";

export const Route = createFileRoute("/school/resource/$resourceId")({
  component: ResourcePage,
});

const RESOURCE_MAP: any = {
  timetable: {
    m: "वेळापत्रक",
    e: "Timetable",
    icon: CalendarDays,
    color: "bg-violet-600",
  },
  "special-day": {
    m: "दिनविशेष",
    e: "Special Day",
    icon: Star,
    color: "bg-amber-500",
  },
  template: {
    m: "टेम्पलेट",
    e: "Template",
    icon: FileText,
    color: "bg-blue-500",
  },
  "annual-monthly-planning": {
    m: "वार्षिक मासिक नियोजन",
    e: "Annual & Monthly Planning",
    icon: BookCheck,
    color: "bg-emerald-600",
  },
  "question-bank": {
    m: "प्रश्नपेढी",
    e: "Question Bank",
    icon: ClipboardList,
    color: "bg-rose-500",
  },
  homework: {
    m: "होमवर्क",
    e: "Homework",
    icon: BookOpen,
    color: "bg-orange-500",
  },

  "monthly-meeting": {
    m: "मासिक सभा",
    e: "Monthly Meeting",
    icon: Users2,
    color: "bg-cyan-600",
  },
  "mid-day-meal-(mdm)": {
    m: "एमडीएम",
    e: "Mid-Day Meal (MDM)",
    icon: Utensils,
    color: "bg-orange-600",
  },
  "teacher-statistics": {
    m: "शिक्षक संख्यिका",
    e: "Teacher Statistics",
    icon: PieChart,
    color: "bg-teal-600",
  },
  "student-statistics": {
    m: "विद्यार्थी संख्यिका",
    e: "Student Statistics",
    icon: Users2,
    color: "bg-blue-600",
  },
  "daily-activity-record-book": {
    m: "परिपाठ नोंदवही",
    e: "Daily Activity Record Book",
    icon: Table,
    color: "bg-purple-600",
  },
  "sqaf-evaluation": {
    m: "एसक्यूएफ मूल्यांकन",
    e: "SQAF Evaluation",
    icon: Calculator,
    color: "bg-slate-600",
  },
  "teaching-record-notebook": {
    m: "टाचन वही",
    e: "Teaching Record Notebook",
    icon: Edit3,
    color: "bg-pink-600",
  },
};

function ResourcePage() {
  const { resourceId } = useParams({ from: "/school/resource/$resourceId" });
  const { user } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = RESOURCE_MAP[resourceId] || {
    m: resourceId,
    e: resourceId,
    icon: Info,
    color: "bg-slate-600",
  };

  useEffect(() => {
    async function fetchResource() {
      if (!user) return;
      try {
        const uDoc = await getDoc(doc(db, "users", user.uid));
        if (uDoc.exists()) {
          const udise = uDoc.data().schoolConnection?.udise;
          if (udise) {
            const rDoc = await getDoc(
              doc(db, "school_data", `${udise}_${resourceId}`),
            );
            if (rDoc.exists()) {
              setContent(rDoc.data());
            } else {
              setError("No data uploaded by teacher yet.");
            }
          } else {
            setError("You are not connected to any school.");
          }
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load resource data.");
      } finally {
        setLoading(false);
      }
    }
    fetchResource();
  }, [user, resourceId]);

  return (
    <div className="min-h-screen bg-white">
      <StudentHeader />
      <StudentSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen bg-slate-50/50">
        <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="size-4" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-6">
                <div
                  className={`size-16 rounded-[1.5rem] ${config.color} text-white flex items-center justify-center shadow-lg`}
                >
                  <config.icon className="size-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
                    {config.m}
                  </h1>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    {config.e} Section
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                <Share2 className="size-5" />
              </button>
              <button className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-3">
                <Download className="size-4" /> Export Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="size-10 animate-spin text-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Synchronizing School Database...
                </p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <AlertCircle className="size-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 italic">
                    Information Pending
                  </h2>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    {error}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all"
                >
                  Request Teacher Update
                </Link>
              </div>
            ) : (
              <div className="p-10 md:p-16 space-y-12">
                <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                  <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-900">
                      Official Data Verified
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      Last updated: {content.updatedAt || "Recently"}
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-lg italic">
                    {content.data ||
                      "The teacher has not added specific text content for this module yet."}
                  </div>
                </div>

                {content.files && content.files.length > 0 && (
                  <div className="space-y-8 pt-12 border-t border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 italic tracking-tight">
                      Attached Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.files.map((file: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-indigo-200 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                              <FileText className="size-6" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900">
                                {file.name}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {file.size} • {file.type}
                              </div>
                            </div>
                          </div>
                          <button className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                            <Download className="size-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


