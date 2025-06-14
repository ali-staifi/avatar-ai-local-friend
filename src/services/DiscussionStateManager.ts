
import { DiscussionState } from '@/types/discussionEngine';

export class DiscussionStateManager {
  private state: DiscussionState;
  private stateChangeCallback?: (state: DiscussionState) => void;

  constructor() {
    this.state = {
      isProcessing: false,
      canBeInterrupted: true,
      emotionalState: 'neutral'
    };
  }

  public setStateChangeCallback(callback: (state: DiscussionState) => void): void {
    this.stateChangeCallback = callback;
  }

  public updateState(updates: Partial<DiscussionState>): void {
    this.state = { ...this.state, ...updates };
    this.stateChangeCallback?.(this.state);
  }

  public getState(): DiscussionState {
    return { ...this.state };
  }

  public canInterrupt(): boolean {
    return this.state.canBeInterrupted;
  }

  public setProcessing(processing: boolean, task?: string): void {
    this.updateState({
      isProcessing: processing,
      canBeInterrupted: !processing,
      currentTask: processing ? task : undefined
    });
  }

  public setEmotionalState(emotion: DiscussionState['emotionalState']): void {
    this.updateState({ emotionalState: emotion });
  }
}
