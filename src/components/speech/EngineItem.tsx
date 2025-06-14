
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WifiOff, Shield } from 'lucide-react';
import { SpeechEngine } from '@/types/speechRecognition';
import { ModelLoadingProgress } from '@/services/VoskModelManager';

interface EngineItemProps {
  engine: {
    id: SpeechEngine;
    name: string;
    icon: React.ReactNode;
    description: string;
    supported: boolean;
    available: boolean;
    pros: string[];
    cons: string[];
  };
  currentEngine: SpeechEngine;
  vadEnabled: boolean;
  vadSupported: boolean;
  isListening: boolean;
  modelProgress?: ModelLoadingProgress;
  onEngineChange: (engine: SpeechEngine) => void;
}

export const EngineItem: React.FC<EngineItemProps> = ({
  engine,
  currentEngine,
  vadEnabled,
  vadSupported,
  isListening,
  modelProgress,
  onEngineChange
}) => {
  return (
    <div className="relative">
      <Button
        variant={currentEngine === engine.id ? "default" : "outline"}
        onClick={() => onEngineChange(engine.id)}
        disabled={isListening || !engine.available}
        className="w-full justify-start h-auto p-4"
      >
        <div className="flex items-start gap-3 w-full">
          <div className="mt-1">{engine.icon}</div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{engine.name}</span>
              {currentEngine === engine.id && (
                <Badge variant="secondary" className="text-xs">Actuel</Badge>
              )}
              {engine.id === 'web-speech' && <WifiOff className="h-3 w-3 opacity-50" />}
              {engine.id === 'vosk' && <Shield className="h-3 w-3 opacity-50" />}
              {vadEnabled && vadSupported && (
                <Badge variant="outline" className="text-xs">+ VAD</Badge>
              )}
            </div>
            <p className="text-xs opacity-70 mb-2">
              {engine.description}
              {vadEnabled && vadSupported && engine.id === currentEngine && 
                " avec détection automatique des segments vocaux"}
            </p>
            
            {/* État du moteur */}
            <div className="flex gap-1 mb-2">
              {engine.supported ? (
                <Badge variant="secondary" className="text-xs">Supporté</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Non supporté</Badge>
              )}
              
              {engine.available ? (
                <Badge variant="default" className="text-xs">Disponible</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {engine.id === 'vosk' ? 'Modèle requis' : 'Non disponible'}
                </Badge>
              )}
            </div>

            {/* Progrès de chargement Vosk */}
            {engine.id === 'vosk' && modelProgress && !modelProgress.loaded && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">Chargement modèle...</span>
                  <span className="text-xs font-mono">{Math.round(modelProgress.progress)}%</span>
                </div>
                <Progress value={modelProgress.progress} className="h-1" />
              </div>
            )}

            {/* Avantages/Inconvénients avec VAD */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-green-600 font-medium">✓ Avantages:</span>
                <ul className="list-none space-y-0.5 mt-1">
                  {engine.pros.map((pro, idx) => (
                    <li key={idx} className="opacity-70">• {pro}</li>
                  ))}
                  {vadEnabled && vadSupported && (
                    <li className="opacity-70">• Détection automatique</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="text-orange-600 font-medium">⚠ Limites:</span>
                <ul className="list-none space-y-0.5 mt-1">
                  {engine.cons.map((con, idx) => (
                    <li key={idx} className="opacity-70">• {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
};
