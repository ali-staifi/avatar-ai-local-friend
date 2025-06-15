import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  canBeInterrupted: boolean;
  currentEngine: SpeechEngine;
  engineStatus: 'ready' | 'loading' | 'error';
  currentLanguage: SupportedLanguage;
  vadEnabled: boolean;
  vadSupported: boolean;
  vadListening: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleListening,
  isListening,
  isSpeaking,
  canBeInterrupted,
  currentEngine,
  engineStatus,
  currentLanguage,
  vadEnabled,
  vadSupported,
  vadListening,
  bufferStatus
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const shortcuts = [
    {
      key: 'l',
      ctrlKey: true,
      action: onToggleListening,
      description: isListening ? 'Arrêter la reconnaissance vocale' : 'Démarrer la reconnaissance vocale'
    },
    {
      key: 'Enter',
      action: onSendMessage,
      description: 'Envoyer le message',
    }
  ];

  useKeyboardShortcuts({ shortcuts });

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background" role="region" aria-label="Zone de saisie de message">
      <div className="flex-1 relative">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message... (Entrée pour envoyer, Ctrl+L pour activer le micro)"
          className="min-h-[60px] resize-none pr-12"
          disabled={isSpeaking && !canBeInterrupted}
          aria-label="Champ de saisie du message"
          aria-describedby="input-help typing-indicator"
          aria-live="polite"
          ref={textareaRef}
        />
        
        <div id="input-help" className="sr-only">
          Saisissez votre message et appuyez sur Entrée pour l'envoyer. 
          Utilisez Ctrl+L pour activer la reconnaissance vocale.
          {isListening && " Reconnaissance vocale active, parlez maintenant."}
          {isSpeaking && !canBeInterrupted && " L'assistant parle actuellement."}
        </div>

        {(isListening || isSpeaking) && (
          <div 
            id="typing-indicator" 
            className="absolute bottom-2 right-2"
            aria-live="polite"
            aria-label={isListening ? "Écoute en cours" : "Synthèse vocale active"}
          >
            <div className="flex items-center gap-1">
              {isListening && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="sr-only">Reconnaissance vocale active</span>
                </>
              )}
              {isSpeaking && (
                <>
                  <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="sr-only">Synthèse vocale en cours</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          onClick={onToggleListening}
          size="sm"
          variant={isListening ? "destructive" : "outline"}
          disabled={isSpeaking && !canBeInterrupted}
          className="h-10 w-10"
          aria-label={isListening ? "Arrêter la reconnaissance vocale" : "Démarrer la reconnaissance vocale"}
          aria-describedby="mic-status"
          aria-pressed={isListening}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <div id="mic-status" className="sr-only">
          État du microphone: {isListening ? "actif" : "inactif"}. 
          Moteur: {currentEngine}, Langue: {currentLanguage}.
          {vadEnabled && vadSupported && ` Détection d'activité vocale: ${vadListening ? "active" : "inactive"}`}
        </div>

        <Button
          onClick={onSendMessage}
          size="sm"
          disabled={!inputText.trim() || (isSpeaking && !canBeInterrupted)}
          className="h-10 w-10"
          aria-label="Envoyer le message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* VAD Status for screen readers */}
      {vadEnabled && vadSupported && bufferStatus && (
        <div className="sr-only" aria-live="polite">
          {bufferStatus.isInVoiceSegment && "Parole détectée"}
        </div>
      )}
    </div>
  );
};
