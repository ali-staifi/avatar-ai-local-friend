import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { voskModelManager } from '@/services/VoskModelManager';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';
import { useWebSpeechEngine } from './useWebSpeechEngine';
import { useVoskEngine } from './useVoskEngine';
import { useSpeechEngineManager } from './useSpeechEngineManager';
import { SpeechEngine, SupportedLanguage, HybridSpeechConfig, EngineInfo } from '@/types/speechRecognition';

export type { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

export const useHybridSpeechRecognition = (
  onResult: (transcript: string) => void,
  config: HybridSpeechConfig = { engine: 'web-speech', language: 'fr', vadEnabled: true }
) => {
  const [isListening, setIsListening] = useState(false);
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
    aggressiveness: 2,
    bufferDuration: 3000,
    silenceThreshold: 800,
    voiceThreshold: 300,
    onVoiceSegmentDetected: (audioSegment: Float32Array) => {
      console.log(`🎯 VAD: Segment vocal détecté (${audioSegment.length} échantillons)`);
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
    onListeningChange: setIsListening,
    vadEnabled
  });

  // Update engine status based on current engine
  useEffect(() => {
    if (currentEngine === 'vosk') {
      setEngineStatus(voskEngine.engineStatus);
    } else {
      setEngineStatus(webSpeechEngine.isSupported ? 'ready' : 'error');
    }
  }, [currentEngine, voskEngine.engineStatus, webSpeechEngine.isSupported]);

  // Initialize Vosk when selected
  useEffect(() => {
    if (currentEngine === 'vosk') {
      voskEngine.initializeVosk();
    }
  }, [currentEngine, voskEngine.initializeVosk]);

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

  const handleEngineSwitch = useCallback((engine: SpeechEngine) => {
    if (isListening) {
      stopListening();
    }
    switchEngine(engine);
  }, [isListening, stopListening, switchEngine]);

  const handleLanguageSwitch = useCallback((language: SupportedLanguage) => {
    if (isListening) {
      stopListening();
    }
    switchLanguage(language);
  }, [isListening, stopListening, switchLanguage]);

  const handleVADToggle = useCallback(() => {
    if (isListening) {
      toast.warning("Arrêtez l'écoute d'abord", {
        description: "Impossible de changer VAD pendant l'écoute"
      });
      return;
    }
    toggleVAD();
  }, [isListening, toggleVAD]);

  const getEngineInfo = useCallback((): EngineInfo => {
    const webSpeechSupported = webSpeechEngine.isSupported;
    const voskModelLoaded = voskEngine.isModelLoaded;
    
    return {
      webSpeech: {
        supported: webSpeechSupported,
        available: webSpeechSupported,
        description: `Reconnaissance en ligne via le navigateur${vadEnabled ? ' + VAD' : ''}`
      },
      vosk: {
        supported: true,
        available: voskModelLoaded,
        description: `Reconnaissance offline privée${vadEnabled ? ' + détection automatique' : ''}`,
        modelProgress: voskEngine.modelProgress.find(p => p.language.includes(currentLanguage === 'fr' ? 'Français' : 'العربية'))
      },
      vad: {
        supported: vadSupported,
        enabled: vadEnabled,
        status: vadListening ? 'listening' : 'ready',
        bufferStatus
      }
    };
  }, [currentLanguage, voskEngine.modelProgress, vadSupported, vadEnabled, vadListening, bufferStatus, webSpeechEngine.isSupported, voskEngine.isModelLoaded]);

  return {
    isListening,
    toggleListening,
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
