
import { useRef } from 'react';
import * as THREE from 'three';

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

interface AnimationRefs {
  headRef: React.RefObject<THREE.Group>;
  bodyRef: React.RefObject<THREE.Group>;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
}

interface AnimationProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const useMaleAvatarAnimations = ({ isListening, isSpeaking }: AnimationProps) => {
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

  const animateAvatar = (refs: AnimationRefs, state: any, delta: number) => {
    const time = state.clock.elapsedTime;
    const ease = 0.05;
    
    if (refs.headRef.current && refs.bodyRef.current) {
      // Animation de respiration
      animationState.current.breathePhase += delta * 1.5;
      const breathe = Math.sin(animationState.current.breathePhase) * 0.015;
      refs.bodyRef.current.scale.y = THREE.MathUtils.lerp(refs.bodyRef.current.scale.y, 1 + breathe, ease);
      
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
      refs.headRef.current.rotation.y = animationState.current.headRotationY;
      refs.headRef.current.rotation.x = animationState.current.headRotationX;
      refs.headRef.current.rotation.z = animationState.current.headRotationZ;
      
      // Animation des yeux
      const shouldBlink = Math.sin(time * 0.7) < -0.9;
      const targetEyeScale = shouldBlink ? 0.1 : 1;
      animationState.current.eyeScale = THREE.MathUtils.lerp(
        animationState.current.eyeScale,
        targetEyeScale,
        ease * 4
      );
      
      if (refs.eyeLeftRef.current && refs.eyeRightRef.current) {
        refs.eyeLeftRef.current.scale.y = animationState.current.eyeScale;
        refs.eyeRightRef.current.scale.y = animationState.current.eyeScale;
      }
      
      // Animation de la bouche
      if (refs.mouthRef.current) {
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
        
        refs.mouthRef.current.scale.y = animationState.current.mouthScale;
        refs.mouthRef.current.scale.x = animationState.current.mouthScaleX;
      }
    }
  };

  return { animateAvatar };
};
