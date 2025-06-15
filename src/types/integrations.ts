
export type IntegrationType = 'multimodal' | 'weather' | 'news' | 'search' | 'plugin';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  enabled: boolean;
  config?: Record<string, any>;
  apiKey?: string;
}

export interface MultimodalCapability {
  images: boolean;
  documents: boolean;
  audio: boolean;
  video: boolean;
}

export interface ExternalAPIConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number; // en ms
  };
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  hooks: string[];
  config?: Record<string, any>;
}

export interface PluginContext {
  processMessage: (message: string) => Promise<string>;
  getConfig: () => Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
