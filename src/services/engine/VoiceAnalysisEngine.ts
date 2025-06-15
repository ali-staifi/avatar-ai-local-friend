
export class VoiceAnalysisEngine {
  private audioStream: MediaStream | null = null;

  public async initialize(): Promise<void> {
    try {
      // Demander l'accès au microphone pour l'analyse émotionnelle
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Analyse vocale émotionnelle activée');
    } catch (error) {
      console.warn('⚠️ Impossible d\'activer l\'analyse vocale:', error);
      // Continuer sans l'analyse vocale si l'utilisateur refuse l'accès
    }
  }

  public getAudioStream(): MediaStream | null {
    return this.audioStream;
  }

  public cleanup(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }
}
