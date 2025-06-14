
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

    console.log(`🚀 Moteur de discussion avancé initialisé avec genre: ${gender}`);
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
    console.log('📝 Processing user input with advanced dialogue system:', input);
    
    this.stateManager.setProcessing(true, 'processing_input');
    this.stateManager.setEmotionalState('thinking');

    try {
      // 1. Reconnaissance d'intention
      console.log('🎯 Phase 1: Reconnaissance d\'intention');
      const intent = this.intentRecognition.recognizeIntent(input);
      
      // 2. Gestion du dialogue contextuel
      console.log('💬 Phase 2: Gestion du dialogue contextuel');
      const dialogueResponse = this.dialogueManager.processDialogue(intent, input);
      
      // 3. Amélioration de la réponse
      console.log('✨ Phase 3: Amélioration de la réponse');
      const enhancedResponse = this.responseEnhancer.enhanceResponse(
        dialogueResponse, 
        this.dialogueManager.getDialogueState()
      );
      
      // 4. Ajouter à la mémoire avec les données enrichies
      this.memoryManager.addMessage('user', input, dialogueResponse.contextualInfo, intent);
      this.memoryManager.addMessage('assistant', enhancedResponse.text, dialogueResponse.contextualInfo, intent, enhancedResponse);
      
      // 5. Mettre à jour l'état émotionnel
      this.stateManager.setProcessing(false);
      this.stateManager.setEmotionalState(enhancedResponse.emotion);

      console.log('🎉 Traitement avancé terminé:', {
        intent: intent.name,
        confidence: intent.confidence,
        emotion: enhancedResponse.emotion,
        followUps: enhancedResponse.followUpQuestions.length
      });

      return enhancedResponse.text;
    } catch (error) {
      console.error('❌ Erreur dans le moteur de discussion avancé:', error);
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
    return ConversationAnalyzer.generateInsights(
      this.memoryManager.getMemory(),
      this.dialogueManager
    );
  }
}
