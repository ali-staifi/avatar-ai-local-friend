
import { DialogueResponse } from './DialogueManager';
import { PersonalityTrait } from '@/types/personality';
import { EnhancedResponse } from '@/types/responseEnhancer';
import { PersonalityTextEnricher } from './response/PersonalityTextEnricher';
import { EmotionDetector } from './response/EmotionDetector';
import { FollowUpGenerator } from './response/FollowUpGenerator';
import { ContextualHintGenerator } from './response/ContextualHintGenerator';
import { StreamingResponseService } from './streaming/StreamingResponseService';
import { ResponsePredictionService } from './prediction/ResponsePredictionService';
import { UserSessionManager } from './session/UserSessionManager';

export type { EnhancedResponse } from '@/types/responseEnhancer';

export class ResponseEnhancer {
  private currentPersonality: PersonalityTrait;
  private streamingService: StreamingResponseService;
  private predictionService: ResponsePredictionService;
  private sessionManager: UserSessionManager;

  constructor(personality: PersonalityTrait) {
    this.currentPersonality = personality;
    this.streamingService = new StreamingResponseService();
    this.predictionService = new ResponsePredictionService();
    this.sessionManager = new UserSessionManager();
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    
    // Mettre à jour les préférences utilisateur
    this.sessionManager.updatePreferences({
      preferredPersonality: personality.id
    });
  }

  public enhanceResponse(dialogueResponse: DialogueResponse, conversationContext: any): EnhancedResponse {
    // Vérifier s'il existe une réponse prédite pour cette intention
    const predictedResponse = this.predictionService.getPredictedResponse(dialogueResponse.intent);
    
    if (predictedResponse) {
      console.log('⚡ Utilisation d'une réponse pré-générée');
      
      // Adapter la réponse prédite au contexte actuel
      const adaptedResponse = this.adaptPredictedResponse(predictedResponse.preGeneratedResponse, conversationContext);
      
      // Prédire les prochaines réponses en arrière-plan
      this.asyncPredictNextResponses(dialogueResponse, conversationContext);
      
      return adaptedResponse;
    }

    // Enrichir le texte avec la personnalité
    const enhancedText = PersonalityTextEnricher.enrichWithPersonality(
      dialogueResponse.text, 
      dialogueResponse.intent, 
      this.currentPersonality
    );
    
    // Déterminer l'émotion appropriée
    const emotion = EmotionDetector.determineEmotion(
      dialogueResponse.intent, 
      dialogueResponse.confidence
    );
    
    // Générer des questions de suivi intelligentes
    const followUpQuestions = FollowUpGenerator.generateIntelligentFollowUps(
      dialogueResponse.intent, 
      conversationContext,
      this.currentPersonality
    );
    
    // Créer des indices contextuels enrichis avec les données de session
    const contextualHints = this.generateEnrichedContextualHints(conversationContext);
    
    // Identifier les marqueurs de personnalité
    const personalityMarkers = ContextualHintGenerator.extractPersonalityMarkers(
      this.currentPersonality
    );

    const enhancedResponse: EnhancedResponse = {
      text: enhancedText,
      emotion,
      tone: this.currentPersonality.responseStyle,
      followUpQuestions,
      contextualHints,
      personalityMarkers
    };

    // Prédire les prochaines réponses en arrière-plan
    this.asyncPredictNextResponses(dialogueResponse, conversationContext);

    return enhancedResponse;
  }

  public async streamResponse(
    response: EnhancedResponse,
    onChunk: (chunk: any) => void
  ): Promise<void> {
    return this.streamingService.streamResponse(response, onChunk);
  }

  public stopStreaming(): void {
    this.streamingService.stopCurrentStream();
  }

  public updateUserInterests(interests: string[]): void {
    this.sessionManager.updateUserInterests(interests);
  }

  public recordConversationMetrics(metrics: {
    duration: number;
    messageCount: number;
    dominantEmotion: string;
    topics: string[];
  }): void {
    this.sessionManager.recordConversationMetrics({
      ...metrics,
      personalityUsed: this.currentPersonality.id
    });
  }

  public getPersonalizedRecommendations() {
    return this.sessionManager.getPersonalizedRecommendations();
  }

  private adaptPredictedResponse(predicted: EnhancedResponse, context: any): EnhancedResponse {
    // Adapter le contexte et les indices à la situation actuelle
    const updatedHints = this.generateEnrichedContextualHints(context);
    
    return {
      ...predicted,
      contextualHints: updatedHints,
      // Conserver les autres propriétés prédites
    };
  }

  private generateEnrichedContextualHints(context: any): string[] {
    const baseHints = ContextualHintGenerator.createContextualHints(context);
    const session = this.sessionManager.getCurrentSession();
    
    if (session) {
      // Ajouter des indices basés sur l'historique utilisateur
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

  private async asyncPredictNextResponses(dialogueResponse: DialogueResponse, context: any): Promise<void> {
    try {
      // Exécuter en arrière-plan sans bloquer la réponse actuelle
      setTimeout(async () => {
        const mockIntent = { name: dialogueResponse.intent, confidence: dialogueResponse.confidence, entities: [] };
        await this.predictionService.predictNextResponses(
          mockIntent,
          this.currentPersonality,
          context
        );
      }, 100);
    } catch (error) {
      console.error('❌ Erreur prédiction asynchrone:', error);
    }
  }
}
