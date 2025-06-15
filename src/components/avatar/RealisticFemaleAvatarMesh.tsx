
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFemaleAvatarAnimations } from './FemaleAvatarAnimations';
import { RealisticFemaleAvatarBody, RealisticFemaleAvatarHead } from './RealisticFemaleAvatarGeometry';

interface RealisticFemaleAvatarMeshProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const RealisticFemaleAvatarMesh: React.FC<RealisticFemaleAvatarMeshProps> = ({ 
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
      {/* Éclairage environnemental amélioré pour plus de réalisme */}
      <ambientLight intensity={0.6} color="#ffeaa7" />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        color="#ffffff"
        castShadow
      />
      <pointLight 
        position={[-3, 5, 3]} 
        intensity={0.4} 
        color="#74b9ff" 
      />
      
      {/* Corps */}
      <group ref={bodyRef} position={[0, -1.5, 0]}>
        <RealisticFemaleAvatarBody />
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <RealisticFemaleAvatarHead 
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
