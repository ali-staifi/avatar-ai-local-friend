
export class EmotionDetector {
  public static determineEmotion(intent: string, confidence: number): 'neutral' | 'happy' | 'thinking' | 'listening' {
    if (confidence < 0.5) {
      return 'thinking';
    }

    switch (intent) {
      case 'greeting':
      case 'opinion_request':
        return 'happy';
      case 'question':
      case 'explanation_request':
        return 'thinking';
      case 'help_request':
        return 'listening';
      default:
        return 'neutral';
    }
  }
}
