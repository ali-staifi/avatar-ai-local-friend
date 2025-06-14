import { PERSONALITY_TRAITS, PersonalityTrait, PersonalityId } from '@/types/personality';

interface ConversationMemory {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: string;
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
      console.log(`🎭 Personnalité changée vers: ${newPersonality.name}`);
    }
  }

  public getCurrentPersonality(): PersonalityTrait {
    return this.currentPersonality;
  }

  public async processUserInput(input: string): Promise<string> {
    console.log('📝 Processing user input:', input);
    
    // Ajouter le message utilisateur à la mémoire
    this.addToMemory('user', input);
    
    // Mettre à jour l'état
    this.updateState({ 
      isProcessing: true, 
      canBeInterrupted: false,
      emotionalState: 'thinking',
      currentTask: 'processing_input'
    });

    try {
      // Analyser le contexte et l'intention
      const context = this.analyzeContext(input);
      
      // Générer une réponse contextuelle
      const response = await this.generateContextualResponse(input, context);
      
      // Ajouter la réponse à la mémoire
      this.addToMemory('assistant', response, context);
      
      // Mettre à jour l'état
      this.updateState({
        isProcessing: false,
        canBeInterrupted: true,
        emotionalState: 'happy',
        currentTask: undefined
      });

      return response;
    } catch (error) {
      console.error('❌ Erreur lors du traitement:', error);
      this.updateState({
        isProcessing: false,
        canBeInterrupted: true,
        emotionalState: 'neutral',
        currentTask: undefined
      });
      throw error;
    }
  }

  private addToMemory(role: 'user' | 'assistant', content: string, context?: string) {
    this.memory.messages.push({
      role,
      content,
      context,
      timestamp: new Date()
    });
    
    this.memory.lastInteraction = new Date();
    
    // Limiter la mémoire à 50 messages pour éviter la surcharge
    if (this.memory.messages.length > 50) {
      this.memory.messages = this.memory.messages.slice(-50);
    }

    // Analyser les préférences utilisateur
    if (role === 'user') {
      this.updateUserProfile(content);
    }
  }

  private updateUserProfile(userInput: string) {
    const input = userInput.toLowerCase();
    
    // Détecter les intérêts
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

  private analyzeContext(input: string): string {
    const recentMessages = this.memory.messages.slice(-5);
    const hasRecentContext = recentMessages.length > 0;
    
    if (hasRecentContext) {
      const lastAssistantMessage = recentMessages
        .reverse()
        .find(msg => msg.role === 'assistant');
      
      if (lastAssistantMessage) {
        return `Contexte récent: ${lastAssistantMessage.content.substring(0, 100)}...`;
      }
    }
    
    return 'Nouvelle conversation';
  }

  private async generateContextualResponse(input: string, context: string): Promise<string> {
    // Simuler un délai de traitement réaliste
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const userPreferences = this.memory.userProfile.preferences;
    const userInterests = this.memory.userProfile.interests;
    const conversationHistory = this.memory.messages.slice(-3);
    
    // Générer une réponse basée sur la personnalité
    const personalityResponse = this.generatePersonalityBasedResponse(input, conversationHistory);
    
    return personalityResponse;
  }

  private generatePersonalityBasedResponse(input: string, history: typeof this.memory.messages): string {
    const inputLower = input.toLowerCase();
    const personality = this.currentPersonality;
    
    // Utiliser les patterns de langage de la personnalité
    const speechPattern = personality.speechPattern[Math.floor(Math.random() * personality.speechPattern.length)];
    
    // Générer une réponse contextuelle selon la personnalité
    let baseResponse = '';
    
    // Réponses spécifiques selon le type de personnalité
    switch (personality.responseStyle) {
      case 'warm':
        baseResponse = this.generateWarmResponse(input, speechPattern);
        break;
      case 'analytical':
        baseResponse = this.generateAnalyticalResponse(input, speechPattern);
        break;
      case 'creative':
        baseResponse = this.generateCreativeResponse(input, speechPattern);
        break;
      case 'supportive':
        baseResponse = this.generateSupportiveResponse(input, speechPattern);
        break;
      case 'enthusiastic':
        baseResponse = this.generateEnthusiasticResponse(input, speechPattern);
        break;
      case 'peaceful':
        baseResponse = this.generatePeacefulResponse(input, speechPattern);
        break;
      default:
        baseResponse = `${speechPattern} Voici ma perspective sur votre question.`;
    }
    
    // Ajouter un contexte basé sur les intérêts de la personnalité
    const relatedInterest = personality.interests.find(interest => 
      inputLower.includes(interest.toLowerCase())
    );
    
    if (relatedInterest) {
      baseResponse += ` D'ailleurs, je trouve le domaine de ${relatedInterest} particulièrement fascinant !`;
    }
    
    return baseResponse;
  }

  private generateWarmResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Je sens que c'est important pour vous, et j'aimerais vraiment vous aider à explorer cette question ensemble.`;
  }

  private generateAnalyticalResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Pour bien comprendre votre question, laissez-moi la décomposer et examiner les différents aspects impliqués.`;
  }

  private generateCreativeResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Votre question m'inspire plusieurs approches innovantes que nous pourrions explorer !`;
  }

  private generateSupportiveResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Votre question montre une réelle réflexion, et je veux m'assurer de vous donner une réponse qui vous sera vraiment utile.`;
  }

  private generateEnthusiasticResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Votre question ouvre tellement de possibilités excitantes à explorer ! Plongeons-nous dedans !`;
  }

  private generatePeacefulResponse(input: string, speechPattern: string): string {
    return `${speechPattern} Votre question mérite une réponse réfléchie et équilibrée. Permettez-moi de partager ma vision sereine sur ce sujet.`;
  }

  public interrupt(): boolean {
    if (this.state.canBeInterrupted) {
      console.log('🔄 Interruption détectée et acceptée');
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
    return {
      totalMessages: this.memory.messages.length,
      sessionDuration: Date.now() - this.memory.sessionStartTime.getTime(),
      userInterests: this.memory.userProfile.interests,
      userPreferences: this.memory.userProfile.preferences,
      lastInteraction: this.memory.lastInteraction
    };
  }

  public exportMemory() {
    return {
      conversationId: this.memory.id,
      messages: this.memory.messages,
      userProfile: this.memory.userProfile,
      stats: this.getMemoryStats()
    };
  }
}
