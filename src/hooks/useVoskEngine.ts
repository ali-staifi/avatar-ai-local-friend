
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
    console.log(`🎤 Vosk: Traitement segment${audioSegment ? ` (${(audioSegment.length / 16000).toFixed(2)}s)` : ''}`);
    
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
    
    setTimeout(() => {
      const randomResult = mockResults[language][Math.floor(Math.random() * mockResults[language].length)];
      console.log(`✅ Vosk: Transcription: "${randomResult}"`);
      onResult(randomResult);
      onListeningChange(false);
      
      if (audioSegment) {
        toast.success("Transcription VAD+Vosk", {
          description: `Segment analysé automatiquement: ${(audioSegment.length / 16000).toFixed(1)}s`
        });
      }
    }, 500 + Math.random() * 1000);
  }, [language, onResult, onListeningChange]);

  const initializeVosk = useCallback(async () => {
    try {
      setEngineStatus('loading');
      
      if (!voskModelManager.isModelLoaded(language)) {
        toast.info(`Chargement du modèle ${language.toUpperCase()}`, {
          description: "Première utilisation, veuillez patienter..."
        });
        await voskModelManager.loadModel(language);
      }

      console.log(`🎤 Vosk initialisé pour ${language}${vadEnabled ? ' avec VAD' : ''}`);
      setEngineStatus('ready');
      
      toast.success(`Vosk prêt en ${language.toUpperCase()}`, {
        description: `Reconnaissance vocale offline${vadEnabled ? ' avec détection automatique' : ''} disponible`
      });
    } catch (error) {
      console.error('Erreur initialisation Vosk:', error);
      setEngineStatus('error');
      toast.error("Erreur Vosk", {
        description: "Impossible d'initialiser Vosk. Utilisez Web Speech API."
      });
    }
  }, [language, vadEnabled]);

  const startListening = useCallback(async () => {
    onListeningChange(true);
    console.log(`🎤 Vosk démarré en ${language}${vadEnabled ? ' + VAD' : ''}`);
    
    if (!vadEnabled) {
      // Fallback sans VAD pour Vosk (ancienne méthode)
      simulateVoskTranscription();
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
