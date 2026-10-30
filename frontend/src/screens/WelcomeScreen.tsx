import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { ShieldCheck, Volume2, Type, ArrowRight, Check, Sparkles } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { textSize, setTextSize, voiceAssisted, setVoiceAssisted, speak } = useAccessibility();
  const { navigateTo } = useApp();

  const handleStart = () => {
    speak(language === 'ta' ? "டோஸ்சாத்திக்கு வரவேற்கிறோம்" : "Welcome to DoseSaathi");
    navigateTo('home');
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-8 sm:py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-[#CBD5E1] shadow-2xs p-6 sm:p-10 space-y-8">
        {/* Brand Anchor */}
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>

        {/* Hero Vector Illustration: Paper Prescription transforming to Confirmed Digital Card */}
        <div className="py-2 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] h-[190px] flex items-center justify-center">
            {/* Handwritten Doctor Script Slip (Left Background) */}
            <div className="absolute left-2 w-36 h-44 bg-[#FAF8F3] border border-[#CBD5E1] rounded-2xl shadow-sm rotate-[-6deg] p-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-1.5 bg-[#CBD5E1] rounded mb-2" />
                <div className="text-[11px] font-serif font-bold text-[#123F3A]">Rx Clinic</div>
                <div className="w-full h-1 bg-[#CBD5E1] rounded my-1.5" />
                <div className="w-4/5 h-1 bg-[#CBD5E1] rounded my-1.5" />
                <div className="w-2/3 h-1 bg-[#CBD5E1] rounded my-1.5" />
              </div>
              <div className="w-12 h-1 bg-[#CBD5E1] rounded self-end" />
            </div>

            {/* Smooth Transformation Arrow Path */}
            <div className="z-10 bg-[#123F3A] text-white p-3 rounded-full shadow-md">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Clean Digital Medicine Card (Right Foreground) */}
            <div className="absolute right-2 w-44 h-48 bg-white border border-[#138A7B]/40 rounded-2xl shadow-md rotate-[4deg] p-3.5 flex flex-col justify-between z-10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#123F3A] uppercase tracking-wider">
                    Confirmed
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#E6F4EF] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#138A7B] stroke-[3]" />
                  </span>
                </div>
                <div className="text-xs font-bold text-[#25312F] leading-tight">
                  Glycomet 500mg
                </div>
                <div className="text-[10px] text-[#66736F] mt-0.5">
                  Metformin HCl
                </div>
                <div className="mt-2.5 p-1.5 bg-[#E6F4EF] rounded-lg text-[10px] text-[#123F3A] font-medium">
                  1 tablet • Twice daily (PC)
                </div>
              </div>
              <div className="text-[10px] text-[#138A7B] font-semibold">
                Next: 08:00 AM
              </div>
            </div>
          </div>

          {/* Headline & Supporting Copy */}
          <div className="text-center mt-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123F3A] tracking-tight leading-snug">
              {t.onboarding.headline}
            </h1>
            <p className="text-sm text-[#66736F] max-w-md mx-auto leading-relaxed">
              {t.onboarding.subtext}
            </p>
          </div>
        </div>

        {/* Language & Accessibility Customizer */}
        <div className="space-y-4 pt-2 border-t border-[#F1EFE8]">
          {/* Language Selector */}
          <div className="bg-[#F8F7F2] p-1 rounded-2xl border border-[#CBD5E1] flex gap-1">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#123F3A] text-white shadow-xs'
                  : 'text-[#66736F] hover:text-[#25312F]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl font-tamil transition-all cursor-pointer ${
                language === 'ta'
                  ? 'bg-[#123F3A] text-white shadow-xs'
                  : 'text-[#66736F] hover:text-[#25312F]'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          {/* Optional Accessibility Preferences */}
          <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#CBD5E1] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#123F3A]">
              <span>{t.onboarding.accessibilityHeader}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#25312F]">
                <Type className="w-4 h-4 text-[#138A7B]" />
                <span>{t.onboarding.largerText}</span>
              </div>
              <div className="flex gap-1.5">
                {(['normal', 'large', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTextSize(sz)}
                    className={`px-3 py-1.5 text-xs rounded-xl border font-semibold cursor-pointer ${
                      textSize === sz
                        ? 'bg-[#123F3A] text-white border-[#123F3A]'
                        : 'bg-white text-[#66736F] border-[#CBD5E1]'
                    }`}
                  >
                    {sz === 'normal' ? 'A (100%)' : sz === 'large' ? 'A+ (115%)' : 'A++ (130%)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E8]">
              <div className="flex items-center gap-2 text-sm text-[#25312F]">
                <Volume2 className="w-4 h-4 text-[#138A7B]" />
                <span>{t.onboarding.voiceAssisted}</span>
              </div>
              <button
                onClick={() => setVoiceAssisted(!voiceAssisted)}
                className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
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
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 px-1 text-xs text-[#66736F] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#138A7B] shrink-0 mt-0.5" />
            <span>{t.onboarding.privacyNotice}</span>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleStart}
            className="w-full min-h-[50px] py-4 px-6 rounded-2xl bg-[#138A7B] hover:bg-[#1A9E8D] text-white font-bold text-base shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.onboarding.getStarted}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
