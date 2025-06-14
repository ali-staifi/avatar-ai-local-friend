
import { SupportedLanguage } from '@/types/speechRecognition';

interface ResponseContext {
  language: SupportedLanguage;
  userInput: string;
  isGreeting?: boolean;
  isQuestion?: boolean;
}

export class SimpleResponseGenerator {
  private responses = {
    fr: {
      greetings: [
        "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        "Salut ! Que puis-je faire pour vous ?",
        "Bonsoir ! En quoi puis-je vous assister ?"
      ],
      location: [
        "Je suis un assistant virtuel, je n'ai pas d'adresse physique mais je suis ici pour vous aider !",
        "En tant qu'IA, j'existe dans le cloud, partout et nulle part à la fois !",
        "Je vis dans le monde numérique, toujours disponible pour vous accompagner."
      ],
      general: [
        "C'est une excellente question ! Pouvez-vous me donner plus de détails ?",
        "Intéressant ! J'aimerais en savoir plus sur ce que vous pensez.",
        "Je comprends votre point de vue. Développez un peu plus s'il vous plaît."
      ]
    },
    ar: {
      greetings: [
        "مرحبا! كيف يمكنني مساعدتك اليوم؟",
        "أهلا وسهلا! ماذا يمكنني أن أفعل لك؟",
        "مساء الخير! كيف يمكنني مساعدتك؟"
      ],
      location: [
        "أنا مساعد افتراضي، ليس لدي عنوان مادي ولكنني هنا لمساعدتك!",
        "كوني ذكاء اصطناعي، أعيش في العالم الرقمي، في كل مكان وفي أي مكان!",
        "أعيش في العالم الرقمي، متاح دائماً لمرافقتك ومساعدتك."
      ],
      general: [
        "سؤال ممتاز! هل يمكنك إعطائي المزيد من التفاصيل؟",
        "مثير للاهتمام! أود أن أعرف المزيد عما تفكر فيه.",
        "أفهم وجهة نظرك. هل يمكنك التوسع أكثر من فضلك؟"
      ]
    }
  };

  public generateResponse(context: ResponseContext): string {
    const { language, userInput } = context;
    const input = userInput.toLowerCase();
    
    console.log(`🤖 Génération de réponse en ${language} pour: "${userInput}"`);
    
    // Détection de salutations
    const greetingPatterns = {
      fr: ['bonjour', 'salut', 'bonsoir', 'hello', 'coucou'],
      ar: ['مرحبا', 'أهلا', 'سلام', 'صباح الخير', 'مساء الخير', 'أهلا وسهلا']
    };
    
    if (greetingPatterns[language].some(pattern => input.includes(pattern))) {
      return this.getRandomResponse(this.responses[language].greetings);
    }
    
    // Détection de questions sur l'emplacement
    const locationPatterns = {
      fr: ['où', 'habite', 'vis', 'demeure', 'résides', 'adresse'],
      ar: ['أين', 'تسكن', 'تعيش', 'تقيم', 'عنوانك', 'مكانك']
    };
    
    if (locationPatterns[language].some(pattern => input.includes(pattern))) {
      return this.getRandomResponse(this.responses[language].location);
    }
    
    // Réponse générale
    return this.getRandomResponse(this.responses[language].general);
  }
  
  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
