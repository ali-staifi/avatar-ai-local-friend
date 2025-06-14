
import { PersonalityTrait } from '@/types/personality';

export class FollowUpGenerator {
  public static generateIntelligentFollowUps(
    intent: string, 
    context: any, 
    personality: PersonalityTrait
  ): string[] {
    const followUps: string[] = [];

    // Questions basées sur l'intention
    this.addIntentBasedQuestions(followUps, intent, personality);
    
    // Questions basées sur les intérêts de la personnalité
    this.addPersonalityBasedQuestions(followUps, context, personality);

    return followUps.slice(0, 3);
  }

  private static addIntentBasedQuestions(
    followUps: string[], 
    intent: string, 
    personality: PersonalityTrait
  ): void {
    switch (intent) {
      case 'question':
        followUps.push('Souhaitez-vous que j\'approfondisse un aspect particulier ?');
        followUps.push('Y a-t-il des exemples concrets qui vous intéresseraient ?');
        if (personality.emotionalTendency === 'analytical') {
          followUps.push('Voulez-vous analyser les implications de cette réponse ?');
        }
        break;

      case 'explanation_request':
        followUps.push('Cette explication répond-elle à vos attentes ?');
        followUps.push('Avez-vous besoin de clarifications sur certains points ?');
        if (personality.emotionalTendency === 'empathetic') {
          followUps.push('Comment vous sentez-vous par rapport à cette explication ?');
        }
        break;

      case 'opinion_request':
        followUps.push('Partagez-vous cette perspective ?');
        followUps.push('Quelle est votre expérience personnelle sur ce sujet ?');
        followUps.push('Y a-t-il d\'autres angles à considérer ?');
        break;

      case 'help_request':
        followUps.push('Avez-vous besoin d\'aide sur d\'autres aspects ?');
        followUps.push('Cette solution vous semble-t-elle réalisable ?');
        if (personality.emotionalTendency === 'energetic') {
          followUps.push('Êtes-vous prêt à passer à l\'action ?');
        }
        break;
    }
  }

  private static addPersonalityBasedQuestions(
    followUps: string[], 
    context: any, 
    personality: PersonalityTrait
  ): void {
    if (context.currentTopic) {
      const relatedInterest = personality.interests.find(interest => 
        context.currentTopic.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (relatedInterest) {
        followUps.push(`Aimeriez-vous explorer le lien avec ${relatedInterest} ?`);
      }
    }
  }
}
