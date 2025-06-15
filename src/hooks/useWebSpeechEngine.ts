
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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      webSpeechRef.current = new SpeechRecognitionConstructor();
      
      const recognition = webSpeechRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      
      // Configuration spécifique pour l'arabe
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
        
        // Reset error count on successful result
        errorCount.current = 0;
        
        onResult(transcript);
        onListeningChange(false);
      };

      recognition.onerror = (error: any) => {
        const now = Date.now();
        console.error('❌ Erreur Web Speech:', error.error);
        
        onListeningChange(false);
        
        // Limiter les notifications d'erreur pour éviter le spam
        const timeSinceLastError = now - lastErrorTime.current;
        const shouldShowToast = timeSinceLastError > 5000; // Maximum une notification toutes les 5 secondes
        
        if (error.error === 'no-speech') {
          errorCount.current++;
          
          // Ne montrer la notification que si c'est la première fois ou après plusieurs tentatives
          if (shouldShowToast && errorCount.current <= 2) {
            console.log('⚠️ Web Speech: Aucune parole détectée');
            // Supprimer la notification toast pour "no-speech" - trop fréquente
          }
        } else if (error.error === 'not-allowed') {
          if (shouldShowToast) {
            toast.error("Microphone non autorisé", {
              description: "Autorisez l'accès au microphone dans votre navigateur"
            });
          }
        } else if (error.error === 'language-not-supported') {
          if (shouldShowToast) {
            toast.error("Langue non supportée", {
              description: `${language === 'ar' ? 'L\'arabe' : 'Le français'} n'est pas supporté. Essayez Vosk.`
            });
          }
        } else if (error.error === 'network') {
          if (shouldShowToast) {
            toast.error("Erreur réseau", {
              description: "Connexion internet requise pour Web Speech. Essayez Vosk offline."
            });
          }
        } else if (error.error === 'aborted') {
          console.log('🛑 Web Speech interrompu volontairement');
        } else {
          if (shouldShowToast) {
            toast.error(`Erreur reconnaissance vocale`, {
              description: "Essayez Vosk + VAD pour une meilleure compatibilité"
            });
          }
        }
        
        lastErrorTime.current = now;
      };

      recognition.onend = () => {
        console.log(`🛑 Web Speech terminé (langue: ${recognition.lang})`);
        onListeningChange(false);
      };

      recognition.onstart = () => {
        console.log(`🎤 Web Speech démarré en ${language === 'ar' ? 'arabe (ar-SA)' : 'français (fr-FR)'}`);
        errorCount.current = 0; // Reset error count on new start
      };
    } else {
      console.error('❌ Web Speech API non supporté dans ce navigateur');
    }
  }, [language, continuous, interimResults, onResult, onListeningChange]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current) {
      try {
        console.log(`🎤 Tentative de démarrage Web Speech en ${language}`);
        webSpeechRef.current.start();
        onListeningChange(true);
        return true;
      } catch (error) {
        console.error('❌ Erreur démarrage Web Speech:', error);
        return false;
      }
    } else {
      console.error('❌ Web Speech non initialisé');
      return false;
    }
  }, [language, onListeningChange]);

  const stopListening = useCallback(() => {
    if (webSpeechRef.current) {
      try {
        webSpeechRef.current.stop();
        console.log(`🛑 Web Speech arrêté manuellement (langue: ${language})`);
      } catch (error) {
        console.error('❌ Erreur arrêt Web Speech:', error);
      }
    }
    onListeningChange(false);
  }, [language, onListeningChange]);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    startListening,
    stopListening,
    isSupported
  };
};
