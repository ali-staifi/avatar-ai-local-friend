
import { Intent, Entity } from './IntentRecognition';

export interface DialogueState {
  currentTopic?: string;
  context: Map<string, any>;
  conversationFlow: string[];
  lastIntent?: Intent;
  followUpCount: number;
  userProfile: {
    interests: string[];
    preferredStyle: string;
    expertise: Map<string, number>;
  };
}

export class DialogueStateService {
  private state: DialogueState;

  constructor() {
    this.state = {
      context: new Map(),
      conversationFlow: [],
      followUpCount: 0,
      userProfile: {
        interests: [],
        preferredStyle: 'balanced',
        expertise: new Map()
      }
    };
  }

  public getState(): DialogueState {
    return { ...this.state };
  }

  public updateDialogueState(intent: Intent, userInput: string): void {
    // Update conversation flow
    this.state.conversationFlow.push(intent.name);
    if (this.state.conversationFlow.length > 10) {
      this.state.conversationFlow = this.state.conversationFlow.slice(-10);
    }

    // Update last intent
    this.state.lastIntent = intent;

    // Extract and update context
    this.extractContext(intent, userInput);

    // Handle follow-up count
    if (intent.name === 'question' || intent.name === 'explanation_request') {
      this.state.followUpCount++;
    } else {
      this.state.followUpCount = 0;
    }
  }

  private extractContext(intent: Intent, userInput: string): void {
    // Extract main topic from entities
    for (const entity of intent.entities) {
      if (entity.entity === 'topic') {
        this.state.currentTopic = entity.value;
        this.state.context.set('current_topic', entity.value);
      }
    }

    // Topic detection by keywords
    const topics = ['technologie', 'art', 'science', 'philosophie', 'sport', 'musique', 'cinéma'];
    for (const topic of topics) {
      if (userInput.toLowerCase().includes(topic)) {
        this.state.currentTopic = topic;
        this.state.context.set('current_topic', topic);
        break;
      }
    }

    // Maintain context history
    const contextHistory = this.state.context.get('history') || [];
    if (this.state.currentTopic) {
      contextHistory.push({
        topic: this.state.currentTopic,
        timestamp: new Date(),
        intent: intent.name
      });
      this.state.context.set('history', contextHistory.slice(-5));
    }
  }

  public getCurrentTopic(): string | undefined {
    return this.state.currentTopic;
  }

  public getLastIntent(): Intent | undefined {
    return this.state.lastIntent;
  }

  public getFollowUpCount(): number {
    return this.state.followUpCount;
  }

  public getConversationFlow(): string[] {
    return [...this.state.conversationFlow];
  }

  public getContextualInfo(): string {
    const parts: string[] = [];
    
    if (this.state.currentTopic) {
      parts.push(`Sujet actuel: ${this.state.currentTopic}`);
    }
    
    if (this.state.userProfile.interests.length > 0) {
      parts.push(`Intérêts détectés: ${this.state.userProfile.interests.slice(0, 3).join(', ')}`);
    }
    
    if (this.state.followUpCount > 2) {
      parts.push('Conversation approfondie en cours');
    }
    
    return parts.join(' | ');
  }

  public reset(): void {
    this.state = {
      context: new Map(),
      conversationFlow: [],
      followUpCount: 0,
      userProfile: {
        interests: [],
        preferredStyle: 'balanced',
        expertise: new Map()
      }
    };
  }
}
