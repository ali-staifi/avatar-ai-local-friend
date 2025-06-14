
import { useCallback } from 'react';
import { EngineInfo, SupportedLanguage } from '@/types/speechRecognition';

interface UseEngineInfoProviderProps {
  currentLanguage: SupportedLanguage;
  webSpeechSupported: boolean;
  voskModelLoaded: boolean;
  voskModelProgress: any[];
  vadSupported: boolean;
  vadEnabled: boolean;
  vadListening: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
}

export const useEngineInfoProvider = ({
  currentLanguage,
  webSpeechSupported,
  voskModelLoaded,
  voskModelProgress,
  vadSupported,
  vadEnabled,
  vadListening,
  bufferStatus
}: UseEngineInfoProviderProps) => {
  const getEngineInfo = useCallback((): EngineInfo => {
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
        modelProgress: voskModelProgress.find(p => p.language.includes(currentLanguage === 'fr' ? 'Français' : 'العربية'))
      },
      vad: {
        supported: vadSupported,
        enabled: vadEnabled,
        status: vadListening ? 'listening' : 'ready',
        bufferStatus
      }
    };
  }, [currentLanguage, voskModelProgress, vadSupported, vadEnabled, vadListening, bufferStatus, webSpeechSupported, voskModelLoaded]);

  return { getEngineInfo };
};
