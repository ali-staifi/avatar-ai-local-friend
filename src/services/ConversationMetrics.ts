
import { PersonalityId } from '@/types/personality';

export interface ConversationMetric {
  timestamp: Date;
  responseTime: number;
  userSatisfaction?: number;
  personalityUsed: PersonalityId;
  messageLength: number;
  intentRecognized?: string;
  emotionDetected?: string;
}

export interface ConversationPattern {
  averageResponseTime: number;
  satisfactionRate: number;
  personalityUsage: Record<PersonalityId, number>;
  commonIntents: Record<string, number>;
  emotionDistribution: Record<string, number>;
  peakUsageHours: number[];
  averageSessionDuration: number;
  messagesPerSession: number;
}

export class ConversationMetrics {
  private static instance: ConversationMetrics;
  private metrics: ConversationMetric[] = [];
  private sessionStartTime: Date = new Date();
  private sessionMessageCount: number = 0;
  private currentResponseStartTime: Date | null = null;

  private constructor() {
    this.loadStoredMetrics();
  }

  public static getInstance(): ConversationMetrics {
    if (!ConversationMetrics.instance) {
      ConversationMetrics.instance = new ConversationMetrics();
    }
    return ConversationMetrics.instance;
  }

  public startResponseTimer(): void {
    this.currentResponseStartTime = new Date();
  }

  public recordResponse(
    personalityUsed: PersonalityId,
    messageLength: number,
    intentRecognized?: string,
    emotionDetected?: string
  ): void {
    if (!this.currentResponseStartTime) {
      console.warn('Response timer not started');
      return;
    }

    const responseTime = new Date().getTime() - this.currentResponseStartTime.getTime();
    
    const metric: ConversationMetric = {
      timestamp: new Date(),
      responseTime,
      personalityUsed,
      messageLength,
      intentRecognized,
      emotionDetected
    };

    this.metrics.push(metric);
    this.sessionMessageCount++;
    this.currentResponseStartTime = null;
    
    // Sauvegarder périodiquement
    if (this.metrics.length % 10 === 0) {
      this.saveMetrics();
    }

    console.log('📊 Métrique enregistrée:', metric);
  }

  public recordSatisfaction(rating: number): void {
    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      lastMetric.userSatisfaction = rating;
      this.saveMetrics();
    }
  }

  public getConversationPatterns(): ConversationPattern {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        satisfactionRate: 0,
        personalityUsage: {} as Record<PersonalityId, number>,
        commonIntents: {},
        emotionDistribution: {},
        peakUsageHours: [],
        averageSessionDuration: 0,
        messagesPerSession: 0
      };
    }

    const patterns: ConversationPattern = {
      averageResponseTime: this.calculateAverageResponseTime(),
      satisfactionRate: this.calculateSatisfactionRate(),
      personalityUsage: this.calculatePersonalityUsage(),
      commonIntents: this.calculateCommonIntents(),
      emotionDistribution: this.calculateEmotionDistribution(),
      peakUsageHours: this.calculatePeakUsageHours(),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      messagesPerSession: this.sessionMessageCount
    };

    return patterns;
  }

  private calculateAverageResponseTime(): number {
    const responseTimes = this.metrics.map(m => m.responseTime);
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private calculateSatisfactionRate(): number {
    const satisfactionRatings = this.metrics
      .filter(m => m.userSatisfaction !== undefined)
      .map(m => m.userSatisfaction!);
    
    if (satisfactionRatings.length === 0) return 0;
    
    const average = satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length;
    return (average / 5) * 100; // Convertir en pourcentage (5 = note max)
  }

  private calculatePersonalityUsage(): Record<PersonalityId, number> {
    const usage: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      usage[metric.personalityUsed] = (usage[metric.personalityUsed] || 0) + 1;
    });

    // Convertir en pourcentages
    const total = this.metrics.length;
    Object.keys(usage).forEach(key => {
      usage[key] = (usage[key] / total) * 100;
    });

    return usage as Record<PersonalityId, number>;
  }

  private calculateCommonIntents(): Record<string, number> {
    const intents: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      if (metric.intentRecognized) {
        intents[metric.intentRecognized] = (intents[metric.intentRecognized] || 0) + 1;
      }
    });

    return intents;
  }

  private calculateEmotionDistribution(): Record<string, number> {
    const emotions: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      if (metric.emotionDetected) {
        emotions[metric.emotionDetected] = (emotions[metric.emotionDetected] || 0) + 1;
      }
    });

    return emotions;
  }

  private calculatePeakUsageHours(): number[] {
    const hourCounts: Record<number, number> = {};
    
    this.metrics.forEach(metric => {
      const hour = metric.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculateAverageSessionDuration(): number {
    const sessionDuration = new Date().getTime() - this.sessionStartTime.getTime();
    return sessionDuration / 1000 / 60; // Retourner en minutes
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('conversation-metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Impossible de sauvegarder les métriques:', error);
    }
  }

  private loadStoredMetrics(): void {
    try {
      const stored = localStorage.getItem('conversation-metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Impossible de charger les métriques sauvegardées:', error);
      this.metrics = [];
    }
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.sessionMessageCount = 0;
    this.sessionStartTime = new Date();
    localStorage.removeItem('conversation-metrics');
    console.log('🧹 Métriques conversationnelles nettoyées');
  }

  public exportMetrics(): any {
    return {
      metrics: this.metrics,
      patterns: this.getConversationPatterns(),
      sessionInfo: {
        startTime: this.sessionStartTime,
        messageCount: this.sessionMessageCount,
        duration: this.calculateAverageSessionDuration()
      }
    };
  }
}

export const conversationMetrics = ConversationMetrics.getInstance();
