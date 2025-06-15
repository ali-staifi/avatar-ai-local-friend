
import { EmotionAnalysis } from './VoiceEmotionDetector';
import { ConversationContext } from './DynamicStyleAdapter';

export interface ProactiveSuggestion {
  id: string;
  type: 'question' | 'topic' | 'action' | 'break' | 'summary';
  priority: 'low' | 'medium' | 'high';
  text: string;
  reason: string;
  confidence: number;
  contextTriggers: string[];
}

export interface ConversationPattern {
  topics: string[];
  emotionalFlow: EmotionAnalysis['emotion'][];
  interactionFrequency: number;
  avgResponseTime: number;
  preferredStyle: string;
  expertiseAreas: string[];
}

export class ProactiveSuggestionGenerator {
  private suggestionHistory: ProactiveSuggestion[] = [];
  private conversationPatterns: ConversationPattern[] = [];
  private topicGraph: Map<string, string[]> = new Map();
  private lastSuggestionTime = 0;

  constructor() {
    this.initializeTopicGraph();
  }

  private initializeTopicGraph(): void {
    // Graphe de relations entre sujets
    this.topicGraph.set('technologie', ['intelligence artificielle', 'programmation', 'innovation']);
    this.topicGraph.set('art', ['créativité', 'expression', 'culture']);
    this.topicGraph.set('science', ['recherche', 'découverte', 'expérimentation']);
    this.topicGraph.set('philosophie', ['réflexion', 'existence', 'éthique']);
    this.topicGraph.set('sport', ['performance', 'santé', 'compétition']);
    this.topicGraph.set('musique', ['harmonie', 'créativité', 'émotion']);
    this.topicGraph.set('voyage', ['découverte', 'culture', 'aventure']);
    this.topicGraph.set('cuisine', ['culture', 'créativité', 'plaisir']);
  }

  public generateProactiveSuggestions(
    context: ConversationContext,
    emotionHistory: EmotionAnalysis[],
    conversationHistory: string[]
  ): ProactiveSuggestion[] {
    console.log('🤖 Génération de suggestions proactives...');

    const suggestions: ProactiveSuggestion[] = [];
    
    // Éviter la sur-sollicitation
    if (Date.now() - this.lastSuggestionTime < 30000) {
      return [];
    }

    // Analyser les patterns de conversation
    const patterns = this.analyzeConversationPatterns(conversationHistory, emotionHistory);
    
    // Générer différents types de suggestions
    suggestions.push(...this.generateTopicSuggestions(context, patterns));
    suggestions.push(...this.generateEmotionalSuggestions(context, emotionHistory));
    suggestions.push(...this.generateEngagementSuggestions(context, patterns));
    suggestions.push(...this.generateBreakSuggestions(context));
    suggestions.push(...this.generateSummarySuggestions(context, conversationHistory));

    // Filtrer et prioriser
    const filteredSuggestions = this.filterAndPrioritizeSuggestions(suggestions, context);
    
    if (filteredSuggestions.length > 0) {
      this.lastSuggestionTime = Date.now();
      this.suggestionHistory.push(...filteredSuggestions);
    }

    console.log(`💡 ${filteredSuggestions.length} suggestions générées`);
    return filteredSuggestions;
  }

  private analyzeConversationPatterns(
    conversationHistory: string[],
    emotionHistory: EmotionAnalysis[]
  ): ConversationPattern {
    const topics = this.extractTopics(conversationHistory);
    const emotionalFlow = emotionHistory.map(e => e.emotion);
    
    return {
      topics,
      emotionalFlow,
      interactionFrequency: conversationHistory.length,
      avgResponseTime: 2000, // Simulé
      preferredStyle: 'conversational',
      expertiseAreas: this.identifyExpertiseAreas(topics)
    };
  }

  private extractTopics(conversationHistory: string[]): string[] {
    const topics: string[] = [];
    const topicKeywords = Array.from(this.topicGraph.keys());
    
    conversationHistory.forEach(message => {
      const lowerMessage = message.toLowerCase();
      topicKeywords.forEach(topic => {
        if (lowerMessage.includes(topic)) {
          topics.push(topic);
        }
      });
    });
    
    return [...new Set(topics)];
  }

  private identifyExpertiseAreas(topics: string[]): string[] {
    const topicCounts = topics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(topicCounts)
      .filter(([, count]) => count >= 3)
      .map(([topic]) => topic);
  }

  private generateTopicSuggestions(
    context: ConversationContext,
    patterns: ConversationPattern
  ): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    // Suggestions basées sur les sujets connexes
    if (context.topic && this.topicGraph.has(context.topic)) {
      const relatedTopics = this.topicGraph.get(context.topic)!;
      const unexploredTopics = relatedTopics.filter(t => !patterns.topics.includes(t));
      
      if (unexploredTopics.length > 0) {
        const topic = unexploredTopics[0];
        suggestions.push({
          id: `topic_${Date.now()}`,
          type: 'topic',
          priority: 'medium',
          text: `Aimeriez-vous explorer le lien entre ${context.topic} et ${topic} ?`,
          reason: `Sujet connexe détecté: ${topic}`,
          confidence: 0.7,
          contextTriggers: ['related_topic', context.topic]
        });
      }
    }

    // Suggestions basées sur l'expertise détectée
    if (patterns.expertiseAreas.length > 0) {
      const expertArea = patterns.expertiseAreas[0];
      suggestions.push({
        id: `expertise_${Date.now()}`,
        type: 'question',
        priority: 'high',
        text: `Vous semblez passionné par ${expertArea}. Quelle est votre expérience dans ce domaine ?`,
        reason: `Expertise détectée en ${expertArea}`,
        confidence: 0.8,
        contextTriggers: ['expertise', expertArea]
      });
    }

    return suggestions;
  }

  private generateEmotionalSuggestions(
    context: ConversationContext,
    emotionHistory: EmotionAnalysis[]
  ): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    if (emotionHistory.length === 0) return suggestions;
    
    const recentEmotion = emotionHistory[emotionHistory.length - 1];
    const emotionTrend = this.analyzeEmotionTrend(emotionHistory);
    
    // Suggestions basées sur l'émotion actuelle
    switch (recentEmotion.emotion) {
      case 'stressed':
        suggestions.push({
          id: `emotion_stressed_${Date.now()}`,
          type: 'action',
          priority: 'high',
          text: 'Je sens que ce sujet vous préoccupe. Souhaitez-vous faire une pause ou l\'aborder différemment ?',
          reason: 'Stress détecté dans la voix',
          confidence: recentEmotion.confidence,
          contextTriggers: ['emotion', 'stressed']
        });
        break;
        
      case 'excited':
        suggestions.push({
          id: `emotion_excited_${Date.now()}`,
          type: 'question',
          priority: 'medium',
          text: 'Votre enthousiasme est contagieux ! Qu\'est-ce qui vous passionne le plus dans ce sujet ?',
          reason: 'Enthousiasme détecté',
          confidence: recentEmotion.confidence,
          contextTriggers: ['emotion', 'excited']
        });
        break;
        
      case 'sad':
        suggestions.push({
          id: `emotion_sad_${Date.now()}`,
          type: 'action',
          priority: 'high',
          text: 'Je perçois que ce sujet vous touche. Préférez-vous en parler ou changer de direction ?',
          reason: 'Tristesse détectée',
          confidence: recentEmotion.confidence,
          contextTriggers: ['emotion', 'sad']
        });
        break;
    }
    
    // Suggestions basées sur les tendances émotionnelles
    if (emotionTrend === 'declining') {
      suggestions.push({
        id: `trend_declining_${Date.now()}`,
        type: 'break',
        priority: 'medium',
        text: 'Je remarque que votre énergie diminue. Voulez-vous faire une pause ou changer de sujet ?',
        reason: 'Tendance émotionnelle descendante',
        confidence: 0.6,
        contextTriggers: ['emotion_trend', 'declining']
      });
    }
    
    return suggestions;
  }

  private generateEngagementSuggestions(
    context: ConversationContext,
    patterns: ConversationPattern
  ): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    if (context.userEngagement === 'low') {
      suggestions.push({
        id: `engagement_low_${Date.now()}`,
        type: 'question',
        priority: 'high',
        text: 'Y a-t-il un sujet qui vous intéresserait davantage ?',
        reason: 'Engagement utilisateur faible',
        confidence: 0.7,
        contextTriggers: ['engagement', 'low']
      });
    }
    
    if (context.conversationLength > 20 && patterns.interactionFrequency < 0.5) {
      suggestions.push({
        id: `interaction_low_${Date.now()}`,
        type: 'action',
        priority: 'medium',
        text: 'Cette conversation est riche ! Aimeriez-vous que je résume les points clés ?',
        reason: 'Longue conversation avec peu d\'interactions',
        confidence: 0.6,
        contextTriggers: ['conversation_length', 'low_interaction']
      });
    }
    
    return suggestions;
  }

  private generateBreakSuggestions(context: ConversationContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    if (context.conversationLength > 25) {
      suggestions.push({
        id: `break_long_${Date.now()}`,
        type: 'break',
        priority: 'low',
        text: 'Nous avons eu une longue discussion ! Voulez-vous faire une pause ?',
        reason: 'Conversation très longue',
        confidence: 0.5,
        contextTriggers: ['conversation_length', 'very_long']
      });
    }
    
    if (context.timeOfDay === 'night') {
      suggestions.push({
        id: `break_night_${Date.now()}`,
        type: 'break',
        priority: 'medium',
        text: 'Il se fait tard. Souhaitez-vous continuer notre discussion ou la reprendre plus tard ?',
        reason: 'Heure tardive détectée',
        confidence: 0.7,
        contextTriggers: ['time', 'night']
      });
    }
    
    return suggestions;
  }

  private generateSummarySuggestions(
    context: ConversationContext,
    conversationHistory: string[]
  ): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    
    if (conversationHistory.length > 15 && context.userEngagement === 'medium') {
      suggestions.push({
        id: `summary_${Date.now()}`,
        type: 'summary',
        priority: 'medium',
        text: 'Voulez-vous que je résume notre discussion jusqu\'à présent ?',
        reason: 'Discussion suffisamment longue pour un résumé',
        confidence: 0.6,
        contextTriggers: ['conversation_length', 'summary_ready']
      });
    }
    
    return suggestions;
  }

  private filterAndPrioritizeSuggestions(
    suggestions: ProactiveSuggestion[],
    context: ConversationContext
  ): ProactiveSuggestion[] {
    // Filtrer les suggestions redondantes
    const filtered = suggestions.filter(suggestion => 
      !this.isDuplicateRecent(suggestion) && 
      suggestion.confidence > 0.5
    );
    
    // Prioriser selon le contexte
    return filtered
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 2); // Limiter à 2 suggestions maximum
  }

  private isDuplicateRecent(suggestion: ProactiveSuggestion): boolean {
    const recentSuggestions = this.suggestionHistory.slice(-5);
    return recentSuggestions.some(recent => 
      recent.type === suggestion.type && 
      recent.contextTriggers.some(trigger => 
        suggestion.contextTriggers.includes(trigger)
      )
    );
  }

  private analyzeEmotionTrend(emotionHistory: EmotionAnalysis[]): 'improving' | 'declining' | 'stable' {
    if (emotionHistory.length < 3) return 'stable';
    
    const emotionValues = {
      sad: 1, angry: 2, stressed: 3, neutral: 4, calm: 5, happy: 6, excited: 7
    };
    
    const recent = emotionHistory.slice(-3).map(e => emotionValues[e.emotion]);
    const trend = recent[2] - recent[0];
    
    if (trend > 1) return 'improving';
    if (trend < -1) return 'declining';
    return 'stable';
  }

  public getSuggestionHistory(): ProactiveSuggestion[] {
    return [...this.suggestionHistory];
  }

  public getTopicSuggestions(currentTopic: string): string[] {
    return this.topicGraph.get(currentTopic) || [];
  }
}
