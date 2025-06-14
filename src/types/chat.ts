
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking') => void;
}
