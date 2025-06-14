import React, { useState } from 'react';
import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Download,
  MessageSquare,
  MoreVertical,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react"

interface ChatHeaderProps {
  speechEnabled: boolean;
  onToggleSpeech: (enabled: boolean) => void;
  onResetConversation: () => void;
  onExportConversation: () => void;
  memoryStats: any;
  engineState: any;
  currentPersonality: any;
  // Nouvelles props pour le système hybride
  onToggleEngineSelector?: () => void;
  showEngineSelector?: boolean;
  speechEngine?: string;
  speechLanguage?: string;
  speechEngineStatus?: 'ready' | 'loading' | 'error';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  speechEnabled,
  onToggleSpeech,
  onResetConversation,
  onExportConversation,
  memoryStats,
  engineState,
  currentPersonality,
  onToggleEngineSelector,
  showEngineSelector,
  speechEngine = 'web-speech',
  speechLanguage = 'fr',
  speechEngineStatus = 'ready'
}) => {
  const [showStats, setShowStats] = useState(false);

  const getSpeechEngineInfo = () => {
    const engineName = speechEngine === 'vosk' ? 'Vosk' : 'Web Speech';
    const langFlag = speechLanguage === 'fr' ? '🇫🇷' : '🇸🇦';
    const statusColor = speechEngineStatus === 'ready' ? 'default' : 
                       speechEngineStatus === 'loading' ? 'secondary' : 'destructive';
    
    return { engineName, langFlag, statusColor };
  };

  const { engineName, langFlag, statusColor } = getSpeechEngineInfo();

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat Assistant IA
          <Badge variant="secondary" className="text-xs">
            {currentPersonality.emoji} {currentPersonality.name}
          </Badge>
          {/* Nouvelle badge pour le moteur de reconnaissance */}
          <Badge variant={statusColor} className="text-xs">
            {langFlag} {engineName}
          </Badge>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {/* État de la mémoire */}
          <div className="text-sm text-muted-foreground hidden md:flex items-center gap-4">
            <span title="Messages dans la conversation">
              💬 {memoryStats.totalMessages}
            </span>
            <span title="Intérêts détectés">
              🎯 {memoryStats.userInterests.length}
            </span>
            <span title="Durée de session">
              ⏱️ {Math.round(memoryStats.sessionDuration / 1000 / 60)}min
            </span>
            {memoryStats.currentTopic && (
              <span title="Sujet actuel" className="max-w-20 truncate">
                🗣️ {memoryStats.currentTopic}
              </span>
            )}
          </div>

          {/* Bouton configuration reconnaissance vocale */}
          {onToggleEngineSelector && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEngineSelector}
              title={showEngineSelector ? "Masquer config vocale" : "Configurer reconnaissance vocale"}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          {/* Bouton synthèse vocale */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSpeech(!speechEnabled)}
            title={speechEnabled ? "Désactiver synthèse vocale" : "Activer synthèse vocale"}
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* Menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onResetConversation}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportConversation}>
                <Download className="h-4 w-4 mr-2" />
                Exporter conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStats ? 'Masquer' : 'Afficher'} statistiques
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistiques détaillées */}
      {showStats && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3">📊 Statistiques de conversation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Messages:</span>
              <div className="font-medium">{memoryStats.totalMessages}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Intérêts:</span>
              <div className="font-medium">{memoryStats.userInterests.slice(0, 3).join(', ') || 'Aucun'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Durée:</span>
              <div className="font-medium">{Math.round(memoryStats.sessionDuration / 1000 / 60)}min</div>
            </div>
            <div>
              <span className="text-muted-foreground">Personnalité:</span>
              <div className="font-medium">{currentPersonality.name}</div>
            </div>
            {/* Nouvelles stats pour le système hybride */}
            <div>
              <span className="text-muted-foreground">Moteur vocal:</span>
              <div className="font-medium">{engineName}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Langue:</span>
              <div className="font-medium">{langFlag} {speechLanguage.toUpperCase()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">État moteur:</span>
              <div className="font-medium capitalize">{speechEngineStatus}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Synthèse:</span>
              <div className="font-medium">{speechEnabled ? 'Activée' : 'Désactivée'}</div>
            </div>
          </div>
          
          {memoryStats.currentTopic && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-muted-foreground">Sujet actuel:</span>
              <div className="font-medium">{memoryStats.currentTopic}</div>
            </div>
          )}
        </div>
      )}
    </CardHeader>
  );
};
