
import React, { useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition } from '@/hooks/useHybridSpeechRecognition';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
import { useChatState } from '@/hooks/useChatState';
import { useChatSpeechConfig } from '@/hooks/useChatSpeechConfig';
import { useChatMessageHandler } from '@/hooks/useChatMessageHandler';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SpeechEngineSelector } from '@/components/speech/SpeechEngineSelector';
import { ChatInterfaceProps } from '@/types/chat';
import { PersonalityId } from '@/types/personality';

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
  // Chat state management
  const {
    messages,
    inputText,
    setInputText,
    showEngineSelector,
    addMessage,
    resetMessages,
    toggleEngineSelector
  } = useChatState();

  // Speech configuration
  const { speechConfig, updateSpeechConfig } = useChatSpeechConfig();

  // Discussion engine
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

  // Update personality when it changes
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

  // Hybrid speech recognition
  const {
    isListening,
    toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine,
    switchLanguage,
    engineStatus,
    engineInfo,
    vadEnabled,
    toggleVAD,
    vadSupported,
    vadListening,
    bufferStatus
  } = useHybridSpeechRecognition(handleSpeechResult, {
    engine: speechConfig.engine,
    language: speechConfig.language,
    vadEnabled: true
  });

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak } = useSpeechSynthesis();

  // Message handling
  const { handleSendMessage } = useChatMessageHandler({
    addMessage,
    setInputText,
    processMessage,
    speechEnabled,
    speak,
    onSpeakingChange,
    onEmotionChange
  });

  // Chat actions
  const { handleResetConversation, handleExportConversation } = useChatActions({
    resetConversation,
    getConversationExport,
    getCurrentPersonality,
    resetMessages,
    currentPersonality,
    currentLanguage,
    currentEngine,
    engineInfo
  });

  // Interruption handling during speech synthesis
  useEffect(() => {
    if (isListening && (isSpeaking || engineState.isProcessing)) {
      console.log('🔄 Interruption détectée - arrêt de la synthèse vocale');
      window.speechSynthesis.cancel();
      interrupt();
    }
  }, [isListening, isSpeaking, engineState.isProcessing, interrupt]);

  // Synchronize speech config
  useEffect(() => {
    updateSpeechConfig(currentEngine, currentLanguage);
  }, [currentEngine, currentLanguage, updateSpeechConfig]);

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

  const handleSendMessageWrapper = useCallback(() => {
    handleSendMessage(undefined, inputText);
  }, [handleSendMessage, inputText]);

  return (
    <div className="space-y-4">
      {showEngineSelector && (
        <SpeechEngineSelector
          currentEngine={currentEngine}
          currentLanguage={currentLanguage}
          onEngineChange={switchEngine}
          onLanguageChange={switchLanguage}
          engineInfo={engineInfo}
          isListening={isListening}
          engineStatus={engineStatus}
          vadEnabled={vadEnabled}
          onToggleVAD={toggleVAD}
          vadSupported={vadSupported}
          vadListening={vadListening}
          bufferStatus={bufferStatus}
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
          onToggleEngineSelector={toggleEngineSelector}
          showEngineSelector={showEngineSelector}
          speechEngine={currentEngine}
          speechLanguage={currentLanguage}
          speechEngineStatus={engineStatus}
          vadSupported={vadSupported}
        />
        
        <CardContent className="flex-1 flex flex-col gap-4">
          <MessageList 
            messages={messages}
            isThinking={engineState.isProcessing}
          />

          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessageWrapper}
            onToggleListening={toggleListening}
            isListening={isListening}
            isSpeaking={isSpeaking}
            canBeInterrupted={engineState.canBeInterrupted}
            currentEngine={currentEngine}
            engineStatus={engineStatus}
            currentLanguage={currentLanguage}
            vadEnabled={vadEnabled}
            vadSupported={vadSupported}
            vadListening={vadListening}
            bufferStatus={bufferStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};
