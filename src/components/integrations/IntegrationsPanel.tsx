
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IntegrationManager } from '@/services/IntegrationManager';
import { Integration } from '@/types/integrations';
import { Settings, Cloud, Image, Search, Puzzle } from 'lucide-react';

interface IntegrationsPanelProps {
  onIntegrationResult?: (result: any) => void;
}

export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({
  onIntegrationResult
}) => {
  const [integrationManager] = useState(() => new IntegrationManager());
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const allIntegrations = integrationManager.getIntegrations();
    setIntegrations(allIntegrations);
  };

  const handleToggleIntegration = (id: string) => {
    integrationManager.toggleIntegration(id);
    loadIntegrations();
  };

  const handleUpdateConfig = (id: string, config: any) => {
    integrationManager.updateIntegration(id, { config });
    loadIntegrations();
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'multimodal': return <Image className="h-4 w-4" />;
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'news': return <Search className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      case 'plugin': return <Puzzle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const renderIntegrationConfig = (integration: Integration) => {
    switch (integration.type) {
      case 'weather':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weather-api-key">Clé API OpenWeatherMap</Label>
              <Input
                id="weather-api-key"
                type="password"
                value={integration.apiKey || ''}
                onChange={(e) => 
                  integrationManager.updateIntegration(integration.id, { apiKey: e.target.value })
                }
                placeholder="Votre clé API"
              />
            </div>
            <div>
              <Label htmlFor="weather-units">Unités</Label>
              <select
                id="weather-units"
                className="w-full p-2 border rounded"
                value={integration.config?.units || 'metric'}
                onChange={(e) => 
                  handleUpdateConfig(integration.id, { 
                    ...integration.config, 
                    units: e.target.value 
                  })
                }
              >
                <option value="metric">Métrique (°C)</option>
                <option value="imperial">Impérial (°F)</option>
              </select>
            </div>
          </div>
        );
      
      case 'news':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="news-api-key">Clé API NewsAPI</Label>
              <Input
                id="news-api-key"
                type="password"
                value={integration.apiKey || ''}
                onChange={(e) => 
                  integrationManager.updateIntegration(integration.id, { apiKey: e.target.value })
                }
                placeholder="Votre clé API"
              />
            </div>
            <div>
              <Label htmlFor="news-country">Pays</Label>
              <select
                id="news-country"
                className="w-full p-2 border rounded"
                value={integration.config?.country || 'fr'}
                onChange={(e) => 
                  handleUpdateConfig(integration.id, { 
                    ...integration.config, 
                    country: e.target.value 
                  })
                }
              >
                <option value="fr">France</option>
                <option value="us">États-Unis</option>
                <option value="gb">Royaume-Uni</option>
              </select>
            </div>
          </div>
        );
      
      case 'multimodal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="max-file-size">Taille max des fichiers (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={integration.config?.maxFileSize ? integration.config.maxFileSize / (1024 * 1024) : 10}
                onChange={(e) => 
                  handleUpdateConfig(integration.id, { 
                    ...integration.config, 
                    maxFileSize: parseInt(e.target.value) * 1024 * 1024
                  })
                }
              />
            </div>
          </div>
        );
      
      default:
        return <div>Aucune configuration disponible</div>;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Intégrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIntegrationIcon(integration.type)}
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant={integration.enabled ? "default" : "secondary"}>
                        {integration.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      Configurer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="config">
            {selectedIntegration ? (
              <Card className="p-4">
                <h3 className="font-medium mb-4">
                  Configuration - {selectedIntegration.name}
                </h3>
                {renderIntegrationConfig(selectedIntegration)}
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setSelectedIntegration(null)}>
                    Fermer
                  </Button>
                  <Button variant="outline" onClick={loadIntegrations}>
                    Actualiser
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Sélectionnez une intégration à configurer
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
