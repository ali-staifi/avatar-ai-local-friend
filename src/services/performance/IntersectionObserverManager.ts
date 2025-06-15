
import { LazyLoadConfig } from '@/types/performance';
import { MetricsCollector } from './MetricsCollector';

export class IntersectionObserverManager {
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor(private metricsCollector: MetricsCollector) {}

  public createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    config: Partial<LazyLoadConfig> = {}
  ): IntersectionObserver {
    const observerConfig = {
      threshold: config.threshold || 0.1,
      rootMargin: config.rootMargin || '50px'
    };

    const observer = new IntersectionObserver((entries) => {
      const timer = this.metricsCollector.startTimer('intersection_callback');
      callback(entries);
      timer();
    }, observerConfig);

    return observer;
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}
