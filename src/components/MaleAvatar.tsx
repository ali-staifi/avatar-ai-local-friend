
import React from 'react';

interface MaleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatar: React.FC<MaleAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  console.log('👨 MaleAvatar rendering with:', { isListening, isSpeaking, emotion });

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
      case 'happy': return '😊 Content';
      case 'thinking': return '🤔 Réfléchit...';
      default: return '💭 Prêt';
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
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative">
      {/* Avatar masculin */}
      <div className="w-full h-full relative">
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
          alt="Avatar masculin"
          className={`w-full h-full object-cover transition-all duration-300 ${getBorderColor()} border-4`}
          onLoad={() => console.log('✅ Image MaleAvatar chargée avec succès')}
          onError={(e) => console.error('❌ Erreur chargement image MaleAvatar:', e)}
        />
        
        {/* Overlay animé selon l'état */}
        <div className={`absolute inset-0 ${getOverlayColor()} transition-all duration-300`} />
        
        {/* Animation de pulsation quand il parle */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-blue-400/30 animate-pulse" />
        )}
        
        {/* Animation de glow quand il écoute */}
        {isListening && (
          <div className="absolute inset-0 bg-red-400/30 animate-ping" />
        )}
        
        {/* Animation de la bouche quand il parle */}
        {isSpeaking && (
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-6 bg-red-500/60 rounded-full animate-pulse" />
          </div>
        )}
        
        {/* Animation des yeux qui clignent */}
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-80" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-80" />
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
      
      {/* Animation de respiration */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-200/10 animate-pulse opacity-30" />
    </div>
  );
};
