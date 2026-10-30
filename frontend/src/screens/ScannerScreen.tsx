import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Upload,
  ArrowLeft,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

export const ScannerScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { speak } = useAccessibility();
  const { navigateTo, setCurrentPrescription } = useApp();

  const isTamil = language === 'ta';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAnalysis = async (prescriptionId: string) => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Stage 1: Improving image clarity with OpenCV
    setProcessingStage(1);
    await new Promise((r) => setTimeout(r, 600));

    // Stage 2: Reading handwritten text with Gemini Vision
    setProcessingStage(2);

    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/analyze`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error("Prescription analysis failed. Please verify the image file and try again.");
      }

      // Stage 3: Preparing details for human review
      setProcessingStage(3);
      await new Promise((r) => setTimeout(r, 500));

      const analysisData = await res.json();
      setCurrentPrescription({
        ...analysisData,
        id: analysisData.prescription_id || analysisData.id
      });

      speak(t.review.headline);
      navigateTo('review');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Analysis failed. Please try with another image or the certified sample slip.");
      setIsProcessing(false);
    }
  };

  const handleUseSample = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append('use_sample', 'true');
      const res = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      setPreviewUrl(data.image_url);
      await startAnalysis(data.prescription_id);
    } catch (e: any) {
      setErrorMsg("Failed to load sample prescription.");
      setIsProcessing(false);
    }
  };

  const processUploadedFile = async (file: File) => {
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: form
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      await startAnalysis(data.prescription_id);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to process image.");
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#66736F] hover:text-[#123F3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'முகப்பிற்குத் திரும்புக' : 'Back to Dashboard'}</span>
        </button>

        <h1 className="text-lg font-bold text-[#123F3A]">
          {t.scanner.title}
        </h1>

        <div className="w-16" />
      </div>

      {/* Main Upload / Drag-and-Drop Card for Web */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E9E8] shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#25312F]">
            {isTamil ? 'மருத்துவர் சீட்டைப் பதிவேற்றவும்' : 'Upload or Scan Doctor\'s Prescription Slip'}
          </h2>
          <p className="text-xs sm:text-sm text-[#66736F] leading-relaxed">
            {isTamil
              ? 'கையெழுத்துச் சீட்டு, மருத்துவமனை டிஸ்சார்ஜ் சுருக்கம் அல்லது ஓபிடி ஆலோசனைக் குறிப்புகளின் புகைப்படத்தைப் பதிவேற்றலாம்.'
              : 'Upload a clear photo or scanned document of handwritten Indian doctor scripts, hospital discharge summaries, or OPD consultation slips.'}
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center space-y-4 ${
            dragActive
              ? 'border-[#138A7B] bg-[#E6F4EF]/40 scale-[1.01]'
              : 'border-[#CBD5E1] bg-[#FAF8F3] hover:border-[#138A7B]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {previewUrl && !isProcessing ? (
            <div className="relative max-w-md max-h-[300px] overflow-hidden rounded-2xl border border-[#CBD5E1] shadow-sm">
              <img src={previewUrl} alt="Prescription preview" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#CBD5E1] shadow-xs flex items-center justify-center text-[#138A7B]">
              <Upload className="w-8 h-8 stroke-[1.8]" />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-bold text-[#25312F]">
              {isTamil ? 'சீட்டை இங்கே இழுத்துப் போடவும் அல்லது பதிவேற்ற அழுத்தவும்' : 'Drag and drop your prescription image here, or browse files'}
            </p>
            <p className="text-xs text-[#66736F]">
              Supported formats: JPEG, PNG, WEBP (Clear lighting recommended)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-[#138A7B] hover:bg-[#18A493] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isTamil ? 'சாதனத்திலிருந்து பதிவேற்றுக' : 'Choose File from Device'}</span>
            </button>

            <button
              onClick={handleUseSample}
              disabled={isProcessing}
              className="px-5 py-3 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8F7F2] text-[#123F3A] text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D99026]" />
              <span>{isTamil ? 'மாதிரி சீட்டைப் பயன்படுத்து (Dr. Sharma)' : 'Use Sample Indian Slip (Dr. Sharma)'}</span>
            </button>
          </div>

          {/* 3-Stage Progress Screen Modal when Analyzing */}
          {isProcessing && (
            <div className="absolute inset-0 bg-[#123F3A]/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
              <RefreshCw className="w-10 h-10 text-[#138A7B] animate-spin stroke-[2]" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {t.scanner.processingTitle}
                </h3>
                <p className="text-xs text-[#E6F4EF]/80 max-w-sm">
                  {isTamil
                    ? 'மருத்துவப் பாதுகாப்பு விதிகளின்படி தரவுகள் பரிசீலிக்கப்படுகின்றன'
                    : 'Transcribing medical script with strict hallucination guardrails'}
                </p>
              </div>

              {/* Three Clear Stages */}
              <div className="w-full max-w-xs space-y-2.5 text-left text-xs pt-2">
                <div className={`flex items-center gap-2.5 ${processingStage >= 1 ? 'text-white' : 'text-white/40'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStage >= 1 ? 'text-[#138A7B]' : 'text-white/20'}`} />
                  <span className="font-medium">{t.scanner.stage1}</span>
                </div>
                <div className={`flex items-center gap-2.5 ${processingStage >= 2 ? 'text-white' : 'text-white/40'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStage >= 2 ? 'text-[#138A7B]' : 'text-white/20'}`} />
                  <span className="font-medium">{t.scanner.stage2}</span>
                </div>
                <div className={`flex items-center gap-2.5 ${processingStage >= 3 ? 'text-white' : 'text-white/40'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStage >= 3 ? 'text-[#138A7B]' : 'text-white/20'}`} />
                  <span className="font-medium">{t.scanner.stage3}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#E6F4EF]/70 max-w-sm pt-2 border-t border-white/10">
                {t.scanner.notice}
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#FDF2F2] border border-[#B94F45] text-[#991B1B] text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Capture Guidelines Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-1">
            <span className="font-bold text-[#123F3A] block">1. Good Lighting</span>
            <span className="text-[#66736F]">Avoid shadows over the doctor's handwriting or ink stamps.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-1">
            <span className="font-bold text-[#123F3A] block">2. Flat Document</span>
            <span className="text-[#66736F]">Keep the prescription slip flat without folds covering the medicine names.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-1">
            <span className="font-bold text-[#123F3A] block">3. Full View</span>
            <span className="text-[#66736F]">Ensure clinic letterhead, date, Rx items, and doctor signature are included.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
