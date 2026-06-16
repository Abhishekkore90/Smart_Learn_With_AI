import { createFileRoute } from "@tanstack/react-router";
import { StudentHeader } from "@/components/student/StudentHeader";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Clock,
  Calendar as CalendarIcon,
  User,
  Sparkles,
  GraduationCap,
  MapPin,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/student/timetable")({
  component: StudentTimetablePage,
});

const CLASSES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function StudentTimetablePage() {
  const [selectedClass, setSelectedClass] = useState("1st");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "school_config", "timetable"),
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data().content || {});
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <StudentHeader />
      <StudentSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                  <CalendarIcon className="size-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                    Class Timetable
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">
                      Synchronized LMS
                    </span>
                    <div className="size-1 bg-slate-300 rounded-full" />
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                      Academic Year 2024-25
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="size-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Live Connection: Active
              </span>
            </div>
          </header>

          <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
            {/* Class Selector */}
            <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4 ml-4">
                Select Grade:
              </span>
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedClass === cls
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  Class {cls}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-8 md:p-12 overflow-x-auto">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-6">
                  <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                    Syncing with Institution...
                  </p>
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-2 min-w-[1000px]">
                  <thead>
                    <tr>
                      <th className="p-6 text-left w-24">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                          Period
                        </span>
                      </th>
                      {DAYS.map((day) => (
                        <th key={day} className="p-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">
                              {day}
                            </span>
                            <div className="h-1 w-8 bg-indigo-100 rounded-full" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((p) => (
                      <tr key={p} className="group">
                        <td className="p-2">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="size-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-100">
                              <span className="text-xl font-black text-slate-400 group-hover:text-white">
                                {p}
                              </span>
                            </div>
                          </div>
                        </td>
                        {DAYS.map((day) => {
                          const cell = data[selectedClass]?.[day]?.[p] || {
                            subject: "",
                            teacher: "",
                          };
                          return (
                            <td key={day} className="p-2">
                              <motion.div
                                whileHover={{ y: -5 }}
                                className={`p-8 rounded-[2.5rem] min-h-[140px] flex flex-col justify-center transition-all duration-500 ${
                                  cell.subject
                                    ? "bg-white border border-slate-100 shadow-md group-hover:shadow-2xl"
                                    : "bg-slate-50/50 border border-transparent"
                                }`}
                              >
                                {cell.subject ? (
                                  <>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-4 leading-tight">
                                      {cell.subject}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                        <User size={12} />
                                      </div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {cell.teacher || "TBA"}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center">
                                    <div className="size-1 bg-slate-200 rounded-full mx-auto" />
                                  </div>
                                )}
                              </motion.div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Institutional Banner */}
          <div className="p-6 sm:p-10 bg-slate-950 rounded-3xl sm:rounded-[4rem] text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <GraduationCap size={200} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-8">
              <div className="size-16 sm:size-20 rounded-[1.5rem] sm:rounded-[2rem] bg-indigo-600/20 flex flex-shrink-0 items-center justify-center border border-indigo-500/20 backdrop-blur-3xl">
                <Sparkles className="size-8 sm:size-10 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black italic tracking-tight">
                  Institutional Accuracy Protocol
                </h4>
                <p className="text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] mt-1 leading-normal">
                  This schedule is legally verified and updated by the academic board.
                </p>
              </div>
            </div>
            <button className="relative z-10 w-full lg:w-auto px-8 py-4 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] sm:rounded-[2rem] hover:scale-105 transition-all shadow-3xl">
              Print Official Copy
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
