
import React from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition } from '@/hooks/useHybridSpeechRecognition';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
import { useChatState } from '@/hooks/useChatState';
import { useChatSpeechConfig } from '@/hooks/useChatSpeechConfig';
import { useChatMessageHandler } from '@/hooks/useChatMessageHandler';
import { useChatActions } from '@/hooks/useChatActions';
import { useChatInterfaceEffects } from '@/hooks/useChatInterfaceEffects';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainContent } from '@/components/chat/ChatMainContent';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface ChatInterfaceContainerProps {
  currentPersonality: PersonalityId;
  currentGender: Gender;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const ChatInterfaceContainer: React.FC<ChatInterfaceContainerProps> = ({
  currentPersonality,
  currentGender,
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,
  onLanguageChange
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

  // Discussion engine with gender and Ollama support
  const {
    engineState,
    memoryStats,
    processMessage: processMessageWithPersonality,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    ollama
  } = useDiscussionEngine(currentPersonality, currentGender);

  // Enhanced processMessage that includes language
  const processMessage = React.useCallback(async (text: string, language?: 'fr' | 'ar') => {
    console.log(`🧠 Traitement avec langue: ${language || 'auto'} et genre: ${currentGender}`);
    return await processMessageWithPersonality(text, language);
  }, [processMessageWithPersonality, currentGender]);

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak, updateLanguage } = useSpeechSynthesis();

  // Message handling with language support - needs to be defined before speech recognition
  const { handleSendMessage } = useChatMessageHandler({
    addMessage,
    setInputText,
    processMessage,
    speechEnabled,
    speak,
    onSpeakingChange,
    onEmotionChange,
    currentLanguage: 'fr' // Will be updated by effects
  });

  const handleSpeechResult = React.useCallback((transcript: string) => {
    console.log(`🎤 Transcription reçue (${speechConfig.engine}/${speechConfig.language}):`, transcript);
    setInputText(transcript);
    handleSendMessage(transcript);
  }, [speechConfig, setInputText, handleSendMessage]);

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

  // Handle all effects
  useChatInterfaceEffects({
    currentPersonality,
    changePersonality,
    currentLanguage,
    updateLanguage,
    currentEngine,
    updateSpeechConfig,
    isListening,
    isSpeaking,
    engineStateIsProcessing: engineState.isProcessing,
    interrupt,
    onListeningChange,
    onSpeakingChange,
    onEmotionChange,
    onLanguageChange,
    engineStateEmotionalState: engineState.emotionalState
  });

  const handleSendMessageWrapper = React.useCallback(() => {
    handleSendMessage(undefined, inputText);
  }, [handleSendMessage, inputText]);

  const handleLanguageChange = React.useCallback((language: SupportedLanguage) => {
    switchLanguage(language);
    onLanguageChange?.(language);
  }, [switchLanguage, onLanguageChange]);

  const currentPersonalityData = getCurrentPersonality();
  const currentPersonalityId = currentPersonalityData.id;

  return (
    <div className="flex gap-4 h-full">
      <ChatSidebar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isListening={isListening}
        ollamaAvailable={ollama.isAvailable}
        ollamaModels={ollama.models}
        ollamaLoading={ollama.isLoading}
        ollamaConfig={ollama.config}
        onOllamaConfigUpdate={ollama.updateConfig}
        onRefreshOllamaModels={ollama.refreshModels}
        onCheckOllamaAvailability={ollama.checkAvailability}
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
        onLanguageChange={handleLanguageChange}
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
