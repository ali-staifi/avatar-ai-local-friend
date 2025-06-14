
import { useState, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, onStart?: () => void, onEnd?: () => void) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return {
    isSpeaking,
    speechEnabled,
    setSpeechEnabled,
    speak
  };
};
