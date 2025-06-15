
import React from 'react';
import * as THREE from 'three';

interface MaleGeometryProps {
  headColor: string;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarBody: React.FC = () => {
  return (
    <>
      {/* Corps principal avec costume */}
      <mesh>
        <cylinderGeometry args={[0.8, 1.2, 2, 32]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={40}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Chemise */}
      <mesh position={[0, 0.3, 0.85]} scale={[0.9, 1.8, 0.1]}>
        <cylinderGeometry args={[0.8, 1.1, 2, 32]} />
        <meshPhongMaterial color="#ecf0f1" shininess={20} />
      </mesh>
      
      {/* Cravate */}
      <mesh position={[0, 0.2, 0.86]} scale={[0.15, 1.5, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial 
          color="#e74c3c" 
          shininess={60}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Boutons de chemise */}
      <mesh position={[0, 0.6, 0.87]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshPhongMaterial color="#bdc3c7" shininess={100} />
      </mesh>
      <mesh position={[0, 0.2, 0.87]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshPhongMaterial color="#bdc3c7" shininess={100} />
      </mesh>
      <mesh position={[0, -0.2, 0.87]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshPhongMaterial color="#bdc3c7" shininess={100} />
      </mesh>
      
      {/* Manches du costume */}
      <mesh position={[-1.3, 0.5, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.2, 0.25, 1.5, 16]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={40}
          specular="#ffffff"
        />
      </mesh>
      <mesh position={[1.3, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.2, 0.25, 1.5, 16]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={40}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Manchettes de chemise */}
      <mesh position={[-1.3, -0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
        <meshPhongMaterial color="#ecf0f1" shininess={20} />
      </mesh>
      <mesh position={[1.3, -0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
        <meshPhongMaterial color="#ecf0f1" shininess={20} />
      </mesh>
      
      {/* Mains */}
      <mesh position={[-1.3, -0.35, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhongMaterial color="#d4a574" shininess={15} />
      </mesh>
      <mesh position={[1.3, -0.35, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhongMaterial color="#d4a574" shininess={15} />
      </mesh>
    </>
  );
};

export const MaleAvatarHead: React.FC<MaleGeometryProps> = ({ 
  headColor, 
  eyeLeftRef, 
  eyeRightRef, 
  mouthRef,
  emotion 
}) => {
  const getSkinColor = () => {
    return emotion === 'happy' ? '#deb887' : '#d4a574';
  };

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
      {/* Tête avec texture de peau réaliste */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          color={getSkinColor()}
          shininess={8}
          specular="#ffffff"
          transparent={true}
          opacity={0.95}
        />
      </mesh>
      
      {/* Cheveux courts masculins */}
      <mesh position={[0, 0.5, -0.1]} scale={[1.05, 0.6, 1.05]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color="#654321" 
          shininess={40}
          specular="#8b4513"
        />
      </mesh>
      
      {/* Barbe de trois jours */}
      <mesh position={[0, -0.4, 0.3]} scale={[0.8, 0.4, 0.8]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color="#4a4a4a" 
          transparent={true}
          opacity={0.3}
          shininess={5}
        />
      </mesh>
      
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
      
      {/* Nez masculin plus proéminent */}
      <mesh position={[0, 0, 0.9]}>
        <coneGeometry args={[0.1, 0.3, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={12}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Narines */}
      <mesh position={[-0.04, -0.05, 0.92]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhongMaterial color="#c19a6b" shininess={5} />
      </mesh>
      <mesh position={[0.04, -0.05, 0.92]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhongMaterial color="#c19a6b" shininess={5} />
      </mesh>
      
      {/* Oreilles */}
      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 6]} scale={[0.3, 0.8, 0.2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={8} />
      </mesh>
      <mesh position={[1.05, 0, 0]} rotation={[0, 0, -Math.PI / 6]} scale={[0.3, 0.8, 0.2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={8} />
      </mesh>
      
      {/* Menton plus défini */}
      <mesh position={[0, -0.7, 0.4]} scale={[0.8, 0.4, 0.6]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={8}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </>
  );
};
