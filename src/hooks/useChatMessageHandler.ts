
import { useCallback } from 'react';
import { Message } from '@/types/chat';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage } from '@/types/speechRecognition';
import { toast } from 'sonner';

interface UseChatMessageHandlerProps {
  addMessage: (message: Message) => void;
  setInputText: (text: string) => void;
  processMessage: (text: string, language?: SupportedLanguage) => Promise<string>;
  speechEnabled: boolean;
  speak: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  currentLanguage: SupportedLanguage;
}

export const useChatMessageHandler = ({
  addMessage,
  setInputText,
  processMessage,
  speechEnabled,
  speak,
  onSpeakingChange,
  onEmotionChange,
  currentLanguage
}: UseChatMessageHandlerProps) => {
  const handleSendMessage = useCallback(async (text?: string, inputText?: string) => {
    const messageText = text || inputText?.trim();
    if (!messageText) return;

    console.log(`📝 Traitement du message en ${currentLanguage}: "${messageText}"`);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputText('');

    // Utiliser le moteur de discussion avancé avec la langue spécifiée
    try {
      const response = await processMessage(messageText, currentLanguage);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      addMessage(aiMessage);
      
      // Synthèse vocale de la réponse avec gestion d'interruption
      if (speechEnabled) {
        speak(
          response,
          () => onSpeakingChange(true),
          () => {
            onSpeakingChange(false);
            onEmotionChange('neutral');
          }
        );
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
      toast.error("Erreur", {
        description: "Impossible de traiter votre message. Veuillez réessayer."
      });
    }
  }, [addMessage, setInputText, processMessage, speechEnabled, speak, onSpeakingChange, onEmotionChange, currentLanguage]);

  return { handleSendMessage };
};
