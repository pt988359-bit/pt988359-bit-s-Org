/**
 * Enterprise AI Operations Agent & Command Center Types (TASK-014)
 */

export type CommandIntentType =
  | 'NAVIGATE'
  | 'SEARCH_INVENTORY'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRICE'
  | 'CHANGE_STATUS'
  | 'RUN_QUALITY_AUDIT'
  | 'ANALYZE_FINANCIALS'
  | 'AI_KNOWLEDGE_SETTINGS'
  | 'EXPORT_REPORT'
  | 'EXPLAIN_HELP'
  | 'TOGGLE_DARK_MODE'
  | 'UNKNOWN';

export interface CommandParameter {
  name: string;
  value: any;
  labelArabic: string;
}

export interface ParsedCommand {
  rawQuery: string;
  intent: CommandIntentType;
  intentArabicLabel: string;
  confidence: number; // 0 - 100
  parameters: CommandParameter[];
  targetEntity?: string;
  requiredRole: 'admin' | 'showroom_manager' | 'any';
  isHighRisk: boolean;
  requiresConfirmation: boolean;
  confirmationPromptArabic?: string;
  isLocalExecution: boolean; // true if deterministic pattern, false if Gemini reasoning
  explanation: string;
}

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  intent: CommandIntentType;
  actionTaken: string;
  navigationRoute?: string;
  modalToOpen?: string;
  payload?: any;
  executionTimeMs: number;
  timestamp: string;
  isLocal: boolean;
}

export interface CommandAuditLog {
  id: string;
  timestamp: string;
  rawQuery: string;
  intent: CommandIntentType;
  intentArabicLabel: string;
  userRole: string;
  isLocal: boolean;
  executionTimeMs: number;
  success: boolean;
  outcomeMessage: string;
  parameters: Record<string, any>;
  isHighRisk: boolean;
}

export interface FavoriteCommand {
  id: string;
  label: string;
  query: string;
  category: string;
  usageCount: number;
  shortcut?: string;
}

export interface CommandSuggestion {
  id: string;
  label: string;
  query: string;
  category: 'pages' | 'products' | 'finance' | 'ai' | 'reports' | 'system';
  categoryLabelArabic: string;
  iconName: string;
  shortcut?: string;
  isPinned?: boolean;
}

export interface OperationsAgentStats {
  totalCommandsExecuted: number;
  localExecutedCount: number;
  localExecutedPercentage: number;
  aiExecutedCount: number;
  aiExecutedPercentage: number;
  avgExecutionTimeMs: number;
  topIntents: { intent: CommandIntentType; label: string; count: number }[];
  failedCommandsCount: number;
  highRiskActionsCount: number;
}
