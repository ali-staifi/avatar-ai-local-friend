import { PERSONALITY_TRAITS, PersonalityTrait, PersonalityId } from '@/types/personality';
import { IntentRecognition, Intent } from './IntentRecognition';
import { DialogueManager, DialogueResponse } from './DialogueManager';
import { ResponseEnhancer, EnhancedResponse } from './ResponseEnhancer';

interface ConversationMemory {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: string;
    intent?: Intent;
    enhancedResponse?: EnhancedResponse;
  }>;
  userProfile: {
    name?: string;
    preferences: string[];
    interests: string[];
  };
  sessionStartTime: Date;
  lastInteraction: Date;
}

interface DiscussionState {
  isProcessing: boolean;
  canBeInterrupted: boolean;
  currentTask?: string;
  emotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
}

export class DiscussionEngine {
  private memory: ConversationMemory;
  private state: DiscussionState;
  private currentPersonality: PersonalityTrait;
  private interruptionCallback?: () => void;
  private stateChangeCallback?: (state: DiscussionState) => void;

  // Nouveaux services avancés
  private intentRecognition: IntentRecognition;
  private dialogueManager: DialogueManager;
  private responseEnhancer: ResponseEnhancer;

  constructor(personalityId: PersonalityId = 'friendly') {
    this.memory = {
      id: this.generateConversationId(),
      messages: [],
      userProfile: {
        preferences: [],
        interests: []
      },
      sessionStartTime: new Date(),
      lastInteraction: new Date()
    };

    this.state = {
      isProcessing: false,
      canBeInterrupted: true,
      emotionalState: 'neutral'
    };

    this.currentPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId) || PERSONALITY_TRAITS[0];
    
    // Initialiser les nouveaux services
    this.intentRecognition = new IntentRecognition();
    this.dialogueManager = new DialogueManager(this.currentPersonality);
    this.responseEnhancer = new ResponseEnhancer(this.currentPersonality);

    console.log('🚀 Moteur de discussion avancé initialisé avec les services Rasa-like');
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setInterruptionCallback(callback: () => void) {
    this.interruptionCallback = callback;
  }

  public setStateChangeCallback(callback: (state: DiscussionState) => void) {
    this.stateChangeCallback = callback;
  }

  private updateState(updates: Partial<DiscussionState>) {
    this.state = { ...this.state, ...updates };
    this.stateChangeCallback?.(this.state);
  }

  public setPersonality(personalityId: PersonalityId) {
    const newPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId);
    if (newPersonality) {
      this.currentPersonality = newPersonality;
      
      // Mettre à jour tous les services avec la nouvelle personnalité
      this.dialogueManager.updatePersonality(newPersonality);
      this.responseEnhancer.updatePersonality(newPersonality);
      
      console.log(`🎭 Personnalité changée vers: ${newPersonality.name} (services mis à jour)`);
    }
  }

  public getCurrentPersonality(): PersonalityTrait {
    return this.currentPersonality;
  }

  public async processUserInput(input: string): Promise<string> {
    console.log('📝 Processing user input with advanced dialogue system:', input);
    
    this.updateState({ 
      isProcessing: true, 
      canBeInterrupted: false,
      emotionalState: 'thinking',
      currentTask: 'processing_input'
    });

    try {
      // 1. Reconnaissance d'intention
      console.log('🎯 Phase 1: Reconnaissance d\'intention');
      const intent = this.intentRecognition.recognizeIntent(input);
      
      // 2. Gestion du dialogue contextuel
      console.log('💬 Phase 2: Gestion du dialogue contextuel');
      const dialogueResponse = this.dialogueManager.processDialogue(intent, input);
      
      // 3. Amélioration de la réponse
      console.log('✨ Phase 3: Amélioration de la réponse');
      const enhancedResponse = this.responseEnhancer.enhanceResponse(
        dialogueResponse, 
        this.dialogueManager.getDialogueState()
      );
      
      // 4. Ajouter à la mémoire avec les données enrichies
      this.addToMemory('user', input, dialogueResponse.contextualInfo, intent);
      this.addToMemory('assistant', enhancedResponse.text, dialogueResponse.contextualInfo, intent, enhancedResponse);
      
      // 5. Mettre à jour l'état émotionnel
      this.updateState({
        isProcessing: false,
        canBeInterrupted: true,
        emotionalState: enhancedResponse.emotion,
        currentTask: undefined
      });

      console.log('🎉 Traitement avancé terminé:', {
        intent: intent.name,
        confidence: intent.confidence,
        emotion: enhancedResponse.emotion,
        followUps: enhancedResponse.followUpQuestions.length
      });

      return enhancedResponse.text;
    } catch (error) {
      console.error('❌ Erreur dans le moteur de discussion avancé:', error);
      this.updateState({
        isProcessing: false,
        canBeInterrupted: true,
        emotionalState: 'neutral',
        currentTask: undefined
      });
      throw error;
    }
  }

  private addToMemory(
    role: 'user' | 'assistant', 
    content: string, 
    context?: string, 
    intent?: Intent,
    enhancedResponse?: EnhancedResponse
  ) {
    this.memory.messages.push({
      role,
      content,
      context,
      intent,
      enhancedResponse,
      timestamp: new Date()
    });
    
    this.memory.lastInteraction = new Date();
    
    // Limiter la mémoire à 50 messages pour éviter la surcharge
    if (this.memory.messages.length > 50) {
      this.memory.messages = this.memory.messages.slice(-50);
    }

    // Analyser les préférences utilisateur avec les nouvelles données
    if (role === 'user') {
      this.updateUserProfile(content, intent);
    }
  }

  private updateUserProfile(userInput: string, intent?: Intent) {
    const input = userInput.toLowerCase();
    
    // Utiliser les données d'intention pour améliorer le profil
    if (intent) {
      // Ajouter les entités détectées aux intérêts
      for (const entity of intent.entities) {
        if (entity.entity === 'topic' && !this.memory.userProfile.interests.includes(entity.value)) {
          this.memory.userProfile.interests.push(entity.value);
        }
      }
    }
    
    const interests = ['technologie', 'art', 'musique', 'sport', 'cinéma', 'lecture', 'voyage'];
    interests.forEach(interest => {
      if (input.includes(interest) && !this.memory.userProfile.interests.includes(interest)) {
        this.memory.userProfile.interests.push(interest);
      }
    });

    // Détecter les préférences de communication
    if (input.includes('détail') || input.includes('précis')) {
      if (!this.memory.userProfile.preferences.includes('detailed_responses')) {
        this.memory.userProfile.preferences.push('detailed_responses');
      }
    }
    
    if (input.includes('simple') || input.includes('bref')) {
      if (!this.memory.userProfile.preferences.includes('concise_responses')) {
        this.memory.userProfile.preferences.push('concise_responses');
      }
    }
  }

  public interrupt(): boolean {
    if (this.state.canBeInterrupted) {
      console.log('🔄 Interruption détectée et acceptée par le moteur avancé');
      this.updateState({
        isProcessing: false,
        emotionalState: 'listening',
        currentTask: undefined
      });
      this.interruptionCallback?.();
      return true;
    }
    
    console.log('⚠️ Interruption ignorée - traitement critique en cours');
    return false;
  }

  public getState(): DiscussionState {
    return { ...this.state };
  }

  public getMemoryStats() {
    const dialogueState = this.dialogueManager.getDialogueState();
    
    return {
      totalMessages: this.memory.messages.length,
      sessionDuration: Date.now() - this.memory.sessionStartTime.getTime(),
      userInterests: [...this.memory.userProfile.interests, ...dialogueState.userProfile.interests],
      userPreferences: this.memory.userProfile.preferences,
      lastInteraction: this.memory.lastInteraction,
      // Nouvelles statistiques avancées
      currentTopic: dialogueState.currentTopic,
      conversationFlow: dialogueState.conversationFlow,
      followUpCount: dialogueState.followUpCount,
      expertiseAreas: Array.from(dialogueState.userProfile.expertise.keys())
    };
  }

  public exportMemory() {
    return {
      conversationId: this.memory.id,
      messages: this.memory.messages,
      userProfile: this.memory.userProfile,
      stats: this.getMemoryStats(),
      // Nouvelles données d'export
      dialogueState: this.dialogueManager.getDialogueState(),
      personality: this.currentPersonality
    };
  }

  // Nouvelles méthodes pour accéder aux fonctionnalités avancées
  public getLastIntentInfo(): Intent | undefined {
    const lastMessage = this.memory.messages
      .filter(m => m.role === 'user')
      .pop();
    return lastMessage?.intent;
  }

  public getConversationInsights() {
    const dialogueState = this.dialogueManager.getDialogueState();
    const recentMessages = this.memory.messages.slice(-10);
    
    return {
      dominantIntents: this.calculateDominantIntents(recentMessages),
      topicProgression: dialogueState.conversationFlow,
      userEngagement: this.calculateEngagement(recentMessages),
      personalityAlignment: this.assessPersonalityAlignment()
    };
  }

  private calculateDominantIntents(messages: typeof this.memory.messages): Record<string, number> {
    const intentCounts: Record<string, number> = {};
    
    for (const message of messages) {
      if (message.intent) {
        intentCounts[message.intent.name] = (intentCounts[message.intent.name] || 0) + 1;
      }
    }
    
    return intentCounts;
  }

  private calculateEngagement(messages: typeof this.memory.messages): number {
    // Calculer l'engagement basé sur la longueur des messages et la fréquence
    const userMessages = messages.filter(m => m.role === 'user');
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length || 0;
    const timeSpread = userMessages.length > 1 ? 
      (userMessages[userMessages.length - 1].timestamp.getTime() - userMessages[0].timestamp.getTime()) / 1000 / 60 : 0;
    
    return Math.min((avgLength / 50) * 0.5 + (userMessages.length / timeSpread) * 0.5, 1);
  }

  private assessPersonalityAlignment(): number {
    // Évaluer à quel point les réponses correspondent à la personnalité
    const recentResponses = this.memory.messages
      .filter(m => m.role === 'assistant' && m.enhancedResponse)
      .slice(-5);
    
    if (recentResponses.length === 0) return 0.5;
    
    const alignmentScores = recentResponses.map(response => {
      const enhanced = response.enhancedResponse!;
      return enhanced.personalityMarkers.length > 0 ? 0.8 : 0.4;
    });
    
    return alignmentScores.reduce((sum, score) => sum + score, 0) / alignmentScores.length;
  }
}
