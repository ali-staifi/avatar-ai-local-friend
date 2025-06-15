
import { useState, useCallback } from 'react';
import { SpeechEngine, SupportedLanguage, HybridSpeechConfig } from '@/types/speechRecognition';

export const useHybridSpeechConfig = (initialConfig: HybridSpeechConfig) => {
  const [currentEngine, setCurrentEngine] = useState<SpeechEngine>(initialConfig.engine);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(initialConfig.language);
  const [vadEnabled, setVadEnabled] = useState(initialConfig.vadEnabled ?? true);

  const switchEngine = useCallback((engine: SpeechEngine) => {
    setCurrentEngine(engine);
    console.log(`🔄 Moteur changé vers: ${engine}${vadEnabled ? ' (VAD activé)' : ''}`);
  }, [vadEnabled]);

  const switchLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    console.log(`🌐 Langue changée vers: ${language}`);
  }, []);

  const toggleVAD = useCallback(() => {
    setVadEnabled(!vadEnabled);
    console.log(`🎯 VAD ${!vadEnabled ? 'activé' : 'désactivé'}`);
  }, [vadEnabled]);

  return {
    currentEngine,
    currentLanguage,
    vadEnabled,
    switchEngine,
    switchLanguage,
    toggleVAD
  };
};
