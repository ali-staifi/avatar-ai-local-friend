
import { Intent } from '../IntentRecognition';
import { PersonalityTrait } from '@/types/personality';
import { EnhancedResponse } from '@/types/responseEnhancer';

export interface PredictedResponse {
  id: string;
  anticipatedIntent: string;
  preGeneratedResponse: EnhancedResponse;
  confidence: number;
  expiresAt: Date;
}

export interface ConversationPattern {
  intentSequence: string[];
  followUpProbability: number;
  nextLikelyIntents: string[];
}

export class ResponsePredictionService {
  private predictedResponses: Map<string, PredictedResponse> = new Map();
  private conversationPatterns: ConversationPattern[] = [];
  private recentIntents: string[] = [];

  constructor() {
    this.initializeCommonPatterns();
  }

  public async predictNextResponses(
    currentIntent: Intent,
    personality: PersonalityTrait,
    conversationContext: any
  ): Promise<PredictedResponse[]> {
    console.log(`🔮 Prédiction des réponses suivantes pour: ${currentIntent.name}`);

    // Ajouter l'intention actuelle à l'historique
    this.recentIntents.push(currentIntent.name);
    if (this.recentIntents.length > 5) {
      this.recentIntents.shift();
    }

    // Trouver les patterns correspondants
    const matchingPatterns = this.findMatchingPatterns();
    const predictions: PredictedResponse[] = [];

    for (const pattern of matchingPatterns) {
      for (const nextIntent of pattern.nextLikelyIntents) {
        const predicted = await this.generatePredictedResponse(
          nextIntent,
          pattern.followUpProbability,
          personality,
          conversationContext
        );
        
        if (predicted) {
          predictions.push(predicted);
          this.predictedResponses.set(predicted.id, predicted);
        }
      }
    }

    // Nettoyer les prédictions expirées
    this.cleanupExpiredPredictions();

    console.log(`📈 ${predictions.length} réponses pré-générées`);
    return predictions;
  }

  public getPredictedResponse(intentName: string): PredictedResponse | null {
    for (const prediction of this.predictedResponses.values()) {
      if (prediction.anticipatedIntent === intentName && 
          prediction.expiresAt > new Date()) {
        console.log(`⚡ Réponse prédite trouvée pour: ${intentName}`);
        return prediction;
      }
    }
    return null;
  }

  public updateConversationPatterns(intentSequence: string[]): void {
    // Analyser la séquence pour créer/mettre à jour les patterns
    if (intentSequence.length >= 2) {
      const pattern = this.findOrCreatePattern(intentSequence);
      pattern.followUpProbability = Math.min(pattern.followUpProbability + 0.1, 1.0);
    }
  }

  private initializeCommonPatterns(): void {
    this.conversationPatterns = [
      {
        intentSequence: ['greeting'],
        followUpProbability: 0.8,
        nextLikelyIntents: ['question', 'help_request', 'capability_inquiry']
      },
      {
        intentSequence: ['question'],
        followUpProbability: 0.7,
        nextLikelyIntents: ['explanation_request', 'follow_up_question', 'opinion_request']
      },
      {
        intentSequence: ['explanation_request'],
        followUpProbability: 0.6,
        nextLikelyIntents: ['clarification_request', 'example_request', 'related_question']
      },
      {
        intentSequence: ['help_request'],
        followUpProbability: 0.9,
        nextLikelyIntents: ['specific_question', 'clarification_request', 'gratitude']
      },
      {
        intentSequence: ['opinion_request'],
        followUpProbability: 0.5,
        nextLikelyIntents: ['counter_opinion', 'agreement', 'related_question']
      }
    ];
  }

  private findMatchingPatterns(): ConversationPattern[] {
    return this.conversationPatterns.filter(pattern => {
      const patternLength = pattern.intentSequence.length;
      const recentSubset = this.recentIntents.slice(-patternLength);
      
      return recentSubset.length === patternLength &&
             recentSubset.every((intent, index) => 
               intent === pattern.intentSequence[index]
             );
    });
  }

  private async generatePredictedResponse(
    intentName: string,
    confidence: number,
    personality: PersonalityTrait,
    conversationContext: any
  ): Promise<PredictedResponse | null> {
    try {
      // Générer une réponse basique pour l'intention prédite
      const mockEnhancedResponse: EnhancedResponse = {
        text: this.generateMockResponse(intentName, personality),
        emotion: this.predictEmotion(intentName),
        tone: personality.responseStyle,
        followUpQuestions: this.generateFollowUpQuestions(intentName),
        contextualHints: [],
        personalityMarkers: [`🎭 ${personality.name}`]
      };

      return {
        id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        anticipatedIntent: intentName,
        preGeneratedResponse: mockEnhancedResponse,
        confidence,
        expiresAt: new Date(Date.now() + 30000) // Expire dans 30 secondes
      };
    } catch (error) {
      console.error('❌ Erreur génération prédiction:', error);
      return null;
    }
  }

  private generateMockResponse(intentName: string, personality: PersonalityTrait): string {
    const responses = {
      'question': `Excellente question ! Selon mon analyse ${personality.name.toLowerCase()}...`,
      'explanation_request': `Je vais vous expliquer cela étape par étape...`,
      'help_request': `Je suis là pour vous aider ! Voici ce que je peux faire...`,
      'clarification_request': `Pour clarifier ce point important...`,
      'example_request': `Voici un exemple concret qui illustre bien cela...`,
      'follow_up_question': `C'est un très bon point de suivi...`
    };

    return responses[intentName] || `Merci pour votre ${intentName}. Voici ma réponse ${personality.name.toLowerCase()}...`;
  }

  private predictEmotion(intentName: string): 'neutral' | 'happy' | 'thinking' | 'listening' {
    const emotionMap = {
      'question': 'thinking',
      'explanation_request': 'thinking',
      'help_request': 'listening',
      'greeting': 'happy',
      'opinion_request': 'thinking'
    };
    return emotionMap[intentName] || 'neutral';
  }

  private generateFollowUpQuestions(intentName: string): string[] {
    const followUps = {
      'question': ['Voulez-vous plus de détails ?', 'Y a-t-il un aspect particulier qui vous intéresse ?'],
      'explanation_request': ['Est-ce que cela répond à votre question ?', 'Souhaitez-vous un exemple ?'],
      'help_request': ['Avez-vous d\'autres questions ?', 'Puis-je vous aider avec autre chose ?']
    };
    return followUps[intentName] || ['Comment puis-je vous aider davantage ?'];
  }

  private findOrCreatePattern(intentSequence: string[]): ConversationPattern {
    const existing = this.conversationPatterns.find(p => 
      p.intentSequence.length === intentSequence.length &&
      p.intentSequence.every((intent, index) => intent === intentSequence[index])
    );

    if (existing) {
      return existing;
    }

    const newPattern: ConversationPattern = {
      intentSequence: [...intentSequence],
      followUpProbability: 0.1,
      nextLikelyIntents: []
    };

    this.conversationPatterns.push(newPattern);
    return newPattern;
  }

  private cleanupExpiredPredictions(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    this.predictedResponses.forEach((prediction, key) => {
      if (prediction.expiresAt <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.predictedResponses.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Nettoyage de ${expiredKeys.length} prédictions expirées`);
    }
  }
}
