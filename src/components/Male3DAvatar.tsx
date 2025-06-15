
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Male3DAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

function MaleAvatarMesh({ isListening, isSpeaking, emotion }: Male3DAvatarProps) {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (headRef.current && bodyRef.current) {
      // Animation de respiration
      const breathe = Math.sin(time * 2) * 0.02;
      bodyRef.current.scale.y = 1 + breathe;
      
      // Mouvement de tête subtil
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
      
      // Animations spécifiques selon l'état
      if (isSpeaking) {
        // Animation de parole - mouvement plus prononcé
        headRef.current.rotation.y += Math.sin(time * 8) * 0.05;
        if (mouthRef.current) {
          mouthRef.current.scale.y = 1 + Math.sin(time * 12) * 0.3;
        }
      } else if (isListening) {
        // Animation d'écoute - légère inclinaison
        headRef.current.rotation.z = Math.sin(time * 3) * 0.1;
      }
      
      // Animation des yeux qui clignent
      const blink = Math.sin(time * 0.5) < -0.8 ? 0.1 : 1;
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y = blink;
        eyeRightRef.current.scale.y = blink;
      }
    }
  });

  const getHeadColor = () => {
    if (isListening) return '#ef4444';
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
          <cylinderGeometry args={[0.8, 1.2, 2, 8]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        
        {/* Bras */}
        <mesh position={[-1.3, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.2, 0.25, 1.5, 8]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        <mesh position={[1.3, 0.5, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.2, 0.25, 1.5, 8]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Yeux */}
        <mesh ref={eyeLeftRef} position={[-0.3, 0.2, 0.8]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.3, 0.2, 0.8]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Pupilles */}
        <mesh position={[-0.3, 0.2, 0.9]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.3, 0.2, 0.9]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Bouche */}
        <mesh ref={mouthRef} position={[0, -0.3, 0.8]}>
          <sphereGeometry args={[0.2, 16, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Nez */}
        <mesh position={[0, 0, 0.9]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
      </group>
    </group>
  );
}

export const Male3DAvatar: React.FC<Male3DAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👨 Male3DAvatar rendering with:', { isListening, isSpeaking, emotion });

  const getStatusText = () => {
    if (isListening) return '🎤 Écoute...';
    if (isSpeaking) return '🗣️ Parle...';
    switch (emotion) {
      case 'happy': return '😊 Content';
      case 'thinking': return '🤔 Réfléchit...';
      default: return '💭 Prêt';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        <MaleAvatarMesh 
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
