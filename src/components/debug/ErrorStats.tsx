
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface ErrorStatsProps {
  errorStats: {
    totalErrors: number;
    criticalErrors: number;
  };
}

export const ErrorStats: React.FC<ErrorStatsProps> = ({ errorStats }) => {
  return (
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
  );
};
