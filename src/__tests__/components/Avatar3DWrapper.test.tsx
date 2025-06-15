
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Avatar3DWrapper } from '@/components/Avatar3DWrapper';

// Mock des dépendances lourdes
vi.mock('@/components/Avatar3D', () => ({
  Avatar3D: ({ isListening, isSpeaking, emotion }: any) => (
    <div data-testid="avatar-3d">
      Avatar3D - Listening: {isListening.toString()} - Speaking: {isSpeaking.toString()} - Emotion: {emotion}
    </div>
  )
}));

vi.mock('@/components/SimpleAvatar', () => ({
  SimpleAvatar: ({ isListening, isSpeaking, emotion }: any) => (
    <div data-testid="simple-avatar">
      SimpleAvatar - Listening: {isListening.toString()} - Speaking: {isSpeaking.toString()} - Emotion: {emotion}
    </div>
  )
}));

vi.mock('@/components/FemaleAvatar', () => ({
  FemaleAvatar: ({ isListening, isSpeaking, emotion }: any) => (
    <div data-testid="female-avatar">
      FemaleAvatar - Listening: {isListening.toString()} - Speaking: {isSpeaking.toString()} - Emotion: {emotion}
    </div>
  )
}));

describe('Avatar3DWrapper', () => {
  const defaultProps = {
    isListening: false,
    isSpeaking: false,
    emotion: 'neutral' as const
  };

  it('renders without crashing', () => {
    render(<Avatar3DWrapper {...defaultProps} />);
    expect(screen.getByTestId(/avatar/)).toBeInTheDocument();
  });

  it('passes props correctly to avatar components', () => {
    render(
      <Avatar3DWrapper 
        isListening={true} 
        isSpeaking={false} 
        emotion="happy" 
      />
    );
    
    const avatar = screen.getByTestId(/avatar/);
    expect(avatar).toHaveTextContent('Listening: true');
    expect(avatar).toHaveTextContent('Speaking: false');
    expect(avatar).toHaveTextContent('Emotion: happy');
  });

  it('renders female avatar when gender is female', () => {
    render(<Avatar3DWrapper {...defaultProps} gender="female" />);
    expect(screen.getByTestId('female-avatar')).toBeInTheDocument();
  });

  it('filters out development props', () => {
    render(
      <Avatar3DWrapper 
        {...defaultProps} 
        data-testid="wrapper"
        someDevProp="value"
      />
    );
    
    // Le composant devrait fonctionner même avec des props supplémentaires
    expect(screen.getByTestId(/avatar/)).toBeInTheDocument();
  });

  it('handles different emotion states', () => {
    const emotions = ['neutral', 'happy', 'thinking'] as const;
    
    emotions.forEach(emotion => {
      const { rerender } = render(
        <Avatar3DWrapper {...defaultProps} emotion={emotion} />
      );
      
      expect(screen.getByTestId(/avatar/)).toHaveTextContent(`Emotion: ${emotion}`);
      
      if (emotion !== emotions[emotions.length - 1]) {
        rerender(<Avatar3DWrapper {...defaultProps} emotion={emotions[emotions.indexOf(emotion) + 1]} />);
      }
    });
  });
});
