
import { PersonalityTrait } from '@/types/personality';

export class ContextualHintGenerator {
  public static createContextualHints(context: any): string[] {
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

  public static extractPersonalityMarkers(personality: PersonalityTrait): string[] {
    return [
      `🎭 ${personality.name}`,
      `💭 ${personality.responseStyle}`,
      `🌟 ${personality.emotionalTendency}`
    ];
  }
}
