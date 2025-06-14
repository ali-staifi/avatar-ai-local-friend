
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mic, Wifi, Shield } from 'lucide-react';
import { SpeechEngine, SupportedLanguage, EngineInfo } from '@/types/speechRecognition';
import { ModelLoadingProgress } from '@/services/VoskModelManager';
import { VADControls } from './VADControls';
import { LanguageSelector } from './LanguageSelector';
import { EngineItem } from './EngineItem';
import { StatusDisplay } from './StatusDisplay';

interface SpeechEngineSelectorProps {
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  onEngineChange: (engine: SpeechEngine) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  engineInfo: EngineInfo;
  isListening: boolean;
  engineStatus: 'ready' | 'loading' | 'error';
  vadEnabled?: boolean;
  onToggleVAD?: () => void;
  vadSupported?: boolean;
  vadListening?: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
}

export const SpeechEngineSelector: React.FC<SpeechEngineSelectorProps> = ({
  currentEngine,
  currentLanguage,
  onEngineChange,
  onLanguageChange,
  engineInfo,
  isListening,
  engineStatus,
  vadEnabled = false,
  onToggleVAD,
  vadSupported = false,
  vadListening = false,
  bufferStatus
}) => {
  const engines = [
    {
      id: 'web-speech' as SpeechEngine,
      name: 'Web Speech API',
      icon: <Wifi className="h-4 w-4" />,
      description: engineInfo.webSpeech.description,
      supported: engineInfo.webSpeech.supported,
      available: engineInfo.webSpeech.available,
      pros: ['Rapide', 'Intégré au navigateur', 'Bonne précision'],
      cons: ['Nécessite internet', 'Données envoyées en ligne', 'Support navigateur variable']
    },
    {
      id: 'vosk' as SpeechEngine,
      name: 'Vosk Offline',
      icon: <Shield className="h-4 w-4" />,
      description: engineInfo.vosk.description,
      supported: engineInfo.vosk.supported,
      available: engineInfo.vosk.available,
      pros: ['100% privé', 'Fonctionne offline', 'Multilingue'],
      cons: ['Modèles volumineux', 'Première fois plus lente', 'Précision variable']
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Configuration Reconnaissance Vocale
          {vadEnabled && vadSupported && (
            <Badge variant="secondary" className="text-xs">VAD Actif</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <VADControls
          vadSupported={vadSupported}
          vadEnabled={vadEnabled}
          vadListening={vadListening}
          isListening={isListening}
          onToggleVAD={onToggleVAD}
          bufferStatus={bufferStatus}
        />

        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          isListening={isListening}
        />

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Moteur de reconnaissance</h3>
          <div className="space-y-3">
            {engines.map((engine) => (
              <EngineItem
                key={engine.id}
                engine={engine}
                currentEngine={currentEngine}
                vadEnabled={vadEnabled}
                vadSupported={vadSupported}
                isListening={isListening}
                modelProgress={engine.id === 'vosk' ? engineInfo.vosk.modelProgress : undefined}
                onEngineChange={onEngineChange}
              />
            ))}
          </div>
        </div>

        <StatusDisplay
          currentEngine={currentEngine}
          currentLanguage={currentLanguage}
          engineStatus={engineStatus}
          isListening={isListening}
          vadEnabled={vadEnabled}
          vadSupported={vadSupported}
          vadListening={vadListening}
          bufferStatus={bufferStatus}
        />
      </CardContent>
    </Card>
  );
};
