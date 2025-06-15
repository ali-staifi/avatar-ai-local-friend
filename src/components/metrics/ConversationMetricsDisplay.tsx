
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { conversationMetrics, ConversationPattern } from '@/services/ConversationMetrics';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon, Clock, Users, TrendingUp } from 'lucide-react';

interface ConversationMetricsDisplayProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const ConversationMetricsDisplay: React.FC<ConversationMetricsDisplayProps> = ({
  isVisible,
  onToggle
}) => {
  const [patterns, setPatterns] = useState<ConversationPattern | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updatePatterns = () => {
      setPatterns(conversationMetrics.getConversationPatterns());
    };

    updatePatterns();

    if (isVisible) {
      const interval = setInterval(updatePatterns, 5000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-20 z-50"
        aria-label="Afficher les métriques conversationnelles"
      >
        <BarChartIcon className="h-4 w-4" />
        Métriques
      </Button>
    );
  }

  if (!patterns) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96">
        <Card>
          <CardContent className="p-4">
            <p>Chargement des métriques...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const personalityData = Object.entries(patterns.personalityUsage).map(([personality, usage]) => ({
    name: personality,
    value: usage
  }));

  const intentData = Object.entries(patterns.commonIntents)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([intent, count]) => ({
      name: intent,
      count
    }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const handleExportMetrics = () => {
    const data = conversationMetrics.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BarChartIcon className="h-4 w-4" />
              Métriques Conversationnelles
            </div>
            <Button onClick={onToggle} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Temps de réponse</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {patterns.averageResponseTime.toFixed(0)}ms
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">Satisfaction</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {patterns.satisfactionRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Utilisation des personnalités */}
          {personalityData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Personnalités utilisées
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={personalityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {personalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-1">
                {personalityData.map((entry, index) => (
                  <Badge key={entry.name} variant="outline" className="text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {entry.name} ({entry.value.toFixed(1)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Intents les plus fréquents */}
          {intentData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Intentions fréquentes</h4>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intentData}>
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Informations de session */}
          <div className="space-y-2">
            <h4 className="font-medium">Session actuelle</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Messages échangés:</span>
                <span className="font-mono">{patterns.messagesPerSession}</span>
              </div>
              <div className="flex justify-between">
                <span>Durée:</span>
                <span className="font-mono">{patterns.averageSessionDuration.toFixed(1)} min</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMetrics}
              className="flex-1"
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => conversationMetrics.clearMetrics()}
              className="flex-1"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
