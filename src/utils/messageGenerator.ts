
export const generateResponse = async (userMessage: string): Promise<string> => {
  // Simuler l'IA conversationnelle locale
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses = [
    `C'est une excellente question ! Basé sur "${userMessage}", je pense que...`,
    `Intéressant ! Concernant "${userMessage}", voici mon analyse :`,
    `Je comprends votre point sur "${userMessage}". Permettez-moi de réfléchir à cela...`,
    `Bonne observation ! En relation avec "${userMessage}", je dirais que...`,
    `Merci pour cette question sur "${userMessage}". Voici ma réponse :`
  ];

  const contexts = [
    "D'après mes données d'entraînement, cette approche est généralement efficace.",
    "Cela dépend du contexte, mais en général, je recommanderais cette solution.",
    "C'est un domaine complexe, mais voici une approche pratique.",
    "Basé sur les meilleures pratiques, voici ce que je suggère.",
    "Il y a plusieurs façons d'aborder cela, mais voici la plus simple."
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
  
  return `${randomResponse} ${randomContext}`;
};
