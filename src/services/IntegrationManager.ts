
import { Integration, IntegrationType, IntegrationResult } from '@/types/integrations';
import { MultimodalProcessor } from './integrations/MultimodalProcessor';
import { WeatherAPI } from './integrations/WeatherAPI';
import { NewsAPI } from './integrations/NewsAPI';
import { WebSearchAPI } from './integrations/WebSearchAPI';
import { PluginManager } from './integrations/PluginManager';

export class IntegrationManager {
  private integrations: Map<string, Integration> = new Map();
  private processors: Map<IntegrationType, any> = new Map();

  constructor() {
    this.initializeProcessors();
    this.loadIntegrations();
  }

  private initializeProcessors(): void {
    this.processors.set('multimodal', new MultimodalProcessor());
    this.processors.set('weather', new WeatherAPI());
    this.processors.set('news', new NewsAPI());
    this.processors.set('search', new WebSearchAPI());
    this.processors.set('plugin', new PluginManager());
  }

  private loadIntegrations(): void {
    // Charger les intégrations depuis le localStorage
    const savedIntegrations = localStorage.getItem('chat_integrations');
    if (savedIntegrations) {
      try {
        const integrations = JSON.parse(savedIntegrations);
        integrations.forEach((integration: Integration) => {
          this.integrations.set(integration.id, integration);
        });
      } catch (error) {
        console.error('Erreur lors du chargement des intégrations:', error);
      }
    }

    // Ajouter les intégrations par défaut si elles n'existent pas
    this.addDefaultIntegrations();
  }

  private addDefaultIntegrations(): void {
    const defaultIntegrations: Integration[] = [
      {
        id: 'multimodal',
        name: 'Traitement Multimodal',
        type: 'multimodal',
        enabled: true,
        config: {
          maxFileSize: 10 * 1024 * 1024, // 10MB
          supportedFormats: ['jpg', 'png', 'pdf', 'docx', 'txt']
        }
      },
      {
        id: 'weather',
        name: 'API Météo',
        type: 'weather',
        enabled: false,
        config: {
          provider: 'openweathermap',
          units: 'metric',
          language: 'fr'
        }
      },
      {
        id: 'news',
        name: 'API Actualités',
        type: 'news',
        enabled: false,
        config: {
          provider: 'newsapi',
          country: 'fr',
          category: 'general'
        }
      },
      {
        id: 'search',
        name: 'Recherche Web',
        type: 'search',
        enabled: false,
        config: {
          provider: 'duckduckgo',
          maxResults: 5
        }
      }
    ];

    defaultIntegrations.forEach(integration => {
      if (!this.integrations.has(integration.id)) {
        this.integrations.set(integration.id, integration);
      }
    });

    this.saveIntegrations();
  }

  public async processWithIntegration(
    type: IntegrationType, 
    input: any, 
    context?: any
  ): Promise<IntegrationResult> {
    const processor = this.processors.get(type);
    if (!processor) {
      return {
        success: false,
        error: `Processeur non trouvé pour le type: ${type}`
      };
    }

    const integration = Array.from(this.integrations.values())
      .find(i => i.type === type && i.enabled);

    if (!integration) {
      return {
        success: false,
        error: `Intégration ${type} non activée`
      };
    }

    try {
      const result = await processor.process(input, integration.config, context);
      return {
        success: true,
        data: result,
        metadata: { integrationId: integration.id }
      };
    } catch (error) {
      console.error(`Erreur dans l'intégration ${type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  public getIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  public getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  public updateIntegration(id: string, updates: Partial<Integration>): void {
    const integration = this.integrations.get(id);
    if (integration) {
      const updated = { ...integration, ...updates };
      this.integrations.set(id, updated);
      this.saveIntegrations();
    }
  }

  public toggleIntegration(id: string): void {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.enabled = !integration.enabled;
      this.integrations.set(id, integration);
      this.saveIntegrations();
    }
  }

  private saveIntegrations(): void {
    const integrations = Array.from(this.integrations.values());
    localStorage.setItem('chat_integrations', JSON.stringify(integrations));
  }

  public async detectIntentForIntegration(message: string): Promise<IntegrationType | null> {
    // Détection simple basée sur des mots-clés
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('météo') || lowerMessage.includes('température') || lowerMessage.includes('temps')) {
      return 'weather';
    }

    if (lowerMessage.includes('actualité') || lowerMessage.includes('nouvelles') || lowerMessage.includes('info')) {
      return 'news';
    }

    if (lowerMessage.includes('recherche') || lowerMessage.includes('cherche') || lowerMessage.includes('trouve')) {
      return 'search';
    }

    return null;
  }
}
