
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
        console.error('❌ Erreur Web Speech complète:', {
          error: error.error,
          message: error.message,
          type: error.type,
          isTrusted: error.isTrusted,
          language: recognition.lang,
          timestamp: new Date().toISOString()
        });
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
        } else if (error.error === 'network') {
          toast.error("Erreur réseau", {
            description: `Connexion internet requise pour Web Speech en ${language === 'ar' ? 'arabe' : 'français'}. Essayez Vosk offline.`
          });
        } else if (error.error === 'aborted') {
          console.log('🛑 Web Speech interrompu volontairement');
        } else {
          toast.error(`Erreur Web Speech (${error.error || 'inconnue'})`, {
            description: `Problème avec ${language === 'ar' ? 'l\'arabe' : 'le français'}. Essayez Vosk + VAD pour une meilleure compatibilité.`
          });
        }
      };

      recognition.onend = () => {
        console.log(`🛑 Web Speech terminé (langue: ${recognition.lang})`);
        onListeningChange(false);
      };

      recognition.onstart = () => {
        console.log(`🎤 Web Speech démarré en ${language === 'ar' ? 'arabe (ar-SA)' : 'français (fr-FR)'}`);
      };
    } else {
      console.error('❌ Web Speech API non supporté dans ce navigateur');
    }
  }, [language, continuous, interimResults, onResult, onListeningChange]);

  const startListening = useCallback(() => {
    if (webSpeechRef.current) {
      try {
        console.log(`🎤 Tentative de démarrage Web Speech en ${language} (${webSpeechRef.current.lang})`);
        webSpeechRef.current.start();
        onListeningChange(true);
        
        if (language === 'ar') {
          toast.info("Reconnaissance vocale arabe", {
            description: "Parlez clairement en arabe. Support navigateur variable - Vosk + VAD recommandé."
          });
        }
        
        return true;
      } catch (error) {
        console.error('❌ Erreur démarrage Web Speech:', {
          error,
          language,
          navigatorLanguage: navigator.language,
          timestamp: new Date().toISOString()
        });
        toast.error("Erreur démarrage", {
          description: `Impossible de démarrer Web Speech en ${language === 'ar' ? 'arabe' : 'français'}. Essayez Vosk + VAD.`
        });
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
