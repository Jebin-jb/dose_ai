import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ScreenName } from '../types';
import {
  Home,
  Camera,
  Pill,
  FileText,
  User,
  Globe,
  Type,
  Volume2,
  VolumeX,
  Menu,
  X,
  Info,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface WebLayoutProps {
  children: React.ReactNode;
}

export const WebLayout: React.FC<WebLayoutProps> = ({ children }) => {
  const { textSize, setTextSize, voiceAssisted, setVoiceAssisted } = useAccessibility();
  const { language, setLanguage, t } = useLanguage();
  const { currentScreen, navigateTo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isTamil = language === 'ta';

  const navItems: { id: ScreenName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'scanner', label: isTamil ? 'சீட்டு ஸ்கேனர்' : 'Prescription Scanner', icon: Camera },
    { id: 'my_medicines', label: t.nav.medicines, icon: Pill },
    { id: 'reports', label: t.nav.reports, icon: FileText },
    { id: 'profile', label: t.nav.profile, icon: User },
    { id: 'about', label: isTamil ? 'திட்டம் பற்றி' : 'About the Project', icon: Info },
  ];

  const textSizeClass = {
    normal: 'text-scale-normal',
    large: 'text-scale-large',
    xl: 'text-scale-xl'
  }[textSize];

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8F7F2] text-[#25312F] ${textSizeClass} transition-colors`}>
      {/* 1. TOP WEB APPLICATION HEADER / DASHBOARD BAR */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E5E9E8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                aria-label="Go to Home Dashboard"
              >
                <BrandLogo size="md" showText={true} />
              </button>

              {/* Desktop Navigation Links (Visible on large screens) */}
              <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Main Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#E6F4EF] text-[#123F3A]'
                          : 'text-[#66736F] hover:text-[#123F3A] hover:bg-[#F8F7F2]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#138A7B]' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right: Controls on Desktop (Large Screens) */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Font Scaling Accessible Selector */}
              <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 rounded-xl border border-[#CBD5E1]/60">
                <Type className="w-3.5 h-3.5 text-[#66736F] ml-1 mr-0.5" />
                {(['normal', 'large', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTextSize(sz)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      textSize === sz
                        ? 'bg-[#123F3A] text-white shadow-2xs'
                        : 'text-[#66736F] hover:text-[#25312F]'
                    }`}
                    title={`Text size: ${sz}`}
                  >
                    {sz === 'normal' ? 'A' : sz === 'large' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>

              {/* Voice-assisted Guidance Toggle */}
              <button
                onClick={() => setVoiceAssisted(!voiceAssisted)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  voiceAssisted
                    ? 'bg-[#E6F4EF] border-[#138A7B] text-[#138A7B]'
                    : 'bg-white border-[#CBD5E1] text-[#66736F] hover:text-[#25312F]'
                }`}
                title="Voice Guidance for Older Adults"
                aria-label="Toggle Voice Guidance"
              >
                {voiceAssisted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#123F3A] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#138A7B]" />
                <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </button>

              {/* Patient Badge */}
              <button
                onClick={() => navigateTo('profile')}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F8F7F2] transition-colors border border-transparent hover:border-[#CBD5E1] cursor-pointer"
                title="View Profile and Preferences"
              >
                <div className="w-8 h-8 rounded-full bg-[#E6F4EF] text-[#123F3A] flex items-center justify-center font-bold text-xs border border-[#138A7B]/30">
                  R
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-[#25312F]">Ramanathan</div>
                  <div className="text-[10px] text-[#66736F]">Patient (64/M)</div>
                </div>
              </button>
            </div>

            {/* Mobile & Tablet Header Controls (Visible below lg: 1024px) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#123F3A] bg-white cursor-pointer"
              >
                {language === 'en' ? 'தமிழ்' : 'English'}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#25312F] hover:bg-[#F8F7F2] border border-[#CBD5E1] cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E9E8] bg-white px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E6F4EF] text-[#123F3A]'
                      : 'text-[#66736F] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#138A7B]' : 'text-[#66736F]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-[#F1EFE8] flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-[#66736F]">Font Scale:</span>
              <div className="flex gap-1.5">
                {(['normal', 'large', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTextSize(sz)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold cursor-pointer ${
                      textSize === sz
                        ? 'bg-[#123F3A] text-white border-[#123F3A]'
                        : 'bg-[#F8F7F2] text-[#66736F] border-[#CBD5E1]'
                    }`}
                  >
                    {sz === 'normal' ? 'Normal' : sz === 'large' ? 'Large' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-[#66736F]">Voice Guidance:</span>
              <button
                onClick={() => setVoiceAssisted(!voiceAssisted)}
                className={`px-3 py-1.5 rounded-xl border font-semibold cursor-pointer ${
                  voiceAssisted
                    ? 'bg-[#E6F4EF] text-[#138A7B] border-[#138A7B]'
                    : 'bg-[#F8F7F2] text-[#66736F] border-[#CBD5E1]'
                }`}
              >
                {voiceAssisted ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN FULL-WIDTH RESPONSIVE VIEWPORT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 3. WARM, REASSURING HEALTHCARE FOOTER (NO TECHNICAL JARGON) */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E5E9E8] py-8 text-xs text-[#66736F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" showText={true} />
              <span className="text-[11px] text-[#94A3B8] hidden md:inline">•</span>
              <span className="text-[11px] text-[#66736F] hidden md:inline">
                {isTamil
                  ? 'மருந்துகளைப் புரிந்து கொள்ளுங்கள். நலமாய் வாழுங்கள்.'
                  : 'Understand your medicines. Stay on track.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('about')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#E6F4EF] border border-[#CBD5E1] text-[#123F3A] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#138A7B]" />
                <span>{isTamil ? 'திட்டம் பற்றி & தொழில்நுட்ப விவரங்கள்' : 'About the Project & Medical Safety'}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1EFE8] text-[11px] leading-relaxed text-[#66736F]">
            <p>
              <strong>{isTamil ? 'மருத்துவக் குறிப்பு:' : 'Medical Advisory:'}</strong>{' '}
              {isTamil
                ? 'டோஸ்சாத்தி AI உங்கள் மருத்துவரின் கையெழுத்துச் சீட்டைத் தெளிவாக வாசித்து புரிந்துகொள்ள உதவும் வழிகாட்டியாகும். எந்தவொரு மருந்து மாற்றத்திற்கும் உங்கள் மருத்துவரை அணுகவும்.'
                : 'DoseSaathi AI helps you read and organize doctor\'s handwritten prescriptions for your informed review. It is an assistive guide and does not replace the professional judgment of your prescribing doctor or pharmacist.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
