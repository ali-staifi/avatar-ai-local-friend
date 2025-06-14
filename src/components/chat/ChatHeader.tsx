import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, RotateCcw, Download, Brain, Clock } from 'lucide-react';
import { PersonalityTrait } from '@/types/personality';

interface ChatHeaderProps {
  speechEnabled: boolean;
  onToggleSpeech: (enabled: boolean) => void;
  onResetConversation: () => void;
  onExportConversation: () => void;
  memoryStats: {
    totalMessages: number;
    sessionDuration: number;
    userInterests: string[];
    userPreferences: string[];
    lastInteraction: Date;
  };
  engineState: {
    isProcessing: boolean;
    canBeInterrupted: boolean;
    currentTask?: string;
    emotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
  };
  currentPersonality?: PersonalityTrait;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  speechEnabled,
  onToggleSpeech,
  onResetConversation,
  onExportConversation,
  memoryStats,
  engineState,
  currentPersonality
}) => {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Chat avec Avatar AI</span>
          <Brain className="h-5 w-5 text-purple-500" />
          {currentPersonality && (
            <Badge variant="outline" className="ml-2">
              {currentPersonality.emoji} {currentPersonality.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={speechEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSpeech(!speechEnabled)}
            title="Activer/Désactiver la synthèse vocale"
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportConversation}
            title="Exporter la conversation"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetConversation}
            title="Réinitialiser la conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardTitle>
      
      {/* Statistiques de la mémoire conversationnelle */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Session: {formatDuration(memoryStats.sessionDuration)}
        </Badge>
        
        <Badge variant="secondary" className="text-xs">
          Messages: {memoryStats.totalMessages}
        </Badge>
        
        {currentPersonality && (
          <Badge 
            variant="outline" 
            className={`text-xs bg-gradient-to-r ${currentPersonality.color} text-white`}
          >
            🧠 Mode: {currentPersonality.responseStyle}
          </Badge>
        )}
        
        {memoryStats.userInterests.length > 0 && (
          <Badge variant="outline" className="text-xs">
            Intérêts: {memoryStats.userInterests.slice(0, 2).join(', ')}
            {memoryStats.userInterests.length > 2 && '...'}
          </Badge>
        )}
        
        {engineState.isProcessing && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            {engineState.canBeInterrupted ? '🔄 Traitement (interruptible)' : '⚠️ Traitement critique'}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};
