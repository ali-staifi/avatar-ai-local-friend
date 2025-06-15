
import { DialogueResponse } from '../DialogueManager';
import { PersonalityTrait } from '@/types/personality';
import { EnhancedResponse } from '@/types/responseEnhancer';
import { EmotionAnalysis } from '../intelligence/VoiceEmotionDetector';
import { PersonalityTextEnricher } from './PersonalityTextEnricher';
import { EmotionDetector } from './EmotionDetector';
import { FollowUpGenerator } from './FollowUpGenerator';
import { ContextualHintGenerator } from './ContextualHintGenerator';
import { ProactiveSuggestionGenerator } from '../intelligence/ProactiveSuggestionGenerator';
import { ConversationContext } from '../intelligence/DynamicStyleAdapter';

export class IntelligentResponseProcessor {
  private suggestionGenerator: ProactiveSuggestionGenerator;

  constructor() {
    this.suggestionGenerator = new ProactiveSuggestionGenerator();
  }

  public processResponse(
    dialogueResponse: DialogueResponse,
    personality: PersonalityTrait,
    adaptedStyle: any,
    currentEmotion: EmotionAnalysis | null,
    conversationContext: ConversationContext,
    contextualHints: string[]
  ): EnhancedResponse {
    // Enrichir le texte avec la personnalité et le style adapté
    let enhancedText = PersonalityTextEnricher.enrichWithPersonality(
      dialogueResponse.text, 
      dialogueResponse.intent, 
      personality
    );

    // Appliquer les adaptations de style intelligentes
    enhancedText = this.applyStyleAdaptations(enhancedText, adaptedStyle);
    
    // Déterminer l'émotion appropriée (avec intelligence émotionnelle)
    const emotion = this.determineIntelligentEmotion(
      dialogueResponse.intent, 
      dialogueResponse.confidence,
      currentEmotion
    );
    
    // Générer des questions de suivi intelligentes
    const followUpQuestions = FollowUpGenerator.generateIntelligentFollowUps(
      dialogueResponse.intent, 
      conversationContext,
      personality
    );
    
    // Identifier les marqueurs de personnalité
    const personalityMarkers = ContextualHintGenerator.extractPersonalityMarkers(personality);

    // Générer des suggestions proactives
    const proactiveSuggestions = this.suggestionGenerator.generateProactiveSuggestions(
      conversationContext,
      [], // emotionHistory sera fourni par le service parent
      [] // conversationHistory sera fourni par le service parent
    );

    return {
      text: enhancedText,
      emotion,
      tone: adaptedStyle.tone,
      followUpQuestions,
      contextualHints: [
        ...contextualHints,
        ...proactiveSuggestions.map(s => `💡 ${s.text}`)
      ],
      personalityMarkers
    };
  }

  public adaptPredictedResponse(
    predicted: EnhancedResponse, 
    adaptedStyle: any,
    contextualHints: string[]
  ): EnhancedResponse {
    // Appliquer les adaptations de style
    const adaptedText = this.applyStyleAdaptations(predicted.text, adaptedStyle);
    
    return {
      ...predicted,
      text: adaptedText,
      tone: adaptedStyle.tone,
      contextualHints,
    };
  }

  private applyStyleAdaptations(text: string, style: any): string {
    let adaptedText = text;

    switch (style.tone) {
      case 'empathetic':
        adaptedText = `Je comprends... ${adaptedText}`;
        break;
      case 'energetic':
        adaptedText = `${adaptedText} 🚀`;
        break;
      case 'calm':
        adaptedText = adaptedText.replace(/!+/g, '.');
        break;
      case 'formal':
        adaptedText = adaptedText.replace(/sympa/g, 'agréable');
        break;
    }

    if (style.responseLength === 'brief' && adaptedText.length > 100) {
      adaptedText = adaptedText.substring(0, 100) + '...';
    }

    return adaptedText;
  }

  private determineIntelligentEmotion(
    intent: string, 
    confidence: number,
    userEmotion?: EmotionAnalysis | null
  ): 'neutral' | 'happy' | 'thinking' | 'listening' {
    // Adaptation émotionnelle basée sur l'émotion de l'utilisateur
    if (userEmotion) {
      switch (userEmotion.emotion) {
        case 'sad':
        case 'stressed':
          return 'listening'; // Montrer de l'empathie
        case 'excited':
        case 'happy':
          return 'happy'; // Refléter l'énergie positive
        case 'angry':
          return 'neutral'; // Rester neutre pour apaiser
      }
    }

    // Fallback vers la logique originale
    return EmotionDetector.determineEmotion(intent, confidence);
  }
}
