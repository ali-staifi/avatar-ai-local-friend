
import { useEffect } from 'react';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage } from '@/types/speechRecognition';

interface UseChatInterfaceEffectsProps {
  currentPersonality: PersonalityId;
  changePersonality: (personality: PersonalityId) => void;
  currentLanguage: SupportedLanguage;
  updateLanguage: (language: SupportedLanguage) => void;
  currentEngine: string;
  updateSpeechConfig: (engine: string, language: SupportedLanguage) => void;
  isListening: boolean;
  isSpeaking: boolean;
  engineStateIsProcessing: boolean;
  interrupt: () => void;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
  engineStateEmotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
}

export const useChatInterfaceEffects = ({
  currentPersonality,
  changePersonality,
  currentLanguage,
  updateLanguage,
  currentEngine,
  updateSpeechConfig,
  isListening,
  isSpeaking,
  engineStateIsProcessing,
  interrupt,
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,
  onLanguageChange,
  engineStateEmotionalState
}: UseChatInterfaceEffectsProps) => {
  // Update personality when it changes
  useEffect(() => {
    if (currentPersonality) {
      changePersonality(currentPersonality);
    }
  }, [currentPersonality, changePersonality]);

  // Synchronize language changes with parent component
  useEffect(() => {
    onLanguageChange?.(currentLanguage);
  }, [currentLanguage, onLanguageChange]);

  // Synchronize speech synthesis language with recognition language
  useEffect(() => {
    updateLanguage(currentLanguage);
  }, [currentLanguage, updateLanguage]);

  // Interruption handling during speech synthesis
  useEffect(() => {
    if (isListening && (isSpeaking || engineStateIsProcessing)) {
      console.log('🔄 Interruption détectée - arrêt de la synthèse vocale');
      window.speechSynthesis.cancel();
      interrupt();
    }
  }, [isListening, isSpeaking, engineStateIsProcessing, interrupt]);

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
    onEmotionChange(engineStateEmotionalState);
  }, [engineStateEmotionalState, onEmotionChange]);
};
