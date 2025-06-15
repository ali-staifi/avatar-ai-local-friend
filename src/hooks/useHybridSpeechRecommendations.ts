
import { useCallback } from 'react';
import { toast } from 'sonner';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface UseHybridSpeechRecommendationsProps {
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  vadEnabled: boolean;
  switchEngine: (engine: SpeechEngine) => void;
  toggleVAD: () => void;
  isListening: boolean;
}

export const useHybridSpeechRecommendations = ({
  currentEngine,
  currentLanguage,
  vadEnabled,
  switchEngine,
  toggleVAD,
  isListening
}: UseHybridSpeechRecommendationsProps) => {
  
  // Suppression des recommandations automatiques qui gênent l'utilisation
  // Les utilisateurs peuvent changer manuellement via l'interface

  const handleEngineSwitch = useCallback((engine: SpeechEngine) => {
    // Auto-activer VAD pour l'arabe avec Vosk sans notification
    if (engine === 'vosk' && currentLanguage === 'ar' && !vadEnabled) {
      toggleVAD();
    }
    
    switchEngine(engine);
  }, [switchEngine, currentLanguage, vadEnabled, toggleVAD]);

  const handleLanguageSwitch = useCallback((language: SupportedLanguage) => {
    // Suppression des suggestions automatiques qui interrompent l'expérience
    console.log(`🌐 Langue changée vers ${language}`);
  }, []);

  const handleVADToggle = useCallback(() => {
    if (isListening) {
      toast.warning("Arrêtez l'écoute d'abord", {
        description: "Impossible de changer VAD pendant l'écoute"
      });
      return;
    }
    toggleVAD();
  }, [isListening, toggleVAD]);

  return {
    handleEngineSwitch,
    handleLanguageSwitch,
    handleVADToggle
  };
};
