
import { ConversationMemory } from '@/types/discussionEngine';
import { Intent } from './IntentRecognition';
import { EnhancedResponse } from './ResponseEnhancer';

export class ConversationMemoryManager {
  private memory: ConversationMemory;

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
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public addMessage(
    role: 'user' | 'assistant', 
    content: string, 
    context?: string, 
    intent?: Intent,
    enhancedResponse?: EnhancedResponse
  ): void {
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

  private updateUserProfile(userInput: string, intent?: Intent): void {
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

  public getMemory(): ConversationMemory {
    return { ...this.memory };
  }

  public getMessages(): ConversationMemory['messages'] {
    return [...this.memory.messages];
  }

  public getUserProfile(): ConversationMemory['userProfile'] {
    return { ...this.memory.userProfile };
  }

  public getSessionStats() {
    return {
      totalMessages: this.memory.messages.length,
      sessionDuration: Date.now() - this.memory.sessionStartTime.getTime(),
      lastInteraction: this.memory.lastInteraction
    };
  }

  public exportMemory() {
    return {
      conversationId: this.memory.id,
      messages: this.memory.messages,
      userProfile: this.memory.userProfile
    };
  }
}
