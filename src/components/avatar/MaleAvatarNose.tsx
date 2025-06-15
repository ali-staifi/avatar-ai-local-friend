
import React from 'react';

interface MaleAvatarNoseProps {
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarNose: React.FC<MaleAvatarNoseProps> = ({ emotion }) => {
  const getSkinColor = () => {
    return emotion === 'happy' ? '#deb887' : '#d4a574';
  };

  return (
    <>
      {/* Nez plus subtil avec forme arrondie au lieu du triangle */}
      <mesh position={[0, 0, 0.85]} scale={[0.8, 1, 0.6]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={8}
          specular="#ffffff"
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      
      {/* Arête du nez plus douce */}
      <mesh position={[0, 0.02, 0.88]} scale={[0.3, 0.8, 0.4]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshPhongMaterial 
          color={getSkinColor()} 
          shininess={5}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
      
      {/* Narines plus discrètes */}
      <mesh position={[-0.025, -0.03, 0.89]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhongMaterial 
          color="#c19a6b" 
          shininess={5}
          transparent={true}
          opacity={0.6}
        />
      </mesh>
      <mesh position={[0.025, -0.03, 0.89]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhongMaterial 
          color="#c19a6b" 
          shininess={5}
          transparent={true}
          opacity={0.6}
        />
      </mesh>
    </>
  );
};
