
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
  private interruptionCallback?: () => void;
  private stateChangeCallback?: (state: DiscussionState) => void;

  constructor() {
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
    
    // Réponses contextuelles basées sur l'historique
    const responses = this.getContextualResponses(input, conversationHistory, userInterests, userPreferences);
    
    // Sélectionner une réponse appropriée
    return this.selectBestResponse(responses, input);
  }

  private getContextualResponses(
    input: string, 
    history: typeof this.memory.messages,
    interests: string[],
    preferences: string[]
  ): string[] {
    const responses: string[] = [];
    const inputLower = input.toLowerCase();

    // Réponses basées sur l'historique
    if (history.length > 0) {
      const lastTopic = history[history.length - 1]?.content;
      if (lastTopic) {
        responses.push(`En lien avec notre discussion précédente sur "${lastTopic.substring(0, 50)}...", je dirais que ${this.generateFollowUp(input)}`);
      }
    }

    // Réponses basées sur les intérêts
    const matchedInterest = interests.find(interest => inputLower.includes(interest));
    if (matchedInterest) {
      responses.push(`Je vois que vous vous intéressez à ${matchedInterest}. ${this.generateInterestBasedResponse(input, matchedInterest)}`);
    }

    // Réponses génériques améliorées
    responses.push(this.generateAdvancedResponse(input));

    return responses;
  }

  private generateFollowUp(input: string): string {
    const followUps = [
      "voici une perspective complémentaire intéressante.",
      "cela ouvre de nouvelles possibilités à explorer.",
      "c'est effectivement un point important à considérer.",
      "voici comment on peut approfondir cette idée."
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  private generateInterestBasedResponse(input: string, interest: string): string {
    const interestResponses: Record<string, string[]> = {
      'technologie': [
        "L'évolution technologique dans ce domaine est fascinante.",
        "C'est un secteur qui évolue très rapidement ces dernières années.",
        "Les innovations récentes dans ce domaine sont impressionnantes."
      ],
      'art': [
        "L'art est un moyen d'expression unique et personnel.",
        "Chaque forme d'art apporte sa propre richesse culturelle.",
        "L'interprétation artistique est toujours subjective et enrichissante."
      ]
    };

    const responses = interestResponses[interest] || ["C'est un sujet passionnant !"];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateAdvancedResponse(input: string): string {
    const advancedResponses = [
      "Basé sur mon analyse, voici une approche structurée pour aborder cette question :",
      "En considérant différents angles d'approche, je pense que :",
      "D'après les meilleures pratiques dans ce domaine, voici ce que je recommande :",
      "En synthétisant les informations disponibles, voici ma perspective :"
    ];

    const contextualInfo = [
      "Cette approche s'est révélée efficace dans des situations similaires.",
      "Les retours d'expérience montrent que cette méthode donne de bons résultats.",
      "Cette stratégie permet généralement d'obtenir des résultats satisfaisants.",
      "Cette approche équilibrée prend en compte les différents aspects du problème."
    ];

    const intro = advancedResponses[Math.floor(Math.random() * advancedResponses.length)];
    const context = contextualInfo[Math.floor(Math.random() * contextualInfo.length)];

    return `${intro} ${context}`;
  }

  private selectBestResponse(responses: string[], input: string): string {
    // Pour cette version, on prend la première réponse contextuelle
    // Dans une version plus avancée, on pourrait utiliser un scoring plus sophistiqué
    return responses[0] || "Je comprends votre question et voici ma réflexion sur le sujet.";
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
