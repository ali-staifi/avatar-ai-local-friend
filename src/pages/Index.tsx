
import React, { useState } from 'react';
import { Avatar3D } from '@/components/Avatar3D';
import { ChatInterface } from '@/components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking'>('neutral');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Avatar AI Local - Version PC
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Assistant avatar 3D avec IA conversationnelle, reconnaissance vocale et synthèse vocale
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">🎤 Reconnaissance Vocale</Badge>
            <Badge variant="secondary">🔊 Synthèse Vocale</Badge>
            <Badge variant="secondary">🤖 IA Locale</Badge>
            <Badge variant="secondary">🎮 Avatar 3D</Badge>
            <Badge variant="secondary">🔒 100% Privé</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Avatar Section */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Avatar 3D Interactif</span>
                <div className="flex gap-2">
                  {isListening && <Badge variant="destructive">🔴 Écoute</Badge>}
                  {isSpeaking && <Badge variant="default">🔊 Parle</Badge>}
                  {emotion === 'thinking' && <Badge variant="secondary">🤔 Réfléchit</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Avatar3D 
                isListening={isListening}
                isSpeaking={isSpeaking}
                emotion={emotion}
              />
              
              {/* Status Info */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">État du système :</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reconnaissance vocale :</span>
                    <span className={isListening ? 'text-red-500' : 'text-green-500'}>
                      {isListening ? 'Active' : 'Prête'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Synthèse vocale :</span>
                    <span className={isSpeaking ? 'text-blue-500' : 'text-green-500'}>
                      {isSpeaking ? 'Active' : 'Prête'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>État émotionnel :</span>
                    <span className="capitalize text-purple-500">{emotion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modèles IA :</span>
                    <span className="text-green-500">Locaux</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <ChatInterface
            onListeningChange={setIsListening}
            onSpeakingChange={setIsSpeaking}
            onEmotionChange={setEmotion}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🎯 Fonctionnalités</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Chat conversationnel intelligent</li>
                <li>• Reconnaissance vocale en temps réel</li>
                <li>• Synthèse vocale naturelle</li>
                <li>• Avatar 3D animé et expressif</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">🔒 Confidentialité</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Traitement 100% local</li>
                <li>• Aucune donnée envoyée en ligne</li>
                <li>• Modèles IA embarqués</li>
                <li>• Respect total de la vie privée</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">⚡ Performance</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Réponses en temps réel</li>
                <li>• Optimisé pour navigateurs modernes</li>
                <li>• Rendu 3D fluide</li>
                <li>• Interface réactive</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
