
import React, { useState } from 'react';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';
import { useTutorial } from '@/hooks/useTutorial';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { PageHeader } from '@/components/layout/PageHeader';
import { ControlsSection } from '@/components/layout/ControlsSection';
import { MainContent } from '@/components/layout/MainContent';
import { InfoCards } from '@/components/layout/InfoCards';
import { FloatingComponents } from '@/components/layout/FloatingComponents';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'listening'>('neutral');
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityId>('friendly');
  const [currentGender, setCurrentGender] = useState<Gender>('male');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');
  const [showAccessibilityControls, setShowAccessibilityControls] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    closeTutorial
  } = useTutorial();

  // Raccourcis clavier globaux
  const globalShortcuts = [
    {
      key: 't',
      ctrlKey: true,
      action: startTutorial,
      description: 'Ouvrir le tutoriel'
    },
    {
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowMetrics(!showMetrics),
      description: 'Basculer l\'affichage des métriques'
    },
    {
      key: 'Escape',
      action: () => {
        setShowAccessibilityControls(false);
        setShowMetrics(false);
        if (showTutorial) closeTutorial();
      },
      description: 'Fermer tous les panneaux'
    }
  ];

  useKeyboardShortcuts({ shortcuts: globalShortcuts });

  console.log('Index component state:', { isListening, isSpeaking, emotion, currentPersonality, currentGender, currentLanguage });

  const getGenderDisplayText = (gender: Gender): string => {
    if (currentLanguage === 'ar') {
      return gender === 'male' ? 'رجل' : 'امرأة';
    }
    return gender === 'male' ? 'Homme' : 'Femme';
  };

  const getCurrentState = () => {
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (emotion === 'thinking') return 'thinking';
    return 'ready';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Skip links pour l'accessibilité */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Aller au contenu principal
      </a>
      <a 
        href="#chat-interface" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Aller à l'interface de chat
      </a>

      <div className="max-w-7xl mx-auto">
        <PageHeader
          currentState={getCurrentState()}
          hasCompletedTutorial={hasCompletedTutorial}
          onStartTutorial={startTutorial}
        />

        <ControlsSection
          currentPersonality={currentPersonality}
          onPersonalityChange={setCurrentPersonality}
          currentGender={currentGender}
          onGenderChange={setCurrentGender}
          currentLanguage={currentLanguage}
        />

        <MainContent
          isListening={isListening}
          setIsListening={setIsListening}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
          emotion={emotion}
          setEmotion={setEmotion}
          currentPersonality={currentPersonality}
          setCurrentPersonality={setCurrentPersonality}
          currentGender={currentGender}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          getCurrentState={getCurrentState}
          getGenderDisplayText={getGenderDisplayText}
        />

        <InfoCards />
      </div>

      <FloatingComponents
        showAccessibilityControls={showAccessibilityControls}
        setShowAccessibilityControls={setShowAccessibilityControls}
        showMetrics={showMetrics}
        setShowMetrics={setShowMetrics}
        showTutorial={showTutorial}
        closeTutorial={closeTutorial}
        completeTutorial={completeTutorial}
      />
    </div>
  );
};

export default Index;
