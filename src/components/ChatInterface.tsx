
import React from 'react';
import { ChatInterfaceContainer } from '@/components/chat/ChatInterfaceContainer';
import { ChatInterfaceProps } from '@/types/chat';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface ExtendedChatInterfaceProps extends ChatInterfaceProps {
  currentPersonality?: PersonalityId;
  currentGender?: Gender;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const ChatInterface: React.FC<ExtendedChatInterfaceProps> = ({
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,  
  onPersonalityChange,
  currentPersonality = 'friendly',
  currentGender = 'male',
  onLanguageChange
}) => {
  return (
    <ChatInterfaceContainer
      currentPersonality={currentPersonality}
      currentGender={currentGender}
      onListeningChange={onListeningChange}
      onSpeakingChange={onSpeakingChange}
      onEmotionChange={onEmotionChange}
      onLanguageChange={onLanguageChange}
    />
  );
};
