
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
      {/* Tête principale plus réaliste */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          color={getSkinColor()}
          shininess={12}
          specular="#ffffff"
          transparent={false}
          opacity={1}
        />
      </mesh>
      
      {/* Cheveux courts masculins repositionnés */}
      <mesh position={[0, 0.4, -0.1]} scale={[1.02, 0.5, 1.02]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial 
          color="#654321" 
          shininess={25}
          specular="#8b4513"
        />
      </mesh>
      
      {/* Barbe plus subtile */}
      <mesh position={[0, -0.3, 0.4]} scale={[0.7, 0.3, 0.6]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhongMaterial 
          color="#4a4a4a" 
          transparent={true}
          opacity={0.4}
          shininess={8}
        />
      </mesh>
      
      {/* Oreilles repositionnées */}
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 8]} scale={[0.25, 0.6, 0.15]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={8} />
      </mesh>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 8]} scale={[0.25, 0.6, 0.15]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhongMaterial color={getSkinColor()} shininess={8} />
      </mesh>
      
      {/* Menton plus naturel */}
      <mesh position={[0, -0.6, 0.3]} scale={[0.6, 0.3, 0.4]}>
        <sphereGeometry args={[0.25, 16, 16]} />
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
