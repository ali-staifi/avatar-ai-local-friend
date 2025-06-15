
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorManager, errorManager } from '@/services/ErrorManager';

// Mock console methods
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});

describe('ErrorManager', () => {
  beforeEach(() => {
    errorManager.clearErrorLog();
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = ErrorManager.getInstance();
    const instance2 = ErrorManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should report errors with correct context', () => {
    const error = new Error('Test error');
    const context = {
      component: 'TestComponent',
      action: 'render',
      severity: 'medium' as const,
      timestamp: new Date()
    };

    errorManager.reportError(error, context);

    const stats = errorManager.getErrorStats();
    expect(stats.totalErrors).toBe(1);
    expect(stats.recentErrors[0].error.message).toBe('Test error');
    expect(stats.recentErrors[0].context.component).toBe('TestComponent');
  });

  it('should log errors with appropriate severity levels', () => {
    const error = new Error('Test error');
    
    // Test critical error
    errorManager.reportError(error, {
      component: 'TestComponent',
      action: 'render',
      severity: 'critical',
      timestamp: new Date()
    });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('🚨 ERREUR CRITIQUE'),
      error,
      expect.any(Object)
    );

    // Test warning
    errorManager.reportError(error, {
      component: 'TestComponent',
      action: 'render',
      severity: 'medium',
      timestamp: new Date()
    });
    
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ ERREUR MOYENNE'),
      error,
      expect.any(Object)
    );
  });

  it('should maintain error log size limit', () => {
    const error = new Error('Test error');
    const context = {
      component: 'TestComponent',
      action: 'render',
      severity: 'low' as const,
      timestamp: new Date()
    };

    // Add more than max size
    for (let i = 0; i < 150; i++) {
      errorManager.reportError(new Error(`Error ${i}`), context);
    }

    const stats = errorManager.getErrorStats();
    expect(stats.totalErrors).toBeLessThanOrEqual(100);
  });

  it('should calculate error statistics correctly', () => {
    const contexts = [
      { severity: 'critical' as const },
      { severity: 'high' as const },
      { severity: 'medium' as const },
      { severity: 'critical' as const }
    ];

    contexts.forEach((ctx, i) => {
      errorManager.reportError(new Error(`Error ${i}`), {
        component: 'TestComponent',
        action: 'render',
        timestamp: new Date(),
        ...ctx
      });
    });

    const stats = errorManager.getErrorStats();
    expect(stats.totalErrors).toBe(4);
    expect(stats.criticalErrors).toBe(2);
    expect(stats.recentErrors).toHaveLength(4);
  });

  it('should clear error log', () => {
    const error = new Error('Test error');
    errorManager.reportError(error, {
      component: 'TestComponent',
      action: 'render',
      severity: 'medium',
      timestamp: new Date()
    });

    expect(errorManager.getErrorStats().totalErrors).toBe(1);
    
    errorManager.clearErrorLog();
    
    expect(errorManager.getErrorStats().totalErrors).toBe(0);
  });
});
