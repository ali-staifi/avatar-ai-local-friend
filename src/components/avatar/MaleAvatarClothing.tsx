
import React from 'react';

export const MaleAvatarClothing: React.FC = () => {
  return (
    <>
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
      
      {/* Manchettes de chemise */}
      <mesh position={[-1.3, -0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
        <meshPhongMaterial color="#ecf0f1" shininess={20} />
      </mesh>
      <mesh position={[1.3, -0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
        <meshPhongMaterial color="#ecf0f1" shininess={20} />
      </mesh>
    </>
  );
};
