
import { Intent } from '@/services/IntentRecognition';
import { EnhancedResponse } from '@/services/ResponseEnhancer';
import { EmotionAnalysis } from '@/services/intelligence/VoiceEmotionDetector';
import { ProactiveSuggestion } from '@/services/intelligence/ProactiveSuggestionGenerator';

export interface ConversationMemory {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: string;
    intent?: Intent;
    enhancedResponse?: EnhancedResponse;
    voiceEmotion?: EmotionAnalysis;
  }>;
  userProfile: {
    name?: string;
    preferences: string[];
    interests: string[];
    emotionalProfile?: {
      dominantEmotion: EmotionAnalysis['emotion'];
      emotionStability: 'stable' | 'variable' | 'volatile';
      preferredInteractionStyle: string;
    };
  };
  sessionStartTime: Date;
  lastInteraction: Date;
}

export interface DiscussionState {
  isProcessing: boolean;
  canBeInterrupted: boolean;
  currentTask?: string;
  emotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
  intelligentMode?: {
    voiceAnalysisActive: boolean;
    styleAdaptationLevel: 'basic' | 'advanced' | 'expert';
    proactiveSuggestionsEnabled: boolean;
  };
}

export interface ConversationInsights {
  dominantIntents: Record<string, number>;
  topicProgression: string[];
  userEngagement: number;
  personalityAlignment: number;
  
  // Nouvelles insights d'intelligence conversationnelle
  voiceEmotionAnalysis?: {
    currentEmotion: EmotionAnalysis['emotion'];
    emotionHistory: EmotionAnalysis[];
    emotionConfidence: number;
  };
  styleAdaptations?: {
    mostUsedTone: string;
    averageResponseLength: string;
    emotionalLevelTrend: 'increasing' | 'decreasing' | 'stable';
  };
  proactiveSuggestions?: ProactiveSuggestion[];
}

export interface MemoryStats {
  totalMessages: number;
  sessionDuration: number;
  userInterests: string[];
  userPreferences: string[];
  lastInteraction: Date;
  currentTopic?: string;
  conversationFlow: string[];
  followUpCount: number;
  expertiseAreas: string[];
  
  // Stats d'intelligence conversationnelle
  emotionalInsights?: {
    dominantEmotion: EmotionAnalysis['emotion'];
    emotionChanges: number;
    averageEmotionConfidence: number;
  };
  adaptationMetrics?: {
    styleChanges: number;
    proactiveSuggestionsGiven: number;
    userResponseToSuggestions: number;
  };
}
