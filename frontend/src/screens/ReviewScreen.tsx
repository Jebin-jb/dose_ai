import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { ExtractedMedicine } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import {
  ArrowLeft,
  Edit2,
  Check,
  AlertTriangle,
  Save,
  Pill,
  ExternalLink,
  ShieldAlert,
  Info,
  ArrowRight,
  FileText
} from 'lucide-react';

export const ReviewScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    currentPrescription,
    setCurrentPrescription,
    setSelectedMedicineForExplainer,
    navigateTo
  } = useApp();

  const isTamil = language === 'ta';

  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ExtractedMedicine>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!currentPrescription) {
    return (
      <div className="max-w-xl mx-auto p-12 bg-white rounded-3xl border border-[#CBD5E1] text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] mx-auto flex items-center justify-center text-[#66736F]">
          <Pill className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#123F3A]">
          {isTamil ? 'சீட்டு எதுவும் இன்னும் பதிவேற்றப்படவில்லை' : 'No Prescription Loaded'}
        </h2>
        <p className="text-xs text-[#66736F] max-w-sm mx-auto">
          {isTamil
            ? 'மருத்துவ விவரங்களை ஆய்வு செய்ய முதலில் ஒரு மருத்துவர் சீட்டை ஸ்கேன் செய்யவும்.'
            : 'Please scan or upload a prescription slip first to review and verify extracted medications.'}
        </p>
        <button
          onClick={() => navigateTo('scanner')}
          className="px-5 py-2.5 rounded-xl bg-[#138A7B] text-white text-xs font-semibold"
        >
          {isTamil ? 'ஸ்கேனருக்குச் செல்ல' : 'Go to Prescription Scanner'}
        </button>
      </div>
    );
  }

  const { medicines } = currentPrescription;

  const startEdit = (med: ExtractedMedicine) => {
    setEditingMedId(med.id);
    setSelectedMedId(med.id);
    setEditFormData({
      medicine_name_raw: med.medicine_name_raw,
      strength_raw: med.strength_raw || '',
      dosage_raw: med.dosage_raw || '',
      frequency_raw: med.frequency_raw || '',
      duration_raw: med.duration_raw || '',
      instructions_raw: med.instructions_raw || ''
    });
  };

  const saveEdit = (medId: string) => {
    const updated = medicines.map((m) => {
      if (m.id === medId) {
        return {
          ...m,
          medicine_name_raw: editFormData.medicine_name_raw || m.medicine_name_raw,
          strength_raw: editFormData.strength_raw,
          dosage_raw: editFormData.dosage_raw,
          frequency_raw: editFormData.frequency_raw,
          duration_raw: editFormData.duration_raw,
          instructions_raw: editFormData.instructions_raw,
          status: 'needs_review' as const,
          clarification_reason: null,
          unreadable_fields: []
        };
      }
      return m;
    });

    setCurrentPrescription({
      ...currentPrescription,
      medicines: updated
    });
    setEditingMedId(null);

    fetch(`/api/prescriptions/${currentPrescription.id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescription_id: currentPrescription.id,
        reviewed_medicines: updated.map((m) => ({
          medicine_id: m.id,
          medicine_name: m.medicine_name_raw,
          strength: m.strength_raw,
          dosage: m.dosage_raw,
          frequency: m.frequency_raw,
          duration: m.duration_raw,
          instructions: m.instructions_raw,
          status: m.status,
          clarification_reason: m.clarification_reason,
          confirmed_by: m.confirmed_by || "Patient"
        }))
      })
    }).catch(() => {});
  };

  const markMedicineConfirmed = async (medId: string) => {
    const target = medicines.find((m) => m.id === medId);
    if (!target) return;

    if (target.status === 'needs_clarification' && target.unreadable_fields.length > 0) {
      setValidationError(`Please edit and clarify the ambiguous handwritten fields on ${target.medicine_name_raw} before confirming.`);
      return;
    }

    setValidationError(null);
    const updated = medicines.map((m) => {
      if (m.id === medId) {
        return {
          ...m,
          status: 'confirmed' as const,
          confirmed_by: 'Patient: Ramanathan',
          confirmed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_safe_to_schedule: true
        };
      }
      return m;
    });

    setCurrentPrescription({
      ...currentPrescription,
      medicines: updated
    });

    try {
      await fetch(`/api/prescriptions/${currentPrescription.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription_id: currentPrescription.id,
          reviewed_medicines: updated.map((m) => ({
            medicine_id: m.id,
            medicine_name: m.medicine_name_raw,
            strength: m.strength_raw,
            dosage: m.dosage_raw,
            frequency: m.frequency_raw,
            duration: m.duration_raw,
            instructions: m.instructions_raw,
            status: m.status,
            clarification_reason: m.clarification_reason,
            confirmed_by: m.confirmed_by || "Patient"
          }))
        })
      });
    } catch (e) {
      console.warn("Review save failed:", e);
    }
  };

  const handleProceedToExplainer = async () => {
    const hasAmbiguities = medicines.some((m) => m.status === 'needs_clarification');
    if (hasAmbiguities) {
      setValidationError(t.review.mustResolveWarning);
      return;
    }

    const hasConfirmed = medicines.some((m) => m.status === 'confirmed');
    if (!hasConfirmed) {
      setValidationError("Please confirm at least one verified medicine before proceeding.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const reviewPayload = {
        prescription_id: currentPrescription.id,
        reviewed_medicines: medicines.map((m) => ({
          medicine_id: m.id,
          medicine_name: m.medicine_name_raw,
          strength: m.strength_raw,
          dosage: m.dosage_raw,
          frequency: m.frequency_raw,
          duration: m.duration_raw,
          instructions: m.instructions_raw,
          status: m.status,
          clarification_reason: m.clarification_reason,
          confirmed_by: m.confirmed_by || "Patient"
        }))
      };

      await fetch(`/api/prescriptions/${currentPrescription.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload)
      });

      const firstConfirmed = medicines.find((m) => m.status === 'confirmed');
      if (firstConfirmed) {
        setSelectedMedicineForExplainer(firstConfirmed);
        navigateTo('explainer');
      }
    } catch (e) {
      console.error(e);
      setValidationError("Failed to save reviews. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmedCount = medicines.filter((m) => m.status === 'confirmed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#E5E9E8] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('scanner')}
            className="p-2 rounded-xl hover:bg-[#F8F7F2] text-[#25312F] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#123F3A]">
              {t.review.headline}
            </h1>
            <p className="text-xs text-[#66736F]">
              {t.review.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4EF] text-[#123F3A] border border-[#138A7B]/30">
            {confirmedCount} of {medicines.length} Confirmed
          </span>

          <button
            onClick={handleProceedToExplainer}
            disabled={isSubmitting || confirmedCount === 0}
            className="px-5 py-2.5 rounded-xl bg-[#138A7B] hover:bg-[#18A493] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isTamil ? 'அட்டவணைக்குச் செல்லுக' : 'Proceed to Schedule'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 bg-[#FFF9EF] border border-[#D99026] rounded-2xl text-xs text-[#9A5E0B] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D99026] shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2-COLUMN DESKTOP SPLIT VIEW: ORIGINAL SLIP (LEFT) VS EXTRACTED MEDICINES (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 of 12 columns on desktop): Original Prescription Document Viewer */}
        <div className="lg:col-span-5 lg:sticky lg:top-22 space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-[#E5E9E8] shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1EFE8] text-xs">
              <span className="font-bold text-[#123F3A] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#138A7B]" />
                {isTamil ? 'அசல் கையெழுத்துச் சீட்டு' : 'Source Prescription Slip'}
              </span>
              <span className="text-[11px] text-[#66736F]">
                {currentPrescription.patient_name || 'Ramanathan Iyer'}
              </span>
            </div>

            <BoundingBoxOverlay
              imageUrl={currentPrescription.image_url}
              medicines={medicines}
              selectedMedicineId={selectedMedId}
              onSelectMedicine={(id) => setSelectedMedId(id)}
            />

            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#CBD5E1]/60 text-[11px] text-[#66736F] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#138A7B] shrink-0 mt-0.5" />
              <p>
                {isTamil
                  ? 'சீட்டில் உள்ள மருந்து வரிகளை ஆய்வு செய்ய வண்ணப் பெட்டிகளை அழுத்தவும்.'
                  : 'Click on any bounded box on the document to cross-verify handwriting against digital extracted cards.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 of 12 columns): Extracted Medicines Cards & Field Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#66736F] px-1">
            <span>{isTamil ? 'பிரித்தெடுக்கப்பட்ட மருந்துகள்' : 'Extracted Medication Cards'}</span>
            <span>{medicines.length} Prescribed Items</span>
          </div>

          <div className="space-y-4">
            {medicines.map((med, index) => {
              const isEditing = editingMedId === med.id;
              const isSelected = selectedMedId === med.id;
              const isAmbiguous = med.status === 'needs_clarification';
              const isConfirmed = med.status === 'confirmed';

              return (
                <div
                  key={med.id}
                  onClick={() => setSelectedMedId(med.id)}
                  className={`bg-white rounded-3xl p-5 sm:p-6 transition-all border ${
                    isSelected
                      ? 'border-[#138A7B] shadow-sm ring-1 ring-[#138A7B]/20'
                      : 'border-[#CBD5E1] shadow-2xs hover:border-[#94A3B8]'
                  }`}
                >
                  {/* Card Header: Sequence number, Name, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1EFE8]">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#E6F4EF] text-[#123F3A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[#25312F]">
                          {med.medicine_name_raw}
                        </h3>
                        {med.standardized_name && (
                          <span className="text-xs font-semibold text-[#138A7B] block mt-0.5">
                            Catalog Match: {med.standardized_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <StatusBadge
                      status={med.status}
                      confirmedBy={med.confirmed_by}
                      confirmedAt={med.confirmed_at}
                    />
                  </div>

                  {/* Ambiguity Warning Banner (State B) */}
                  {isAmbiguous && med.clarification_reason && (
                    <div className="my-3 p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#D99026]/40 text-xs text-[#9A5E0B] flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#D99026] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">{med.clarification_reason}</p>
                        <p className="text-[11px] text-[#66736F]">{t.review.unclearWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* Field Details View or Edit Mode */}
                  {isEditing ? (
                    <div className="mt-4 pt-3 border-t border-[#F1EFE8] space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#66736F] mb-1">
                          {t.review.fields.medName}
                        </label>
                        <input
                          type="text"
                          value={editFormData.medicine_name_raw || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, medicine_name_raw: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#25312F] focus:outline-[#138A7B]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#66736F] mb-1">
                            {t.review.fields.strength}
                          </label>
                          <input
                            type="text"
                            value={editFormData.strength_raw || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, strength_raw: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-[#138A7B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#66736F] mb-1">
                            {t.review.fields.dosage}
                          </label>
                          <input
                            type="text"
                            value={editFormData.dosage_raw || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, dosage_raw: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-[#138A7B]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#66736F] mb-1">
                            {t.review.fields.frequency}
                          </label>
                          <input
                            type="text"
                            value={editFormData.frequency_raw || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, frequency_raw: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-[#138A7B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#66736F] mb-1">
                            {t.review.fields.instructions}
                          </label>
                          <input
                            type="text"
                            value={editFormData.instructions_raw || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, instructions_raw: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-[#138A7B]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingMedId(null)}
                          className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#66736F] font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(med.id)}
                          className="px-5 py-2 rounded-xl bg-[#123F3A] hover:bg-[#1A534C] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t.review.saveField}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#CBD5E1]/40">
                          <span className="text-[10px] text-[#66736F] block">{t.review.fields.strength}:</span>
                          <span className="font-bold text-[#25312F]">{med.strength_raw || '—'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#CBD5E1]/40">
                          <span className="text-[10px] text-[#66736F] block">{t.review.fields.dosage}:</span>
                          <span className="font-bold text-[#25312F]">{med.dosage_raw || '—'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#CBD5E1]/40">
                          <span className="text-[10px] text-[#66736F] block">{t.review.fields.frequency}:</span>
                          <span className="font-bold text-[#25312F]">{med.frequency_raw || '—'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#CBD5E1]/40">
                          <span className="text-[10px] text-[#66736F] block">{t.review.fields.instructions}:</span>
                          <span className="font-bold text-[#25312F]">{med.instructions_raw || '—'}</span>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#F8F7F2]">
                        <button
                          onClick={() => startEdit(med)}
                          className="text-xs text-[#138A7B] font-bold flex items-center gap-1 hover:underline"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t.review.editField}</span>
                        </button>

                        {!isConfirmed ? (
                          <button
                            onClick={() => markMedicineConfirmed(med.id)}
                            className="px-4 py-2 rounded-xl bg-[#123F3A] hover:bg-[#1A534C] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                          >
                            <Check className="w-3.5 h-3.5 text-[#138A7B]" />
                            <span>{t.review.markConfirmed}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMedicineForExplainer(med);
                              navigateTo('explainer');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#E6F4EF] hover:bg-[#D5EFE7] text-[#123F3A] text-xs font-bold flex items-center gap-1"
                          >
                            <span>Understand Medicine</span>
                            <ExternalLink className="w-3 h-3 text-[#138A7B]" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
