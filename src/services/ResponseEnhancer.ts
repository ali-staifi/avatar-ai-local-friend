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

// Nouveaux services d'intelligence conversationnelle
import { VoiceEmotionDetector, EmotionAnalysis } from './intelligence/VoiceEmotionDetector';
import { DynamicStyleAdapter, ConversationContext } from './intelligence/DynamicStyleAdapter';
import { ProactiveSuggestionGenerator } from './intelligence/ProactiveSuggestionGenerator';

export type { EnhancedResponse } from '@/types/responseEnhancer';

export class ResponseEnhancer {
  private currentPersonality: PersonalityTrait;
  private streamingService: StreamingResponseService;
  private predictionService: ResponsePredictionService;
  private sessionManager: UserSessionManager;

  // Services d'intelligence conversationnelle
  private voiceEmotionDetector: VoiceEmotionDetector;
  private styleAdapter: DynamicStyleAdapter;
  private suggestionGenerator: ProactiveSuggestionGenerator;

  // État de l'intelligence conversationnelle
  private currentEmotion: EmotionAnalysis | null = null;
  private emotionHistory: EmotionAnalysis[] = [];
  private conversationHistory: string[] = [];

  constructor(personality: PersonalityTrait) {
    this.currentPersonality = personality;
    this.streamingService = new StreamingResponseService();
    this.predictionService = new ResponsePredictionService();
    this.sessionManager = new UserSessionManager();

    // Initialiser les services d'intelligence
    this.voiceEmotionDetector = new VoiceEmotionDetector();
    this.styleAdapter = new DynamicStyleAdapter();
    this.suggestionGenerator = new ProactiveSuggestionGenerator();

    this.initializeVoiceDetection();
  }

  private async initializeVoiceDetection(): Promise<void> {
    try {
      await this.voiceEmotionDetector.initialize();
      console.log('🎭 Intelligence conversationnelle initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation intelligence:', error);
    }
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    
    // Mettre à jour les préférences utilisateur
    this.sessionManager.updatePreferences({
      preferredPersonality: personality.id
    });
  }

  public async analyzeVoiceEmotion(audioStream?: MediaStream): Promise<EmotionAnalysis | null> {
    if (!audioStream) return null;

    try {
      const emotion = await this.voiceEmotionDetector.analyzeAudioStream(audioStream);
      if (emotion) {
        this.currentEmotion = emotion;
        this.emotionHistory.push(emotion);
        
        // Limiter l'historique
        if (this.emotionHistory.length > 20) {
          this.emotionHistory = this.emotionHistory.slice(-20);
        }
        
        console.log('🎭 Émotion vocale analysée:', emotion);
      }
      return emotion;
    } catch (error) {
      console.error('❌ Erreur analyse émotion vocale:', error);
      return null;
    }
  }

  public enhanceResponse(dialogueResponse: DialogueResponse, conversationContext: any): EnhancedResponse {
    // Enregistrer dans l'historique de conversation
    this.conversationHistory.push(dialogueResponse.text);
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }

    // Créer le contexte de conversation pour l'adaptation intelligente
    const context: ConversationContext = this.buildConversationContext(conversationContext);
    
    // Adapter le style dynamiquement
    const adaptedStyle = this.styleAdapter.adaptStyle(
      context, 
      this.currentPersonality, 
      this.currentEmotion || undefined
    );

    // Vérifier s'il existe une réponse prédite pour cette intention
    const predictedResponse = this.predictionService.getPredictedResponse(dialogueResponse.intent);
    
    if (predictedResponse) {
      console.log('⚡ Utilisation d\'une réponse pré-générée avec adaptation intelligente');
      
      // Adapter la réponse prédite au contexte actuel et au style adapté
      const adaptedResponse = this.adaptPredictedResponseIntelligently(
        predictedResponse.preGeneratedResponse, 
        conversationContext,
        adaptedStyle
      );
      
      // Prédire les prochaines réponses en arrière-plan
      this.asyncPredictNextResponses(dialogueResponse, conversationContext);
      
      return adaptedResponse;
    }

    // Enrichir le texte avec la personnalité et le style adapté
    let enhancedText = PersonalityTextEnricher.enrichWithPersonality(
      dialogueResponse.text, 
      dialogueResponse.intent, 
      this.currentPersonality
    );

    // Appliquer les adaptations de style intelligentes
    enhancedText = this.applyStyleAdaptations(enhancedText, adaptedStyle);
    
    // Déterminer l'émotion appropriée (avec intelligence émotionnelle)
    const emotion = this.determineIntelligentEmotion(
      dialogueResponse.intent, 
      dialogueResponse.confidence,
      this.currentEmotion
    );
    
    // Générer des questions de suivi intelligentes
    const followUpQuestions = FollowUpGenerator.generateIntelligentFollowUps(
      dialogueResponse.intent, 
      conversationContext,
      this.currentPersonality
    );
    
    // Créer des indices contextuels enrichis avec l'intelligence conversationnelle
    const contextualHints = this.generateIntelligentContextualHints(conversationContext, context);
    
    // Identifier les marqueurs de personnalité
    const personalityMarkers = ContextualHintGenerator.extractPersonalityMarkers(
      this.currentPersonality
    );

    // Générer des suggestions proactives
    const proactiveSuggestions = this.suggestionGenerator.generateProactiveSuggestions(
      context,
      this.emotionHistory,
      this.conversationHistory
    );

    const enhancedResponse: EnhancedResponse = {
      text: enhancedText,
      emotion,
      tone: adaptedStyle.tone,
      followUpQuestions,
      contextualHints: [
        ...contextualHints,
        ...proactiveSuggestions.map(s => `💡 ${s.text}`)
      ],
      personalityMarkers
    };

    // Prédire les prochaines réponses en arrière-plan
    this.asyncPredictNextResponses(dialogueResponse, conversationContext);

    return enhancedResponse;
  }

  private buildConversationContext(conversationContext: any): ConversationContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: ConversationContext['timeOfDay'] = 'afternoon';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Estimation de l'engagement utilisateur basée sur l'historique émotionnel
    let userEngagement: ConversationContext['userEngagement'] = 'medium';
    if (this.emotionHistory.length > 0) {
      const recentEmotions = this.emotionHistory.slice(-3);
      const positiveEmotions = recentEmotions.filter(e => 
        ['happy', 'excited', 'calm'].includes(e.emotion)
      ).length;
      
      if (positiveEmotions >= 2) userEngagement = 'high';
      else if (positiveEmotions === 0) userEngagement = 'low';
    }

    return {
      topic: conversationContext.currentTopic || 'général',
      userEmotion: this.currentEmotion?.emotion || 'neutral',
      conversationLength: this.conversationHistory.length,
      previousInteractions: this.emotionHistory.length,
      timeOfDay,
      userEngagement
    };
  }

  private applyStyleAdaptations(text: string, style: any): string {
    let adaptedText = text;

    // Adaptation selon le ton
    switch (style.tone) {
      case 'empathetic':
        adaptedText = `Je comprends... ${adaptedText}`;
        break;
      case 'energetic':
        adaptedText = `${adaptedText} 🚀`;
        break;
      case 'calm':
        adaptedText = adaptedText.replace(/!+/g, '.');
        break;
      case 'formal':
        adaptedText = adaptedText.replace(/sympa/g, 'agréable');
        break;
    }

    // Adaptation selon la longueur souhaitée
    if (style.responseLength === 'brief' && adaptedText.length > 100) {
      adaptedText = adaptedText.substring(0, 100) + '...';
    }

    return adaptedText;
  }

  private determineIntelligentEmotion(
    intent: string, 
    confidence: number,
    userEmotion?: EmotionAnalysis | null
  ): 'neutral' | 'happy' | 'thinking' | 'listening' {
    // Adaptation émotionnelle basée sur l'émotion de l'utilisateur
    if (userEmotion) {
      switch (userEmotion.emotion) {
        case 'sad':
        case 'stressed':
          return 'listening'; // Montrer de l'empathie
        case 'excited':
        case 'happy':
          return 'happy'; // Refléter l'énergie positive
        case 'angry':
          return 'neutral'; // Rester neutre pour apaiser
      }
    }

    // Fallback vers la logique originale
    return EmotionDetector.determineEmotion(intent, confidence);
  }

  private generateIntelligentContextualHints(
    conversationContext: any, 
    intelligentContext: ConversationContext
  ): string[] {
    const baseHints = ContextualHintGenerator.createContextualHints(conversationContext);
    const session = this.sessionManager.getCurrentSession();
    
    // Ajouter des indices basés sur l'intelligence émotionnelle
    if (this.currentEmotion && this.currentEmotion.confidence > 0.7) {
      baseHints.push(`🎭 Émotion détectée: ${this.currentEmotion.emotion}`);
    }

    // Ajouter des indices basés sur les tendances de style
    const styleTrends = this.styleAdapter.getStyleTrends();
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

  private adaptPredictedResponseIntelligently(
    predicted: EnhancedResponse, 
    context: any,
    adaptedStyle: any
  ): EnhancedResponse {
    // Adapter le contexte et les indices à la situation actuelle
    const updatedHints = this.generateIntelligentContextualHints(context, this.buildConversationContext(context));
    
    // Appliquer les adaptations de style
    const adaptedText = this.applyStyleAdaptations(predicted.text, adaptedStyle);
    
    return {
      ...predicted,
      text: adaptedText,
      tone: adaptedStyle.tone,
      contextualHints: updatedHints,
      // Conserver les autres propriétés prédites adaptées
    };
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

  public getEmotionHistory(): EmotionAnalysis[] {
    return [...this.emotionHistory];
  }

  public getCurrentEmotion(): EmotionAnalysis | null {
    return this.currentEmotion;
  }

  public getConversationInsights() {
    return {
      dominantEmotion: this.voiceEmotionDetector.getDominantEmotion(),
      emotionHistory: this.emotionHistory.slice(-10),
      styleAdaptations: this.styleAdapter.getStyleTrends(),
      proactiveSuggestions: this.suggestionGenerator.getSuggestionHistory().slice(-5)
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
