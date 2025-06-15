
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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      webSpeechRef.current = new SpeechRecognitionConstructor();
      
      const recognition = webSpeechRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      
      // Configuration optimisée du microphone
      if (language === 'ar') {
        recognition.lang = 'ar-SA';
        console.log('🌐 Web Speech configuré pour l\'arabe (ar-SA)');
      } else {
        recognition.lang = 'fr-FR';
        console.log('🌐 Web Speech configuré pour le français (fr-FR)');
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log(`✅ Web Speech résultat (${recognition.lang}): "${transcript}"`);
        
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
          // Supprimer les notifications pour "no-speech"
          console.log('⚠️ Aucune parole détectée - continuez à parler');
        } else if (error.error === 'not-allowed') {
          if (shouldShowToast) {
            toast.error("Microphone non autorisé", {
              description: "Cliquez sur l'icône microphone dans la barre d'adresse pour autoriser l'accès"
            });
          }
        } else if (error.error === 'network') {
          if (shouldShowToast) {
            toast.error("Erreur réseau", {
              description: "Connexion internet requise pour Web Speech"
            });
          }
        } else if (error.error !== 'aborted') {
          if (shouldShowToast) {
            toast.error("Erreur reconnaissance vocale", {
              description: "Essayez de parler plus fort ou changez de moteur"
            });
          }
        }
        
        lastErrorTime.current = now;
      };

      recognition.onend = () => {
        console.log(`🛑 Web Speech terminé (langue: ${recognition.lang})`);
        onListeningChange(false);
        isListeningRef.current = false;
      };

      recognition.onstart = () => {
        console.log(`🎤 Web Speech démarré en ${language === 'ar' ? 'arabe (ar-SA)' : 'français (fr-FR)'}`);
        errorCount.current = 0;
        isListeningRef.current = true;
      };
    } else {
      console.error('❌ Web Speech API non supporté dans ce navigateur');
    }
  }, [language, continuous, interimResults, onResult, onListeningChange]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current && !isListeningRef.current) {
      try {
        console.log(`🎤 Démarrage Web Speech en ${language}`);
        webSpeechRef.current.start();
        onListeningChange(true);
        isListeningRef.current = true;
        return true;
      } catch (error) {
        console.error('❌ Erreur démarrage Web Speech:', error);
        onListeningChange(false);
        isListeningRef.current = false;
        return false;
      }
    } else {
      console.warn('⚠️ Web Speech déjà en cours ou non initialisé');
      return false;
    }
  }, [language, onListeningChange]);

  const stopListening = useCallback(() => {
    if (webSpeechRef.current && isListeningRef.current) {
      try {
        webSpeechRef.current.stop();
        console.log(`🛑 Web Speech arrêté manuellement (langue: ${language})`);
      } catch (error) {
        console.error('❌ Erreur arrêt Web Speech:', error);
      }
    }
    onListeningChange(false);
    isListeningRef.current = false;
  }, [language, onListeningChange]);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    startListening,
    stopListening,
    isSupported
  };
};
