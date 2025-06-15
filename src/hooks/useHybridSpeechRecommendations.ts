
import { useEffect, useCallback } from 'react';
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
  
  // Forcer Vosk + VAD pour l'arabe si Web Speech échoue
  useEffect(() => {
    if (currentLanguage === 'ar' && currentEngine === 'web-speech') {
      console.log('🌐 Arabe détecté - recommandation Vosk + VAD pour une meilleure précision');
      
      toast.warning("Recommandation pour l'arabe", {
        description: "Vosk + VAD est recommandé pour une meilleure reconnaissance en arabe",
        action: {
          label: "Activer Vosk + VAD",
          onClick: () => {
            switchEngine('vosk');
            if (!vadEnabled) {
              toggleVAD();
            }
          }
        },
        duration: 8000
      });
    }
  }, [currentLanguage, currentEngine, vadEnabled, switchEngine, toggleVAD]);

  const handleEngineSwitch = useCallback((engine: SpeechEngine) => {
    // Auto-activer VAD pour l'arabe avec Vosk
    if (engine === 'vosk' && currentLanguage === 'ar' && !vadEnabled) {
      toggleVAD();
      toast.info("VAD activé automatiquement", {
        description: "Recommandé pour la reconnaissance vocale en arabe"
      });
    }
    
    switchEngine(engine);
  }, [switchEngine, currentLanguage, vadEnabled, toggleVAD]);

  const handleLanguageSwitch = useCallback((language: SupportedLanguage) => {
    // Auto-suggestions pour l'arabe
    if (language === 'ar') {
      setTimeout(() => {
        if (currentEngine === 'web-speech') {
          toast.info("Suggestion pour l'arabe", {
            description: "Vosk + VAD offre une meilleure reconnaissance en arabe",
            action: {
              label: "Passer à Vosk + VAD",
              onClick: () => {
                handleEngineSwitch('vosk');
              }
            },
            duration: 10000
          });
        }
      }, 1000);
    }
  }, [currentEngine, handleEngineSwitch]);

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
