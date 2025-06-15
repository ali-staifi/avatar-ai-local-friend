
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OllamaModel, OllamaConfig } from '@/hooks/useOllama';
import { OllamaHeader } from './OllamaHeader';
import { OllamaStatus } from './OllamaStatus';
import { OllamaModelSelector } from './OllamaModelSelector';
import { OllamaAdvancedSettings } from './OllamaAdvancedSettings';
import { OllamaModelInfo } from './OllamaModelInfo';
import { OllamaCompressionControls } from './OllamaCompressionControls';

interface OllamaSelectorProps {
  isAvailable: boolean;
  models: OllamaModel[];
  isLoading: boolean;
  config: OllamaConfig;
  onConfigUpdate: (updates: Partial<OllamaConfig>) => void;
  onRefreshModels: () => void;
  onCheckAvailability: () => void;
  getCacheStats: () => any;
  onClearCache: () => void;
}

export const OllamaSelector: React.FC<OllamaSelectorProps> = ({
  isAvailable,
  models,
  isLoading,
  config,
  onConfigUpdate,
  onRefreshModels,
  onCheckAvailability,
  getCacheStats,
  onClearCache
}) => {
  return (
    <div className="space-y-4">
      <Card className="w-full">
        <OllamaHeader isAvailable={isAvailable} />
        
        <CardContent className="space-y-4">
          <OllamaStatus
            isAvailable={isAvailable}
            isLoading={isLoading}
            config={config}
            onConfigUpdate={onConfigUpdate}
            onRefreshModels={onRefreshModels}
            onCheckAvailability={onCheckAvailability}
          />

          {/* Sélection du modèle */}
          {isAvailable && (
            <div className="space-y-3">
              <OllamaModelSelector
                models={models}
                config={config}
                onConfigUpdate={onConfigUpdate}
              />

              {/* Paramètres avancés */}
              <OllamaAdvancedSettings
                config={config}
                onConfigUpdate={onConfigUpdate}
              />

              {/* Info modèle sélectionné */}
              <OllamaModelInfo
                selectedModelName={config.selectedModel}
                models={models}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compression Controls */}
      {isAvailable && (
        <OllamaCompressionControls
          compressionConfig={config.compression}
          onConfigUpdate={(compressionUpdates) => 
            onConfigUpdate({ compression: { ...config.compression, ...compressionUpdates } })
          }
          getCacheStats={getCacheStats}
          onClearCache={onClearCache}
        />
      )}
    </div>
  );
};
