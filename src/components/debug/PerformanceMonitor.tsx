
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Trash2, Download, AlertTriangle } from 'lucide-react';
import { performanceManager } from '@/services/PerformanceManager';
import { errorManager } from '@/services/ErrorManager';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  onToggle
}) => {
  const [performanceData, setPerformanceData] = useState(performanceManager.getPerformanceReport());
  const [errorStats, setErrorStats] = useState(errorManager.getErrorStats());
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setPerformanceData(performanceManager.getPerformanceReport());
        setErrorStats(errorManager.getErrorStats());
      }, 2000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible]);

  const handleClearMetrics = () => {
    performanceManager.clearMetrics();
    errorManager.clearErrorLog();
    setPerformanceData(performanceManager.getPerformanceReport());
    setErrorStats(errorManager.getErrorStats());
  };

  const handleExportData = () => {
    const data = {
      performance: performanceData,
      errors: errorStats,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4" />
        Perf
      </Button>
    );
  }

  const getPerformanceColor = (value: number, category: 'load' | 'render' | 'memory') => {
    const thresholds = {
      load: { good: 1000, bad: 3000 },
      render: { good: 16, bad: 50 },
      memory: { good: 50, bad: 100 }
    };

    const threshold = thresholds[category];
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.bad) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </div>
            <Button onClick={onToggle} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {/* Métriques de performance */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Performance</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Temps de chargement</div>
                <div className={`font-mono ${getPerformanceColor(performanceData.averageLoadTime, 'load')}`}>
                  {performanceData.averageLoadTime.toFixed(0)}ms
                </div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Temps de rendu</div>
                <div className={`font-mono ${getPerformanceColor(performanceData.averageRenderTime, 'render')}`}>
                  {performanceData.averageRenderTime.toFixed(1)}ms
                </div>
              </div>
            </div>

            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600 mb-1">Mémoire utilisée</div>
              <div className={`font-mono ${getPerformanceColor(performanceData.memoryUsage, 'memory')}`}>
                {performanceData.memoryUsage.toFixed(1)} MB
              </div>
              <Progress 
                value={(performanceData.memoryUsage / 100) * 100} 
                className="h-1 mt-1"
              />
            </div>
          </div>

          {/* Statistiques d'erreurs */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              Erreurs
              {errorStats.criticalErrors > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errorStats.criticalErrors}
                </Badge>
              )}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Total</div>
                <div className="font-mono">{errorStats.totalErrors}</div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Critiques</div>
                <div className={`font-mono ${errorStats.criticalErrors > 0 ? 'text-red-600' : ''}`}>
                  {errorStats.criticalErrors}
                </div>
              </div>
            </div>
          </div>

          {/* Opérations les plus lentes */}
          {performanceData.slowestOperations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Opérations lentes</h4>
              <div className="space-y-1">
                {performanceData.slowestOperations.slice(0, 3).map((metric, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="truncate flex-1">{metric.name}</span>
                    <span className="font-mono ml-2">{metric.value.toFixed(1)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleClearMetrics}
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Nettoyer
            </Button>
            
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
