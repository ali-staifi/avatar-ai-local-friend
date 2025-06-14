
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
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

export const Avatar3D: React.FC<AvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('Avatar3D rendering with:', { isListening, isSpeaking, emotion });
  
  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-700 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <AvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          emotion={emotion} 
        />
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};
