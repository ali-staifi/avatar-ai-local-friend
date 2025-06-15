
import React from 'react';
import { MetricsCollector } from './MetricsCollector';

export class PerformanceOptimizer {
  constructor(private metricsCollector: MetricsCollector) {}

  public optimizeRender<T extends object>(
    component: React.ComponentType<T>,
    shouldUpdate?: (prevProps: T, nextProps: T) => boolean
  ): React.ComponentType<T> {
    const MemoizedComponent = React.memo(component, shouldUpdate ? (prevProps, nextProps) => {
      const timer = this.metricsCollector.startTimer('memo_comparison');
      const result = !shouldUpdate(prevProps, nextProps);
      timer();
      return result;
    } : undefined);

    return MemoizedComponent as React.ComponentType<T>;
  }
}
