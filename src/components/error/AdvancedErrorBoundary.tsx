
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { errorManager, ErrorContext } from '@/services/ErrorManager';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
  componentName: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  retryCount: number;
  lastErrorTime: Date | null;
}

export class AdvancedErrorBoundary extends Component<Props, ErrorBoundaryState> {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context: ErrorContext = {
      component: this.props.componentName,
      action: 'render',
      severity: this.props.severity || 'medium',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      additionalData: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    };

    // Reporter l'erreur
    errorManager.reportError(error, context);

    // Callback personnalisé
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`🔄 Tentative de récupération ${this.state.retryCount + 1}/${this.maxRetries} pour ${this.props.componentName}`);
      
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, this.retryDelay * (this.state.retryCount + 1));
    }
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: null
    });
  };

  handleReloadPage = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      
      // Utiliser le fallback personnalisé si fourni
      if (FallbackComponent) {
        return <FallbackComponent {...this.state} />;
      }

      // Chercher un fallback enregistré
      const registeredFallback = errorManager.getFallback(
        this.props.componentName,
        this.state.error!,
        {
          component: this.props.componentName,
          action: 'render',
          severity: this.props.severity || 'medium',
          timestamp: new Date()
        }
      );

      if (registeredFallback) {
        const RegisteredFallback = registeredFallback;
        return <RegisteredFallback {...this.state} />;
      }

      // Fallback par défaut
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  private renderDefaultFallback() {
    const { error, errorId, retryCount, lastErrorTime } = this.state;
    const { componentName, severity = 'medium', showErrorDetails = false } = this.props;
    const canRetry = retryCount < this.maxRetries;

    const severityColors = {
      low: 'bg-blue-50 border-blue-200',
      medium: 'bg-yellow-50 border-yellow-200',
      high: 'bg-orange-50 border-orange-200',
      critical: 'bg-red-50 border-red-200'
    };

    return (
      <Card className={`w-full ${severityColors[severity]} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Erreur dans {componentName}
            <Badge variant="outline" className="text-xs">
              {severity.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Une erreur inattendue s'est produite dans ce composant.</p>
            {lastErrorTime && (
              <p className="text-xs mt-1">
                Dernière erreur : {lastErrorTime.toLocaleTimeString()}
              </p>
            )}
          </div>

          {showErrorDetails && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Détails techniques
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                <div><strong>ID:</strong> {errorId}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2 flex-wrap">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer ({this.maxRetries - retryCount} restant{this.maxRetries - retryCount > 1 ? 's' : ''})
              </Button>
            )}
            
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Réinitialiser
            </Button>

            {severity === 'critical' && (
              <Button
                onClick={this.handleReloadPage}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </Button>
            )}

            <Button
              onClick={() => {
                const errorStats = errorManager.getErrorStats();
                console.table(errorStats.recentErrors);
              }}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
