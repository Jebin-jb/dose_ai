import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MedicineInfo } from '../types';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Pill,
  ShieldCheck,
  Info,
  Calendar
} from 'lucide-react';

export const ExplainerScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedMedicineForExplainer, navigateTo } = useApp();
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);

  useEffect(() => {
    if (!selectedMedicineForExplainer) return;

    const query = selectedMedicineForExplainer.standardized_name || selectedMedicineForExplainer.medicine_name_raw;
    fetch(`/api/medicines/info/${encodeURIComponent(query)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setMedicineInfo(data);
      })
      .catch(() => {});
  }, [selectedMedicineForExplainer]);

  if (!selectedMedicineForExplainer) {
    return (
      <div className="max-w-xl mx-auto p-12 bg-white rounded-3xl border border-[#CBD5E1] text-center space-y-4">
        <Pill className="w-10 h-10 text-[#66736F] mx-auto" />
        <h2 className="text-base font-bold text-[#123F3A]">No Medicine Selected</h2>
        <button
          onClick={() => navigateTo('review')}
          className="px-5 py-2.5 rounded-xl bg-[#138A7B] text-white text-xs font-semibold"
        >
          Return to Review
        </button>
      </div>
    );
  }

  const med = selectedMedicineForExplainer;
  const isTamil = language === 'ta';
  const explanation = medicineInfo
    ? isTamil
      ? medicineInfo.plain_language_summary_ta
      : medicineInfo.plain_language_summary_en
    : "Verified explanation loading from CDSCO / Jan Aushadhi database...";

  const guidance = medicineInfo
    ? isTamil
      ? medicineInfo.general_guidance_ta
      : medicineInfo.general_guidance_en
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('review')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#66736F] hover:text-[#123F3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Prescription Review</span>
        </button>

        <h1 className="text-lg font-bold text-[#123F3A]">
          {t.explainer.headline}
        </h1>

        <button
          onClick={() => navigateTo('schedule')}
          className="text-xs font-bold text-[#138A7B] hover:underline flex items-center gap-1"
        >
          <span>Schedule Directly</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Medicine Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E9E8] shadow-xs space-y-6">
        {/* Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#F1EFE8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#138A7B] uppercase tracking-wider bg-[#E6F4EF] px-2.5 py-0.5 rounded-full">
                Verified Medication
              </span>
              <span className="text-[11px] font-semibold text-[#123F3A] bg-[#FAF8F3] border border-[#CBD5E1] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[#138A7B]" />
                Confirmed by Patient
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25312F] mt-2">
              {med.medicine_name_raw}
            </h2>

            {medicineInfo?.generic_name && (
              <p className="text-sm font-semibold text-[#66736F] mt-1">
                Standard Generic Formulation: <span className="text-[#25312F]">{medicineInfo.generic_name}</span>
              </p>
            )}
          </div>

          {medicineInfo?.therapeutic_class && (
            <div className="px-4 py-2 rounded-2xl bg-[#F8F7F2] border border-[#CBD5E1]/60 text-xs text-[#25312F] font-semibold self-start sm:self-center">
              Category: {medicineInfo.therapeutic_class}
            </div>
          )}
        </div>

        {/* 2-Column Section: What Does It Do (Left) & Confirmed Prescription Instructions (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Plain-Language Explanation */}
          <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#123F3A] uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#138A7B]" />
              <span>{t.explainer.whatDoesItDo}</span>
            </div>

            <p className="text-sm sm:text-base text-[#25312F] leading-relaxed font-medium">
              {explanation}
            </p>

            {guidance && (
              <div className="mt-3 p-3 rounded-xl bg-white border border-[#CBD5E1]/70 text-xs text-[#123F3A] space-y-1">
                <span className="font-bold block text-[11px] text-[#138A7B]">General Administration Guidance:</span>
                <p className="text-[#25312F]">{guidance}</p>
              </div>
            )}
          </div>

          {/* Right Column: Confirmed Doctor's Instructions */}
          <div className="p-6 rounded-2xl bg-[#E6F4EF]/50 border border-[#138A7B]/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#123F3A] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#138A7B]" />
              <span>{t.explainer.confirmedInstructions}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#138A7B]/20">
                <span className="text-[10px] text-[#66736F] block font-semibold">Strength & Amount</span>
                <span className="text-sm font-bold text-[#25312F]">{med.strength_raw || 'Standard'} • {med.dosage_raw || '1 dose'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#138A7B]/20">
                <span className="text-[10px] text-[#66736F] block font-semibold">Prescribed Frequency</span>
                <span className="text-sm font-bold text-[#25312F]">{med.frequency_raw || 'As instructed'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#138A7B]/20 col-span-2">
                <span className="text-[10px] text-[#66736F] block font-semibold">Meal Relation Instruction</span>
                <span className="text-sm font-bold text-[#25312F]">{med.instructions_raw || 'Follow prescription slip'}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#123F3A]/80 leading-relaxed italic">
              * Confirmed directly from doctor's slip. DoseSaathi does not alter prescribed frequency.
            </p>
          </div>
        </div>

        {/* Source Attribution & Clinical Notice */}
        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#CBD5E1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-[#123F3A]">
              <span>{t.explainer.sourceAttribution}:</span>
              <a
                href={medicineInfo?.source_url || 'https://cdsco.gov.in'}
                target="_blank"
                rel="noreferrer"
                className="text-[#138A7B] hover:underline flex items-center gap-1"
              >
                {medicineInfo?.source_name || 'Central Drugs Standard Control Organisation (CDSCO)'}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-[#66736F]">
              {t.explainer.consultDoctorNote}
            </p>
          </div>

          <button
            onClick={() => navigateTo('schedule')}
            className="px-6 py-3 rounded-xl bg-[#138A7B] hover:bg-[#18A493] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
          >
            <span>{t.explainer.continueToSchedule}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
