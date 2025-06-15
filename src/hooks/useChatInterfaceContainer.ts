
import React from 'react';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition } from '@/hooks/useHybridSpeechRecognition';
import { useChatState } from '@/hooks/useChatState';
import { useChatSpeechConfig } from '@/hooks/useChatSpeechConfig';
import { useChatMessageHandler } from '@/hooks/useChatMessageHandler';
import { useChatActions } from '@/hooks/useChatActions';
import { useChatInterfaceEffects } from '@/hooks/useChatInterfaceEffects';
import { useChatMessageProcessing } from '@/hooks/useChatMessageProcessing';

interface UseChatInterfaceContainerProps {
  currentPersonality: PersonalityId;
  currentGender: Gender;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const useChatInterfaceContainer = ({
  currentPersonality,
  currentGender,
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,
  onLanguageChange
}: UseChatInterfaceContainerProps) => {
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

  // Message processing with integrations
  const {
    processMessage,
    engineState,
    memoryStats,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    ollama,
    getIntegrationManager,
    isIntegrationProcessing
  } = useChatMessageProcessing({ currentPersonality, currentGender });

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak, updateLanguage } = useSpeechSynthesis();

  // Message handling with integrations support
  const { handleSendMessage } = useChatMessageHandler({
    addMessage,
    setInputText,
    processMessage,
    speechEnabled,
    speak,
    onSpeakingChange,
    onEmotionChange,
    currentLanguage: 'fr'
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
    engineStateIsProcessing: engineState.isProcessing || isIntegrationProcessing,
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

  return {
    // State
    messages,
    inputText,
    setInputText,
    showEngineSelector,
    
    // Speech
    isListening,
    isSpeaking,
    speechEnabled,
    currentEngine,
    currentLanguage,
    engineStatus,
    engineInfo,
    vadEnabled,
    vadSupported,
    vadListening,
    bufferStatus,
    
    // Engine state
    engineState,
    memoryStats,
    currentPersonalityId,
    isIntegrationProcessing,
    
    // Ollama
    ollama,
    
    // Handlers
    handleSendMessageWrapper,
    toggleListening,
    setSpeechEnabled,
    toggleEngineSelector,
    switchEngine,
    handleLanguageChange,
    handleResetConversation,
    handleExportConversation,
    toggleVAD,
    getIntegrationManager
  };
};
