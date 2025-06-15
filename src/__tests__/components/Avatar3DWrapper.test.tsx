
import React from 'react';
import { render } from '@testing-library/react';
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
    const { getByTestId } = render(<Avatar3DWrapper {...defaultProps} />);
    expect(getByTestId(/avatar/)).toBeDefined();
  });

  it('passes props correctly to avatar components', () => {
    const { getByTestId } = render(
      <Avatar3DWrapper 
        isListening={true} 
        isSpeaking={false} 
        emotion="happy" 
      />
    );
    
    const avatar = getByTestId(/avatar/);
    expect(avatar.textContent).toContain('Listening: true');
    expect(avatar.textContent).toContain('Speaking: false');
    expect(avatar.textContent).toContain('Emotion: happy');
  });

  it('renders female avatar when gender is female', () => {
    const { getByTestId } = render(<Avatar3DWrapper {...defaultProps} gender="female" />);
    expect(getByTestId('female-avatar')).toBeDefined();
  });

  it('handles valid props correctly', () => {
    const { getByTestId } = render(
      <Avatar3DWrapper 
        {...defaultProps} 
        data-testid="wrapper"
      />
    );
    
    // Le composant devrait fonctionner avec des props valides
    expect(getByTestId(/avatar/)).toBeDefined();
  });

  it('handles different emotion states', () => {
    const emotions = ['neutral', 'happy', 'thinking'] as const;
    
    emotions.forEach(emotion => {
      const { rerender, getByTestId } = render(
        <Avatar3DWrapper {...defaultProps} emotion={emotion} />
      );
      
      expect(getByTestId(/avatar/).textContent).toContain(`Emotion: ${emotion}`);
      
      if (emotion !== emotions[emotions.length - 1]) {
        rerender(<Avatar3DWrapper {...defaultProps} emotion={emotions[emotions.indexOf(emotion) + 1]} />);
      }
    });
  });
});
