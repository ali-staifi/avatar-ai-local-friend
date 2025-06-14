
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleListening,
  isListening,
  isSpeaking
}) => {
  return (
    <div className="flex gap-2">
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Tapez votre message..."
        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
        disabled={isListening || isSpeaking}
      />
      
      <Button
        variant={isListening ? "destructive" : "outline"}
        onClick={onToggleListening}
        disabled={isSpeaking}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      <Button 
        onClick={onSendMessage}
        disabled={!inputText.trim() || isListening || isSpeaking}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
