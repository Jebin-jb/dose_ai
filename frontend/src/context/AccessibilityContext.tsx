import React, { createContext, useContext, useState, useEffect } from 'react';
import { TextSize } from '../types';

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  voiceAssisted: boolean;
  setVoiceAssisted: (enabled: boolean) => void;
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('dosesaathi_text_size') as TextSize) || 'normal';
  });

  const [voiceAssisted, setVoiceAssistedState] = useState<boolean>(() => {
    return localStorage.getItem('dosesaathi_voice') === 'true';
  });

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('dosesaathi_text_size', size);
    fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_size: size })
    }).catch(() => {});
  };

  const setVoiceAssisted = (enabled: boolean) => {
    setVoiceAssistedState(enabled);
    localStorage.setItem('dosesaathi_voice', String(enabled));
    fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_assisted: enabled ? 1 : 0 })
    }).catch(() => {});
  };

  const speak = (text: string) => {
    if (!voiceAssisted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower, calm cadence for older adults
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ textSize, setTextSize, voiceAssisted, setVoiceAssisted, speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

