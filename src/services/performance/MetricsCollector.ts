
import { PerformanceMetric } from '@/types/performance';

export class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  public recordMetric(name: string, value: number, category: PerformanceMetric['category']): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      category
    };

    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Log des métriques importantes
    if (value > this.getThreshold(category)) {
      console.warn(`⚡ Performance warning: ${name} = ${value}ms (threshold: ${this.getThreshold(category)}ms)`);
    }
  }

  public startTimer(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'interaction');
      return duration;
    };
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
    console.log('🧹 Métriques de performance nettoyées');
  }

  public getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  private getThreshold(category: PerformanceMetric['category']): number {
    switch (category) {
      case 'loading': return 3000; // 3s
      case 'rendering': return 16; // 16ms pour 60fps
      case 'interaction': return 100; // 100ms
      case 'memory': return 50; // 50MB
      default: return 1000;
    }
  }
}
