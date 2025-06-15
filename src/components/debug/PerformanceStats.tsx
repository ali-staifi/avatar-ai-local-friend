
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { PerformanceReport } from '@/types/performance';

interface PerformanceStatsProps {
  performanceData: PerformanceReport;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ performanceData }) => {
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
  );
};
