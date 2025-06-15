
import React from 'react';
import { Female3DAvatar } from '@/components/Female3DAvatar';

interface FemaleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const FemaleAvatar: React.FC<FemaleAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👩 FemaleAvatar rendering with 3D avatar:', { isListening, isSpeaking, emotion });

  return (
    <Female3DAvatar 
      isListening={isListening}
      isSpeaking={isSpeaking}
      emotion={emotion}
    />
  );
};
