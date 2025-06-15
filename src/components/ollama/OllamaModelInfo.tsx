
import React from 'react';
import { OllamaModel } from '@/hooks/useOllama';

interface OllamaModelInfoProps {
  selectedModelName: string;
  models: OllamaModel[];
}

export const OllamaModelInfo: React.FC<OllamaModelInfoProps> = ({
  selectedModelName,
  models
}) => {
  const formatModelSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getModelFamily = (model: OllamaModel): string => {
    return model.details?.family || 'Inconnu';
  };

  if (!selectedModelName) return null;

  const selectedModel = models.find(m => m.name === selectedModelName);
  if (!selectedModel) return null;

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-sm">
        <p className="font-medium text-blue-900">{selectedModel.name}</p>
        <div className="grid grid-cols-2 gap-2 mt-2 text-blue-700">
          <div>Taille: {formatModelSize(selectedModel.size)}</div>
          <div>Famille: {getModelFamily(selectedModel)}</div>
          <div>Format: {selectedModel.details?.format || 'N/A'}</div>
          <div>Paramètres: {selectedModel.details?.parameter_size || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};
