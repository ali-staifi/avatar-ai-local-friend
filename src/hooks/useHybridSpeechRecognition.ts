
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';
import { useWebSpeechEngine } from './useWebSpeechEngine';
import { useVoskEngine } from './useVoskEngine';
import { useSpeechEngineManager } from './useSpeechEngineManager';
import { useSpeechListeningManager } from './useSpeechListeningManager';
import { useEngineInfoProvider } from './useEngineInfoProvider';
import type { SpeechEngine, SupportedLanguage, HybridSpeechConfig } from '@/types/speechRecognition';

export type { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

export const useHybridSpeechRecognition = (
  onResult: (transcript: string) => void,
  config: HybridSpeechConfig = { engine: 'web-speech', language: 'fr', vadEnabled: true }
) => {
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  
  const {
    currentEngine,
    currentLanguage,
    vadEnabled,
    switchEngine,
    switchLanguage,
    toggleVAD
  } = useSpeechEngineManager({
    initialEngine: config.engine,
    initialLanguage: config.language
  });

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

  // VAD integration
  const {
    isInitialized: vadInitialized,
    isListening: vadListening,
    bufferStatus,
    startListening: startVAD,
    stopListening: stopVAD,
    vadSupported
  } = useVoiceActivityDetection({
    enabled: vadEnabled,
    sampleRate: 16000,
    frameSize: 30,
    aggressiveness: currentLanguage === 'ar' ? 3 : 2, // Plus agressif pour l'arabe
    bufferDuration: 3000,
    silenceThreshold: currentLanguage === 'ar' ? 1000 : 800, // Plus de tolérance pour l'arabe
    voiceThreshold: currentLanguage === 'ar' ? 400 : 300,
    onVoiceSegmentDetected: (audioSegment: Float32Array) => {
      console.log(`🎯 VAD: Segment vocal détecté pour ${currentLanguage} (${audioSegment.length} échantillons)`);
      if (currentEngine === 'vosk' && audioSegment.length > 0) {
        voskEngine.simulateVoskTranscription(audioSegment);
      }
    }
  });

  // Engine hooks
  const webSpeechEngine = useWebSpeechEngine({
    language: currentLanguage,
    continuous: config.continuous || false,
    interimResults: config.interimResults || false,
    onResult,
    onListeningChange: (listening) => {
      setIsListening(listening);
      if (!listening && vadEnabled && vadListening) {
        stopVAD();
      }
    }
  });

  const voskEngine = useVoskEngine({
    language: currentLanguage,
    onResult,
    onListeningChange: (listening) => {
      setIsListening(listening);
    },
    vadEnabled
  });

  // Listening management
  const [isListening, setIsListening] = useState(false);
  
  const listeningManager = useSpeechListeningManager({
    currentEngine,
    engineStatus,
    webSpeechEngine,
    voskEngine,
    vadEnabled,
    vadSupported,
    vadListening,
    startVAD,
    stopVAD
  });

  // Update listening state when listeningManager changes
  useEffect(() => {
    setIsListening(listeningManager.isListening);
  }, [listeningManager.isListening]);

  // Engine info provider
  const { getEngineInfo } = useEngineInfoProvider({
    currentLanguage,
    webSpeechSupported: webSpeechEngine.isSupported,
    voskModelLoaded: voskEngine.isModelLoaded,
    voskModelProgress: voskEngine.modelProgress,
    vadSupported,
    vadEnabled,
    vadListening,
    bufferStatus
  });

  // Update engine status based on current engine
  useEffect(() => {
    if (currentEngine === 'vosk') {
      setEngineStatus(voskEngine.engineStatus);
    } else {
      setEngineStatus(webSpeechEngine.isSupported ? 'ready' : 'error');
    }
  }, [currentEngine, voskEngine.engineStatus, webSpeechEngine.isSupported]);

  // Initialize Vosk when selected or when Arabic is selected
  useEffect(() => {
    if (currentEngine === 'vosk' || currentLanguage === 'ar') {
      voskEngine.initializeVosk();
    }
  }, [currentEngine, currentLanguage, voskEngine.initializeVosk]);

  const handleEngineSwitch = useCallback((engine: SpeechEngine) => {
    if (isListening) {
      listeningManager.stopListening();
    }
    
    // Auto-activer VAD pour l'arabe avec Vosk
    if (engine === 'vosk' && currentLanguage === 'ar' && !vadEnabled) {
      toggleVAD();
      toast.info("VAD activé automatiquement", {
        description: "Recommandé pour la reconnaissance vocale en arabe"
      });
    }
    
    switchEngine(engine);
  }, [isListening, listeningManager.stopListening, switchEngine, currentLanguage, vadEnabled, toggleVAD]);

  const handleLanguageSwitch = useCallback((language: SupportedLanguage) => {
    if (isListening) {
      listeningManager.stopListening();
    }
    
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
    
    switchLanguage(language);
  }, [isListening, listeningManager.stopListening, switchLanguage, currentEngine, handleEngineSwitch]);

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
    isListening,
    toggleListening: listeningManager.toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine: handleEngineSwitch,
    switchLanguage: handleLanguageSwitch,
    engineStatus,
    engineInfo: getEngineInfo(),
    modelProgress: voskEngine.modelProgress,
    isSupported: currentEngine === 'web-speech' ? webSpeechEngine.isSupported : true,
    vadEnabled,
    toggleVAD: handleVADToggle,
    vadSupported,
    vadListening,
    bufferStatus
  };
};
