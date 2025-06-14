
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Gender, GenderOption } from '@/types/gender';

interface GenderSelectorProps {
  currentGender: Gender;
  onGenderChange: (gender: Gender) => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  currentGender,
  onGenderChange
}) => {
  const genderOptions: GenderOption[] = [
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Genre de l'avatar</CardTitle>
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
