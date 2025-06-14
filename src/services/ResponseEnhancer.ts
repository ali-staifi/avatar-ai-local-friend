
import { DialogueResponse } from './DialogueManager';
import { PersonalityTrait } from '@/types/personality';

export interface EnhancedResponse {
  text: string;
  emotion: 'neutral' | 'happy' | 'thinking' | 'listening';
  tone: string;
  followUpQuestions: string[];
  contextualHints: string[];
  personalityMarkers: string[];
}

export class ResponseEnhancer {
  private currentPersonality: PersonalityTrait;

  constructor(personality: PersonalityTrait) {
    this.currentPersonality = personality;
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
  }

  public enhanceResponse(dialogueResponse: DialogueResponse, conversationContext: any): EnhancedResponse {
    const baseText = dialogueResponse.text;
    
    // Enrichir le texte avec la personnalité
    const enhancedText = this.enrichWithPersonality(baseText, dialogueResponse.intent);
    
    // Déterminer l'émotion appropriée
    const emotion = this.determineEmotion(dialogueResponse.intent, dialogueResponse.confidence);
    
    // Générer des questions de suivi intelligentes
    const followUpQuestions = this.generateIntelligentFollowUps(
      dialogueResponse.intent, 
      conversationContext
    );
    
    // Créer des indices contextuels
    const contextualHints = this.createContextualHints(conversationContext);
    
    // Identifier les marqueurs de personnalité
    const personalityMarkers = this.extractPersonalityMarkers();

    return {
      text: enhancedText,
      emotion,
      tone: this.currentPersonality.responseStyle,
      followUpQuestions,
      contextualHints,
      personalityMarkers
    };
  }

  private enrichWithPersonality(text: string, intent: string): string {
    const personality = this.currentPersonality;
    
    // Ajouter des expressions caractéristiques
    let enrichedText = text;
    
    // Ajouter des expressions émotionnelles
    switch (personality.emotionalTendency) {
      case 'optimistic':
        enrichedText = this.addOptimisticMarkers(enrichedText, intent);
        break;
      case 'analytical':
        enrichedText = this.addAnalyticalMarkers(enrichedText, intent);
        break;
      case 'empathetic':
        enrichedText = this.addEmphaticMarkers(enrichedText, intent);
        break;
      case 'energetic':
        enrichedText = this.addEnergeticMarkers(enrichedText, intent);
        break;
      case 'calm':
        enrichedText = this.addCalmMarkers(enrichedText, intent);
        break;
    }

    // Ajouter des références aux intérêts de la personnalité
    if (Math.random() < 0.3) { // 30% de chance d'ajouter une référence
      const randomInterest = personality.interests[
        Math.floor(Math.random() * personality.interests.length)
      ];
      enrichedText += ` D'ailleurs, cela me rappelle mon intérêt pour ${randomInterest}.`;
    }

    return enrichedText;
  }

  private addOptimisticMarkers(text: string, intent: string): string {
    const optimisticPhrases = [
      ' C\'est formidable !',
      ' Quelle belle opportunité !',
      ' Je suis sûr que tout ira bien !',
      ' C\'est passionnant !'
    ];
    
    if (intent === 'question' || intent === 'help_request') {
      return text + optimisticPhrases[Math.floor(Math.random() * optimisticPhrases.length)];
    }
    
    return text;
  }

  private addAnalyticalMarkers(text: string, intent: string): string {
    const analyticalPhrases = [
      ' Examinons cela de plus près.',
      ' Il faut considérer plusieurs facteurs.',
      ' Analysons les implications.',
      ' D\'un point de vue logique...'
    ];
    
    if (intent === 'explanation_request' || intent === 'question') {
      return text + ' ' + analyticalPhrases[Math.floor(Math.random() * analyticalPhrases.length)];
    }
    
    return text;
  }

  private addEmphaticMarkers(text: string, intent: string): string {
    const emphaticPhrases = [
      ' Je comprends vos sentiments.',
      ' C\'est tout à fait naturel de se sentir ainsi.',
      ' Vos préoccupations sont légitimes.',
      ' Je suis là pour vous soutenir.'
    ];
    
    if (intent === 'help_request' || intent === 'opinion_request') {
      return text + ' ' + emphaticPhrases[Math.floor(Math.random() * emphaticPhrases.length)];
    }
    
    return text;
  }

  private addEnergeticMarkers(text: string, intent: string): string {
    const energeticPhrases = [
      ' Allons-y avec enthousiasme !',
      ' C\'est le moment d\'agir !',
      ' Quelle énergie positive !',
      ' Fonçons dans cette aventure !'
    ];
    
    if (intent !== 'goodbye') {
      return text + ' ' + energeticPhrases[Math.floor(Math.random() * energeticPhrases.length)];
    }
    
    return text;
  }

  private addCalmMarkers(text: string, intent: string): string {
    const calmPhrases = [
      ' Prenons le temps de bien réfléchir.',
      ' Dans la sérénité, tout devient plus clair.',
      ' Respirons et avançons posément.',
      ' L\'équilibre est la clé.'
    ];
    
    return text + ' ' + calmPhrases[Math.floor(Math.random() * calmPhrases.length)];
  }

  private determineEmotion(intent: string, confidence: number): 'neutral' | 'happy' | 'thinking' | 'listening' {
    if (confidence < 0.5) {
      return 'thinking';
    }

    switch (intent) {
      case 'greeting':
      case 'opinion_request':
        return 'happy';
      case 'question':
      case 'explanation_request':
        return 'thinking';
      case 'help_request':
        return 'listening';
      default:
        return 'neutral';
    }
  }

  private generateIntelligentFollowUps(intent: string, context: any): string[] {
    const followUps: string[] = [];
    const personality = this.currentPersonality;

    // Questions basées sur l'intention
    switch (intent) {
      case 'question':
        followUps.push('Souhaitez-vous que j\'approfondisse un aspect particulier ?');
        followUps.push('Y a-t-il des exemples concrets qui vous intéresseraient ?');
        if (personality.emotionalTendency === 'analytical') {
          followUps.push('Voulez-vous analyser les implications de cette réponse ?');
        }
        break;

      case 'explanation_request':
        followUps.push('Cette explication répond-elle à vos attentes ?');
        followUps.push('Avez-vous besoin de clarifications sur certains points ?');
        if (personality.emotionalTendency === 'empathetic') {
          followUps.push('Comment vous sentez-vous par rapport à cette explication ?');
        }
        break;

      case 'opinion_request':
        followUps.push('Partagez-vous cette perspective ?');
        followUps.push('Quelle est votre expérience personnelle sur ce sujet ?');
        followUps.push('Y a-t-il d\'autres angles à considérer ?');
        break;

      case 'help_request':
        followUps.push('Avez-vous besoin d\'aide sur d\'autres aspects ?');
        followUps.push('Cette solution vous semble-t-elle réalisable ?');
        if (personality.emotionalTendency === 'energetic') {
          followUps.push('Êtes-vous prêt à passer à l\'action ?');
        }
        break;
    }

    // Ajouter des questions basées sur les intérêts de la personnalité
    if (context.currentTopic) {
      const relatedInterest = personality.interests.find(interest => 
        context.currentTopic.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (relatedInterest) {
        followUps.push(`Aimeriez-vous explorer le lien avec ${relatedInterest} ?`);
      }
    }

    return followUps.slice(0, 3);
  }

  private createContextualHints(context: any): string[] {
    const hints: string[] = [];
    
    if (context.currentTopic) {
      hints.push(`💡 Sujet en cours: ${context.currentTopic}`);
    }
    
    if (context.userProfile?.interests?.length > 0) {
      hints.push(`🎯 Intérêts: ${context.userProfile.interests.slice(0, 2).join(', ')}`);
    }
    
    if (context.followUpCount > 3) {
      hints.push('🔄 Conversation approfondie');
    }
    
    return hints;
  }

  private extractPersonalityMarkers(): string[] {
    const personality = this.currentPersonality;
    return [
      `🎭 ${personality.name}`,
      `💭 ${personality.responseStyle}`,
      `🌟 ${personality.emotionalTendency}`
    ];
  }
}
