
import { useCallback } from 'react';
import { SupportedLanguage } from '@/types/speechRecognition';

interface UseChatInterfaceCallbacksProps {
  speechConfig: { engine: string; language: SupportedLanguage };
  setInputText: (text: string) => void;
  handleSendMessage: (text?: string, inputText?: string) => void;
  switchLanguage: (language: SupportedLanguage) => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
  inputText: string;
}

export const useChatInterfaceCallbacks = ({
  speechConfig,
  setInputText,
  handleSendMessage: originalHandleSendMessage,
  switchLanguage,
  onLanguageChange,
  inputText
}: UseChatInterfaceCallbacksProps) => {
  const handleSpeechResult = useCallback((transcript: string) => {
    console.log(`🎤 Transcription reçue (${speechConfig.engine}/${speechConfig.language}):`, transcript);
    setInputText(transcript);
    originalHandleSendMessage(transcript);
  }, [speechConfig, setInputText, originalHandleSendMessage]);

  const handleSendMessageWrapper = useCallback(() => {
    originalHandleSendMessage(undefined, inputText);
  }, [originalHandleSendMessage, inputText]);

  const handleLanguageChange = useCallback((language: SupportedLanguage) => {
    switchLanguage(language);
    onLanguageChange?.(language);
  }, [switchLanguage, onLanguageChange]);

  return {
    handleSpeechResult,
    handleSendMessageWrapper,
    handleLanguageChange
  };
};
