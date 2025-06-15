
import React from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainContent } from '@/components/chat/ChatMainContent';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage, SpeechEngine } from '@/types/speechRecognition';
import { Message } from '@/types/chat';
import { OllamaConfig, OllamaModel } from '@/hooks/useOllama';
import { IntegrationManager } from '@/services/IntegrationManager';

interface ChatInterfaceViewProps {
  // State
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  showEngineSelector: boolean;
  
  // Speech
  isListening: boolean;
  isSpeaking: boolean;
  speechEnabled: boolean;
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  engineStatus: 'ready' | 'loading' | 'error';
  engineInfo: any;
  vadEnabled: boolean;
  vadSupported: boolean;
  vadListening: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
  
  // Engine state
  engineState: any;
  memoryStats: any;
  currentPersonalityId: PersonalityId;
  isIntegrationProcessing: boolean;
  
  // Ollama
  ollama: {
    isAvailable: boolean;
    models: OllamaModel[];
    isLoading: boolean;
    config: OllamaConfig;
    updateConfig: (config: Partial<OllamaConfig>) => void;
    refreshModels: () => void;
    checkAvailability: () => void;
  };
  
  // Handlers
  handleSendMessageWrapper: () => void;
  toggleListening: () => void;
  setSpeechEnabled: (enabled: boolean) => void;
  toggleEngineSelector: () => void;
  switchEngine: (engine: SpeechEngine) => void;
  handleLanguageChange: (language: SupportedLanguage) => void;
  handleResetConversation: () => void;
  handleExportConversation: () => void;
  toggleVAD?: () => void;
  getIntegrationManager: () => IntegrationManager;
}

export const ChatInterfaceView: React.FC<ChatInterfaceViewProps> = ({
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
}) => {
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
        integrationManager={getIntegrationManager()}
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
        isIntegrationProcessing={isIntegrationProcessing}
      />
    </div>
  );
};
