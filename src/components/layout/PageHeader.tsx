
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StateIndicator } from '@/components/ui/StateIndicator';
import { HelpCircle, Sparkles } from 'lucide-react';

interface PageHeaderProps {
  currentState: 'listening' | 'speaking' | 'thinking' | 'ready';
  hasCompletedTutorial: boolean;
  onStartTutorial: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  currentState,
  hasCompletedTutorial,
  onStartTutorial
}) => {
  return (
    <header className="text-center mb-8" role="banner">
      <div className="flex items-center justify-center gap-4 mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Avatar AI Local - Moteur de Discussion Avancé
        </h1>
        <StateIndicator 
          state={currentState} 
          variant="compact"
        />
      </div>
      
      <p className="text-lg text-muted-foreground mb-4">
        Assistant avatar 3D avec IA conversationnelle, personnalités multiples, mémoire contextuelle et gestion d'interruption intelligente
      </p>
      
      <div className="flex justify-center gap-2 flex-wrap mb-4" role="list" aria-label="Fonctionnalités disponibles">
        <Badge variant="secondary">🎤 Reconnaissance Vocale</Badge>
        <Badge variant="secondary">🔊 Synthèse Vocale</Badge>
        <Badge variant="secondary">🧠 Moteur Discussion Avancé</Badge>
        <Badge variant="secondary">🎭 Personnalités Multiples</Badge>
        <Badge variant="secondary">💭 Mémoire Conversationnelle</Badge>
        <Badge variant="secondary">🔄 Gestion Interruption</Badge>
        <Badge variant="secondary">🎮 Avatar 3D</Badge>
        <Badge variant="secondary">🔒 100% Privé</Badge>
        <Badge variant="secondary">♿ Accessibilité</Badge>
        <Badge variant="secondary">📊 Métriques</Badge>
      </div>

      <nav className="flex justify-center gap-2" aria-label="Actions principales">
        <Button
          variant="outline"
          size="sm"
          onClick={onStartTutorial}
          className="flex items-center gap-2"
          aria-describedby="tutorial-help"
        >
          <HelpCircle className="h-4 w-4" />
          {hasCompletedTutorial ? 'Revoir le tutoriel' : 'Guide d\'utilisation'}
        </Button>
        <span id="tutorial-help" className="sr-only">
          Ouvre un guide interactif pour apprendre à utiliser l'application
        </span>
        {!hasCompletedTutorial && (
          <Badge variant="default" className="animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            Nouveau !
          </Badge>
        )}
      </nav>
    </header>
  );
};
