
import { useState, useRef, useCallback, useEffect } from 'react';
import { PersonalityId } from '@/types/personality';
import { SupportedLanguage } from '@/types/speechRecognition';
import { Gender } from '@/types/gender';
import { DiscussionEngine } from '@/services/DiscussionEngine';
import { SimpleResponseGenerator } from '@/services/SimpleResponseGenerator';

export const useDiscussionEngine = (
  initialPersonality: PersonalityId = 'friendly',
  gender: Gender = 'male'
) => {
  const discussionEngineRef = useRef<DiscussionEngine | null>(null);
  const responseGeneratorRef = useRef<SimpleResponseGenerator>(new SimpleResponseGenerator());
  
  const [engineState, setEngineState] = useState({
    isProcessing: false,
    canBeInterrupted: true,
    emotionalState: 'neutral' as 'neutral' | 'happy' | 'thinking' | 'listening'
  });

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
      const response = responseGeneratorRef.current.generateResponse({
        language,
        userInput: text,
        personalityId: 'friendly' // On peut passer la personnalité actuelle ici
      });
      
      console.log(`✅ Réponse générée en ${language} pour ${gender}: "${response}"`);
      return response;
    } catch (error) {
      console.error('❌ Erreur génération réponse:', error);
      const fallback = language === 'ar' 
        ? 'عذراً، حدث خطأ في معالجة رسالتك.'
        : 'Désolé, une erreur est survenue lors du traitement de votre message.';
      return fallback;
    }
  }, [gender]);

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
