import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const MEDIUM_OPTIONS = [
  "मराठी - Marathi",
  "हिंदी - Hindi",
  "English",
  "Semi-English",
];

const DEFAULT_SUBJECTS = [
  "प्रथम भाषा : मराठी",
  "द्वितीय भाषा : इंग्रजी",
  "गणित",
  "कला",
  "कार्यानुभव",
  "शारीरिक शिक्षण",
];

// Floating label input component (matches image style)
function FloatInput({
  label, value, onChange, placeholder, required, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div className="relative mb-4">
      <label
        className="absolute left-3 transition-all pointer-events-none font-medium z-10"
        style={{
          top: focused || filled ? "-9px" : "14px",
          fontSize: focused || filled ? "11px" : "14px",
          color: focused ? "#4ade80" : "#6b8f6b",
          background: focused || filled ? "#0b0e0a" : "transparent",
          paddingLeft: focused || filled ? "4px" : "0",
          paddingRight: focused || filled ? "4px" : "0",
        }}
      >
        {label}{required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? (placeholder || "") : ""}
        className="w-full px-4 py-4 rounded-xl text-sm font-medium outline-none transition-all"
        style={{
          background: "transparent",
          border: `1px solid ${focused ? "#4ade80" : "#2d4730"}`,
          color: "white",
        }}
      />
    </div>
  );
}

// Floating label dropdown for माध्यम
function FloatSelect({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filled = value.length > 0;
  return (
    <div className="relative mb-4">
      <label
        className="absolute left-3 transition-all pointer-events-none font-medium z-10"
        style={{
          top: filled || open ? "-9px" : "14px",
          fontSize: filled || open ? "11px" : "14px",
          color: open ? "#4ade80" : "#6b8f6b",
          background: "#0b0e0a",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        {label}{required && "*"}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 rounded-xl text-sm font-medium text-left flex items-center justify-between outline-none transition-all cursor-pointer"
        style={{
          background: "transparent",
          border: `1px solid ${open ? "#4ade80" : "#2d4730"}`,
          color: value ? "white" : "#6b8f6b",
        }}
      >
        <span>{value || ""}</span>
        <ChevronDown className="size-4" style={{ color: "#6b8f6b" }} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden shadow-2xl"
          style={{ top: "calc(100% + 4px)", background: "#141a14", border: "1px solid #1f2a1f" }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer"
              style={{
                background: value === opt ? "#1e4620" : "transparent",
                color: value === opt ? "#4ade80" : "#d1fae5",
                borderBottom: "1px solid #1a2e1a",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Image upload box
function ImageBox({
  label, value, onChange, wide,
}: {
  label: string; value: string; onChange: (v: string) => void; wide?: boolean;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("फाइल 500KB पेक्षा लहान असावी"); return; }
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-2" style={{ color: "#d1fae5" }}>{label}</p>
      <label className="cursor-pointer block" style={{ width: wide ? "100%" : "160px" }}>
        <div
          className="rounded-xl flex items-center justify-center overflow-hidden transition-all"
          style={{
            height: wide ? "90px" : "110px",
            border: "1px solid #2d4730",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : (
            <p className="text-xs text-center" style={{ color: "#4a5f4a" }}>Clik to add image</p>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>
    </div>
  );
}

export function CCESettings({ selectedClass, academicYear, onBack }: {
  selectedClass: string; academicYear: string; onBack: () => void;
}) {
  const [settings, setSettings] = useState({
    schoolName: "", address: "", udiseCode: "",
    medium: "मराठी - Marathi", slogan: "",
    teacherName: "", teacherMobile: "", principalName: "",
    schoolLogo: "", signatureUrl: "", principalSignature: "",
    subjects: DEFAULT_SUBJECTS,
    isSemiEnglish: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  // true = show the full-page school info edit form
  const [editingSchoolInfo, setEditingSchoolInfo] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "cce_settings", `${selectedClass}_${academicYear}`);
        const snap = await getDoc(ref);
        if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [selectedClass, academicYear]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "cce_settings", `${selectedClass}_${academicYear}`), {
        ...settings, class: selectedClass, academicYear, updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("सेटिंग्ज जतन झाल्या!");
      setEditingSchoolInfo(false);
    } catch (err: any) { toast.error("जतन अयशस्वी: " + err.message); }
    setSaving(false);
  };

  const addSubject = () => {
    if (newSubject.trim() && !settings.subjects.includes(newSubject.trim())) {
      setSettings(prev => ({ ...prev, subjects: [...prev.subjects, newSubject.trim()] }));
      setNewSubject("");
    }
  };

  const removeSubject = (sub: string) => {
    setSettings(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== sub) }));
  };

  const upd = (field: string) => (v: string) =>
    setSettings(prev => ({ ...prev, [field]: v }));

  if (loading) return (
    <div className="bg-[#0b0e0a] rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl p-10 flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]" />
    </div>
  );

  // ── SCHOOL INFO EDIT FORM (full page) ──
  if (editingSchoolInfo) {
    return (
      <div
        className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
        style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <button
            onClick={() => setEditingSchoolInfo(false)}
            className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-[15px] font-bold text-[#d1fae5]">
            तुमच्या शाळेची माहिती संपादन करा
          </h2>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto pb-24 px-5 py-5">
          <FloatInput
            label="शाळेचे नाव" value={settings.schoolName}
            onChange={upd("schoolName")} required
            placeholder="जिल्हा परिषद शाळा..."
          />
          <FloatInput
            label="UDISE कोड" value={settings.udiseCode}
            onChange={upd("udiseCode")} required
            placeholder="27350800701"
          />
          <FloatSelect
            label="माध्यम" value={settings.medium}
            onChange={upd("medium")} options={MEDIUM_OPTIONS} required
          />
          <FloatInput
            label="पत्ता" value={settings.address}
            onChange={upd("address")} required
            placeholder="ता. जि...."
          />
          <FloatInput
            label="मुख्याध्यापक" value={settings.principalName}
            onChange={upd("principalName")} required
            placeholder="श्री/श्रीमती..."
          />
          <FloatInput
            label="घोषवाक्य" value={settings.slogan}
            onChange={upd("slogan")}
            placeholder="ज्ञान, संस्कार..."
          />
          <ImageBox
            label="शाळेचा लोगो"
            value={settings.schoolLogo}
            onChange={upd("schoolLogo")}
            wide
          />
          <ImageBox
            label="मुख्याध्यापक सही"
            value={settings.principalSignature}
            onChange={upd("principalSignature")}
          />
        </div>

        {/* Fixed save button */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0b0e0a] to-transparent">
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-4 bg-[#8fbf7f] hover:bg-[#a2d192] active:scale-[0.99] text-black font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    );
  }

  // ── SETTINGS LIST VIEW ──
  return (
    <div
      className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col font-sans select-none"
      style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a2e1a]">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-[#1a231a] rounded-full transition-colors cursor-pointer text-white flex items-center justify-center"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">Settings</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Medium row → Change opens full-page editor */}
        <div className="border-b border-[#1a2e1a] pb-4">
          <p className="text-xs text-[#6b8f6b] font-medium mb-1">Medium</p>
          <div className="flex items-center justify-between">
            <p className="text-[#d1fae5] text-lg font-bold">{settings.medium}</p>
            <button
              onClick={() => setEditingSchoolInfo(true)}
              className="text-[#4ade80] text-sm font-bold hover:text-[#86efac] transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Is Semi-English */}
        <div className="flex items-center justify-between border-b border-[#1a2e1a] pb-4">
          <p className="text-[#d1fae5] text-[15px] font-medium">Is class semi-english?</p>
          <div className="flex items-center gap-4">
            {[true, false].map((val) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setSettings(prev => ({ ...prev, isSemiEnglish: val }))}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    borderColor: "#4ade80",
                    background: settings.isSemiEnglish === val ? "#4ade80" : "transparent",
                  }}
                >
                  {settings.isSemiEnglish === val && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0a1f0a]" />
                  )}
                </div>
                <span className="text-[#d1fae5] text-sm">{val ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-3">
          <p className="text-[#4ade80] text-base font-bold">Subjects</p>
          <div className="space-y-2">
            {settings.subjects.map((sub) => (
              <div key={sub} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e4620] border border-[#2d4a2d] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                  </div>
                  <span className="text-[#d1fae5] text-[15px] font-medium">{sub}</span>
                </div>
                <button
                  onClick={() => removeSubject(sub)}
                  className="text-[#4a5f4a] hover:text-red-400 transition-colors cursor-pointer text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {/* Add subject */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="नवीन विषय..."
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              className="flex-1 px-4 py-2.5 bg-black/40 border border-[#2d4730] focus:border-[#4f8055] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
            <button
              onClick={addSubject}
              className="px-4 py-2.5 bg-[#1e4620] hover:bg-[#275a2a] text-[#4ade80] rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              + जोडा
            </button>
          </div>
        </div>

        {/* Notice box */}
        <div className="bg-[#141a14] border border-[#1f2a1f] rounded-2xl p-4">
          <p className="text-[#8fb38f] text-[13px] leading-relaxed">
            आमचे ॲप हिंदी, उर्दू आणि इंग्रजी माध्यमांसाठी तयार आहे, परंतु ही माध्यमे अद्याप सक्रिय केलेली नाहीत. आम्ही या माध्यमांच्या विशिष्ट विषय रचनांशी आणि गरजांशी जुळवून घेण्यासाठी काम करत आहोत.
          </p>
        </div>

        {/* Teacher Signature */}
        <div className="space-y-2">
          <p className="text-[#d1fae5] text-[15px] font-medium">वर्गशिक्षक सही</p>
          <label className="cursor-pointer block" style={{ width: "160px" }}>
            <div
              className="rounded-xl flex items-center justify-center overflow-hidden transition-all"
              style={{ height: "110px", border: "1px solid #2d4730", background: "rgba(0,0,0,0.25)" }}
            >
              {settings.signatureUrl ? (
                <img src={settings.signatureUrl} alt="Signature" className="w-full h-full object-contain" />
              ) : (
                <p className="text-xs text-center" style={{ color: "#4a5f4a" }}>Clik to add image</p>
              )}
            </div>
            <input
              type="file" accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => upd("signatureUrl")(reader.result as string);
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* Save button */}
        <div className="pb-6 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-4 bg-[#8fbf7f] hover:bg-[#a2d192] active:scale-[0.99] text-black font-extrabold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "जतन करा"}
          </button>
        </div>
      </div>
    </div>
  );
}
