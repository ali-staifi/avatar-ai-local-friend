
import React, { useRef } from 'react';
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
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Animation de respiration de base
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      
      // Animations selon l'état
      if (isListening) {
        // Animation d'écoute : rotation légère et pulsation
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.15;
        meshRef.current.scale.setScalar(breathe * 1.08);
        
        // Yeux qui bougent légèrement
        if (eyeLeftRef.current && eyeRightRef.current) {
          const eyeMovement = Math.sin(state.clock.elapsedTime * 4) * 0.02;
          eyeLeftRef.current.position.x = -0.3 + eyeMovement;
          eyeRightRef.current.position.x = 0.3 + eyeMovement;
        }
      } else if (isSpeaking) {
        // Animation de parole : pulsation plus rapide
        const speakPulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.04;
        meshRef.current.scale.setScalar(breathe * speakPulse);
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
      } else {
        // État neutre : juste la respiration
        meshRef.current.scale.setScalar(breathe);
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        
        // Clignement des yeux
        if (eyeLeftRef.current && eyeRightRef.current) {
          const blink = Math.sin(state.clock.elapsedTime * 0.8) > 0.95 ? 0.3 : 1;
          eyeLeftRef.current.scale.y = blink;
          eyeRightRef.current.scale.y = blink;
        }
      }
    }
  });

  const getColor = () => {
    switch (emotion) {
      case 'happy': return '#10b981'; // Vert plus doux
      case 'thinking': return '#3b82f6'; // Bleu plus doux
      default: return '#8b5cf6'; // Violet par défaut
    }
  };

  const getEmissiveIntensity = () => {
    if (isSpeaking) return 0.4;
    if (isListening) return 0.2;
    return 0.1;
  };

  return (
    <group>
      {/* Corps principal de l'avatar */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.85}
          emissive={getColor()}
          emissiveIntensity={getEmissiveIntensity()}
          roughness={0.3}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Yeux blancs */}
      <Sphere ref={eyeLeftRef} args={[0.12, 16, 16]} position={[-0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere ref={eyeRightRef} args={[0.12, 16, 16]} position={[0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      
      {/* Pupilles */}
      <Sphere args={[0.06, 16, 16]} position={[-0.3, 0.3, 0.85]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Sphere>
      <Sphere args={[0.06, 16, 16]} position={[0.3, 0.3, 0.85]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Sphere>
      
      {/* Bouche (indicateur d'état de parole) */}
      {isSpeaking && (
        <Sphere args={[0.08, 16, 16]} position={[0, -0.2, 0.85]}>
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={0.3}
          />
        </Sphere>
      )}
      
      {/* Indicateurs d'état */}
      {isListening && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          🎤 Écoute...
        </Text>
      )}
      
      {isSpeaking && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          💬 Parle...
        </Text>
      )}
      
      {emotion === 'thinking' && !isSpeaking && !isListening && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          🤔 Réfléchit...
        </Text>
      )}
    </group>
  );
}

export const Avatar3D: React.FC<AvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 rounded-lg overflow-hidden shadow-2xl">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Éclairage amélioré */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#60a5fa" />
        <spotLight 
          position={[0, 10, 5]} 
          intensity={0.8} 
          angle={Math.PI / 6}
          penumbra={0.3}
          color="#fbbf24"
        />
        
        <AvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          emotion={emotion} 
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3.5}
          autoRotate={false}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
};
