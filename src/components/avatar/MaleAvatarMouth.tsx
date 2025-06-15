
import React from 'react';
import * as THREE from 'three';

interface MaleAvatarMouthProps {
  mouthRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarMouth: React.FC<MaleAvatarMouthProps> = ({ 
  mouthRef, 
  emotion 
}) => {
  const getMouthShape = () => {
    switch (emotion) {
      case 'happy': return { scaleX: 1.4, scaleY: 0.7, positionY: -0.3 };
      case 'thinking': return { scaleX: 0.8, scaleY: 1.3, positionY: -0.35 };
      default: return { scaleX: 1, scaleY: 1, positionY: -0.3 };
    }
  };

  const mouthShape = getMouthShape();

  return (
    <>
      {/* Bouche masculine selon l'émotion */}
      <mesh 
        ref={mouthRef} 
        position={[0, mouthShape.positionY, 0.8]}
        scale={[mouthShape.scaleX, mouthShape.scaleY, 1]}
      >
        <sphereGeometry args={[0.2, 32, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#cd5c5c' : '#dc2626'} 
          shininess={50}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Contour des lèvres masculines */}
      <mesh position={[0, mouthShape.positionY + 0.05, 0.81]} scale={[mouthShape.scaleX * 1.1, 0.25, 0.8]}>
        <sphereGeometry args={[0.21, 32, 16]} />
        <meshPhongMaterial 
          color="#a0522d" 
          transparent={true}
          opacity={0.6}
          shininess={30}
        />
      </mesh>
    </>
  );
};
