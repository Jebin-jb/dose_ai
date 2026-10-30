import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScreenName, Prescription, ExtractedMedicine, MedicationSchedule, AdherenceEvent, BoundingBox } from '../types';

interface AppContextType {
  currentScreen: ScreenName;
  navigateTo: (screen: ScreenName) => void;
  currentPrescription: Prescription | null;
  setCurrentPrescription: (p: Prescription | null) => void;
  selectedMedicineForExplainer: ExtractedMedicine | null;
  setSelectedMedicineForExplainer: (m: ExtractedMedicine | null) => void;
  schedules: MedicationSchedule[];
  refreshSchedules: () => Promise<void>;
  adherenceEvents: AdherenceEvent[];
  refreshAdherenceEvents: () => Promise<void>;
  activeReminderModal: { schedule: MedicationSchedule; scheduledTime: string } | null;
  openReminderModal: (schedule: MedicationSchedule, time: string) => void;
  closeReminderModal: () => void;
  activePdfReport: { url: string; filename: string } | null;
  setActivePdfReport: (rep: { url: string; filename: string } | null) => void;
  highlightedBoundingBox: BoundingBox | null;
  setHighlightedBoundingBox: (box: BoundingBox | null) => void;
  recordAdherence: (
    scheduleId: string,
    medName: string,
    schedTime: string,
    status: string,
    reason?: string,
    notes?: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() => {
    const hasSeenAbout = localStorage.getItem('dosesaathi_seen_about');
    return hasSeenAbout ? 'home' : 'about';
  });

  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [selectedMedicineForExplainer, setSelectedMedicineForExplainer] = useState<ExtractedMedicine | null>(null);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [adherenceEvents, setAdherenceEvents] = useState<AdherenceEvent[]>([]);
  const [activeReminderModal, setActiveReminderModal] = useState<{ schedule: MedicationSchedule; scheduledTime: string } | null>(null);
  const [activePdfReport, setActivePdfReport] = useState<{ url: string; filename: string } | null>(null);
  const [highlightedBoundingBox, setHighlightedBoundingBox] = useState<BoundingBox | null>(null);

  const navigateTo = (screen: ScreenName) => {
    if (screen === 'home') {
      localStorage.setItem('dosesaathi_welcomed', 'true');
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/medication-schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (e) {
      console.warn("Error loading schedules:", e);
    }
  }, []);

  const refreshAdherenceEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/adherence-events');
      if (res.ok) {
        const data = await res.json();
        setAdherenceEvents(data);
      }
    } catch (e) {
      console.warn("Error loading events:", e);
    }
  }, []);

  const recordAdherence = async (
    scheduleId: string,
    medName: string,
    schedTime: string,
    status: string,
    reason?: string,
    notes?: string
  ) => {
    try {
      await fetch('/api/adherence-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: scheduleId,
          medicine_name: medName,
          scheduled_time: schedTime,
          status,
          skipped_reason: reason || null,
          reporting_source: 'patient',
          notes: notes || null
        })
      });
      await refreshAdherenceEvents();
      setActiveReminderModal(null);
    } catch (e) {
      console.error("Failed to record adherence event:", e);
    }
  };

  const openReminderModal = (schedule: MedicationSchedule, time: string) => {
    setActiveReminderModal({ schedule, scheduledTime: time });
  };

  const closeReminderModal = () => {
    setActiveReminderModal(null);
  };

  useEffect(() => {
    refreshSchedules();
    refreshAdherenceEvents();
  }, [refreshSchedules, refreshAdherenceEvents]);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        currentPrescription,
        setCurrentPrescription,
        selectedMedicineForExplainer,
        setSelectedMedicineForExplainer,
        schedules,
        refreshSchedules,
        adherenceEvents,
        refreshAdherenceEvents,
        activeReminderModal,
        openReminderModal,
        closeReminderModal,
        activePdfReport,
        setActivePdfReport,
        highlightedBoundingBox,
        setHighlightedBoundingBox,
        recordAdherence
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

