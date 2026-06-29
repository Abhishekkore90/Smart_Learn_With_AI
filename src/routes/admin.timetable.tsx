import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Database,
  RefreshCw,
  FileJson,
  Eye,
} from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { showToast as toast } from "@/lib/custom-toast";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({
    meta: [{ title: "Timetable Uploader — Super Admin" }],
  }),
  component: TimetableAdmin,
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

function TimetableAdmin() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState("1st");
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    // Session Guard
    const isAdmin = sessionStorage.getItem("is_super_admin");
    if (!isAdmin) {
      navigate({
        to: "/login",
        search: { redirect: "/admin/timetable", role: "admin" } as any,
      });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setClassData(snapshot.data());
        } else {
          setClassData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error:", error);
        toast.error(`Failed to load class timetable data: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedClass]);

  const isPdf =
    classData?.fileType?.includes("pdf") ||
    classData?.fileName?.endsWith(".pdf") ||
    (classData?.fileUrl && (
      classData.fileUrl.startsWith("data:application/pdf") ||
      classData.fileUrl.startsWith("data:application/octet-stream;base64,JVBERi")
    ));

  const isImage =
    classData?.fileType?.includes("image") ||
    classData?.fileName?.match(/\.(png|jpe?g|gif|webp)$/i) ||
    (classData?.fileUrl && classData.fileUrl.startsWith("data:image/"));

  useEffect(() => {
    if (classData?.fileUrl) {
      if (classData.fileUrl.startsWith("data:")) {
        try {
          let type = classData.fileType || "application/pdf";
          if (isPdf) {
            type = "application/pdf";
          } else if (isImage) {
            const ext = classData.fileName?.split('.').pop() || "png";
            type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          }
          const base64Data = classData.fileUrl;
          const base64Clean = (base64Data.split(",")[1] || base64Data).replace(/\s/g, "");
          const pad = base64Clean.length % 4;
          const padded = pad ? base64Clean + "=".repeat(4 - pad) : base64Clean;
          const byteCharacters = atob(padded);
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
          toast.error("Error processing timetable file format.");
          setBlobUrl(null);
        }
      } else {
        setBlobUrl(classData.fileUrl);
      }
    } else {
      setBlobUrl(null);
    }
  }, [classData, isPdf, isImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setUploading(true);

    const isJson = file.name.endsWith(".json") || file.type === "application/json";

    if (isJson) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          await saveTimetableDocument({
            type: "grid",
            gridData: json,
            fileName: file.name,
            fileSize: formatSize(file.size),
            updatedAt: new Date().toISOString(),
          });
          toast.success(`Class ${selectedClass} JSON timetable uploaded! 🎉`);
        } catch (err) {
          console.error("JSON parsing error:", err);
          toast.error("Invalid JSON format.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } else {
      // 1. Try Catbox Upload first (free, permanent, fast public file host, bypasses all CDN 404s and size limits)
      try {
        const formData = new FormData();
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", file);

        const response = await fetch("/api/catbox/user/api.php", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const downloadUrl = await response.text();
          if (downloadUrl.startsWith("https://files.catbox.moe/")) {
            await saveTimetableDocument({
              type: "file",
              fileUrl: downloadUrl,
              fileName: file.name,
              fileType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
              fileSize: formatSize(file.size),
              updatedAt: new Date().toISOString(),
            });
            toast.success(`Class ${selectedClass} timetable file uploaded successfully! 🎉`);
            setUploading(false);
            return;
          }
        }
      } catch (catboxErr) {
        console.warn("Catbox upload failed, trying Bunny Storage...", catboxErr);
      }

      // 2. Try Bunny Storage Upload as fallback
      const storageApiKey = import.meta.env.VITE_BUNNY_STORAGE_API_KEY;
      const storageZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
      const cdnHostname = import.meta.env.VITE_BUNNY_STORAGE_CDN_HOSTNAME;

      if (storageApiKey && storageZone && cdnHostname) {
        try {
          const uniqueId = Math.random().toString(36).substring(2, 9) + "_" + Date.now();
          const cleanFileName = uniqueId + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

          const response = await fetch(`/api/bunny-storage/${storageZone}/documents/${cleanFileName}`, {
            method: "PUT",
            headers: {
              "AccessKey": storageApiKey,
              "Content-Type": file.type || "application/octet-stream"
            },
            body: file
          });

          if (response.ok) {
            const downloadUrl = `https://${cdnHostname}/documents/${cleanFileName}`;
            await saveTimetableDocument({
              type: "file",
              fileUrl: downloadUrl,
              fileName: file.name,
              fileType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
              fileSize: formatSize(file.size),
              updatedAt: new Date().toISOString(),
            });
            toast.success(`Class ${selectedClass} timetable file uploaded successfully to Bunny Storage! 🎉`);
            setUploading(false);
            return;
          } else {
            console.warn("Bunny Storage upload returned status:", response.status);
          }
        } catch (bunnyErr) {
          console.error("Bunny Storage upload failed, trying fallback...", bunnyErr);
        }
      }

      // 2. Fallback to Firebase Storage
      try {
        const storageRef = ref(storage, `timetables/class_${selectedClass}_${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        await saveTimetableDocument({
          type: "file",
          fileUrl: downloadUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: formatSize(file.size),
          updatedAt: new Date().toISOString(),
        });
        toast.success(`Class ${selectedClass} timetable file uploaded! 🎉`);
      } catch (storageErr: any) {
        console.warn("Storage upload failed, trying database fallback...", storageErr);
        const storageErrMsg = storageErr?.message || storageErr;
        
        if (file.size > 800 * 1024) {
          toast.error(`Storage failed (${storageErrMsg}) & file is too large for database fallback (>800KB). Please compress.`);
          setUploading(false);
          return;
        }

        toast.info("Uploading directly to database instead...");

        // 3. Fallback to Firestore database document body (as base64)
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            await saveTimetableDocument({
              type: "file",
              fileUrl: base64,
              fileName: file.name,
              fileType: file.type,
              fileSize: formatSize(file.size),
              updatedAt: new Date().toISOString(),
            });
            toast.success(`Class ${selectedClass} timetable uploaded to database successfully! 🎉`);
          } catch (firestoreErr: any) {
            console.error("Firestore fallback failed:", firestoreErr);
            toast.error(`Failed to save: ${firestoreErr.message || firestoreErr}`);
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const saveTimetableDocument = async (data: any) => {
    const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
    await setDoc(docRef, data);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the timetable for Class ${selectedClass}?`)) {
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "school_config", `timetable_class_${selectedClass}`);
      await deleteDoc(docRef);
      toast.success(`Deleted timetable for Class ${selectedClass}`);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete timetable.");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string, type: string) => {
    if (type === "grid") return <FileJson className="size-10 text-indigo-600" />;
    if (isPdf) return <FileText className="size-10 text-rose-600" />;
    if (isImage) return <ImageIcon className="size-10 text-emerald-600" />;
    return <FileText className="size-10 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-violet-500/10 font-sans antialiased">
      <Header />
      <main className="max-w-[1400px] mx-auto px-8 pt-16 pb-24">
        {/* Breadcrumb Header */}
        <div className="mb-12 space-y-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-black text-[#6B7280] hover:text-[#6C63FF] uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="size-4" /> Back to Hub
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="size-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Global Configuration
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-stone-900">
                Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Uploader.</span>
              </h1>
              <p className="text-[#6B7280] font-medium max-w-xl">
                Select a class and upload a timetable file (PDF, Image, or JSON structure). Updates are instantly synchronized to the student dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Tab & Upload Work Area */}
        <div className="bg-white border border-black/5 rounded-[3rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Class Select Header */}
          <div className="p-8 border-b border-slate-100 flex items-center bg-slate-50/50">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4 ml-2">
                Select Class:
              </span>
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedClass === cls
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105"
                      : "bg-white border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Status / Dropzone Area */}
          <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-6">
                <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Querying Firestore...
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {classData ? (
                  // Active Timetable Details & Preview
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="max-w-4xl mx-auto w-full space-y-8"
                  >
                    <div className="bg-slate-50/80 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5 text-left w-full md:w-auto">
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                          {getFileIcon(classData.fileType, classData.type)}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            Class {selectedClass} Timetable Active
                          </span>
                          <h4 className="text-xl font-black text-slate-900 truncate">
                            {classData.fileName || "timetable_configuration"}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-450 font-bold">
                            <span>{classData.fileSize || "Unknown size"}</span>
                            <div className="size-1 bg-slate-300 rounded-full" />
                            <span>
                              Uploaded {classData.updatedAt ? new Date(classData.updatedAt).toLocaleDateString() : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border border-slate-205 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/15 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-700 cursor-pointer transition-all">
                          <UploadCloud className="size-4 text-slate-400 hover:text-indigo-600" /> Upload New
                          <input
                            type="file"
                            accept=".json,application/pdf,image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={handleDelete}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Trash2 className="size-4" /> Delete Timetable
                        </button>
                      </div>
                    </div>

                    {/* Preview Workspace */}
                    <div className="space-y-3 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                        <Eye className="size-3.5 text-slate-400" /> Upload Preview
                      </span>

                      <div className="border border-slate-200/60 rounded-[3rem] overflow-hidden bg-slate-100/50 p-2 min-h-[400px] flex items-center justify-center shadow-inner">
                        {classData.type === "grid" ? (
                          <div className="p-8 text-center space-y-3 text-slate-450 max-w-sm">
                            <FileJson className="size-16 text-indigo-500/70 mx-auto" />
                            <h5 className="text-sm font-black uppercase tracking-wider text-slate-800">
                              JSON Grid Structure Loaded
                            </h5>
                            <p className="text-xs leading-relaxed font-medium">
                              Structured data is mapped directly to the interactive timetable cells in the student dashboard.
                            </p>
                          </div>
                        ) : isPdf && blobUrl ? (
                          <iframe
                            src={blobUrl}
                            className="w-full h-[600px] rounded-[2.5rem] border-none"
                            title="Timetable PDF Preview"
                          />
                        ) : isImage && blobUrl ? (
                          <img
                            src={blobUrl}
                            alt="Timetable Preview"
                            className="max-w-full max-h-[600px] object-contain rounded-2xl border border-slate-200 bg-white"
                          />
                        ) : (
                          <div className="p-8 text-center text-slate-400 space-y-2">
                            <FileText className="size-12 mx-auto text-slate-300" />
                            <p className="text-xs font-bold">
                              No preview support for this file format. You can click delete to re-upload.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Dropzone / File Upload Panel
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="max-w-xl mx-auto w-full"
                  >
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center border-4 border-dashed rounded-[3.5rem] p-12 cursor-pointer transition-all duration-350 select-none ${
                        isDragging || uploading
                          ? "border-indigo-600 bg-indigo-50/15"
                          : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".json,application/pdf,image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center space-y-4">
                          <RefreshCw className="size-16 text-indigo-600 animate-spin" />
                          <h4 className="text-xl font-black text-slate-900 tracking-tight animate-pulse">
                            Processing & Saving...
                          </h4>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-6 text-center">
                          <div className="size-20 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
                            <UploadCloud className="size-10" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                              Upload Class {selectedClass} Timetable
                            </h4>
                            <p className="text-[#6B7280] text-sm font-medium leading-relaxed max-w-sm mx-auto">
                              Drag and drop your PDF, PNG, JPG, or JSON timetable file here, or click to choose from your explorer.
                            </p>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Max file size: 5MB
                          </span>
                        </div>
                      )}
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Footer Info bar */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-450">
            <span className="flex items-center gap-1.5">
              <Database className="size-4 text-indigo-500" /> Active Class Document Sandbox
            </span>
            <span>
              Real-time Student Workspace Syncing
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
