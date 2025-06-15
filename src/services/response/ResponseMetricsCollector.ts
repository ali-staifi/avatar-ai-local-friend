
import { UserSessionManager } from '../session/UserSessionManager';
import { PersonalityTrait } from '@/types/personality';
import { EmotionAnalysis } from '../intelligence/VoiceEmotionDetector';
import { ConversationContext } from '../intelligence/DynamicStyleAdapter';

export class ResponseMetricsCollector {
  private sessionManager: UserSessionManager;

  constructor() {
    this.sessionManager = new UserSessionManager();
  }

  public generateContextualHints(
    conversationContext: any, 
    intelligentContext: ConversationContext,
    currentEmotion: EmotionAnalysis | null,
    styleTrends: any
  ): string[] {
    const baseHints = this.createBaseHints(conversationContext);
    const session = this.sessionManager.getCurrentSession();
    
    // Ajouter des indices basés sur l'intelligence émotionnelle
    if (currentEmotion && currentEmotion.confidence > 0.7) {
      baseHints.push(`🎭 Émotion détectée: ${currentEmotion.emotion}`);
    }

    // Ajouter des indices basés sur les tendances de style
    if (styleTrends.emotionalLevelTrend !== 'stable') {
      baseHints.push(`📈 Tendance émotionnelle: ${styleTrends.emotionalLevelTrend}`);
    }

    // Ajouter des indices basés sur l'historique de session
    if (session) {
      if (session.preferences.interests.length > 0) {
        baseHints.push(`🎯 Vos intérêts: ${session.preferences.interests.slice(0, 2).join(', ')}`);
      }
      
      if (session.conversationHistory.totalConversations > 5) {
        baseHints.push(`👋 Conversation n°${session.conversationHistory.totalConversations}`);
      }
      
      // Recommandations personnalisées
      const recommendations = this.sessionManager.getPersonalizedRecommendations();
      if (recommendations.suggestedTopics.length > 0) {
        baseHints.push(`💡 Sujets suggérés: ${recommendations.suggestedTopics.join(', ')}`);
      }
    }
    
    return baseHints;
  }

  private createBaseHints(conversationContext: any): string[] {
    const hints: string[] = [];
    
    if (conversationContext.currentTopic) {
      hints.push(`💡 Sujet en cours: ${conversationContext.currentTopic}`);
    }
    
    if (conversationContext.userProfile?.interests?.length > 0) {
      hints.push(`🎯 Intérêts: ${conversationContext.userProfile.interests.slice(0, 2).join(', ')}`);
    }
    
    if (conversationContext.followUpCount > 3) {
      hints.push('🔄 Conversation approfondie');
    }
    
    return hints;
  }

  public updateUserInterests(interests: string[]): void {
    this.sessionManager.updateUserInterests(interests);
  }

  public recordConversationMetrics(metrics: {
    duration: number;
    messageCount: number;
    dominantEmotion: string;
    topics: string[];
    personalityUsed: string;
  }): void {
    this.sessionManager.recordConversationMetrics(metrics);
  }

  public getPersonalizedRecommendations() {
    return this.sessionManager.getPersonalizedRecommendations();
  }

  public updatePreferences(preferences: { preferredPersonality: string }): void {
    this.sessionManager.updatePreferences(preferences);
  }
}
