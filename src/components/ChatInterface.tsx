import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@/types/speech';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onListeningChange,
  onSpeakingChange,
  onEmotionChange
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant avatar AI local. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
        onListeningChange(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        onListeningChange(false);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Impossible de capturer l'audio. Veuillez réessayer.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onListeningChange(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Reconnaissance vocale non supportée",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      onListeningChange(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      onListeningChange(true);
    }
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simuler l'IA conversationnelle locale
    setIsThinking(true);
    onEmotionChange('thinking');
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    setIsThinking(false);
    onEmotionChange('happy');

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

  const speak = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChange(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChange(false);
      onEmotionChange('neutral');
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Générer la réponse de l'IA
    try {
      const response = await generateResponse(messageText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Synthèse vocale de la réponse
      if (speechEnabled) {
        speak(response);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer une réponse. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Chat avec Avatar AI</span>
          <div className="flex gap-2">
            <Button
              variant={speechEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSpeechEnabled(!speechEnabled)}
            >
              {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 h-96">
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-bounce">🤔</div>
                    <span className="text-sm">Je réfléchis...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isListening || isSpeaking}
          />
          
          <Button
            variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            disabled={isSpeaking}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isListening || isSpeaking}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
