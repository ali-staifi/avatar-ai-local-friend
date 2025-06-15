import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SupportedLanguage } from '@/types/speechRecognition';
import { OllamaConfig } from '@/hooks/useOllama';
import { LanguageSelector } from '@/components/speech/LanguageSelector';
import { OllamaSelector } from '@/components/ollama/OllamaSelector';
import { IntegrationsPanel } from '@/components/integrations/IntegrationsPanel';
import { IntegrationManager } from '@/services/IntegrationManager';

interface ChatSidebarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  isListening: boolean;
  ollamaAvailable: boolean;
  ollamaModels: string[];
  ollamaLoading: boolean;
  ollamaConfig: OllamaConfig;
  onOllamaConfigUpdate: (config: Partial<OllamaConfig>) => void;
  onRefreshOllamaModels: () => void;
  onCheckOllamaAvailability: () => void;
  integrationManager?: IntegrationManager;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentLanguage,
  onLanguageChange,
  isListening,
  ollamaAvailable,
  ollamaModels,
  ollamaLoading,
  ollamaConfig,
  onOllamaConfigUpdate,
  onRefreshOllamaModels,
  onCheckOllamaAvailability,
  integrationManager
}) => {
  const [showIntegrations, setShowIntegrations] = useState(false);

  return (
    <div className="w-80 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Langue</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            disabled={isListening}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Modèle local (Ollama)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <OllamaSelector
            isAvailable={ollamaAvailable}
            models={ollamaModels}
            isLoading={ollamaLoading}
            config={ollamaConfig}
            onConfigUpdate={onOllamaConfigUpdate}
            onRefreshModels={onRefreshOllamaModels}
            onCheckAvailability={onCheckOllamaAvailability}
          />
        </CardContent>
      </Card>

      {/* Nouveau panneau d'intégrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Intégrations
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIntegrations(!showIntegrations)}
            >
              {showIntegrations ? 'Masquer' : 'Afficher'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showIntegrations && (
          <CardContent className="pt-0">
            <IntegrationsPanel />
          </CardContent>
        )}
      </Card>
    </div>
  );
};
