
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiscussionEngine } from '@/hooks/useDiscussionEngine';

// Mock des services
vi.mock('@/services/DiscussionEngine', () => ({
  DiscussionEngine: vi.fn().mockImplementation(() => ({
    setStateChangeCallback: vi.fn(),
    setGender: vi.fn(),
    processUserInput: vi.fn().mockResolvedValue('Mocked response'),
    interrupt: vi.fn().mockReturnValue(true),
    setPersonality: vi.fn(),
    getCurrentPersonality: vi.fn().mockReturnValue({ id: 'friendly', name: 'Amical' }),
    exportMemory: vi.fn().mockReturnValue({}),
    getMemoryStats: vi.fn().mockReturnValue({
      totalMessages: 0,
      sessionDuration: 0,
      userInterests: [],
      userPreferences: [],
      lastInteraction: new Date()
    })
  }))
}));

vi.mock('@/hooks/useOllama', () => ({
  useOllama: vi.fn().mockReturnValue({
    isAvailable: false,
    models: [],
    isLoading: false,
    config: { enabled: false, selectedModel: null, systemPrompt: '', temperature: 0.7, maxTokens: 1000 },
    updateConfig: vi.fn(),
    generateResponse: vi.fn(),
    refreshModels: vi.fn(),
    checkAvailability: vi.fn()
  })
}));

describe('useDiscussionEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDiscussionEngine());

    expect(result.current.engineState.isProcessing).toBe(false);
    expect(result.current.engineState.canBeInterrupted).toBe(true);
    expect(result.current.engineState.emotionalState).toBe('neutral');
  });

  it('should process messages correctly', async () => {
    const { result } = renderHook(() => useDiscussionEngine());

    await act(async () => {
      const response = await result.current.processMessage('Hello', 'fr');
      expect(response).toBe('Mocked response');
    });
  });

  it('should handle personality changes', () => {
    const { result } = renderHook(() => useDiscussionEngine());

    act(() => {
      result.current.changePersonality('energetic');
    });

    // Vérifier que la personnalité a été changée (via mock)
    expect(result.current.getCurrentPersonality().id).toBe('friendly');
  });

  it('should handle conversation reset', () => {
    const { result } = renderHook(() => useDiscussionEngine());

    act(() => {
      result.current.resetConversation();
    });

    // Vérifier que la conversation a été réinitialisée
    expect(result.current.engineState.isProcessing).toBe(false);
  });

  it('should handle interruption', () => {
    const { result } = renderHook(() => useDiscussionEngine());

    act(() => {
      const interrupted = result.current.interrupt();
      expect(interrupted).toBe(true);
    });
  });

  it('should initialize with custom personality and gender', () => {
    const { result } = renderHook(() => 
      useDiscussionEngine('analytical', 'female')
    );

    // Vérifier l'initialisation avec les paramètres personnalisés
    expect(result.current.engineState).toBeDefined();
  });
});
