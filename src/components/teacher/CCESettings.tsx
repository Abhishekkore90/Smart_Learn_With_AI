import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  X, 
  Check, 
  Settings, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { toast } from "sonner";

interface CCESettingsProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

const DEFAULT_SUBJECTS = [
  { id: "marathi", label: "प्रथम भाषा : मराठी" },
  { id: "english", label: "द्वितीय भाषा : इंग्रजी" },
  { id: "maths", label: "गणित" },
  { id: "art", label: "कला" },
  { id: "work", label: "कार्यानुभव" },
  { id: "pe", label: "शारीरिक शिक्षण" }
];

export function CCESettings({ selectedClass, academicYear, onBack }: CCESettingsProps) {
  const [medium, setMedium] = useState("Marathi");
  const [isSemiEnglish, setIsSemiEnglish] = useState<boolean>(false);
  const [activeSubjects, setActiveSubjects] = useState<string[]>(
    DEFAULT_SUBJECTS.map(s => s.id)
  );
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, "cce_settings", `${selectedClass}_${academicYear}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.medium) setMedium(data.medium);
          if (data.isSemiEnglish !== undefined) setIsSemiEnglish(data.isSemiEnglish);
          if (data.subjects) setActiveSubjects(data.subjects);
          if (data.signatureUrl) setSignatureUrl(data.signatureUrl);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [selectedClass, academicYear]);

  // Handle Subject Toggle
  const toggleSubject = (subId: string) => {
    setActiveSubjects(prev => 
      prev.includes(subId)
        ? prev.filter(id => id !== subId)
        : [...prev, subId]
    );
  };

  // Convert uploaded image to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("कृपया २ MB पेक्षा लहान आकाराची इमेज निवडा.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSignatureUrl(reader.result as string);
      toast.success("सही यशस्वीरित्या जोडली गेली!");
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    setSignatureUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("सही हटवली गेली.");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, "cce_settings", `${selectedClass}_${academicYear}`);
      await setDoc(docRef, {
        class: selectedClass,
        academicYear,
        medium,
        isSemiEnglish,
        subjects: activeSubjects,
        signatureUrl,
        updatedAt: new Date().toISOString()
      });
      toast.success("सेटिंग्ज यशस्वीरित्या जतन केल्या!");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("सेटिंग्ज जतन करण्यात अडचण आली.");
    } finally {
      setSaving(false);
    }
  };

  const handleMediumChange = () => {
    toast.info("सध्या फक्त मराठी माध्यम सक्रिय आहे.");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 relative z-10">
        <button 
          onClick={onBack}
          className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm animate-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">सेटिंग्ज</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Settings Configuration</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-blue-500 font-bold gap-3">
          <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>सेटिंग्ज लोड होत आहेत...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 relative z-10 max-w-xl">
          
          {/* Medium Section */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medium (माध्यम)</p>
              <p className="text-sm font-black text-slate-800">{medium}</p>
            </div>
            <button 
              type="button"
              onClick={handleMediumChange}
              className="text-xs font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Semi English Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is class semi-english?</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">वर्ग सेमी-इंग्रजी आहे का?</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSemiEnglish(true)}
                className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  isSemiEnglish ? "border-blue-600 text-blue-600" : "border-slate-300"
                }`}>
                  {isSemiEnglish && <div className="size-2 rounded-full bg-blue-600" />}
                </div>
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSemiEnglish(false)}
                className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  !isSemiEnglish ? "border-blue-600 text-blue-600" : "border-slate-300"
                }`}>
                  {!isSemiEnglish && <div className="size-2 rounded-full bg-blue-600" />}
                </div>
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-500" />
              Subjects (सक्रिय विषय)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_SUBJECTS.map((sub) => {
                const isActive = activeSubjects.includes(sub.id);
                return (
                  <div 
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800">{sub.label}</span>
                    <div className={`size-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "border-slate-300 text-transparent"
                    }`}>
                      {isActive && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notice Box */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-3xl text-[11px] leading-relaxed text-slate-500 font-medium">
            आमचे ॲप हिंदी, उर्दू आणि इंग्रजी माध्यमांसाठी तयार आहे, परंतु ही माध्यमे अद्याप सक्रिय केलेली नाहीत. आम्ही या माध्यमांच्या विशिष्ट विषय रचनांशी आणि गरजांशी जुळवून घेण्यासाठी काम करत आहोत. जर तुम्ही या माध्यमांच्या शाळेतून असाल, तर कृपया आमच्याशी संपर्क साधा. आम्ही तुमच्यासोबत सहकार्य करून लवकरात लवकर समर्थन सक्रिय करण्याचा प्रयत्न करू.
          </div>

          {/* Signature Box */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              वर्गशिक्षक सही (Class Teacher Signature)
            </h3>

            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />

            {signatureUrl ? (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 relative flex flex-col items-center justify-center shadow-sm">
                <img 
                  src={signatureUrl} 
                  alt="Teacher Signature" 
                  className="max-h-24 max-w-full object-contain" 
                />
                <button
                  type="button"
                  onClick={removeSignature}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-400 gap-1.5"
              >
                <ImageIcon size={28} />
                <span className="text-xs font-bold">Click to add image</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-6 text-xs uppercase tracking-wider"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            जतन करा (Save Settings)
          </button>

        </form>
      )}

    </div>
  );
}
