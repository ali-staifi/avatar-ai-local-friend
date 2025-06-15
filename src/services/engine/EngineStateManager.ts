
import { DiscussionState } from '@/types/discussionEngine';
import { DiscussionStateManager } from '@/services/DiscussionStateManager';

export class EngineStateManager {
  private stateManager: DiscussionStateManager;
  private interruptionCallback?: () => void;

  constructor() {
    this.stateManager = new DiscussionStateManager();
  }

  public setInterruptionCallback(callback: () => void): void {
    this.interruptionCallback = callback;
  }

  public setStateChangeCallback(callback: (state: DiscussionState) => void): void {
    this.stateManager.setStateChangeCallback(callback);
  }

  public setProcessing(isProcessing: boolean, task?: string): void {
    this.stateManager.setProcessing(isProcessing, task);
  }

  public setEmotionalState(state: 'neutral' | 'happy' | 'thinking' | 'listening'): void {
    this.stateManager.setEmotionalState(state);
  }

  public canInterrupt(): boolean {
    return this.stateManager.canInterrupt();
  }

  public interrupt(): boolean {
    if (this.canInterrupt()) {
      console.log('🔄 Interruption détectée et acceptée par le moteur avancé');
      this.setProcessing(false);
      this.setEmotionalState('listening');
      this.interruptionCallback?.();
      return true;
    }
    
    console.log('⚠️ Interruption ignorée - traitement critique en cours');
    return false;
  }

  public getState(): DiscussionState {
    return this.stateManager.getState();
  }
}
