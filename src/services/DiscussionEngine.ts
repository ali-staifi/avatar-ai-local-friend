import { PERSONALITY_TRAITS, PersonalityTrait, PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { DiscussionState, ConversationInsights, MemoryStats } from '@/types/discussionEngine';
import { IntentRecognition, Intent } from './IntentRecognition';
import { DialogueManager } from './DialogueManager';
import { ResponseEnhancer, EnhancedResponse } from './ResponseEnhancer';
import { ConversationMemoryManager } from './ConversationMemoryManager';
import { DiscussionStateManager } from './DiscussionStateManager';
import { ConversationAnalyzer } from './ConversationAnalyzer';

export class DiscussionEngine {
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;
  private interruptionCallback?: () => void;

  // Gestionnaires spécialisés
  private memoryManager: ConversationMemoryManager;
  private stateManager: DiscussionStateManager;
  
  // Services avancés
  private intentRecognition: IntentRecognition;
  private dialogueManager: DialogueManager;
  private responseEnhancer: ResponseEnhancer;

  // État de l'intelligence conversationnelle
  private audioStream: MediaStream | null = null;

  constructor(personalityId: PersonalityId = 'friendly', gender: Gender = 'male') {
    this.currentPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId) || PERSONALITY_TRAITS[0];
    this.currentGender = gender;
    
    // Initialiser les gestionnaires
    this.memoryManager = new ConversationMemoryManager();
    this.stateManager = new DiscussionStateManager();
    
    // Initialiser les services avec le genre
    this.intentRecognition = new IntentRecognition();
    this.dialogueManager = new DialogueManager(this.currentPersonality, gender);
    this.responseEnhancer = new ResponseEnhancer(this.currentPersonality);

    this.initializeVoiceAnalysis();

    console.log(`🚀 Moteur de discussion avancé initialisé avec intelligence conversationnelle et genre: ${gender}`);
  }

  private async initializeVoiceAnalysis(): Promise<void> {
    try {
      // Demander l'accès au microphone pour l'analyse émotionnelle
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Analyse vocale émotionnelle activée');
    } catch (error) {
      console.warn('⚠️ Impossible d\'activer l\'analyse vocale:', error);
      // Continuer sans l'analyse vocale si l'utilisateur refuse l'accès
    }
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
    this.dialogueManager.setGender(gender);
    console.log(`👤 Genre du moteur mis à jour: ${gender}`);
  }

  public setInterruptionCallback(callback: () => void): void {
    this.interruptionCallback = callback;
  }

  public setStateChangeCallback(callback: (state: DiscussionState) => void): void {
    this.stateManager.setStateChangeCallback(callback);
  }

  public setPersonality(personalityId: PersonalityId): void {
    const newPersonality = PERSONALITY_TRAITS.find(p => p.id === personalityId);
    if (newPersonality) {
      this.currentPersonality = newPersonality;
      
      // Mettre à jour tous les services avec la nouvelle personnalité
      this.dialogueManager.updatePersonality(newPersonality);
      this.responseEnhancer.updatePersonality(newPersonality);
      
      console.log(`🎭 Personnalité changée vers: ${newPersonality.name} (services mis à jour)`);
    }
  }

  public getCurrentPersonality(): PersonalityTrait {
    return this.currentPersonality;
  }

  public async processUserInput(input: string): Promise<string> {
    console.log('📝 Processing user input with intelligent dialogue system:', input);
    
    this.stateManager.setProcessing(true, 'processing_input');
    this.stateManager.setEmotionalState('thinking');

    try {
      // 0. Analyse de l'émotion vocale (si disponible)
      let voiceEmotion = null;
      if (this.audioStream) {
        console.log('🎭 Phase 0: Analyse de l\'émotion vocale');
        voiceEmotion = await this.responseEnhancer.analyzeVoiceEmotion(this.audioStream);
      }

      // 1. Reconnaissance d'intention
      console.log('🎯 Phase 1: Reconnaissance d\'intention');
      const intent = this.intentRecognition.recognizeIntent(input);
      
      // 2. Gestion du dialogue contextuel
      console.log('💬 Phase 2: Gestion du dialogue contextuel intelligent');
      const dialogueResponse = this.dialogueManager.processDialogue(intent, input);
      
      // 3. Amélioration de la réponse avec intelligence conversationnelle
      console.log('✨ Phase 3: Amélioration intelligente de la réponse');
      const enhancedResponse = this.responseEnhancer.enhanceResponse(
        dialogueResponse, 
        this.dialogueManager.getDialogueState()
      );
      
      // 4. Ajouter à la mémoire avec les données enrichies et l'analyse émotionnelle
      this.memoryManager.addMessage('user', input, dialogueResponse.contextualInfo, intent);
      this.memoryManager.addMessage('assistant', enhancedResponse.text, dialogueResponse.contextualInfo, intent, enhancedResponse);
      
      // 5. Mettre à jour l'état émotionnel (basé sur l'analyse intelligente)
      this.stateManager.setProcessing(false);
      this.stateManager.setEmotionalState(enhancedResponse.emotion);

      console.log('🎉 Traitement intelligent terminé:', {
        intent: intent.name,
        confidence: intent.confidence,
        emotion: enhancedResponse.emotion,
        voiceEmotion: voiceEmotion?.emotion,
        followUps: enhancedResponse.followUpQuestions.length,
        intelligentHints: enhancedResponse.contextualHints.filter(h => h.includes('💡')).length
      });

      return enhancedResponse.text;
    } catch (error) {
      console.error('❌ Erreur dans le moteur de discussion intelligent:', error);
      this.stateManager.setProcessing(false);
      this.stateManager.setEmotionalState('neutral');
      throw error;
    }
  }

  public interrupt(): boolean {
    if (this.stateManager.canInterrupt()) {
      console.log('🔄 Interruption détectée et acceptée par le moteur avancé');
      this.stateManager.setProcessing(false);
      this.stateManager.setEmotionalState('listening');
      this.interruptionCallback?.();
      return true;
    }
    
    console.log('⚠️ Interruption ignorée - traitement critique en cours');
    return false;
  }

  public getState(): DiscussionState {
    return this.stateManager.getState();
  }

  public getMemoryStats(): MemoryStats {
    return ConversationAnalyzer.generateMemoryStats(
      this.memoryManager.getMemory(),
      this.dialogueManager
    );
  }

  public exportMemory() {
    return {
      ...this.memoryManager.exportMemory(),
      stats: this.getMemoryStats(),
      dialogueState: this.dialogueManager.getDialogueState(),
      personality: this.currentPersonality
    };
  }

  public getLastIntentInfo(): Intent | undefined {
    const messages = this.memoryManager.getMessages();
    const lastMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    return lastMessage?.intent;
  }

  public getConversationInsights(): ConversationInsights {
    const baseInsights = ConversationAnalyzer.generateInsights(
      this.memoryManager.getMemory(),
      this.dialogueManager
    );

    // Enrichir avec les insights d'intelligence conversationnelle
    const intelligentInsights = this.responseEnhancer.getConversationInsights();

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
    return this.responseEnhancer.getEmotionHistory();
  }

  public getCurrentEmotion() {
    return this.responseEnhancer.getCurrentEmotion();
  }

  public cleanup(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }
}
