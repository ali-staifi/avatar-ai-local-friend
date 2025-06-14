
export interface VADOptions {
  sampleRate: number;
  frameSize: number; // en ms (10, 20, ou 30)
  aggressiveness: number; // 0-3 (0=moins agressif, 3=plus agressif)
  bufferDuration: number; // durée du buffer circulaire en ms
  silenceThreshold: number; // seuil de silence en ms
  voiceThreshold: number; // seuil de voix en ms
}

export interface VADResult {
  isVoice: boolean;
  audioSegment: Float32Array;
  confidence: number;
  timestamp: number;
}

export interface CircularBuffer {
  buffer: Float32Array[];
  writeIndex: number;
  size: number;
  isFull: boolean;
}

export class VoiceActivityDetector {
  private options: VADOptions;
  private vadContext: any = null;
  private circularBuffer: CircularBuffer;
  private voiceStartTime: number = 0;
  private silenceStartTime: number = 0;
  private isInVoiceSegment: boolean = false;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private callbacks: Set<(result: VADResult) => void> = new Set();
  
  constructor(options: Partial<VADOptions> = {}) {
    this.options = {
      sampleRate: 16000,
      frameSize: 30, // 30ms frames
      aggressiveness: 2,
      bufferDuration: 2000, // 2 secondes de buffer
      silenceThreshold: 500, // 500ms de silence pour arrêter
      voiceThreshold: 200, // 200ms de voix pour commencer
      ...options
    };

    const bufferSize = Math.floor(this.options.bufferDuration / this.options.frameSize);
    this.circularBuffer = {
      buffer: new Array(bufferSize),
      writeIndex: 0,
      size: bufferSize,
      isFull: false
    };

    console.log('🎯 VAD initialisé avec:', this.options);
  }

  public async initialize(): Promise<boolean> {
    try {
      // Dans un vrai environnement, on utiliserait webrtcvad
      // Pour cette démo, on simule le VAD avec une logique simplifiée
      console.log('🎤 VAD simulé initialisé (webrtcvad requis pour production)');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation VAD:', error);
      return false;
    }
  }

  public onVoiceDetected(callback: (result: VADResult) => void): void {
    this.callbacks.add(callback);
  }

  public offVoiceDetected(callback: (result: VADResult) => void): void {
    this.callbacks.delete(callback);
  }

  private notifyCallbacks(result: VADResult): void {
    this.callbacks.forEach(callback => callback(result));
  }

  public async startListening(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.options.sampleRate
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const source = this.audioContext.createMediaStreamSource(stream);
      this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);

      this.processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        this.processAudioFrame(audioData);
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      console.log('🎤 VAD écoute démarrée');
    } catch (error) {
      console.error('❌ Erreur démarrage VAD:', error);
      throw error;
    }
  }

  public stopListening(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Finaliser le segment en cours si nécessaire
    if (this.isInVoiceSegment) {
      this.finalizeVoiceSegment();
    }

    console.log('🛑 VAD écoute arrêtée');
  }

  private processAudioFrame(audioData: Float32Array): void {
    // Ajouter au buffer circulaire
    this.addToCircularBuffer(audioData);

    // Simuler la détection VAD (en production, utiliser webrtcvad)
    const isVoice = this.simulateVAD(audioData);
    const timestamp = Date.now();

    if (isVoice) {
      if (!this.isInVoiceSegment) {
        // Début d'un segment vocal
        if (this.voiceStartTime === 0) {
          this.voiceStartTime = timestamp;
        } else if (timestamp - this.voiceStartTime >= this.options.voiceThreshold) {
          // Seuil de voix atteint, commencer l'enregistrement
          this.isInVoiceSegment = true;
          this.silenceStartTime = 0;
          console.log('🗣️ Début segment vocal détecté');
        }
      } else {
        // Reset le compteur de silence
        this.silenceStartTime = 0;
      }
    } else {
      // Silence détecté
      if (this.isInVoiceSegment) {
        if (this.silenceStartTime === 0) {
          this.silenceStartTime = timestamp;
        } else if (timestamp - this.silenceStartTime >= this.options.silenceThreshold) {
          // Seuil de silence atteint, finaliser le segment
          this.finalizeVoiceSegment();
        }
      } else {
        // Reset le compteur de voix si pas encore en segment
        this.voiceStartTime = 0;
      }
    }
  }

  private simulateVAD(audioData: Float32Array): boolean {
    // Calcul simple d'énergie pour simuler webrtcvad
    let energy = 0;
    for (let i = 0; i < audioData.length; i++) {
      energy += audioData[i] * audioData[i];
    }
    energy = Math.sqrt(energy / audioData.length);
    
    // Seuil adaptatif basé sur l'agressivité
    const threshold = 0.01 + (this.options.aggressiveness * 0.005);
    return energy > threshold;
  }

  private addToCircularBuffer(audioData: Float32Array): void {
    // Copier les données audio dans le buffer circulaire
    this.circularBuffer.buffer[this.circularBuffer.writeIndex] = new Float32Array(audioData);
    
    this.circularBuffer.writeIndex = (this.circularBuffer.writeIndex + 1) % this.circularBuffer.size;
    
    if (this.circularBuffer.writeIndex === 0) {
      this.circularBuffer.isFull = true;
    }
  }

  private finalizeVoiceSegment(): void {
    console.log('✅ Finalisation segment vocal');
    
    // Extraire le segment audio du buffer circulaire
    const audioSegment = this.extractAudioSegment();
    
    const result: VADResult = {
      isVoice: true,
      audioSegment,
      confidence: 0.8, // Confiance simulée
      timestamp: Date.now()
    };

    // Notifier les callbacks avec le segment audio
    this.notifyCallbacks(result);

    // Reset des états
    this.isInVoiceSegment = false;
    this.voiceStartTime = 0;
    this.silenceStartTime = 0;
  }

  private extractAudioSegment(): Float32Array {
    const frames: Float32Array[] = [];
    
    if (this.circularBuffer.isFull) {
      // Extraire depuis writeIndex (le plus ancien) jusqu'à la fin
      for (let i = this.circularBuffer.writeIndex; i < this.circularBuffer.size; i++) {
        if (this.circularBuffer.buffer[i]) {
          frames.push(this.circularBuffer.buffer[i]);
        }
      }
    }
    
    // Extraire depuis le début jusqu'à writeIndex
    for (let i = 0; i < this.circularBuffer.writeIndex; i++) {
      if (this.circularBuffer.buffer[i]) {
        frames.push(this.circularBuffer.buffer[i]);
      }
    }

    // Concaténer tous les frames en un seul segment
    if (frames.length === 0) {
      return new Float32Array(0);
    }

    const totalLength = frames.reduce((acc, frame) => acc + frame.length, 0);
    const result = new Float32Array(totalLength);
    
    let offset = 0;
    for (const frame of frames) {
      result.set(frame, offset);
      offset += frame.length;
    }

    console.log(`🎵 Segment audio extrait: ${result.length} échantillons (${(result.length / this.options.sampleRate).toFixed(2)}s)`);
    return result;
  }

  public getBufferStatus(): {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  } {
    const now = Date.now();
    return {
      bufferUsage: this.circularBuffer.isFull ? 100 : (this.circularBuffer.writeIndex / this.circularBuffer.size) * 100,
      isInVoiceSegment: this.isInVoiceSegment,
      voiceDuration: this.voiceStartTime > 0 ? now - this.voiceStartTime : 0,
      silenceDuration: this.silenceStartTime > 0 ? now - this.silenceStartTime : 0
    };
  }

  public destroy(): void {
    this.stopListening();
    this.callbacks.clear();
    console.log('🗑️ VAD détruit');
  }
}
