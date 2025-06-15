
import React from 'react';
import * as THREE from 'three';

interface MaleAvatarEyesProps {
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarEyes: React.FC<MaleAvatarEyesProps> = ({ 
  eyeLeftRef, 
  eyeRightRef, 
  emotion 
}) => {
  return (
    <>
      {/* Yeux plus expressifs */}
      <mesh ref={eyeLeftRef} position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={100}
          specular="#ffffff"
        />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={100}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Iris colorés avec reflets */}
      <mesh position={[-0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshPhongMaterial 
          color="#228b22" 
          shininess={150}
          specular="#90ee90"
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshPhongMaterial 
          color="#228b22" 
          shininess={150}
          specular="#90ee90"
        />
      </mesh>
      
      {/* Pupilles */}
      <mesh position={[-0.3, 0.2, 0.92]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.92]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Reflets dans les yeux */}
      <mesh position={[-0.28, 0.22, 0.93]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.32, 0.22, 0.93]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Sourcils masculins plus épais */}
      <mesh position={[-0.3, 0.35, 0.85]} scale={[1.3, 0.4, 0.6]} rotation={[0, 0, emotion === 'thinking' ? 0.25 : 0]}>
        <boxGeometry args={[0.18, 0.08, 0.06]} />
        <meshPhongMaterial color="#3c2415" shininess={15} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.85]} scale={[1.3, 0.4, 0.6]} rotation={[0, 0, emotion === 'thinking' ? -0.25 : 0]}>
        <boxGeometry args={[0.18, 0.08, 0.06]} />
        <meshPhongMaterial color="#3c2415" shininess={15} />
      </mesh>
    </>
  );
};
