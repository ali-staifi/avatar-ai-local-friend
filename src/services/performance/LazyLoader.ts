
import { LazyLoadConfig, LazyLoader } from '@/types/performance';
import { MetricsCollector } from './MetricsCollector';

export class LazyLoaderFactory {
  constructor(private metricsCollector: MetricsCollector) {}

  public createLazyLoader<T>(
    loader: () => Promise<T>,
    fallback: T,
    config: Partial<LazyLoadConfig> = {}
  ): LazyLoader<T> {
    const loaderId = `loader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const loadingStates: Map<string, boolean> = new Map();
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

        loadingStates.set(loaderId, true);
        const timer = this.metricsCollector.startTimer(`lazy_load_${loaderId}`);

        loadingPromise = loader()
          .then(result => {
            loadedValue = result;
            loadingStates.set(loaderId, false);
            timer();
            console.log(`✅ Lazy load completed: ${loaderId}`);
            return result;
          })
          .catch(error => {
            loadingStates.set(loaderId, false);
            timer();
            console.error(`❌ Lazy load failed: ${loaderId}`, error);
            return fallback;
          });

        return loadingPromise;
      },
      isLoading: () => loadingStates.get(loaderId) || false,
      isLoaded: () => loadedValue !== null
    };
  }
}
