
export interface VoskModel {
  language: string;
  code: string;
  url: string;
  size: string;
  description: string;
}

export interface ModelLoadingProgress {
  language: string;
  loaded: boolean;
  progress: number;
  error?: string;
}

export class VoskModelManager {
  private models: Map<string, any> = new Map();
  private modelConfigs: VoskModel[] = [
    {
      language: 'Français',
      code: 'fr',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip',
      size: '41MB',
      description: 'Modèle français compact pour reconnaissance vocale offline'
    },
    {
      language: 'العربية',
      code: 'ar',
      url: 'https://alphacephei.com/vosk/models/vosk-model-ar-mgb2-0.4.zip',
      size: '278MB',
      description: 'Modèle arabe pour reconnaissance vocale offline'
    }
  ];
  
  private loadingProgress: Map<string, ModelLoadingProgress> = new Map();
  private progressCallbacks: Set<(progress: ModelLoadingProgress[]) => void> = new Set();

  constructor() {
    // Initialiser les états de chargement
    this.modelConfigs.forEach(config => {
      this.loadingProgress.set(config.code, {
        language: config.language,
        loaded: false,
        progress: 0
      });
    });
  }

  public getAvailableModels(): VoskModel[] {
    return [...this.modelConfigs];
  }

  public onProgressUpdate(callback: (progress: ModelLoadingProgress[]) => void) {
    this.progressCallbacks.add(callback);
    // Envoyer l'état actuel immédiatement
    callback(Array.from(this.loadingProgress.values()));
  }

  public offProgressUpdate(callback: (progress: ModelLoadingProgress[]) => void) {
    this.progressCallbacks.delete(callback);
  }

  private notifyProgress() {
    const progressArray = Array.from(this.loadingProgress.values());
    this.progressCallbacks.forEach(callback => callback(progressArray));
  }

  public async loadModel(languageCode: string): Promise<any> {
    if (this.models.has(languageCode)) {
      return this.models.get(languageCode);
    }

    const config = this.modelConfigs.find(m => m.code === languageCode);
    if (!config) {
      throw new Error(`Modèle non trouvé pour la langue: ${languageCode}`);
    }

    console.log(`🔄 Chargement du modèle Vosk pour ${config.language}...`);
    
    try {
      // Mettre à jour le statut de chargement
      this.loadingProgress.set(languageCode, {
        language: config.language,
        loaded: false,
        progress: 10
      });
      this.notifyProgress();

      // Simuler le chargement progressif (Vosk réel nécessiterait un worker)
      const model = await this.downloadAndInitializeModel(config);
      
      this.models.set(languageCode, model);
      this.loadingProgress.set(languageCode, {
        language: config.language,
        loaded: true,
        progress: 100
      });
      this.notifyProgress();
      
      console.log(`✅ Modèle ${config.language} chargé avec succès`);
      return model;
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du modèle ${config.language}:`, error);
      this.loadingProgress.set(languageCode, {
        language: config.language,
        loaded: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      this.notifyProgress();
      throw error;
    }
  }

  private async downloadAndInitializeModel(config: VoskModel): Promise<any> {
    // Simulation du téléchargement et initialisation
    // Dans une vraie implémentation, on utiliserait vosk-browser
    return new Promise((resolve, reject) => {
      let progress = 10;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        this.loadingProgress.set(config.code, {
          language: config.language,
          loaded: false,
          progress: Math.min(progress, 95)
        });
        this.notifyProgress();

        if (progress >= 95) {
          clearInterval(interval);
          // Simuler un modèle chargé
          resolve({
            language: config.code,
            name: config.language,
            ready: true
          });
        }
      }, 200);

      // Simuler un échec occasionnel pour les tests
      if (Math.random() < 0.1) {
        clearInterval(interval);
        reject(new Error('Échec du téléchargement du modèle'));
      }
    });
  }

  public isModelLoaded(languageCode: string): boolean {
    const progress = this.loadingProgress.get(languageCode);
    return progress ? progress.loaded : false;
  }

  public getModel(languageCode: string): any | null {
    return this.models.get(languageCode) || null;
  }

  public getLoadingProgress(): ModelLoadingProgress[] {
    return Array.from(this.loadingProgress.values());
  }
}

// Instance globale
export const voskModelManager = new VoskModelManager();
