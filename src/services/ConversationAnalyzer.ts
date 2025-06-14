
import { ConversationMemory, ConversationInsights, MemoryStats } from '@/types/discussionEngine';
import { DialogueManager } from './DialogueManager';

export class ConversationAnalyzer {
  public static calculateDominantIntents(messages: ConversationMemory['messages']): Record<string, number> {
    const intentCounts: Record<string, number> = {};
    
    for (const message of messages) {
      if (message.intent) {
        intentCounts[message.intent.name] = (intentCounts[message.intent.name] || 0) + 1;
      }
    }
    
    return intentCounts;
  }

  public static calculateEngagement(messages: ConversationMemory['messages']): number {
    // Calculer l'engagement basé sur la longueur des messages et la fréquence
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return 0;

    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    const timeSpread = userMessages.length > 1 ? 
      (userMessages[userMessages.length - 1].timestamp.getTime() - userMessages[0].timestamp.getTime()) / 1000 / 60 : 0;
    
    return Math.min((avgLength / 50) * 0.5 + (userMessages.length / (timeSpread || 1)) * 0.5, 1);
  }

  public static assessPersonalityAlignment(messages: ConversationMemory['messages']): number {
    // Évaluer à quel point les réponses correspondent à la personnalité
    const recentResponses = messages
      .filter(m => m.role === 'assistant' && m.enhancedResponse)
      .slice(-5);
    
    if (recentResponses.length === 0) return 0.5;
    
    const alignmentScores = recentResponses.map(response => {
      const enhanced = response.enhancedResponse!;
      return enhanced.personalityMarkers.length > 0 ? 0.8 : 0.4;
    });
    
    return alignmentScores.reduce((sum, score) => sum + score, 0) / alignmentScores.length;
  }

  public static generateInsights(
    memory: ConversationMemory,
    dialogueManager: DialogueManager
  ): ConversationInsights {
    const recentMessages = memory.messages.slice(-10);
    const dialogueState = dialogueManager.getDialogueState();
    
    return {
      dominantIntents: this.calculateDominantIntents(recentMessages),
      topicProgression: dialogueState.conversationFlow,
      userEngagement: this.calculateEngagement(recentMessages),
      personalityAlignment: this.assessPersonalityAlignment(recentMessages)
    };
  }

  public static generateMemoryStats(
    memory: ConversationMemory,
    dialogueManager: DialogueManager
  ): MemoryStats {
    const dialogueState = dialogueManager.getDialogueState();
    
    return {
      totalMessages: memory.messages.length,
      sessionDuration: Date.now() - memory.sessionStartTime.getTime(),
      userInterests: [...memory.userProfile.interests, ...dialogueState.userProfile.interests],
      userPreferences: memory.userProfile.preferences,
      lastInteraction: memory.lastInteraction,
      currentTopic: dialogueState.currentTopic,
      conversationFlow: dialogueState.conversationFlow,
      followUpCount: dialogueState.followUpCount,
      expertiseAreas: Array.from(dialogueState.userProfile.expertise.keys())
    };
  }
}
