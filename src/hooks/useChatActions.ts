
import { useCallback } from 'react';
import { PersonalityId } from '@/types/personality';
import { toast } from 'sonner';

interface UseChatActionsProps {
  resetConversation: (personality: PersonalityId) => void;
  getConversationExport: () => any;
  getCurrentPersonality: () => any;
  resetMessages: (message: string) => void;
  currentPersonality: PersonalityId;
  currentLanguage: string;
  currentEngine: string;
  engineInfo: any;
}

export const useChatActions = ({
  resetConversation,
  getConversationExport,
  getCurrentPersonality,
  resetMessages,
  currentPersonality,
  currentLanguage,
  currentEngine,
  engineInfo
}: UseChatActionsProps) => {
  const handleResetConversation = useCallback(() => {
    resetConversation(currentPersonality);
    const personality = getCurrentPersonality();
    const resetMessage = `Conversation réinitialisée avec la personnalité ${personality.name} ! ${personality.speechPattern[0]} Je suis prêt pour une nouvelle discussion en ${currentLanguage === 'fr' ? 'français' : 'arabe'}.`;
    resetMessages(resetMessage);
    toast.success("Conversation réinitialisée", {
      description: `Nouvelle conversation avec ${personality.name} en ${currentLanguage === 'fr' ? 'français' : 'arabe'}.`
    });
  }, [resetConversation, getCurrentPersonality, resetMessages, currentPersonality, currentLanguage]);

  const handleExportConversation = useCallback(() => {
    const exportData = {
      ...getConversationExport(),
      speechConfig: {
        engine: currentEngine,
        language: currentLanguage,
        engineInfo
      }
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conversation_${exportData.conversationId}_${currentEngine}_${currentLanguage}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Conversation exportée", {
      description: "Le fichier de conversation avec config vocale a été téléchargé."
    });
  }, [getConversationExport, currentEngine, currentLanguage, engineInfo]);

  return {
    handleResetConversation,
    handleExportConversation
  };
};
