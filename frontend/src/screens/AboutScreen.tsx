import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Cpu,
  Key,
  Database,
  Lock,
  Layers,
  HeartHandshake,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const { language } = useLanguage();
  const { navigateTo } = useApp();
  const isTamil = language === 'ta';

  const handleGetStarted = () => {
    localStorage.setItem('dosesaathi_seen_about', 'true');
    navigateTo('home');
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 py-4 sm:py-8 animate-in fade-in duration-200">
      {/* 1. HERO BRAND & WELCOME SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CBD5E1] shadow-2xs space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" showText={true} />
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#123F3A] text-xs font-semibold">
            <HeartHandshake className="w-4 h-4 text-[#138A7B]" />
            <span>
              {isTamil
                ? 'மருத்துவப் பாதுகாப்பு முதன்மை பெற்ற வழிகாட்டி'
                : 'Safety-First Healthcare Prescription Assistant'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#123F3A] tracking-tight leading-tight">
            {isTamil
              ? 'உங்கள் மருத்துவரின் சீட்டை எளிதாகப் புரிந்து கொள்ளுங்கள்'
              : 'Understand your doctor\'s prescription with clarity and confidence.'}
          </h1>

          <p className="text-sm sm:text-base text-[#66736F] leading-relaxed">
            {isTamil
              ? 'டோஸ்சாத்தி AI மூத்த குடிமக்கள், தொடர் சிகிச்சை பெறுவோர் மற்றும் குடும்பப் பராமரிப்பாளர்களுக்காக பிரத்யேகமாக உருவாக்கப்பட்டது. மருத்துவர்களின் கையெழுத்துச் சீட்டைத் தெளிவுபடுத்தி, சரியான நேரத்தில் மருந்துகளை எடுத்துக்கொள்ள உதவுகிறது.'
              : 'DoseSaathi AI is designed for older adults, patients managing chronic prescriptions, family caregivers, and anyone who struggles to decipher doctors\' handwritten prescriptions in India.'}
          </p>
        </div>
      </section>

      {/* 2. THE 4-STEP PATIENT WORKFLOW */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1] shadow-2xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#123F3A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#138A7B]" />
            <span>{isTamil ? 'டோஸ்சாத்தி எவ்வாறு உதவுகிறது?' : 'How DoseSaathi Helps You'}</span>
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            {isTamil
              ? 'கையெழுத்துச் சீட்டில் இருந்து மருத்துவமனை ஆலோசனை அறிக்கை வரை நான்கு எளிய படிகள்'
              : 'From paper slip to confirmed reminders in four safe and transparent steps'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#123F3A] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '1. சீட்டை ஸ்கேன் செய்க' : '1. Scan & Clarify'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'உங்கள் மருத்துவர் சீட்டின் புகைப்படத்தைப் பதிவேற்றுங்கள். மங்கலான கையெழுத்து மற்றும் நிழல்களை நீக்கி எழுத்துக்களைத் தெளிவுபடுத்துகிறது.'
                : 'Take or upload a photo of the doctor\'s handwritten slip. We enhance faint pen strokes and remove shadows so every line is easy to read.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#138A7B] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '2. சரிபார்த்து உறுதி செய்க' : '2. Review & Verify'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'கணினியில் வந்த தகவல்களை அசல் கையெழுத்துச் சீட்டுடன் ஒப்பிட்டுப் பாருங்கள். தெளிவற்ற பகுதிகளை நீங்கள் சரிசெய்யும் வரை நினைவூட்டல் தொடங்காது.'
                : 'Compare the extracted medicine details against the actual doctor\'s handwriting. Ambiguous instructions are clearly highlighted and must be verified before scheduling.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#123F3A] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '3. மருந்தின் பயனை அறிக' : '3. Understand Purpose'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'ஒவ்வொரு மருந்தும் எதற்காகப் பரிந்துரைக்கப்பட்டுள்ளது, அதை உணவுக்கு முன்பா அல்லது பின்பா சாப்பிட வேண்டும் போன்ற தகவல்களை எளிய தமிழில் அறியலாம்.'
                : 'Learn what each medicine is for, its active formulation, and whether to take it before or after meals in simple, easy-to-understand language.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#138A7B] text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '4. நினைவூட்டல் & மருத்துவர் அறிக்கை' : '4. Reminders & Doctor Report'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'சரியான நேரத்தில் நினைவூட்டல்களைப் பெற்று, மருந்து சாப்பிட்டதை நேர்மையாகப் பதிவு செய்யுங்கள். உங்கள் மருத்துவரிடம் காட்ட PDF அறிக்கையையும் பெறலாம்.'
                : 'Receive timely reminders, log doses honestly, and generate a printable clinical adherence summary to share with your physician during visits.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. SAFETY FIRST PHILOSOPHY */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1] shadow-2xs space-y-4">
        <h2 className="text-lg font-bold text-[#123F3A] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#138A7B]" />
          <span>{isTamil ? 'எங்கள் பாதுகாப்பு விதிகள்' : 'Clinical Safety Principles'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#E6F4EF] border border-[#138A7B]/30 space-y-1.5">
            <span className="font-bold text-[#123F3A] block">
              {isTamil ? 'ஊகங்கள் கிடையாது' : 'Zero Speculation'}
            </span>
            <p className="text-[#66736F] leading-relaxed">
              {isTamil
                ? 'சீட்டில் எழுதப்பட்டுள்ளதை மட்டுமே வாசிக்கிறோம். காணாத மருந்துகளையோ அளவுகளையோ நாங்கள் சுயமாகச் சேர்ப்பதில்லை.'
                : 'We transcribe strictly what is written. The system never invents missing dosages, strengths, or medicine names.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9EF] border border-[#D99026]/30 space-y-1.5">
            <span className="font-bold text-[#9A5E0B] block">
              {isTamil ? 'தெளிவற்றவை தடுக்கப்படும்' : 'Ambiguity Protection'}
            </span>
            <p className="text-[#66736F] leading-relaxed">
              {isTamil
                ? 'கையெழுத்து புரியவில்லை என்றால், அது உங்கள் கவனத்திற்கு கொண்டு வரப்படும். உறுதிப்படுத்தாமல் நினைவூட்டல் தொடங்காது.'
                : 'If handwriting or dosage frequency is unclear, scheduling is blocked until a human or doctor confirms the exact instruction.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] space-y-1.5">
            <span className="font-bold text-[#25312F] block">
              {isTamil ? 'நேர்மையான பதிவு' : 'Honest Reporting'}
            </span>
            <p className="text-[#66736F] leading-relaxed">
              {isTamil
                ? 'பதிலளிக்கப்படாத நினைவூட்டல்கள் சாப்பிட்டதாகக் கணக்கிடப்படாது. நோயாளி அல்லது குடும்பத்தினர் உறுதிப்படுத்தியவை மட்டுமே பதிவாகும்.'
                : 'Unanswered reminders are never assumed to be taken. Adherence records distinguish between patient-reported, caregiver-reported, and skipped doses.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. TECHNICAL ARCHITECTURE, DATA SOURCES & COMPLIANCE (DEDICATED SECTION) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1] shadow-2xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F3] text-[#123F3A] text-xs font-semibold mb-2 border border-[#CBD5E1]">
            <Layers className="w-3.5 h-3.5 text-[#138A7B]" />
            <span>Technical Architecture & Standards</span>
          </div>
          <h2 className="text-lg font-bold text-[#123F3A]">
            Engineering, Model Configuration & Registries
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Technical foundation, libraries, government drug registries, and accessibility compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* AI Engine */}
          <div className="p-4 rounded-2xl border border-[#CBD5E1] bg-[#FAF8F3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#123F3A]">
              <Cpu className="w-4 h-4 text-[#138A7B]" />
              <span>AI Vision Engine</span>
            </div>
            <p className="text-[#66736F] leading-relaxed">
              Powered by <strong>Google Gemini 3.8 Flash</strong> (<code>gemini-3.8-flash</code>) multimodal vision with strict transcription system prompts and low temperature for deterministic, factual character recognition.
            </p>
          </div>

          {/* Image Preprocessing */}
          <div className="p-4 rounded-2xl border border-[#CBD5E1] bg-[#FAF8F3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#123F3A]">
              <Layers className="w-4 h-4 text-[#138A7B]" />
              <span>Image Preprocessing (OpenCV CLAHE)</span>
            </div>
            <p className="text-[#66736F] leading-relaxed">
              Uses OpenCV Contrast Limited Adaptive Histogram Equalization (CLAHE) and grayscale morphological filters to sharpen faint handwriting and normalize clinical document lighting.
            </p>
          </div>

          {/* Medicine Registries */}
          <div className="p-4 rounded-2xl border border-[#CBD5E1] bg-[#FAF8F3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#123F3A]">
              <Database className="w-4 h-4 text-[#138A7B]" />
              <span>Indian Medical Registries</span>
            </div>
            <p className="text-[#66736F] leading-relaxed">
              Drug purpose and safe administration data are referenced against:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[#25312F]">
              <li>Central Drugs Standard Control Organisation (CDSCO)</li>
              <li>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</li>
              <li>Indian Pharmacopoeia Commission (IPC)</li>
            </ul>
          </div>

          {/* Document Compilation & Privacy */}
          <div className="p-4 rounded-2xl border border-[#CBD5E1] bg-[#FAF8F3] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#123F3A]">
              <FileText className="w-4 h-4 text-[#138A7B]" />
              <span>Clinical PDF Engine & Privacy</span>
            </div>
            <p className="text-[#66736F] leading-relaxed">
              Doctor consultation documents are compiled using Python <strong>ReportLab</strong>. All patient records remain securely on the user's device under <strong>Local Storage Mode</strong> without external distribution.
            </p>
          </div>
        </div>

        {/* Accessibility & Standards Badge */}
        <div className="p-4 rounded-2xl bg-[#E6F4EF]/70 border border-[#138A7B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#138A7B] shrink-0" />
            <span className="text-[#123F3A] font-medium">
              Accessibility Standard: <strong>WCAG 2.2 AA Compliant</strong> (Scalable typography up to 20px, minimum 44px touch targets, high contrast, and voice-assisted guidance).
            </span>
          </div>
        </div>
      </section>

      {/* 5. HOW TO CONFIGURE THE AI MODEL (GUIDE FOR USERS & EVALUATORS) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-[#123F3A]">
          <Key className="w-5 h-5 text-[#138A7B]" />
          <h2 className="text-base font-bold">
            How to Connect Your Gemini API Key
          </h2>
        </div>

        <p className="text-xs text-[#66736F] leading-relaxed">
          DoseSaathi AI works out of the box with an instant offline demonstration mode for standard Indian prescriptions. To enable live OCR processing of any custom handwriting photograph using Gemini 3.8 Flash:
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1] flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#123F3A] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              1
            </span>
            <p className="text-[#25312F]">
              Get a free Gemini API key from Google AI Studio at{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[#138A7B] font-semibold underline inline-flex items-center gap-0.5"
              >
                <span>aistudio.google.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1] flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#123F3A] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              2
            </span>
            <p className="text-[#25312F]">
              Open the <strong>Profile & Settings</strong> tab in the app, paste your key in the <strong>AI Vision Engine Configuration</strong> box, and click <strong>Save Key</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1] flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#123F3A] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              3
            </span>
            <p className="text-[#25312F]">
              Alternatively, set <code>GEMINI_API_KEY=AIzaSy...</code> in your <code>.env</code> file in the project folder.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM PROMINENT "GET STARTED" BUTTON */}
      <div className="pt-4 pb-8 flex flex-col items-center space-y-3">
        <button
          onClick={handleGetStarted}
          className="w-full sm:w-auto min-w-[280px] min-h-[52px] px-8 py-4 rounded-2xl bg-[#138A7B] hover:bg-[#18A493] text-white font-bold text-base shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{isTamil ? 'பயன்பாட்டைத் தொடங்குக' : 'Get Started'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-[#66736F]">
          {isTamil
            ? 'தொடங்கும்போது நீங்கள் முகப்புத் திரைக்கு அழைத்துச் செல்லப்படுவீர்கள்.'
            : 'Clicking Get Started takes you directly to your Home Dashboard.'}
        </p>
      </div>
    </div>
  );
};

