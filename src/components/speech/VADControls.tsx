
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

interface VADControlsProps {
  vadSupported: boolean;
  vadEnabled: boolean;
  vadListening: boolean;
  isListening: boolean;
  onToggleVAD?: () => void;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
}

export const VADControls: React.FC<VADControlsProps> = ({
  vadSupported,
  vadEnabled,
  vadListening,
  isListening,
  onToggleVAD,
  bufferStatus
}) => {
  if (!vadSupported) return null;

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Détection Automatique (VAD)
          </h4>
          <p className="text-xs text-muted-foreground">
            Filtre intelligemment les segments vocaux utiles
          </p>
        </div>
        <Button
          variant={vadEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleVAD}
          disabled={isListening}
        >
          {vadEnabled ? "Activé" : "Désactivé"}
        </Button>
      </div>
      
      {vadEnabled && vadListening && bufferStatus && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Buffer circulaire:</span>
            <span className="font-mono">{Math.round(bufferStatus.bufferUsage)}%</span>
          </div>
          <Progress value={bufferStatus.bufferUsage} className="h-1" />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Badge 
                variant={bufferStatus.isInVoiceSegment ? "default" : "secondary"}
                className="text-xs"
              >
                {bufferStatus.isInVoiceSegment ? "🗣️ Voix" : "🤫 Silence"}
              </Badge>
            </div>
            {bufferStatus.isInVoiceSegment && (
              <span>Durée: {Math.round(bufferStatus.voiceDuration / 1000)}s</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
