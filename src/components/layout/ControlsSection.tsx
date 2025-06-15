
import React from 'react';
import { PersonalitySelector } from '@/components/PersonalitySelector';
import { GenderSelector } from '@/components/GenderSelector';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface ControlsSectionProps {
  currentPersonality: PersonalityId;
  onPersonalityChange: (personality: PersonalityId) => void;
  currentGender: Gender;
  onGenderChange: (gender: Gender) => void;
  currentLanguage: SupportedLanguage;
}

export const ControlsSection: React.FC<ControlsSectionProps> = ({
  currentPersonality,
  onPersonalityChange,
  currentGender,
  onGenderChange,
  currentLanguage
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" aria-label="Sélecteurs de configuration">
      <div className="personality-selector">
        <PersonalitySelector
          currentPersonality={currentPersonality}
          onPersonalityChange={onPersonalityChange}
        />
      </div>
      
      <div className="gender-selector">
        <GenderSelector
          currentGender={currentGender}
          onGenderChange={onGenderChange}
          currentLanguage={currentLanguage}
        />
      </div>
    </section>
  );
};
