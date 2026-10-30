import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import {
  User,
  Globe,
  Type,
  Volume2,
  Users,
  ShieldCheck,
  Trash2,
  Key,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { textSize, setTextSize, voiceAssisted, setVoiceAssisted } = useAccessibility();
  const { refreshSchedules, refreshAdherenceEvents, setCurrentPrescription } = useApp();

  const [caregiverPerm, setCaregiverPerm] = useState<'view_only' | 'view_and_record'>('view_and_record');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiConfig, setApiConfig] = useState<{ is_configured: boolean; model: string; masked_key: string }>({
    is_configured: false,
    model: 'gemini-3.8-flash',
    masked_key: ''
  });
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  const fetchApiConfig = async () => {
    try {
      const res = await fetch('/api/config/api-key');
      if (res.ok) {
        const data = await res.json();
        setApiConfig(data);
      }
    } catch (e) {
      console.warn("Failed to fetch API key config:", e);
    }
  };

  useEffect(() => {
    fetchApiConfig();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsSavingKey(true);
    try {
      const res = await fetch('/api/config/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKeyInput.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setApiConfig({
          is_configured: data.is_configured,
          model: data.model,
          masked_key: data.masked_key
        });
        setApiKeyInput('');
        setKeySaveMessage(language === 'ta' ? 'API சாவி வெற்றிகரமாக புதுப்பிக்கப்பட்டது' : 'Gemini API key updated successfully');
        setTimeout(() => setKeySaveMessage(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      const res = await fetch('/api/data/reset', { method: 'DELETE' });
      if (res.ok) {
        setCurrentPrescription(null);
        await refreshSchedules();
        await refreshAdherenceEvents();
        setShowDeleteConfirm(false);
        setStatusMessage(t.profile.dataDeletedMsg);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.warn("Failed to reset data:", e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#123F3A] text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5 text-[#138A7B]" />
          <span>{language === 'ta' ? 'அமைப்புகள் & விருப்பங்கள்' : 'System Preferences & Settings'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123F3A]">
          {t.profile.title}
        </h1>
        <p className="text-sm text-[#66736F] mt-1 max-w-2xl">
          {language === 'ta' ? 'மருந்து பார்வை, மொழி, பார்வை வசதி மற்றும் API உள்ளமைவு அமைப்புகள்.' : 'Manage language, accessibility scaling, caregiver permissions, and AI vision model configuration.'}
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-[#E6F4EF] border border-[#138A7B] text-[#123F3A] text-sm font-semibold rounded-2xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#138A7B]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grid of Main Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. AI Vision Model & API Key Management */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E6F4EF] flex items-center justify-center text-[#138A7B]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#123F3A]">
                  AI Vision Engine Configuration
                </h2>
                <p className="text-xs text-[#66736F]">
                  Google Gemini 3.8 Flash Multimodal OCR
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              apiConfig.is_configured
                ? 'bg-[#E6F4EF] text-[#123F3A]'
                : 'bg-[#FFF9EF] text-[#D99026]'
            }`}>
              {apiConfig.is_configured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#138A7B]" />
                  <span>Configured</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D99026]" />
                  <span>Key Needed</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] text-xs text-[#66736F] space-y-1.5 leading-relaxed">
            <p>
              <strong className="text-[#25312F]">Active Engine:</strong> {apiConfig.model}
            </p>
            {apiConfig.masked_key && (
              <p>
                <strong className="text-[#25312F]">Key Status:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1]">{apiConfig.masked_key}</code>
              </p>
            )}
            <p className="text-[11px] text-[#66736F] pt-1">
              {language === 'ta'
                ? 'மருத்துவச் சீட்டு படங்களை ஆய்வு செய்ய கூகிள் ஜெமினி API சாவி பயன்படுத்தப்படுகிறது.'
                : 'Get a free Gemini API key from Google AI Studio at aistudio.google.com and enter it below to activate live handwritten prescription reading.'}
            </p>
          </div>

          <form onSubmit={handleSaveApiKey} className="space-y-3">
            <div>
              <label htmlFor="apiKeyInput" className="block text-xs font-bold text-[#123F3A] mb-1">
                {language === 'ta' ? 'API சாவி உள்ளீடு' : 'Update Gemini API Key'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#66736F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="apiKeyInput"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy... (leave blank to keep current)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#CBD5E1] bg-white text-xs text-[#25312F] focus:outline-none focus:border-[#138A7B] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#66736F]">
                Stored securely in memory / environment
              </span>
              <button
                type="submit"
                disabled={isSavingKey || !apiKeyInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#138A7B] text-white hover:bg-[#18A493] text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSavingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Key</span>
              </button>
            </div>
          </form>

          {keySaveMessage && (
            <div className="p-3 bg-[#E6F4EF] border border-[#138A7B] text-[#123F3A] text-xs font-medium rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-[#138A7B]" />
              <span>{keySaveMessage}</span>
            </div>
          )}
        </section>

        {/* 2. Language & Localization */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF8F3] flex items-center justify-center text-[#123F3A]">
              <Globe className="w-5 h-5 text-[#138A7B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123F3A]">
                {t.profile.languageSection}
              </h2>
              <p className="text-xs text-[#66736F]">
                Dual-language interface with verified Tamil translations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                language === 'en'
                  ? 'bg-[#123F3A] text-white border-[#123F3A] shadow-xs'
                  : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1] hover:border-[#138A7B]'
              }`}
            >
              <span className="block text-sm font-bold">English</span>
              <span className="text-[11px] opacity-80 mt-0.5 block">Standard clinical terminology</span>
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`p-4 rounded-2xl border text-left font-tamil transition-all ${
                language === 'ta'
                  ? 'bg-[#123F3A] text-white border-[#123F3A] shadow-xs'
                  : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1] hover:border-[#138A7B]'
              }`}
            >
              <span className="block text-sm font-bold">தமிழ் (Tamil)</span>
              <span className="text-[11px] opacity-80 mt-0.5 block">மருத்துவ விளக்கம் & அட்டவணை</span>
            </button>
          </div>
        </section>

        {/* 3. Accessibility & Font Scaling */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E6F4EF] flex items-center justify-center text-[#138A7B]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123F3A]">
                {t.profile.textSizeSection}
              </h2>
              <p className="text-xs text-[#66736F]">
                Senior-friendly typography sizing without layout breakage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { id: 'normal', label: t.profile.sizes.normal, desc: '100% Base' },
              { id: 'large', label: t.profile.sizes.large, desc: '115% Comfortable' },
              { id: 'xl', label: t.profile.sizes.xl, desc: '130% Maximum' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTextSize(item.id as any)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  textSize === item.id
                    ? 'bg-[#123F3A] text-white border-[#123F3A] shadow-xs'
                    : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1] hover:border-[#138A7B]'
                }`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="text-[10px] opacity-80 block mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>

          {/* Voice Assistance Sub-row */}
          <div className="pt-4 border-t border-[#F8F7F2] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#138A7B]" />
              <div>
                <span className="text-xs font-bold text-[#123F3A] block">{t.profile.voiceSection}</span>
                <span className="text-[11px] text-[#66736F]">{t.profile.voiceDesc}</span>
              </div>
            </div>

            <button
              onClick={() => setVoiceAssisted(!voiceAssisted)}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
                voiceAssisted ? 'bg-[#138A7B]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform ${
                  voiceAssisted ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 4. Caregiver Support & Permissions */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF8F3] flex items-center justify-center text-[#123F3A]">
              <Users className="w-5 h-5 text-[#138A7B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123F3A]">
                {t.profile.caregiverSection}
              </h2>
              <p className="text-xs text-[#66736F]">
                {t.profile.caregiverDesc}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-[#123F3A] block">
              {t.profile.caregiverPermissions}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCaregiverPerm('view_only')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  caregiverPerm === 'view_only'
                    ? 'bg-[#123F3A] text-white border-[#123F3A]'
                    : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1]'
                }`}
              >
                <span className="block text-xs font-bold">{t.profile.permView}</span>
                <span className="text-[10px] opacity-80 block mt-0.5">Read-only timeline & reports</span>
              </button>
              <button
                onClick={() => setCaregiverPerm('view_and_record')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  caregiverPerm === 'view_and_record'
                    ? 'bg-[#123F3A] text-white border-[#123F3A]'
                    : 'bg-[#F8F7F2] text-[#25312F] border-[#CBD5E1]'
                }`}
              >
                <span className="block text-xs font-bold">{t.profile.permRecord}</span>
                <span className="text-[10px] opacity-80 block mt-0.5">Can confirm doses for patient</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 5. Privacy, Local Storage & Reset Data */}
      <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#E6F4EF] flex items-center justify-center text-[#123F3A]">
            <ShieldCheck className="w-5 h-5 text-[#138A7B]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#123F3A]">
              {t.profile.privacySection}
            </h2>
            <p className="text-xs text-[#66736F]">
              Patient data governance & on-device storage policy
            </p>
          </div>
        </div>

        <p className="text-xs text-[#66736F] leading-relaxed max-w-3xl">
          {t.profile.privacyDesc}
        </p>

        <div className="pt-2">
          {showDeleteConfirm ? (
            <div className="p-4 bg-[#FDF2F2] border border-[#B94F45] rounded-2xl text-xs space-y-3 max-w-xl">
              <div className="flex items-center gap-2 text-[#991B1B] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.profile.deleteConfirm}</span>
              </div>
              <p className="text-[#991B1B]/80 text-[11px]">
                This action immediately wipes all prescriptions, medicines, schedules, and adherence logs from the local database.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#66736F] font-semibold bg-white hover:bg-[#F8F7F2]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="px-4 py-2 rounded-xl bg-[#B94F45] hover:bg-[#A33D34] text-white font-semibold transition-all cursor-pointer"
                >
                  Yes, Reset All Data
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-2.5 px-4 rounded-xl border border-[#B94F45]/30 text-[#B94F45] hover:bg-[#FDF2F2] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.profile.deleteDataBtn}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
