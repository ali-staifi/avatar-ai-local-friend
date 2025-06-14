
import { DialogueResponse } from './DialogueManager';
import { PersonalityTrait } from '@/types/personality';
import { EnhancedResponse } from '@/types/responseEnhancer';
import { PersonalityTextEnricher } from './response/PersonalityTextEnricher';
import { EmotionDetector } from './response/EmotionDetector';
import { FollowUpGenerator } from './response/FollowUpGenerator';
import { ContextualHintGenerator } from './response/ContextualHintGenerator';

export { EnhancedResponse } from '@/types/responseEnhancer';

export class ResponseEnhancer {
  private currentPersonality: PersonalityTrait;

  constructor(personality: PersonalityTrait) {
    this.currentPersonality = personality;
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
  }

  public enhanceResponse(dialogueResponse: DialogueResponse, conversationContext: any): EnhancedResponse {
    // Enrichir le texte avec la personnalité
    const enhancedText = PersonalityTextEnricher.enrichWithPersonality(
      dialogueResponse.text, 
      dialogueResponse.intent, 
      this.currentPersonality
    );
    
    // Déterminer l'émotion appropriée
    const emotion = EmotionDetector.determineEmotion(
      dialogueResponse.intent, 
      dialogueResponse.confidence
    );
    
    // Générer des questions de suivi intelligentes
    const followUpQuestions = FollowUpGenerator.generateIntelligentFollowUps(
      dialogueResponse.intent, 
      conversationContext,
      this.currentPersonality
    );
    
    // Créer des indices contextuels
    const contextualHints = ContextualHintGenerator.createContextualHints(conversationContext);
    
    // Identifier les marqueurs de personnalité
    const personalityMarkers = ContextualHintGenerator.extractPersonalityMarkers(
      this.currentPersonality
    );

    return {
      text: enhancedText,
      emotion,
      tone: this.currentPersonality.responseStyle,
      followUpQuestions,
      contextualHints,
      personalityMarkers
    };
  }
}
