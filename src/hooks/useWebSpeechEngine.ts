
import { useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SpeechRecognitionInstance, SpeechRecognitionEvent, SupportedLanguage } from '@/types/speechRecognition';

interface UseWebSpeechEngineProps {
  language: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string) => void;
  onListeningChange: (listening: boolean) => void;
}

export const useWebSpeechEngine = ({
  language,
  continuous = false,
  interimResults = false,
  onResult,
  onListeningChange
}: UseWebSpeechEngineProps) => {
  const webSpeechRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      webSpeechRef.current = new SpeechRecognitionConstructor();
      
      const recognition = webSpeechRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language === 'fr' ? 'fr-FR' : 'ar-SA';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        onListeningChange(false);
      };

      recognition.onerror = () => {
        onListeningChange(false);
        toast.error("Erreur de reconnaissance vocale Web Speech", {
          description: "Impossible de capturer l'audio. Essayez Vosk avec VAD."
        });
      };

      recognition.onend = () => {
        onListeningChange(false);
      };
    }
  }, [language, continuous, interimResults, onResult, onListeningChange]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current) {
      try {
        webSpeechRef.current.start();
        onListeningChange(true);
        console.log(`🎤 Web Speech démarré en ${language}`);
        return true;
      } catch (error) {
        console.error('Erreur démarrage Web Speech:', error);
        toast.error("Erreur démarrage", {
          description: "Impossible de démarrer Web Speech API"
        });
        return false;
      }
    }
    return false;
  }, [language, onListeningChange]);

  const stopListening = useCallback(() => {
    if (webSpeechRef.current) {
      webSpeechRef.current.stop();
    }
    onListeningChange(false);
  }, [onListeningChange]);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    startListening,
    stopListening,
    isSupported
  };
};
