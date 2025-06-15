
import { PersonalityTrait } from '@/types/personality';
import { Gender } from '@/types/gender';
import { IntentRecognition, Intent } from '@/services/IntentRecognition';
import { DialogueManager } from '@/services/DialogueManager';
import { ResponseEnhancer, EnhancedResponse } from '@/services/ResponseEnhancer';
import { ConversationMemoryManager } from '@/services/ConversationMemoryManager';
import { VoiceAnalysisEngine } from './VoiceAnalysisEngine';
import { EngineStateManager } from './EngineStateManager';

export class ConversationProcessor {
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;
  
  // Gestionnaires spécialisés
  private memoryManager: ConversationMemoryManager;
  
  // Services avancés
  private intentRecognition: IntentRecognition;
  private dialogueManager: DialogueManager;
  private responseEnhancer: ResponseEnhancer;

  constructor(
    personality: PersonalityTrait,
    gender: Gender,
    memoryManager: ConversationMemoryManager
  ) {
    this.currentPersonality = personality;
    this.currentGender = gender;
    this.memoryManager = memoryManager;
    
    // Initialiser les services avec le genre
    this.intentRecognition = new IntentRecognition();
    this.dialogueManager = new DialogueManager(this.currentPersonality, gender);
    this.responseEnhancer = new ResponseEnhancer(this.currentPersonality);
  }

  public setPersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    
    // Mettre à jour tous les services avec la nouvelle personnalité
    this.dialogueManager.updatePersonality(personality);
    this.responseEnhancer.updatePersonality(personality);
    
    console.log(`🎭 Personnalité changée vers: ${personality.name} (services mis à jour)`);
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
    this.dialogueManager.setGender(gender);
    console.log(`👤 Genre du processeur mis à jour: ${gender}`);
  }

  public async processUserInput(
    input: string,
    voiceAnalysisEngine: VoiceAnalysisEngine,
    stateManager: EngineStateManager
  ): Promise<string> {
    console.log('📝 Processing user input with intelligent dialogue system:', input);
    
    stateManager.setProcessing(true, 'processing_input');
    stateManager.setEmotionalState('thinking');

    try {
      // 0. Analyse de l'émotion vocale (si disponible)
      let voiceEmotion = null;
      const audioStream = voiceAnalysisEngine.getAudioStream();
      if (audioStream) {
        console.log('🎭 Phase 0: Analyse de l\'émotion vocale');
        voiceEmotion = await this.responseEnhancer.analyzeVoiceEmotion(audioStream);
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
      stateManager.setProcessing(false);
      stateManager.setEmotionalState(enhancedResponse.emotion);

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
      stateManager.setProcessing(false);
      stateManager.setEmotionalState('neutral');
      throw error;
    }
  }

  public getCurrentPersonality(): PersonalityTrait {
    return this.currentPersonality;
  }

  public getMemoryManager(): ConversationMemoryManager {
    return this.memoryManager;
  }

  public getDialogueManager(): DialogueManager {
    return this.dialogueManager;
  }

  public getResponseEnhancer(): ResponseEnhancer {
    return this.responseEnhancer;
  }

  public getLastIntentInfo(): Intent | undefined {
    const messages = this.memoryManager.getMessages();
    const lastMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    return lastMessage?.intent;
  }
}
