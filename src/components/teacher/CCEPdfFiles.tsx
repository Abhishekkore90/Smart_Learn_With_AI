import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Trash2, 
  FolderOpen,
  Upload
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where,
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { toast } from "sonner";

interface CCEPdfFilesProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

const CLASS_LABELS: Record<string, string> = {
  "1st": "पहिली 1",
  "2nd": "दुसरी 2",
  "3rd": "तिसरी 3",
  "4th": "चौथी 4",
  "5th": "पाचवी 5",
  "6th": "सहावी 6",
  "7th": "सातवी 7",
  "8th": "आठवी 8",
  "9th": "नववी 9",
  "10th": "दहावी 10",
  "11th": "अकरावी 11",
  "12th": "बारावी 12"
};

export function CCEPdfFiles({ selectedClass, academicYear, onBack }: CCEPdfFilesProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const classLabel = CLASS_LABELS[selectedClass] || selectedClass;

  // Real-time sync of results filtered by selected class
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "results"),
      where("class", "==", selectedClass)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      
      // Sort client-side to avoid Firestore composite index requirement
      data.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending
      });
      
      setFiles(data);
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching PDF files:", err);
      toast.error("Error fetching PDF files: " + err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedClass]);

  // Download file
  const handleDownload = (file: any) => {
    try {
      const link = document.createElement("a");
      link.href = file.fileContent;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`"${file.fileName}" डाउनलोड होत आहे...`);
    } catch {
      toast.error("फाइल डाउनलोड करताना अडचण आली.");
    }
  };

  // Delete file
  const handleDelete = async (id: string) => {
    if (!confirm("ही फाइल कायमची हटवायची आहे का?")) return;
    try {
      await deleteDoc(doc(db, "results", id));
      toast.success("फाइल यशस्वीरित्या हटवली.");
    } catch {
      toast.error("फाइल हटवताना अडचण आली.");
    }
  };

  // Upload new file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700 * 1024) {
      toast.error("कृपया ७०० KB पेक्षा लहान फाइल निवडा (Firestore Limit).");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await addDoc(collection(db, "results"), {
          examTitle: file.name.replace(/\.[^/.]+$/, ""),
          class: selectedClass,
          fileName: file.name,
          fileType: file.type,
          fileContent: reader.result as string,
          uploadedBy: "Teacher",
          createdAt: new Date().toISOString(),
          dateStr: new Date().toLocaleDateString("en-GB").replace(/\//g, "-")
        });
        toast.success(`"${file.name}" यशस्वीरित्या अपलोड झाली!`);
      } catch (err: any) {
        console.error(err);
        toast.error("फाइल अपलोड करताना अडचण आली: " + err.message);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              {classLabel} - PDFs
            </h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
              Uploaded PDF Files for {selectedClass} Class
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.csv" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />
          <button 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? (
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            अपलोड
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="relative z-10 space-y-3 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-500 font-bold gap-3">
            <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>PDF फाइल्स लोड होत आहेत...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <FolderOpen size={48} strokeWidth={1.5} className="text-slate-300" />
            <p className="text-sm font-bold italic">या वर्गासाठी कोणत्याही PDF फाइल्स उपलब्ध नाहीत.</p>
            <p className="text-[10px] text-slate-400 font-bold">वरील "अपलोड" बटण वापरून फाइल अपलोड करा.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 hover:border-blue-400/50 hover:bg-blue-50/10 rounded-2xl transition-all group"
              >
                {/* File Info */}
                <div 
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleDownload(file)}
                >
                  <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-extrabold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {file.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {file.examTitle} • {file.dateStr || ""}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer rounded-lg hover:bg-blue-50"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
