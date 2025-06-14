
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { SupportedLanguage } from '@/types/speechRecognition';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  isListening: boolean;
}

const languages = [
  {
    code: 'fr' as SupportedLanguage,
    name: 'Français',
    flag: '🇫🇷',
    description: 'Reconnaissance vocale en français'
  },
  {
    code: 'ar' as SupportedLanguage,
    name: 'العربية',
    flag: '🇸🇦',
    description: 'التعرف على الكلام بالعربية'
  }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  isListening
}) => {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Langue
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "outline"}
            onClick={() => onLanguageChange(lang.code)}
            disabled={isListening}
            className="justify-start h-auto p-3"
            title={lang.description}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs opacity-70">{lang.code.toUpperCase()}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
