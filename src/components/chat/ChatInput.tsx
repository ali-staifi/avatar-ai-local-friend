
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, StopCircle, Loader2, AlertTriangle, Activity } from 'lucide-react';
import { SpeechEngine } from '@/hooks/useHybridSpeechRecognition';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  canBeInterrupted?: boolean;
  // Props pour le système hybride
  currentEngine?: SpeechEngine;
  engineStatus?: 'ready' | 'loading' | 'error';
  currentLanguage?: string;
  // Nouvelles props VAD
  vadEnabled?: boolean;
  vadSupported?: boolean;
  vadListening?: boolean;
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
  canBeInterrupted = true,
  currentEngine = 'web-speech',
  engineStatus = 'ready',
  currentLanguage = 'fr',
  vadEnabled = false,
  vadSupported = false,
  vadListening = false,
  bufferStatus
}) => {
  const getPlaceholderText = () => {
    if (isListening && vadEnabled && vadListening) {
      const statusText = bufferStatus?.isInVoiceSegment ? '🗣️ Parole détectée' : '👂 En écoute VAD';
      return `${statusText} (${currentEngine === 'vosk' ? 'Vosk' : 'Web Speech'})...`;
    }
    if (isListening) {
      return `🎤 Écoute en cours (${currentEngine === 'vosk' ? 'Vosk' : 'Web Speech'})...`;
    }
    if (isSpeaking) {
      return "🔊 Assistant en train de parler...";
    }
    if (engineStatus === 'loading') {
      return `⏳ Chargement du moteur ${currentEngine}...`;
    }
    if (engineStatus === 'error') {
      return `❌ Erreur moteur ${currentEngine} - Tapez votre message`;
    }
    
    const engineName = currentEngine === 'vosk' ? 'Vosk (privé)' : 'Web Speech';
    const langName = currentLanguage === 'fr' ? '🇫🇷' : '🇸🇦';
    const vadStatus = vadEnabled && vadSupported ? ' + VAD' : '';
    return `Tapez votre message ou utilisez ${engineName}${vadStatus} ${langName}...`;
  };

  const getMicIcon = () => {
    if (engineStatus === 'loading') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (engineStatus === 'error') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (isListening) {
      return <MicOff className="h-4 w-4" />;
    }
    if (isSpeaking && canBeInterrupted) {
      return <StopCircle className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  const getMicButtonVariant = () => {
    if (engineStatus === 'error') {
      return "destructive";
    }
    if (isListening) {
      return "destructive";
    }
    if (engineStatus === 'loading') {
      return "secondary";
    }
    return "outline";
  };

  const getMicButtonTitle = () => {
    if (engineStatus === 'loading') {
      return `Chargement ${currentEngine}...`;
    }
    if (engineStatus === 'error') {
      return `Erreur ${currentEngine} - Changez de moteur`;
    }
    if (isListening) {
      return `Arrêter l'écoute ${currentEngine}${vadEnabled ? ' + VAD' : ''}`;
    }
    if (isSpeaking) {
      return canBeInterrupted 
        ? "Interrompre et écouter" 
        : "Veuillez patienter...";
    }
    
    const engineName = currentEngine === 'vosk' ? 'Vosk (privé)' : 'Web Speech';
    const langName = currentLanguage === 'fr' ? 'français' : 'arabe';
    const vadStatus = vadEnabled && vadSupported ? ' avec détection automatique' : '';
    return `Démarrer l'écoute ${engineName}${vadStatus} en ${langName}`;
  };

  const getVADStatusBadge = () => {
    if (!vadEnabled || !vadSupported || !vadListening) return null;

    const variant = bufferStatus?.isInVoiceSegment ? "default" : "secondary";
    const text = bufferStatus?.isInVoiceSegment ? "Voix" : "Silence";
    
    return (
      <Badge variant={variant} className="text-xs flex items-center gap-1">
        <Activity className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  return (
    <div className="space-y-2">
      {/* Statut VAD si actif */}
      {vadEnabled && vadSupported && vadListening && bufferStatus && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {getVADStatusBadge()}
            <span>Buffer: {Math.round(bufferStatus.bufferUsage)}%</span>
          </div>
          {bufferStatus.isInVoiceSegment && (
            <span>Parole: {Math.round(bufferStatus.voiceDuration / 1000)}s</span>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getPlaceholderText()}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={isListening}
          className={engineStatus === 'error' ? 'border-destructive' : ''}
        />
        
        <Button
          variant={getMicButtonVariant()}
          onClick={onToggleListening}
          disabled={
            (isSpeaking && !canBeInterrupted) || 
            (engineStatus === 'loading')
          }
          title={getMicButtonTitle()}
          className={isListening ? 'animate-pulse' : ''}
        >
          {getMicIcon()}
        </Button>
        
        <Button 
          onClick={onSendMessage}
          disabled={!inputText.trim() || isListening}
          title="Envoyer le message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
