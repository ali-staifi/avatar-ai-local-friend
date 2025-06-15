import { useState, useRef, useCallback, useEffect } from 'react';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage } from '@/types/speechRecognition';
import { Gender } from '@/types/gender';
import { DiscussionEngine } from '@/services/DiscussionEngine';
import { SimpleResponseGenerator } from '@/services/SimpleResponseGenerator';
import { useOllama, OllamaConfig } from './useOllama';

export const useDiscussionEngine = (
  initialPersonality: PersonalityId = 'friendly',
  gender: Gender = 'male'
) => {
  const discussionEngineRef = useRef<DiscussionEngine | null>(null);
  const responseGeneratorRef = useRef<SimpleResponseGenerator>(new SimpleResponseGenerator());
  
  // Intégration Ollama
  const {
    isAvailable: ollamaAvailable,
    models: ollamaModels,
    isLoading: ollamaLoading,
    config: ollamaConfig,
    updateConfig: updateOllamaConfig,
    generateResponse: generateOllamaResponse,
    refreshModels: refreshOllamaModels,
    checkAvailability: checkOllamaAvailability,
    getCacheStats,
    clearCache
  } = useOllama();
  
  const [engineState, setEngineState] = useState({
    isProcessing: false,
    canBeInterrupted: true,
    emotionalState: 'neutral' as 'neutral' | 'happy' | 'thinking' | 'listening'
  });

  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>>([]);

  // Initialiser le moteur avec le genre
  useEffect(() => {
    if (!discussionEngineRef.current) {
      discussionEngineRef.current = new DiscussionEngine(initialPersonality, gender);
      discussionEngineRef.current.setStateChangeCallback(setEngineState);
      console.log(`🚀 Discussion engine initialisé avec support multilingue et genre: ${gender}`);
    }
  }, [initialPersonality, gender]);

  // Mettre à jour le genre quand il change
  useEffect(() => {
    if (discussionEngineRef.current) {
      discussionEngineRef.current.setGender(gender);
      console.log(`👤 Genre mis à jour: ${gender}`);
    }
  }, [gender]);

  const processMessage = useCallback(async (text: string, language: SupportedLanguage = 'fr'): Promise<string> => {
    console.log(`🧠 Traitement du message en ${language} pour genre ${gender}: "${text}"`);
    
    try {
      // Ajouter le message utilisateur à l'historique
      const newUserMessage = { role: 'user' as const, content: text };
      setConversationHistory(prev => [...prev, newUserMessage]);

      let response: string;

      // Utiliser Ollama si activé et disponible
      if (ollamaConfig.enabled && ollamaAvailable && ollamaConfig.selectedModel) {
        console.log(`🦙 Utilisation d'Ollama avec le modèle: ${ollamaConfig.selectedModel}`);
        
        // Adapter le prompt système selon la personnalité et la langue
        const personalityPrompt = language === 'ar' 
          ? `أنت مساعد ذكي ودود. تكلم باللغة العربية فقط.`
          : `Tu es un assistant IA ${initialPersonality} et ${gender === 'male' ? 'masculin' : 'féminin'}. Réponds en français uniquement.`;
        
        // Mettre à jour le prompt système si nécessaire
        const enhancedConfig = {
          ...ollamaConfig,
          systemPrompt: `${personalityPrompt}\n\n${ollamaConfig.systemPrompt}`
        };
        
        response = await generateOllamaResponse(text, conversationHistory);
      } else {
        // Fallback vers le générateur simple
        console.log(`💭 Utilisation du générateur simple (Ollama non disponible)`);
        response = responseGeneratorRef.current.generateResponse({
          language,
          userInput: text
        });
      }
      
      // Ajouter la réponse à l'historique
      const assistantMessage = { role: 'assistant' as const, content: response };
      setConversationHistory(prev => [...prev, assistantMessage]);
      
      // Limiter l'historique à 20 messages (10 échanges)
      setConversationHistory(prev => prev.length > 20 ? prev.slice(-20) : prev);
      
      console.log(`✅ Réponse générée en ${language} pour ${gender}: "${response}"`);
      return response;
    } catch (error) {
      console.error('❌ Erreur génération réponse:', error);
      const fallback = language === 'ar' 
        ? 'عذراً، حدث خطأ في معالجة رسالتك.'
        : 'Désolé, une erreur est survenue lors du traitement de votre message.';
      return fallback;
    }
  }, [gender, ollamaConfig, ollamaAvailable, generateOllamaResponse, conversationHistory, initialPersonality]);

  const interrupt = useCallback(() => {
    if (discussionEngineRef.current) {
      return discussionEngineRef.current.interrupt();
    }
    return false;
  }, []);

  const resetConversation = useCallback(() => {
    if (discussionEngineRef.current) {
      // Réinitialiser avec la personnalité actuelle
      discussionEngineRef.current = new DiscussionEngine(initialPersonality);
      discussionEngineRef.current.setStateChangeCallback(setEngineState);
    }
    // Réinitialiser l'historique Ollama
    setConversationHistory([]);
  }, [initialPersonality]);

  const changePersonality = useCallback((personalityId: PersonalityId) => {
    if (discussionEngineRef.current) {
      discussionEngineRef.current.setPersonality(personalityId);
    }
  }, []);

  const getCurrentPersonality = useCallback(() => {
    if (discussionEngineRef.current) {
      return discussionEngineRef.current.getCurrentPersonality();
    }
    // Fallback par défaut
    return { id: 'friendly', name: 'Amical' };
  }, []);

  const getConversationExport = useCallback(() => {
    if (discussionEngineRef.current) {
      return discussionEngineRef.current.exportMemory();
    }
    return null;
  }, []);

  const getMemoryStats = useCallback(() => {
    if (discussionEngineRef.current) {
      return discussionEngineRef.current.getMemoryStats();
    }
    return {
      totalMessages: 0,
      sessionDuration: 0,
      userInterests: [],
      userPreferences: [],
      lastInteraction: new Date()
    };
  }, []);

  return {
    engineState,
    memoryStats: getMemoryStats(),
    processMessage,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    // Nouvelles propriétés Ollama avec compression
    ollama: {
      isAvailable: ollamaAvailable,
      models: ollamaModels,
      isLoading: ollamaLoading,
      config: ollamaConfig,
      updateConfig: updateOllamaConfig,
      refreshModels: refreshOllamaModels,
      checkAvailability: checkOllamaAvailability,
      getCacheStats,
      clearCache
    }
  };
};
