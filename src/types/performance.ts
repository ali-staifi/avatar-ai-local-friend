
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  category: 'loading' | 'rendering' | 'interaction' | 'memory';
}

export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

export interface PerformanceReport {
  averageLoadTime: number;
  averageRenderTime: number;
  slowestOperations: PerformanceMetric[];
  memoryUsage: number;
  totalMetrics: number;
}

export interface LazyLoader<T> {
  load: () => Promise<T>;
  isLoading: () => boolean;
  isLoaded: () => boolean;
}
