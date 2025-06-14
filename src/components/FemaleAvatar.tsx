
import React from 'react';

interface FemaleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const FemaleAvatar: React.FC<FemaleAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  const getOverlayColor = () => {
    if (isListening) return 'bg-red-500/20';
    if (isSpeaking) return 'bg-blue-500/20';
    switch (emotion) {
      case 'happy': return 'bg-green-500/20';
      case 'thinking': return 'bg-purple-500/20';
      default: return 'bg-gray-500/10';
    }
  };

  const getStatusText = () => {
    if (isListening) return '🎤 Écoute...';
    if (isSpeaking) return '🗣️ Parle...';
    switch (emotion) {
      case 'happy': return '😊 Contente';
      case 'thinking': return '🤔 Réfléchit...';
      default: return '💭 Prête';
    }
  };

  const getBorderColor = () => {
    if (isListening) return 'border-red-400';
    if (isSpeaking) return 'border-blue-400';
    switch (emotion) {
      case 'happy': return 'border-green-400';
      case 'thinking': return 'border-purple-400';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-pink-50 to-purple-100 rounded-lg overflow-hidden relative">
      {/* Image de la belle jeune femme */}
      <div className="w-full h-full relative">
        <img 
          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"
          alt="Avatar féminin"
          className={`w-full h-full object-cover transition-all duration-300 ${getBorderColor()} border-4`}
        />
        
        {/* Overlay animé selon l'état */}
        <div className={`absolute inset-0 ${getOverlayColor()} transition-all duration-300`} />
        
        {/* Animation de pulsation quand elle parle */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-blue-400/30 animate-pulse" />
        )}
        
        {/* Animation de glow quand elle écoute */}
        {isListening && (
          <div className="absolute inset-0 bg-red-400/30 animate-ping" />
        )}
      </div>
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-center text-gray-800">
            {getStatusText()}
          </p>
        </div>
      </div>
      
      {/* Particles d'animation pour les émotions */}
      {emotion === 'happy' && (
        <div className="absolute top-4 right-4">
          <div className="text-2xl animate-bounce">✨</div>
        </div>
      )}
      
      {emotion === 'thinking' && (
        <div className="absolute top-4 right-4">
          <div className="text-2xl animate-pulse">💭</div>
        </div>
      )}
    </div>
  );
};
