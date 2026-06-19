import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft, Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WeightageItem {
  id: string;
  name: string;
  studentIds: number[]; // roll numbers assigned
  description?: string;
}

interface WeightageData {
  semester1: WeightageItem[];
  semester2: WeightageItem[];
}

export function CCEWeightage({ selectedClass, academicYear, onBack }: { selectedClass: string; academicYear: string; onBack: () => void }) {
  const [data, setData] = useState<WeightageData>({ semester1: [], semester2: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSemester, setActiveSemester] = useState<"semester1" | "semester2">("semester1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "cce_weightage_v2", `${selectedClass}_${academicYear}`);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().data) {
          setData(snap.data().data);
        } else {
          // Migrate from old format or create default
          const oldRef = doc(db, "cce_weightage", `${selectedClass}_${academicYear}`);
          const oldSnap = await getDoc(oldRef);
          if (oldSnap.exists() && oldSnap.data().rows) {
            const oldRows = oldSnap.data().rows;
            const defaultItems: WeightageItem[] = oldRows.map((row: any, idx: number) => ({
              id: `item_${idx + 1}`,
              name: `भारांश निश्चिती ${idx + 1}`,
              studentIds: [],
              description: `${row.subject} - तोंडी: ${row.oral}, उपक्रम: ${row.activity}, चाचणी: ${row.test}`,
            }));
            setData({ semester1: defaultItems, semester2: [] });
          } else {
            setData({
              semester1: [
                { id: "item_1", name: "भारांश निश्चिती 1", studentIds: [1, 2, 3], description: "" },
              ],
              semester2: [],
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [selectedClass, academicYear]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "cce_weightage_v2", `${selectedClass}_${academicYear}`), {
        class: selectedClass,
        academicYear,
        data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("भारांश जतन झाला!");
    } catch (err: any) {
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSaving(false);
  };

  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error("कृपया नाव टाका");
      return;
    }
    const newItem: WeightageItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      studentIds: [],
      description: "",
    };
    setData(prev => ({
      ...prev,
      [activeSemester]: [...prev[activeSemester], newItem],
    }));
    setNewItemName("");
    setShowAddForm(false);
    toast.success("भारांश जोडला!");
  };

  const duplicateItem = (item: WeightageItem) => {
    const newItem: WeightageItem = {
      ...item,
      id: `item_${Date.now()}`,
      name: `${item.name} (प्रत)`,
    };
    setData(prev => ({
      ...prev,
      [activeSemester]: [...prev[activeSemester], newItem],
    }));
    toast.success("प्रत तयार झाली!");
  };

  const deleteItem = (itemId: string) => {
    if (!confirm("हा भारांश हटवायचा आहे का?")) return;
    setData(prev => ({
      ...prev,
      [activeSemester]: prev[activeSemester].filter(i => i.id !== itemId),
    }));
    toast.success("भारांश हटवला!");
  };

  const startEditing = (item: WeightageItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = (itemId: string) => {
    if (!editName.trim()) return;
    setData(prev => ({
      ...prev,
      [activeSemester]: prev[activeSemester].map(i =>
        i.id === itemId ? { ...i, name: editName.trim() } : i
      ),
    }));
    setEditingId(null);
    setEditName("");
  };

  const currentItems = data[activeSemester];

  return (
    <div className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col font-sans relative select-none" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a2e1a]">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-[#1a231a] rounded-full transition-colors cursor-pointer text-white flex items-center justify-center"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">
          भारांश निश्चिती
        </h2>
      </div>

      {/* Semester Tabs */}
      <div className="px-5 py-3 border-b border-[#1a2e1a]">
        <div className="flex bg-[#1a2e1a] rounded-xl p-1">
          <button
            onClick={() => setActiveSemester("semester1")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeSemester === "semester1"
                ? "bg-[#1e4620] text-[#4ade80] shadow-md"
                : "text-[#6b8f6b] hover:text-[#a3d9a3]"
            }`}
          >
            प्रथम सत्र
          </button>
          <button
            onClick={() => setActiveSemester("semester2")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeSemester === "semester2"
                ? "bg-[#1e4620] text-[#4ade80] shadow-md"
                : "text-[#6b8f6b] hover:text-[#a3d9a3]"
            }`}
          >
            द्वितीय सत्र
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]"></div>
            <span className="text-xs text-[#6b8f6b] font-bold">लोड होत आहे...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Item list */}
            {currentItems.map((item) => (
              <div key={item.id} className="space-y-0">
                {/* Item row */}
                <div className="flex items-center justify-between py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(item.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                      className="flex-1 bg-transparent border-b border-[#4ade80] text-[#d1fae5] text-[15px] font-medium outline-none py-1"
                      autoFocus
                    />
                  ) : (
                    <span className="text-[15px] font-medium text-[#d1fae5]">
                      {item.name}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(item)}
                      className="p-2 hover:bg-[#1a2e1a] rounded-lg transition-colors cursor-pointer text-[#6b8f6b] hover:text-[#4ade80]"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => duplicateItem(item)}
                      className="p-2 hover:bg-[#1a2e1a] rounded-lg transition-colors cursor-pointer text-[#6b8f6b] hover:text-[#4ade80]"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 hover:bg-[#1a2e1a] rounded-lg transition-colors cursor-pointer text-[#6b8f6b] hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Description text */}
            <div className="py-4">
              <p className="text-[13px] text-[#6b8f6b] leading-relaxed">
                आता तुम्ही एकाधिक भारांश निश्चित करू शकता. विद्यार्थ्यांच्या गटांनुसार प्रकल्प किंवा इतर भारांश ठरवता येतील. विद्यार्थ्यांचा हजेरी क्रमांक असलेले वर्तुळ योग्य भारांश निश्चितीच्या बॉक्समध्ये ड्रॅग आणि ड्रॉप करावे लागेल.
              </p>
            </div>

            {/* Student assignment cards */}
            {currentItems.map((item) => (
              <div key={`card_${item.id}`} className="bg-[#141a14] border border-[#1f2a1f] rounded-2xl p-4 space-y-3">
                <p className="text-[13px] font-medium text-[#d1fae5]">{item.name}</p>
                {item.studentIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.studentIds.map((num) => (
                      <div
                        key={num}
                        className="w-10 h-10 rounded-full bg-[#1e4620] text-[#4ade80] font-bold text-sm flex items-center justify-center border border-[#2d4a2d] cursor-pointer hover:bg-[#275a2a] transition-colors"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#4a5f4a]">विद्यार्थी नियुक्त नाहीत</p>
                )}
              </div>
            ))}

            {/* Add new item form */}
            {showAddForm && (
              <div className="bg-[#141a14] border border-[#1f2a1f] rounded-2xl p-4 space-y-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="भारांश निश्चिती नाव"
                  className="w-full px-4 py-3 bg-black/40 border border-[#2d4730] focus:border-[#4f8055] rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all font-medium"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
              </div>
            )}

            {/* Save button */}
            <div className="pt-4 pb-16">
              <button
                onClick={save}
                disabled={saving}
                className="mx-auto block px-8 py-3 bg-[#1a2e1a] hover:bg-[#243524] border border-[#2d4a2d] text-[#6b8f6b] hover:text-[#4ade80] font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? "जतन होत आहे..." : "जतन करा"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAB - Add new item */}
      <button
        onClick={() => {
          if (showAddForm) {
            addItem();
          } else {
            setShowAddForm(true);
          }
        }}
        className="absolute bottom-6 right-6 size-14 bg-[#1e4620] hover:bg-[#275a2a] text-white rounded-full shadow-lg shadow-black/40 flex items-center justify-center hover:scale-105 transition-all cursor-pointer border border-[#2a592c]/50 z-30"
        title="भारांश जोडा"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
