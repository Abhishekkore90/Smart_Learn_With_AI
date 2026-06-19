import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type Semester = "sem1" | "sem2";
interface Student { id: string; fullName?: string; name?: string; rollNo?: string; [key: string]: any; }

// Learning outcomes data per subject
const OUTCOMES: Record<string, { code: string; text: string }[]> = {
  marathi: [
    { code: "9.1.1",  text: "जास्त लांबीची अपरिचित गाणी, मोठ्या वाक्यांच्या गोष्टी (४ ते ८ वाक्ये) काळजीपूर्वक ऐकतो. त्याबद्दल संभाषण करतो आणि प्रश्न विचारतो." },
    { code: "9.1.2",  text: "मोठी (१० ओळी) गाणी/कविता गातो व मोठ्याने पुन्हा म्हणून दाखवतो." },
    { code: "9.2",    text: "शिक्षकांच्या मदतीने यमक जुळवतो लहानलहान कविता तयार करतो." },
    { code: "9.3",    text: "भाषणात सहभागी होतो. बोलण्यासाठी स्वतःची वेळ घेण्याची वाट पाहतो आणि इतरांना बोलू देतो." },
    { code: "9.3.2",  text: "वर्गात वाचून दाखवलेल्या किंवा चर्चा केलेल्या माहितीपर/कथेतर आशय स्वतःच्या अनुभवांशी सक्षमपणे जोडतो आणि त्याबद्दल बोलतो." },
    { code: "9.4.1",  text: "साध्या स्वरूपाच्या अनेक कृतींचा समावेश असलेल्या सूचनांचे पालन करतो. (एकाच वेळी ६ ते ९ सूचना एकत्र दिल्यास)" },
    { code: "9.4.2",  text: "साध्या स्वरूपाच्या अनेक कृतींचा समावेश असलेल्या सूचनांचे पालन करतो. (एकाच वेळी ८ ते ९ सूचना एकत्र दिल्यास)" },
    { code: "9.5",    text: "गोष्टींची मध्यवर्ती कल्पना व पात्रांच्या भावना लक्षात घेऊन संवादासह सांगतो." },
    { code: "9.6",    text: "साधे कथानक व पात्रासह स्वतःच्या छोट्या गोष्टी सांगतो." },
    { code: "9.7",    text: "चित्र आणि संदर्भ यांनुसार अपरिचित शब्दांच्या अर्थाचा अंदाज बांधतो." },
    { code: "10.1.1", text: "अक्षरांच्या ध्वनीमधून स्वर व व्यंजनांचे ध्वनी वेगळे करतो." },
    { code: "10.1.2", text: "शब्दातून अक्षरांचे ध्वनी वेगळे करतो." },
    { code: "10.2.1", text: "साधी विरामचिन्हे ओळखतो (पूर्णविराम, प्रश्नचिन्ह)" },
    { code: "10.3.1", text: "वर्णमालेतील सर्व अक्षरे व त्यांचे उच्चार ओळखतो." },
  ],
  english: [
    { code: "9.1.1.1",  text: "Listens to longer (4-8 sentences) songs/poems (unfamiliar) with attention and have conversations about them, asking and answering questions." },
    { code: "9.1.2.1",  text: "Sings/recites longer (10 sentences) songs/poems." },
    { code: "9.2.1.1",  text: "Extends/Creates short poems/rhymes with the help of the teacher." },
    { code: "9.3.1.1",  text: "Engages in conversations, wait for his/her turn to speak and allow other to speak." },
    { code: "9.3.2.1",  text: "Engages with non-fictional content read aloud or discussed in class, links knowledge from his/her own experiences and talks about it." },
    { code: "9.4.1.1",  text: "Follows instructions comprising of several steps. (8 to 9 instructions at a time)" },
    { code: "9.4.2.1",  text: "Gives clear instructions comprising of several steps. (8 to 9 instructions at a time)" },
    { code: "9.5.1.1",  text: "Interprets the intent of the plot and emotions of the characters in a story and tells the story with dialogues." },
    { code: "9.6.1.1",  text: "Narrates his/her own short stories with simple plots and characters." },
    { code: "9.7.1.1",  text: "Predicts meaning of unknown words in texts using pictures and context clues." },
    { code: "11.1.1.1", text: "Identifies rhyming words and alliterations." },
    { code: "11.1.2.1", text: "Identifies the beginning and end syllables in words." },
  ],
  math: [
    { code: "4.1.1", text: "इयत्तेनुसार गणितीय संकल्पना समजून सांगतो." },
    { code: "4.2.1", text: "अंकांची ओळख ठेऊन बेरीज-वजाबाकी अचूक करतो." },
    { code: "4.3.1", text: "गुणाकार व भागाकाराचे सोपे प्रश्न सोडवतो." },
    { code: "4.4.1", text: "साध्या आकृत्या ओळखतो व काढतो." },
    { code: "4.5.1", text: "वेळ व मापन यांशी संबंधित कार्ये करतो." },
    { code: "4.6.1", text: "तोंडी गणित जलद सोडवतो." },
    { code: "4.7.1", text: "गणिताशी संबंधित दैनंदिन समस्या सोडवतो." },
  ],
  hindi: [
    { code: "H.9.1", text: "लंबी कविता/गाने ध्यान से सुनता है और उनके बारे में बातचीत करता है." },
    { code: "H.9.2", text: "शिक्षक की मदद से तुकबंदी वाली कविता बनाता है." },
    { code: "H.9.3", text: "बातचीत में भाग लेता है और बारी-बारी से बोलता है." },
    { code: "H.9.4", text: "कई चरणों वाले निर्देशों का पालन करता है." },
    { code: "H.10.1", text: "अक्षरों की ध्वनि को पहचानता है." },
    { code: "H.10.2", text: "सरल विराम चिह्न पहचानता है." },
  ],
  evs: [
    { code: "E.1.1", text: "परिसरातील वनस्पती, प्राणी यांची माहिती सांगतो." },
    { code: "E.1.2", text: "परिसरातील बदल नोंदवतो व सांगतो." },
    { code: "E.2.1", text: "हवामान व ऋतू यांच्याबद्दल माहिती सांगतो." },
    { code: "E.3.1", text: "अन्न, पाणी व हवा यांचे महत्त्व सांगतो." },
    { code: "E.4.1", text: "सामाजिक जीवनाबद्दल माहिती सांगतो." },
    { code: "E.5.1", text: "प्रयोग व निरीक्षण करतो आणि सांगतो." },
  ],
};

const SUBJECTS = [
  { key: "marathi", label: "प्रथम भाषा : मराठी" },
  { key: "english", label: "द्वितीय भाषा : इंग्रजी" },
  { key: "math",    label: "गणित" },
  { key: "hindi",   label: "हिंदी" },
  { key: "evs",     label: "परिसर अभ्यास" },
];

// ratings: { [subjectKey]: { [outcomeCode]: { [studentId]: 1|2|3|0 } } }
type RatingData = Record<string, Record<string, Record<string, number>>>;

export function CCESubjectWise({ selectedClass, academicYear, onBack }: {
  selectedClass: string; academicYear: string; onBack: () => void;
}) {
  const [activeSemester, setActiveSemester] = useState<Semester>("sem1");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratingData, setRatingData] = useState<RatingData>({});

  // Outcome detail view state
  const [editingOutcome, setEditingOutcome] = useState<{
    subjectKey: string; subjectLabel: string; code: string; text: string;
  } | null>(null);

  // Fetch students
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("class", "==", selectedClass)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(data.sort((a, b) => parseInt(a.rollNo || "999") - parseInt(b.rollNo || "999")));
    });
    return () => unsub();
  }, [selectedClass]);

  // Load ratings
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "cce_outcomes", `${selectedClass}_${academicYear}_${activeSemester}`);
        const snap = await getDoc(ref);
        setRatingData(snap.exists() ? snap.data().ratings || {} : {});
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [selectedClass, academicYear, activeSemester]);

  const getRating = (subKey: string, code: string, studentId: string): number =>
    ratingData[subKey]?.[code]?.[studentId] || 0;

  const setRating = (subKey: string, code: string, studentId: string, value: number) => {
    setRatingData(prev => ({
      ...prev,
      [subKey]: {
        ...(prev[subKey] || {}),
        [code]: {
          ...((prev[subKey] || {})[code] || {}),
          [studentId]: value,
        },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "cce_outcomes", `${selectedClass}_${academicYear}_${activeSemester}`),
        { class: selectedClass, academicYear, semester: activeSemester, ratings: ratingData, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      toast.success("नोंदी जतन झाल्या!");
      setEditingOutcome(null);
    } catch (err: any) {
      toast.error("जतन अयशस्वी: " + err.message);
    }
    setSaving(false);
  };

  const hasAnyRating = (subKey: string, code: string) =>
    students.some(s => getRating(subKey, code, s.id) > 0);

  const containerStyle = {
    fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
  };

  // ── OUTCOME DETAIL VIEW (student ratings) ──
  if (editingOutcome) {
    const { subjectKey, subjectLabel, code, text } = editingOutcome;
    return (
      <div
        className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
        style={containerStyle}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <button
            onClick={() => setEditingOutcome(null)}
            className="text-[#d1fae5] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold text-[#d1fae5]">
            {selectedClass} - {activeSemester === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}
          </h2>
        </div>

        {/* Outcome badge + description */}
        <div className="px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[12px] font-bold mt-0.5"
              style={{ background: "#1a3520", color: "#6db58a", border: "1px solid #2d4a35" }}
            >
              {code}
            </div>
            <p className="text-[13px] leading-relaxed text-[#c8e6c8] font-medium">{text}</p>
          </div>
        </div>

        {/* Student list with 1 2 3 rating */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 py-3 space-y-3">
          {students.length === 0 ? (
            <div className="flex justify-center py-20 text-[#6b8f6b] text-sm">विद्यार्थी सापडले नाहीत</div>
          ) : students.map((student, idx) => {
            const rating = getRating(subjectKey, code, student.id);
            return (
              <div key={student.id} className="flex items-center justify-between py-1">
                {/* Student number + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: "#1e4620", color: "#4ade80", border: "1px solid #2d4a2d" }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[14px] font-medium text-[#d1fae5]">
                    {student.fullName || student.name || "-"}
                  </span>
                </div>

                {/* Rating pill: [ 1 | 2 | 3 | ● ] */}
                <div
                  className="flex items-center rounded-full overflow-hidden"
                  style={{ border: "1px solid #2d4a2d", background: "#0d160d" }}
                >
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => setRating(subjectKey, code, student.id, rating === level ? 0 : level)}
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                      style={{
                        background: rating === level ? "#1e4620" : "transparent",
                        color: rating === level ? "#4ade80" : "#6b8f6b",
                        borderRight: level < 3 ? "1px solid #1a2e1a" : "none",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                  {/* Toggle dot */}
                  <button
                    onClick={() => setRating(subjectKey, code, student.id, rating > 0 ? 0 : 3)}
                    className="w-10 h-9 flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: rating > 0 ? "#4ade80" : "#1a2e1a",
                      borderLeft: "1px solid #2d4a2d",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: rating > 0 ? "#0a1f0a" : "#4a5f4a" }}
                    />
                  </button>
                </div>
              </div>
            );
          })}
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

  // ── SUBJECT LIST VIEW ──
  return (
    <div
      className="bg-[#0b0e0a] text-white rounded-[2.5rem] border border-[#1f2a1f] shadow-2xl min-h-[600px] flex flex-col relative select-none overflow-hidden"
      style={containerStyle}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a2e1a] flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-[#1a231a] rounded-full transition-colors cursor-pointer text-white flex items-center justify-center"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-base font-bold tracking-tight text-[#d1fae5]">
          अध्ययन निष्पत्तीनिहाय प्रगती
        </h2>
      </div>

      {/* Semester tabs */}
      <div className="px-5 py-3 border-b border-[#1a2e1a] flex-shrink-0">
        <div className="flex bg-[#1a2e1a] rounded-xl p-1">
          {(["sem1", "sem2"] as Semester[]).map(sem => (
            <button
              key={sem}
              onClick={() => { setActiveSemester(sem); setExpandedSubject(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeSemester === sem
                  ? "bg-[#1e4620] text-[#4ade80] shadow-md"
                  : "text-[#6b8f6b] hover:text-[#a3d9a3]"
              }`}
            >
              {sem === "sem1" ? "प्रथम सत्र" : "द्वितीय सत्र"}
            </button>
          ))}
        </div>
      </div>

      {/* Subject accordion list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]" />
            <span className="text-xs text-[#6b8f6b] font-bold">लोड होत आहे...</span>
          </div>
        ) : SUBJECTS.map(subject => {
          const isOpen = expandedSubject === subject.key;
          const outcomes = OUTCOMES[subject.key] || [];
          const ratedCount = outcomes.filter(o => hasAnyRating(subject.key, o.code)).length;

          return (
            <div key={subject.key}>
              {/* Subject header */}
              <button
                onClick={() => setExpandedSubject(isOpen ? null : subject.key)}
                className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-[#121a12]"
                style={{ borderBottom: "1px solid #1a2e1a" }}
              >
                <span className="text-[15px] font-medium text-[#d1fae5]">{subject.label}</span>
                <div className="flex items-center gap-2">
                  {ratedCount > 0 && (
                    <span className="text-xs font-bold text-[#4ade80]">{ratedCount}/{outcomes.length}</span>
                  )}
                  {isOpen
                    ? <ChevronUp className="size-5 text-[#6b8f6b]" />
                    : <ChevronDown className="size-5 text-[#6b8f6b]" />
                  }
                </div>
              </button>

              {/* Expanded: outcome rows */}
              {isOpen && outcomes.map(outcome => {
                const rated = hasAnyRating(subject.key, outcome.code);
                return (
                  <div
                    key={outcome.code}
                    className="flex items-start gap-3 px-4 py-3.5"
                    style={{ borderBottom: "1px solid #111a11" }}
                  >
                    {/* Code badge */}
                    <div
                      className="flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold mt-0.5"
                      style={{
                        background: "#1a3520", color: "#6db58a",
                        border: "1px solid #2d4a35", minWidth: "42px", textAlign: "center",
                      }}
                    >
                      {outcome.code}
                    </div>

                    {/* Description */}
                    <p className="flex-1 text-[13px] leading-snug text-[#c8e6c8] font-medium">
                      {outcome.text}
                    </p>

                    {/* Circle → click opens student detail */}
                    <button
                      onClick={() => setEditingOutcome({
                        subjectKey: subject.key,
                        subjectLabel: subject.label,
                        code: outcome.code,
                        text: outcome.text,
                      })}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 mt-0.5"
                      style={{
                        border: rated ? "none" : "2px solid #4ade80",
                        background: rated ? "#4ade80" : "transparent",
                      }}
                    >
                      {rated && (
                        <svg className="w-4 h-4 text-[#0a1f0a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
