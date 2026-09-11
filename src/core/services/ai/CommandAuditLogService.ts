/**
 * Command Audit Log Service (TASK-014)
 * Stores execution logs, tracks local vs AI ratio, response latencies, and provides metrics for the AI Operations Dashboard.
 */

import { CommandAuditLog, OperationsAgentStats, ParsedCommand, CommandExecutionResult } from '../../../types/aiOperationsAgent';

const AUDIT_LOG_STORAGE_KEY = 'proteck_ai_command_audit_logs_v1';

export class CommandAuditLogService {
  private static logs: CommandAuditLog[] = this.loadLogsFromStorage();

  private static loadLogsFromStorage(): CommandAuditLog[] {
    try {
      const stored = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load command audit logs', e);
    }
    // Seed initial logs for demonstration
    return [
      {
        id: 'cmd-log-01',
        timestamp: new Date().toISOString(),
        rawQuery: 'افتح الأجهزة والمنتجات',
        intent: 'NAVIGATE',
        intentArabicLabel: 'الانتقال لصفحة الأجهزة والمخزون',
        userRole: 'admin',
        isLocal: true,
        executionTimeMs: 2,
        success: true,
        outcomeMessage: 'تم الانتقال لصفحة admin-products بنجاح',
        parameters: { route: 'admin-products' },
        isHighRisk: false,
      },
      {
        id: 'cmd-log-02',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        rawQuery: 'إضافة جهاز جديد للمعرض',
        intent: 'CREATE_PRODUCT',
        intentArabicLabel: 'فتح نافذة الإدخال الذكي للأجهزة',
        userRole: 'admin',
        isLocal: true,
        executionTimeMs: 4,
        success: true,
        outcomeMessage: 'تم فتح نافذة الإدخال الذكي (AI Intake)',
        parameters: {},
        isHighRisk: false,
      },
      {
        id: 'cmd-log-03',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        rawQuery: 'فحص جودة بيانات الأجهزة والضمان',
        intent: 'RUN_QUALITY_AUDIT',
        intentArabicLabel: 'تشغيل فحص جودة البيانات المكتملة',
        userRole: 'showroom_manager',
        isLocal: true,
        executionTimeMs: 8,
        success: true,
        outcomeMessage: 'تم فحص جودة 12 جهاز بالمعرض بنجاح',
        parameters: {},
        isHighRisk: false,
      },
    ];
  }

  private static saveLogsToStorage(): void {
    try {
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to save command audit logs', e);
    }
  }

  /**
   * Records execution of a command
   */
  public static logExecution(
    parsed: ParsedCommand,
    result: CommandExecutionResult,
    userRole: string = 'admin'
  ): CommandAuditLog {
    const entry: CommandAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      rawQuery: parsed.rawQuery,
      intent: parsed.intent,
      intentArabicLabel: parsed.intentArabicLabel,
      userRole,
      isLocal: parsed.isLocalExecution,
      executionTimeMs: result.executionTimeMs,
      success: result.success,
      outcomeMessage: result.message,
      parameters: parsed.parameters.reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {}),
      isHighRisk: parsed.isHighRisk,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 300) {
      this.logs = this.logs.slice(0, 300);
    }
    this.saveLogsToStorage();
    return entry;
  }

  /**
   * Retrieves summary metrics for AI Operations Dashboard
   */
  public static getStats(): OperationsAgentStats {
    const total = this.logs.length;
    if (total === 0) {
      return {
        totalCommandsExecuted: 0,
        localExecutedCount: 0,
        localExecutedPercentage: 100,
        aiExecutedCount: 0,
        aiExecutedPercentage: 0,
        avgExecutionTimeMs: 4,
        topIntents: [],
        failedCommandsCount: 0,
        highRiskActionsCount: 0,
      };
    }

    const localCount = this.logs.filter((l) => l.isLocal).length;
    const aiCount = total - localCount;
    const localPct = Math.round((localCount / total) * 100);
    const aiPct = 100 - localPct;
    const totalMs = this.logs.reduce((sum, l) => sum + l.executionTimeMs, 0);
    const avgMs = Math.round(totalMs / total);
    const failedCount = this.logs.filter((l) => !l.success).length;
    const highRiskCount = this.logs.filter((l) => l.isHighRisk).length;

    // Intent counts
    const intentMap: Record<string, { label: string; count: number }> = {};
    for (const l of this.logs) {
      if (!intentMap[l.intent]) {
        intentMap[l.intent] = { label: l.intentArabicLabel, count: 0 };
      }
      intentMap[l.intent].count++;
    }

    const topIntents = Object.entries(intentMap)
      .map(([intent, data]) => ({
        intent: intent as any,
        label: data.label,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCommandsExecuted: total,
      localExecutedCount: localCount,
      localExecutedPercentage: localPct,
      aiExecutedCount: aiCount,
      aiExecutedPercentage: aiPct,
      avgExecutionTimeMs: avgMs,
      topIntents,
      failedCommandsCount: failedCount,
      highRiskActionsCount: highRiskCount,
    };
  }

  public static getLogs(): CommandAuditLog[] {
    return this.logs;
  }

  public static clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
  }
}
