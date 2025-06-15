
import React from 'react';
import * as THREE from 'three';

interface FemaleGeometryProps {
  headColor: string;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  hairRef: React.RefObject<THREE.Mesh>;
}

export const FemaleAvatarBody: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export const FemaleAvatarHead: React.FC<FemaleGeometryProps> = ({ 
  headColor, 
  eyeLeftRef, 
  eyeRightRef, 
  mouthRef, 
  hairRef 
}) => {
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial color={headColor} />
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
        <meshStandardMaterial color={headColor} />
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
    </>
  );
};
