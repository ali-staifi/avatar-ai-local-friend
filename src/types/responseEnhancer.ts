
export interface EnhancedResponse {
  text: string;
  emotion: 'neutral' | 'happy' | 'thinking' | 'listening';
  tone: string;
  followUpQuestions: string[];
  contextualHints: string[];
  personalityMarkers: string[];
}

export interface PersonalityMarkers {
  optimistic: string[];
  analytical: string[];
  empathetic: string[];
  energetic: string[];
  calm: string[];
}

export interface EmotionMapping {
  [intent: string]: 'neutral' | 'happy' | 'thinking' | 'listening';
}
