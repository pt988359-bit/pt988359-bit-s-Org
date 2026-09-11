/**
 * AI Operations Agent Façade (TASK-014)
 * Orchestrates natural language parsing, intent recognition, deterministic execution, permission validation,
 * audit logging, command suggestions, and seamless integration with AIKnowledgeEngine.
 */

import { ParsedCommand, CommandExecutionResult, OperationsAgentStats } from '../../../types/aiOperationsAgent';
import { IntentRecognitionEngine } from './IntentRecognitionEngine';
import { ActionDispatcherService, ActionDispatcherContext } from './ActionDispatcherService';
import { CommandAuditLogService } from './CommandAuditLogService';
import { CommandRegistryService } from './CommandRegistryService';
import { AIKnowledgeEngine } from './AIKnowledgeEngine';

export class AIOperationsAgent {
  /**
   * Parses natural language query into intent and parameter structure
   */
  public static parseQuery(query: string, currentRoute: string = 'admin-dashboard'): ParsedCommand {
    return IntentRecognitionEngine.parseCommand(query, currentRoute);
  }

  /**
   * Executes command, logs audit entry, and returns result
   */
  public static executeCommand(
    query: string,
    context: ActionDispatcherContext,
    currentRoute: string = 'admin-dashboard'
  ): { parsed: ParsedCommand; result: CommandExecutionResult } {
    const parsed = this.parseQuery(query, currentRoute);
    const result = ActionDispatcherService.dispatchAction(parsed, context);

    // Save recent query
    CommandRegistryService.addRecentQuery(query);

    // Log execution audit entry
    CommandAuditLogService.logExecution(parsed, result, context.userRole || 'admin');

    return { parsed, result };
  }

  // SUGGESTIONS & FAVORITES
  public static getSuggestions(query: string = '') {
    return CommandRegistryService.getSuggestions(query);
  }

  public static getFavorites() {
    return CommandRegistryService.getFavorites();
  }

  public static toggleFavorite(command: { label: string; query: string; category: string }) {
    CommandRegistryService.toggleFavorite(command);
  }

  public static getRecentQueries() {
    return CommandRegistryService.getRecentQueries();
  }

  // AUDIT LOGS & STATS
  public static getStats(): OperationsAgentStats {
    return CommandAuditLogService.getStats();
  }

  public static getAuditLogs() {
    return CommandAuditLogService.getLogs();
  }

  public static clearAuditLogs() {
    CommandAuditLogService.clearLogs();
  }

  // TASK-013 KNOWLEDGE ENGINE ACCESS
  public static getKnowledgeSnapshot(categories: any[], suppliers: any[]) {
    return AIKnowledgeEngine.getKnowledgeSnapshot(categories, suppliers);
  }
}
