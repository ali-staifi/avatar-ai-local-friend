
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition, SpeechEngine, SupportedLanguage } from '@/hooks/useHybridSpeechRecognition';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SpeechEngineSelector } from '@/components/speech/SpeechEngineSelector';
import { Message, ChatInterfaceProps } from '@/types/chat';
import { PersonalityId } from '@/types/personality';
import { toast } from 'sonner';

interface ExtendedChatInterfaceProps extends ChatInterfaceProps {
  currentPersonality?: PersonalityId;
}

export const ChatInterface: React.FC<ExtendedChatInterfaceProps> = ({
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,
  onPersonalityChange,
  currentPersonality = 'friendly'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant avatar AI avec reconnaissance vocale hybride (Web Speech + Vosk offline) et support multilingue français/arabe. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showEngineSelector, setShowEngineSelector] = useState(false);

  // Configuration initiale du moteur hybride
  const [speechConfig, setSpeechConfig] = useState<{
    engine: SpeechEngine;
    language: SupportedLanguage;
  }>({
    engine: 'web-speech',
    language: 'fr'
  });

  // Utiliser le nouveau moteur de discussion avec personnalité
  const {
    engineState,
    memoryStats,
    processMessage,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality
  } = useDiscussionEngine(currentPersonality);

  // Mettre à jour la personnalité quand elle change
  useEffect(() => {
    if (currentPersonality) {
      changePersonality(currentPersonality);
    }
  }, [currentPersonality, changePersonality]);

  const handleSpeechResult = useCallback((transcript: string) => {
    console.log(`🎤 Transcription reçue (${speechConfig.engine}/${speechConfig.language}):`, transcript);
    setInputText(transcript);
    handleSendMessage(transcript);
  }, [speechConfig]);

  // Utiliser le hook hybride
  const {
    isListening,
    toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine,
    switchLanguage,
    engineStatus,
    engineInfo
  } = useHybridSpeechRecognition(handleSpeechResult, {
    engine: speechConfig.engine,
    language: speechConfig.language
  });

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak } = useSpeechSynthesis();

  // Gestion de l'interruption pendant la synthèse vocale
  useEffect(() => {
    if (isListening && (isSpeaking || engineState.isProcessing)) {
      console.log('🔄 Interruption détectée - arrêt de la synthèse vocale');
      window.speechSynthesis.cancel();
      interrupt();
    }
  }, [isListening, isSpeaking, engineState.isProcessing, interrupt]);

  // Synchroniser les états
  useEffect(() => {
    setSpeechConfig({ engine: currentEngine, language: currentLanguage });
  }, [currentEngine, currentLanguage]);

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

    // Utiliser le moteur de discussion avancé avec personnalité
    try {
      console.log('🎯 Envoi du message au moteur de discussion avec personnalité:', getCurrentPersonality().name);
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
  }, [inputText, speechEnabled, speak, onSpeakingChange, onEmotionChange, processMessage, getCurrentPersonality]);

  const handleResetConversation = useCallback(() => {
    resetConversation(currentPersonality);
    const personality = getCurrentPersonality();
    setMessages([
      {
        id: Date.now().toString(),
        text: `Conversation réinitialisée avec la personnalité ${personality.name} ! ${personality.speechPattern[0]} Je suis prêt pour une nouvelle discussion en ${currentLanguage === 'fr' ? 'français' : 'arabe'}.`,
        isUser: false,
        timestamp: new Date()
      }
    ]);
    toast.success("Conversation réinitialisée", {
      description: `Nouvelle conversation avec ${personality.name} en ${currentLanguage === 'fr' ? 'français' : 'arabe'}.`
    });
  }, [resetConversation, currentPersonality, getCurrentPersonality, currentLanguage]);

  const handleExportConversation = useCallback(() => {
    const exportData = {
      ...getConversationExport(),
      speechConfig: {
        engine: currentEngine,
        language: currentLanguage,
        engineInfo
      }
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conversation_${exportData.conversationId}_${currentEngine}_${currentLanguage}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Conversation exportée", {
      description: "Le fichier de conversation avec config vocale a été téléchargé."
    });
  }, [getConversationExport, currentEngine, currentLanguage, engineInfo]);

  return (
    <div className="space-y-4">
      {/* Sélecteur de moteur de reconnaissance (collapsible) */}
      {showEngineSelector && (
        <SpeechEngineSelector
          currentEngine={currentEngine}
          currentLanguage={currentLanguage}
          onEngineChange={switchEngine}
          onLanguageChange={switchLanguage}
          engineInfo={engineInfo}
          isListening={isListening}
          engineStatus={engineStatus}
        />
      )}

      <Card className="h-full flex flex-col">
        <ChatHeader 
          speechEnabled={speechEnabled}
          onToggleSpeech={setSpeechEnabled}
          onResetConversation={handleResetConversation}
          onExportConversation={handleExportConversation}
          memoryStats={memoryStats}
          engineState={engineState}
          currentPersonality={getCurrentPersonality()}
          // Nouvelles props pour le système hybride
          onToggleEngineSelector={() => setShowEngineSelector(!showEngineSelector)}
          showEngineSelector={showEngineSelector}
          speechEngine={currentEngine}
          speechLanguage={currentLanguage}
          speechEngineStatus={engineStatus}
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
            currentEngine={currentEngine}
            engineStatus={engineStatus}
            currentLanguage={currentLanguage}
          />
        </CardContent>
      </Card>
    </div>
  );
};
