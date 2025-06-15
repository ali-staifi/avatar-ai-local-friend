
import { DialogueResponse } from './DialogueManager';
import { PersonalityTrait } from '@/types/personality';
import { EnhancedResponse } from '@/types/responseEnhancer';
import { StreamingResponseService } from './streaming/StreamingResponseService';
import { ResponsePredictionService } from './prediction/ResponsePredictionService';

// Services refactorisés
import { VoiceEmotionAnalyzer } from './response/VoiceEmotionAnalyzer';
import { StyleAdaptationService } from './response/StyleAdaptationService';
import { IntelligentResponseProcessor } from './response/IntelligentResponseProcessor';
import { ResponseMetricsCollector } from './response/ResponseMetricsCollector';

export type { EnhancedResponse } from '@/types/responseEnhancer';

export class ResponseEnhancer {
  private currentPersonality: PersonalityTrait;
  private streamingService: StreamingResponseService;
  private predictionService: ResponsePredictionService;

  // Services refactorisés
  private voiceAnalyzer: VoiceEmotionAnalyzer;
  private styleService: StyleAdaptationService;
  private responseProcessor: IntelligentResponseProcessor;
  private metricsCollector: ResponseMetricsCollector;

  // État de l'intelligence conversationnelle
  private conversationHistory: string[] = [];

  constructor(personality: PersonalityTrait) {
    this.currentPersonality = personality;
    this.streamingService = new StreamingResponseService();
    this.predictionService = new ResponsePredictionService();

    // Initialiser les services refactorisés
    this.voiceAnalyzer = new VoiceEmotionAnalyzer();
    this.styleService = new StyleAdaptationService();
    this.responseProcessor = new IntelligentResponseProcessor();
    this.metricsCollector = new ResponseMetricsCollector();

    console.log('🎭 ResponseEnhancer initialisé avec architecture modulaire');
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    
    // Mettre à jour les préférences utilisateur
    this.metricsCollector.updatePreferences({
      preferredPersonality: personality.id
    });
  }

  public async analyzeVoiceEmotion(audioStream?: MediaStream) {
    return await this.voiceAnalyzer.analyzeVoiceEmotion(audioStream);
  }

  public enhanceResponse(dialogueResponse: DialogueResponse, conversationContext: any): EnhancedResponse {
    // Enregistrer dans l'historique de conversation
    this.conversationHistory.push(dialogueResponse.text);
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }

    // Construire le contexte de conversation pour l'adaptation intelligente
    const context = this.styleService.buildConversationContext(
      conversationContext,
      this.voiceAnalyzer.getEmotionHistory(),
      this.conversationHistory
    );
    
    // Adapter le style dynamiquement
    const adaptedStyle = this.styleService.adaptStyle(
      context, 
      this.currentPersonality, 
      this.voiceAnalyzer.getCurrentEmotion() || undefined
    );

    // Vérifier s'il existe une réponse prédite pour cette intention
    const predictedResponse = this.predictionService.getPredictedResponse(dialogueResponse.intent);
    
    if (predictedResponse) {
      console.log('⚡ Utilisation d\'une réponse pré-générée avec adaptation intelligente');
      
      // Créer les indices contextuels enrichis
      const contextualHints = this.metricsCollector.generateContextualHints(
        conversationContext, 
        context,
        this.voiceAnalyzer.getCurrentEmotion(),
        this.styleService.getStyleTrends()
      );
      
      // Adapter la réponse prédite au contexte actuel et au style adapté
      const adaptedResponse = this.responseProcessor.adaptPredictedResponse(
        predictedResponse.preGeneratedResponse, 
        adaptedStyle,
        contextualHints
      );
      
      // Prédire les prochaines réponses en arrière-plan
      this.asyncPredictNextResponses(dialogueResponse, conversationContext);
      
      return adaptedResponse;
    }

    // Créer des indices contextuels enrichis avec l'intelligence conversationnelle
    const contextualHints = this.metricsCollector.generateContextualHints(
      conversationContext, 
      context,
      this.voiceAnalyzer.getCurrentEmotion(),
      this.styleService.getStyleTrends()
    );
    
    // Traiter la réponse avec intelligence conversationnelle
    const enhancedResponse = this.responseProcessor.processResponse(
      dialogueResponse,
      this.currentPersonality,
      adaptedStyle,
      this.voiceAnalyzer.getCurrentEmotion(),
      context,
      contextualHints
    );

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
    this.metricsCollector.updateUserInterests(interests);
  }

  public recordConversationMetrics(metrics: {
    duration: number;
    messageCount: number;
    dominantEmotion: string;
    topics: string[];
  }): void {
    this.metricsCollector.recordConversationMetrics({
      ...metrics,
      personalityUsed: this.currentPersonality.id
    });
  }

  public getPersonalizedRecommendations() {
    return this.metricsCollector.getPersonalizedRecommendations();
  }

  public getEmotionHistory() {
    return this.voiceAnalyzer.getEmotionHistory();
  }

  public getCurrentEmotion() {
    return this.voiceAnalyzer.getCurrentEmotion();
  }

  public getConversationInsights() {
    return {
      dominantEmotion: this.voiceAnalyzer.getDominantEmotion(),
      emotionHistory: this.voiceAnalyzer.getEmotionHistory().slice(-10),
      styleAdaptations: this.styleService.getStyleTrends(),
      proactiveSuggestions: [] // Sera implémenté par les sous-services
    };
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
