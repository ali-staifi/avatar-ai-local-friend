
export type SpeechEngine = 'web-speech' | 'vosk';
export type SupportedLanguage = 'fr' | 'ar';
export type EngineStatus = 'ready' | 'loading' | 'error';

export interface HybridSpeechConfig {
  engine: SpeechEngine;
  language: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  vadEnabled?: boolean;
}

export interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export interface EngineInfo {
  webSpeech: {
    supported: boolean;
    available: boolean;
    description: string;
  };
  vosk: {
    supported: boolean;
    available: boolean;
    description: string;
    modelProgress?: any;
  };
  vad: {
    supported: boolean;
    enabled: boolean;
    status: 'ready' | 'listening';
    bufferStatus?: {
      bufferUsage: number;
      isInVoiceSegment: boolean;
      voiceDuration: number;
      silenceDuration: number;
    };
  };
}
