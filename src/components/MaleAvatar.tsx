
import React from 'react';
import { Male3DAvatar } from '@/components/Male3DAvatar';

interface MaleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatar: React.FC<MaleAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👨 MaleAvatar rendering with 3D avatar:', { isListening, isSpeaking, emotion });

  return (
    <Male3DAvatar 
      isListening={isListening}
      isSpeaking={isSpeaking}
      emotion={emotion}
    />
  );
};
