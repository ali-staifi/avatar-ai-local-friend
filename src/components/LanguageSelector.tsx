
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';
import { SupportedLanguage } from '@/types/speechRecognition';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

const languages = [
  {
    code: 'fr' as SupportedLanguage,
    name: 'Français',
    flag: '🇫🇷',
    description: 'Interface et reconnaissance vocale en français'
  },
  {
    code: 'ar' as SupportedLanguage,
    name: 'العربية',
    flag: '🇸🇦',
    description: 'واجهة والتعرف على الكلام بالعربية'
  }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  disabled = false
}) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="h-4 w-4" />
          Choix de langue / اختيار اللغة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground mb-4">
          Sélectionnez votre langue préférée pour l'interface et la reconnaissance vocale
        </div>
        
        <div className="space-y-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? "default" : "outline"}
              onClick={() => onLanguageChange(lang.code)}
              disabled={disabled}
              className="w-full justify-start h-auto p-4"
              title={lang.description}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left flex-1">
                  <div className="font-medium text-base">{lang.name}</div>
                  <div className="text-xs opacity-70 mt-1">{lang.description}</div>
                </div>
                {currentLanguage === lang.code && (
                  <div className="ml-auto">
                    <Globe className="h-4 w-4" />
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Langue actuelle: {languages.find(l => l.code === currentLanguage)?.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
