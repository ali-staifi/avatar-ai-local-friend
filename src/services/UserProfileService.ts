
import { Intent } from './IntentRecognition';

export interface UserProfile {
  interests: string[];
  preferredStyle: string;
  expertise: Map<string, number>;
}

export class UserProfileService {
  private userProfile: UserProfile;

  constructor() {
    this.userProfile = {
      interests: [],
      preferredStyle: 'balanced',
      expertise: new Map()
    };
  }

  public getProfile(): UserProfile {
    return {
      interests: [...this.userProfile.interests],
      preferredStyle: this.userProfile.preferredStyle,
      expertise: new Map(this.userProfile.expertise)
    };
  }

  public updateUserProfile(intent: Intent, userInput: string, currentTopic?: string): void {
    // Detect interests
    this.detectInterests(userInput);
    
    // Evaluate expertise level
    this.evaluateExpertise(intent, currentTopic);
  }

  private detectInterests(userInput: string): void {
    const interestKeywords = ['j\'aime', 'je préfère', 'passionné', 'intéressé', 'adore'];
    
    for (const keyword of interestKeywords) {
      if (userInput.toLowerCase().includes(keyword)) {
        const afterKeyword = userInput.toLowerCase().substring(
          userInput.toLowerCase().indexOf(keyword) + keyword.length
        ).trim();
        const interest = afterKeyword.split(' ')[0];
        if (interest && !this.userProfile.interests.includes(interest)) {
          this.userProfile.interests.push(interest);
        }
      }
    }
  }

  private evaluateExpertise(intent: Intent, currentTopic?: string): void {
    if (!currentTopic) return;

    const currentLevel = this.userProfile.expertise.get(currentTopic) || 0;
    let newLevel = currentLevel;

    if (intent.name === 'explanation_request') {
      newLevel = Math.max(currentLevel - 0.1, 0); // Request for explanation = less expertise
    } else if (intent.name === 'opinion_request') {
      newLevel = Math.min(currentLevel + 0.1, 1); // Request for opinion = more expertise
    }

    this.userProfile.expertise.set(currentTopic, newLevel);
  }

  public getExpertiseLevel(topic: string): number {
    return this.userProfile.expertise.get(topic) || 0.5;
  }

  public getInterests(): string[] {
    return [...this.userProfile.interests];
  }

  public reset(): void {
    this.userProfile = {
      interests: [],
      preferredStyle: 'balanced',
      expertise: new Map()
    };
  }
}
