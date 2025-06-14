
import { Intent } from './IntentRecognition';
import { PersonalityTrait } from '@/types/personality';
import { Gender } from '@/types/gender';
import { UserProfileService } from './UserProfileService';

export class ResponseGenerationService {
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;

  constructor(personality: PersonalityTrait, gender: Gender = 'male') {
    this.currentPersonality = personality;
    this.currentGender = gender;
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
  }

  public generateContextualResponse(
    intent: Intent, 
    userInput: string, 
    currentTopic?: string,
    userProfileService?: UserProfileService
  ): string {
    const personality = this.currentPersonality;
    const basePattern = personality.speechPattern[
      Math.floor(Math.random() * personality.speechPattern.length)
    ];

    // Adapt responses according to gender
    const genderAwareResponse = this.adaptResponseForGender(basePattern);

    switch (intent.name) {
      case 'greeting':
        return this.generateGreetingResponse(genderAwareResponse);
      
      case 'question':
        return this.generateQuestionResponse(genderAwareResponse, userInput, currentTopic, userProfileService);
      
      case 'explanation_request':
        return this.generateExplanationResponse(genderAwareResponse, currentTopic);
      
      case 'opinion_request':
        return this.generateOpinionResponse(genderAwareResponse);
      
      case 'help_request':
        return this.generateHelpResponse(genderAwareResponse);
      
      case 'personal_info':
        return this.generatePersonalInfoResponse(genderAwareResponse);
      
      case 'capability_inquiry':
        return this.generateCapabilityResponse(genderAwareResponse);
      
      case 'goodbye':
        return this.generateGoodbyeResponse(genderAwareResponse);
      
      default:
        return this.generateDefaultResponse(genderAwareResponse);
    }
  }

  private adaptResponseForGender(basePattern: string): string {
    // Adapt formulations according to gender
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

  private generateQuestionResponse(
    basePattern: string, 
    userInput: string, 
    currentTopic?: string,
    userProfileService?: UserProfileService
  ): string {
    const expertise = currentTopic && userProfileService 
      ? userProfileService.getExpertiseLevel(currentTopic) 
      : 0.5;
    
    if (expertise < 0.3) {
      return `${basePattern} Je vais vous expliquer cela de manière simple et claire. ${currentTopic ? `Concernant ${currentTopic}, ` : ''}voici ce que je peux vous dire...`;
    } else {
      return `${basePattern} C'est une excellente question ! ${currentTopic ? `Sur le sujet de ${currentTopic}, ` : ''}permettez-moi de vous donner une réponse détaillée...`;
    }
  }

  private generateExplanationResponse(basePattern: string, currentTopic?: string): string {
    return `${basePattern} Je vais vous donner une explication complète. ${currentTopic ? `Pour bien comprendre ${currentTopic}, ` : ''}commençons par les bases...`;
  }

  private generateOpinionResponse(basePattern: string): string {
    const personality = this.currentPersonality;
    if (personality.emotionalTendency === 'analytical') {
      return `${basePattern} D'un point de vue analytique, je pense que... Mais j'aimerais connaître votre perspective aussi.`;
    } else if (personality.emotionalTendency === 'empathetic') {
      return `${basePattern} C'est un sujet qui me tient à cœur. Je ressens que...`;
    } else {
      return `${basePattern} Voici mon opinion sur cette question...`;
    }
  }

  private generateHelpResponse(basePattern: string): string {
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

  private generateDefaultResponse(basePattern: string): string {
    return `${basePattern} C'est intéressant ce que vous dites. Pouvez-vous m'en dire plus ?`;
  }
}
