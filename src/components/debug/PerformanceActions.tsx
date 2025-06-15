
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { PerformanceReport } from '@/types/performance';

interface PerformanceActionsProps {
  performanceData: PerformanceReport;
  errorStats: {
    totalErrors: number;
    criticalErrors: number;
  };
  onClearMetrics: () => void;
}

export const PerformanceActions: React.FC<PerformanceActionsProps> = ({
  performanceData,
  errorStats,
  onClearMetrics
}) => {
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

  return (
    <div className="flex gap-2 pt-2 border-t">
      <Button
        onClick={onClearMetrics}
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
  );
};
