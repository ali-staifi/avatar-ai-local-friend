
import React, { Suspense } from 'react';
import { Avatar3D } from '@/components/Avatar3D';
import { SimpleAvatar } from '@/components/SimpleAvatar';
import { FemaleAvatar } from '@/components/FemaleAvatar';
import { Gender } from '@/types/gender';

interface Avatar3DWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender?: Gender;
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
      const { gender, ...otherProps } = this.props.fallbackProps;
      return gender === 'female' ? <FemaleAvatar {...otherProps} /> : <SimpleAvatar {...otherProps} />;
    }

    return this.props.children;
  }
}

export const Avatar3DWrapper: React.FC<Avatar3DWrapperProps & Record<string, any>> = (allProps) => {
  // Filter out development-specific props that interfere with Three.js
  const { isListening, isSpeaking, emotion, gender = 'male', ...devProps } = allProps;
  
  // Only pass the actual Avatar props, filtering out any data-* attributes
  const cleanProps = { isListening, isSpeaking, emotion };
  
  console.log('Avatar3DWrapper rendering with clean props:', cleanProps, 'gender:', gender);
  
  // Si le genre est féminin, utiliser le FemaleAvatar directement
  if (gender === 'female') {
    return <FemaleAvatar {...cleanProps} />;
  }
  
  // Sinon, utiliser l'avatar 3D masculin avec fallback
  return (
    <Avatar3DErrorBoundary fallbackProps={{ ...cleanProps, gender }}>
      <Suspense fallback={<SimpleAvatar {...cleanProps} />}>
        <Avatar3D {...cleanProps} />
      </Suspense>
    </Avatar3DErrorBoundary>
  );
};
