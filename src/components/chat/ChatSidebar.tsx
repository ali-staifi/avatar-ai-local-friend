
import React from 'react';
import { LanguageSelector } from '@/components/speech/LanguageSelector';
import { OllamaSelector } from '@/components/ollama/OllamaSelector';
import { SupportedLanguage } from '@/types/speechRecognition';
import { OllamaModel, OllamaConfig } from '@/hooks/useOllama';

interface ChatSidebarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  isListening: boolean;
  // Nouvelles props Ollama
  ollamaAvailable?: boolean;
  ollamaModels?: OllamaModel[];
  ollamaLoading?: boolean;
  ollamaConfig?: OllamaConfig;
  onOllamaConfigUpdate?: (updates: Partial<OllamaConfig>) => void;
  onRefreshOllamaModels?: () => void;
  onCheckOllamaAvailability?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentLanguage,
  onLanguageChange,
  isListening,
  ollamaAvailable = false,
  ollamaModels = [],
  ollamaLoading = false,
  ollamaConfig,
  onOllamaConfigUpdate,
  onRefreshOllamaModels,
  onCheckOllamaAvailability
}) => {
  return (
    <div className="w-80 flex-shrink-0 space-y-4">
      <LanguageSelector
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        isListening={isListening}
      />
      
      {/* Sélecteur Ollama */}
      {onOllamaConfigUpdate && ollamaConfig && (
        <OllamaSelector
          isAvailable={ollamaAvailable}
          models={ollamaModels}
          isLoading={ollamaLoading}
          config={ollamaConfig}
          onConfigUpdate={onOllamaConfigUpdate}
          onRefreshModels={onRefreshOllamaModels || (() => {})}
          onCheckAvailability={onCheckOllamaAvailability || (() => {})}
        />
      )}
    </div>
  );
};
