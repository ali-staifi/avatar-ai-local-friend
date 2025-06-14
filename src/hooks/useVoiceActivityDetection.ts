
import { useRef, useEffect, useState, useCallback } from 'react';
import { VoiceActivityDetector, VADResult, VADOptions } from '@/services/VoiceActivityDetector';
import { toast } from 'sonner';

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

  // Initialiser le VAD
  useEffect(() => {
    if (options.enabled !== false) {
      vadRef.current = new VoiceActivityDetector(options);
      
      vadRef.current.initialize().then((success) => {
        if (success) {
          setIsInitialized(true);
          console.log('✅ VAD hook initialisé');
        } else {
          console.error('❌ Échec initialisation VAD hook');
          toast.error("Erreur VAD", {
            description: "Impossible d'initialiser la détection vocale"
          });
        }
      });
    }

    return () => {
      if (vadRef.current) {
        vadRef.current.destroy();
        vadRef.current = null;
      }
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [options.enabled]);

  // Configurer les callbacks pour les segments vocaux
  useEffect(() => {
    if (vadRef.current && options.onVoiceSegmentDetected) {
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
        if (vadRef.current) {
          setBufferStatus(vadRef.current.getBufferStatus());
        }
      }, 100); // Update every 100ms

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
      toast.error("VAD non disponible", {
        description: "Le système de détection vocale n'est pas initialisé"
      });
      return false;
    }

    try {
      await vadRef.current.startListening();
      setIsListening(true);
      console.log('🎤 VAD écoute démarrée');
      
      toast.success("Détection vocale active", {
        description: "Le système analyse votre voix automatiquement"
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur démarrage VAD:', error);
      toast.error("Erreur microphone", {
        description: "Impossible d'accéder au microphone pour la détection vocale"
      });
      return false;
    }
  }, [isInitialized]);

  const stopListening = useCallback(() => {
    if (vadRef.current) {
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
