
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RealisticAvatarWrapper } from './avatar/RealisticAvatarWrapper';
import { Gender } from '@/types/gender';

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender?: Gender;
}

function AvatarMesh({ isListening, isSpeaking, emotion }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const getColor = () => {
    switch (emotion) {
      case 'happy': return '#10b981';
      case 'thinking': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Animation de base
      if (isSpeaking) {
        meshRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.1);
      } else if (isListening) {
        meshRef.current.rotation.y = Math.sin(time * 2) * 0.2;
      } else {
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={getColor()} 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

export const Avatar3D: React.FC<AvatarProps> = ({ 
  isListening, 
  isSpeaking, 
  emotion, 
  gender = 'female' 
}) => {
  console.log('🎭 Avatar3D rendering with:', { isListening, isSpeaking, emotion, gender });
  
  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-700 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4] }} shadows>
        {/* Éclairage amélioré pour le réalisme */}
        <ambientLight intensity={0.4} color="#ffeaa7" />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1.2} 
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight 
          position={[-5, 5, 5]} 
          intensity={0.6} 
          color="#74b9ff" 
        />
        <pointLight 
          position={[5, -5, 5]} 
          intensity={0.3} 
          color="#fd79a8" 
        />
        
        {/* Avatar réaliste activé par défaut pour le genre féminin */}
        <RealisticAvatarWrapper
          isListening={isListening}
          isSpeaking={isSpeaking}
          emotion={emotion}
          gender={gender}
          useRealistic={true}
        />
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={2}
          maxDistance={8}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};
