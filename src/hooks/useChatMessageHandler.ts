
import { useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import { PersonalityId } from '@/types/personality';
import { conversationMetrics } from '@/services/ConversationMetrics';
import { accessibilityManager } from '@/services/AccessibilityManager';

interface UseChatMessageHandlerProps {
  addMessage: (message: Message) => void;
  setInputText: (text: string) => void;
  processMessage: (text: string, language?: 'fr' | 'ar', files?: FileList | File[]) => Promise<string>;
  speechEnabled: boolean;
  speak: (text: string) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  currentLanguage: string;
  currentPersonality?: PersonalityId;
}

export const useChatMessageHandler = ({
  addMessage,
  setInputText,
  processMessage,
  speechEnabled,
  speak,
  onSpeakingChange,
  onEmotionChange,
  currentLanguage,
  currentPersonality = 'friendly'
}: UseChatMessageHandlerProps) => {
  const processingRef = useRef(false);

  const handleSendMessage = useCallback(async (transcript?: string, manualInput?: string, files?: FileList | File[]) => {
    const messageText = transcript || manualInput;
    
    if (!messageText?.trim() || processingRef.current) return;

    processingRef.current = true;
    
    try {
      // Démarrer le timer pour les métriques
      conversationMetrics.startResponseTimer();
      
      // Annoncer le début du traitement
      accessibilityManager.announce('Traitement de votre message en cours');
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        isUser: true,
        timestamp: new Date()
      };

      addMessage(userMessage);
      if (!transcript) {
        setInputText('');
      }

      onEmotionChange('thinking');

      const response = await processMessage(
        messageText.trim(), 
        currentLanguage as 'fr' | 'ar',
        files
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      addMessage(assistantMessage);

      // Enregistrer les métriques
      conversationMetrics.recordResponse(
        currentPersonality,
        response.length,
        undefined, // Intent sera ajouté plus tard si disponible
        undefined  // Emotion sera ajoutée plus tard si disponible
      );

      // Annoncer la réponse pour les lecteurs d'écran
      accessibilityManager.announce(`Réponse reçue: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);

      if (speechEnabled) {
        onSpeakingChange(true);
        speak(response);
      }

      onEmotionChange('happy');
      setTimeout(() => onEmotionChange('neutral'), 2000);

    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      accessibilityManager.announce(`Erreur lors du traitement: ${errorMessage}`, 'assertive');
      
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Désolé, j'ai rencontré une erreur : ${errorMessage}`,
        isUser: false,
        timestamp: new Date()
      };

      addMessage(errorAssistantMessage);
      onEmotionChange('neutral');
    } finally {
      processingRef.current = false;
    }
  }, [addMessage, setInputText, processMessage, speechEnabled, speak, onSpeakingChange, onEmotionChange, currentLanguage, currentPersonality]);

  return { handleSendMessage };
};
