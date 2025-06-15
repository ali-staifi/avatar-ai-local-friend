
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StateIndicator } from '@/components/ui/StateIndicator';
import { Avatar3DWrapper } from '@/components/Avatar3DWrapper';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';
import { Sparkles } from 'lucide-react';

interface AvatarSectionProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking' | 'listening';
  currentPersonality: PersonalityId;
  currentGender: Gender;
  currentLanguage: SupportedLanguage;
  getCurrentState: () => 'listening' | 'speaking' | 'thinking' | 'ready';
  getGenderDisplayText: (gender: Gender) => string;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  isListening,
  isSpeaking,
  emotion,
  currentPersonality,
  currentGender,
  getCurrentState,
  getGenderDisplayText
}) => {
  return (
    <section aria-label="Avatar 3D et informations d'état">
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Avatar 3D Interactif</span>
            <div className="flex gap-2">
              <StateIndicator state={getCurrentState()} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div role="img" aria-label={`Avatar ${getGenderDisplayText(currentGender)} en état ${getCurrentState()}`}>
            <Avatar3DWrapper 
              isListening={isListening}
              isSpeaking={isSpeaking}
              emotion={emotion === 'listening' ? 'thinking' : emotion}
              gender={currentGender}
            />
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg" role="region" aria-label="État du système">
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
    </section>
  );
};
