
export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
}

export interface Entity {
  entity: string;
  value: string;
  start: number;
  end: number;
}

export interface IntentPattern {
  name: string;
  patterns: string[];
  keywords: string[];
  entities: string[];
  priority: number;
}

export class IntentRecognition {
  private intents: IntentPattern[] = [
    {
      name: 'greeting',
      patterns: [
        'bonjour', 'salut', 'hello', 'coucou', 'bonsoir', 'bonne nuit'
      ],
      keywords: ['bonjour', 'salut', 'hello', 'hi', 'hey'],
      entities: [],
      priority: 1
    },
    {
      name: 'question',
      patterns: [
        'comment', 'pourquoi', 'quoi', 'qui', 'où', 'quand', 'combien'
      ],
      keywords: ['comment', 'pourquoi', 'quoi', 'qui', 'où', 'quand', 'combien', '?'],
      entities: ['topic'],
      priority: 2
    },
    {
      name: 'explanation_request',
      patterns: [
        'expliquer', 'explique', 'détailler', 'préciser', 'clarifier'
      ],
      keywords: ['expliquer', 'explique', 'détailler', 'préciser', 'clarifier'],
      entities: ['concept'],
      priority: 3
    },
    {
      name: 'opinion_request',
      patterns: [
        'que penses-tu', 'ton avis', 'opinion', 'crois-tu'
      ],
      keywords: ['opinion', 'avis', 'penses-tu', 'crois-tu'],
      entities: ['topic'],
      priority: 2
    },
    {
      name: 'help_request',
      patterns: [
        'aide', 'aider', 'help', 'assistance', 'support'
      ],
      keywords: ['aide', 'aider', 'help', 'assistance', 'support'],
      entities: ['problem'],
      priority: 3
    },
    {
      name: 'personal_info',
      patterns: [
        'tu es qui', 'qui es-tu', 'ton nom', 'comment tu t\'appelles'
      ],
      keywords: ['qui', 'nom', 'appelles', 'es-tu'],
      entities: [],
      priority: 1
    },
    {
      name: 'capability_inquiry',
      patterns: [
        'que peux-tu faire', 'tes capacités', 'fonctions', 'compétences'
      ],
      keywords: ['peux-tu', 'capacités', 'fonctions', 'compétences', 'faire'],
      entities: [],
      priority: 2
    },
    {
      name: 'goodbye',
      patterns: [
        'au revoir', 'bye', 'à bientôt', 'salut', 'goodbye'
      ],
      keywords: ['au revoir', 'bye', 'bientôt', 'goodbye'],
      entities: [],
      priority: 1
    }
  ];

  public recognizeIntent(text: string): Intent {
    const normalizedText = text.toLowerCase().trim();
    const words = normalizedText.split(/\s+/);
    
    let bestMatch: Intent = {
      name: 'unknown',
      confidence: 0.1,
      entities: []
    };

    for (const intentPattern of this.intents) {
      const confidence = this.calculateConfidence(normalizedText, words, intentPattern);
      
      if (confidence > bestMatch.confidence) {
        const entities = this.extractEntities(normalizedText, intentPattern);
        
        bestMatch = {
          name: intentPattern.name,
          confidence,
          entities
        };
      }
    }

    console.log(`🎯 Intent reconnu: ${bestMatch.name} (confiance: ${bestMatch.confidence.toFixed(2)})`);
    return bestMatch;
  }

  private calculateConfidence(text: string, words: string[], pattern: IntentPattern): number {
    let score = 0;
    let matches = 0;
    
    // Vérifier les mots-clés
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) {
        score += 0.3;
        matches++;
      }
    }
    
    // Vérifier les patterns
    for (const patternText of pattern.patterns) {
      if (text.includes(patternText)) {
        score += 0.4;
        matches++;
      }
    }
    
    // Bonus pour les correspondances exactes
    for (const word of words) {
      if (pattern.keywords.includes(word) || pattern.patterns.includes(word)) {
        score += 0.1;
      }
    }
    
    // Ajuster selon la priorité
    score *= (pattern.priority * 0.1 + 0.9);
    
    // Normaliser le score
    return Math.min(score, 1.0);
  }

  private extractEntities(text: string, pattern: IntentPattern): Entity[] {
    const entities: Entity[] = [];
    
    // Extraction d'entités simples basée sur les mots-clés
    if (pattern.entities.includes('topic')) {
      const topicKeywords = ['sur', 'de', 'à propos', 'concernant'];
      for (const keyword of topicKeywords) {
        const index = text.indexOf(keyword);
        if (index !== -1) {
          const afterKeyword = text.substring(index + keyword.length).trim();
          const firstWords = afterKeyword.split(' ').slice(0, 3).join(' ');
          if (firstWords) {
            entities.push({
              entity: 'topic',
              value: firstWords,
              start: index + keyword.length + 1,
              end: index + keyword.length + 1 + firstWords.length
            });
          }
        }
      }
    }
    
    return entities;
  }

  public addCustomIntent(intent: IntentPattern): void {
    this.intents.push(intent);
    console.log(`✅ Intention personnalisée ajoutée: ${intent.name}`);
  }
}
