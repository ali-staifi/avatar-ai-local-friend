
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX } from 'lucide-react';

interface ChatHeaderProps {
  speechEnabled: boolean;
  onToggleSpeech: (enabled: boolean) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  speechEnabled,
  onToggleSpeech
}) => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between">
        <span>Chat avec Avatar AI</span>
        <div className="flex gap-2">
          <Button
            variant={speechEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSpeech(!speechEnabled)}
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
