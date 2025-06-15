
import { PluginManifest, PluginContext } from '@/types/integrations';

export interface Plugin {
  manifest: PluginManifest;
  context: PluginContext;
  isLoaded: boolean;
  instance?: any;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();

  public async process(input: any, config: any): Promise<any> {
    // Traiter avec tous les plugins activés
    const results = [];
    
    for (const [id, plugin] of this.plugins) {
      if (plugin.isLoaded && plugin.instance?.processMessage) {
        try {
          const result = await plugin.instance.processMessage(input);
          results.push({ pluginId: id, result });
        } catch (error) {
          console.error(`Erreur dans le plugin ${id}:`, error);
        }
      }
    }
    
    return results;
  }

  public async loadPlugin(manifest: PluginManifest, code: string): Promise<boolean> {
    try {
      // Créer le contexte du plugin
      const context = this.createPluginContext(manifest.id);
      
      // Charger le code du plugin de manière sécurisée
      const pluginFunction = new Function('context', code);
      const instance = pluginFunction(context);
      
      const plugin: Plugin = {
        manifest,
        context,
        isLoaded: true,
        instance
      };
      
      this.plugins.set(manifest.id, plugin);
      
      // Initialiser le plugin s'il a une méthode init
      if (instance.init) {
        await instance.init();
      }
      
      console.log(`Plugin ${manifest.name} chargé avec succès`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du chargement du plugin ${manifest.name}:`, error);
      return false;
    }
  }

  public unloadPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    
    try {
      // Nettoyer le plugin s'il a une méthode cleanup
      if (plugin.instance?.cleanup) {
        plugin.instance.cleanup();
      }
      
      this.plugins.delete(pluginId);
      console.log(`Plugin ${pluginId} déchargé`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du déchargement du plugin ${pluginId}:`, error);
      return false;
    }
  }

  public getLoadedPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.isLoaded);
  }

  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  private createPluginContext(pluginId: string): PluginContext {
    return {
      processMessage: async (message: string) => {
        // Permettre au plugin de traiter des messages
        this.emit(`${pluginId}:message`, { message });
        return `Plugin ${pluginId} a traité: ${message}`;
      },
      
      getConfig: () => {
        const plugin = this.plugins.get(pluginId);
        return plugin?.manifest.config || {};
      },
      
      setConfig: (config: Record<string, any>) => {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
          plugin.manifest.config = { ...plugin.manifest.config, ...config };
        }
      },
      
      emit: (event: string, data: any) => {
        this.emit(`${pluginId}:${event}`, data);
      },
      
      on: (event: string, handler: (data: any) => void) => {
        this.on(`${pluginId}:${event}`, handler);
      }
    };
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Erreur dans le gestionnaire d'événement ${event}:`, error);
      }
    });
  }

  private on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public createSamplePlugin(): { manifest: PluginManifest, code: string } {
    const manifest: PluginManifest = {
      id: 'sample-plugin',
      name: 'Plugin d\'exemple',
      version: '1.0.0',
      description: 'Un plugin d\'exemple pour démontrer l\'architecture',
      author: 'Système',
      permissions: ['message'],
      hooks: ['processMessage']
    };

    const code = `
return {
  init: async function() {
    console.log('Plugin d\\'exemple initialisé');
  },
  
  processMessage: async function(message) {
    if (message.toLowerCase().includes('hello')) {
      return 'Le plugin d\\'exemple détecte un salut !';
    }
    return null;
  },
  
  cleanup: function() {
    console.log('Plugin d\\'exemple nettoyé');
  }
};
    `;

    return { manifest, code };
  }
}
