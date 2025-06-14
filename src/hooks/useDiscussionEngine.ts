
import { useState, useRef, useCallback, useEffect } from 'react';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage } from '@/types/speechRecognition';
import { DiscussionEngine } from '@/services/DiscussionEngine';
import { SimpleResponseGenerator } from '@/services/SimpleResponseGenerator';

export const useDiscussionEngine = (initialPersonality: PersonalityId = 'friendly') => {
  const discussionEngineRef = useRef<DiscussionEngine | null>(null);
  const responseGeneratorRef = useRef<SimpleResponseGenerator>(new SimpleResponseGenerator());
  
  const [engineState, setEngineState] = useState({
    isProcessing: false,
    canBeInterrupted: true,
    emotionalState: 'neutral' as 'neutral' | 'happy' | 'thinking' | 'listening'
  });

  // Initialiser le moteur
  useEffect(() => {
    if (!discussionEngineRef.current) {
      discussionEngineRef.current = new DiscussionEngine(initialPersonality);
      discussionEngineRef.current.setStateChangeCallback(setEngineState);
      console.log('🚀 Discussion engine initialisé avec support multilingue');
    }
  }, [initialPersonality]);

  const processMessage = useCallback(async (text: string, language: SupportedLanguage = 'fr'): Promise<string> => {
    console.log(`🧠 Traitement du message en ${language}: "${text}"`);
    
    // Pour l'instant, utiliser le générateur de réponses simple avec support multilingue
    // Plus tard, le DiscussionEngine pourra être étendu pour le multilinguisme
    try {
      const response = responseGeneratorRef.current.generateResponse({
        language,
        userInput: text
      });
      
      console.log(`✅ Réponse générée en ${language}: "${response}"`);
      return response;
    } catch (error) {
      console.error('❌ Erreur génération réponse:', error);
      const fallback = language === 'ar' 
        ? 'عذراً، حدث خطأ في معالجة رسالتك.'
        : 'Désolé, une erreur est survenue lors du traitement de votre message.';
      return fallback;
    }
  }, []);

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
    getCurrentPersonality
  };
};
