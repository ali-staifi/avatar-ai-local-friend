
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

  // Initialiser le VAD
  useEffect(() => {
    if (options.enabled !== false && !isInitializingRef.current) {
      isInitializingRef.current = true;
      
      // Configuration VAD optimisée pour meilleure détection
      const vadOptions = {
        sampleRate: 16000,
        frameSize: 30,
        aggressiveness: 1, // Moins agressif pour éviter les coupures
        bufferDuration: 3000,
        silenceThreshold: 2000, // Plus tolérant au silence
        voiceThreshold: 200, // Plus sensible à la voix
        ...options
      };

      vadRef.current = new VoiceActivityDetector(vadOptions);
      
      vadRef.current.initialize().then((success) => {
        if (success) {
          setIsInitialized(true);
          console.log('✅ VAD hook initialisé avec succès');
        } else {
          console.error('❌ Échec initialisation VAD hook');
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
      if (vadRef.current) {
        vadRef.current.destroy();
        vadRef.current = null;
      }
    };
  }, [options.enabled]);

  // Configurer les callbacks pour les segments vocaux
  useEffect(() => {
    if (vadRef.current && options.onVoiceSegmentDetected && isInitialized) {
      const handleVoiceDetected = (result: VADResult) => {
        if (result.isVoice && result.audioSegment.length > 0) {
          console.log(`🎤 Segment vocal détecté: ${result.audioSegment.length} échantillons, confiance: ${result.confidence}`);
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

  // Surveiller le statut du buffer
  useEffect(() => {
    if (isListening && vadRef.current) {
      statusIntervalRef.current = setInterval(() => {
        if (vadRef.current && isListening) {
          setBufferStatus(vadRef.current.getBufferStatus());
        }
      }, 500);

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      };
    }
  }, [isListening]);

  const startListening = useCallback(async () => {
    if (!vadRef.current || !isInitialized) {
      console.warn('⚠️ VAD non disponible pour démarrage');
      return false;
    }

    try {
      await vadRef.current.startListening();
      setIsListening(true);
      console.log('🎤 VAD écoute démarrée avec succès');
      
      // REMOVED: Automatic notification that was obstructing the chat
      // User specifically requested this removal
      return true;
    } catch (error) {
      console.error('❌ Erreur démarrage VAD:', error);
      return false;
    }
  }, [isInitialized]);

  const stopListening = useCallback(() => {
    if (vadRef.current && isListening) {
      vadRef.current.stopListening();
      setIsListening(false);
      setBufferStatus({
        bufferUsage: 0,
        isInVoiceSegment: false,
        voiceDuration: 0,
        silenceDuration: 0
      });
      console.log('🛑 VAD écoute arrêtée');
    }
  }, [isListening]);

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
