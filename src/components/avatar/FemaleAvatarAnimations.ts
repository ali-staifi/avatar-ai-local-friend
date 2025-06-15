
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimationState {
  breathePhase: number;
  headRotationX: number;
  headRotationY: number;
  headRotationZ: number;
  hairRotationZ: number;
  eyeScale: number;
  mouthScale: number;
  mouthScaleX: number;
  targetRotationY: number;
  targetRotationX: number;
  targetRotationZ: number;
  targetHairRotationZ: number;
}

interface AnimationRefs {
  headRef: React.RefObject<THREE.Group>;
  bodyRef: React.RefObject<THREE.Group>;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  hairRef: React.RefObject<THREE.Mesh>;
}

interface AnimationProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const useFemaleAvatarAnimations = ({ isListening, isSpeaking }: AnimationProps) => {
  const animationState = useRef<AnimationState>({
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

  const animateAvatar = (refs: AnimationRefs, state: any, delta: number) => {
    const time = state.clock.elapsedTime;
    const ease = 0.06;
    
    if (refs.headRef.current && refs.bodyRef.current) {
      // Animation de respiration plus fluide et féminine
      animationState.current.breathePhase += delta * 1.8;
      const breathe = Math.sin(animationState.current.breathePhase) * 0.018;
      refs.bodyRef.current.scale.y = THREE.MathUtils.lerp(refs.bodyRef.current.scale.y, 1 + breathe, ease);
      
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
      refs.headRef.current.rotation.y = animationState.current.headRotationY;
      refs.headRef.current.rotation.x = animationState.current.headRotationX;
      refs.headRef.current.rotation.z = animationState.current.headRotationZ;
      
      // Animation des cheveux
      if (refs.hairRef.current) {
        refs.hairRef.current.rotation.z = animationState.current.hairRotationZ;
      }
      
      // Animation des yeux qui clignent avec transition fluide
      const shouldBlink = Math.sin(time * 0.8) < -0.92;
      const targetEyeScale = shouldBlink ? 0.1 : 1;
      animationState.current.eyeScale = THREE.MathUtils.lerp(
        animationState.current.eyeScale,
        targetEyeScale,
        ease * 5
      );
      
      if (refs.eyeLeftRef.current && refs.eyeRightRef.current) {
        refs.eyeLeftRef.current.scale.y = animationState.current.eyeScale;
        refs.eyeRightRef.current.scale.y = animationState.current.eyeScale;
      }
      
      // Animation de la bouche pendant la parole
      if (refs.mouthRef.current) {
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
        
        refs.mouthRef.current.scale.y = animationState.current.mouthScale;
        refs.mouthRef.current.scale.x = animationState.current.mouthScaleX;
      }
    }
  };

  return { animateAvatar };
};
