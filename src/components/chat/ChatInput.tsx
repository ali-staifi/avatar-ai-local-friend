import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send, X, Upload } from 'lucide-react';
import { SpeechEngine, SupportedLanguage } from '@/types/speechRecognition';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  canBeInterrupted: boolean;
  currentEngine: SpeechEngine;
  engineStatus: 'ready' | 'loading' | 'error';
  currentLanguage: SupportedLanguage;
  vadEnabled?: boolean;
  vadSupported?: boolean;
  vadListening?: boolean;
  bufferStatus?: {
    bufferUsage: number;
    isInVoiceSegment: boolean;
    voiceDuration: number;
    silenceDuration: number;
  };
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onToggleListening,
  isListening,
  isSpeaking,
  canBeInterrupted,
  currentEngine,
  engineStatus,
  currentLanguage,
  vadEnabled,
  vadSupported,
  vadListening,
  bufferStatus
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getMicButtonColor = () => {
    if (engineStatus === 'error') return 'text-red-500';
    if (isListening) return 'text-green-500';
    return '';
  };

  const getMicTooltip = () => {
    if (engineStatus === 'error') return 'Erreur de reconnaissance vocale';
    if (engineStatus === 'loading') return 'Chargement...';
    if (isListening) return 'Arrêter l\'écoute';
    return 'Commencer l\'écoute';
  };

  const getVadIndicator = () => {
    if (!vadEnabled || !vadSupported) return null;
    
    return (
      <div className="absolute -top-1 -right-1">
        <div 
          className={`h-2 w-2 rounded-full ${
            vadListening ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      </div>
    );
  };

  const getBufferIndicator = () => {
    if (!bufferStatus || !vadEnabled || !vadSupported) return null;
    
    return (
      <div className="absolute -bottom-1 -left-1 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${bufferStatus.bufferUsage * 100}%` }}
        />
      </div>
    );
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  return (
    <div className="space-y-4">
      {/* Zone de drag & drop pour les fichiers */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.txt,.docx"
          onChange={handleFileSelect}
        />
        
        {selectedFiles.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Fichiers sélectionnés:</p>
            {Array.from(selectedFiles).map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Glissez des fichiers ici ou{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                parcourez
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Images, PDF, documents texte
            </p>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <div className="relative">
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "outline"}
            onClick={onToggleListening}
            disabled={engineStatus === 'loading'}
            className={getMicButtonColor()}
            title={getMicTooltip()}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {getVadIndicator()}
            {getBufferIndicator()}
          </Button>
        </div>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Écrivez votre message... (${currentLanguage})`}
            className="min-h-[60px] resize-none"
            rows={1}
          />
        </div>

        <Button 
          type="button" 
          onClick={onSendMessage}
          disabled={!inputText.trim() && selectedFiles.length === 0}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isSpeaking && canBeInterrupted && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleListening}
            className="text-xs"
          >
            Interrompre la réponse
          </Button>
        </div>
      )}
    </div>
  );
};
