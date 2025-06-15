
import React from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHybridSpeechRecognition } from '@/hooks/useHybridSpeechRecognition';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';
import { useChatState } from '@/hooks/useChatState';
import { useChatSpeechConfig } from '@/hooks/useChatSpeechConfig';
import { useChatMessageHandler } from '@/hooks/useChatMessageHandler';
import { useChatActions } from '@/hooks/useChatActions';
import { useChatInterfaceEffects } from '@/hooks/useChatInterfaceEffects';
import { useIntegrations } from '@/hooks/useIntegrations';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainContent } from '@/components/chat/ChatMainContent';
import { PersonalityId } from '@/types/personality';
import { Gender } from '@/types/gender';
import { SupportedLanguage } from '@/types/speechRecognition';

interface ChatInterfaceContainerProps {
  currentPersonality: PersonalityId;
  currentGender: Gender;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onEmotionChange: (emotion: 'neutral' | 'happy' | 'thinking' | 'listening') => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const ChatInterfaceContainer: React.FC<ChatInterfaceContainerProps> = ({
  currentPersonality,
  currentGender,
  onListeningChange,
  onSpeakingChange,
  onEmotionChange,
  onLanguageChange
}) => {
  // Chat state management
  const {
    messages,
    inputText,
    setInputText,
    showEngineSelector,
    addMessage,
    resetMessages,
    toggleEngineSelector
  } = useChatState();

  // Speech configuration
  const { speechConfig, updateSpeechConfig } = useChatSpeechConfig();

  // Intégrations
  const { processWithIntegrations, getIntegrationManager, isProcessing: isIntegrationProcessing } = useIntegrations();

  // Discussion engine with gender and Ollama support
  const {
    engineState,
    memoryStats,
    processMessage: processMessageWithPersonality,
    interrupt,
    resetConversation,
    getConversationExport,
    changePersonality,
    getCurrentPersonality,
    ollama
  } = useDiscussionEngine(currentPersonality, currentGender);

  // Enhanced processMessage that includes integrations and language
  const processMessage = React.useCallback(async (text: string, language?: 'fr' | 'ar', files?: FileList | File[]) => {
    console.log(`🧠 Traitement avec intégrations, langue: ${language || 'auto'} et genre: ${currentGender}`);
    
    try {
      // 1. Traiter avec les intégrations d'abord
      const { enhancedMessage, integrationResults } = await processWithIntegrations(text, files);
      
      // 2. Traiter avec le moteur de discussion principal
      const response = await processMessageWithPersonality(enhancedMessage, language);
      
      // 3. Enrichir la réponse avec les résultats d'intégration
      let finalResponse = response;
      
      if (integrationResults.length > 0) {
        const integrationSummary = integrationResults
          .filter(r => r.success)
          .map(r => {
            if (r.metadata?.integrationId === 'weather' && r.data) {
              return `🌤️ Météo à ${r.data.location}: ${r.data.temperature}°C, ${r.data.description}`;
            }
            if (r.metadata?.integrationId === 'news' && r.data) {
              return `📰 ${r.data.articles.length} actualités trouvées`;
            }
            if (r.metadata?.integrationId === 'search' && r.data) {
              return `🔍 ${r.data.results.length} résultats de recherche`;
            }
            if (r.metadata?.integrationId === 'multimodal' && r.data) {
              return `📁 ${r.data.length} fichier(s) analysé(s)`;
            }
            return '';
          })
          .filter(Boolean)
          .join('\n');
        
        if (integrationSummary) {
          finalResponse = `${response}\n\n---\n${integrationSummary}`;
        }
      }
      
      return finalResponse;
    } catch (error) {
      console.error('Erreur lors du traitement du message avec intégrations:', error);
      return await processMessageWithPersonality(text, language);
    }
  }, [processMessageWithPersonality, processWithIntegrations, currentGender]);

  const { isSpeaking, speechEnabled, setSpeechEnabled, speak, updateLanguage } = useSpeechSynthesis();

  // Message handling with integrations support
  const { handleSendMessage } = useChatMessageHandler({
    addMessage,
    setInputText,
    processMessage,
    speechEnabled,
    speak,
    onSpeakingChange,
    onEmotionChange,
    currentLanguage: 'fr'
  });

  const handleSpeechResult = React.useCallback((transcript: string) => {
    console.log(`🎤 Transcription reçue (${speechConfig.engine}/${speechConfig.language}):`, transcript);
    setInputText(transcript);
    handleSendMessage(transcript);
  }, [speechConfig, setInputText, handleSendMessage]);

  // Hybrid speech recognition
  const {
    isListening,
    toggleListening,
    currentEngine,
    currentLanguage,
    switchEngine,
    switchLanguage,
    engineStatus,
    engineInfo,
    vadEnabled,
    toggleVAD,
    vadSupported,
    vadListening,
    bufferStatus
  } = useHybridSpeechRecognition(handleSpeechResult, {
    engine: speechConfig.engine,
    language: speechConfig.language,
    vadEnabled: true
  });

  // Chat actions
  const { handleResetConversation, handleExportConversation } = useChatActions({
    resetConversation,
    getConversationExport,
    getCurrentPersonality,
    resetMessages,
    currentPersonality,
    currentLanguage,
    currentEngine,
    engineInfo
  });

  // Handle all effects
  useChatInterfaceEffects({
    currentPersonality,
    changePersonality,
    currentLanguage,
    updateLanguage,
    currentEngine,
    updateSpeechConfig,
    isListening,
    isSpeaking,
    engineStateIsProcessing: engineState.isProcessing || isIntegrationProcessing,
    interrupt,
    onListeningChange,
    onSpeakingChange,
    onEmotionChange,
    onLanguageChange,
    engineStateEmotionalState: engineState.emotionalState
  });

  const handleSendMessageWrapper = React.useCallback(() => {
    handleSendMessage(undefined, inputText);
  }, [handleSendMessage, inputText]);

  const handleLanguageChange = React.useCallback((language: SupportedLanguage) => {
    switchLanguage(language);
    onLanguageChange?.(language);
  }, [switchLanguage, onLanguageChange]);

  const currentPersonalityData = getCurrentPersonality();
  const currentPersonalityId = currentPersonalityData.id;

  return (
    <div className="flex gap-4 h-full">
      <ChatSidebar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isListening={isListening}
        ollamaAvailable={ollama.isAvailable}
        ollamaModels={ollama.models}
        ollamaLoading={ollama.isLoading}
        ollamaConfig={ollama.config}
        onOllamaConfigUpdate={ollama.updateConfig}
        onRefreshOllamaModels={ollama.refreshModels}
        onCheckOllamaAvailability={ollama.checkAvailability}
        integrationManager={getIntegrationManager()}
      />

      <ChatMainContent
        messages={messages}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessageWrapper}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleListening={toggleListening}
        speechEnabled={speechEnabled}
        onToggleSpeech={setSpeechEnabled}
        showEngineSelector={showEngineSelector}
        onToggleEngineSelector={toggleEngineSelector}
        currentEngine={currentEngine}
        currentLanguage={currentLanguage}
        onEngineChange={switchEngine}
        onLanguageChange={handleLanguageChange}
        engineStatus={engineStatus}
        engineInfo={engineInfo}
        vadEnabled={vadEnabled}
        onToggleVAD={toggleVAD}
        vadSupported={vadSupported}
        vadListening={vadListening}
        bufferStatus={bufferStatus}
        engineState={engineState}
        memoryStats={memoryStats}
        currentPersonality={currentPersonalityId}
        onResetConversation={handleResetConversation}
        onExportConversation={handleExportConversation}
        canBeInterrupted={engineState.canBeInterrupted}
        isIntegrationProcessing={isIntegrationProcessing}
      />
    </div>
  );
};
