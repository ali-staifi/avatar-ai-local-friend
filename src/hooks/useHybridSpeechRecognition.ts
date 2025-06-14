import { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { voskModelManager, ModelLoadingProgress } from '@/services/VoskModelManager';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';

export type SpeechEngine = 'web-speech' | 'vosk';
export type SupportedLanguage = 'fr' | 'ar';

interface HybridSpeechConfig {
  engine: SpeechEngine;
  language: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  vadEnabled?: boolean; // Nouvelle option pour VAD
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export const useHybridSpeechRecognition = (
  onResult: (transcript: string) => void,
  config: HybridSpeechConfig = { engine: 'web-speech', language: 'fr', vadEnabled: true }
) => {
  const [isListening, setIsListening] = useState(false);
  const [currentEngine, setCurrentEngine] = useState<SpeechEngine>(config.engine);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(config.language);
  const [modelProgress, setModelProgress] = useState<ModelLoadingProgress[]>([]);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  const [vadEnabled, setVadEnabled] = useState(config.vadEnabled ?? true);
  
  const webSpeechRef = useRef<SpeechRecognitionInstance | null>(null);
  const voskWorkerRef = useRef<Worker | null>(null);

  // VAD integration pour améliorer la reconnaissance
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
    bufferDuration: 3000, // 3 secondes de buffer
    silenceThreshold: 800, // 800ms de silence
    voiceThreshold: 300, // 300ms de voix
    onVoiceSegmentDetected: (audioSegment: Float32Array) => {
      console.log(`🎯 VAD: Segment vocal détecté (${audioSegment.length} échantillons)`);
      // Ici on pourrait envoyer le segment directement à Vosk ou Whisper
      // Pour cette démo, on simule une transcription
      if (currentEngine === 'vosk' && audioSegment.length > 0) {
        simulateVoskTranscription(audioSegment);
      }
    }
  });

  // Surveiller les progrès de chargement des modèles Vosk
  useEffect(() => {
    const handleProgress = (progress: ModelLoadingProgress[]) => {
      setModelProgress(progress);
    };

    voskModelManager.onProgressUpdate(handleProgress);
    return () => voskModelManager.offProgressUpdate(handleProgress);
  }, []);

  // Initialiser Web Speech API
  useEffect(() => {
    if (currentEngine === 'web-speech') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        webSpeechRef.current = new SpeechRecognitionConstructor();
        
        const recognition = webSpeechRef.current;
        recognition.continuous = config.continuous || false;
        recognition.interimResults = config.interimResults || false;
        recognition.lang = currentLanguage === 'fr' ? 'fr-FR' : 'ar-SA';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
          setIsListening(false);
          // Arrêter VAD si actif
          if (vadEnabled && vadListening) {
            stopVAD();
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setEngineStatus('error');
          if (vadEnabled && vadListening) {
            stopVAD();
          }
          toast.error("Erreur de reconnaissance vocale Web Speech", {
            description: "Impossible de capturer l'audio. Essayez Vosk avec VAD."
          });
        };

        recognition.onend = () => {
          setIsListening(false);
          if (vadEnabled && vadListening) {
            stopVAD();
          }
        };

        setEngineStatus('ready');
      } else {
        setEngineStatus('error');
        toast.error("Web Speech API non supportée", {
          description: "Votre navigateur ne supporte pas Web Speech API. Utilisez Vosk avec VAD."
        });
      }
    }
  }, [currentEngine, currentLanguage, config.continuous, config.interimResults, onResult, vadEnabled, vadListening, stopVAD]);

  // Simuler la transcription Vosk avec les segments VAD
  const simulateVoskTranscription = useCallback((audioSegment: Float32Array) => {
    // En production, on enverrait le segment audio à Vosk
    console.log(`🎤 Vosk: Traitement segment (${(audioSegment.length / 16000).toFixed(2)}s)`);
    
    const mockResults = {
      fr: [
        "Bonjour, comment allez-vous ?", 
        "Pouvez-vous m'aider avec ça ?", 
        "C'est parfait, merci beaucoup",
        "Je voudrais savoir comment faire",
        "D'accord, je comprends maintenant"
      ],
      ar: [
        "مرحبا، كيف حالك؟", 
        "هل يمكنك مساعدتي؟", 
        "شكرا جزيلا لك",
        "أريد أن أعرف كيف أفعل هذا",
        "حسنا، أفهم الآن"
      ]
    };
    
    // Simuler un délai de traitement réaliste
    setTimeout(() => {
      const randomResult = mockResults[currentLanguage][Math.floor(Math.random() * mockResults[currentLanguage].length)];
      console.log(`✅ Vosk: Transcription via VAD: "${randomResult}"`);
      onResult(randomResult);
      setIsListening(false);
      
      toast.success("Transcription VAD+Vosk", {
        description: `Segment analysé automatiquement: ${(audioSegment.length / 16000).toFixed(1)}s`
      });
    }, 500 + Math.random() * 1000);
  }, [currentLanguage, onResult]);

  const initializeVosk = useCallback(async () => {
    if (currentEngine !== 'vosk') return;

    try {
      setEngineStatus('loading');
      
      if (!voskModelManager.isModelLoaded(currentLanguage)) {
        toast.info(`Chargement du modèle ${currentLanguage.toUpperCase()}`, {
          description: "Première utilisation, veuillez patienter..."
        });
        await voskModelManager.loadModel(currentLanguage);
      }

      // Simuler l'initialisation du worker Vosk
      // Dans une vraie implémentation, on créerait un Worker avec vosk-browser
      console.log(`🎤 Vosk initialisé pour ${currentLanguage}${vadEnabled ? ' avec VAD' : ''}`);
      setEngineStatus('ready');
      
      toast.success(`Vosk prêt en ${currentLanguage.toUpperCase()}`, {
        description: `Reconnaissance vocale offline${vadEnabled ? ' avec détection automatique' : ''} disponible`
      });
    } catch (error) {
      console.error('Erreur initialisation Vosk:', error);
      setEngineStatus('error');
      toast.error("Erreur Vosk", {
        description: "Impossible d'initialiser Vosk. Utilisez Web Speech API."
      });
    }
  }, [currentEngine, currentLanguage, vadEnabled]);

  useEffect(() => {
    if (currentEngine === 'vosk') {
      initializeVosk();
    }
  }, [currentEngine, initializeVosk]);

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
  }, [isListening, engineStatus]);

  const startListening = useCallback(async () => {
    if (currentEngine === 'web-speech' && webSpeechRef.current) {
      try {
        webSpeechRef.current.start();
        setIsListening(true);
        console.log(`🎤 Web Speech démarré en ${currentLanguage}${vadEnabled ? ' (VAD disponible)' : ''}`);
        
        // Démarrer VAD en parallèle si activé
        if (vadEnabled && vadSupported && !vadListening) {
          await startVAD();
        }
      } catch (error) {
        console.error('Erreur démarrage Web Speech:', error);
        toast.error("Erreur démarrage", {
          description: "Impossible de démarrer Web Speech API"
        });
      }
    } else if (currentEngine === 'vosk') {
      setIsListening(true);
      console.log(`🎤 Vosk + VAD démarré en ${currentLanguage}`);
      
      if (vadEnabled && vadSupported) {
        const success = await startVAD();
        if (!success) {
          setIsListening(false);
          return;
        }
        
        toast.success("Vosk + VAD actif", {
          description: "Parlez naturellement, les segments sont détectés automatiquement"
        });
      } else {
        // Fallback sans VAD pour Vosk (ancienne méthode)
        setTimeout(() => {
          const mockResults = {
            fr: ["Bonjour, comment allez-vous ?", "Pouvez-vous m'aider ?", "Merci beaucoup"],
            ar: ["مرحبا، كيف حالك؟", "هل يمكنك مساعدتي؟", "شكرا جزيلا"]
          };
          const randomResult = mockResults[currentLanguage][Math.floor(Math.random() * mockResults[currentLanguage].length)];
          onResult(randomResult);
          setIsListening(false);
        }, 3000);
      }
    }
  }, [currentEngine, currentLanguage, onResult, vadEnabled, vadSupported, vadListening, startVAD]);

  const stopListening = useCallback(() => {
    if (currentEngine === 'web-speech' && webSpeechRef.current) {
      webSpeechRef.current.stop();
    }
    
    // Arrêter VAD si actif
    if (vadEnabled && vadListening) {
      stopVAD();
    }
    
    setIsListening(false);
    console.log(`🛑 ${currentEngine} ${vadEnabled ? '+ VAD' : ''} arrêté`);
  }, [currentEngine, vadEnabled, vadListening, stopVAD]);

  const switchEngine = useCallback((engine: SpeechEngine) => {
    if (isListening) {
      stopListening();
    }
    setCurrentEngine(engine);
    console.log(`🔄 Moteur changé vers: ${engine}${vadEnabled ? ' (VAD activé)' : ''}`);
  }, [isListening, stopListening, vadEnabled]);

  const switchLanguage = useCallback((language: SupportedLanguage) => {
    if (isListening) {
      stopListening();
    }
    setCurrentLanguage(language);
    console.log(`🌐 Langue changée vers: ${language}`);
  }, [isListening, stopListening]);

  const toggleVAD = useCallback(() => {
    if (isListening) {
      toast.warning("Arrêtez l'écoute d'abord", {
        description: "Impossible de changer VAD pendant l'écoute"
      });
      return;
    }
    
    setVadEnabled(!vadEnabled);
    console.log(`🎯 VAD ${!vadEnabled ? 'activé' : 'désactivé'}`);
    
    toast.success(`VAD ${!vadEnabled ? 'activé' : 'désactivé'}`, {
      description: !vadEnabled 
        ? "Détection automatique des segments vocaux" 
        : "Détection manuelle classique"
    });
  }, [vadEnabled, isListening]);

  const getEngineInfo = useCallback(() => {
    const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const voskModelLoaded = voskModelManager.isModelLoaded(currentLanguage);
    
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
        modelProgress: modelProgress.find(p => p.language.includes(currentLanguage === 'fr' ? 'Français' : 'العربية'))
      },
      vad: {
        supported: vadSupported,
        enabled: vadEnabled,
        status: vadListening ? 'listening' : 'ready',
        bufferStatus
      }
    };
  }, [currentLanguage, modelProgress, vadSupported, vadEnabled, vadListening, bufferStatus]);

  return {
    isListening,
    toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine,
    switchLanguage,
    engineStatus,
    engineInfo: getEngineInfo(),
    modelProgress,
    isSupported: currentEngine === 'web-speech' ? 
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window :
      true,
    // Nouvelles fonctionnalités VAD
    vadEnabled,
    toggleVAD,
    vadSupported,
    vadListening,
    bufferStatus
  };
};
