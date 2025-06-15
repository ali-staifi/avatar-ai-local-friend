
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface NewsResult {
  articles: NewsArticle[];
  totalResults: number;
}

export class NewsAPI {
  public async process(query: string, config: any): Promise<NewsResult> {
    if (config.apiKey) {
      return await this.fetchRealNews(query, config);
    } else {
      return this.generateMockNews(query);
    }
  }

  private async fetchRealNews(query: string, config: any): Promise<NewsResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        country: config.country,
        category: config.category,
        pageSize: '5',
        apiKey: config.apiKey
      });

      const response = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur API actualités');
      }
      
      const data = await response.json();
      
      return {
        articles: data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage
        })),
        totalResults: data.totalResults
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      return this.generateMockNews(query);
    }
  }

  private generateMockNews(query: string): NewsResult {
    // Actualités simulées
    const mockArticles: NewsArticle[] = [
      {
        title: "Nouvelle avancée en intelligence artificielle",
        description: "Les chercheurs annoncent une percée majeure dans le domaine de l'IA conversationnelle.",
        url: "https://example.com/news1",
        source: "Tech News",
        publishedAt: new Date().toISOString()
      },
      {
        title: "Développements technologiques récents",
        description: "Les dernières innovations dans le secteur technologique transforment notre quotidien.",
        url: "https://example.com/news2",
        source: "Innovation Daily",
        publishedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        title: "Actualités scientifiques importantes",
        description: "De nouvelles découvertes scientifiques ouvrent de nouvelles perspectives.",
        url: "https://example.com/news3",
        source: "Science Today",
        publishedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    return {
      articles: mockArticles.slice(0, 3),
      totalResults: mockArticles.length
    };
  }
}
