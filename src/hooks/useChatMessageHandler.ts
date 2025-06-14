
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
  speak: (text: string, onStart?: () => void, onEnd?: () => void, language?: SupportedLanguage) => void;
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
      
      // Synthèse vocale de la réponse avec la langue appropriée
      if (speechEnabled) {
        console.log(`🎤 Synthèse vocale de la réponse en ${currentLanguage}: "${response}"`);
        speak(
          response,
          () => onSpeakingChange(true),
          () => {
            onSpeakingChange(false);
            onEmotionChange('neutral');
          },
          currentLanguage // Passer la langue à la synthèse vocale
        );
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
      const errorMsg = currentLanguage === 'ar' 
        ? "خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى."
        : "Impossible de traiter votre message. Veuillez réessayer.";
      
      toast.error(currentLanguage === 'ar' ? "خطأ" : "Erreur", {
        description: errorMsg
      });
    }
  }, [addMessage, setInputText, processMessage, speechEnabled, speak, onSpeakingChange, onEmotionChange, currentLanguage]);

  return { handleSendMessage };
};
