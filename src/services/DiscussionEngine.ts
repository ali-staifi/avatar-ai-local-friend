
import { PERSONALITY_TRAITS, PersonalityTrait, PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { DiscussionState, ConversationInsights, MemoryStats } from '@/types/discussionEngine';
import { ConversationMemoryManager } from './ConversationMemoryManager';
import { ConversationAnalyzer } from './ConversationAnalyzer';
import { VoiceAnalysisEngine } from './engine/VoiceAnalysisEngine';
import { EngineStateManager } from './engine/EngineStateManager';
import { ConversationProcessor } from './engine/ConversationProcessor';

export class DiscussionEngine {
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;

  // Gestionnaires spécialisés
  private memoryManager: ConversationMemoryManager;
  private voiceAnalysisEngine: VoiceAnalysisEngine;
  private stateManager: EngineStateManager;
  private conversationProcessor: ConversationProcessor;

  constructor(personalityId: PersonalityId = 'friendly', gender: Gender = 'male') {
    this.currentPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId) || PERSONALITY_TRAITS[0];
    this.currentGender = gender;
    
    // Initialiser les gestionnaires
    this.memoryManager = new ConversationMemoryManager();
    this.voiceAnalysisEngine = new VoiceAnalysisEngine();
    this.stateManager = new EngineStateManager();
    this.conversationProcessor = new ConversationProcessor(
      this.currentPersonality,
      gender,
      this.memoryManager
    );

    this.initializeEngine();

    console.log(`🚀 Moteur de discussion avancé initialisé avec intelligence conversationnelle et genre: ${gender}`);
  }

  private async initializeEngine(): Promise<void> {
    await this.voiceAnalysisEngine.initialize();
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
    this.conversationProcessor.setGender(gender);
    console.log(`👤 Genre du moteur mis à jour: ${gender}`);
  }

  public setInterruptionCallback(callback: () => void): void {
    this.stateManager.setInterruptionCallback(callback);
  }

  public setStateChangeCallback(callback: (state: DiscussionState) => void): void {
    this.stateManager.setStateChangeCallback(callback);
  }

  public setPersonality(personalityId: PersonalityId): void {
    const newPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId);
    if (newPersonality) {
      this.currentPersonality = newPersonality;
      this.conversationProcessor.setPersonality(newPersonality);
      
      console.log(`🎭 Personnalité changée vers: ${newPersonality.name} (services mis à jour)`);
    }
  }

  public getCurrentPersonality(): PersonalityTrait {
    return this.currentPersonality;
  }

  public async processUserInput(input: string): Promise<string> {
    return await this.conversationProcessor.processUserInput(
      input,
      this.voiceAnalysisEngine,
      this.stateManager
    );
  }

  public interrupt(): boolean {
    return this.stateManager.interrupt();
  }

  public getState(): DiscussionState {
    return this.stateManager.getState();
  }

  public getMemoryStats(): MemoryStats {
    return ConversationAnalyzer.generateMemoryStats(
      this.memoryManager.getMemory(),
      this.conversationProcessor.getDialogueManager()
    );
  }

  public exportMemory() {
    return {
      ...this.memoryManager.exportMemory(),
      stats: this.getMemoryStats(),
      dialogueState: this.conversationProcessor.getDialogueManager().getDialogueState(),
      personality: this.currentPersonality
    };
  }

  public getLastIntentInfo() {
    return this.conversationProcessor.getLastIntentInfo();
  }

  public getConversationInsights(): ConversationInsights {
    const baseInsights = ConversationAnalyzer.generateInsights(
      this.memoryManager.getMemory(),
      this.conversationProcessor.getDialogueManager()
    );

    // Enrichir avec les insights d'intelligence conversationnelle
    const responseEnhancer = this.conversationProcessor.getResponseEnhancer();
    const intelligentInsights = responseEnhancer.getConversationInsights();

    return {
      ...baseInsights,
      voiceEmotionAnalysis: {
        currentEmotion: intelligentInsights.dominantEmotion,
        emotionHistory: intelligentInsights.emotionHistory,
        emotionConfidence: intelligentInsights.emotionHistory.slice(-1)[0]?.confidence || 0
      },
      styleAdaptations: intelligentInsights.styleAdaptations,
      proactiveSuggestions: intelligentInsights.proactiveSuggestions
    };
  }

  public getEmotionHistory() {
    return this.conversationProcessor.getResponseEnhancer().getEmotionHistory();
  }

  public getCurrentEmotion() {
    return this.conversationProcessor.getResponseEnhancer().getCurrentEmotion();
  }

  public cleanup(): void {
    this.voiceAnalysisEngine.cleanup();
  }
}
