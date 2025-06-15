
import { useEffect, useState, useRef } from 'react';
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
  // Utiliser useRef pour éviter les conflits d'état React
  const engineStatusRef = useRef<'ready' | 'loading' | 'error'>('ready');
  const [engineStatus, setEngineStatusState] = useState<'ready' | 'loading' | 'error'>('ready');

  const setEngineStatus = (status: 'ready' | 'loading' | 'error') => {
    engineStatusRef.current = status;
    setEngineStatusState(status);
  };

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
  }, [currentEngine, currentLanguage]);

  return {
    webSpeechEngine,
    voskEngine,
    engineStatus
  };
};
