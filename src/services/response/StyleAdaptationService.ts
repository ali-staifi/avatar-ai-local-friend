
import { PersonalityTrait } from '@/types/personality';
import { DynamicStyleAdapter, ConversationContext } from '../intelligence/DynamicStyleAdapter';
import { EmotionAnalysis } from '../intelligence/VoiceEmotionDetector';

export class StyleAdaptationService {
  private styleAdapter: DynamicStyleAdapter;

  constructor() {
    this.styleAdapter = new DynamicStyleAdapter();
  }

  public buildConversationContext(
    conversationContext: any,
    emotionHistory: EmotionAnalysis[],
    conversationHistory: string[]
  ): ConversationContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: ConversationContext['timeOfDay'] = 'afternoon';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Estimation de l'engagement utilisateur basée sur l'historique émotionnel
    let userEngagement: ConversationContext['userEngagement'] = 'medium';
    if (emotionHistory.length > 0) {
      const recentEmotions = emotionHistory.slice(-3);
      const positiveEmotions = recentEmotions.filter(e => 
        ['happy', 'excited', 'calm'].includes(e.emotion)
      ).length;
      
      if (positiveEmotions >= 2) userEngagement = 'high';
      else if (positiveEmotions === 0) userEngagement = 'low';
    }

    return {
      topic: conversationContext.currentTopic || 'général',
      userEmotion: emotionHistory.slice(-1)[0]?.emotion || 'neutral',
      conversationLength: conversationHistory.length,
      previousInteractions: emotionHistory.length,
      timeOfDay,
      userEngagement
    };
  }

  public adaptStyle(
    context: ConversationContext,
    personality: PersonalityTrait,
    currentEmotion?: EmotionAnalysis
  ): any {
    return this.styleAdapter.adaptStyle(context, personality, currentEmotion);
  }

  public applyStyleAdaptations(text: string, style: any): string {
    let adaptedText = text;

    // Adaptation selon le ton
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

    // Adaptation selon la longueur souhaitée
    if (style.responseLength === 'brief' && adaptedText.length > 100) {
      adaptedText = adaptedText.substring(0, 100) + '...';
    }

    return adaptedText;
  }

  public getStyleTrends(): any {
    return this.styleAdapter.getStyleTrends();
  }
}
