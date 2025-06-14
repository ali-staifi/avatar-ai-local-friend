
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { generateResponse } from '@/utils/messageGenerator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { Message, ChatInterfaceProps } from '@/types/chat';
import { toast } from 'sonner';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onListeningChange,
  onSpeakingChange,
  onEmotionChange
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant avatar AI local. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSpeechResult = useCallback((transcript: string) => {
    setInputText(transcript);
    handleSendMessage(transcript);
  }, []);

  const { isListening, toggleListening } = useSpeechRecognition(handleSpeechResult);
  
  const { isSpeaking, speechEnabled, setSpeechEnabled, speak } = useSpeechSynthesis();

  // Update parent component when states change
  useEffect(() => {
    onListeningChange(isListening);
  }, [isListening, onListeningChange]);

  useEffect(() => {
    onSpeakingChange(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Générer la réponse de l'IA
    try {
      setIsThinking(true);
      onEmotionChange('thinking');
      
      const response = await generateResponse(messageText);
      
      setIsThinking(false);
      onEmotionChange('happy');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Synthèse vocale de la réponse
      if (speechEnabled) {
        speak(
          response,
          () => onSpeakingChange(true),
          () => {
            onSpeakingChange(false);
            onEmotionChange('neutral');
          }
        );
      } else {
        onEmotionChange('neutral');
      }
    } catch (error) {
      setIsThinking(false);
      onEmotionChange('neutral');
      console.error('Erreur lors de la génération de la réponse:', error);
      toast.error("Erreur", {
        description: "Impossible de générer une réponse. Veuillez réessayer."
      });
    }
  }, [inputText, speechEnabled, speak, onSpeakingChange, onEmotionChange]);

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        speechEnabled={speechEnabled}
        onToggleSpeech={setSpeechEnabled}
      />
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <MessageList 
          messages={messages}
          isThinking={isThinking}
        />

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={() => handleSendMessage()}
          onToggleListening={toggleListening}
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </CardContent>
    </Card>
  );
};
