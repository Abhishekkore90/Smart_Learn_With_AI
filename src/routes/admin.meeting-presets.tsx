import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { COMMITTEES } from "./teacher.meeting";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/meeting-presets")({
  head: () => ({ meta: [{ title: "Meeting Agenda Presets — Super Admin" }] }),
  component: AdminMeetingPresets,
});

const MARATHI_MONTHS = [
  { value: 6, label: "जून (June)" },
  { value: 7, label: "जुलै (July)" },
  { value: 8, label: "ऑगस्ट (August)" },
  { value: 9, label: "सप्टेंबर (September)" },
  { value: 10, label: "ऑक्टोबर (October)" },
  { value: 11, label: "नोव्हेंबर (November)" },
  { value: 12, label: "डिसेंबर (December)" },
  { value: 1, label: "जानेवारी (January)" },
  { value: 2, label: "फेब्रुवारी (February)" },
  { value: 3, label: "मार्च (March)" },
  { value: 4, label: "एप्रिल (April)" },
  { value: 5, label: "मे (May)" },
];

interface ResolutionPreset {
  subjectNo: number;
  resolutionNo: number;
  subject: string;
  discussion: string;
  resolution: string;
  statusText: string;
  proposer: string;
  seconder: string;
  remark: string;
}

function AdminMeetingPresets() {
  const navigate = useNavigate();
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(
    COMMITTEES[0]?.id || "",
  );
  const [selectedMonth, setSelectedMonth] = useState(6); // Default to June (start of academic year)
  const [presets, setPresets] = useState<ResolutionPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("is_super_admin");
    if (!isAdmin) {
      navigate({ to: "/admin/login" });
      return;
    }
  }, [navigate]);

  // Fetch presets when committee or month changes
  useEffect(() => {
    if (!selectedCommitteeId || !selectedMonth) return;

    const fetchPresets = async () => {
      setLoading(true);
      try {
        const docRef = doc(
          db,
          "admin_meeting_presets",
          `${selectedCommitteeId}_${selectedMonth}`,
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPresets(data.resolutions || []);
        } else {
          setPresets([]);
        }
      } catch (err) {
        console.error("Error fetching presets:", err);
        toast.error("प्रिसिट्स लोड करताना त्रुटी आली!");
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, [selectedCommitteeId, selectedMonth]);

  const handleAddRow = () => {
    const nextSubjectNo = presets.length + 1;
    const currentMaxNo =
      presets.length > 0
        ? Math.max(...presets.map((r) => Number(r.resolutionNo) || 0))
        : 0;
    const nextResolutionNo = currentMaxNo > 0 ? currentMaxNo + 1 : 1;

    const newRow: ResolutionPreset = {
      subjectNo: nextSubjectNo,
      resolutionNo: nextResolutionNo,
      subject: "",
      discussion: "",
      resolution: "",
      statusText: "ठराव सर्वानुमते मंजूर करण्यात आला.",
      proposer: "",
      seconder: "",
      remark: "",
    };

    setPresets([...presets, newRow]);
  };

  const handleUpdateField = (
    index: number,
    field: keyof ResolutionPreset,
    value: any,
  ) => {
    const updated = [...presets];
    updated[index] = { ...updated[index], [field]: value };
    setPresets(updated);
  };

  const handleRemoveRow = (index: number) => {
    const updated = presets
      .filter((_, i) => i !== index)
      .map((res, i) => ({
        ...res,
        subjectNo: i + 1,
      }));
    setPresets(updated);
  };

  const handleSave = async () => {
    if (!selectedCommitteeId) {
      toast.error("कृपया समिती निवडा!");
      return;
    }

    // Basic validation
    const hasEmptySubject = presets.some((p) => !p.subject.trim());
    if (hasEmptySubject) {
      toast.error("कृपया सर्व विषयांचे शीर्षक प्रविष्ट करा!");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(
        db,
        "admin_meeting_presets",
        `${selectedCommitteeId}_${selectedMonth}`,
      );
      await setDoc(docRef, {
        committeeId: selectedCommitteeId,
        month: selectedMonth,
        resolutions: presets,
        updatedAt: new Date().toISOString(),
      });

      toast.success("मासिक विषय व ठराव प्रिसिट्स यशस्वीरित्या जतन केले गेले!");
    } catch (err) {
      console.error("Error saving presets:", err);
      toast.error("प्रिसिट्स जतन करताना त्रुटी आली!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#111827]">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 pt-16 pb-24">
        {/* Back navigation */}
        <div className="mb-10">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-black text-[#6B7280] hover:text-[#6C63FF] uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="size-4" /> Back to Hub
          </Link>
        </div>

        {/* Page Title Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-black/5 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <Sparkles className="size-3 text-indigo-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">
                Agenda Template Engine
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-none text-stone-900">
              मासिक विषय & <span className="text-[#6C63FF]">ठराव प्रिसिट्स</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-xl">
              विविध समित्यांसाठी महिनानिहाय विषय आणि ठराव प्रारूप ठरवा, जेणेकरून
              शिक्षकांना त्यांच्या मासिक सभांचे इतिवृत्त सहज भरता येईल.
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6C63FF] to-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> जतन होत आहे...
                </>
              ) : (
                <>
                  <Save className="size-4" /> प्रिसिट्स जतन करा
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-sm mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <label className="text-base font-black text-slate-800 block">
              १. समिती निवडा (Select Committee)
            </label>
            <select
              value={selectedCommitteeId}
              onChange={(e) => setSelectedCommitteeId(e.target.value)}
              className="w-full px-5 py-4 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl text-md font-bold outline-none focus:border-[#6C63FF] transition-all text-slate-800 cursor-pointer"
            >
              {COMMITTEES.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="text-base font-black text-slate-800 block">
              २. महिना निवडा (Select Month)
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-5 py-4 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl text-md font-bold outline-none focus:border-[#6C63FF] transition-all text-slate-800 cursor-pointer"
            >
              {MARATHI_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resolutions Presets Workspace */}
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 border border-black/5 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="size-10 text-[#6C63FF] animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              प्रिसिट्स लोड केले जात आहेत...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                विषय आणि ठराव तपशील ({presets.length})
              </h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6C63FF] hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <Plus className="size-4" /> विषय व ठराव जोडा
              </button>
            </div>

            <AnimatePresence initial={false}>
              {presets.length > 0 ? (
                <div className="space-y-6">
                  {presets.map((preset, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-slate-200 p-8 rounded-2xl relative space-y-6 shadow-sm hover:border-[#6C63FF]/30 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="absolute top-6 right-6 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                        title="काढून टाका"
                      >
                        <Trash2 className="size-5" />
                      </button>

                      <div className="grid grid-cols-2 gap-6 w-1/3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            विषय क्रमांक
                          </label>
                          <input
                            type="number"
                            value={preset.subjectNo}
                            onChange={(e) =>
                              handleUpdateField(
                                index,
                                "subjectNo",
                                Number(e.target.value),
                              )
                            }
                            className="w-24 px-4 py-3 bg-[#F8FAFF] border-2 border-slate-200 rounded-lg outline-none focus:border-[#6C63FF] font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            ठराव क्रमांक
                          </label>
                          <input
                            type="number"
                            value={preset.resolutionNo}
                            onChange={(e) =>
                              handleUpdateField(
                                index,
                                "resolutionNo",
                                Number(e.target.value),
                              )
                            }
                            className="w-24 px-4 py-3 bg-[#F8FAFF] border-2 border-slate-200 rounded-lg outline-none focus:border-[#6C63FF] font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-800 tracking-wider block">
                          विषय (Subject Title) *
                        </label>
                        <input
                          type="text"
                          value={preset.subject}
                          onChange={(e) =>
                            handleUpdateField(index, "subject", e.target.value)
                          }
                          placeholder="उदा. मागील सभेचे इतिवृत्त वाचून मंजूर करणेबाबत."
                          className="w-full px-5 py-3.5 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl outline-none focus:border-[#6C63FF] font-bold text-slate-800 placeholder-slate-400 text-md"
                          required
                        />
                      </div>



                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-800 tracking-wider block">
                          ठराव प्रारूप (Default Resolution Details)
                        </label>
                        <textarea
                          value={preset.resolution}
                          onChange={(e) =>
                            handleUpdateField(
                              index,
                              "resolution",
                              e.target.value,
                            )
                          }
                          placeholder="मंजूर होणाऱ्या ठरावाचे मूळ प्रारूप..."
                          className="w-full h-32 px-5 py-3.5 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl outline-none focus:border-[#6C63FF] font-medium text-slate-800 placeholder-slate-400 text-md resize-y leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-800 tracking-wider block">
                          ठराव निर्णय / स्थिती (Default Resolution Status)
                        </label>
                        <input
                          type="text"
                          value={preset.statusText}
                          onChange={(e) =>
                            handleUpdateField(
                              index,
                              "statusText",
                              e.target.value,
                            )
                          }
                          placeholder="उदा. ठराव सर्वानुमते मंजूर करण्यात आला."
                          className="w-full px-5 py-3.5 bg-[#F8FAFF] border-2 border-slate-200 rounded-xl outline-none focus:border-[#6C63FF] font-bold text-slate-800 placeholder-slate-400 text-md"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-16 border border-dashed border-slate-200 text-center">
                  <div className="size-16 bg-[#F8FAFF] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <AlertCircle className="size-8" />
                  </div>
                  <h4 className="text-slate-700 font-black tracking-tight text-lg">
                    कोणतेही प्रिसिट्स सेट केलेले नाहीत
                  </h4>
                  <p className="text-slate-400 text-xs font-semibold mt-1">
                    या महिन्यासाठी आणि समितीसाठी विषय व ठराव जोडण्यासाठी वरील
                    'विषय व ठराव जोडा' बटणावर क्लिक करा.
                  </p>
                </div>
              )}
            </AnimatePresence>

            {presets.length > 0 && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-10 py-4.5 bg-gradient-to-r from-[#6C63FF] to-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> जतन होत आहे...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" /> बदल जतन करा
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
