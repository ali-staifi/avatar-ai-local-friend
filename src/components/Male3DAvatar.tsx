
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
  
  // États pour les animations fluides
  const animationState = useRef({
    breathePhase: 0,
    headRotationX: 0,
    headRotationY: 0,
    headRotationZ: 0,
    eyeScale: 1,
    mouthScale: 1,
    mouthScaleX: 1,
    targetRotationY: 0,
    targetRotationX: 0,
    targetRotationZ: 0
  });

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const ease = 0.05; // Facteur d'easing pour les transitions fluides
    
    if (headRef.current && bodyRef.current) {
      // Animation de respiration plus fluide
      animationState.current.breathePhase += delta * 1.5;
      const breathe = Math.sin(animationState.current.breathePhase) * 0.015;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1 + breathe, ease);
      
      // Définir les rotations cibles selon l'état
      if (isSpeaking) {
        // Animation de parole - mouvement plus expressif
        animationState.current.targetRotationY = Math.sin(time * 6) * 0.08;
        animationState.current.targetRotationX = Math.sin(time * 4) * 0.04;
        animationState.current.targetRotationZ = Math.sin(time * 5) * 0.03;
      } else if (isListening) {
        // Animation d'écoute - légère inclinaison attentive
        animationState.current.targetRotationY = Math.sin(time * 2) * 0.06;
        animationState.current.targetRotationX = Math.sin(time * 1.5) * 0.03;
        animationState.current.targetRotationZ = Math.sin(time * 2.5) * 0.05;
      } else {
        // Mouvement subtil au repos
        animationState.current.targetRotationY = Math.sin(time * 0.8) * 0.04;
        animationState.current.targetRotationX = Math.sin(time * 0.6) * 0.02;
        animationState.current.targetRotationZ = Math.sin(time * 0.7) * 0.01;
      }
      
      // Interpolation fluide des rotations
      animationState.current.headRotationY = THREE.MathUtils.lerp(
        animationState.current.headRotationY,
        animationState.current.targetRotationY,
        ease * 2
      );
      animationState.current.headRotationX = THREE.MathUtils.lerp(
        animationState.current.headRotationX,
        animationState.current.targetRotationX,
        ease * 2
      );
      animationState.current.headRotationZ = THREE.MathUtils.lerp(
        animationState.current.headRotationZ,
        animationState.current.targetRotationZ,
        ease * 2
      );
      
      // Appliquer les rotations
      headRef.current.rotation.y = animationState.current.headRotationY;
      headRef.current.rotation.x = animationState.current.headRotationX;
      headRef.current.rotation.z = animationState.current.headRotationZ;
      
      // Animation des yeux qui clignent avec transition fluide
      const shouldBlink = Math.sin(time * 0.7) < -0.9;
      const targetEyeScale = shouldBlink ? 0.1 : 1;
      animationState.current.eyeScale = THREE.MathUtils.lerp(
        animationState.current.eyeScale,
        targetEyeScale,
        ease * 4
      );
      
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y = animationState.current.eyeScale;
        eyeRightRef.current.scale.y = animationState.current.eyeScale;
      }
      
      // Animation de la bouche pendant la parole
      if (mouthRef.current) {
        if (isSpeaking) {
          const targetMouthScale = 1 + Math.sin(time * 15) * 0.4;
          const targetMouthScaleX = 1 + Math.sin(time * 12) * 0.3;
          
          animationState.current.mouthScale = THREE.MathUtils.lerp(
            animationState.current.mouthScale,
            targetMouthScale,
            ease * 6
          );
          animationState.current.mouthScaleX = THREE.MathUtils.lerp(
            animationState.current.mouthScaleX,
            targetMouthScaleX,
            ease * 6
          );
        } else {
          animationState.current.mouthScale = THREE.MathUtils.lerp(
            animationState.current.mouthScale,
            1,
            ease * 3
          );
          animationState.current.mouthScaleX = THREE.MathUtils.lerp(
            animationState.current.mouthScaleX,
            1,
            ease * 3
          );
        }
        
        mouthRef.current.scale.y = animationState.current.mouthScale;
        mouthRef.current.scale.x = animationState.current.mouthScaleX;
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
          <cylinderGeometry args={[0.8, 1.2, 2, 16]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        
        {/* Bras */}
        <mesh position={[-1.3, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.2, 0.25, 1.5, 12]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        <mesh position={[1.3, 0.5, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.2, 0.25, 1.5, 12]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Yeux */}
        <mesh ref={eyeLeftRef} position={[-0.3, 0.2, 0.8]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.3, 0.2, 0.8]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Pupilles */}
        <mesh position={[-0.3, 0.2, 0.9]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.3, 0.2, 0.9]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Bouche */}
        <mesh ref={mouthRef} position={[0, -0.3, 0.8]}>
          <sphereGeometry args={[0.2, 32, 16]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Nez */}
        <mesh position={[0, 0, 0.9]}>
          <coneGeometry args={[0.1, 0.3, 16]} />
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
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
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
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg transition-all duration-300">
          <p className="text-sm font-medium text-center text-gray-800">
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};
