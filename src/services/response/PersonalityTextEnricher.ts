
import { PersonalityTrait } from '@/types/personality';

export class PersonalityTextEnricher {
  public static enrichWithPersonality(
    text: string, 
    intent: string, 
    personality: PersonalityTrait
  ): string {
    let enrichedText = text;
    
    // Ajouter des expressions émotionnelles selon la tendance
    switch (personality.emotionalTendency) {
      case 'optimistic':
        enrichedText = this.addOptimisticMarkers(enrichedText, intent);
        break;
      case 'analytical':
        enrichedText = this.addAnalyticalMarkers(enrichedText, intent);
        break;
      case 'empathetic':
        enrichedText = this.addEmphaticMarkers(enrichedText, intent);
        break;
      case 'energetic':
        enrichedText = this.addEnergeticMarkers(enrichedText, intent);
        break;
      case 'calm':
        enrichedText = this.addCalmMarkers(enrichedText, intent);
        break;
    }

    // Ajouter une référence aux intérêts (30% de chance)
    if (Math.random() < 0.3) {
      const randomInterest = personality.interests[
        Math.floor(Math.random() * personality.interests.length)
      ];
      enrichedText += ` D'ailleurs, cela me rappelle mon intérêt pour ${randomInterest}.`;
    }

    return enrichedText;
  }

  private static addOptimisticMarkers(text: string, intent: string): string {
    const phrases = [
      ' C\'est formidable !',
      ' Quelle belle opportunité !',
      ' Je suis sûr que tout ira bien !',
      ' C\'est passionnant !'
    ];
    
    if (intent === 'question' || intent === 'help_request') {
      return text + phrases[Math.floor(Math.random() * phrases.length)];
    }
    return text;
  }

  private static addAnalyticalMarkers(text: string, intent: string): string {
    const phrases = [
      ' Examinons cela de plus près.',
      ' Il faut considérer plusieurs facteurs.',
      ' Analysons les implications.',
      ' D\'un point de vue logique...'
    ];
    
    if (intent === 'explanation_request' || intent === 'question') {
      return text + ' ' + phrases[Math.floor(Math.random() * phrases.length)];
    }
    return text;
  }

  private static addEmphaticMarkers(text: string, intent: string): string {
    const phrases = [
      ' Je comprends vos sentiments.',
      ' C\'est tout à fait naturel de se sentir ainsi.',
      ' Vos préoccupations sont légitimes.',
      ' Je suis là pour vous soutenir.'
    ];
    
    if (intent === 'help_request' || intent === 'opinion_request') {
      return text + ' ' + phrases[Math.floor(Math.random() * phrases.length)];
    }
    return text;
  }

  private static addEnergeticMarkers(text: string, intent: string): string {
    const phrases = [
      ' Allons-y avec enthousiasme !',
      ' C\'est le moment d\'agir !',
      ' Quelle énergie positive !',
      ' Fonçons dans cette aventure !'
    ];
    
    if (intent !== 'goodbye') {
      return text + ' ' + phrases[Math.floor(Math.random() * phrases.length)];
    }
    return text;
  }

  private static addCalmMarkers(text: string, intent: string): string {
    const phrases = [
      ' Prenons le temps de bien réfléchir.',
      ' Dans la sérénité, tout devient plus clair.',
      ' Respirons et avançons posément.',
      ' L\'équilibre est la clé.'
    ];
    
    return text + ' ' + phrases[Math.floor(Math.random() * phrases.length)];
  }
}
