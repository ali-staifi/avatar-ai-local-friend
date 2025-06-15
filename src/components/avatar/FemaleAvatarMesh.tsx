
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFemaleAvatarAnimations } from './FemaleAvatarAnimations';
import { FemaleAvatarBody, FemaleAvatarHead } from './FemaleAvatarGeometry';

interface FemaleAvatarMeshProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const FemaleAvatarMesh: React.FC<FemaleAvatarMeshProps> = ({ 
  isListening, 
  isSpeaking, 
  emotion 
}) => {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);

  const { animateAvatar } = useFemaleAvatarAnimations({ isListening, isSpeaking });

  useFrame((state, delta) => {
    const refs = {
      headRef,
      bodyRef,
      eyeLeftRef,
      eyeRightRef,
      mouthRef,
      hairRef
    };
    
    animateAvatar(refs, state, delta);
  });

  const getHeadColor = () => {
    if (isListening) return '#ec4899';
    if (isSpeaking) return '#3b82f6';
    switch (emotion) {
      case 'happy': return '#10b981';
      case 'thinking': return '#8b5cf6';
      default: return '#f59e0b';
    }
  };

  return (
    <group>
      {/* Corps */}
      <group ref={bodyRef} position={[0, -1.5, 0]}>
        <FemaleAvatarBody />
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <FemaleAvatarHead 
          headColor={getHeadColor()}
          eyeLeftRef={eyeLeftRef}
          eyeRightRef={eyeRightRef}
          mouthRef={mouthRef}
          hairRef={hairRef}
          emotion={emotion}
        />
      </group>
    </group>
  );
};
