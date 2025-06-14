
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SpeechEngine, SupportedLanguage, EngineStatus } from '@/types/speechRecognition';

interface UseSpeechEngineManagerProps {
  initialEngine: SpeechEngine;
  initialLanguage: SupportedLanguage;
  onEngineChange?: (engine: SpeechEngine) => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const useSpeechEngineManager = ({
  initialEngine,
  initialLanguage,
  onEngineChange,
  onLanguageChange
}: UseSpeechEngineManagerProps) => {
  const [currentEngine, setCurrentEngine] = useState<SpeechEngine>(initialEngine);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [vadEnabled, setVadEnabled] = useState(true);

  const switchEngine = useCallback((engine: SpeechEngine) => {
    setCurrentEngine(engine);
    onEngineChange?.(engine);
    console.log(`🔄 Moteur changé vers: ${engine}${vadEnabled ? ' (VAD activé)' : ''}`);
  }, [vadEnabled, onEngineChange]);

  const switchLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    onLanguageChange?.(language);
    console.log(`🌐 Langue changée vers: ${language}`);
  }, [onLanguageChange]);

  const toggleVAD = useCallback(() => {
    setVadEnabled(!vadEnabled);
    console.log(`🎯 VAD ${!vadEnabled ? 'activé' : 'désactivé'}`);
    
    toast.success(`VAD ${!vadEnabled ? 'activé' : 'désactivé'}`, {
      description: !vadEnabled 
        ? "Détection automatique des segments vocaux" 
        : "Détection manuelle classique"
    });
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
