
export interface VoiceMetrics {
  pitch: number;
  intensity: number;
  speed: number;
  pauses: number[];
  duration: number;
}

export interface EmotionAnalysis {
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'stressed';
  confidence: number;
  metrics: VoiceMetrics;
  suggestions: string[];
}

export class VoiceEmotionDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing = false;
  private emotionHistory: EmotionAnalysis[] = [];

  public async initialize(): Promise<boolean> {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      console.log('🎭 Détecteur d\'émotions vocales initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation détecteur émotions:', error);
      return false;
    }
  }

  public async analyzeAudioStream(stream: MediaStream): Promise<EmotionAnalysis | null> {
    if (!this.audioContext || !this.analyser || !this.dataArray) {
      console.warn('⚠️ Détecteur non initialisé');
      return null;
    }

    try {
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.isAnalyzing = true;
      const metrics = this.extractVoiceMetrics();
      const emotion = this.classifyEmotion(metrics);
      
      const analysis: EmotionAnalysis = {
        emotion: emotion.emotion,
        confidence: emotion.confidence,
        metrics,
        suggestions: this.generateEmotionSuggestions(emotion.emotion)
      };

      this.emotionHistory.push(analysis);
      if (this.emotionHistory.length > 10) {
        this.emotionHistory = this.emotionHistory.slice(-10);
      }

      console.log('🎭 Émotion détectée:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Erreur analyse audio:', error);
      return null;
    }
  }

  private extractVoiceMetrics(): VoiceMetrics {
    if (!this.analyser || !this.dataArray) {
      return { pitch: 0, intensity: 0, speed: 0, pauses: [], duration: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calcul de l'intensité moyenne
    const intensity = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    // Estimation du pitch (fréquence dominante)
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const pitch = (maxIndex * this.audioContext!.sampleRate) / (2 * this.dataArray.length);
    
    // Simulation d'autres métriques
    const speed = this.estimateSpeechSpeed(intensity);
    const pauses = this.detectPauses(intensity);
    
    return {
      pitch: Math.round(pitch),
      intensity: Math.round(intensity),
      speed,
      pauses,
      duration: Date.now()
    };
  }

  private classifyEmotion(metrics: VoiceMetrics): { emotion: EmotionAnalysis['emotion'], confidence: number } {
    const { pitch, intensity, speed } = metrics;
    
    // Règles simplifiées de classification émotionnelle
    if (intensity > 150 && pitch > 300 && speed > 1.2) {
      return { emotion: 'excited', confidence: 0.8 };
    }
    
    if (intensity > 120 && pitch > 250) {
      return { emotion: 'happy', confidence: 0.7 };
    }
    
    if (intensity < 80 && pitch < 180) {
      return { emotion: 'sad', confidence: 0.6 };
    }
    
    if (intensity > 140 && speed > 1.5) {
      return { emotion: 'stressed', confidence: 0.7 };
    }
    
    if (intensity < 100 && speed < 0.8) {
      return { emotion: 'calm', confidence: 0.6 };
    }
    
    if (intensity > 160 && pitch < 200) {
      return { emotion: 'angry', confidence: 0.7 };
    }
    
    return { emotion: 'neutral', confidence: 0.5 };
  }

  private estimateSpeechSpeed(intensity: number): number {
    // Estimation basique de la vitesse de parole
    return intensity > 100 ? 1.2 : 0.8;
  }

  private detectPauses(intensity: number): number[] {
    // Simulation de détection de pauses
    return intensity < 50 ? [Date.now()] : [];
  }

  private generateEmotionSuggestions(emotion: EmotionAnalysis['emotion']): string[] {
    const suggestions: Record<EmotionAnalysis['emotion'], string[]> = {
      happy: [
        "Votre enthousiasme est contagieux !",
        "J'adore votre énergie positive !"
      ],
      excited: [
        "Votre excitation me donne envie d'en savoir plus !",
        "Cette passion est vraiment inspirante !"
      ],
      sad: [
        "Je sens que ce sujet vous touche personnellement",
        "Prenons le temps d'explorer cela ensemble"
      ],
      angry: [
        "Je comprends votre frustration",
        "Respirons ensemble et trouvons une solution"
      ],
      stressed: [
        "Vous semblez préoccupé, puis-je vous aider ?",
        "Prenons les choses étape par étape"
      ],
      calm: [
        "J'apprécie votre sérénité",
        "Votre calme m'aide à mieux vous accompagner"
      ],
      neutral: [
        "Comment puis-je mieux vous aider ?",
        "Y a-t-il quelque chose de spécifique qui vous intéresse ?"
      ]
    };

    return suggestions[emotion] || suggestions.neutral;
  }

  public getEmotionHistory(): EmotionAnalysis[] {
    return [...this.emotionHistory];
  }

  public getDominantEmotion(): EmotionAnalysis['emotion'] {
    if (this.emotionHistory.length === 0) return 'neutral';
    
    const emotionCounts = this.emotionHistory.reduce((acc, analysis) => {
      acc[analysis.emotion] = (acc[analysis.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as EmotionAnalysis['emotion'];
  }

  public stopAnalysis(): void {
    this.isAnalyzing = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
