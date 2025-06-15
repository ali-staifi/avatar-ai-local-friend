
export interface ErrorContext {
  component: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorFallback {
  component: React.ComponentType<any>;
  condition: (error: Error, context: ErrorContext) => boolean;
  priority: number;
}

export class ErrorManager {
  private static instance: ErrorManager;
  private errorLog: Array<{ error: Error; context: ErrorContext }> = [];
  private fallbacks: Map<string, ErrorFallback[]> = new Map();
  private maxLogSize = 100;

  private constructor() {}

  public static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  public reportError(error: Error, context: ErrorContext): void {
    const errorEntry = { error, context };
    
    // Ajouter au log
    this.errorLog.unshift(errorEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log selon la sévérité
    switch (context.severity) {
      case 'critical':
        console.error(`🚨 ERREUR CRITIQUE [${context.component}]:`, error, context);
        break;
      case 'high':
        console.error(`❌ ERREUR ÉLEVÉE [${context.component}]:`, error, context);
        break;
      case 'medium':
        console.warn(`⚠️ ERREUR MOYENNE [${context.component}]:`, error, context);
        break;
      case 'low':
        console.info(`ℹ️ ERREUR MINEURE [${context.component}]:`, error, context);
        break;
    }

    // Envoyer les erreurs critiques à un service de monitoring (simulé)
    if (context.severity === 'critical') {
      this.sendToCrashlytics(error, context);
    }
  }

  public registerFallback(componentName: string, fallback: ErrorFallback): void {
    if (!this.fallbacks.has(componentName)) {
      this.fallbacks.set(componentName, []);
    }
    
    const fallbacks = this.fallbacks.get(componentName)!;
    fallbacks.push(fallback);
    fallbacks.sort((a, b) => b.priority - a.priority);
  }

  public getFallback(componentName: string, error: Error, context: ErrorContext): React.ComponentType<any> | null {
    const fallbacks = this.fallbacks.get(componentName);
    if (!fallbacks) return null;

    for (const fallback of fallbacks) {
      if (fallback.condition(error, context)) {
        return fallback.component;
      }
    }

    return null;
  }

  public getErrorStats(): {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: Array<{ error: Error; context: ErrorContext }>;
  } {
    const criticalErrors = this.errorLog.filter(
      entry => entry.context.severity === 'critical'
    ).length;

    return {
      totalErrors: this.errorLog.length,
      criticalErrors,
      recentErrors: this.errorLog.slice(0, 10)
    };
  }

  private sendToCrashlytics(error: Error, context: ErrorContext): void {
    // Simulation d'envoi vers un service de monitoring
    console.log('📊 Envoi vers service de monitoring:', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  public clearErrorLog(): void {
    this.errorLog = [];
    console.log('🧹 Log d\'erreurs nettoyé');
  }
}

export const errorManager = ErrorManager.getInstance();
