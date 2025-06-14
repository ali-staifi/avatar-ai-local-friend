
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Extend Three.js objects
extend({ SphereGeometry: THREE.SphereGeometry, MeshStandardMaterial: THREE.MeshStandardMaterial });

interface AvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

function AvatarMesh({ isListening, isSpeaking, emotion }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);

  // Create geometries and materials with useMemo for performance
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const eyeGeometry = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), []);
  const pupilGeometry = useMemo(() => new THREE.SphereGeometry(0.06, 16, 16), []);
  const mouthGeometry = useMemo(() => new THREE.SphereGeometry(0.08, 16, 16), []);

  const getColor = () => {
    switch (emotion) {
      case 'happy': return '#10b981';
      case 'thinking': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  const getEmissiveIntensity = () => {
    if (isSpeaking) return 0.4;
    if (isListening) return 0.2;
    return 0.1;
  };

  const mainMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: getColor(),
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color(getColor()),
      emissiveIntensity: getEmissiveIntensity(),
      roughness: 0.3,
      metalness: 0.1
    }), [emotion, isSpeaking, isListening]);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 'white' }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a' }), []);
  const mouthMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: new THREE.Color('#ef4444'),
      emissiveIntensity: 0.3
    }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      
      if (isListening) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.15;
        meshRef.current.scale.setScalar(breathe * 1.08);
        
        if (eyeLeftRef.current && eyeRightRef.current) {
          const eyeMovement = Math.sin(state.clock.elapsedTime * 4) * 0.02;
          eyeLeftRef.current.position.x = -0.3 + eyeMovement;
          eyeRightRef.current.position.x = 0.3 + eyeMovement;
        }
      } else if (isSpeaking) {
        const speakPulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.04;
        meshRef.current.scale.setScalar(breathe * speakPulse);
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
      } else {
        meshRef.current.scale.setScalar(breathe);
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        
        if (eyeLeftRef.current && eyeRightRef.current) {
          const blink = Math.sin(state.clock.elapsedTime * 0.8) > 0.95 ? 0.3 : 1;
          eyeLeftRef.current.scale.y = blink;
          eyeRightRef.current.scale.y = blink;
        }
      }
    }
  });

  return (
    <group>
      {/* Corps principal */}
      <mesh ref={meshRef} geometry={sphereGeometry} material={mainMaterial} position={[0, 0, 0]} />
      
      {/* Yeux */}
      <mesh ref={eyeLeftRef} geometry={eyeGeometry} material={eyeMaterial} position={[-0.3, 0.3, 0.8]} />
      <mesh ref={eyeRightRef} geometry={eyeGeometry} material={eyeMaterial} position={[0.3, 0.3, 0.8]} />
      
      {/* Pupilles */}
      <mesh geometry={pupilGeometry} material={pupilMaterial} position={[-0.3, 0.3, 0.85]} />
      <mesh geometry={pupilGeometry} material={pupilMaterial} position={[0.3, 0.3, 0.85]} />
      
      {/* Bouche (si parle) */}
      {isSpeaking && (
        <mesh geometry={mouthGeometry} material={mouthMaterial} position={[0, -0.2, 0.85]} />
      )}
      
      {/* Indicateurs d'état */}
      {isListening && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.25}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
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
        dpr={[1, 2]}
      >
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
