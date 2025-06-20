
import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceManager } from '@/services/PerformanceManager';

interface PerformanceHookOptions {
  trackRender?: boolean;
  trackInteractions?: boolean;
  componentName?: string;
}

export const usePerformanceMonitor = (options: PerformanceHookOptions = {}) => {
  const {
    trackRender = true,
    trackInteractions = false,
    componentName = 'UnknownComponent'
  } = options;

  const renderCountRef = useRef(0);
  const [performanceData, setPerformanceData] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });

  // Tracker les renders
  useEffect(() => {
    if (!trackRender) return;

    const timer = performanceManager.startTimer(`${componentName}_render`);
    renderCountRef.current += 1;
    
    return () => {
      const renderTime = timer();
      setPerformanceData(prev => ({
        renderCount: renderCountRef.current,
        averageRenderTime: prev.averageRenderTime === 0 
          ? renderTime 
          : (prev.averageRenderTime + renderTime) / 2,
        lastRenderTime: renderTime
      }));
    };
  });

  // Utilitaires pour tracker les interactions
  const trackInteraction = useCallback((actionName: string) => {
    if (!trackInteractions) return () => {};
    return performanceManager.startTimer(`${componentName}_${actionName}`);
  }, [trackInteractions, componentName]);

  const recordCustomMetric = useCallback((name: string, value: number) => {
    performanceManager.recordMetric(`${componentName}_${name}`, value, 'interaction');
  }, [componentName]);

  return {
    performanceData,
    trackInteraction,
    recordCustomMetric,
    getPerformanceReport: performanceManager.getPerformanceReport.bind(performanceManager)
  };
};
