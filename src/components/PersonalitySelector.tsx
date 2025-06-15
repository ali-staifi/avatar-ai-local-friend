
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PERSONALITY_TRAITS, PersonalityId } from '@/types/personality';

interface PersonalitySelectorProps {
  currentPersonality: PersonalityId;
  onPersonalityChange: (personalityId: PersonalityId) => void;
}

export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
  currentPersonality,
  onPersonalityChange
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 text-center">🎭 Personnalités de l'Avatar</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PERSONALITY_TRAITS.map((trait) => (
            <Button
              key={trait.id}
              variant={currentPersonality === trait.id ? "default" : "outline"}
              size="sm"
              onClick={() => onPersonalityChange(trait.id as PersonalityId)}
              className={`flex flex-col h-auto p-3 transition-all duration-200 hover:scale-105 ${
                currentPersonality === trait.id 
                  ? `bg-gradient-to-r ${trait.color} text-white shadow-lg` 
                  : 'hover:bg-muted hover:shadow-md'
              }`}
              title={trait.description}
            >
              <div className="text-lg mb-1">{trait.emoji}</div>
              <div className="text-xs font-medium">{trait.name}</div>
            </Button>
          ))}
        </div>
        
        {/* Affichage de la personnalité actuelle */}
        <div className="mt-3 p-3 bg-muted rounded-lg">
          {(() => {
            const current = PERSONALITY_TRAITS.find(t => t.id === currentPersonality);
            return current ? (
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  {current.emoji} {current.name}
                </Badge>
                <p className="text-sm text-muted-foreground">{current.description}</p>
              </div>
            ) : null;
          })()}
        </div>
      </CardContent>
    </Card>
  );
};
