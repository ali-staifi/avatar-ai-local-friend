
export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  forecast?: Array<{
    date: string;
    temperature: { min: number; max: number };
    description: string;
  }>;
}

export class WeatherAPI {
  public async process(query: string, config: any): Promise<WeatherData> {
    // Extraire la ville de la requête
    const location = this.extractLocation(query) || 'Paris';
    
    if (config.apiKey) {
      return await this.fetchRealWeather(location, config);
    } else {
      return this.generateMockWeather(location);
    }
  }

  private extractLocation(query: string): string | null {
    // Extraction simple de la ville
    const words = query.split(' ');
    const locationKeywords = ['à', 'de', 'pour', 'dans'];
    
    for (let i = 0; i < words.length; i++) {
      if (locationKeywords.includes(words[i].toLowerCase()) && i + 1 < words.length) {
        return words[i + 1];
      }
    }
    
    return null;
  }

  private async fetchRealWeather(location: string, config: any): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.apiKey}&units=${config.units}&lang=${config.language}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur API météo');
      }
      
      const data = await response.json();
      
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
      return this.generateMockWeather(location);
    }
  }

  private generateMockWeather(location: string): WeatherData {
    // Données météo simulées
    const conditions = [
      'ensoleillé', 'nuageux', 'partiellement nuageux', 
      'pluvieux', 'brumeux', 'venteux'
    ];
    
    return {
      location: location,
      temperature: Math.floor(Math.random() * 25) + 5, // 5-30°C
      description: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      forecast: Array.from({ length: 3 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        temperature: {
          min: Math.floor(Math.random() * 15) + 5,
          max: Math.floor(Math.random() * 15) + 15
        },
        description: conditions[Math.floor(Math.random() * conditions.length)]
      }))
    };
  }
}
