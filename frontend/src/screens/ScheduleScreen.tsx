import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Clock, Plus, Trash2, Calendar, ShieldCheck, Check, Pill, AlertCircle } from 'lucide-react';

export const ScheduleScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    selectedMedicineForExplainer,
    currentPrescription,
    refreshSchedules,
    refreshAdherenceEvents,
    navigateTo
  } = useApp();

  const isTamil = language === 'ta';
  const med = selectedMedicineForExplainer;

  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00', '20:00']);
  const [mealRelation, setMealRelation] = useState<'before_meal' | 'after_meal' | 'with_meal' | 'none'>('after_meal');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!med) {
    return (
      <div className="max-w-xl mx-auto p-12 bg-white rounded-3xl border border-[#CBD5E1] text-center space-y-4">
        <Pill className="w-10 h-10 text-[#66736F] mx-auto" />
        <h2 className="text-base font-bold text-[#123F3A]">No Medicine Selected for Scheduling</h2>
        <button
          onClick={() => navigateTo('review')}
          className="px-5 py-2.5 rounded-xl bg-[#138A7B] text-white text-xs font-semibold"
        >
          Return to Prescription Review
        </button>
      </div>
    );
  }

  const addTimeSlot = () => {
    if (reminderTimes.length < 5) {
      setReminderTimes([...reminderTimes, '14:00']);
    }
  };

  const removeTimeSlot = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index: number, val: string) => {
    const updated = [...reminderTimes];
    updated[index] = val;
    setReminderTimes(updated);
  };

  const handleActivateSchedule = async () => {
    if (med.status !== 'confirmed') {
      setErrorMessage("Safety Violation: Unconfirmed medicine cannot be scheduled.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        prescription_id: currentPrescription?.id || null,
        medicine_id: med.id,
        medicine_name: med.standardized_name || med.medicine_name_raw,
        dosage: med.dosage_raw || '1 dose',
        frequency: med.frequency_raw || `${reminderTimes.length} times daily`,
        times: reminderTimes,
        meal_relation: mealRelation,
        start_date: startDate
      };

      const res = await fetch('/api/medication-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to activate schedule");
      }

      await refreshSchedules();
      await refreshAdherenceEvents();
      navigateTo('home');
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to save schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('explainer')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#66736F] hover:text-[#123F3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Medicine Explainer</span>
        </button>

        <h1 className="text-lg font-bold text-[#123F3A]">
          {t.schedule.headline}
        </h1>

        <button
          onClick={() => navigateTo('review')}
          className="text-xs font-semibold text-[#138A7B] hover:underline"
        >
          Review Slip
        </button>
      </div>

      {/* Confirmed Medicine Context Summary Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E8] shadow-xs space-y-6">
        <div className="p-4 rounded-2xl bg-[#E6F4EF]/60 border border-[#138A7B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#138A7B] flex items-center justify-center font-bold shadow-2xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#138A7B] uppercase tracking-wider block">
                Confirmed Instruction Ready to Schedule
              </span>
              <h2 className="text-lg font-bold text-[#123F3A]">
                {med.medicine_name_raw}
              </h2>
            </div>
          </div>

          <div className="text-xs text-[#25312F] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#CBD5E1]/60 self-start sm:self-center">
            {med.dosage_raw || '1 dose'} • {med.instructions_raw || 'Follow prescription'}
          </div>
        </div>

        {/* Daily Times Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#123F3A] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#138A7B]" />
              <span>{t.schedule.timeSectionTitle}</span>
            </label>

            {reminderTimes.length < 5 && (
              <button
                onClick={addTimeSlot}
                className="text-xs font-bold text-[#138A7B] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Time Slot</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reminderTimes.map((time, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/70 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#123F3A] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#25312F]">
                    Dose {idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(idx, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#25312F] focus:outline-[#138A7B]"
                  />
                  {reminderTimes.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(idx)}
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-[#B94F45]"
                      aria-label="Remove time"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Relation Selector */}
        <div className="space-y-3 pt-2 border-t border-[#F1EFE8]">
          <label className="text-xs font-bold text-[#123F3A] uppercase tracking-wider block">
            {t.schedule.mealTiming}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'after_meal', label: t.schedule.afterMeal },
              { id: 'before_meal', label: t.schedule.beforeMeal },
              { id: 'with_meal', label: t.schedule.withMeal },
              { id: 'none', label: t.schedule.none }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMealRelation(opt.id as any)}
                className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                  mealRelation === opt.id
                    ? 'bg-[#123F3A] text-white border-[#123F3A] shadow-2xs'
                    : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1]/60 hover:border-[#138A7B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#CBD5E1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#25312F]">
            <Calendar className="w-4 h-4 text-[#138A7B]" />
            <span>{t.schedule.startDate}</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#25312F]"
          />
        </div>

        {/* Safety Standard Notice */}
        <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1]/70 text-xs text-[#66736F] leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#123F3A]">
            <ShieldCheck className="w-4 h-4 text-[#138A7B]" />
            <span>Clinical Verification Standard</span>
          </div>
          <p>{t.schedule.safetyNotice}</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#B94F45] text-xs text-[#991B1B] rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Confirmation CTA */}
        <div className="pt-2">
          <button
            onClick={handleActivateSchedule}
            disabled={isSubmitting}
            className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-[#138A7B] hover:bg-[#18A493] text-white font-bold text-sm shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{t.schedule.confirmScheduleCTA}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
