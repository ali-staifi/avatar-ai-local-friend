
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OllamaCompressionConfig } from '@/hooks/useOllama';

interface OllamaCompressionControlsProps {
  compressionConfig: OllamaCompressionConfig;
  onConfigUpdate: (config: Partial<OllamaCompressionConfig>) => void;
  getCacheStats: () => any;
  onClearCache: () => void;
}

export const OllamaCompressionControls: React.FC<OllamaCompressionControlsProps> = ({
  compressionConfig,
  onConfigUpdate,
  getCacheStats,
  onClearCache
}) => {
  const [cacheStats, setCacheStats] = React.useState<any>(null);

  React.useEffect(() => {
    const updateStats = () => {
      const stats = getCacheStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getCacheStats]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRatio = (ratio: number): string => {
    return `${ratio.toFixed(2)}x`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🗜️ Compression & Cache
          {compressionConfig.enabled && (
            <Badge variant="default" className="text-xs">Activé</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Compression Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Compression</label>
          <Switch
            checked={compressionConfig.enabled}
            onCheckedChange={(enabled) => onConfigUpdate({ enabled })}
          />
        </div>

        {/* Cache Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Cache des réponses</label>
          <Switch
            checked={compressionConfig.cacheResponses}
            onCheckedChange={(cacheResponses) => onConfigUpdate({ cacheResponses })}
          />
        </div>

        {/* Compression Level */}
        {compressionConfig.enabled && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Niveau de compression: {compressionConfig.compressionLevel}
            </label>
            <Slider
              value={[compressionConfig.compressionLevel]}
              onValueChange={([compressionLevel]) => onConfigUpdate({ compressionLevel: compressionLevel as any })}
              min={1}
              max={9}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Rapide</span>
              <span>Optimal</span>
            </div>
          </div>
        )}

        {/* Cache Threshold */}
        {compressionConfig.cacheResponses && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seuil de cache: {compressionConfig.cacheThreshold} caractères
            </label>
            <Slider
              value={[compressionConfig.cacheThreshold]}
              onValueChange={([cacheThreshold]) => onConfigUpdate({ cacheThreshold })}
              min={50}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>
        )}

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Statistiques du cache</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>Modèles: {cacheStats.totalModels}</div>
              <div>Réponses: {cacheStats.totalResponses}</div>
              <div>Hits: {cacheStats.cacheHits}</div>
              <div>Misses: {cacheStats.cacheMisses}</div>
              <div>Ratio: {formatRatio(cacheStats.compressionRatio)}</div>
              <div>Mémoire: {formatBytes(cacheStats.memoryUsed)}</div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCache}
              className="w-full mt-2"
            >
              Vider le cache
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
