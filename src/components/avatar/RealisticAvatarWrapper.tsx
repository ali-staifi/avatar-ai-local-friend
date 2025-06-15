
import React from 'react';
import { MaleAvatarMesh } from './MaleAvatarMesh';
import { FemaleAvatarMesh } from './FemaleAvatarMesh';
import { RealisticFemaleAvatarMesh } from './RealisticFemaleAvatarMesh';
import { Gender } from '@/types/gender';

interface RealisticAvatarWrapperProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender: Gender;
  useRealistic?: boolean;
}

export const RealisticAvatarWrapper: React.FC<RealisticAvatarWrapperProps> = ({
  isListening,
  isSpeaking,
  emotion,
  gender,
  useRealistic = false
}) => {
  // Si useRealistic est activé et que c'est féminin, utiliser l'avatar réaliste
  if (useRealistic && gender === 'female') {
    return (
      <RealisticFemaleAvatarMesh
        isListening={isListening}
        isSpeaking={isSpeaking}
        emotion={emotion}
      />
    );
  }

  // Sinon, utiliser les avatars standards
  if (gender === 'female') {
    return (
      <FemaleAvatarMesh
        isListening={isListening}
        isSpeaking={isSpeaking}
        emotion={emotion}
      />
    );
  }

  return (
    <MaleAvatarMesh
      isListening={isListening}
      isSpeaking={isSpeaking}
      emotion={emotion}
    />
  );
};
