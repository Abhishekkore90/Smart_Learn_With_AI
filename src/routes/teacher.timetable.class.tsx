import { createFileRoute } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";

export const Route = createFileRoute("/teacher/timetable/class")({
  component: ClassTimetablePage,
});

function ClassTimetablePage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <TeacherHeader />
      <div className="flex flex-1 mt-16">
        <TeacherSidebar />
        <main className="flex-1 lg:pl-64 p-6">
          <div className="max-w-5xl mx-auto space-y-6 pt-4">
            <h1 className="text-base font-bold text-center text-slate-800">
              Class Timetable
            </h1>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <select className="w-full md:w-80 px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-blue-500">
                <option value="">Select Class</option>
              </select>
              <select className="w-full md:w-80 px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-blue-500">
                <option value="">Select Division</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
