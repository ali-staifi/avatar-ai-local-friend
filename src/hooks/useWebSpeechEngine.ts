
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
  const lastErrorTime = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const isListeningRef = useRef<boolean>(false);
  const initializationRef = useRef<boolean>(false);

  // Initialisation stable une seule fois
  useEffect(() => {
    if (initializationRef.current) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      webSpeechRef.current = new SpeechRecognitionConstructor();
      
      const recognition = webSpeechRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      
      // Configuration de la langue une seule fois
      recognition.lang = language === 'ar' ? 'ar-SA' : 'fr-FR';
      console.log(`🌐 Web Speech initialisé pour: ${recognition.lang}`);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log(`✅ Web Speech résultat: "${transcript}"`);
        
        errorCount.current = 0;
        
        onResult(transcript);
        onListeningChange(false);
        isListeningRef.current = false;
      };

      recognition.onerror = (error: any) => {
        const now = Date.now();
        console.error('❌ Erreur Web Speech:', error.error);
        
        onListeningChange(false);
        isListeningRef.current = false;
        
        const timeSinceLastError = now - lastErrorTime.current;
        const shouldShowToast = timeSinceLastError > 3000;
        
        if (error.error === 'no-speech') {
          errorCount.current++;
          console.log('⚠️ Aucune parole détectée');
        } else if (error.error === 'not-allowed' && shouldShowToast) {
          toast.error("Microphone non autorisé", {
            description: "Autorisez l'accès au microphone dans votre navigateur"
          });
        } else if (error.error === 'network' && shouldShowToast) {
          toast.error("Erreur réseau", {
            description: "Connexion internet requise"
          });
        }
        
        lastErrorTime.current = now;
      };

      recognition.onend = () => {
        console.log('🛑 Web Speech terminé');
        onListeningChange(false);
        isListeningRef.current = false;
      };

      recognition.onstart = () => {
        console.log(`🎤 Web Speech démarré`);
        errorCount.current = 0;
        isListeningRef.current = true;
      };
      
      initializationRef.current = true;
    }
  }, []); // Pas de dépendances pour éviter les re-initialisations

  // Mise à jour de la langue uniquement si nécessaire
  useEffect(() => {
    if (webSpeechRef.current && initializationRef.current) {
      const newLang = language === 'ar' ? 'ar-SA' : 'fr-FR';
      if (webSpeechRef.current.lang !== newLang) {
        webSpeechRef.current.lang = newLang;
        console.log(`🌐 Langue mise à jour: ${newLang}`);
      }
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current && !isListeningRef.current) {
      try {
        webSpeechRef.current.start();
        onListeningChange(true);
        isListeningRef.current = true;
        return true;
      } catch (error) {
        console.error('❌ Erreur démarrage:', error);
        onListeningChange(false);
        isListeningRef.current = false;
        return false;
      }
    }
    return false;
  }, [onListeningChange]);

  const stopListening = useCallback(() => {
    if (webSpeechRef.current && isListeningRef.current) {
      try {
        webSpeechRef.current.stop();
      } catch (error) {
        console.error('❌ Erreur arrêt:', error);
      }
    }
    onListeningChange(false);
    isListeningRef.current = false;
  }, [onListeningChange]);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    startListening,
    stopListening,
    isSupported
  };
};
