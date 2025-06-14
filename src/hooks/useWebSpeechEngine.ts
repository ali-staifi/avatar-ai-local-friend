
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
      
      // Configuration spécifique pour l'arabe
      if (language === 'ar') {
        recognition.lang = 'ar-SA'; // Arabe saoudien comme langue principale
        console.log('🌐 Web Speech configuré pour l\'arabe (ar-SA)');
      } else {
        recognition.lang = 'fr-FR';
        console.log('🌐 Web Speech configuré pour le français (fr-FR)');
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log(`✅ Web Speech résultat (${recognition.lang}): "${transcript}"`);
        onResult(transcript);
        onListeningChange(false);
      };

      recognition.onerror = (error: any) => {
        console.error('❌ Erreur Web Speech:', error);
        onListeningChange(false);
        
        if (error.error === 'no-speech') {
          toast.warning("Aucune parole détectée", {
            description: `Parlez clairement en ${language === 'ar' ? 'arabe' : 'français'}`
          });
        } else if (error.error === 'not-allowed') {
          toast.error("Microphone non autorisé", {
            description: "Autorisez l'accès au microphone dans votre navigateur"
          });
        } else if (error.error === 'language-not-supported') {
          toast.error("Langue non supportée", {
            description: `${language === 'ar' ? 'L\'arabe' : 'Le français'} n'est pas supporté par votre navigateur. Essayez Vosk.`
          });
        } else {
          toast.error("Erreur de reconnaissance vocale", {
            description: `Impossible de capturer l'audio en ${language === 'ar' ? 'arabe' : 'français'}. Essayez Vosk avec VAD.`
          });
        }
      };

      recognition.onend = () => {
        console.log('🛑 Web Speech terminé');
        onListeningChange(false);
      };

      recognition.onstart = () => {
        console.log(`🎤 Web Speech démarré en ${language === 'ar' ? 'arabe' : 'français'}`);
      };
    }
  }, [language, continuous, interimResults, onResult, onListeningChange]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current) {
      try {
        webSpeechRef.current.start();
        onListeningChange(true);
        console.log(`🎤 Web Speech démarré en ${language}`);
        
        if (language === 'ar') {
          toast.info("Reconnaissance vocale arabe", {
            description: "Parlez clairement en arabe. Si ça ne fonctionne pas, utilisez Vosk + VAD."
          });
        }
        
        return true;
      } catch (error) {
        console.error('Erreur démarrage Web Speech:', error);
        toast.error("Erreur démarrage", {
          description: `Impossible de démarrer Web Speech en ${language === 'ar' ? 'arabe' : 'français'}. Essayez Vosk avec VAD.`
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
