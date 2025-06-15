
import { PerformanceMetric, LazyLoadConfig, PerformanceReport, LazyLoader } from '@/types/performance';
import { MetricsCollector } from './performance/MetricsCollector';
import { LazyLoaderFactory } from './performance/LazyLoader';
import { IntersectionObserverManager } from './performance/IntersectionObserverManager';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';
import { PerformanceReporter } from './performance/PerformanceReporter';
import React from 'react';

export class PerformanceManager {
  private static instance: PerformanceManager;
  private metricsCollector: MetricsCollector;
  private lazyLoaderFactory: LazyLoaderFactory;
  private intersectionObserverManager: IntersectionObserverManager;
  private performanceOptimizer: PerformanceOptimizer;
  private performanceReporter: PerformanceReporter;

  private constructor() {
    this.metricsCollector = new MetricsCollector();
    this.lazyLoaderFactory = new LazyLoaderFactory(this.metricsCollector);
    this.intersectionObserverManager = new IntersectionObserverManager(this.metricsCollector);
    this.performanceOptimizer = new PerformanceOptimizer(this.metricsCollector);
    this.performanceReporter = new PerformanceReporter(this.metricsCollector);
    
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
    this.metricsCollector.recordMetric(name, value, category);
  }

  public startTimer(name: string): () => number {
    return this.metricsCollector.startTimer(name);
  }

  public createLazyLoader<T>(
    loader: () => Promise<T>,
    fallback: T,
    config: Partial<LazyLoadConfig> = {}
  ): LazyLoader<T> {
    return this.lazyLoaderFactory.createLazyLoader(loader, fallback, config);
  }

  public createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    config: Partial<LazyLoadConfig> = {}
  ): IntersectionObserver {
    return this.intersectionObserverManager.createIntersectionObserver(callback, config);
  }

  public optimizeRender<T extends object>(
    component: React.ComponentType<T>,
    shouldUpdate?: (prevProps: T, nextProps: T) => boolean
  ): React.ComponentType<T> {
    return this.performanceOptimizer.optimizeRender(component, shouldUpdate);
  }

  public getPerformanceReport(): PerformanceReport {
    return this.performanceReporter.getPerformanceReport();
  }

  public clearMetrics(): void {
    this.metricsCollector.clearMetrics();
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
}

export const performanceManager = PerformanceManager.getInstance();
