import { Intent, Entity } from './IntentRecognition';
import { PersonalityTrait, PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';

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

export interface DialogueResponse {
  text: string;
  intent: string;
  confidence: number;
  followUpSuggestions: string[];
  contextualInfo?: string;
}

export class DialogueManager {
  private state: DialogueState;
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;

  constructor(personality: PersonalityTrait, gender: Gender = 'male') {
    this.currentPersonality = personality;
    this.currentGender = gender;
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

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    console.log(`🎭 Gestionnaire de dialogue mis à jour avec la personnalité: ${personality.name}`);
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
    console.log(`👤 Genre du gestionnaire de dialogue mis à jour: ${gender}`);
  }

  public processDialogue(intent: Intent, userInput: string): DialogueResponse {
    // Mettre à jour l'état du dialogue
    this.updateDialogueState(intent, userInput);
    
    // Générer une réponse contextuelle avec le genre
    const response = this.generateContextualResponse(intent, userInput);
    
    // Générer des suggestions de suivi
    const followUpSuggestions = this.generateFollowUpSuggestions(response);
    
    console.log(`💬 Réponse du gestionnaire de dialogue (${this.currentGender}):`, {
      intent: intent.name,
      confidence: intent.confidence,
      followUps: followUpSuggestions.length
    });
    
    return {
      text: response,
      intent: intent.name,
      confidence: intent.confidence,
      followUpSuggestions,
      contextualInfo: this.getContextualInfo()
    };
  }

  private updateDialogueState(intent: Intent, userInput: string): void {
    // Mettre à jour le flux de conversation
    this.state.conversationFlow.push(intent.name);
    if (this.state.conversationFlow.length > 10) {
      this.state.conversationFlow = this.state.conversationFlow.slice(-10);
    }

    // Mettre à jour l'intention précédente
    this.state.lastIntent = intent;

    // Extraire et mettre à jour le contexte
    this.extractContext(intent, userInput);

    // Mettre à jour le profil utilisateur
    this.updateUserProfile(intent, userInput);

    // Gérer le suivi des questions
    if (intent.name === 'question' || intent.name === 'explanation_request') {
      this.state.followUpCount++;
    } else {
      this.state.followUpCount = 0;
    }
  }

  private extractContext(intent: Intent, userInput: string): void {
    // Extraire le sujet principal
    for (const entity of intent.entities) {
      if (entity.entity === 'topic') {
        this.state.currentTopic = entity.value;
        this.state.context.set('current_topic', entity.value);
      }
    }

    // Détection de sujets par mots-clés
    const topics = ['technologie', 'art', 'science', 'philosophie', 'sport', 'musique', 'cinéma'];
    for (const topic of topics) {
      if (userInput.toLowerCase().includes(topic)) {
        this.state.currentTopic = topic;
        this.state.context.set('current_topic', topic);
        break;
      }
    }

    // Maintenir l'historique du contexte
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

  private updateUserProfile(intent: Intent, userInput: string): void {
    // Détecter les intérêts
    const interestKeywords = ['j\'aime', 'je préfère', 'passionné', 'intéressé', 'adore'];
    for (const keyword of interestKeywords) {
      if (userInput.toLowerCase().includes(keyword)) {
        const afterKeyword = userInput.toLowerCase().substring(
          userInput.toLowerCase().indexOf(keyword) + keyword.length
        ).trim();
        const interest = afterKeyword.split(' ')[0];
        if (interest && !this.state.userProfile.interests.includes(interest)) {
          this.state.userProfile.interests.push(interest);
        }
      }
    }

    // Évaluer le niveau d'expertise
    if (this.state.currentTopic) {
      const currentLevel = this.state.userProfile.expertise.get(this.state.currentTopic) || 0;
      let newLevel = currentLevel;

      if (intent.name === 'explanation_request') {
        newLevel = Math.max(currentLevel - 0.1, 0); // Demande d'explication = moins d'expertise
      } else if (intent.name === 'opinion_request') {
        newLevel = Math.min(currentLevel + 0.1, 1); // Demande d'opinion = plus d'expertise
      }

      this.state.userProfile.expertise.set(this.state.currentTopic, newLevel);
    }
  }

  private generateContextualResponse(intent: Intent, userInput: string): string {
    const personality = this.currentPersonality;
    const basePattern = personality.speechPattern[
      Math.floor(Math.random() * personality.speechPattern.length)
    ];

    // Adapter les réponses selon le genre
    const genderAwareResponse = this.adaptResponseForGender(basePattern);

    switch (intent.name) {
      case 'greeting':
        return this.generateGreetingResponse(genderAwareResponse);
      
      case 'question':
        return this.generateQuestionResponse(genderAwareResponse, userInput);
      
      case 'explanation_request':
        return this.generateExplanationResponse(genderAwareResponse, userInput);
      
      case 'opinion_request':
        return this.generateOpinionResponse(genderAwareResponse, userInput);
      
      case 'help_request':
        return this.generateHelpResponse(genderAwareResponse, userInput);
      
      case 'personal_info':
        return this.generatePersonalInfoResponse(genderAwareResponse);
      
      case 'capability_inquiry':
        return this.generateCapabilityResponse(genderAwareResponse);
      
      case 'goodbye':
        return this.generateGoodbyeResponse(genderAwareResponse);
      
      default:
        return this.generateDefaultResponse(genderAwareResponse, userInput);
    }
  }

  private adaptResponseForGender(basePattern: string): string {
    // Adapter les formulations selon le genre
    if (this.currentGender === 'female') {
      return basePattern.replace(/je suis/gi, 'je suis')
        .replace(/ravi/gi, 'ravie')
        .replace(/heureux/gi, 'heureuse')
        .replace(/content/gi, 'contente');
    }
    return basePattern;
  }

  private generateGreetingResponse(basePattern: string): string {
    const greetings = [
      `${basePattern} Je suis ravi de vous rencontrer !`,
      `${basePattern} Comment allez-vous aujourd'hui ?`,
      `${basePattern} Que puis-je faire pour vous aider ?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private generateQuestionResponse(basePattern: string, userInput: string): string {
    const topic = this.state.currentTopic;
    const expertise = topic ? this.state.userProfile.expertise.get(topic) || 0.5 : 0.5;
    
    if (expertise < 0.3) {
      return `${basePattern} Je vais vous expliquer cela de manière simple et claire. ${topic ? `Concernant ${topic}, ` : ''}voici ce que je peux vous dire...`;
    } else {
      return `${basePattern} C'est une excellente question ! ${topic ? `Sur le sujet de ${topic}, ` : ''}permettez-moi de vous donner une réponse détaillée...`;
    }
  }

  private generateExplanationResponse(basePattern: string, userInput: string): string {
    return `${basePattern} Je vais vous donner une explication complète. ${this.state.currentTopic ? `Pour bien comprendre ${this.state.currentTopic}, ` : ''}commençons par les bases...`;
  }

  private generateOpinionResponse(basePattern: string, userInput: string): string {
    const personality = this.currentPersonality;
    if (personality.emotionalTendency === 'analytical') {
      return `${basePattern} D'un point de vue analytique, je pense que... Mais j'aimerais connaître votre perspective aussi.`;
    } else if (personality.emotionalTendency === 'empathetic') {
      return `${basePattern} C'est un sujet qui me tient à cœur. Je ressens que...`;
    } else {
      return `${basePattern} Voici mon opinion sur cette question...`;
    }
  }

  private generateHelpResponse(basePattern: string, userInput: string): string {
    return `${basePattern} Je suis là pour vous aider ! Pouvez-vous me donner plus de détails sur ce dont vous avez besoin ?`;
  }

  private generatePersonalInfoResponse(basePattern: string): string {
    const personality = this.currentPersonality;
    return `${basePattern} Je suis votre assistant avatar avec une personnalité ${personality.name.toLowerCase()}. ${personality.description}`;
  }

  private generateCapabilityResponse(basePattern: string): string {
    return `${basePattern} Je peux vous aider de nombreuses façons : répondre à vos questions, avoir des conversations naturelles, m'adapter à différentes personnalités, et bien plus encore !`;
  }

  private generateGoodbyeResponse(basePattern: string): string {
    const goodbyes = [
      `${basePattern} Au revoir ! J'ai adoré notre conversation.`,
      `${basePattern} À bientôt ! N'hésitez pas à revenir quand vous voulez.`,
      `${basePattern} Bonne journée ! J'espère vous revoir bientôt.`
    ];
    return goodbyes[Math.floor(Math.random() * goodbyes.length)];
  }

  private generateDefaultResponse(basePattern: string, userInput: string): string {
    return `${basePattern} C'est intéressant ce que vous dites. Pouvez-vous m'en dire plus ?`;
  }

  private generateFollowUpSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    const lastIntent = this.state.lastIntent?.name;
    const topic = this.state.currentTopic;

    switch (lastIntent) {
      case 'question':
        suggestions.push('Pouvez-vous me donner plus de détails ?');
        suggestions.push('Y a-t-il autre chose que vous aimeriez savoir ?');
        if (topic) {
          suggestions.push(`Voulez-vous explorer d'autres aspects de ${topic} ?`);
        }
        break;

      case 'explanation_request':
        suggestions.push('Cette explication vous semble-t-elle claire ?');
        suggestions.push('Avez-vous des questions sur ce point ?');
        suggestions.push('Voulez-vous un exemple concret ?');
        break;

      case 'opinion_request':
        suggestions.push('Quelle est votre opinion sur ce sujet ?');
        suggestions.push('Êtes-vous d\'accord avec cette perspective ?');
        suggestions.push('Avez-vous une expérience personnelle à partager ?');
        break;

      case 'greeting':
        suggestions.push('De quoi aimeriez-vous parler aujourd\'hui ?');
        suggestions.push('Y a-t-il quelque chose en particulier qui vous intéresse ?');
        break;

      default:
        suggestions.push('Que pensez-vous de ce sujet ?');
        suggestions.push('Avez-vous d\'autres questions ?');
        break;
    }

    return suggestions.slice(0, 3); // Limiter à 3 suggestions
  }

  private getContextualInfo(): string {
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

  public getDialogueState(): DialogueState {
    return { ...this.state };
  }

  public resetDialogue(): void {
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
    console.log('🔄 État du dialogue réinitialisé');
  }
}
