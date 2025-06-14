
import React, { useCallback, useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition } from '@/hooks/useHybridSpeechRecognition';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
import { useChatState } from '@/hooks/useChatState';
import { useChatSpeechConfig } from '@/hooks/useChatSpeechConfig';
import { useChatMessageHandler } from '@/hooks/useChatMessageHandler';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainContent } from '@/components/chat/ChatMainContent';
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

  // Discussion engine with language support
  const {
    engineState,
    memoryStats,
    processMessage: processMessageWithPersonality,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality
  } = useDiscussionEngine(currentPersonality);

  // Enhanced processMessage that includes language
  const processMessage = useCallback(async (text: string, language?: 'fr' | 'ar') => {
    console.log(`🧠 Traitement avec langue: ${language || 'auto'}`);
    return await processMessageWithPersonality(text, language);
  }, [processMessageWithPersonality]);

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

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak, updateLanguage } = useSpeechSynthesis();

  // Synchroniser la langue de synthèse vocale avec celle de reconnaissance
  useEffect(() => {
    updateLanguage(currentLanguage);
  }, [currentLanguage, updateLanguage]);

  // Message handling with language support
  const { handleSendMessage } = useChatMessageHandler({
    addMessage,
    setInputText,
    processMessage,
    speechEnabled,
    speak,
    onSpeakingChange,
    onEmotionChange,
    currentLanguage
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

  const currentPersonalityData = getCurrentPersonality();
  const currentPersonalityId = currentPersonalityData.id;

  return (
    <div className="flex gap-4 h-full">
      <ChatSidebar
        currentLanguage={currentLanguage}
        onLanguageChange={switchLanguage}
        isListening={isListening}
      />

      <ChatMainContent
        messages={messages}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessageWrapper}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleListening={toggleListening}
        speechEnabled={speechEnabled}
        onToggleSpeech={setSpeechEnabled}
        showEngineSelector={showEngineSelector}
        onToggleEngineSelector={toggleEngineSelector}
        currentEngine={currentEngine}
        currentLanguage={currentLanguage}
        onEngineChange={switchEngine}
        onLanguageChange={switchLanguage}
        engineStatus={engineStatus}
        engineInfo={engineInfo}
        vadEnabled={vadEnabled}
        onToggleVAD={toggleVAD}
        vadSupported={vadSupported}
        vadListening={vadListening}
        bufferStatus={bufferStatus}
        engineState={engineState}
        memoryStats={memoryStats}
        currentPersonality={currentPersonalityId}
        onResetConversation={handleResetConversation}
        onExportConversation={handleExportConversation}
        canBeInterrupted={engineState.canBeInterrupted}
      />
    </div>
  );
};
