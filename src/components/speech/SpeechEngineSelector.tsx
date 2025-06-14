
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Globe, Mic, Shield, Wifi, WifiOff } from 'lucide-react';
import { SpeechEngine, SupportedLanguage } from '@/hooks/useHybridSpeechRecognition';
import { ModelLoadingProgress } from '@/services/VoskModelManager';

interface EngineInfo {
  webSpeech: {
    supported: boolean;
    available: boolean;
    description: string;
  };
  vosk: {
    supported: boolean;
    available: boolean;
    description: string;
    modelProgress?: ModelLoadingProgress;
  };
}

interface SpeechEngineSelectorProps {
  currentEngine: SpeechEngine;
  currentLanguage: SupportedLanguage;
  onEngineChange: (engine: SpeechEngine) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  engineInfo: EngineInfo;
  isListening: boolean;
  engineStatus: 'ready' | 'loading' | 'error';
}

export const SpeechEngineSelector: React.FC<SpeechEngineSelectorProps> = ({
  currentEngine,
  currentLanguage,
  onEngineChange,
  onLanguageChange,
  engineInfo,
  isListening,
  engineStatus
}) => {
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

  const engines = [
    {
      id: 'web-speech' as SpeechEngine,
      name: 'Web Speech API',
      icon: <Wifi className="h-4 w-4" />,
      description: engineInfo.webSpeech.description,
      supported: engineInfo.webSpeech.supported,
      available: engineInfo.webSpeech.available,
      pros: ['Rapide', 'Intégré au navigateur', 'Bonne précision'],
      cons: ['Nécessite internet', 'Données envoyées en ligne', 'Support navigateur variable']
    },
    {
      id: 'vosk' as SpeechEngine,
      name: 'Vosk Offline',
      icon: <Shield className="h-4 w-4" />,
      description: engineInfo.vosk.description,
      supported: engineInfo.vosk.supported,
      available: engineInfo.vosk.available,
      pros: ['100% privé', 'Fonctionne offline', 'Multilingue'],
      cons: ['Modèles volumineux', 'Première fois plus lente', 'Précision variable']
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Configuration Reconnaissance Vocale
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sélection de langue */}
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

        <Separator />

        {/* Sélection de moteur */}
        <div>
          <h3 className="font-semibold mb-3">Moteur de reconnaissance</h3>
          <div className="space-y-3">
            {engines.map((engine) => (
              <div key={engine.id} className="relative">
                <Button
                  variant={currentEngine === engine.id ? "default" : "outline"}
                  onClick={() => onEngineChange(engine.id)}
                  disabled={isListening || !engine.available}
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-1">{engine.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{engine.name}</span>
                        {currentEngine === engine.id && (
                          <Badge variant="secondary" className="text-xs">Actuel</Badge>
                        )}
                        {engine.id === 'web-speech' && <WifiOff className="h-3 w-3 opacity-50" />}
                        {engine.id === 'vosk' && <Shield className="h-3 w-3 opacity-50" />}
                      </div>
                      <p className="text-xs opacity-70 mb-2">{engine.description}</p>
                      
                      {/* État du moteur */}
                      <div className="flex gap-1 mb-2">
                        {engine.supported ? (
                          <Badge variant="secondary" className="text-xs">Supporté</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Non supporté</Badge>
                        )}
                        
                        {engine.available ? (
                          <Badge variant="default" className="text-xs">Disponible</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {engine.id === 'vosk' ? 'Modèle requis' : 'Non disponible'}
                          </Badge>
                        )}
                      </div>

                      {/* Progrès de chargement Vosk */}
                      {engine.id === 'vosk' && engineInfo.vosk.modelProgress && !engineInfo.vosk.modelProgress.loaded && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">Chargement modèle...</span>
                            <span className="text-xs font-mono">{Math.round(engineInfo.vosk.modelProgress.progress)}%</span>
                          </div>
                          <Progress value={engineInfo.vosk.modelProgress.progress} className="h-1" />
                        </div>
                      )}

                      {/* Avantages/Inconvénients */}
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-green-600 font-medium">✓ Avantages:</span>
                          <ul className="list-none space-y-0.5 mt-1">
                            {engine.pros.map((pro, idx) => (
                              <li key={idx} className="opacity-70">• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-orange-600 font-medium">⚠ Limites:</span>
                          <ul className="list-none space-y-0.5 mt-1">
                            {engine.cons.map((con, idx) => (
                              <li key={idx} className="opacity-70">• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* État actuel */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">État actuel</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Moteur:</span>
              <span className="font-medium capitalize">{currentEngine}</span>
            </div>
            <div className="flex justify-between">
              <span>Langue:</span>
              <span className="font-medium">{languages.find(l => l.code === currentLanguage)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Statut:</span>
              <Badge 
                variant={
                  engineStatus === 'ready' ? 'default' : 
                  engineStatus === 'loading' ? 'secondary' : 'destructive'
                }
                className="text-xs"
              >
                {engineStatus === 'ready' ? 'Prêt' : 
                 engineStatus === 'loading' ? 'Chargement' : 'Erreur'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Écoute:</span>
              <Badge variant={isListening ? 'destructive' : 'outline'} className="text-xs">
                {isListening ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
