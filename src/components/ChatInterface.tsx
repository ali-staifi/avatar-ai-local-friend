
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
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
      text: 'Bonjour ! Je suis votre assistant avatar AI local avec mémoire conversationnelle avancée. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Utiliser le nouveau moteur de discussion
  const {
    engineState,
    memoryStats,
    processMessage,
    interrupt,
    resetConversation,
    getConversationExport
  } = useDiscussionEngine();

  const handleSpeechResult = useCallback((transcript: string) => {
    setInputText(transcript);
    handleSendMessage(transcript);
  }, []);

  const { isListening, toggleListening } = useSpeechRecognition(handleSpeechResult);
  
  const { isSpeaking, speechEnabled, setSpeechEnabled, speak } = useSpeechSynthesis();

  // Gestion de l'interruption pendant la synthèse vocale
  useEffect(() => {
    if (isListening && (isSpeaking || engineState.isProcessing)) {
      console.log('🔄 Interruption détectée - arrêt de la synthèse vocale');
      window.speechSynthesis.cancel();
      interrupt();
    }
  }, [isListening, isSpeaking, engineState.isProcessing, interrupt]);

  // Update parent component when states change
  useEffect(() => {
    onListeningChange(isListening);
  }, [isListening, onListeningChange]);

  useEffect(() => {
    onSpeakingChange(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  useEffect(() => {
    onEmotionChange(engineState.emotionalState);
  }, [engineState.emotionalState, onEmotionChange]);

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

    // Utiliser le moteur de discussion avancé
    try {
      console.log('🎯 Envoi du message au moteur de discussion');
      const response = await processMessage(messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
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
  }, [inputText, speechEnabled, speak, onSpeakingChange, onEmotionChange, processMessage]);

  const handleResetConversation = useCallback(() => {
    resetConversation();
    setMessages([
      {
        id: Date.now().toString(),
        text: 'Conversation réinitialisée ! Je suis prêt pour une nouvelle discussion.',
        isUser: false,
        timestamp: new Date()
      }
    ]);
    toast.success("Conversation réinitialisée", {
      description: "La mémoire conversationnelle a été effacée."
    });
  }, [resetConversation]);

  const handleExportConversation = useCallback(() => {
    const exportData = getConversationExport();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conversation_${exportData.conversationId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Conversation exportée", {
      description: "Le fichier de conversation a été téléchargé."
    });
  }, [getConversationExport]);

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        speechEnabled={speechEnabled}
        onToggleSpeech={setSpeechEnabled}
        onResetConversation={handleResetConversation}
        onExportConversation={handleExportConversation}
        memoryStats={memoryStats}
        engineState={engineState}
      />
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <MessageList 
          messages={messages}
          isThinking={engineState.isProcessing}
        />

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={() => handleSendMessage()}
          onToggleListening={toggleListening}
          isListening={isListening}
          isSpeaking={isSpeaking}
          canBeInterrupted={engineState.canBeInterrupted}
        />
      </CardContent>
    </Card>
  );
};
