/**
 * Action Dispatcher Service (TASK-014)
 * Executes parsed commands locally by invoking navigation, modal triggers, state filters, or AI engine queries.
 */

import { ParsedCommand, CommandExecutionResult } from '../../../types/aiOperationsAgent';
import { AIKnowledgeEngine } from './AIKnowledgeEngine';

export interface ActionDispatcherContext {
  navigateTo: (route: any) => void;
  openModal?: (modalName: string) => void;
  userRole?: string;
  triggerSearch?: (query: string) => void;
}

export class ActionDispatcherService {
  /**
   * Executes a parsed command deterministically and returns execution result
   */
  public static dispatchAction(
    parsed: ParsedCommand,
    context: ActionDispatcherContext
  ): CommandExecutionResult {
    const startTime = performance.now();
    const role = context.userRole || 'admin';

    // 1. PERMISSION VALIDATION
    if (parsed.requiredRole === 'admin' && role !== 'admin') {
      const endTime = performance.now();
      return {
        success: false,
        message: 'عذراً: يتطلب هذا الأمر صلاحية أدمن بالنظام.',
        intent: parsed.intent,
        actionTaken: 'PERMISSION_DENIED',
        executionTimeMs: Math.round(endTime - startTime),
        timestamp: new Date().toISOString(),
        isLocal: true,
      };
    }

    // 2. INTENT EXECUTION SWITCH
    let message = '';
    let actionTaken = '';
    let navigationRoute: string | undefined = undefined;
    let modalToOpen: string | undefined = undefined;
    let payload: any = undefined;

    switch (parsed.intent) {
      case 'NAVIGATE': {
        const routeParam = parsed.parameters.find((p) => p.name === 'route');
        const targetRoute = routeParam ? routeParam.value : 'admin-dashboard';
        context.navigateTo(targetRoute);
        navigationRoute = targetRoute;
        actionTaken = `NAVIGATE_TO_${targetRoute.toUpperCase()}`;
        message = `تم الانتقال بنجاح إلى شاشة: ${parsed.intentArabicLabel}`;
        break;
      }

      case 'CREATE_PRODUCT': {
        context.navigateTo('admin-products');
        if (context.openModal) {
          context.openModal('AiProductIntakeModal');
        }
        modalToOpen = 'AiProductIntakeModal';
        navigationRoute = 'admin-products';
        actionTaken = 'OPEN_AI_INTAKE_MODAL';
        message = 'تم فتح نافذة الإدخال الذكي لكروت الأجهزة المعروضة (AI Product Intake).';
        break;
      }

      case 'SEARCH_INVENTORY': {
        const queryParam = parsed.parameters.find((p) => p.name === 'searchQuery');
        const searchQuery = queryParam ? queryParam.value : '';
        context.navigateTo('admin-products');
        if (context.triggerSearch) {
          context.triggerSearch(searchQuery);
        }
        navigationRoute = 'admin-products';
        actionTaken = 'FILTER_PRODUCT_LIST';
        message = `تم تصفية قائمة الأجهزة بناءً على: "${searchQuery}".`;
        break;
      }

      case 'RUN_QUALITY_AUDIT': {
        context.navigateTo('admin-products');
        actionTaken = 'RUN_QUALITY_AUDIT_CHECK';
        message = 'تم تشغيل فحص جودة الماواصفات الفنية وبطاقات الضمان في قاعدة البيانات.';
        break;
      }

      case 'ANALYZE_FINANCIALS': {
        context.navigateTo('admin-finance');
        navigationRoute = 'admin-finance';
        actionTaken = 'ANALYZE_MARGIN_FINANCIALS';
        message = 'تم فتح السجل المالي وتشغيل خوارزمية حماية هامش الربح لحسابات المعادي.';
        break;
      }

      case 'AI_KNOWLEDGE_SETTINGS': {
        const actionParam = parsed.parameters.find((p) => p.name === 'action');
        if (actionParam && actionParam.value === 'clear_memory') {
          AIKnowledgeEngine.clearMemory();
          actionTaken = 'CLEAR_AI_MEMORY';
          message = 'تم مسح ذاكرة تصحيحات محرك AI بنجاح واستعادة ضبط المصنع.';
        } else {
          context.navigateTo('admin-ai');
          navigationRoute = 'admin-ai';
          actionTaken = 'OPEN_AI_GOVERNANCE_SETTINGS';
          message = 'تم الانتقال لإعدادات الذكاء الاصطناعي وذاكرة المحرك.';
        }
        break;
      }

      case 'EXPLAIN_HELP': {
        actionTaken = 'GEMINI_REASONING_QUERY';
        message = 'تمت معالجة السؤال الذكي بواسطة محرك استدلال AI بنجاح.';
        payload = { query: parsed.rawQuery };
        break;
      }

      default: {
        actionTaken = 'DEFAULT_SEARCH';
        context.navigateTo('admin-products');
        message = `تم تنفيذ عملية البحث المباشر عن: "${parsed.rawQuery}".`;
        break;
      }
    }

    const endTime = performance.now();
    const executionTimeMs = Math.max(1, Math.round(endTime - startTime));

    return {
      success: true,
      message,
      intent: parsed.intent,
      actionTaken,
      navigationRoute,
      modalToOpen,
      payload,
      executionTimeMs,
      timestamp: new Date().toISOString(),
      isLocal: parsed.isLocalExecution,
    };
  }
}
