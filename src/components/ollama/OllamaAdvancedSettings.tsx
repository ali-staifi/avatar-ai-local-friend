
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { OllamaConfig } from '@/hooks/useOllama';

interface OllamaAdvancedSettingsProps {
  config: OllamaConfig;
  onConfigUpdate: (updates: Partial<OllamaConfig>) => void;
}

export const OllamaAdvancedSettings: React.FC<OllamaAdvancedSettingsProps> = ({
  config,
  onConfigUpdate
}) => {
  return (
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
  );
};
