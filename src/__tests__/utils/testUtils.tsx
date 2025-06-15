
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AdvancedErrorBoundary } from '@/components/error/AdvancedErrorBoundary';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withErrorBoundary?: boolean;
  errorBoundaryProps?: {
    componentName?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    showErrorDetails?: boolean;
  };
}

// Wrapper personnalisé pour les tests avec Error Boundary
const TestWrapper: React.FC<{ 
  children: React.ReactNode;
  withErrorBoundary?: boolean;
  errorBoundaryProps?: CustomRenderOptions['errorBoundaryProps'];
}> = ({ children, withErrorBoundary = false, errorBoundaryProps = {} }) => {
  if (withErrorBoundary) {
    return (
      <AdvancedErrorBoundary
        componentName={errorBoundaryProps.componentName || 'TestComponent'}
        severity={errorBoundaryProps.severity || 'medium'}
        showErrorDetails={errorBoundaryProps.showErrorDetails || false}
      >
        {children}
      </AdvancedErrorBoundary>
    );
  }

  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withErrorBoundary, errorBoundaryProps, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper 
        withErrorBoundary={withErrorBoundary}
        errorBoundaryProps={errorBoundaryProps}
      >
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
};

// Utilitaire pour simuler des erreurs dans les tests
export const throwError = (message: string = 'Test error') => {
  throw new Error(message);
};

// Utilitaire pour les tests de performance
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Mock pour IntersectionObserver (nécessaire pour les tests de lazy loading)
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn().mockImplementation((element) => {
      // Simuler l'intersection immédiatement
      callback([{
        isIntersecting: true,
        target: element,
        intersectionRatio: 1,
        boundingClientRect: {},
        intersectionRect: {},
        rootBounds: {},
        time: Date.now()
      }]);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
