
import { useEffect, useState } from 'react';
import { useWebSpeechEngine } from './useWebSpeechEngine';
import { useVoskEngine } from './useVoskEngine';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface UseHybridSpeechEnginesProps {
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  vadEnabled: boolean;
  onResult: (transcript: string) => void;
  onListeningChange: (listening: boolean) => void;
}

export const useHybridSpeechEngines = ({
  currentEngine,
  currentLanguage,
  vadEnabled,
  onResult,
  onListeningChange
}: UseHybridSpeechEnginesProps) => {
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error'>('ready');

  // Engine hooks
  const webSpeechEngine = useWebSpeechEngine({
    language: currentLanguage,
    continuous: false,
    interimResults: false,
    onResult,
    onListeningChange
  });

  const voskEngine = useVoskEngine({
    language: currentLanguage,
    onResult,
    onListeningChange,
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

  // Initialize Vosk when selected or when Arabic is selected
  useEffect(() => {
    if (currentEngine === 'vosk' || currentLanguage === 'ar') {
      voskEngine.initializeVosk();
    }
  }, [currentEngine, currentLanguage, voskEngine.initializeVosk]);

  return {
    webSpeechEngine,
    voskEngine,
    engineStatus
  };
};
