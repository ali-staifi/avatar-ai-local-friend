
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SpeechEngine } from '@/types/speechRecognition';

interface UseHybridSpeechListeningProps {
  currentEngine: SpeechEngine;
  engineStatus: 'ready' | 'loading' | 'error';
  webSpeechEngine: {
    startListening: () => boolean;
    stopListening: () => void;
  };
  voskEngine: {
    startListening: () => Promise<boolean>;
    stopListening: () => void;
  };
  vadEnabled: boolean;
  vadSupported: boolean;
  vadListening: boolean;
  startVAD: () => Promise<boolean>;
  stopVAD: () => void;
}

export const useHybridSpeechListening = ({
  currentEngine,
  engineStatus,
  webSpeechEngine,
  voskEngine,
  vadEnabled,
  vadSupported,
  vadListening,
  startVAD,
  stopVAD
}: UseHybridSpeechListeningProps) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(async () => {
    if (currentEngine === 'web-speech') {
      const success = webSpeechEngine.startListening();
      if (success && vadEnabled && vadSupported && !vadListening) {
        await startVAD();
      }
      return success;
    } else if (currentEngine === 'vosk') {
      const success = await voskEngine.startListening();
      if (success && vadEnabled && vadSupported) {
        const vadSuccess = await startVAD();
        if (!vadSuccess) {
          setIsListening(false);
          return false;
        }
        toast.success("Vosk + VAD actif", {
          description: "Parlez naturellement, les segments sont détectés automatiquement"
        });
      }
      return success;
    }
    return false;
  }, [currentEngine, webSpeechEngine, voskEngine, vadEnabled, vadSupported, vadListening, startVAD]);

  const stopListening = useCallback(() => {
    if (currentEngine === 'web-speech') {
      webSpeechEngine.stopListening();
    } else if (currentEngine === 'vosk') {
      voskEngine.stopListening();
    }
    
    if (vadEnabled && vadListening) {
      stopVAD();
    }
    
    setIsListening(false);
    console.log(`🛑 ${currentEngine} ${vadEnabled ? '+ VAD' : ''} arrêté`);
  }, [currentEngine, webSpeechEngine, voskEngine, vadEnabled, vadListening, stopVAD]);

  const toggleListening = useCallback(() => {
    if (engineStatus === 'loading') {
      toast.warning("Moteur en cours de chargement", {
        description: "Veuillez patienter..."
      });
      return;
    }

    if (engineStatus === 'error') {
      toast.error("Moteur non disponible", {
        description: "Changez de moteur ou rafraîchissez la page"
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, engineStatus, startListening, stopListening]);

  return {
    isListening,
    setIsListening,
    startListening,
    stopListening,
    toggleListening
  };
};
