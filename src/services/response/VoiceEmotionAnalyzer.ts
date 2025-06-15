
import { VoiceEmotionDetector, EmotionAnalysis } from '../intelligence/VoiceEmotionDetector';

export class VoiceEmotionAnalyzer {
  private voiceEmotionDetector: VoiceEmotionDetector;
  private currentEmotion: EmotionAnalysis | null = null;
  private emotionHistory: EmotionAnalysis[] = [];

  constructor() {
    this.voiceEmotionDetector = new VoiceEmotionDetector();
    this.initializeVoiceDetection();
  }

  private async initializeVoiceDetection(): Promise<void> {
    try {
      await this.voiceEmotionDetector.initialize();
      console.log('🎭 Intelligence conversationnelle initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation intelligence:', error);
    }
  }

  public async analyzeVoiceEmotion(audioStream?: MediaStream): Promise<EmotionAnalysis | null> {
    if (!audioStream) return null;

    try {
      const emotion = await this.voiceEmotionDetector.analyzeAudioStream(audioStream);
      if (emotion) {
        this.currentEmotion = emotion;
        this.emotionHistory.push(emotion);
        
        // Limiter l'historique
        if (this.emotionHistory.length > 20) {
          this.emotionHistory = this.emotionHistory.slice(-20);
        }
        
        console.log('🎭 Émotion vocale analysée:', emotion);
      }
      return emotion;
    } catch (error) {
      console.error('❌ Erreur analyse émotion vocale:', error);
      return null;
    }
  }

  public getCurrentEmotion(): EmotionAnalysis | null {
    return this.currentEmotion;
  }

  public getEmotionHistory(): EmotionAnalysis[] {
    return [...this.emotionHistory];
  }

  public getDominantEmotion(): string | null {
    return this.voiceEmotionDetector.getDominantEmotion();
  }
}
