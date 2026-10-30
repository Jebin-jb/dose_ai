import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Camera,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Pill,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  CalendarCheck,
  Stethoscope
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { navigateTo, schedules, adherenceEvents, openReminderModal, currentPrescription } = useApp();

  const isTamil = language === 'ta';

  // Active confirmed schedules
  const activeSchedules = schedules.filter((s) => s.is_active);
  const nextSchedule = activeSchedules.length > 0 ? activeSchedules[0] : null;
  const nextTime = nextSchedule && nextSchedule.times.length > 0 ? nextSchedule.times[0] : null;

  // Real adherence counts from database (starts at 0 when fresh)
  const reportedTaken = adherenceEvents.filter((e) => e.status === 'patient_reported_taken' || e.status === 'caregiver_reported_taken').length;
  const recordedSkipped = adherenceEvents.filter((e) => e.status === 'patient_reported_skipped').length;
  const unconfirmedCount = adherenceEvents.filter((e) => e.status === 'unconfirmed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. HERO BANNER: Full-Screen Web Dashboard Introduction */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#123F3A] to-[#18534B] text-white p-6 sm:p-10 shadow-sm border border-[#123F3A]/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#E6F4EF] border border-white/15">
            <ShieldCheck className="w-4 h-4 text-[#138A7B]" />
            <span>{isTamil ? 'மருத்துவப் பாதுகாப்பு முதன்மை பெற்ற தளம்' : 'Safety-First Healthcare Prescription Assistant'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {isTamil
              ? 'மருத்துவரின் கையெழுத்துச் சீட்டை எளிதாகப் புரிந்து கொள்ளுங்கள்.'
              : 'Understand your doctor\'s prescription with clarity and confidence.'}
          </h1>

          <p className="text-sm sm:text-base text-[#E6F4EF]/90 leading-relaxed max-w-2xl">
            {isTamil
              ? 'டோஸ்சாத்தி AI உங்கள் மருத்துவர் சீட்டில் உள்ள கையெழுத்தை வாசித்து, எளிய தமிழ் விளக்கங்களுடன் சரிபார்த்து, உங்கள் ஒப்புதலுக்குப் பிறகே நினைவூட்டல்களை அமைக்கிறது.'
              : 'Turn confusing handwritten medical slips into verified medicine instructions and reliable daily reminders — strictly reviewed by you before any reminders activate, with zero AI hallucination.'}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('scanner')}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#138A7B] hover:bg-[#18A493] text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-[0.99]"
            >
              <Camera className="w-4 h-4 stroke-[2.3]" />
              <span>{isTamil ? 'புதிய சீட்டை ஸ்கேன் செய்க' : 'Scan New Prescription'}</span>
            </button>

            <button
              onClick={() => navigateTo('scanner')}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isTamil ? 'மாதிரி சீட்டைப் பரிசோதிக்க (Dr. Sharma)' : 'Try Sample Indian Slip (Instant Demo)'}</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle medical symbol watermark */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden md:block">
          <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="4" />
            <path d="M 50 30 L 50 70 M 30 50 L 70 50" stroke="white" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* 2. HOW THE PLATFORM WORKS — Clean Web Workflow Explanation */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1EFE8] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#123F3A]">
              {isTamil ? 'டோஸ்சாத்தி AI எவ்வாறு செயல்படுகிறது?' : 'How DoseSaathi AI Works'}
            </h2>
            <p className="text-xs text-[#66736F]">
              {isTamil
                ? 'நான்கு பாதுகாப்பான படிகளில் கையெழுத்துச் சீட்டு சரிபார்க்கப்பட்ட நினைவூட்டலாக மாறுகிறது'
                : 'A 4-step clinical safety pipeline connecting doctor prescription to patient understanding'}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#138A7B] bg-[#E6F4EF] px-3 py-1 rounded-full self-start">
            {isTamil ? 'மருத்துவப் பாதுகாப்பு முதன்மை' : 'Human-Verified Safety'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#123F3A] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '1. சீட்டை ஸ்கேன் செய்க' : '1. Scan & Enhance'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'மங்கலான பேனா வரிகளைத் தெளிவாக்கி, நிழல்களை நீக்கி எளிதாக வாசிக்க வைக்கிறது.'
                : 'Cleans up shadows and sharpens faint pen strokes so the prescription is crisp and easy to view.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#138A7B] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '2. சரிபார்த்து உறுதி செய்க' : '2. Review & Verify'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'மருத்துவரின் கையெழுத்துடன் மருந்துகளை ஒப்பிட்டுப் பாருங்கள். தெளிவற்றவற்றை நீங்கள் உறுதி செய்ய வேண்டும்.'
                : 'Review each medicine against the handwriting. Any ambiguous instructions are flagged for your confirmation.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#123F3A] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '3. மருந்தின் பயனை அறிக' : '3. Understand Purpose'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'மருந்துகள் எதற்காகப் பரிந்துரைக்கப்பட்டுள்ளன என்பதை எளிய தமிழில் தெளிவாகப் புரிந்து கொள்ளலாம்.'
                : 'Clear, patient-friendly summaries explain what each medicine does and how to take it safely.'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#138A7B] text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="text-sm font-bold text-[#25312F]">
              {isTamil ? '4. நினைவூட்டல் & அறிக்கை' : '4. Reminders & Report'}
            </h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'மருந்து சாப்பிட்டதை நேர்மையாகப் பதிவு செய்து, உங்கள் மருத்துவரிடம் காட்ட மருத்துவ அறிக்கையைப் பதிவிறக்கலாம்.'
                : 'Keep an honest log of your daily doses and download a clear clinical report for your doctor appointments.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT GRID (2 COLUMNS ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Today's Schedule & Medications */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E9E8] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1EFE8] pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#138A7B]" />
                <h2 className="text-base font-bold text-[#123F3A]">
                  {t.home.todaySection.title}
                </h2>
              </div>

              {activeSchedules.length > 0 && (
                <button
                  onClick={() => navigateTo('my_medicines')}
                  className="text-xs font-semibold text-[#138A7B] hover:underline flex items-center gap-1"
                >
                  <span>{t.home.todaySection.viewSchedule}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* If active schedule exists, show confirmed reminder cards */}
            {activeSchedules.length > 0 ? (
              <div className="space-y-3">
                {activeSchedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#CBD5E1]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#138A7B] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4EF] text-[#123F3A] flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-5 h-5 text-[#138A7B]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#25312F]">
                            {sched.medicine_name}
                          </h3>
                          <StatusBadge status="confirmed" confirmedBy="Doctor's slip" />
                        </div>
                        <p className="text-xs text-[#66736F] mt-0.5">
                          {sched.dosage} • {sched.meal_relation.replace('_', ' ').toLowerCase()} • {sched.frequency}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-semibold text-[#66736F]">Daily Times:</span>
                          {sched.times.map((tm, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#123F3A]">
                              {tm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      <button
                        onClick={() => openReminderModal(sched, sched.times[0] || '08:00')}
                        className="px-4 py-2.5 rounded-xl bg-[#123F3A] hover:bg-[#1A534C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#138A7B]" />
                        <span>Record Dose Event</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* CLEAN FRESH PLACEHOLDER WHEN EMPTY (NO MOCK DATA) */
              <div className="py-10 px-6 rounded-2xl bg-[#FAF8F3] border border-dashed border-[#CBD5E1] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#CBD5E1] mx-auto flex items-center justify-center text-[#94A3B8]">
                  <Pill className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#25312F]">
                    {isTamil ? 'செயலில் உள்ள மருந்துகள் எதுவும் இன்னும் இல்லை' : 'No active medication schedules yet'}
                  </h3>
                  <p className="text-xs text-[#66736F] max-w-md mx-auto leading-relaxed">
                    {isTamil
                      ? 'உங்கள் மருத்துவரின் சீட்டை ஸ்கேன் செய்யுங்கள் அல்லது மாதிரி சீட்டைப் பயன்படுத்திப் புதிய அட்டவணையைத் தொடங்குங்கள்.'
                      : 'Upload or scan your paper prescription to extract doctor-prescribed medicines, verify instructions, and configure confirmed daily reminders.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('scanner')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#138A7B] hover:bg-[#18A493] text-white text-xs font-semibold shadow-2xs transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isTamil ? 'சீட்டை ஸ்கேன் செய்க' : 'Scan a Prescription'}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Quick Context / Safety Standard Callout */}
          <section className="p-4 sm:p-5 rounded-2xl bg-[#E6F4EF]/60 border border-[#138A7B]/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#138A7B] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#123F3A]">
              <h4 className="font-bold">
                {isTamil ? 'முக்கிய பாதுகாப்புக் கொள்கை:' : 'Safety-First Healthcare Standard:'}
              </h4>
              <p className="leading-relaxed text-[#25312F]/90">
                {isTamil
                  ? 'கையெழுத்துச் சீட்டில் தெளிவற்ற விவரங்கள் இருந்தால், டோஸ்சாத்தி AI தானாக மருந்து அளவுகளையோ நேரங்களையோ உருவாக்காது. மருத்துவர் அல்லது மருந்தாளரின் வழிகாட்டல் அவசியம்.'
                  : 'DoseSaathi AI never creates active reminder schedules from unverified OCR readings. All ambiguous instructions must be confirmed by a human or doctor before reminders can be set.'}
              </p>
            </div>
          </section>
        </div>

        {/* Right Column (Span 1): Today's Adherence & Transparent Metrics */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl p-6 border border-[#E5E9E8] shadow-xs space-y-4">
            <div className="border-b border-[#F1EFE8] pb-3">
              <h2 className="text-base font-bold text-[#123F3A]">
                {t.home.activitySection.title}
              </h2>
              <p className="text-xs text-[#66736F]">
                {isTamil ? 'நேர்மையான நோயாளி சுய அறிக்கை' : 'Transparent patient self-report accounting'}
              </p>
            </div>

            {/* Three Transparent Metric Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-[#E6F4EF]/60 border border-[#138A7B]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#123F3A] block">
                    {t.home.activitySection.patientReported}
                  </span>
                  <span className="text-[11px] text-[#66736F]">Recorded taken</span>
                </div>
                <span className="text-xl font-bold text-[#123F3A]">{reportedTaken}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFF9EF] border border-[#D99026]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#9A5E0B] block">
                    {t.home.activitySection.skippedDoses}
                  </span>
                  <span className="text-[11px] text-[#66736F]">With recorded reasons</span>
                </div>
                <span className="text-xl font-bold text-[#D99026]">{recordedSkipped}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#CBD5E1] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#66736F] block">
                    {t.home.activitySection.unanswered}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">Pending response</span>
                </div>
                <span className="text-xl font-bold text-[#66736F]">{unconfirmedCount}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-[#66736F] leading-normal pt-1 border-t border-[#F1EFE8]">
              {t.home.activitySection.disclaimer}
            </p>

            <button
              onClick={() => navigateTo('reports')}
              className="w-full py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F8F7F2] text-xs font-semibold text-[#123F3A] transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[#138A7B]" />
              <span>{isTamil ? 'முழு மருத்துவ அறிக்கையைக் காண்க' : 'View Adherence Report'}</span>
            </button>
          </section>

          {/* Quick Doctor Consultation Card */}
          <section className="bg-gradient-to-br from-[#FAF8F3] to-[#F1EFE8] rounded-3xl p-5 border border-[#CBD5E1] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#123F3A]">
              <Stethoscope className="w-4 h-4 text-[#138A7B]" />
              <span>{isTamil ? 'மருத்துவ ஆலோசனைக்கு' : 'Doctor Consultation Ready'}</span>
            </div>
            <p className="text-xs text-[#66736F] leading-relaxed">
              {isTamil
                ? 'உங்கள் மருத்துவரிடம் பகிர்வதற்காக அதிகாரப்பூர்வ ReportLab PDF அறிக்கையை ஒரே கிளிக்கில் பதிவிறக்கம் செய்யலாம்.'
                : 'Generate a downloadable, doctor-ready adherence PDF summarizing your medication events and reasons for review during clinic visits.'}
            </p>
            <button
              onClick={() => navigateTo('reports')}
              className="text-xs font-bold text-[#138A7B] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{isTamil ? 'PDF அறிக்கை தயாரிக்க' : 'Generate Doctor Report PDF'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
