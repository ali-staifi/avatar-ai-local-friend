
import React from 'react';

interface MaleAvatarHeadBaseProps {
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarHeadBase: React.FC<MaleAvatarHeadBaseProps> = ({ emotion }) => {
  const getSkinColor = () => {
    return emotion === 'happy' ? '#deb887' : '#d4a574';
  };

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
