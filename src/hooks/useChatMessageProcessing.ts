
import React from 'react';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';

interface UseChatMessageProcessingProps {
  currentPersonality: PersonalityId;
  currentGender: Gender;
}

export const useChatMessageProcessing = ({
  currentPersonality,
  currentGender
}: UseChatMessageProcessingProps) => {
  const { processWithIntegrations, getIntegrationManager, isProcessing: isIntegrationProcessing } = useIntegrations();

  const {
    engineState,
    memoryStats,
    processMessage: processMessageWithPersonality,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    ollama
  } = useDiscussionEngine(currentPersonality, currentGender);

  const processMessage = React.useCallback(async (text: string, language?: 'fr' | 'ar', files?: FileList | File[]) => {
    console.log(`🧠 Traitement avec intégrations, langue: ${language || 'auto'} et genre: ${currentGender}`);
    
    try {
      // 1. Traiter avec les intégrations d'abord
      const { enhancedMessage, integrationResults } = await processWithIntegrations(text, files);
      
      // 2. Traiter avec le moteur de discussion principal
      const response = await processMessageWithPersonality(enhancedMessage, language);
      
      // 3. Enrichir la réponse avec les résultats d'intégration
      let finalResponse = response;
      
      if (integrationResults.length > 0) {
        const integrationSummary = integrationResults
          .filter(r => r.success)
          .map(r => {
            if (r.metadata?.integrationId === 'weather' && r.data) {
              return `🌤️ Météo à ${r.data.location}: ${r.data.temperature}°C, ${r.data.description}`;
            }
            if (r.metadata?.integrationId === 'news' && r.data) {
              return `📰 ${r.data.articles.length} actualités trouvées`;
            }
            if (r.metadata?.integrationId === 'search' && r.data) {
              return `🔍 ${r.data.results.length} résultats de recherche`;
            }
            if (r.metadata?.integrationId === 'multimodal' && r.data) {
              return `📁 ${r.data.length} fichier(s) analysé(s)`;
            }
            return '';
          })
          .filter(Boolean)
          .join('\n');
        
        if (integrationSummary) {
          finalResponse = `${response}\n\n---\n${integrationSummary}`;
        }
      }
      
      return finalResponse;
    } catch (error) {
      console.error('Erreur lors du traitement du message avec intégrations:', error);
      return await processMessageWithPersonality(text, language);
    }
  }, [processMessageWithPersonality, processWithIntegrations, currentGender]);

  return {
    processMessage,
    engineState,
    memoryStats,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    ollama,
    getIntegrationManager,
    isIntegrationProcessing
  };
};
