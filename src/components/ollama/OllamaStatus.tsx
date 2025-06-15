
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RefreshCw } from 'lucide-react';
import { OllamaConfig } from '@/hooks/useOllama';

interface OllamaStatusProps {
  isAvailable: boolean;
  isLoading: boolean;
  config: OllamaConfig;
  onConfigUpdate: (updates: Partial<OllamaConfig>) => void;
  onRefreshModels: () => void;
  onCheckAvailability: () => void;
}

export const OllamaStatus: React.FC<OllamaStatusProps> = ({
  isAvailable,
  isLoading,
  config,
  onConfigUpdate,
  onRefreshModels,
  onCheckAvailability
}) => {
  return (
    <>
      {/* Status et contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={config.enabled && isAvailable}
            onCheckedChange={(enabled) => onConfigUpdate({ enabled })}
            disabled={!isAvailable}
          />
          <span className="text-sm font-medium">
            {config.enabled && isAvailable ? 'Activé' : 'Désactivé'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCheckAvailability}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
          
          {isAvailable && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshModels}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser modèles
            </Button>
          )}
        </div>
      </div>

      {/* Message d'état */}
      {!isAvailable && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Ollama non détecté</strong><br />
            Assurez-vous qu'Ollama est installé et en cours d'exécution sur localhost:11434
          </p>
        </div>
      )}
    </>
  );
};
