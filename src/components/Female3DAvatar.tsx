
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Female3DAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

function FemaleAvatarMesh({ isListening, isSpeaking, emotion }: Female3DAvatarProps) {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (headRef.current && bodyRef.current) {
      // Animation de respiration
      const breathe = Math.sin(time * 2.2) * 0.02;
      bodyRef.current.scale.y = 1 + breathe;
      
      // Mouvement de tête gracieux
      headRef.current.rotation.y = Math.sin(time * 0.4) * 0.12;
      headRef.current.rotation.x = Math.sin(time * 0.25) * 0.06;
      
      // Cheveux qui bougent
      if (hairRef.current) {
        hairRef.current.rotation.z = Math.sin(time * 1.5) * 0.05;
      }
      
      // Animations spécifiques selon l'état
      if (isSpeaking) {
        // Animation de parole - mouvement expressif
        headRef.current.rotation.y += Math.sin(time * 10) * 0.06;
        if (mouthRef.current) {
          mouthRef.current.scale.y = 1 + Math.sin(time * 15) * 0.4;
          mouthRef.current.scale.x = 1 + Math.sin(time * 12) * 0.2;
        }
      } else if (isListening) {
        // Animation d'écoute - mouvement attentif
        headRef.current.rotation.z = Math.sin(time * 2.5) * 0.08;
      }
      
      // Animation des yeux qui clignent
      const blink = Math.sin(time * 0.6) < -0.85 ? 0.1 : 1;
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y = blink;
        eyeRightRef.current.scale.y = blink;
      }
    }
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
        <mesh>
          <cylinderGeometry args={[0.7, 1.1, 2, 8]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
        
        {/* Bras */}
        <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 8]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
        <mesh position={[1.2, 0.5, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 8]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Cheveux */}
        <mesh ref={hairRef} position={[0, 0.4, -0.2]} scale={[1.2, 0.8, 1.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Yeux */}
        <mesh ref={eyeLeftRef} position={[-0.25, 0.15, 0.75]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.25, 0.15, 0.75]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Pupilles */}
        <mesh position={[-0.25, 0.15, 0.85]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.25, 0.15, 0.85]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Cils */}
        <mesh position={[-0.25, 0.25, 0.8]} scale={[1, 0.1, 0.5]}>
          <boxGeometry args={[0.15, 0.1, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.25, 0.25, 0.8]} scale={[1, 0.1, 0.5]}>
          <boxGeometry args={[0.15, 0.1, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Bouche */}
        <mesh ref={mouthRef} position={[0, -0.25, 0.75]}>
          <sphereGeometry args={[0.15, 16, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Nez */}
        <mesh position={[0, 0.05, 0.85]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Boucles d'oreilles */}
        <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.02, 8, 16]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.02, 8, 16]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      </group>
    </group>
  );
}

export const Female3DAvatar: React.FC<Female3DAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👩 Female3DAvatar rendering with:', { isListening, isSpeaking, emotion });

  const getStatusText = () => {
    if (isListening) return '🎤 Écoute...';
    if (isSpeaking) return '🗣️ Parle...';
    switch (emotion) {
      case 'happy': return '😊 Contente';
      case 'thinking': return '🤔 Réfléchit...';
      default: return '💭 Prête';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-pink-50 to-purple-100 rounded-lg overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#ffb6c1" />
        
        <FemaleAvatarMesh 
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
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-center text-gray-800">
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};
