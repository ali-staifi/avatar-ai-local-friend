
import { PerformanceReport } from '@/types/performance';
import { MetricsCollector } from './MetricsCollector';

export class PerformanceReporter {
  constructor(private metricsCollector: MetricsCollector) {}

  public getPerformanceReport(): PerformanceReport {
    const metrics = this.metricsCollector.getMetrics();
    const loadingMetrics = this.metricsCollector.getMetricsByCategory('loading');
    const renderingMetrics = this.metricsCollector.getMetricsByCategory('rendering');
    
    const averageLoadTime = loadingMetrics.length > 0
      ? loadingMetrics.reduce((sum, m) => sum + m.value, 0) / loadingMetrics.length
      : 0;

    const averageRenderTime = renderingMetrics.length > 0
      ? renderingMetrics.reduce((sum, m) => sum + m.value, 0) / renderingMetrics.length
      : 0;

    const slowestOperations = [...metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      averageLoadTime,
      averageRenderTime,
      slowestOperations,
      memoryUsage: this.getMemoryUsage(),
      totalMetrics: metrics.length
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}
