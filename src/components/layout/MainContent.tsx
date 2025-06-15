
import React from 'react';
import { AvatarSection } from '@/components/layout/AvatarSection';
import { ChatInterface } from '@/components/ChatInterface';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface MainContentProps {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  emotion: 'neutral' | 'happy' | 'thinking' | 'listening';
  setEmotion: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  currentPersonality: PersonalityId;
  setCurrentPersonality: (personality: PersonalityId) => void;
  currentGender: Gender;
  currentLanguage: SupportedLanguage;
  setCurrentLanguage: (language: SupportedLanguage) => void;
  getCurrentState: () => 'listening' | 'speaking' | 'thinking' | 'ready';
  getGenderDisplayText: (gender: Gender) => string;
}

export const MainContent: React.FC<MainContentProps> = ({
  isListening,
  setIsListening,
  isSpeaking,
  setIsSpeaking,
  emotion,
  setEmotion,
  currentPersonality,
  setCurrentPersonality,
  currentGender,
  currentLanguage,
  setCurrentLanguage,
  getCurrentState,
  getGenderDisplayText
}) => {
  return (
    <main id="main-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]" role="main">
      <AvatarSection
        isListening={isListening}
        isSpeaking={isSpeaking}
        emotion={emotion}
        currentPersonality={currentPersonality}
        currentGender={currentGender}
        currentLanguage={currentLanguage}
        getCurrentState={getCurrentState}
        getGenderDisplayText={getGenderDisplayText}
      />

      <section id="chat-interface" className="chat-interface" aria-label="Interface de conversation">
        <ChatInterface
          onListeningChange={setIsListening}
          onSpeakingChange={setIsSpeaking}
          onEmotionChange={setEmotion}
          onPersonalityChange={setCurrentPersonality}
          currentPersonality={currentPersonality}
          currentGender={currentGender}
          onLanguageChange={setCurrentLanguage}
        />
      </section>
    </main>
  );
};
