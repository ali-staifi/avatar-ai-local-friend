
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Gender, GenderOption } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface GenderSelectorProps {
  currentGender: Gender;
  onGenderChange: (gender: Gender) => void;
  currentLanguage: SupportedLanguage;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  currentGender,
  onGenderChange,
  currentLanguage
}) => {
  const getGenderOptions = (language: SupportedLanguage): GenderOption[] => {
    if (language === 'ar') {
      return [
        {
          value: 'male',
          label: 'رجل',
          emoji: '👨'
        },
        {
          value: 'female',
          label: 'امرأة',
          emoji: '👩'
        }
      ];
    }
    
    // Français par défaut
    return [
      {
        value: 'male',
        label: 'Homme',
        emoji: '👨'
      },
      {
        value: 'female',
        label: 'Femme',
        emoji: '👩'
      }
    ];
  };

  const getTitle = (language: SupportedLanguage): string => {
    return language === 'ar' ? 'جنس الصورة الرمزية' : 'Genre de l\'avatar';
  };

  const genderOptions = getGenderOptions(currentLanguage);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{getTitle(currentLanguage)}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currentGender}
          onValueChange={(value) => onGenderChange(value as Gender)}
          className="flex gap-4"
        >
          {genderOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 border-muted hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
