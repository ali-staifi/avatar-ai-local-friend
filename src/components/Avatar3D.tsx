
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

function AvatarMesh({ isListening, isSpeaking, emotion }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Animation de respiration
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      // Animation pour l'écoute
      if (isListening) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(breathe * 1.1);
      } else if (isSpeaking) {
        // Animation pour parler
        meshRef.current.scale.setScalar(breathe * 1.05);
      } else {
        meshRef.current.scale.setScalar(breathe);
      }
    }
  });

  const getColor = () => {
    switch (emotion) {
      case 'happy': return '#4ade80';
      case 'thinking': return '#60a5fa';
      default: return '#8b5cf6';
    }
  };

  return (
    <group>
      {/* Corps principal de l'avatar */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.8}
          emissive={getColor()}
          emissiveIntensity={isSpeaking ? 0.3 : 0.1}
        />
      </Sphere>
      
      {/* Yeux */}
      <Sphere args={[0.1, 16, 16]} position={[-0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      
      {/* Pupils */}
      <Sphere args={[0.05, 16, 16]} position={[-0.3, 0.3, 0.85]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[0.3, 0.3, 0.85]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      
      {/* Indicateur d'état */}
      {isListening && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          🔴 Écoute...
        </Text>
      )}
      
      {isSpeaking && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          🔊 Parle...
        </Text>
      )}
    </group>
  );
}

export const Avatar3D: React.FC<AvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
        
        <AvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          emotion={emotion} 
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};
