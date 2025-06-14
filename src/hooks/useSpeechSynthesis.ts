
import { useState, useRef } from 'react';
import { SupportedLanguage } from '@/types/speechRecognition';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoiceSettings = (language: SupportedLanguage) => {
    switch (language) {
      case 'ar':
        return {
          lang: 'ar-SA',
          rate: 0.8,
          pitch: 1.0
        };
      case 'fr':
      default:
        return {
          lang: 'fr-FR',
          rate: 0.9,
          pitch: 1.1
        };
    }
  };

  const speak = (text: string, onStart?: () => void, onEnd?: () => void, language?: SupportedLanguage) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const targetLanguage = language || currentLanguage;
    const voiceSettings = getVoiceSettings(targetLanguage);
    
    console.log(`🔊 Synthèse vocale en ${targetLanguage} pour: "${text}"`);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceSettings.lang;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log(`🎵 Début synthèse vocale en ${targetLanguage}`);
      onStart?.();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log(`✅ Fin synthèse vocale en ${targetLanguage}`);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur synthèse vocale:', event);
      setIsSpeaking(false);
      onEnd?.();
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const updateLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    console.log(`🌐 Langue synthèse vocale mise à jour: ${language}`);
  };

  return {
    isSpeaking,
    speechEnabled,
    setSpeechEnabled,
    speak,
    updateLanguage,
    currentLanguage
  };
};
