
import { useState, useEffect } from 'react';

interface TutorialState {
  isFirstVisit: boolean;
  hasCompletedTutorial: boolean;
  showTutorial: boolean;
}

export const useTutorial = () => {
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isFirstVisit: false,
    hasCompletedTutorial: false,
    showTutorial: false
  });

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = localStorage.getItem('avatar-ai-visited');
    const tutorialCompleted = localStorage.getItem('avatar-ai-tutorial-completed');

    if (!hasVisited) {
      setTutorialState({
        isFirstVisit: true,
        hasCompletedTutorial: false,
        showTutorial: true
      });
      localStorage.setItem('avatar-ai-visited', 'true');
    } else {
      setTutorialState({
        isFirstVisit: false,
        hasCompletedTutorial: tutorialCompleted === 'true',
        showTutorial: false
      });
    }
  }, []);

  const startTutorial = () => {
    setTutorialState(prev => ({ ...prev, showTutorial: true }));
  };

  const completeTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      showTutorial: false,
      hasCompletedTutorial: true
    }));
    localStorage.setItem('avatar-ai-tutorial-completed', 'true');
  };

  const closeTutorial = () => {
    setTutorialState(prev => ({ ...prev, showTutorial: false }));
  };

  const resetTutorial = () => {
    localStorage.removeItem('avatar-ai-tutorial-completed');
    localStorage.removeItem('avatar-ai-visited');
    setTutorialState({
      isFirstVisit: true,
      hasCompletedTutorial: false,
      showTutorial: true
    });
  };

  return {
    ...tutorialState,
    startTutorial,
    completeTutorial,
    closeTutorial,
    resetTutorial
  };
};
