
export interface UserSession {
  sessionId: string;
  userId?: string;
  preferences: {
    preferredPersonality: string;
    preferredLanguage: string;
    speechEnabled: boolean;
    responseStyle: 'detailed' | 'concise' | 'balanced';
    interests: string[];
    expertiseAreas: Map<string, number>;
  };
  conversationHistory: {
    totalConversations: number;
    averageSessionDuration: number;
    commonTopics: string[];
    personalityUsage: Map<string, number>;
  };
  lastSession: {
    timestamp: Date;
    duration: number;
    messageCount: number;
    dominantEmotion: string;
  };
  created: Date;
  lastUpdated: Date;
}

export class UserSessionManager {
  private currentSession: UserSession | null = null;
  private readonly STORAGE_KEY = 'ai_avatar_user_session';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures

  constructor() {
    this.loadOrCreateSession();
  }

  public getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  public updatePreferences(preferences: Partial<UserSession['preferences']>): void {
    if (!this.currentSession) return;

    this.currentSession.preferences = {
      ...this.currentSession.preferences,
      ...preferences
    };

    this.currentSession.lastUpdated = new Date();
    this.saveSession();
    
    console.log('💾 Préférences utilisateur mises à jour:', preferences);
  }

  public recordConversationMetrics(metrics: {
    duration: number;
    messageCount: number;
    dominantEmotion: string;
    topics: string[];
    personalityUsed: string;
  }): void {
    if (!this.currentSession) return;

    // Mettre à jour l'historique conversationnel
    this.currentSession.conversationHistory.totalConversations++;
    
    const avgDuration = this.currentSession.conversationHistory.averageSessionDuration;
    const totalConv = this.currentSession.conversationHistory.totalConversations;
    this.currentSession.conversationHistory.averageSessionDuration = 
      (avgDuration * (totalConv - 1) + metrics.duration) / totalConv;

    // Mettre à jour les sujets communs
    metrics.topics.forEach(topic => {
      if (!this.currentSession!.conversationHistory.commonTopics.includes(topic)) {
        this.currentSession!.conversationHistory.commonTopics.push(topic);
      }
    });

    // Enregistrer l'usage de personnalité
    const currentUsage = this.currentSession.conversationHistory.personalityUsage.get(metrics.personalityUsed) || 0;
    this.currentSession.conversationHistory.personalityUsage.set(metrics.personalityUsed, currentUsage + 1);

    // Mettre à jour la dernière session
    this.currentSession.lastSession = {
      timestamp: new Date(),
      duration: metrics.duration,
      messageCount: metrics.messageCount,
      dominantEmotion: metrics.dominantEmotion
    };

    this.currentSession.lastUpdated = new Date();
    this.saveSession();

    console.log('📊 Métriques conversationnelles enregistrées:', metrics);
  }

  public updateUserInterests(newInterests: string[]): void {
    if (!this.currentSession) return;

    const currentInterests = this.currentSession.preferences.interests;
    const updatedInterests = [...new Set([...currentInterests, ...newInterests])];
    
    // Limiter à 20 intérêts max
    if (updatedInterests.length > 20) {
      this.currentSession.preferences.interests = updatedInterests.slice(-20);
    } else {
      this.currentSession.preferences.interests = updatedInterests;
    }

    this.currentSession.lastUpdated = new Date();
    this.saveSession();
    
    console.log('🎯 Intérêts utilisateur mis à jour:', this.currentSession.preferences.interests);
  }

  public updateExpertiseLevel(topic: string, level: number): void {
    if (!this.currentSession) return;

    this.currentSession.preferences.expertiseAreas.set(topic, Math.max(0, Math.min(1, level)));
    this.currentSession.lastUpdated = new Date();
    this.saveSession();
    
    console.log(`📚 Niveau d'expertise mis à jour: ${topic} -> ${level}`);
  }

  public getPersonalizedRecommendations(): {
    suggestedPersonality: string;
    suggestedTopics: string[];
    adaptedResponseStyle: string;
  } {
    if (!this.currentSession) {
      return {
        suggestedPersonality: 'friendly',
        suggestedTopics: [],
        adaptedResponseStyle: 'balanced'
      };
    }

    // Personnalité la plus utilisée
    let mostUsedPersonality = 'friendly';
    let maxUsage = 0;
    this.currentSession.conversationHistory.personalityUsage.forEach((usage, personality) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedPersonality = personality;
      }
    });

    // Sujets basés sur les intérêts
    const suggestedTopics = this.currentSession.preferences.interests.slice(0, 3);

    return {
      suggestedPersonality: mostUsedPersonality,
      suggestedTopics,
      adaptedResponseStyle: this.currentSession.preferences.responseStyle
    };
  }

  public exportSessionData(): any {
    return {
      session: this.currentSession,
      exportTimestamp: new Date(),
      version: '1.0'
    };
  }

  public resetSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentSession = this.createNewSession();
    this.saveSession();
    
    console.log('🔄 Session utilisateur réinitialisée');
  }

  private loadOrCreateSession(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Vérifier si la session n'est pas expirée
        const lastUpdated = new Date(parsed.lastUpdated);
        const now = new Date();
        
        if (now.getTime() - lastUpdated.getTime() < this.SESSION_TIMEOUT) {
          this.currentSession = this.deserializeSession(parsed);
          console.log('📂 Session utilisateur chargée depuis le stockage');
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement session:', error);
    }

    // Créer une nouvelle session
    this.currentSession = this.createNewSession();
    this.saveSession();
    console.log('🆕 Nouvelle session utilisateur créée');
  }

  private createNewSession(): UserSession {
    return {
      sessionId: this.generateSessionId(),
      preferences: {
        preferredPersonality: 'friendly',
        preferredLanguage: 'fr',
        speechEnabled: true,
        responseStyle: 'balanced',
        interests: [],
        expertiseAreas: new Map()
      },
      conversationHistory: {
        totalConversations: 0,
        averageSessionDuration: 0,
        commonTopics: [],
        personalityUsage: new Map()
      },
      lastSession: {
        timestamp: new Date(),
        duration: 0,
        messageCount: 0,
        dominantEmotion: 'neutral'
      },
      created: new Date(),
      lastUpdated: new Date()
    };
  }

  private deserializeSession(data: any): UserSession {
    return {
      ...data,
      preferences: {
        ...data.preferences,
        expertiseAreas: new Map(data.preferences.expertiseAreas || [])
      },
      conversationHistory: {
        ...data.conversationHistory,
        personalityUsage: new Map(data.conversationHistory.personalityUsage || [])
      },
      created: new Date(data.created),
      lastUpdated: new Date(data.lastUpdated),
      lastSession: {
        ...data.lastSession,
        timestamp: new Date(data.lastSession.timestamp)
      }
    };
  }

  private saveSession(): void {
    if (!this.currentSession) return;

    try {
      const serializable = {
        ...this.currentSession,
        preferences: {
          ...this.currentSession.preferences,
          expertiseAreas: Array.from(this.currentSession.preferences.expertiseAreas.entries())
        },
        conversationHistory: {
          ...this.currentSession.conversationHistory,
          personalityUsage: Array.from(this.currentSession.conversationHistory.personalityUsage.entries())
        }
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
