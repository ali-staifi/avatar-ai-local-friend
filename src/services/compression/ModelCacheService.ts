
import { CompressionService, CompressionOptions } from './CompressionService';
import { OllamaModel, OllamaResponse } from '../OllamaService';

interface CachedModel {
  model: OllamaModel;
  responses: Map<string, string>; // prompt hash -> compressed response
  lastAccessed: Date;
  accessCount: number;
}

interface CacheStats {
  totalModels: number;
  totalResponses: number;
  cacheHits: number;
  cacheMisses: number;
  compressionRatio: number;
  memoryUsed: number;
}

export class ModelCacheService {
  private static instance: ModelCacheService;
  private cache = new Map<string, CachedModel>();
  private compressionService: CompressionService;
  private maxCacheSize: number = 50; // Maximum number of cached responses per model
  private maxModels: number = 10; // Maximum number of models to cache
  private compressionOptions: CompressionOptions = {
    enabled: true,
    level: 6,
    threshold: 512
  };
  private stats: CacheStats = {
    totalModels: 0,
    totalResponses: 0,
    cacheHits: 0,
    cacheMisses: 0,
    compressionRatio: 1,
    memoryUsed: 0
  };

  constructor() {
    this.compressionService = CompressionService.getInstance();
    this.startCleanupInterval();
  }

  public static getInstance(): ModelCacheService {
    if (!ModelCacheService.instance) {
      ModelCacheService.instance = new ModelCacheService();
    }
    return ModelCacheService.instance;
  }

  public async cacheResponse(modelName: string, prompt: string, response: string): Promise<void> {
    const promptHash = await this.hashPrompt(prompt);
    const compressedResponse = await this.compressionService.compressText(response, this.compressionOptions);
    
    let cachedModel = this.cache.get(modelName);
    if (!cachedModel) {
      // Check if we need to evict old models
      if (this.cache.size >= this.maxModels) {
        this.evictLeastRecentlyUsedModel();
      }
      
      cachedModel = {
        model: {} as OllamaModel, // Will be populated when needed
        responses: new Map(),
        lastAccessed: new Date(),
        accessCount: 1
      };
      this.cache.set(modelName, cachedModel);
      this.stats.totalModels++;
    }
    
    // Check if we need to evict old responses
    if (cachedModel.responses.size >= this.maxCacheSize) {
      // Remove oldest entries (simple FIFO for now)
      const firstKey = cachedModel.responses.keys().next().value;
      if (firstKey) {
        cachedModel.responses.delete(firstKey);
      }
    }
    
    cachedModel.responses.set(promptHash, compressedResponse);
    cachedModel.lastAccessed = new Date();
    cachedModel.accessCount++;
    this.stats.totalResponses++;
    
    console.log(`🗄️ Cached response for ${modelName}: ${prompt.substring(0, 50)}...`);
  }

  public async getCachedResponse(modelName: string, prompt: string): Promise<string | null> {
    const promptHash = await this.hashPrompt(prompt);
    const cachedModel = this.cache.get(modelName);
    
    if (!cachedModel) {
      this.stats.cacheMisses++;
      return null;
    }
    
    const compressedResponse = cachedModel.responses.get(promptHash);
    if (!compressedResponse) {
      this.stats.cacheMisses++;
      return null;
    }
    
    // Update access statistics
    cachedModel.lastAccessed = new Date();
    cachedModel.accessCount++;
    this.stats.cacheHits++;
    
    // Decompress and return
    const response = await this.compressionService.decompressText(compressedResponse);
    console.log(`🎯 Cache hit for ${modelName}: ${prompt.substring(0, 50)}...`);
    
    return response;
  }

  public clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalModels: 0,
      totalResponses: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressionRatio: 1,
      memoryUsed: 0
    };
    console.log('🧹 Model cache cleared');
  }

  public getCacheStats(): CacheStats {
    let totalMemory = 0;
    let originalSize = 0;
    let compressedSize = 0;
    
    for (const [modelName, cachedModel] of this.cache) {
      for (const [hash, compressedResponse] of cachedModel.responses) {
        compressedSize += compressedResponse.length;
        // Estimate original size (rough approximation)
        originalSize += compressedResponse.startsWith('compressed:') ? 
          compressedResponse.length * 2 : compressedResponse.length;
      }
    }
    
    return {
      ...this.stats,
      compressionRatio: originalSize > 0 ? originalSize / compressedSize : 1,
      memoryUsed: compressedSize
    };
  }

  public setCompressionOptions(options: Partial<CompressionOptions>): void {
    this.compressionOptions = { ...this.compressionOptions, ...options };
    console.log('🗜️ Compression options updated:', this.compressionOptions);
  }

  private async hashPrompt(prompt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(prompt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private evictLeastRecentlyUsedModel(): void {
    let oldestModel: string | null = null;
    let oldestTime = new Date();
    
    for (const [modelName, cachedModel] of this.cache) {
      if (cachedModel.lastAccessed < oldestTime) {
        oldestTime = cachedModel.lastAccessed;
        oldestModel = modelName;
      }
    }
    
    if (oldestModel) {
      this.cache.delete(oldestModel);
      console.log(`🗑️ Evicted cached model: ${oldestModel}`);
    }
  }

  private startCleanupInterval(): void {
    // Clean up old cache entries every 5 minutes
    setInterval(() => {
      const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      
      for (const [modelName, cachedModel] of this.cache) {
        if (cachedModel.lastAccessed < cutoffTime && cachedModel.accessCount < 3) {
          this.cache.delete(modelName);
          console.log(`🧹 Cleaned up unused cached model: ${modelName}`);
        }
      }
    }, 5 * 60 * 1000);
  }
}
