
import { CompressionService } from './compression/CompressionService';
import { ModelCacheService } from './compression/ModelCacheService';

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  modified_at: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaCompressionConfig {
  enabled: boolean;
  cacheResponses: boolean;
  compressionLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  cacheThreshold: number; // Minimum response length to cache
}

export class OllamaService {
  private baseUrl: string;
  private compressionService: CompressionService;
  private cacheService: ModelCacheService;
  private compressionConfig: OllamaCompressionConfig = {
    enabled: true,
    cacheResponses: true,
    compressionLevel: 6,
    cacheThreshold: 100
  };

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.compressionService = CompressionService.getInstance();
    this.cacheService = ModelCacheService.getInstance();
    
    // Configure compression based on browser support
    if (!this.compressionService.getCompressionSupport()) {
      this.compressionConfig.enabled = false;
      console.warn('🗜️ Compression not supported in this browser');
    }
  }

  public setCompressionConfig(config: Partial<OllamaCompressionConfig>): void {
    this.compressionConfig = { ...this.compressionConfig, ...config };
    
    this.cacheService.setCompressionOptions({
      enabled: this.compressionConfig.enabled,
      level: this.compressionConfig.compressionLevel,
      threshold: this.compressionConfig.cacheThreshold
    });
    
    console.log('🗜️ Ollama compression config updated:', this.compressionConfig);
  }

  public getCompressionConfig(): OllamaCompressionConfig {
    return { ...this.compressionConfig };
  }

  public getCacheStats() {
    return this.cacheService.getCacheStats();
  }

  public clearCache(): void {
    this.cacheService.clearCache();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.warn('🦙 Ollama non disponible:', error);
      return false;
    }
  }

  async getModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('🦙 Modèles Ollama récupérés:', data.models?.length || 0);
      return data.models || [];
    } catch (error) {
      console.error('❌ Erreur récupération modèles Ollama:', error);
      return [];
    }
  }

  async generateResponse(
    model: string,
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      system?: string;
    } = {}
  ): Promise<string> {
    try {
      // Check cache first if enabled
      if (this.compressionConfig.cacheResponses) {
        const cacheKey = `${prompt}:${JSON.stringify(options)}`;
        const cachedResponse = await this.cacheService.getCachedResponse(model, cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      console.log(`🦙 Génération avec ${model}:`, prompt.substring(0, 100));
      
      const requestBody = {
        model,
        prompt,
        system: options.system,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 500,
        },
        stream: false,
      };

      // Compress request if enabled and large enough
      let body = JSON.stringify(requestBody);
      if (this.compressionConfig.enabled && body.length > this.compressionConfig.cacheThreshold) {
        body = await this.compressionService.compressText(body);
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(body.startsWith('compressed:') && { 'Content-Encoding': 'custom-compressed' })
        },
        body: body.startsWith('compressed:') ? body.replace('compressed:', '') : body,
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      const result = data.response || 'Aucune réponse générée';
      
      // Cache the response if enabled
      if (this.compressionConfig.cacheResponses && result.length >= this.compressionConfig.cacheThreshold) {
        const cacheKey = `${prompt}:${JSON.stringify(options)}`;
        await this.cacheService.cacheResponse(model, cacheKey, result);
      }

      console.log('✅ Réponse Ollama générée');
      return result;
    } catch (error) {
      console.error('❌ Erreur génération Ollama:', error);
      throw new Error(`Impossible de générer une réponse avec Ollama: ${error}`);
    }
  }

  async chatCompletion(
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<string> {
    try {
      // Create cache key from messages and options
      const cacheKey = `${JSON.stringify(messages)}:${JSON.stringify(options)}`;
      
      // Check cache first if enabled
      if (this.compressionConfig.cacheResponses) {
        const cachedResponse = await this.cacheService.getCachedResponse(model, cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      console.log(`🦙 Chat completion avec ${model}:`, messages.length, 'messages');
      
      const requestBody = {
        model,
        messages,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 500,
        },
        stream: false,
      };

      // Compress request if enabled and large enough
      let body = JSON.stringify(requestBody);
      if (this.compressionConfig.enabled && body.length > this.compressionConfig.cacheThreshold) {
        body = await this.compressionService.compressText(body);
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(body.startsWith('compressed:') && { 'Content-Encoding': 'custom-compressed' })
        },
        body: body.startsWith('compressed:') ? body.replace('compressed:', '') : body,
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama Chat: ${response.status}`);
      }

      const data = await response.json();
      const result = data.message?.content || 'Aucune réponse générée';
      
      // Cache the response if enabled
      if (this.compressionConfig.cacheResponses && result.length >= this.compressionConfig.cacheThreshold) {
        await this.cacheService.cacheResponse(model, cacheKey, result);
      }

      console.log('✅ Chat completion Ollama terminé');
      return result;
    } catch (error) {
      console.error('❌ Erreur chat completion Ollama:', error);
      throw new Error(`Impossible de compléter le chat avec Ollama: ${error}`);
    }
  }
}
