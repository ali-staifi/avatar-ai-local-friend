
import { PersonalityTrait } from '@/types/personality';
import { EmotionAnalysis } from './VoiceEmotionDetector';

export interface ContextualStyle {
  tone: 'formal' | 'casual' | 'empathetic' | 'energetic' | 'calm' | 'analytical';
  responseLength: 'brief' | 'medium' | 'detailed';
  emotionalLevel: 'low' | 'medium' | 'high';
  personalityAdjustment: Partial<PersonalityTrait>;
}

export interface ConversationContext {
  topic: string;
  userEmotion: EmotionAnalysis['emotion'];
  conversationLength: number;
  previousInteractions: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userEngagement: 'low' | 'medium' | 'high';
}

export class DynamicStyleAdapter {
  private styleHistory: ContextualStyle[] = [];
  private adaptationRules: Map<string, (context: ConversationContext) => Partial<ContextualStyle>> = new Map();

  constructor() {
    this.initializeAdaptationRules();
  }

  private initializeAdaptationRules(): void {
    // Règles d'adaptation basées sur l'émotion utilisateur
    this.adaptationRules.set('emotion_sad', (context) => ({
      tone: 'empathetic',
      responseLength: 'medium',
      emotionalLevel: 'high'
    }));

    this.adaptationRules.set('emotion_excited', (context) => ({
      tone: 'energetic',
      responseLength: 'medium',
      emotionalLevel: 'high'
    }));

    this.adaptationRules.set('emotion_stressed', (context) => ({
      tone: 'calm',
      responseLength: 'brief',
      emotionalLevel: 'low'
    }));

    this.adaptationRules.set('emotion_angry', (context) => ({
      tone: 'calm',
      responseLength: 'brief',
      emotionalLevel: 'low'
    }));

    // Règles d'adaptation basées sur le contexte
    this.adaptationRules.set('long_conversation', (context) => {
      if (context.conversationLength > 10) {
        return {
          tone: context.userEngagement === 'high' ? 'casual' : 'formal',
          responseLength: 'brief'
        };
      }
      return {};
    });

    this.adaptationRules.set('time_adaptation', (context) => {
      switch (context.timeOfDay) {
        case 'morning':
          return { tone: 'energetic', emotionalLevel: 'medium' };
        case 'evening':
          return { tone: 'calm', emotionalLevel: 'low' };
        case 'night':
          return { tone: 'calm', responseLength: 'brief' };
        default:
          return {};
      }
    });

    // Règles d'adaptation basées sur l'engagement
    this.adaptationRules.set('engagement_adaptation', (context) => {
      switch (context.userEngagement) {
        case 'low':
          return { 
            tone: 'casual', 
            responseLength: 'brief',
            emotionalLevel: 'high'
          };
        case 'high':
          return { 
            tone: 'analytical', 
            responseLength: 'detailed',
            emotionalLevel: 'medium'
          };
        default:
          return {};
      }
    });
  }

  public adaptStyle(
    context: ConversationContext, 
    basePersonality: PersonalityTrait,
    userEmotion?: EmotionAnalysis
  ): ContextualStyle {
    console.log('🎨 Adaptation du style pour le contexte:', context);

    // Style de base
    let adaptedStyle: ContextualStyle = {
      tone: this.mapPersonalityToTone(basePersonality),
      responseLength: 'medium',
      emotionalLevel: 'medium',
      personalityAdjustment: {}
    };

    // Appliquer les règles d'adaptation
    for (const [ruleName, rule] of this.adaptationRules) {
      if (this.shouldApplyRule(ruleName, context, userEmotion)) {
        const adjustment = rule(context);
        adaptedStyle = { ...adaptedStyle, ...adjustment };
        console.log(`📝 Règle appliquée: ${ruleName}`, adjustment);
      }
    }

    // Adaptation spécifique à l'émotion détectée
    if (userEmotion) {
      const emotionAdaptation = this.adaptToEmotion(userEmotion, context);
      adaptedStyle = { ...adaptedStyle, ...emotionAdaptation };
    }

    // Enregistrer dans l'historique
    this.styleHistory.push(adaptedStyle);
    if (this.styleHistory.length > 20) {
      this.styleHistory = this.styleHistory.slice(-20);
    }

    console.log('✨ Style adapté:', adaptedStyle);
    return adaptedStyle;
  }

  private shouldApplyRule(
    ruleName: string, 
    context: ConversationContext, 
    userEmotion?: EmotionAnalysis
  ): boolean {
    switch (ruleName) {
      case 'emotion_sad':
      case 'emotion_excited':
      case 'emotion_stressed':
      case 'emotion_angry':
        return userEmotion?.emotion === ruleName.split('_')[1];
      case 'long_conversation':
        return context.conversationLength > 10;
      case 'time_adaptation':
      case 'engagement_adaptation':
        return true;
      default:
        return false;
    }
  }

  private mapPersonalityToTone(personality: PersonalityTrait): ContextualStyle['tone'] {
    switch (personality.emotionalTendency) {
      case 'empathetic': return 'empathetic';
      case 'energetic': return 'energetic';
      case 'calm': return 'calm';
      case 'analytical': return 'analytical';
      default: return 'casual';
    }
  }

  private adaptToEmotion(
    userEmotion: EmotionAnalysis, 
    context: ConversationContext
  ): Partial<ContextualStyle> {
    const adaptations: Record<EmotionAnalysis['emotion'], Partial<ContextualStyle>> = {
      happy: {
        tone: 'energetic',
        emotionalLevel: 'high',
        responseLength: 'medium'
      },
      excited: {
        tone: 'energetic',
        emotionalLevel: 'high',
        responseLength: 'detailed'
      },
      sad: {
        tone: 'empathetic',
        emotionalLevel: 'high',
        responseLength: 'medium',
        personalityAdjustment: {
          emotionalTendency: 'empathetic'
        }
      },
      angry: {
        tone: 'calm',
        emotionalLevel: 'low',
        responseLength: 'brief'
      },
      stressed: {
        tone: 'calm',
        emotionalLevel: 'low',
        responseLength: 'brief'
      },
      calm: {
        tone: 'analytical',
        emotionalLevel: 'medium',
        responseLength: 'detailed'
      },
      neutral: {
        tone: 'casual',
        emotionalLevel: 'medium',
        responseLength: 'medium'
      }
    };

    return adaptations[userEmotion.emotion] || adaptations.neutral;
  }

  public getStyleTrends(): {
    mostUsedTone: ContextualStyle['tone'];
    averageResponseLength: ContextualStyle['responseLength'];
    emotionalLevelTrend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.styleHistory.length === 0) {
      return {
        mostUsedTone: 'casual',
        averageResponseLength: 'medium',
        emotionalLevelTrend: 'stable'
      };
    }

    // Analyser les tendances
    const toneCounts = this.styleHistory.reduce((acc, style) => {
      acc[style.tone] = (acc[style.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTone = Object.entries(toneCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as ContextualStyle['tone'];

    // Calculer la tendance émotionnelle
    const recentStyles = this.styleHistory.slice(-5);
    const oldStyles = this.styleHistory.slice(-10, -5);
    
    const recentEmotionalLevel = this.calculateAverageEmotionalLevel(recentStyles);
    const oldEmotionalLevel = this.calculateAverageEmotionalLevel(oldStyles);
    
    let emotionalLevelTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentEmotionalLevel > oldEmotionalLevel + 0.1) {
      emotionalLevelTrend = 'increasing';
    } else if (recentEmotionalLevel < oldEmotionalLevel - 0.1) {
      emotionalLevelTrend = 'decreasing';
    }

    return {
      mostUsedTone,
      averageResponseLength: 'medium', // Simplifié pour l'exemple
      emotionalLevelTrend
    };
  }

  private calculateAverageEmotionalLevel(styles: ContextualStyle[]): number {
    if (styles.length === 0) return 0.5;
    
    const levelValues = { low: 0.3, medium: 0.6, high: 0.9 };
    const total = styles.reduce((sum, style) => sum + levelValues[style.emotionalLevel], 0);
    return total / styles.length;
  }

  public generateStyleSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];

    if (context.userEngagement === 'low') {
      suggestions.push("💡 Essayons une approche plus interactive");
    }

    if (context.conversationLength > 15) {
      suggestions.push("⏰ Peut-être résumer notre discussion ?");
    }

    if (context.timeOfDay === 'night') {
      suggestions.push("🌙 Conversation nocturne détectée - style apaisé activé");
    }

    return suggestions;
  }
}
