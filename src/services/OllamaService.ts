
export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  modified_at: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.warn('🦙 Ollama non disponible:', error);
      return false;
    }
  }

  async getModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('🦙 Modèles Ollama récupérés:', data.models?.length || 0);
      return data.models || [];
    } catch (error) {
      console.error('❌ Erreur récupération modèles Ollama:', error);
      return [];
    }
  }

  async generateResponse(
    model: string,
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      system?: string;
    } = {}
  ): Promise<string> {
    try {
      console.log(`🦙 Génération avec ${model}:`, prompt.substring(0, 100));
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          system: options.system,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 500,
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      console.log('✅ Réponse Ollama générée');
      return data.response || 'Aucune réponse générée';
    } catch (error) {
      console.error('❌ Erreur génération Ollama:', error);
      throw new Error(`Impossible de générer une réponse avec Ollama: ${error}`);
    }
  }

  async chatCompletion(
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<string> {
    try {
      console.log(`🦙 Chat completion avec ${model}:`, messages.length, 'messages');
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 500,
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama Chat: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Chat completion Ollama terminé');
      return data.message?.content || 'Aucune réponse générée';
    } catch (error) {
      console.error('❌ Erreur chat completion Ollama:', error);
      throw new Error(`Impossible de compléter le chat avec Ollama: ${error}`);
    }
  }
}
