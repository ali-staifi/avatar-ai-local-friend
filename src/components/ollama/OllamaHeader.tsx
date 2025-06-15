
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OllamaHeaderProps {
  isAvailable: boolean;
}

export const OllamaHeader: React.FC<OllamaHeaderProps> = ({ isAvailable }) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        Ollama - IA Locale
        {isAvailable ? (
          <Badge variant="default" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connecté
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Non disponible
          </Badge>
        )}
      </CardTitle>
    </CardHeader>
  );
};
