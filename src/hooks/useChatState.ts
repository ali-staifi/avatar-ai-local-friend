
import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant avatar AI avec reconnaissance vocale hybride (Web Speech + Vosk offline) et support multilingue français/arabe. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showEngineSelector, setShowEngineSelector] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const resetMessages = useCallback((resetMessage: string) => {
    setMessages([
      {
        id: Date.now().toString(),
        text: resetMessage,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  const toggleEngineSelector = useCallback(() => {
    setShowEngineSelector(!showEngineSelector);
  }, [showEngineSelector]);

  return {
    messages,
    inputText,
    setInputText,
    showEngineSelector,
    addMessage,
    resetMessages,
    toggleEngineSelector
  };
};
