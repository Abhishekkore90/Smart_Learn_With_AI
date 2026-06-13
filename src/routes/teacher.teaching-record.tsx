import { createFileRoute, Link } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { Notebook, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/teacher/teaching-record")({
  component: TeachingRecordPage,
});

function TeachingRecordPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 flex flex-col justify-center min-h-[calc(100vh-8rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-16 text-center max-w-xl mx-auto shadow-xl space-y-8"
          >
            <div className="size-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <Notebook className="size-10 animate-pulse" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                अध्यापन नोंद / <span className="text-emerald-600">Teaching Record</span>
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                शिक्षकांचे दैनिक टाचण, अध्यापन अहवाल आणि वर्गनिहाय दैनंदिनी नोंदवण्याची सुविधा येथे लवकरच उपलब्ध होईल.
              </p>
              <p className="text-slate-400 text-xs font-bold leading-relaxed italic">
                Daily lesson planning sheets, teaching logs, and class journals tracker will be coming soon.
              </p>
            </div>

            <div className="pt-4">
              <Link
                to="/teacher"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
              >
                <ChevronLeft className="size-4" /> Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
