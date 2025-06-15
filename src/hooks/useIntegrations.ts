
import { useState, useCallback, useRef } from 'react';
import { IntegrationManager } from '@/services/IntegrationManager';
import { IntegrationType, IntegrationResult } from '@/types/integrations';

export const useIntegrations = () => {
  const integrationManagerRef = useRef<IntegrationManager>(new IntegrationManager());
  const [isProcessing, setIsProcessing] = useState(false);

  const processWithIntegrations = useCallback(async (
    message: string,
    files?: FileList | File[]
  ): Promise<{ enhancedMessage: string; integrationResults: IntegrationResult[] }> => {
    setIsProcessing(true);
    const results: IntegrationResult[] = [];
    let enhancedMessage = message;

    try {
      const manager = integrationManagerRef.current;

      // 1. Traitement multimodal si des fichiers sont présents
      if (files && files.length > 0) {
        const multimodalResult = await manager.processWithIntegration(
          'multimodal',
          files
        );
        
        if (multimodalResult.success) {
          results.push(multimodalResult);
          enhancedMessage += `\n\n[Fichiers analysés: ${multimodalResult.data.length} fichier(s)]`;
        }
      }

      // 2. Détection d'intention pour les APIs externes
      const detectedIntent = await manager.detectIntentForIntegration(message);
      
      if (detectedIntent) {
        const apiResult = await manager.processWithIntegration(
          detectedIntent,
          message
        );
        
        if (apiResult.success) {
          results.push(apiResult);
          enhancedMessage += `\n\n[Données ${detectedIntent} intégrées]`;
        }
      }

      // 3. Traitement par les plugins
      const pluginResult = await manager.processWithIntegration(
        'plugin',
        message
      );
      
      if (pluginResult.success && pluginResult.data.length > 0) {
        results.push(pluginResult);
        enhancedMessage += `\n\n[Traité par ${pluginResult.data.length} plugin(s)]`;
      }

      return { enhancedMessage, integrationResults: results };
    } catch (error) {
      console.error('Erreur lors du traitement des intégrations:', error);
      return { enhancedMessage, integrationResults: results };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getIntegrationManager = useCallback(() => {
    return integrationManagerRef.current;
  }, []);

  return {
    processWithIntegrations,
    getIntegrationManager,
    isProcessing
  };
};
