
import { useState, useEffect, useCallback } from 'react';
import { SpeechEngine, SupportedLanguage } from '@/hooks/useHybridSpeechRecognition';

export const useChatSpeechConfig = (
  initialEngine: SpeechEngine = 'web-speech',
  initialLanguage: SupportedLanguage = 'fr'
) => {
  const [speechConfig, setSpeechConfig] = useState<{
    engine: SpeechEngine;
    language: SupportedLanguage;
  }>({
    engine: initialEngine,
    language: initialLanguage
  });

  const updateSpeechConfig = useCallback((engine: SpeechEngine, language: SupportedLanguage) => {
    setSpeechConfig({ engine, language });
  }, []);

  return {
    speechConfig,
    updateSpeechConfig
  };
};
