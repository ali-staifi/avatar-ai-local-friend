
import React from 'react';

interface SimpleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ isListening, isSpeaking, emotion }) => {
  const getEmoji = () => {
    if (isListening) return '👂';
    if (isSpeaking) return '🗣️';
    switch (emotion) {
      case 'happy': return '😊';
      case 'thinking': return '🤔';
      default: return '🤖';
    }
  };

  const getColor = () => {
    switch (emotion) {
      case 'happy': return 'from-green-400 to-green-600';
      case 'thinking': return 'from-blue-400 to-blue-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
      <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getColor()} flex items-center justify-center text-6xl animate-pulse shadow-2xl`}>
        {getEmoji()}
      </div>
    </div>
  );
};
