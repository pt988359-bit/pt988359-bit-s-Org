import { AiGovernanceAction } from '../types';
import { IdGenerator } from '../core/services/IdGenerator';

/**
 * AI Governance Architecture Helper
 * Enforces strict rule:
 * Artificial Intelligence NEVER executes any action or updates state automatically.
 * All AI suggestions are queued with 'pending' status and require explicit Administrator approval.
 */

export class AiGovernanceEngine {
  private static pendingActions: AiGovernanceAction[] = [];

  /**
   * Queue an AI suggestion for human admin review.
   * NEVER applies changes automatically.
   */
  public static queueAiSuggestion(
    entityType: AiGovernanceAction['entityType'],
    entityId: string,
    entityTitle: string,
    suggestedChanges: Record<string, any>,
    reasoning: string
  ): AiGovernanceAction {
    const action: AiGovernanceAction = {
      id: IdGenerator.generateUniqueId('ai-gov'),
      entityType,
      entityId,
      entityTitle,
      suggestedChanges,
      reasoning,
      suggestedAt: new Date().toISOString(),
      status: 'pending',
    };

    this.pendingActions.push(action);
    return action;
  }

  /**
   * Get all pending AI actions awaiting approval
   */
  public static getPendingActions(): AiGovernanceAction[] {
    return [...this.pendingActions];
  }

  /**
   * Admin explicitly approves an AI suggestion
   */
  public static approveAction(actionId: string, adminName: string): AiGovernanceAction | null {
    const index = this.pendingActions.findIndex((a) => a.id === actionId);
    if (index === -1) return null;

    const action = this.pendingActions[index];
    action.status = 'approved';
    action.reviewedBy = adminName;
    action.reviewedAt = new Date().toISOString();

    // Remove from pending list after processing
    this.pendingActions.splice(index, 1);
    return action;
  }

  /**
   * Admin rejects an AI suggestion
   */
  public static rejectAction(actionId: string, adminName: string): AiGovernanceAction | null {
    const index = this.pendingActions.findIndex((a) => a.id === actionId);
    if (index === -1) return null;

    const action = this.pendingActions[index];
    action.status = 'rejected';
    action.reviewedBy = adminName;
    action.reviewedAt = new Date().toISOString();

    this.pendingActions.splice(index, 1);
    return action;
  }
}
