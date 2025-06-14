
import React, { Suspense } from 'react';
import { Avatar3D } from '@/components/Avatar3D';
import { SimpleAvatar } from '@/components/SimpleAvatar';

interface Avatar3DWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

class Avatar3DErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackProps: Avatar3DWrapperProps },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallbackProps: Avatar3DWrapperProps }) {
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
      console.log('🔄 Basculement vers l\'avatar simple à cause d\'une erreur');
      return <SimpleAvatar {...this.props.fallbackProps} />;
    }

    return this.props.children;
  }
}

export const Avatar3DWrapper: React.FC<Avatar3DWrapperProps & Record<string, any>> = (allProps) => {
  // Filter out development-specific props that interfere with Three.js
  const { isListening, isSpeaking, emotion, ...devProps } = allProps;
  
  // Only pass the actual Avatar3D props, filtering out any data-* attributes
  const cleanProps = { isListening, isSpeaking, emotion };
  
  console.log('Avatar3DWrapper rendering with clean props:', cleanProps);
  
  return (
    <Avatar3DErrorBoundary fallbackProps={cleanProps}>
      <Suspense fallback={<SimpleAvatar {...cleanProps} />}>
        <Avatar3D {...cleanProps} />
      </Suspense>
    </Avatar3DErrorBoundary>
  );
};
