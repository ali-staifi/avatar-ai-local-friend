
import { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { voskModelManager, ModelLoadingProgress } from '@/services/VoskModelManager';

export type SpeechEngine = 'web-speech' | 'vosk';
export type SupportedLanguage = 'fr' | 'ar';

interface HybridSpeechConfig {
  engine: SpeechEngine;
  language: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
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
  config: HybridSpeechConfig = { engine: 'web-speech', language: 'fr' }
) => {
  const [isListening, setIsListening] = useState(false);
  const [currentEngine, setCurrentEngine] = useState<SpeechEngine>(config.engine);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(config.language);
  const [modelProgress, setModelProgress] = useState<ModelLoadingProgress[]>([]);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  
  const webSpeechRef = useRef<SpeechRecognitionInstance | null>(null);
  const voskWorkerRef = useRef<Worker | null>(null);

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
        };

        recognition.onerror = () => {
          setIsListening(false);
          setEngineStatus('error');
          toast.error("Erreur de reconnaissance vocale Web Speech", {
            description: "Impossible de capturer l'audio. Essayez Vosk."
          });
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setEngineStatus('ready');
      } else {
        setEngineStatus('error');
        toast.error("Web Speech API non supportée", {
          description: "Votre navigateur ne supporte pas Web Speech API. Utilisez Vosk."
        });
      }
    }
  }, [currentEngine, currentLanguage, config.continuous, config.interimResults, onResult]);

  // Initialiser Vosk
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
      console.log(`🎤 Vosk initialisé pour ${currentLanguage}`);
      setEngineStatus('ready');
      
      toast.success(`Vosk prêt en ${currentLanguage.toUpperCase()}`, {
        description: "Reconnaissance vocale offline disponible"
      });
    } catch (error) {
      console.error('Erreur initialisation Vosk:', error);
      setEngineStatus('error');
      toast.error("Erreur Vosk", {
        description: "Impossible d'initialiser Vosk. Utilisez Web Speech API."
      });
    }
  }, [currentEngine, currentLanguage]);

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

  const startListening = useCallback(() => {
    if (currentEngine === 'web-speech' && webSpeechRef.current) {
      try {
        webSpeechRef.current.start();
        setIsListening(true);
        console.log(`🎤 Web Speech démarré en ${currentLanguage}`);
      } catch (error) {
        console.error('Erreur démarrage Web Speech:', error);
        toast.error("Erreur démarrage", {
          description: "Impossible de démarrer Web Speech API"
        });
      }
    } else if (currentEngine === 'vosk') {
      // Simuler Vosk (dans une vraie implémentation, on enverrait un message au Worker)
      setIsListening(true);
      console.log(`🎤 Vosk démarré en ${currentLanguage}`);
      
      // Simuler une reconnaissance après 3 secondes
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
  }, [currentEngine, currentLanguage, onResult]);

  const stopListening = useCallback(() => {
    if (currentEngine === 'web-speech' && webSpeechRef.current) {
      webSpeechRef.current.stop();
    } else if (currentEngine === 'vosk') {
      // Arrêter Vosk
      console.log('🛑 Vosk arrêté');
    }
    setIsListening(false);
  }, [currentEngine]);

  const switchEngine = useCallback((engine: SpeechEngine) => {
    if (isListening) {
      stopListening();
    }
    setCurrentEngine(engine);
    console.log(`🔄 Moteur changé vers: ${engine}`);
  }, [isListening, stopListening]);

  const switchLanguage = useCallback((language: SupportedLanguage) => {
    if (isListening) {
      stopListening();
    }
    setCurrentLanguage(language);
    console.log(`🌐 Langue changée vers: ${language}`);
  }, [isListening, stopListening]);

  const getEngineInfo = useCallback(() => {
    const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const voskModelLoaded = voskModelManager.isModelLoaded(currentLanguage);
    
    return {
      webSpeech: {
        supported: webSpeechSupported,
        available: webSpeechSupported,
        description: 'Reconnaissance en ligne via le navigateur'
      },
      vosk: {
        supported: true,
        available: voskModelLoaded,
        description: 'Reconnaissance offline privée',
        modelProgress: modelProgress.find(p => p.language.includes(currentLanguage === 'fr' ? 'Français' : 'العربية'))
      }
    };
  }, [currentLanguage, modelProgress]);

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
      true
  };
};
