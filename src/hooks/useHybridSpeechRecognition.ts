
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
      // Use setIsListening directly since listeningManager is defined below
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
      // Use setIsListening directly since listeningManager is defined below
      setIsListening(listening);
    },
    vadEnabled
  });

  // Listening management - define setIsListening first
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

  // Initialize Vosk when selected
  useEffect(() => {
    if (currentEngine === 'vosk') {
      voskEngine.initializeVosk();
    }
  }, [currentEngine, voskEngine.initializeVosk]);

  const handleEngineSwitch = useCallback((engine: SpeechEngine) => {
    if (isListening) {
      listeningManager.stopListening();
    }
    switchEngine(engine);
  }, [isListening, listeningManager.stopListening, switchEngine]);

  const handleLanguageSwitch = useCallback((language: SupportedLanguage) => {
    if (isListening) {
      listeningManager.stopListening();
    }
    switchLanguage(language);
  }, [isListening, listeningManager.stopListening, switchLanguage]);

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
