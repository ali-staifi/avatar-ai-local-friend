
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OllamaModel, OllamaConfig } from '@/hooks/useOllama';
import { OllamaHeader } from './OllamaHeader';
import { OllamaStatus } from './OllamaStatus';
import { OllamaModelSelector } from './OllamaModelSelector';
import { OllamaAdvancedSettings } from './OllamaAdvancedSettings';
import { OllamaModelInfo } from './OllamaModelInfo';

interface OllamaSelectorProps {
  isAvailable: boolean;
  models: OllamaModel[];
  isLoading: boolean;
  config: OllamaConfig;
  onConfigUpdate: (updates: Partial<OllamaConfig>) => void;
  onRefreshModels: () => void;
  onCheckAvailability: () => void;
}

export const OllamaSelector: React.FC<OllamaSelectorProps> = ({
  isAvailable,
  models,
  isLoading,
  config,
  onConfigUpdate,
  onRefreshModels,
  onCheckAvailability
}) => {
  return (
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
  );
};
