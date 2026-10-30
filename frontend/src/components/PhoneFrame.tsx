import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { BottomNav } from './BottomNav';
import { Smartphone, Monitor, Globe, Volume2, VolumeX } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { textSize, voiceAssisted, setVoiceAssisted } = useAccessibility();
  const { language, setLanguage } = useLanguage();
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const textSizeClass = {
    normal: 'text-scale-normal',
    large: 'text-scale-large',
    xl: 'text-scale-xl'
  }[textSize];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen py-4 md:py-8 px-2 font-sans select-none">
      {/* Top utility bar for the pairing environment / reviewer */}
      <div className="w-full max-w-[500px] mb-3 px-2 flex items-center justify-between text-xs text-[#66736F]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#123F3A]">DoseSaathi AI</span>
          <span className="px-1.5 py-0.5 rounded bg-[#E6F4EF] text-[#123F3A] font-medium text-[11px]">
            India Health UX
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language quick switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#CBD5E1] text-[#25312F] font-medium hover:bg-[#F8F7F2] transition-colors"
            title="Toggle English / தமிழ்"
          >
            <Globe className="w-3.5 h-3.5 text-[#138A7B]" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Voice assistance toggle */}
          <button
            onClick={() => setVoiceAssisted(!voiceAssisted)}
            className={`p-1.5 rounded-full border transition-colors ${
              voiceAssisted
                ? 'bg-[#E6F4EF] border-[#138A7B] text-[#138A7B]'
                : 'bg-white border-[#CBD5E1] text-[#66736F]'
            }`}
            title="Voice guidance"
          >
            {voiceAssisted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Viewport mode toggle */}
          <button
            onClick={() => setIsPhoneMode(!isPhoneMode)}
            className="p-1.5 rounded-full bg-white border border-[#CBD5E1] text-[#66736F] hover:text-[#123F3A] transition-colors"
            title={isPhoneMode ? "Expand to wide view" : "Switch to 390x844 mobile frame"}
          >
            {isPhoneMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame (390×844) or Fluid Container */}
      <div
        className={`relative flex flex-col bg-[#F8F7F2] text-[#25312F] overflow-hidden transition-all duration-300 ${textSizeClass} ${
          isPhoneMode
            ? 'w-[390px] h-[844px] rounded-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[8px] border-[#25312F]'
            : 'w-full max-w-[480px] min-h-[844px] rounded-3xl shadow-xl border border-[#CBD5E1]'
        }`}
      >
        {/* Android Status Bar */}
        <div className="shrink-0 w-full h-11 px-6 pt-2 flex items-center justify-between text-xs font-medium text-[#25312F] z-20 bg-transparent">
          <span>{currentTime}</span>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 14.5c-3.04 0-5.5-2.46-5.5-5.5s2.46-5.5 5.5-5.5 5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5z"/>
            </svg>
            <span className="text-[11px] font-bold">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
              <div className="w-3.5 h-1.5 bg-current rounded-xs" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen Content with Scrollable Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </main>

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

