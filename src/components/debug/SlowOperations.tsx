
import React from 'react';
import { PerformanceMetric } from '@/types/performance';

interface SlowOperationsProps {
  slowestOperations: PerformanceMetric[];
}

export const SlowOperations: React.FC<SlowOperationsProps> = ({ slowestOperations }) => {
  if (slowestOperations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Opérations lentes</h4>
      <div className="space-y-1">
        {slowestOperations.slice(0, 3).map((metric, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span className="truncate flex-1">{metric.name}</span>
            <span className="font-mono ml-2">{metric.value.toFixed(1)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};
