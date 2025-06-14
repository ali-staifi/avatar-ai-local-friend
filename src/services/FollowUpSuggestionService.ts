
import { Intent } from './IntentRecognition';

export class FollowUpSuggestionService {
  public generateFollowUpSuggestions(lastIntent?: Intent, currentTopic?: string): string[] {
    const suggestions: string[] = [];
    const intentName = lastIntent?.name;

    switch (intentName) {
      case 'question':
        suggestions.push('Pouvez-vous me donner plus de détails ?');
        suggestions.push('Y a-t-il autre chose que vous aimeriez savoir ?');
        if (currentTopic) {
          suggestions.push(`Voulez-vous explorer d'autres aspects de ${currentTopic} ?`);
        }
        break;

      case 'explanation_request':
        suggestions.push('Cette explication vous semble-t-elle claire ?');
        suggestions.push('Avez-vous des questions sur ce point ?');
        suggestions.push('Voulez-vous un exemple concret ?');
        break;

      case 'opinion_request':
        suggestions.push('Quelle est votre opinion sur ce sujet ?');
        suggestions.push('Êtes-vous d\'accord avec cette perspective ?');
        suggestions.push('Avez-vous une expérience personnelle à partager ?');
        break;

      case 'greeting':
        suggestions.push('De quoi aimeriez-vous parler aujourd\'hui ?');
        suggestions.push('Y a-t-il quelque chose en particulier qui vous intéresse ?');
        break;

      default:
        suggestions.push('Que pensez-vous de ce sujet ?');
        suggestions.push('Avez-vous d\'autres questions ?');
        break;
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}
