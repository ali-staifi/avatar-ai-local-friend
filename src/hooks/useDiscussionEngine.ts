
import { useState, useRef, useCallback, useEffect } from 'react';
import { DiscussionEngine } from '@/services/DiscussionEngine';

interface DiscussionEngineState {
  isProcessing: boolean;
  canBeInterrupted: boolean;
  currentTask?: string;
  emotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
}

export const useDiscussionEngine = () => {
  const engineRef = useRef<DiscussionEngine>(new DiscussionEngine());
  const [engineState, setEngineState] = useState<DiscussionEngineState>({
    isProcessing: false,
    canBeInterrupted: true,
    emotionalState: 'neutral'
  });

  const [memoryStats, setMemoryStats] = useState({
    totalMessages: 0,
    sessionDuration: 0,
    userInterests: [] as string[],
    userPreferences: [] as string[],
    lastInteraction: new Date()
  });

  // Initialiser les callbacks du moteur
  useEffect(() => {
    const engine = engineRef.current;
    
    engine.setStateChangeCallback((state) => {
      console.log('🔄 État du moteur mis à jour:', state);
      setEngineState(state);
    });

    engine.setInterruptionCallback(() => {
      console.log('🔄 Interruption traitée par le moteur');
    });

    // Mettre à jour les stats périodiquement
    const statsInterval = setInterval(() => {
      setMemoryStats(engine.getMemoryStats());
    }, 5000);

    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const processMessage = useCallback(async (message: string): Promise<string> => {
    try {
      console.log('🎯 Traitement du message via le moteur de discussion');
      const response = await engineRef.current.processUserInput(message);
      
      // Mettre à jour les stats après traitement
      setMemoryStats(engineRef.current.getMemoryStats());
      
      return response;
    } catch (error) {
      console.error('❌ Erreur dans le moteur de discussion:', error);
      throw error;
    }
  }, []);

  const interrupt = useCallback((): boolean => {
    console.log('🛑 Tentative d\'interruption');
    return engineRef.current.interrupt();
  }, []);

  const getConversationExport = useCallback(() => {
    return engineRef.current.exportMemory();
  }, []);

  const resetConversation = useCallback(() => {
    console.log('🔄 Réinitialisation de la conversation');
    engineRef.current = new DiscussionEngine();
    
    // Réinitialiser les callbacks
    engineRef.current.setStateChangeCallback((state) => {
      setEngineState(state);
    });

    engineRef.current.setInterruptionCallback(() => {
      console.log('🔄 Interruption traitée après reset');
    });
    
    setMemoryStats(engineRef.current.getMemoryStats());
  }, []);

  return {
    // État du moteur
    engineState,
    memoryStats,
    
    // Actions
    processMessage,
    interrupt,
    resetConversation,
    getConversationExport,
    
    // États dérivés pour compatibilité
    isProcessing: engineState.isProcessing,
    canBeInterrupted: engineState.canBeInterrupted,
    emotionalState: engineState.emotionalState
  };
};
