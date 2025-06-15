
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OllamaModel, OllamaConfig } from '@/hooks/useOllama';

interface OllamaModelSelectorProps {
  models: OllamaModel[];
  config: OllamaConfig;
  onConfigUpdate: (updates: Partial<OllamaConfig>) => void;
}

export const OllamaModelSelector: React.FC<OllamaModelSelectorProps> = ({
  models,
  config,
  onConfigUpdate
}) => {
  const formatModelSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getModelFamily = (model: OllamaModel): string => {
    return model.details?.family || 'Inconnu';
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Modèle LLM ({models.length} disponible{models.length > 1 ? 's' : ''})
      </label>
      <Select
        value={config.selectedModel}
        onValueChange={(model) => onConfigUpdate({ selectedModel: model })}
        disabled={models.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un modèle..." />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.name} value={model.name}>
              <div className="flex items-center justify-between w-full">
                <span>{model.name}</span>
                <div className="flex gap-1 ml-2">
                  <Badge variant="secondary" className="text-xs">
                    {getModelFamily(model)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatModelSize(model.size)}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
