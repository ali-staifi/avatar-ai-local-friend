
import { useState, useEffect, useCallback, useRef } from 'react';
import { OllamaService, OllamaModel, OllamaCompressionConfig } from '@/services/OllamaService';

// Export the OllamaModel type so it can be used by other components
export type { OllamaModel, OllamaCompressionConfig } from '@/services/OllamaService';

export interface OllamaConfig {
  enabled: boolean;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  compression: OllamaCompressionConfig;
}

export const useOllama = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<OllamaConfig>({
    enabled: false,
    selectedModel: '',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: 'Tu es un assistant IA utile et amical.',
    compression: {
      enabled: true,
      cacheResponses: true,
      compressionLevel: 6,
      cacheThreshold: 100
    }
  });

  const ollamaService = useRef(new OllamaService());

  const checkAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const available = await ollamaService.current.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const modelList = await ollamaService.current.getModels();
        setModels(modelList);
        
        // Sélectionner automatiquement le premier modèle disponible
        if (modelList.length > 0 && !config.selectedModel) {
          setConfig(prev => ({
            ...prev,
            selectedModel: modelList[0].name
          }));
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification Ollama:', error);
      setIsAvailable(false);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [config.selectedModel]);

  const generateResponse = useCallback(async (
    prompt: string,
    conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  ): Promise<string> => {
    if (!isAvailable || !config.enabled || !config.selectedModel) {
      throw new Error('Ollama non disponible ou non configuré');
    }

    const messages = [
      { role: 'system' as const, content: config.systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: prompt }
    ];

    return await ollamaService.current.chatCompletion(
      config.selectedModel,
      messages,
      {
        temperature: config.temperature,
        max_tokens: config.maxTokens
      }
    );
  }, [isAvailable, config]);

  const updateConfig = useCallback((updates: Partial<OllamaConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Update compression config if it changed
      if (updates.compression) {
        ollamaService.current.setCompressionConfig(updates.compression);
      }
      
      return newConfig;
    });
  }, []);

  const refreshModels = useCallback(async () => {
    if (isAvailable) {
      setIsLoading(true);
      try {
        const modelList = await ollamaService.current.getModels();
        setModels(modelList);
      } catch (error) {
        console.error('❌ Erreur rechargement modèles:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAvailable]);

  const getCacheStats = useCallback(() => {
    return ollamaService.current.getCacheStats();
  }, []);

  const clearCache = useCallback(() => {
    ollamaService.current.clearCache();
  }, []);

  // Initialize compression config
  useEffect(() => {
    ollamaService.current.setCompressionConfig(config.compression);
  }, [config.compression]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    isAvailable,
    models,
    isLoading,
    config,
    updateConfig,
    generateResponse,
    refreshModels,
    checkAvailability,
    getCacheStats,
    clearCache
  };
};
