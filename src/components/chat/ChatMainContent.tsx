
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SpeechEngineSelector } from '@/components/speech/SpeechEngineSelector';
import { Message } from '@/types/chat';
import { PersonalityId } from '@/types/personality';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface ChatMainContentProps {
  // Messages and input
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  
  // Speech functionality
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  speechEnabled: boolean;
  onToggleSpeech: (enabled: boolean) => void;
  
  // Engine configuration
  showEngineSelector: boolean;
  onToggleEngineSelector: () => void;
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  onEngineChange: (engine: SpeechEngine) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  engineStatus: 'ready' | 'loading' | 'error';
  engineInfo: any;
  
  // VAD controls
  vadEnabled: boolean;
  onToggleVAD?: () => void;
  vadSupported: boolean;
  vadListening: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
  
  // Chat state and actions
  engineState: any;
  memoryStats: any;
  currentPersonality: PersonalityId;
  onResetConversation: () => void;
  onExportConversation: () => void;
  canBeInterrupted: boolean;
}

export const ChatMainContent: React.FC<ChatMainContentProps> = ({
  messages,
  inputText,
  setInputText,
  onSendMessage,
  isListening,
  isSpeaking,
  onToggleListening,
  speechEnabled,
  onToggleSpeech,
  showEngineSelector,
  onToggleEngineSelector,
  currentEngine,
  currentLanguage,
  onEngineChange,
  onLanguageChange,
  engineStatus,
  engineInfo,
  vadEnabled,
  onToggleVAD,
  vadSupported,
  vadListening,
  bufferStatus,
  engineState,
  memoryStats,
  currentPersonality,
  onResetConversation,
  onExportConversation,
  canBeInterrupted
}) => {
  return (
    <div className="flex-1 space-y-4">
      {showEngineSelector && (
        <SpeechEngineSelector
          currentEngine={currentEngine}
          currentLanguage={currentLanguage}
          onEngineChange={onEngineChange}
          onLanguageChange={onLanguageChange}
          engineInfo={engineInfo}
          isListening={isListening}
          engineStatus={engineStatus}
          vadEnabled={vadEnabled}
          onToggleVAD={onToggleVAD}
          vadSupported={vadSupported}
          vadListening={vadListening}
          bufferStatus={bufferStatus}
        />
      )}

      <Card className="h-full flex flex-col">
        <ChatHeader 
          speechEnabled={speechEnabled}
          onToggleSpeech={onToggleSpeech}
          onResetConversation={onResetConversation}
          onExportConversation={onExportConversation}
          memoryStats={memoryStats}
          engineState={engineState}
          currentPersonality={currentPersonality}
          onToggleEngineSelector={onToggleEngineSelector}
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
            onSendMessage={onSendMessage}
            onToggleListening={onToggleListening}
            isListening={isListening}
            isSpeaking={isSpeaking}
            canBeInterrupted={canBeInterrupted}
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
