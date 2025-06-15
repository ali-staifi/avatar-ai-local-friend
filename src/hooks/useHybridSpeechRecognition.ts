
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';
import { useEngineInfoProvider } from './useEngineInfoProvider';
import { useHybridSpeechConfig } from './useHybridSpeechConfig';
import { useHybridSpeechEngines } from './useHybridSpeechEngines';
import { useHybridSpeechListening } from './useHybridSpeechListening';
import { useHybridSpeechRecommendations } from './useHybridSpeechRecommendations';
import type { SpeechEngine, SupportedLanguage, HybridSpeechConfig } from '@/types/speechRecognition';

export type { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

export const useHybridSpeechRecognition = (
  onResult: (transcript: string) => void,
  config: HybridSpeechConfig = { engine: 'web-speech', language: 'fr', vadEnabled: true }
) => {
  // Configuration management
  const {
    currentEngine,
    currentLanguage,
    vadEnabled,
    switchEngine,
    switchLanguage,
    toggleVAD
  } = useHybridSpeechConfig(config);

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
    aggressiveness: currentLanguage === 'ar' ? 3 : 2,
    bufferDuration: 3000,
    silenceThreshold: currentLanguage === 'ar' ? 1000 : 800,
    voiceThreshold: currentLanguage === 'ar' ? 400 : 300,
    onVoiceSegmentDetected: (audioSegment: Float32Array) => {
      console.log(`🎯 VAD: Segment vocal détecté pour ${currentLanguage} (${audioSegment.length} échantillons)`);
      if (currentEngine === 'vosk' && audioSegment.length > 0) {
        voskEngine.simulateVoskTranscription(audioSegment);
      }
    }
  });

  // Engine management
  const {
    webSpeechEngine,
    voskEngine,
    engineStatus
  } = useHybridSpeechEngines({
    currentEngine,
    currentLanguage,
    vadEnabled,
    onResult,
    onListeningChange: (listening) => {
      listeningManager.setIsListening(listening);
      if (!listening && vadEnabled && vadListening) {
        stopVAD();
      }
    }
  });

  // Listening management
  const listeningManager = useHybridSpeechListening({
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

  // Recommendations and auto-suggestions
  const {
    handleEngineSwitch,
    handleLanguageSwitch,
    handleVADToggle
  } = useHybridSpeechRecommendations({
    currentEngine,
    currentLanguage,
    vadEnabled,
    switchEngine,
    toggleVAD,
    isListening: listeningManager.isListening
  });

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

  return {
    isListening: listeningManager.isListening,
    toggleListening: listeningManager.toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine: handleEngineSwitch,
    switchLanguage: (language: SupportedLanguage) => {
      if (listeningManager.isListening) {
        listeningManager.stopListening();
      }
      handleLanguageSwitch(language);
      switchLanguage(language);
    },
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
