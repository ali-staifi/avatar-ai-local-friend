
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
  
  // États pour les animations fluides
  const animationState = useRef({
    breathePhase: 0,
    headRotationX: 0,
    headRotationY: 0,
    headRotationZ: 0,
    hairRotationZ: 0,
    eyeScale: 1,
    mouthScale: 1,
    mouthScaleX: 1,
    targetRotationY: 0,
    targetRotationX: 0,
    targetRotationZ: 0,
    targetHairRotationZ: 0
  });

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const ease = 0.06; // Facteur d'easing légèrement plus rapide pour un mouvement plus vif
    
    if (headRef.current && bodyRef.current) {
      // Animation de respiration plus fluide et féminine
      animationState.current.breathePhase += delta * 1.8;
      const breathe = Math.sin(animationState.current.breathePhase) * 0.018;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1 + breathe, ease);
      
      // Définir les rotations cibles selon l'état
      if (isSpeaking) {
        // Animation de parole - mouvement expressif et gracieux
        animationState.current.targetRotationY = Math.sin(time * 7) * 0.1;
        animationState.current.targetRotationX = Math.sin(time * 5) * 0.05;
        animationState.current.targetRotationZ = Math.sin(time * 6) * 0.04;
        animationState.current.targetHairRotationZ = Math.sin(time * 4) * 0.08;
      } else if (isListening) {
        // Animation d'écoute - mouvement attentif et délicat
        animationState.current.targetRotationY = Math.sin(time * 2.2) * 0.08;
        animationState.current.targetRotationX = Math.sin(time * 1.8) * 0.04;
        animationState.current.targetRotationZ = Math.sin(time * 2.8) * 0.06;
        animationState.current.targetHairRotationZ = Math.sin(time * 3) * 0.05;
      } else {
        // Mouvement subtil au repos - plus gracieux
        animationState.current.targetRotationY = Math.sin(time * 0.9) * 0.05;
        animationState.current.targetRotationX = Math.sin(time * 0.7) * 0.03;
        animationState.current.targetRotationZ = Math.sin(time * 0.8) * 0.02;
        animationState.current.targetHairRotationZ = Math.sin(time * 1.2) * 0.03;
      }
      
      // Interpolation fluide des rotations
      animationState.current.headRotationY = THREE.MathUtils.lerp(
        animationState.current.headRotationY,
        animationState.current.targetRotationY,
        ease * 2.2
      );
      animationState.current.headRotationX = THREE.MathUtils.lerp(
        animationState.current.headRotationX,
        animationState.current.targetRotationX,
        ease * 2.2
      );
      animationState.current.headRotationZ = THREE.MathUtils.lerp(
        animationState.current.headRotationZ,
        animationState.current.targetRotationZ,
        ease * 2.2
      );
      animationState.current.hairRotationZ = THREE.MathUtils.lerp(
        animationState.current.hairRotationZ,
        animationState.current.targetHairRotationZ,
        ease * 1.8
      );
      
      // Appliquer les rotations
      headRef.current.rotation.y = animationState.current.headRotationY;
      headRef.current.rotation.x = animationState.current.headRotationX;
      headRef.current.rotation.z = animationState.current.headRotationZ;
      
      // Animation des cheveux
      if (hairRef.current) {
        hairRef.current.rotation.z = animationState.current.hairRotationZ;
      }
      
      // Animation des yeux qui clignent avec transition fluide
      const shouldBlink = Math.sin(time * 0.8) < -0.92;
      const targetEyeScale = shouldBlink ? 0.1 : 1;
      animationState.current.eyeScale = THREE.MathUtils.lerp(
        animationState.current.eyeScale,
        targetEyeScale,
        ease * 5
      );
      
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y = animationState.current.eyeScale;
        eyeRightRef.current.scale.y = animationState.current.eyeScale;
      }
      
      // Animation de la bouche pendant la parole
      if (mouthRef.current) {
        if (isSpeaking) {
          const targetMouthScale = 1 + Math.sin(time * 18) * 0.5;
          const targetMouthScaleX = 1 + Math.sin(time * 14) * 0.35;
          
          animationState.current.mouthScale = THREE.MathUtils.lerp(
            animationState.current.mouthScale,
            targetMouthScale,
            ease * 7
          );
          animationState.current.mouthScaleX = THREE.MathUtils.lerp(
            animationState.current.mouthScaleX,
            targetMouthScaleX,
            ease * 7
          );
        } else {
          animationState.current.mouthScale = THREE.MathUtils.lerp(
            animationState.current.mouthScale,
            1,
            ease * 4
          );
          animationState.current.mouthScaleX = THREE.MathUtils.lerp(
            animationState.current.mouthScaleX,
            1,
            ease * 4
          );
        }
        
        mouthRef.current.scale.y = animationState.current.mouthScale;
        mouthRef.current.scale.x = animationState.current.mouthScaleX;
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
          <cylinderGeometry args={[0.7, 1.1, 2, 16]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
        
        {/* Bras */}
        <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 12]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
        <mesh position={[1.2, 0.5, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 12]} />
          <meshStandardMaterial color="#db2777" />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.9, 64, 64]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Cheveux */}
        <mesh ref={hairRef} position={[0, 0.4, -0.2]} scale={[1.2, 0.8, 1.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Yeux */}
        <mesh ref={eyeLeftRef} position={[-0.25, 0.15, 0.75]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.25, 0.15, 0.75]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Pupilles */}
        <mesh position={[-0.25, 0.15, 0.85]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.25, 0.15, 0.85]}>
          <sphereGeometry args={[0.06, 32, 32]} />
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
          <sphereGeometry args={[0.15, 32, 16]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Nez */}
        <mesh position={[0, 0.05, 0.85]}>
          <coneGeometry args={[0.08, 0.25, 16]} />
          <meshStandardMaterial color={getHeadColor()} />
        </mesh>
        
        {/* Boucles d'oreilles */}
        <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.02, 16, 32]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.02, 16, 32]} />
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
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
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
