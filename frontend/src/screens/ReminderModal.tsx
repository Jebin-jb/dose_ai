import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import { Pill, Check, X, HelpCircle, BellRing, ChevronDown, AlertCircle } from 'lucide-react';
import { SkippedReason } from '../types';

export const ReminderModal: React.FC = () => {
  const { t } = useLanguage();
  const { speak } = useAccessibility();
  const { activeReminderModal, closeReminderModal, recordAdherence } = useApp();

  const [showSkipReasons, setShowSkipReasons] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<SkippedReason>('forgot');
  const [customNote, setCustomNote] = useState<string>('');
  const [recordedFeedback, setRecordedFeedback] = useState<string | null>(null);

  if (!activeReminderModal) return null;

  const { schedule, scheduledTime } = activeReminderModal;

  const handleTookIt = async () => {
    speak(t.reminder.recordedSuccess);
    await recordAdherence(
      schedule.id,
      schedule.medicine_name,
      scheduledTime,
      'patient_reported_taken'
    );
    setRecordedFeedback(t.reminder.recordedSuccess);
    setTimeout(() => {
      setRecordedFeedback(null);
      closeReminderModal();
    }, 1200);
  };

  const handleConfirmSkip = async () => {
    speak("Skipped dose noted");
    await recordAdherence(
      schedule.id,
      schedule.medicine_name,
      scheduledTime,
      'patient_reported_skipped',
      selectedReason,
      customNote
    );
    setRecordedFeedback("Skipped dose recorded honestly.");
    setTimeout(() => {
      setRecordedFeedback(null);
      closeReminderModal();
    }, 1200);
  };

  const handleNotSure = async () => {
    await recordAdherence(
      schedule.id,
      schedule.medicine_name,
      scheduledTime,
      'not_sure'
    );
    closeReminderModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 sm:items-center">
      <div className="w-full max-w-[370px] bg-white rounded-[28px] p-5 shadow-2xl border border-[#CBD5E1] space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header with pill icon and scheduled time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#E6F4EF] flex items-center justify-center text-[#123F3A]">
              <Pill className="w-5 h-5 text-[#138A7B]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#66736F] uppercase tracking-wider block">
                {t.reminder.title}
              </span>
              <span className="text-xs font-bold text-[#123F3A]">
                {t.reminder.scheduledFor} {scheduledTime}
              </span>
            </div>
          </div>

          <button
            onClick={closeReminderModal}
            className="p-1 rounded-full text-[#66736F] hover:bg-[#F8F7F2]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medicine Details */}
        <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#E5E9E8] space-y-1">
          <h3 className="text-lg font-bold text-[#25312F]">
            {schedule.medicine_name}
          </h3>
          <p className="text-xs text-[#66736F]">
            {schedule.dosage} • {schedule.meal_relation.replace('_', ' ').toLowerCase()}
          </p>
        </div>

        {/* Feedback Banner if just recorded */}
        {recordedFeedback && (
          <div className="p-3 rounded-xl bg-[#E6F4EF] text-[#123F3A] text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#138A7B]" />
            <span>{recordedFeedback}</span>
          </div>
        )}

        {/* Skipped Reason Dropdown / Picker */}
        {showSkipReasons ? (
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] space-y-2.5">
            <label className="text-xs font-bold text-[#123F3A] block">
              {t.reminder.skipReasonPrompt}
            </label>
            <div className="space-y-1.5 text-xs">
              {(
                [
                  ['forgot', t.reminder.reasons.forgot],
                  ['ran_out', t.reminder.reasons.ran_out],
                  ['unclear_instructions', t.reminder.reasons.unclear_instructions],
                  ['side_effect_issue', t.reminder.reasons.side_effect_issue],
                  ['other', t.reminder.reasons.other]
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSelectedReason(val as SkippedReason)}
                  className={`w-full text-left p-2 rounded-xl border text-xs font-medium transition-all ${
                    selectedReason === val
                      ? 'bg-[#123F3A] text-white border-[#123F3A]'
                      : 'bg-white text-[#25312F] border-[#CBD5E1]/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowSkipReasons(false)}
                className="flex-1 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#66736F]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 py-2 rounded-xl bg-[#D99026] text-white text-xs font-semibold"
              >
                Save Record
              </button>
            </div>
          </div>
        ) : (
          /* Three Large Clearly Differentiated Actions (44-48px touch targets) */
          <div className="space-y-2.5">
            {/* 1. I Took It */}
            <button
              onClick={handleTookIt}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-[#138A7B] hover:bg-[#18A493] text-white font-semibold text-sm shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{t.reminder.actionTook}</span>
            </button>

            {/* 2. I Skipped It */}
            <button
              onClick={() => setShowSkipReasons(true)}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#F8F7F2] hover:bg-[#EAE8DF] text-[#66736F] hover:text-[#25312F] border border-[#CBD5E1] font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4 text-[#B94F45]" />
              <span>{t.reminder.actionSkipped}</span>
            </button>

            {/* 3. Not Sure */}
            <button
              onClick={handleNotSure}
              className="w-full py-2 text-xs text-[#66736F] hover:underline flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.reminder.actionNotSure}</span>
            </button>
          </div>
        )}

        {/* Responsible Non-shaming Medical Guidance */}
        <p className="text-[10px] text-[#66736F] text-center leading-normal pt-1 border-t border-[#F1EFE8]">
          {t.reminder.neutralMissedNote}
        </p>
      </div>
    </div>
  );
};

