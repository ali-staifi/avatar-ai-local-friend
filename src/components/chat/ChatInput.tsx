
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  canBeInterrupted?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleListening,
  isListening,
  isSpeaking,
  canBeInterrupted = true
}) => {
  return (
    <div className="flex gap-2">
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={
          isListening 
            ? "🎤 Écoute en cours..." 
            : isSpeaking 
              ? "🔊 Assistant en train de parler..." 
              : "Tapez votre message ou utilisez le micro..."
        }
        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
        disabled={isListening}
      />
      
      <Button
        variant={isListening ? "destructive" : "outline"}
        onClick={onToggleListening}
        disabled={isSpeaking && !canBeInterrupted}
        title={
          isListening 
            ? "Arrêter l'écoute" 
            : isSpeaking 
              ? canBeInterrupted 
                ? "Interrompre et écouter" 
                : "Veuillez patienter..." 
              : "Commencer l'écoute vocale"
        }
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : isSpeaking && canBeInterrupted ? (
          <StopCircle className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        onClick={onSendMessage}
        disabled={!inputText.trim() || isListening}
        title="Envoyer le message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
