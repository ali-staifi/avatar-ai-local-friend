
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface StatusDisplayProps {
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  engineStatus: 'ready' | 'loading' | 'error';
  isListening: boolean;
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

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' }
];

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  currentEngine,
  currentLanguage,
  engineStatus,
  isListening,
  vadEnabled = false,
  vadSupported = false,
  vadListening = false,
  bufferStatus
}) => {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <h4 className="font-medium mb-2">État actuel</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span>Moteur:</span>
          <span className="font-medium capitalize">{currentEngine}</span>
        </div>
        <div className="flex justify-between">
          <span>Langue:</span>
          <span className="font-medium">{languages.find(l => l.code === currentLanguage)?.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Statut:</span>
          <Badge 
            variant={
              engineStatus === 'ready' ? 'default' : 
              engineStatus === 'loading' ? 'secondary' : 'destructive'
            }
            className="text-xs"
          >
            {engineStatus === 'ready' ? 'Prêt' : 
             engineStatus === 'loading' ? 'Chargement' : 'Erreur'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Écoute:</span>
          <Badge variant={isListening ? 'destructive' : 'outline'} className="text-xs">
            {isListening ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        {vadSupported && (
          <>
            <div className="flex justify-between">
              <span>VAD:</span>
              <Badge 
                variant={vadEnabled ? 'default' : 'outline'}
                className="text-xs"
              >
                {vadEnabled ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            {vadEnabled && vadListening && (
              <div className="flex justify-between">
                <span>Détection:</span>
                <Badge 
                  variant={bufferStatus?.isInVoiceSegment ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {bufferStatus?.isInVoiceSegment ? 'Voix' : 'Silence'}
                </Badge>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
