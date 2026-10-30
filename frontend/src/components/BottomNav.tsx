import React from 'react';
import { Home, Pill, FileText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ScreenName } from '../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();
  const { t } = useLanguage();

  // Hide bottom nav on full-screen flows like scanner or welcome
  if (currentScreen === 'welcome' || currentScreen === 'scanner') {
    return null;
  }

  const navItems: { id: ScreenName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'my_medicines', label: t.nav.medicines, icon: Pill },
    { id: 'reports', label: t.nav.reports, icon: FileText },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav
      className="sticky bottom-0 z-30 w-full bg-[#FFFFFF] border-t border-[#E5E9E8] px-3 py-2 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
      aria-label="Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] py-1 px-2 rounded-xl transition-colors duration-150 ${
              isActive
                ? 'text-[#123F3A] font-semibold bg-[#E6F4EF]'
                : 'text-[#66736F] hover:text-[#25312F] active:bg-[#F8F7F2]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#138A7B] stroke-[2.3]' : 'stroke-[1.8]'}`} />
            <span className="text-[12px] leading-tight tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

