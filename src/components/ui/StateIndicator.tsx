
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, Volume2, Brain, User } from 'lucide-react';

interface StateIndicatorProps {
  state: 'listening' | 'speaking' | 'thinking' | 'ready' | 'processing';
  variant?: 'default' | 'compact';
  showIcon?: boolean;
  showText?: boolean;
}

export const StateIndicator: React.FC<StateIndicatorProps> = ({
  state,
  variant = 'default',
  showIcon = true,
  showText = true
}) => {
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          text: 'À l\'écoute',
          color: 'destructive',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          pulse: true
        };
      case 'speaking':
        return {
          icon: Volume2,
          text: 'En train de parler',
          color: 'default',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          pulse: false
        };
      case 'thinking':
        return {
          icon: Brain,
          text: 'Réflexion...',
          color: 'secondary',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          pulse: false
        };
      case 'processing':
        return {
          icon: Loader2,
          text: 'Traitement...',
          color: 'secondary',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          pulse: false
        };
      default:
        return {
          icon: User,
          text: 'Prêt',
          color: 'outline',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          pulse: false
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <div className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
        ${config.bgColor} ${config.borderColor} border
        ${config.pulse ? 'animate-pulse' : ''}
      `}>
        {showIcon && (
          <Icon 
            size={12} 
            className={state === 'processing' ? 'animate-spin' : ''} 
          />
        )}
        {showText && <span className="font-medium">{config.text}</span>}
      </div>
    );
  }

  return (
    <Badge 
      variant={config.color as any}
      className={`
        flex items-center gap-2 px-3 py-2
        ${config.pulse ? 'animate-pulse' : ''}
      `}
    >
      {showIcon && (
        <Icon 
          size={16} 
          className={state === 'processing' ? 'animate-spin' : ''} 
        />
      )}
      {showText && config.text}
    </Badge>
  );
};
