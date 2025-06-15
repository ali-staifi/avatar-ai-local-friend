
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MaleAvatarMesh } from './avatar/MaleAvatarMesh';

interface Male3DAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const Male3DAvatar: React.FC<Male3DAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👨 Male3DAvatar rendering with:', { isListening, isSpeaking, emotion });

  const getStatusText = () => {
    if (isListening) return '🎤 Écoute...';
    if (isSpeaking) return '🗣️ Parle...';
    switch (emotion) {
      case 'happy': return '😊 Content';
      case 'thinking': return '🤔 Réfléchit...';
      default: return '💭 Prêt';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
        shadows
      >
        {/* Éclairage sophistiqué pour plus de réalisme */}
        <ambientLight intensity={0.4} color="#f4f4f4" />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.5} 
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight 
          position={[-3, 2, 3]} 
          intensity={0.8} 
          color="#3498db" 
          distance={10}
        />
        <pointLight 
          position={[3, -2, 2]} 
          intensity={0.6} 
          color="#2ecc71" 
          distance={8}
        />
        <spotLight
          position={[0, 5, 0]}
          angle={Math.PI / 6}
          penumbra={0.3}
          intensity={0.5}
          color="#f39c12"
          castShadow
        />
        
        <MaleAvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          emotion={emotion} 
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg transition-all duration-300">
          <p className="text-sm font-medium text-center text-gray-800">
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};
