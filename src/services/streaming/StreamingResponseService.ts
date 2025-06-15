
import { EnhancedResponse } from '@/types/responseEnhancer';

export interface StreamingChunk {
  id: string;
  content: string;
  isComplete: boolean;
  timestamp: Date;
  metadata?: {
    emotion?: 'neutral' | 'happy' | 'thinking' | 'listening';
    followUpQuestions?: string[];
  };
}

export class StreamingResponseService {
  private currentStreamId: string | null = null;
  private chunks: Map<string, StreamingChunk[]> = new Map();

  public async streamResponse(
    response: EnhancedResponse,
    onChunk: (chunk: StreamingChunk) => void,
    chunkSize: number = 30
  ): Promise<void> {
    const streamId = this.generateStreamId();
    this.currentStreamId = streamId;
    this.chunks.set(streamId, []);

    const words = response.text.split(' ');
    const totalChunks = Math.ceil(words.length / chunkSize);

    console.log(`🌊 Démarrage streaming réponse: ${words.length} mots en ${totalChunks} chunks`);

    for (let i = 0; i < totalChunks; i++) {
      // Vérifier si le streaming n'a pas été interrompu
      if (this.currentStreamId !== streamId) {
        console.log('🛑 Streaming interrompu');
        return;
      }

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, words.length);
      const chunkWords = words.slice(start, end);
      const content = chunkWords.join(' ');

      const chunk: StreamingChunk = {
        id: `${streamId}_${i}`,
        content,
        isComplete: i === totalChunks - 1,
        timestamp: new Date(),
        metadata: i === totalChunks - 1 ? {
          emotion: response.emotion,
          followUpQuestions: response.followUpQuestions
        } : undefined
      };

      this.chunks.get(streamId)?.push(chunk);
      onChunk(chunk);

      // Simuler un délai naturel entre les chunks (30-80ms)
      if (i < totalChunks - 1) {
        await this.delay(30 + Math.random() * 50);
      }
    }

    console.log(`✅ Streaming terminé pour: ${streamId}`);
  }

  public stopCurrentStream(): void {
    if (this.currentStreamId) {
      console.log(`🛑 Arrêt du streaming: ${this.currentStreamId}`);
      this.currentStreamId = null;
    }
  }

  public getStreamChunks(streamId: string): StreamingChunk[] {
    return this.chunks.get(streamId) || [];
  }

  public clearOldStreams(maxAge: number = 300000): void {
    const now = Date.now();
    const streamsToDelete: string[] = [];

    this.chunks.forEach((chunks, streamId) => {
      const lastChunk = chunks[chunks.length - 1];
      if (lastChunk && now - lastChunk.timestamp.getTime() > maxAge) {
        streamsToDelete.push(streamId);
      }
    });

    streamsToDelete.forEach(streamId => {
      this.chunks.delete(streamId);
    });

    if (streamsToDelete.length > 0) {
      console.log(`🧹 Nettoyage de ${streamsToDelete.length} anciens streams`);
    }
  }

  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
