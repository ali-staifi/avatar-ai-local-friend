
import React from 'react';
import { LazyAvatar3D } from '@/components/LazyAvatar3D';
import { Gender } from '@/types/gender';

interface Avatar3DWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender?: Gender;
}

export const Avatar3DWrapper: React.FC<Avatar3DWrapperProps & Record<string, any>> = (allProps) => {
  // Filter out development-specific props that interfere with Three.js
  const { isListening, isSpeaking, emotion, gender = 'male', ...devProps } = allProps;
  
  // Only pass the actual Avatar props, filtering out any data-* attributes
  const cleanProps = { isListening, isSpeaking, emotion, gender };
  
  console.log('Avatar3DWrapper rendering with clean props:', cleanProps);
  
  return <LazyAvatar3D {...cleanProps} enableLazyLoading={true} />;
};
