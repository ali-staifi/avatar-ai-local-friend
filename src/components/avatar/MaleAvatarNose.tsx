
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
    </>
  );
};
