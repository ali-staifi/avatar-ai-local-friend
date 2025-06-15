
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MaleAvatarBody, MaleAvatarHead } from './MaleAvatarGeometry';

interface MaleAvatarMeshProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

interface AnimationState {
  breathePhase: number;
  headRotationX: number;
  headRotationY: number;
  headRotationZ: number;
  eyeScale: number;
  mouthScale: number;
  mouthScaleX: number;
  targetRotationY: number;
  targetRotationX: number;
  targetRotationZ: number;
}

export const MaleAvatarMesh: React.FC<MaleAvatarMeshProps> = ({ 
  isListening, 
  isSpeaking, 
  emotion 
}) => {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  const animationState = useRef<AnimationState>({
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
    const ease = 0.05;
    
    if (headRef.current && bodyRef.current) {
      // Animation de respiration
      animationState.current.breathePhase += delta * 1.5;
      const breathe = Math.sin(animationState.current.breathePhase) * 0.015;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1 + breathe, ease);
      
      // Définir les rotations cibles selon l'état
      if (isSpeaking) {
        animationState.current.targetRotationY = Math.sin(time * 6) * 0.08;
        animationState.current.targetRotationX = Math.sin(time * 4) * 0.04;
        animationState.current.targetRotationZ = Math.sin(time * 5) * 0.03;
      } else if (isListening) {
        animationState.current.targetRotationY = Math.sin(time * 2) * 0.06;
        animationState.current.targetRotationX = Math.sin(time * 1.5) * 0.03;
        animationState.current.targetRotationZ = Math.sin(time * 2.5) * 0.05;
      } else {
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
      
      // Animation des yeux
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
      
      // Animation de la bouche
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
        <MaleAvatarBody />
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <MaleAvatarHead 
          headColor={getHeadColor()}
          eyeLeftRef={eyeLeftRef}
          eyeRightRef={eyeRightRef}
          mouthRef={mouthRef}
          emotion={emotion}
        />
      </group>
    </group>
  );
};
