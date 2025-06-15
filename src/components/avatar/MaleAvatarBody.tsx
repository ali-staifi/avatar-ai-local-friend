
import React from 'react';

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
