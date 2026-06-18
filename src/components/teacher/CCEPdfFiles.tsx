import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Green PDF file icon SVG
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0h18l10 10v26a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z" fill="#1e4620" />
      <path d="M22 0l10 10H26a4 4 0 01-4-4V0z" fill="#4ade80" opacity="0.5" />
      <path d="M7 22h3.5c1.1 0 2 .9 2 2s-.9 2-2 2H9v2H7v-6zm2 3h1.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H9v1z" fill="#4ade80" />
      <path d="M14 22h2.5c1.9 0 3.5 1.6 3.5 3.5S18.4 29 16.5 29H14v-7zm2 5h.5c.8 0 1.5-.7 1.5-1.5S17.3 24 16.5 24H16v3z" fill="#4ade80" />
      <path d="M21 22h4v2h-2v1h2v1h-2v2h-2v-6z" fill="#4ade80" />
      <text x="16" y="14" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="bold" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

interface PdfEntry {
  id: string;
  name: string;
}

export function CCEPdfFiles({ selectedClass, academicYear, onBack }: { selectedClass: string; academicYear: string; onBack: () => void }) {
  // Generate PDF file names dynamically based on class
  const pdfFiles: PdfEntry[] = [
    {
      id: "progress_card",
      name: `प्रगती-पत्रक-${selectedClass}-(1-3).pdf`,
    },
    {
      id: "cce_register",
      name: `मूल्यांकन-नोंदवही-${selectedClass}.pdf`,
    },
    {
      id: "learning_outcomes",
      name: `अध्ययन-निष्पतीनिहाय-संपादणूक-प्रगतीदर्शक-नोंदतक्का-${selectedClass}.pdf`,
    },
    {
      id: "annual_result",
      name: `वार्षिक-निकाल-पत्रक-${selectedClass}.pdf`,
    },
  ];

  const handleOpen = (file: PdfEntry) => {
    toast.info(`"${file.name}" लवकरच उपलब्ध होईल.`);
  };

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
        <h2 className="text-lg font-bold tracking-tight">
          {selectedClass} - PDFs
        </h2>
      </div>

      {/* PDF File List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {pdfFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6b8f6b]">
            <p className="text-sm">कोणतेही PDF उपलब्ध नाहीत</p>
          </div>
        ) : (
          pdfFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => handleOpen(file)}
              className="w-full flex items-start gap-4 p-2 rounded-xl hover:bg-[#121a12] transition-colors cursor-pointer text-left group"
            >
              {/* PDF Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <PdfIcon className="w-8 h-10" />
              </div>
              {/* File name */}
              <span className="text-[15px] font-medium text-[#d1fae5] leading-snug break-all">
                {file.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
