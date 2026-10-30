import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Pill, Trash2, Camera, ExternalLink, Calendar, Clock, Plus } from 'lucide-react';
import { MedicationSchedule, ExtractedMedicine } from '../types';

export const MyMedicinesScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    schedules,
    currentPrescription,
    navigateTo,
    setSelectedMedicineForExplainer,
    refreshSchedules
  } = useApp();

  const isTamil = language === 'ta';
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'discontinued'>('active');

  const activeSchedules = schedules.filter((s) => s.is_active);
  const discontinuedSchedules = schedules.filter((s) => !s.is_active);
  const pendingMedicines = currentPrescription
    ? currentPrescription.medicines.filter((m) => m.status !== 'confirmed')
    : [];

  const handleDiscontinue = async (id: string) => {
    try {
      await fetch(`/api/medication-schedules/${id}`, { method: 'DELETE' });
      await refreshSchedules();
    } catch (e) {
      console.warn("Failed to discontinue schedule:", e);
    }
  };

  const openExplainerForSchedule = (sched: MedicationSchedule) => {
    const stub: ExtractedMedicine = {
      id: sched.medicine_id,
      medicine_name_raw: sched.medicine_name,
      standardized_name: sched.medicine_name,
      dosage_raw: sched.dosage,
      frequency_raw: sched.frequency,
      instructions_raw: sched.meal_relation.replace('_', ' '),
      status: 'confirmed',
      unreadable_fields: [],
      is_safe_to_schedule: true
    };
    setSelectedMedicineForExplainer(stub);
    navigateTo('explainer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E9E8] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#123F3A]">
            {t.myMedicines.title}
          </h1>
          <p className="text-xs text-[#66736F]">
            {activeSchedules.length} confirmed medications currently active in your care routine
          </p>
        </div>

        <button
          onClick={() => navigateTo('scanner')}
          className="px-5 py-2.5 rounded-xl bg-[#138A7B] hover:bg-[#18A493] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Camera className="w-4 h-4" />
          <span>{isTamil ? 'புதிய சீட்டை ஸ்கேன் செய்க' : 'Scan New Prescription'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#CBD5E1] flex flex-wrap sm:inline-flex text-xs font-bold shadow-2xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.myMedicines.tabs.active} ({activeSchedules.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.myMedicines.tabs.pending} ({pendingMedicines.length})
        </button>
        <button
          onClick={() => setActiveTab('discontinued')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'discontinued'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.myMedicines.tabs.discontinued} ({discontinuedSchedules.length})
        </button>
      </div>

      {/* Content Grid */}
      <div>
        {activeTab === 'active' && (
          <>
            {activeSchedules.length === 0 ? (
              <div className="py-14 px-6 bg-white rounded-3xl border border-[#CBD5E1] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] border border-[#CBD5E1] mx-auto flex items-center justify-center text-[#94A3B8]">
                  <Pill className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-[#25312F]">
                  {isTamil ? 'செயலில் உள்ள மருந்துகள் எதுவும் இல்லை' : 'No active medications tracked yet'}
                </h3>
                <p className="text-xs text-[#66736F] max-w-sm mx-auto leading-relaxed">
                  {isTamil
                    ? 'மருந்துகளைச் சேர்க்க உங்கள் மருத்துவர் சீட்டை ஸ்கேன் செய்யுங்கள் அல்லது மாதிரி சீட்டைப் பயன்படுத்தவும்.'
                    : 'Scan your paper prescription to extract confirmed medicines, view plain-language guides, and set daily reminders.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('scanner')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A7B] text-white text-xs font-bold"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.myMedicines.scanNew}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeSchedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-2xs hover:border-[#138A7B] transition-colors flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#E6F4EF] text-[#138A7B] flex items-center justify-center font-bold shrink-0">
                          <Pill className="w-5 h-5" />
                        </div>
                        <StatusBadge status="confirmed" confirmedBy="Doctor's slip" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#25312F]">
                          {sched.medicine_name}
                        </h3>
                        <p className="text-xs text-[#66736F] mt-0.5">
                          {sched.dosage} • {sched.meal_relation.replace('_', ' ').toLowerCase()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-semibold text-[#66736F] mr-1">Times:</span>
                        {sched.times.map((tm, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-[#FAF8F3] border border-[#CBD5E1] text-[11px] font-bold text-[#123F3A]"
                          >
                            {tm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F1EFE8] flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => openExplainerForSchedule(sched)}
                        className="text-[#138A7B] hover:underline flex items-center gap-1"
                      >
                        <span>Understand</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDiscontinue(sched.id)}
                        className="text-[#B94F45] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Discontinue</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingMedicines.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border border-[#CBD5E1] text-center text-xs text-[#66736F]">
                No pending medications requiring review.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMedicines.map((m) => (
                  <div key={m.id} className="p-5 bg-white rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#25312F]">{m.medicine_name_raw}</h3>
                        <p className="text-xs text-[#66736F]">{m.frequency_raw || 'Timing unconfirmed'}</p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                    <button
                      onClick={() => navigateTo('review')}
                      className="w-full py-2 rounded-xl bg-[#123F3A] text-white text-xs font-bold"
                    >
                      Review on Prescription Slip
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discontinued' && (
          <div className="space-y-3">
            {discontinuedSchedules.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border border-[#CBD5E1] text-center text-xs text-[#66736F]">
                No discontinued medications recorded.
              </div>
            ) : (
              discontinuedSchedules.map((sched) => (
                <div key={sched.id} className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-[#25312F] line-through">{sched.medicine_name}</h3>
                    <p className="text-[#66736F] text-[11px]">Discontinued • Previous dosage: {sched.dosage}</p>
                  </div>
                  <span className="text-[11px] text-[#66736F] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-[#CBD5E1]">
                    Inactive
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
