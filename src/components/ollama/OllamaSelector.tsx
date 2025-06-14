
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OllamaModel, OllamaConfig } from '@/hooks/useOllama';

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
  const formatModelSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getModelFamily = (model: OllamaModel): string => {
    return model.details?.family || 'Inconnu';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Ollama - IA Locale
          {isAvailable ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connecté
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Non disponible
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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

        {/* Sélection du modèle */}
        {isAvailable && (
          <div className="space-y-3">
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

            {/* Paramètres avancés */}
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Température: {config.temperature}
                </label>
                <Slider
                  value={[config.temperature]}
                  onValueChange={([value]) => onConfigUpdate({ temperature: value })}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Plus basse = plus précis, plus haute = plus créatif
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tokens max: {config.maxTokens}
                </label>
                <Slider
                  value={[config.maxTokens]}
                  onValueChange={([value]) => onConfigUpdate({ maxTokens: value })}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prompt système
                </label>
                <Textarea
                  value={config.systemPrompt}
                  onChange={(e) => onConfigUpdate({ systemPrompt: e.target.value })}
                  placeholder="Instructions pour l'IA..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Info modèle sélectionné */}
            {config.selectedModel && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedModel = models.find(m => m.name === config.selectedModel);
                  if (!selectedModel) return null;
                  
                  return (
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">{selectedModel.name}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-blue-700">
                        <div>Taille: {formatModelSize(selectedModel.size)}</div>
                        <div>Famille: {getModelFamily(selectedModel)}</div>
                        <div>Format: {selectedModel.details?.format || 'N/A'}</div>
                        <div>Paramètres: {selectedModel.details?.parameter_size || 'N/A'}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
