
import { Intent } from '@/services/IntentRecognition';
import { EnhancedResponse } from '@/services/ResponseEnhancer';

export interface ConversationMemory {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: string;
    intent?: Intent;
    enhancedResponse?: EnhancedResponse;
  }>;
  userProfile: {
    name?: string;
    preferences: string[];
    interests: string[];
  };
  sessionStartTime: Date;
  lastInteraction: Date;
}

export interface DiscussionState {
  isProcessing: boolean;
  canBeInterrupted: boolean;
  currentTask?: string;
  emotionalState: 'neutral' | 'happy' | 'thinking' | 'listening';
}

export interface ConversationInsights {
  dominantIntents: Record<string, number>;
  topicProgression: string[];
  userEngagement: number;
  personalityAlignment: number;
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
}
