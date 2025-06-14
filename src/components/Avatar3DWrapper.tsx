
import React, { Suspense } from 'react';
import { Avatar3D } from '@/components/Avatar3D';

interface Avatar3DWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

class Avatar3DErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Avatar3D Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Avatar3D Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-muted rounded-lg">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-muted-foreground">Avatar 3D temporairement indisponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              Erreur: {this.state.error?.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const Avatar3DWrapper: React.FC<Avatar3DWrapperProps> = (props) => {
  console.log('Avatar3DWrapper rendering with props:', props);
  
  return (
    <Avatar3DErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-muted rounded-lg">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Chargement de l'avatar 3D...</p>
          </div>
        </div>
      }>
        <Avatar3D {...props} />
      </Suspense>
    </Avatar3DErrorBoundary>
  );
};
