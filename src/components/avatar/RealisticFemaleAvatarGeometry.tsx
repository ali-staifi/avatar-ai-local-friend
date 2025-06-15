
import React from 'react';
import * as THREE from 'three';

interface RealisticFemaleGeometryProps {
  headColor: string;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  hairRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const RealisticFemaleAvatarBody: React.FC = () => {
  return (
    <>
      {/* Corps avec une robe élégante */}
      <mesh>
        <cylinderGeometry args={[0.65, 1.0, 2, 32]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={60}
          specular="#4a6741"
        />
      </mesh>
      
      {/* Détails de la robe - texture satinée */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.67, 0.67, 0.15, 32]} />
        <meshPhongMaterial 
          color="#34495e" 
          shininess={120}
          specular="#5d6d7e"
        />
      </mesh>
      
      {/* Manches élégantes */}
      <mesh position={[-1.1, 0.4, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.16, 0.20, 1.3, 16]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={60}
          specular="#4a6741"
        />
      </mesh>
      <mesh position={[1.1, 0.4, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.16, 0.20, 1.3, 16]} />
        <meshPhongMaterial 
          color="#2c3e50" 
          shininess={60}
          specular="#4a6741"
        />
      </mesh>
      
      {/* Mains avec texture de peau réaliste */}
      <mesh position={[-1.1, -0.25, 0]}>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshPhongMaterial 
          color="#deb887" 
          shininess={25}
          specular="#f4e4bc"
        />
      </mesh>
      <mesh position={[1.1, -0.25, 0]}>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshPhongMaterial 
          color="#deb887" 
          shininess={25}
          specular="#f4e4bc"
        />
      </mesh>
      
      {/* Cou avec transition naturelle */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.25, 0.28, 0.4, 16]} />
        <meshPhongMaterial 
          color="#deb887" 
          shininess={15}
          specular="#f4e4bc"
        />
      </mesh>
    </>
  );
};

export const RealisticFemaleAvatarHead: React.FC<RealisticFemaleGeometryProps> = ({ 
  headColor, 
  eyeLeftRef, 
  eyeRightRef, 
  mouthRef, 
  hairRef,
  emotion 
}) => {
  const getSkinColor = () => {
    // Couleur de peau dorée inspirée de la photo
    return emotion === 'happy' ? '#deb887' : '#d2b48c';
  };

  const getMouthShape = () => {
    switch (emotion) {
      case 'happy': return { scaleX: 1.2, scaleY: 0.9, positionY: -0.22 };
      case 'thinking': return { scaleX: 0.9, scaleY: 1.1, positionY: -0.25 };
      default: return { scaleX: 1, scaleY: 1, positionY: -0.22 };
    }
  };

  const mouthShape = getMouthShape();

  return (
    <>
      {/* Tête principale avec forme plus naturelle */}
      <mesh>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshPhongMaterial 
          color={getSkinColor()}
          shininess={12}
          specular="#f4e4bc"
          transparent={true}
          opacity={0.98}
        />
      </mesh>
      
      {/* Sous-structure faciale pour plus de réalisme */}
      <mesh position={[0, -0.1, 0.4]} scale={[0.9, 0.8, 0.7]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhongMaterial 
          color="#c8a882" 
          transparent={true}
          opacity={0.3}
          shininess={8}
        />
      </mesh>
      
      {/* Cheveux volumineux et naturels */}
      <mesh ref={hairRef} position={[0, 0.35, -0.25]} scale={[1.15, 0.9, 1.25]}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshPhongMaterial 
          color="#2c1810" 
          shininess={150}
          specular="#4a3428"
        />
      </mesh>
      
      {/* Mèches de cheveux pour plus de volume */}
      <mesh position={[-0.7, 0.25, 0.3]} scale={[0.35, 1.0, 0.4]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshPhongMaterial color="#3c2415" shininess={120} />
      </mesh>
      <mesh position={[0.7, 0.25, 0.3]} scale={[0.35, 1.0, 0.4]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshPhongMaterial color="#3c2415" shininess={120} />
      </mesh>
      
      {/* Cheveux arrière pour la profondeur */}
      <mesh position={[0, 0.1, -0.8]} scale={[1.0, 1.2, 0.8]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshPhongMaterial color="#2c1810" shininess={100} />
      </mesh>
      
      {/* Yeux ultra-réalistes avec reflets multiples */}
      <mesh ref={eyeLeftRef} position={[-0.22, 0.18, 0.78]}>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={200}
          specular="#ffffff"
        />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.22, 0.18, 0.78]}>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshPhongMaterial 
          color="#ffffff" 
          shininess={200}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Iris dorés/verts comme dans la photo */}
      <mesh position={[-0.22, 0.18, 0.86]}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshPhongMaterial 
          color="#b8860b" 
          shininess={180}
          specular="#daa520"
        />
      </mesh>
      <mesh position={[0.22, 0.18, 0.86]}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshPhongMaterial 
          color="#b8860b" 
          shininess={180}
          specular="#daa520"
        />
      </mesh>
      
      {/* Détails des iris - texture plus complexe */}
      <mesh position={[-0.22, 0.18, 0.87]}>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshPhongMaterial 
          color="#8b7355" 
          shininess={150}
        />
      </mesh>
      <mesh position={[0.22, 0.18, 0.87]}>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshPhongMaterial 
          color="#8b7355" 
          shininess={150}
        />
      </mesh>
      
      {/* Pupilles */}
      <mesh position={[-0.22, 0.18, 0.88]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.22, 0.18, 0.88]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Reflets principaux dans les yeux */}
      <mesh position={[-0.20, 0.20, 0.89]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.24, 0.20, 0.89]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Reflets secondaires */}
      <mesh position={[-0.24, 0.16, 0.885]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.20, 0.16, 0.885]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Sourcils naturels et expressifs */}
      <mesh position={[-0.22, 0.30, 0.82]} scale={[1.3, 0.35, 0.6]} rotation={[0, 0, emotion === 'thinking' ? 0.15 : 0]}>
        <boxGeometry args={[0.14, 0.06, 0.04]} />
        <meshPhongMaterial color="#2c1810" shininess={30} />
      </mesh>
      <mesh position={[0.22, 0.30, 0.82]} scale={[1.3, 0.35, 0.6]} rotation={[0, 0, emotion === 'thinking' ? -0.15 : 0]}>
        <boxGeometry args={[0.14, 0.06, 0.04]} />
        <meshPhongMaterial color="#2c1810" shininess={30} />
      </mesh>
      
      {/* Cils plus détaillés */}
      <mesh position={[-0.22, 0.26, 0.84]} scale={[1.4, 0.25, 0.4]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshPhongMaterial color="#1a1a1a" shininess={50} />
      </mesh>
      <mesh position={[0.22, 0.26, 0.84]} scale={[1.4, 0.25, 0.4]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshPhongMaterial color="#1a1a1a" shininess={50} />
      </mesh>
      
      {/* Joues avec rougeur subtile */}
      <mesh position={[-0.4, 0.0, 0.68]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#f4a460' : '#e6b8a2'} 
          transparent={true}
          opacity={0.5}
          shininess={8}
        />
      </mesh>
      <mesh position={[0.4, 0.0, 0.68]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#f4a460' : '#e6b8a2'} 
          transparent={true}
          opacity={0.5}
          shininess={8}
        />
      </mesh>
      
      {/* Bouche naturelle et expressive */}
      <mesh 
        ref={mouthRef} 
        position={[0, mouthShape.positionY, 0.77]}
        scale={[mouthShape.scaleX, mouthShape.scaleY, 1]}
      >
        <sphereGeometry args={[0.13, 32, 16]} />
        <meshPhongMaterial 
          color={emotion === 'happy' ? '#d2691e' : '#cd853f'} 
          shininess={80}
          specular="#f4a460"
        />
      </mesh>
      
      {/* Contour des lèvres plus naturel */}
      <mesh position={[0, mouthShape.positionY + 0.04, 0.78]} scale={[mouthShape.scaleX * 1.05, 0.35, 0.9]}>
        <sphereGeometry args={[0.14, 32, 16]} />
        <meshPhongMaterial 
          color="#b8860b" 
          transparent={true}
          opacity={0.6}
          shininess={60}
        />
      </mesh>
      
      {/* Nez plus fin et naturel */}
      <mesh position={[0, 0.08, 0.83]}>
        <coneGeometry args={[0.06, 0.22, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={18}
          specular="#f4e4bc"
        />
      </mesh>
      
      {/* Narines subtiles */}
      <mesh position={[-0.025, 0.02, 0.85]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhongMaterial color="#c8a882" shininess={8} />
      </mesh>
      <mesh position={[0.025, 0.02, 0.85]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhongMaterial color="#c8a882" shininess={8} />
      </mesh>
      
      {/* Structure de la mâchoire */}
      <mesh position={[0, -0.4, 0.5]} scale={[0.8, 0.3, 0.6]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          transparent={true}
          opacity={0.7}
          shininess={12}
        />
      </mesh>
      
      {/* Menton défini */}
      <mesh position={[0, -0.6, 0.6]} scale={[0.5, 0.3, 0.4]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          transparent={true}
          opacity={0.8}
          shininess={15}
        />
      </mesh>
      
      {/* Oreilles avec boucles d'oreilles élégantes */}
      <mesh position={[-0.9, 0.05, 0]} rotation={[0, 0, Math.PI / 5]} scale={[0.28, 0.7, 0.2]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={12} />
      </mesh>
      <mesh position={[0.9, 0.05, 0]} rotation={[0, 0, -Math.PI / 5]} scale={[0.28, 0.7, 0.2]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={12} />
      </mesh>
      
      {/* Boucles d'oreilles pendantes */}
      <mesh position={[-0.9, -0.15, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhongMaterial 
          color="#ffd700" 
          shininess={300}
          specular="#ffffff"
        />
      </mesh>
      <mesh position={[0.9, -0.15, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhongMaterial 
          color="#ffd700" 
          shininess={300}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Petites perles dorées */}
      <mesh position={[-0.9, -0.25, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshPhongMaterial 
          color="#daa520" 
          shininess={250}
        />
      </mesh>
      <mesh position={[0.9, -0.25, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshPhongMaterial 
          color="#daa520" 
          shininess={250}
        />
      </mesh>
    </>
  );
};
