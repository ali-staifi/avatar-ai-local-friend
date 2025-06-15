
import React from 'react';
import { ChatInterfaceView } from '@/components/chat/ChatInterfaceView';
import { useChatInterfaceContainer } from '@/hooks/useChatInterfaceContainer';
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

export const ChatInterfaceContainer: React.FC<ChatInterfaceContainerProps> = (props) => {
  const containerState = useChatInterfaceContainer(props);

  return <ChatInterfaceView {...containerState} />;
};
