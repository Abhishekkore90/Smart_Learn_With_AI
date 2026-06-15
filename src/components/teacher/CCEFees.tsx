import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  CreditCard, 
  TrendingDown, 
  History, 
  HelpCircle,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Users
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface CCEFeesProps {
  selectedClass: string;
  academicYear: string;
  onBack: () => void;
}

export function CCEFees({ selectedClass, academicYear, onBack }: CCEFeesProps) {
  const [studentCount, setStudentCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Sync actual student count for this class
  useEffect(() => {
    setLoadingCount(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("class", "==", selectedClass)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudentCount(snapshot.size);
      setLoadingCount(false);
    }, (err) => {
      console.error(err);
      setLoadingCount(false);
    });
    return () => unsubscribe();
  }, [selectedClass]);

  // Bulk Discount tiers for display
  const discountTiers = [
    { students: 10, original: 100, discounted: 98 },
    { students: 50, original: 300, discounted: 267 },
    { students: 100, original: 550, discounted: 451 },
    { students: 500, original: 2550, discounted: 1717 },
    { students: 1000, original: 5050, discounted: 3232 }
  ];

  // Dynamic fee calculation function
  const calculateFee = (count: number) => {
    const original = 50 + count * 5;
    if (count <= 0) return { original: 50, discounted: 50, discountPercent: 0 };
    
    let discounted = original;
    if (count <= 10) {
      const pct = 0.02 * (count / 10);
      discounted = Math.round(original * (1 - pct));
    } else if (count <= 50) {
      const ratio = (count - 10) / 40;
      const pct = 0.02 + 0.09 * ratio;
      discounted = Math.round(original * (1 - pct));
    } else if (count <= 100) {
      const ratio = (count - 50) / 50;
      const pct = 0.11 + 0.07 * ratio;
      discounted = Math.round(original * (1 - pct));
    } else if (count <= 500) {
      const ratio = (count - 100) / 400;
      const pct = 0.18 + 0.146 * ratio;
      discounted = Math.round(original * (1 - pct));
    } else {
      const ratio = Math.min(1, (count - 500) / 500);
      const pct = 0.326 + 0.034 * ratio;
      discounted = Math.round(original * (1 - pct));
    }
    
    const discountPercent = Math.round(((original - discounted) / original) * 100);
    return { original, discounted, discountPercent };
  };

  const currentEstimation = calculateFee(studentCount);

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white text-slate-800 rounded-[2.5rem] p-6 md:p-8 font-sans shadow-xl border border-slate-200 relative overflow-hidden min-h-[500px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 relative z-10">
        <button 
          onClick={onBack}
          className="text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all p-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">ॲपची फी</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">App Fee & Subscription Structure</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Fee Structures & Tables */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Fee Structure Blocks */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-500" />
              फी रचना (Fee Structure)
            </h3>

            {/* Base Fee */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-200/60">
              <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                ₹
              </div>
              <div>
                <p className="text-sm font-black text-slate-850">शाळेची आधारभूत फी: ₹५०</p>
                <p className="text-xs font-semibold text-slate-450 mt-0.5">शाळा-स्तरीय प्रवेश आणि समर्थनासाठी निश्चित फी.</p>
              </div>
            </div>

            {/* Student Fee */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-200/60">
              <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                👤
              </div>
              <div>
                <p className="text-sm font-black text-slate-850">प्रति विद्यार्थी फी: ₹५</p>
                <p className="text-xs font-semibold text-slate-450 mt-0.5">वैयक्तिक विद्यार्थी मूल्यांकनासाठी आकारली जाते.</p>
              </div>
            </div>

            {/* Discount Desc */}
            <div className="flex items-start gap-3.5">
              <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Percent size={14} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-850">मोठ्या प्रमाणात सवलत</p>
                <p className="text-xs font-semibold text-slate-450 mt-0.5">जास्त विद्यार्थी असलेल्या शाळांना प्रति विद्यार्थी फीवर स्वयंचलित सवलत मिळते.</p>
              </div>
            </div>
          </div>

          {/* Bulk Discount Tiers Table */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingDown size={16} className="text-emerald-500" />
              सवलत तक्ता (Discount Scale Table)
            </h3>
            
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-600 text-white font-bold">
                    <th className="px-4 py-3">विद्यार्थी (Students)</th>
                    <th className="px-4 py-3 text-center">मूळ (Original)</th>
                    <th className="px-4 py-3 text-right">सवलतीत (Discounted)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {discountTiers.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-700">{tier.students}</td>
                      <td className="px-4 py-3 text-center text-slate-400 font-medium line-through">₹{tier.original}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-extrabold">₹{tier.discounted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: dynamic Calculator & Payment History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dynamic Fee Estimator */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[50px] pointer-events-none" />
            
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5 mb-4">
              <Users size={14} />
              तुमचे वर्ग शुल्क (Your Class Fee Estimator)
            </h3>

            {loadingCount ? (
              <div className="py-4 animate-pulse space-y-2">
                <div className="h-4 bg-emerald-500/50 rounded w-2/3" />
                <div className="h-8 bg-emerald-500/50 rounded w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-emerald-100 font-bold">
                    वर्ग: <span className="font-extrabold text-white bg-black/10 px-2 py-0.5 rounded-md ml-1">{selectedClass} Class</span>
                  </p>
                  <p className="text-xs text-emerald-100 font-bold mt-1">
                    एकूण विद्यार्थी: <span className="text-white font-extrabold">{studentCount}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-emerald-100">सवलत लागू:</span>
                  <span className="text-xs font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {currentEstimation.discountPercent}% OFF
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <p className="text-[10px] text-emerald-100 font-bold line-through">मूळ: ₹{currentEstimation.original}</p>
                    <p className="text-2xl font-black tracking-tight">₹{currentEstimation.discounted}</p>
                  </div>
                  <div className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1">
                    <ShieldCheck size={14} /> Apply
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment History Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <History size={16} className="text-emerald-500" />
              पेमेंट इतिहास (Payment History)
            </h3>

            <div className="space-y-3">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">₹१६१ भरले</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">+२४ विद्यार्थी जोडले</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-450">08 Oct 11:02 AM</span>
              </div>
            </div>
          </div>

          {/* Legal / Policy Links */}
          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms & Conditions &gt;</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Refund Policy &gt;</a>
          </div>

        </div>

      </div>

    </div>
  );
}
