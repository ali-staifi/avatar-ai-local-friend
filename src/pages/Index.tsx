import React, { useState } from 'react';
import { Avatar3DWrapper } from '@/components/Avatar3DWrapper';
import { ChatInterface } from '@/components/ChatInterface';
import { PersonalitySelector } from '@/components/PersonalitySelector';
import { GenderSelector } from '@/components/GenderSelector';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { StateIndicator } from '@/components/ui/StateIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';
import { useTutorial } from '@/hooks/useTutorial';
import { HelpCircle, Sparkles } from 'lucide-react';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'listening'>('neutral');
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityId>('friendly');
  const [currentGender, setCurrentGender] = useState<Gender>('male');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');

  const {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    closeTutorial
  } = useTutorial();

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
      <div className="max-w-7xl mx-auto">
        {/* Header avec indicateur d'état principal */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Avatar AI Local - Moteur de Discussion Avancé
            </h1>
            <StateIndicator 
              state={getCurrentState() as any} 
              variant="compact"
            />
          </div>
          
          <p className="text-lg text-muted-foreground mb-4">
            Assistant avatar 3D avec IA conversationnelle, personnalités multiples, mémoire contextuelle et gestion d'interruption intelligente
          </p>
          
          <div className="flex justify-center gap-2 flex-wrap mb-4">
            <Badge variant="secondary">🎤 Reconnaissance Vocale</Badge>
            <Badge variant="secondary">🔊 Synthèse Vocale</Badge>
            <Badge variant="secondary">🧠 Moteur Discussion Avancé</Badge>
            <Badge variant="secondary">🎭 Personnalités Multiples</Badge>
            <Badge variant="secondary">💭 Mémoire Conversationnelle</Badge>
            <Badge variant="secondary">🔄 Gestion Interruption</Badge>
            <Badge variant="secondary">🎮 Avatar 3D</Badge>
            <Badge variant="secondary">🔒 100% Privé</Badge>
          </div>

          {/* Bouton d'aide et tutoriel */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startTutorial}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {hasCompletedTutorial ? 'Revoir le tutoriel' : 'Guide d\'utilisation'}
            </Button>
            {!hasCompletedTutorial && (
              <Badge variant="default" className="animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Nouveau !
              </Badge>
            )}
          </div>
        </div>

        {/* Controls Section avec classes pour le tutoriel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Personality Selector */}
          <div className="personality-selector">
            <PersonalitySelector
              currentPersonality={currentPersonality}
              onPersonalityChange={setCurrentPersonality}
            />
          </div>
          
          {/* Gender Selector */}
          <div className="gender-selector">
            <GenderSelector
              currentGender={currentGender}
              onGenderChange={setCurrentGender}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Avatar Section */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Avatar 3D Interactif</span>
                <div className="flex gap-2">
                  <StateIndicator state={getCurrentState() as any} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Avatar3DWrapper 
                isListening={isListening}
                isSpeaking={isSpeaking}
                emotion={emotion === 'listening' ? 'thinking' : emotion}
                gender={currentGender}
              />
              
              {/* Status Info amélioré avec indicateurs visuels */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  État du système :
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Reconnaissance vocale :</span>
                    <StateIndicator 
                      state={isListening ? 'listening' : 'ready'}
                      variant="compact"
                      showText={false}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Synthèse vocale :</span>
                    <StateIndicator 
                      state={isSpeaking ? 'speaking' : 'ready'}
                      variant="compact"
                      showText={false}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>État émotionnel :</span>
                    <Badge variant="outline" className="capitalize">
                      {emotion === 'listening' ? 'À l\'écoute' : emotion}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Personnalité :</span>
                    <Badge variant="secondary" className="capitalize">
                      {currentPersonality}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Genre :</span>
                    <Badge variant="outline">
                      {getGenderDisplayText(currentGender)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Section avec classe pour tutoriel */}
          <div className="chat-interface">
            <ChatInterface
              onListeningChange={setIsListening}
              onSpeakingChange={setIsSpeaking}
              onEmotionChange={setEmotion}
              onPersonalityChange={setCurrentPersonality}
              currentPersonality={currentPersonality}
              currentGender={currentGender}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🎭 Personnalités Multiples</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 6 personnalités distinctes</li>
                <li>• Styles de communication uniques</li>
                <li>• Réactions émotionnelles adaptées</li>
                <li>• Intérêts spécialisés par personnalité</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🧠 Moteur de Discussion</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Mémoire conversationnelle contextuelle</li>
                <li>• Gestion intelligente des interruptions</li>
                <li>• Apprentissage des préférences utilisateur</li>
                <li>• Réponses adaptées au contexte</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🔒 Confidentialité Totale</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Traitement 100% local</li>
                <li>• Aucune donnée envoyée en ligne</li>
                <li>• Mémoire stockée localement</li>
                <li>• Respect absolu de la vie privée</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tutoriel Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
    </div>
  );
};

export default Index;
