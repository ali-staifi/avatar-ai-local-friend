
import { useState, useCallback, useRef } from 'react';
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
  const isProcessingRef = useRef(false);
  const lastToggleTimeRef = useRef(0);

  const startListening = useCallback(async () => {
    // Éviter les appels trop fréquents
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 1000) {
      console.log('⚠️ Tentative de démarrage trop rapide - ignorée');
      return false;
    }
    lastToggleTimeRef.current = now;

    if (isProcessingRef.current) {
      console.log('⚠️ Démarrage déjà en cours - ignoré');
      return false;
    }

    isProcessingRef.current = true;

    try {
      if (currentEngine === 'web-speech') {
        const success = webSpeechEngine.startListening();
        if (success) {
          setIsListening(true);
          console.log('✅ Web Speech démarré avec succès');
          
          if (vadEnabled && vadSupported && !vadListening) {
            await startVAD();
          }
        }
        return success;
      } else if (currentEngine === 'vosk') {
        const success = await voskEngine.startListening();
        if (success) {
          setIsListening(true);
          console.log('✅ Vosk démarré avec succès');
          
          if (vadEnabled && vadSupported) {
            const vadSuccess = await startVAD();
            if (!vadSuccess) {
              console.warn('⚠️ VAD non démarré mais Vosk actif');
            }
          }
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
      setIsListening(false);
      return false;
    } finally {
      isProcessingRef.current = false;
    }
  }, [currentEngine, webSpeechEngine, voskEngine, vadEnabled, vadSupported, vadListening, startVAD]);

  const stopListening = useCallback(() => {
    if (isProcessingRef.current) {
      console.log('⚠️ Arrêt déjà en cours - ignoré');
      return;
    }

    isProcessingRef.current = true;

    try {
      if (currentEngine === 'web-speech') {
        webSpeechEngine.stopListening();
      } else if (currentEngine === 'vosk') {
        voskEngine.stopListening();
      }
      
      if (vadEnabled && vadListening) {
        stopVAD();
      }
      
      setIsListening(false);
      console.log(`🛑 ${currentEngine} arrêté proprement`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
    } finally {
      isProcessingRef.current = false;
    }
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
