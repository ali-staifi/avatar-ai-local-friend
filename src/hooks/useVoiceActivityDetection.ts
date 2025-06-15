
import { useRef, useEffect, useState, useCallback } from 'react';
import { VoiceActivityDetector, VADResult, VADOptions } from '@/services/VoiceActivityDetector';

interface VADHookOptions extends Partial<VADOptions> {
  enabled?: boolean;
  onVoiceSegmentDetected?: (audioSegment: Float32Array) => void;
}

export const useVoiceActivityDetection = (options: VADHookOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [bufferStatus, setBufferStatus] = useState({
    bufferUsage: 0,
    isInVoiceSegment: false,
    voiceDuration: 0,
    silenceDuration: 0
  });
  
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  // Initialisation stable
  useEffect(() => {
    if (options.enabled !== false && !isInitializingRef.current && !vadRef.current) {
      isInitializingRef.current = true;
      
      const vadOptions = {
        sampleRate: 16000,
        frameSize: 30,
        aggressiveness: 1,
        bufferDuration: 3000,
        silenceThreshold: 2000,
        voiceThreshold: 200,
        ...options
      };

      vadRef.current = new VoiceActivityDetector(vadOptions);
      
      vadRef.current.initialize().then((success) => {
        if (success) {
          setIsInitialized(true);
          console.log('✅ VAD initialisé');
        } else {
          console.error('❌ Échec VAD');
        }
        isInitializingRef.current = false;
      }).catch((error) => {
        console.error('❌ Erreur VAD:', error);
        isInitializingRef.current = false;
      });
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [options.enabled]);

  // Configuration des callbacks une seule fois
  useEffect(() => {
    if (vadRef.current && options.onVoiceSegmentDetected && isInitialized) {
      const handleVoiceDetected = (result: VADResult) => {
        if (result.isVoice && result.audioSegment.length > 0) {
          console.log(`🎤 Segment vocal détecté: ${result.audioSegment.length} échantillons`);
          options.onVoiceSegmentDetected?.(result.audioSegment);
        }
      };

      vadRef.current.onVoiceDetected(handleVoiceDetected);

      return () => {
        if (vadRef.current) {
          vadRef.current.offVoiceDetected(handleVoiceDetected);
        }
      };
    }
  }, [options.onVoiceSegmentDetected, isInitialized]);

  const startListening = useCallback(async () => {
    if (!vadRef.current || !isInitialized || isListeningRef.current) {
      return false;
    }

    try {
      await vadRef.current.startListening();
      setIsListening(true);
      isListeningRef.current = true;
      console.log('🎤 VAD démarré');
      return true;
    } catch (error) {
      console.error('❌ Erreur VAD:', error);
      return false;
    }
  }, [isInitialized]);

  const stopListening = useCallback(() => {
    if (vadRef.current && isListeningRef.current) {
      vadRef.current.stopListening();
      setIsListening(false);
      isListeningRef.current = false;
      setBufferStatus({
        bufferUsage: 0,
        isInVoiceSegment: false,
        voiceDuration: 0,
        silenceDuration: 0
      });
      console.log('🛑 VAD arrêté');
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isInitialized,
    isListening,
    bufferStatus,
    startListening,
    stopListening,
    toggleListening,
    vadSupported: isInitialized
  };
};
