import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppProvider, useApp } from './context/AppContext';
import { WebLayout } from './components/WebLayout';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { AboutScreen } from './screens/AboutScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ScannerScreen } from './screens/ScannerScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ExplainerScreen } from './screens/ExplainerScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { MyMedicinesScreen } from './screens/MyMedicinesScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ReminderModal } from './screens/ReminderModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'about':
      return <AboutScreen />;
    case 'home':
      return <HomeScreen />;
    case 'scanner':
      return <ScannerScreen />;
    case 'review':
      return <ReviewScreen />;
    case 'explainer':
      return <ExplainerScreen />;
    case 'schedule':
      return <ScheduleScreen />;
    case 'my_medicines':
      return <MyMedicinesScreen />;
    case 'reports':
      return <ReportsScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return <HomeScreen />;
  }
};

export default function App() {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <AppProvider>
          <WebLayout>
            <ScreenRouter />
            <ReminderModal />
            <PdfPreviewModal />
          </WebLayout>
        </AppProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
