
import React from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SupportedLanguage } from '@/types/speechRecognition';

interface ChatSidebarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  isListening: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentLanguage,
  onLanguageChange,
  isListening
}) => {
  return (
    <div className="w-80 flex-shrink-0">
      <LanguageSelector
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        disabled={isListening}
      />
    </div>
  );
};
