import React from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PdfPreviewModal: React.FC = () => {
  const { activePdfReport, setActivePdfReport } = useApp();

  if (!activePdfReport) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#CBD5E1] flex flex-col space-y-4 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4EF] text-[#123F3A] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#138A7B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#123F3A]">Doctor Consultation Report PDF</h3>
              <p className="text-xs text-[#66736F]">Physician Consultation Document • {activePdfReport.filename}</p>
            </div>
          </div>

          <button
            onClick={() => setActivePdfReport(null)}
            className="p-2 rounded-xl text-[#66736F] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Iframe / PDF Preview Canvas */}
        <div className="flex-1 w-full min-h-[450px] sm:min-h-[520px] rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#FAF8F3]">
          <iframe
            src={activePdfReport.url}
            title="Doctor Report PDF Preview"
            className="w-full h-full min-h-[450px] sm:min-h-[520px] border-none"
          />
        </div>

        {/* Disclaimers & Download action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] text-[11px] text-[#66736F] leading-relaxed max-w-2xl">
            <strong className="text-[#25312F]">Patient Privacy Notice:</strong> This clinical document is generated for your voluntary review with your doctor or pharmacist. DoseSaathi does not transmit health records to third-party ad networks or remote repositories.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActivePdfReport(null)}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-[#CBD5E1] text-xs font-semibold text-[#66736F] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href={activePdfReport.url}
              download={activePdfReport.filename}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-[#138A7B] hover:bg-[#18A493] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
