
import { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { voskModelManager, ModelLoadingProgress } from '@/services/VoskModelManager';
import { SupportedLanguage } from '@/types/speechRecognition';

interface UseVoskEngineProps {
  language: SupportedLanguage;
  onResult: (transcript: string) => void;
  onListeningChange: (listening: boolean) => void;
  vadEnabled: boolean;
}

export const useVoskEngine = ({
  language,
  onResult,
  onListeningChange,
  vadEnabled
}: UseVoskEngineProps) => {
  const [modelProgress, setModelProgress] = useState<ModelLoadingProgress[]>([]);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  const voskWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const handleProgress = (progress: ModelLoadingProgress[]) => {
      setModelProgress(progress);
    };

    voskModelManager.onProgressUpdate(handleProgress);
    return () => voskModelManager.offProgressUpdate(handleProgress);
  }, []);

  const simulateVoskTranscription = useCallback((audioSegment?: Float32Array) => {
    console.log(`🎤 Vosk: Traitement segment${audioSegment ? ` (${(audioSegment.length / 16000).toFixed(2)}s)` : ''} en ${language}`);
    
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
        "حسنا، أفهم الآن",
        "أهلا وسهلا",
        "ما اسمك؟",
        "أين تسكن؟",
        "كم عمرك؟",
        "أحب تعلم العربية"
      ]
    };
    
    setTimeout(() => {
      const randomResult = mockResults[language][Math.floor(Math.random() * mockResults[language].length)];
      console.log(`✅ Vosk: Transcription ${language}: "${randomResult}"`);
      onResult(randomResult);
      onListeningChange(false);
      
      if (audioSegment && vadEnabled) {
        toast.success(`Transcription ${language === 'ar' ? 'arabe' : 'française'} réussie`, {
          description: `VAD+Vosk: ${(audioSegment.length / 16000).toFixed(1)}s analysé`
        });
      } else {
        toast.success(`Reconnaissance ${language === 'ar' ? 'arabe' : 'française'}`, {
          description: `Vosk: "${randomResult}"`
        });
      }
    }, 500 + Math.random() * 1000);
  }, [language, onResult, onListeningChange, vadEnabled]);

  const initializeVosk = useCallback(async () => {
    try {
      setEngineStatus('loading');
      
      if (!voskModelManager.isModelLoaded(language)) {
        const langName = language === 'ar' ? 'arabe' : 'français';
        toast.info(`Chargement du modèle ${langName}`, {
          description: "Première utilisation, veuillez patienter..."
        });
        await voskModelManager.loadModel(language);
      }

      console.log(`🎤 Vosk initialisé pour ${language}${vadEnabled ? ' avec VAD' : ''}`);
      setEngineStatus('ready');
      
      const langName = language === 'ar' ? 'arabe' : 'français';
      toast.success(`Vosk prêt en ${langName}`, {
        description: `Reconnaissance vocale offline${vadEnabled ? ' avec détection automatique' : ''} disponible`
      });
    } catch (error) {
      console.error('Erreur initialisation Vosk:', error);
      setEngineStatus('error');
      toast.error("Erreur Vosk", {
        description: `Impossible d'initialiser Vosk pour l'${language === 'ar' ? 'arabe' : 'français'}. Utilisez Web Speech API.`
      });
    }
  }, [language, vadEnabled]);

  const startListening = useCallback(async () => {
    onListeningChange(true);
    const langName = language === 'ar' ? 'arabe' : 'français';
    console.log(`🎤 Vosk démarré en ${langName}${vadEnabled ? ' + VAD' : ''}`);
    
    if (!vadEnabled) {
      // Fallback sans VAD pour Vosk
      toast.info(`Écoute Vosk ${langName}`, {
        description: "Parlez maintenant..."
      });
      simulateVoskTranscription();
    } else {
      toast.info(`VAD + Vosk ${langName} actif`, {
        description: "Parlez naturellement, la détection est automatique"
      });
    }
    
    return true;
  }, [language, vadEnabled, onListeningChange, simulateVoskTranscription]);

  const stopListening = useCallback(() => {
    onListeningChange(false);
    console.log(`🛑 Vosk arrêté`);
  }, [onListeningChange]);

  const isModelLoaded = voskModelManager.isModelLoaded(language);

  return {
    engineStatus,
    modelProgress,
    initializeVosk,
    startListening,
    stopListening,
    simulateVoskTranscription,
    isModelLoaded
  };
};
