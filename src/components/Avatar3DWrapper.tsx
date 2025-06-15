
import React from 'react';
import { LazyAvatar3D } from '@/components/LazyAvatar3D';
import { Gender } from '@/types/gender';

interface Avatar3DWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender?: Gender;
}

export const Avatar3DWrapper: React.FC<Avatar3DWrapperProps> = (props) => {
  const { isListening, isSpeaking, emotion, gender = 'male' } = props;
  
  console.log('🎬 Avatar3DWrapper rendering avec props:', { isListening, isSpeaking, emotion, gender });
  console.log('🚺🚹 Avatar3DWrapper - Genre reçu:', gender);
  
  return (
    <LazyAvatar3D 
      isListening={isListening}
      isSpeaking={isSpeaking}
      emotion={emotion}
      gender={gender}
      enableLazyLoading={false}
    />
  );
};
