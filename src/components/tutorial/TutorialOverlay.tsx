
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Mic, Settings, User } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  icon?: React.ReactNode;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '👋 Bienvenue dans Avatar AI !',
    description: 'Découvrez comment interagir avec votre assistant AI personnel avec reconnaissance vocale et avatars 3D.',
    position: 'center',
    icon: <User className="h-6 w-6" />
  },
  {
    id: 'personality',
    title: '🎭 Choisir une personnalité',
    description: 'Sélectionnez la personnalité qui vous convient le mieux. Chaque personnalité a son propre style de communication.',
    targetElement: '.personality-selector',
    position: 'right',
    action: 'Cliquez sur une personnalité',
    icon: <User className="h-6 w-6" />
  },
  {
    id: 'gender',
    title: '👨👩 Genre de l\'avatar',
    description: 'Choisissez le genre de votre avatar. Cela influencera l\'apparence et la voix de votre assistant.',
    targetElement: '.gender-selector',
    position: 'right',
    action: 'Sélectionnez un genre',
    icon: <Settings className="h-6 w-6" />
  },
  {
    id: 'voice-input',
    title: '🎤 Reconnaissance vocale',
    description: 'Cliquez sur le bouton microphone pour activer la reconnaissance vocale et parlez naturellement.',
    targetElement: '.mic-button',
    position: 'top',
    action: 'Testez la reconnaissance vocale',
    icon: <Mic className="h-6 w-6" />
  },
  {
    id: 'conversation',
    title: '💬 Conversation',
    description: 'Commencez une conversation ! Votre avatar réagira avec des émotions et des expressions adaptées.',
    targetElement: '.chat-input',
    position: 'top',
    action: 'Écrivez ou parlez',
    icon: <ArrowRight className="h-6 w-6" />
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Overlay avec highlight */}
      {step.targetElement && (
        <div 
          className={`absolute inset-0 transition-all duration-300 ${
            showHighlight ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
          }`}
          style={{
            clipPath: step.targetElement ? 'circle(100px at 50% 50%)' : 'none'
          }}
        />
      )}

      {/* Tutorial Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.icon}
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {step.action && (
              <Badge variant="outline" className="w-fit">
                💡 {step.action}
              </Badge>
            )}

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Étape {currentStep + 1} sur {tutorialSteps.length}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Passer
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  {isLastStep ? 'Terminer' : 'Suivant'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
