
import { Intent } from './IntentRecognition';
import { PersonalityTrait, PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { DialogueStateService, DialogueState } from './DialogueStateService';
import { UserProfileService } from './UserProfileService';
import { ResponseGenerationService } from './ResponseGenerationService';
import { FollowUpSuggestionService } from './FollowUpSuggestionService';

export interface DialogueResponse {
  text: string;
  intent: string;
  confidence: number;
  followUpSuggestions: string[];
  contextualInfo?: string;
}

export class DialogueManager {
  private dialogueStateService: DialogueStateService;
  private userProfileService: UserProfileService;
  private responseGenerationService: ResponseGenerationService;
  private followUpSuggestionService: FollowUpSuggestionService;
  private currentPersonality: PersonalityTrait;
  private currentGender: Gender;

  constructor(personality: PersonalityTrait, gender: Gender = 'male') {
    this.currentPersonality = personality;
    this.currentGender = gender;
    
    // Initialize services
    this.dialogueStateService = new DialogueStateService();
    this.userProfileService = new UserProfileService();
    this.responseGenerationService = new ResponseGenerationService(personality, gender);
    this.followUpSuggestionService = new FollowUpSuggestionService();

    console.log(`🎭 Gestionnaire de dialogue mis à jour avec la personnalité: ${personality.name}`);
  }

  public updatePersonality(personality: PersonalityTrait): void {
    this.currentPersonality = personality;
    this.responseGenerationService.updatePersonality(personality);
    console.log(`🎭 Gestionnaire de dialogue mis à jour avec la personnalité: ${personality.name}`);
  }

  public setGender(gender: Gender): void {
    this.currentGender = gender;
    this.responseGenerationService.setGender(gender);
    console.log(`👤 Genre du gestionnaire de dialogue mis à jour: ${gender}`);
  }

  public processDialogue(intent: Intent, userInput: string): DialogueResponse {
    // Update dialogue state
    this.dialogueStateService.updateDialogueState(intent, userInput);
    
    // Update user profile
    this.userProfileService.updateUserProfile(
      intent, 
      userInput, 
      this.dialogueStateService.getCurrentTopic()
    );
    
    // Generate contextual response
    const response = this.responseGenerationService.generateContextualResponse(
      intent,
      userInput,
      this.dialogueStateService.getCurrentTopic(),
      this.userProfileService
    );
    
    // Generate follow-up suggestions
    const followUpSuggestions = this.followUpSuggestionService.generateFollowUpSuggestions(
      this.dialogueStateService.getLastIntent(),
      this.dialogueStateService.getCurrentTopic()
    );
    
    console.log(`💬 Réponse du gestionnaire de dialogue (${this.currentGender}):`, {
      intent: intent.name,
      confidence: intent.confidence,
      followUps: followUpSuggestions.length
    });
    
    return {
      text: response,
      intent: intent.name,
      confidence: intent.confidence,
      followUpSuggestions,
      contextualInfo: this.dialogueStateService.getContextualInfo()
    };
  }

  public getDialogueState(): DialogueState {
    return this.dialogueStateService.getState();
  }

  public resetDialogue(): void {
    this.dialogueStateService.reset();
    this.userProfileService.reset();
    console.log('🔄 État du dialogue réinitialisé');
  }
}
