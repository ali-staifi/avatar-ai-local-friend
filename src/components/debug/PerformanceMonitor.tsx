
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { performanceManager } from '@/services/PerformanceManager';
import { errorManager } from '@/services/ErrorManager';
import { PerformanceStats } from './PerformanceStats';
import { ErrorStats } from './ErrorStats';
import { SlowOperations } from './SlowOperations';
import { PerformanceActions } from './PerformanceActions';

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
          <PerformanceStats performanceData={performanceData} />
          <ErrorStats errorStats={errorStats} />
          <SlowOperations slowestOperations={performanceData.slowestOperations} />
          <PerformanceActions 
            performanceData={performanceData}
            errorStats={errorStats}
            onClearMetrics={handleClearMetrics}
          />
        </CardContent>
      </Card>
    </div>
  );
};
