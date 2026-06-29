import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";

export const Route = createFileRoute("/teacher/timetable")({
  component: TimetableLayout,
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

const CLASS_NAME_MAP: Record<string, { mr: string; en: string }> = {
  "1st": { mr: "इयत्ता पहिली", en: "CLASS 1ST" },
  "2nd": { mr: "इयत्ता दुसरी", en: "CLASS 2ND" },
  "3rd": { mr: "इयत्ता तिसरी", en: "CLASS 3RD" },
  "4th": { mr: "इयत्ता चौथी", en: "CLASS 4TH" },
  "5th": { mr: "इयत्ता पाचवी", en: "CLASS 5TH" },
  "6th": { mr: "इयत्ता सहावी", en: "CLASS 6TH" },
  "7th": { mr: "इयत्ता सातवी", en: "CLASS 7TH" },
  "8th": { mr: "इयत्ता आठवी", en: "CLASS 8TH" },
  "9th": { mr: "इयत्ता नववी", en: "CLASS 9TH" },
  "10th": { mr: "इयत्ता दहावी", en: "CLASS 10TH" },
};

function TimetableLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isBaseRoute =
    location.pathname === "/teacher/timetable" ||
    location.pathname === "/teacher/timetable/";

  if (!isBaseRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <TeacherHeader />
      <div className="flex flex-1 mt-16">
        <TeacherSidebar />
        <main className="flex-1 lg:pl-64 p-6 md:p-10 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-3 mt-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Select Class / इयत्ता निवडा
            </h2>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              STEP 2: CHOOSE THE TARGET STANDARD
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {CLASSES.map((cls, idx) => (
              <motion.button
                key={cls}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  navigate({
                    to: "/teacher/timetable/class",
                    search: { class: cls } as any,
                  });
                }}
                className="group p-8 rounded-[2.5rem] bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:from-[#7c3aed] hover:to-[#5b21b6] text-white text-center border border-indigo-500/25 transition-all duration-500 shadow-md hover:shadow-[0_20px_45px_rgba(139,92,246,0.35)] hover:scale-[1.03] cursor-pointer relative overflow-hidden flex flex-col items-center gap-4 min-h-[220px]"
              >
                {/* SVG Watermark Background */}
                <div className="absolute -bottom-6 -right-6 size-24 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-full h-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>

                {/* Class Standard Indicator Icon */}
                <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform text-white font-black text-sm uppercase">
                  {cls}
                </div>

                {/* Class Name Labels */}
                <div>
                  <h4 className="font-black text-lg text-white">
                    {CLASS_NAME_MAP[cls]?.mr}
                  </h4>
                  <p className="text-[10px] text-violet-100/70 font-black uppercase tracking-widest mt-1">
                    {CLASS_NAME_MAP[cls]?.en}
                  </p>
                </div>

                {/* Action Link Text */}
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-200 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
                  प्रवेश करा <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
