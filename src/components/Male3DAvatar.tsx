
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
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        shadows
        onCreated={({ gl }) => {
          // Prévenir la perte du contexte WebGL
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('⚠️ Contexte WebGL perdu, tentative de restauration...');
          });
          
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('✅ Contexte WebGL restauré');
          });
        }}
      >
        {/* Éclairage amélioré pour éviter les problèmes de rendu */}
        <ambientLight intensity={0.6} color="#f8f9fa" />
        <directionalLight 
          position={[3, 5, 3]} 
          intensity={1.2} 
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight 
          position={[-2, 2, 2]} 
          intensity={0.5} 
          color="#3498db" 
          distance={8}
        />
        
        <MaleAvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          emotion={emotion} 
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          minDistance={3}
          maxDistance={7}
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
