
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  category: 'loading' | 'rendering' | 'interaction' | 'memory';
}

interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, IntersectionObserver> = new Map();
  private loadingStates: Map<string, boolean> = new Map();
  private maxMetrics = 1000;

  private constructor() {
    this.initPerformanceObserver();
    this.setupMemoryMonitoring();
  }

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

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

  public startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'interaction');
    };
  }

  public createLazyLoader<T>(
    loader: () => Promise<T>,
    fallback: T,
    config: Partial<LazyLoadConfig> = {}
  ): {
    load: () => Promise<T>;
    isLoading: () => boolean;
    isLoaded: () => boolean;
  } {
    const loaderId = `loader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let loadedValue: T | null = null;
    let loadingPromise: Promise<T> | null = null;

    return {
      load: async () => {
        if (loadedValue) {
          return loadedValue;
        }

        if (loadingPromise) {
          return loadingPromise;
        }

        this.loadingStates.set(loaderId, true);
        const timer = this.startTimer(`lazy_load_${loaderId}`);

        loadingPromise = loader()
          .then(result => {
            loadedValue = result;
            this.loadingStates.set(loaderId, false);
            timer();
            console.log(`✅ Lazy load completed: ${loaderId}`);
            return result;
          })
          .catch(error => {
            this.loadingStates.set(loaderId, false);
            timer();
            console.error(`❌ Lazy load failed: ${loaderId}`, error);
            return fallback;
          });

        return loadingPromise;
      },
      isLoading: () => this.loadingStates.get(loaderId) || false,
      isLoaded: () => loadedValue !== null
    };
  }

  public createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    config: Partial<LazyLoadConfig> = {}
  ): IntersectionObserver {
    const observerConfig = {
      threshold: config.threshold || 0.1,
      rootMargin: config.rootMargin || '50px'
    };

    const observer = new IntersectionObserver((entries) => {
      const timer = this.startTimer('intersection_callback');
      callback(entries);
      timer();
    }, observerConfig);

    return observer;
  }

  public optimizeRender<T extends object>(
    component: React.ComponentType<T>,
    shouldUpdate?: (prevProps: T, nextProps: T) => boolean
  ): React.ComponentType<T> {
    return React.memo(component, shouldUpdate ? (prevProps, nextProps) => {
      const timer = this.startTimer('memo_comparison');
      const result = !shouldUpdate(prevProps, nextProps);
      timer();
      return result;
    } : undefined);
  }

  public getPerformanceReport(): {
    averageLoadTime: number;
    averageRenderTime: number;
    slowestOperations: PerformanceMetric[];
    memoryUsage: number;
    totalMetrics: number;
  } {
    const loadingMetrics = this.metrics.filter(m => m.category === 'loading');
    const renderingMetrics = this.metrics.filter(m => m.category === 'rendering');
    
    const averageLoadTime = loadingMetrics.length > 0
      ? loadingMetrics.reduce((sum, m) => sum + m.value, 0) / loadingMetrics.length
      : 0;

    const averageRenderTime = renderingMetrics.length > 0
      ? renderingMetrics.reduce((sum, m) => sum + m.value, 0) / renderingMetrics.length
      : 0;

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      averageLoadTime,
      averageRenderTime,
      slowestOperations,
      memoryUsage: this.getMemoryUsage(),
      totalMetrics: this.metrics.length
    };
  }

  private initPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page_load', entry.duration, 'loading');
          } else if (entry.entryType === 'paint') {
            this.recordMetric(entry.name, entry.startTime, 'rendering');
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  private setupMemoryMonitoring(): void {
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      this.recordMetric('memory_usage', memoryUsage, 'memory');
    }, 30000); // Toutes les 30 secondes
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
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

  public clearMetrics(): void {
    this.metrics = [];
    console.log('🧹 Métriques de performance nettoyées');
  }
}

export const performanceManager = PerformanceManager.getInstance();
