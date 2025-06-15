
import React from 'react';
import * as THREE from 'three';

interface FemaleGeometryProps {
  headColor: string;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  hairRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const FemaleAvatarBody: React.FC = () => {
  return (
    <>
      {/* Corps principal avec texture de robe */}
      <mesh>
        <cylinderGeometry args={[0.7, 1.1, 2, 32]} />
        <meshPhongMaterial 
          color="#e91e63" 
          shininess={30}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Détails de la robe - ceinture */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.1, 32]} />
        <meshPhongMaterial color="#c2185b" shininess={50} />
      </mesh>
      
      {/* Manches détaillées */}
      <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.18, 0.22, 1.4, 16]} />
        <meshPhongMaterial 
          color="#e91e63" 
          shininess={30}
          specular="#ffffff"
        />
      </mesh>
      <mesh position={[1.2, 0.5, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.18, 0.22, 1.4, 16]} />
        <meshPhongMaterial 
          color="#e91e63" 
          shininess={30}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Poignets avec détails */}
      <mesh position={[-1.2, -0.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshPhongMaterial color="#fdbcb4" shininess={20} />
      </mesh>
      <mesh position={[1.2, -0.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshPhongMaterial color="#fdbcb4" shininess={20} />
      </mesh>
    </>
  );
};

export const FemaleAvatarHead: React.FC<FemaleGeometryProps> = ({ 
  headColor, 
  eyeLeftRef, 
  eyeRightRef, 
  mouthRef, 
  hairRef,
  emotion 
}) => {
  const getSkinColor = () => {
    return emotion === 'happy' ? '#fdbcb4' : '#f8b2aa';
  };

  const getMouthShape = () => {
    switch (emotion) {
      case 'happy': return { scaleX: 1.3, scaleY: 0.8, positionY: -0.25 };
      case 'thinking': return { scaleX: 0.8, scaleY: 1.2, positionY: -0.3 };
      default: return { scaleX: 1, scaleY: 1, positionY: -0.25 };
    }
  };

  const mouthShape = getMouthShape();

  return (
    <>
      {/* Tête avec texture de peau réaliste */}
      <mesh>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshPhongMaterial 
          color={getSkinColor()}
          shininess={10}
          specular="#ffffff"
          transparent={true}
          opacity={0.95}
        />
      </mesh>
      
      {/* Cheveux avec texture plus réaliste */}
      <mesh ref={hairRef} position={[0, 0.4, -0.2]} scale={[1.2, 0.8, 1.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color="#8b4513" 
          shininess={80}
          specular="#a0522d"
        />
      </mesh>
      
      {/* Mèches de cheveux supplémentaires */}
      <mesh position={[-0.6, 0.3, 0.4]} scale={[0.3, 0.8, 0.3]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshPhongMaterial color="#a0522d" shininess={60} />
      </mesh>
      <mesh position={[0.6, 0.3, 0.4]} scale={[0.3, 0.8, 0.3]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshPhongMaterial color="#a0522d" shininess={60} />
      </mesh>
      
      {/* Yeux plus expressifs */}
      <mesh ref={eyeLeftRef} position={[-0.25, 0.15, 0.75]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={100}
          specular="#ffffff"
        />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.25, 0.15, 0.75]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={100}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Iris colorés avec reflets */}
      <mesh position={[-0.25, 0.15, 0.85]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhongMaterial 
          color="#4a90e2" 
          shininess={150}
          specular="#87ceeb"
        />
      </mesh>
      <mesh position={[0.25, 0.15, 0.85]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhongMaterial 
          color="#4a90e2" 
          shininess={150}
          specular="#87ceeb"
        />
      </mesh>
      
      {/* Pupilles */}
      <mesh position={[-0.25, 0.15, 0.87]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.25, 0.15, 0.87]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Reflets dans les yeux */}
      <mesh position={[-0.23, 0.17, 0.88]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.27, 0.17, 0.88]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Sourcils définis */}
      <mesh position={[-0.25, 0.28, 0.8]} scale={[1.2, 0.3, 0.5]} rotation={[0, 0, emotion === 'thinking' ? 0.2 : 0]}>
        <boxGeometry args={[0.15, 0.06, 0.05]} />
        <meshPhongMaterial color="#654321" shininess={20} />
      </mesh>
      <mesh position={[0.25, 0.28, 0.8]} scale={[1.2, 0.3, 0.5]} rotation={[0, 0, emotion === 'thinking' ? -0.2 : 0]}>
        <boxGeometry args={[0.15, 0.06, 0.05]} />
        <meshPhongMaterial color="#654321" shininess={20} />
      </mesh>
      
      {/* Cils plus détaillés */}
      <mesh position={[-0.25, 0.25, 0.82]} scale={[1.2, 0.2, 0.3]}>
        <boxGeometry args={[0.15, 0.08, 0.03]} />
        <meshPhongMaterial color="#2c1810" shininess={10} />
      </mesh>
      <mesh position={[0.25, 0.25, 0.82]} scale={[1.2, 0.2, 0.3]}>
        <boxGeometry args={[0.15, 0.08, 0.03]} />
        <meshPhongMaterial color="#2c1810" shininess={10} />
      </mesh>
      
      {/* Joues avec couleur selon l'émotion */}
      <mesh position={[-0.45, -0.05, 0.65]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#ff9999' : '#f4c2c2'} 
          transparent={true}
          opacity={0.6}
          shininess={5}
        />
      </mesh>
      <mesh position={[0.45, -0.05, 0.65]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#ff9999' : '#f4c2c2'} 
          transparent={true}
          opacity={0.6}
          shininess={5}
        />
      </mesh>
      
      {/* Bouche plus définie selon l'émotion */}
      <mesh 
        ref={mouthRef} 
        position={[0, mouthShape.positionY, 0.75]}
        scale={[mouthShape.scaleX, mouthShape.scaleY, 1]}
      >
        <sphereGeometry args={[0.15, 32, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#ff6b9d' : '#dc2626'} 
          shininess={60}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Contour des lèvres */}
      <mesh position={[0, mouthShape.positionY + 0.05, 0.76]} scale={[mouthShape.scaleX * 1.1, 0.3, 0.8]}>
        <sphereGeometry args={[0.16, 32, 16]} />
        <meshPhongMaterial 
          color="#b91c1c" 
          transparent={true}
          opacity={0.7}
          shininess={40}
        />
      </mesh>
      
      {/* Nez plus défini */}
      <mesh position={[0, 0.05, 0.85]}>
        <coneGeometry args={[0.08, 0.25, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={15}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Narines subtiles */}
      <mesh position={[-0.03, -0.02, 0.87]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshPhongMaterial color="#e6a199" shininess={5} />
      </mesh>
      <mesh position={[0.03, -0.02, 0.87]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshPhongMaterial color="#e6a199" shininess={5} />
      </mesh>
      
      {/* Boucles d'oreilles avec reflets */}
      <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <meshPhongMaterial 
          color="#ffd700" 
          shininess={200}
          specular="#ffffff"
        />
      </mesh>
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <meshPhongMaterial 
          color="#ffd700" 
          shininess={200}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Petites perles sur les boucles d'oreilles */}
      <mesh position={[-0.9, -0.12, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={300}
          specular="#ffffff"
        />
      </mesh>
      <mesh position={[0.9, -0.12, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={300}
          specular="#ffffff"
        />
      </mesh>
    </>
  );
};
