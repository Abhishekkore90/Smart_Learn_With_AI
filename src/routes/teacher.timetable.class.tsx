import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Download, FolderX, Eye, Calendar as CalendarIcon } from "lucide-react";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/teacher/timetable/class")({
  validateSearch: (search: Record<string, unknown>) => ({
    class: (search.class as string) || "1st",
  }),
  component: ClassTimetablePage,
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

function ClassTimetablePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const selectedClass = search.class || "1st";

  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTimetable, setShowTimetable] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTimetableData(snapshot.data());
        } else {
          setTimetableData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error:", error);
        setTimetableData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedClass]);

  const isPdf =
    timetableData?.fileType?.includes("pdf") ||
    timetableData?.fileName?.endsWith(".pdf") ||
    (timetableData?.fileUrl && (
      timetableData.fileUrl.startsWith("data:application/pdf") ||
      timetableData.fileUrl.startsWith("data:application/octet-stream;base64,JVBERi")
    ));

  const isImage =
    timetableData?.fileType?.includes("image") ||
    timetableData?.fileName?.match(/\.(png|jpe?g|gif|webp)$/i) ||
    (timetableData?.fileUrl && timetableData.fileUrl.startsWith("data:image/"));

  useEffect(() => {
    if (timetableData?.fileUrl) {
      if (timetableData.fileUrl.startsWith("data:")) {
        try {
          let type = timetableData.fileType || "application/pdf";
          if (isPdf) {
            type = "application/pdf";
          } else if (isImage) {
            const ext = timetableData.fileName?.split('.').pop() || "png";
            type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          }
          const base64Data = timetableData.fileUrl;
          const base64Clean = base64Data.split(",")[1] || base64Data;
          const byteCharacters = atob(base64Clean);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
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
        setBlobUrl(timetableData.fileUrl);
      }
    } else {
      setBlobUrl(null);
    }
  }, [timetableData, isPdf, isImage]);

  const handleClassChange = (cls: string) => {
    setShowTimetable(false);
    navigate({
      to: "/teacher/timetable/class",
      search: { class: cls } as any,
    });
  };

  const handleDownloadFile = () => {
    if (!blobUrl) {
      toast.error("No timetable file available to download.");
      return;
    }
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", blobUrl);
    downloadAnchor.setAttribute("download", timetableData.fileName || `timetable_class_${selectedClass}.pdf`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <TeacherHeader />
      <div className="flex flex-1 mt-16">
        <TeacherSidebar />
        <main className="flex-1 lg:pl-64 p-6 md:p-8 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] min-w-max">
                GRADE:
              </span>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls} Standard
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowTimetable(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Eye className="size-4" /> View
              </button>
            </div>

            <button
              onClick={handleDownloadFile}
              disabled={!blobUrl || !showTimetable}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                blobUrl && showTimetable
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Download className="size-4" /> Download PDF
            </button>
          </div>

          {/* Timetable Section */}
          {!showTimetable ? (
            /* Prompt to Click View */
            <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm">
              <div className="size-16 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
                <CalendarIcon className="size-8" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Ready to View Timetable
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select a class grade and click the "View" button above to display the timetable.
                </p>
              </div>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="h-[600px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm">
              <div className="size-12 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                Fetching Timetable...
              </p>
            </div>
          ) : blobUrl ? (
            /* Display Panel */
            <div className="border border-slate-200 rounded-[2.5rem] overflow-hidden bg-white shadow-sm p-4 flex items-center justify-center min-h-[600px]">
              {isPdf ? (
                <iframe
                  src={blobUrl}
                  className="w-full h-[850px] rounded-2xl border border-slate-200/50"
                  title="Class Timetable PDF"
                />
              ) : isImage ? (
                <img
                  src={blobUrl}
                  alt="Class Timetable"
                  className="max-w-full max-h-[850px] object-contain rounded-2xl border border-slate-250 bg-white"
                />
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-bold">
                    This file format preview is not supported. Please click the button above to download.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State Notice */
            <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm">
              <div className="size-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350 shadow-inner">
                <FolderX className="size-8" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  No Timetable Uploaded
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  No timetable file has been uploaded for Class {selectedClass} Standard. Please check again later.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
