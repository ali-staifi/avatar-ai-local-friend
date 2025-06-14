
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking }) => {
  return (
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
  );
};
