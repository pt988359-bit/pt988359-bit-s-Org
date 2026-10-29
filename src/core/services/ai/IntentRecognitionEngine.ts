/**
 * Intent Recognition Engine (TASK-014)
 * Parses natural language input (Arabic and English) into structured intent and parameters.
 * Uses local fast pattern matching with AI Knowledge Engine market normalization, and flags complex queries.
 */

import { ParsedCommand } from '../../../types/aiOperationsAgent';
import { AIKnowledgeEngine } from './AIKnowledgeEngine';

export class IntentRecognitionEngine {
  /**
   * Main entry point to parse raw natural language input into a ParsedCommand
   */
  public static parseCommand(query: string, _currentRoute: string = 'admin-dashboard'): ParsedCommand {
    const cleanQuery = query.trim();
    const lowerQuery = cleanQuery.toLowerCase();

    if (!cleanQuery) {
      return this.createUnknownCommand(cleanQuery);
    }

    // 1. NAVIGATION INTENTS (صفحات والنقل)
    if (this.isMatch(lowerQuery, ['افتح', 'انتقل', 'روح', 'صفحة', 'لوحة', 'open', 'go to', 'navigate'])) {
      if (this.isMatch(lowerQuery, ['منتجات', 'أجهزة', 'المعروضات', 'مخزون', 'products'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال لصفحة الأجهزة والمخزون',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-products', labelArabic: 'الوجهة: الأجهزة' }],
          targetEntity: 'admin-products',
          requiredRole: 'showroom_manager',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'أمر مباشر للانتقال إلى قسم الأجهزة والمخزون المعروض بالمعرض.',
        };
      }

      if (this.isMatch(lowerQuery, ['مالية', 'ارباح', 'أرباح', 'تكاليف', 'حسابات', 'finance', 'costs'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال للوحة المالية والأرباح',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-finance', labelArabic: 'الوجهة: السجل المالي' }],
          targetEntity: 'admin-finance',
          requiredRole: 'admin',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'الانتقال إلى الإدارة المالية ومتابعة الأرباح والتكاليف الشاملة.',
        };
      }

      if (this.isMatch(lowerQuery, ['حجوزات', 'حجز', 'reservations'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال لصفحة الطلبات والحجوزات',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-orders', labelArabic: 'الوجهة: الطلبات والحجوزات' }],
          targetEntity: 'admin-orders',
          requiredRole: 'showroom_manager',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'الانتقال إلى شاشة متابعة الطلبات وتأكيد الحجوزات.',
        };
      }

      if (this.isMatch(lowerQuery, ['ذكاء', 'محرك', 'ai', 'knowledge', 'حارس'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال لإعدادات الذكاء الاصطناعي',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-ai', labelArabic: 'الوجهة: الذكاء الاصطناعي' }],
          targetEntity: 'admin-ai',
          requiredRole: 'admin',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'فتح صفحة حوكمة محرك AI وذاكرة التعلم المؤسسي.',
        };
      }

      if (this.isMatch(lowerQuery, ['فواتير', 'ضمان', 'invoices'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال لصفحة الفواتير الضريبية',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-invoices', labelArabic: 'الوجهة: الفواتير' }],
          targetEntity: 'admin-invoices',
          requiredRole: 'showroom_manager',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'الانتقال لقسم إصدار واستعراض فواتير الضمان.',
        };
      }

      if (this.isMatch(lowerQuery, ['عملاء', 'زبائن', 'customers'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال لسجل العملاء',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-customers', labelArabic: 'الوجهة: العملاء' }],
          targetEntity: 'admin-customers',
          requiredRole: 'showroom_manager',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'عرض دليل وشخصيات العملاء وسجل المعاملات.',
        };
      }

      if (this.isMatch(lowerQuery, ['رئيسية', 'داشبورد', 'dashboard', 'home'])) {
        return {
          rawQuery: cleanQuery,
          intent: 'NAVIGATE',
          intentArabicLabel: 'الانتقال للوحة الرئيسية',
          confidence: 98,
          parameters: [{ name: 'route', value: 'admin-dashboard', labelArabic: 'الوجهة: الرئيسية' }],
          targetEntity: 'admin-dashboard',
          requiredRole: 'showroom_manager',
          isHighRisk: false,
          requiresConfirmation: false,
          isLocalExecution: true,
          explanation: 'الرجوع إلى الشاشة الرئيسية ومؤشرات الأداء.',
        };
      }
    }

    // 2. CREATE PRODUCT INTENT (إضافة جهاز جديد)
    if (this.isMatch(lowerQuery, ['إضافة جهاز', 'اضف جهاز', 'جهاز جديد', 'إدخال ذكي', 'add product', 'create product', 'new product'])) {
      return {
        rawQuery: cleanQuery,
        intent: 'CREATE_PRODUCT',
        intentArabicLabel: 'فتح نافذة الإدخال الذكي للأجهزة (AI Intake)',
        confidence: 95,
        parameters: [],
        targetEntity: 'AiProductIntakeModal',
        requiredRole: 'showroom_manager',
        isHighRisk: false,
        requiresConfirmation: false,
        isLocalExecution: true,
        explanation: 'فتح كارت الإدخال الذكي لاستخراج المواصفات والتسعير التلقائي.',
      };
    }

    // 3. PRICING & PROFIT ANALYSIS INTENT (تحليل التسعير والأرباح)
    if (this.isMatch(lowerQuery, ['سعر', 'تسعير', 'أرباح', 'ربح', 'هامش', 'pricing', 'margin', 'cost'])) {
      // Check if price number exists in query
      const priceMatch = lowerQuery.match(/(\d+)/);
      const extractedPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

      return {
        rawQuery: cleanQuery,
        intent: 'ANALYZE_FINANCIALS',
        intentArabicLabel: 'تحليل التسعير وهامش الربح الحرج',
        confidence: 90,
        parameters: extractedPrice ? [{ name: 'targetPrice', value: extractedPrice, labelArabic: `السعر المقترح: ${extractedPrice} ج.م` }] : [],
        requiredRole: 'admin',
        isHighRisk: false,
        requiresConfirmation: false,
        isLocalExecution: true,
        explanation: 'تشغيل خدمة الذكاء المالي لحساب الهامش الآمن وحماية الحد الأدنى.',
      };
    }

    // 4. QUALITY AUDIT INTENT (مراجعة جودة البيانات والضمان)
    if (this.isMatch(lowerQuery, ['جودة', 'فحص البيانات', 'تدقيق', 'مراجعة', 'quality', 'audit', 'check'])) {
      return {
        rawQuery: cleanQuery,
        intent: 'RUN_QUALITY_AUDIT',
        intentArabicLabel: 'تشغيل فحص جودة البيانات المكتملة',
        confidence: 92,
        parameters: [],
        requiredRole: 'showroom_manager',
        isHighRisk: false,
        requiresConfirmation: false,
        isLocalExecution: true,
        explanation: 'فحص اكتمال مواصفات الأجهزة وسجلات التكلفة والضمان المرفق.',
      };
    }

    // 5. SEARCH INVENTORY INTENT (بحث محدد بالماركة أو القسم)
    if (this.isMatch(lowerQuery, ['ابحث', 'بحث', 'دور على', 'تفتيش', 'search', 'find'])) {
      // Use MarketKnowledgeService to normalize brand or category search
      const normalizedBrand = AIKnowledgeEngine.normalizeBrand(cleanQuery);
      const normalizedCategory = AIKnowledgeEngine.normalizeCategory(cleanQuery);

      return {
        rawQuery: cleanQuery,
        intent: 'SEARCH_INVENTORY',
        intentArabicLabel: 'تصفية المخزون وحصر الأجهزة',
        confidence: 90,
        parameters: [
          { name: 'searchQuery', value: cleanQuery, labelArabic: `عبارة البحث: ${cleanQuery}` },
          { name: 'normalizedBrand', value: normalizedBrand, labelArabic: `الماركة: ${normalizedBrand}` },
          { name: 'normalizedCategory', value: normalizedCategory, labelArabic: `القسم: ${normalizedCategory || 'عام'}` },
        ],
        targetEntity: 'admin-products',
        requiredRole: 'showroom_manager',
        isHighRisk: false,
        requiresConfirmation: false,
        isLocalExecution: true,
        explanation: `البحث السريع وتصفية الأجهزة المطابقة لـ "${cleanQuery}".`,
      };
    }

    // 6. CLEAR AI MEMORY / HIGH RISK COMMANDS
    if (this.isMatch(lowerQuery, ['مسح الذاكرة', 'تفرغ الذاكرة', 'ريست', 'تصفير', 'clear memory', 'reset ai'])) {
      return {
        rawQuery: cleanQuery,
        intent: 'AI_KNOWLEDGE_SETTINGS',
        intentArabicLabel: 'مسح ذاكرة التعلم المحلي للمحرك',
        confidence: 96,
        parameters: [{ name: 'action', value: 'clear_memory', labelArabic: 'الإجراء: مسح الذاكرة' }],
        requiredRole: 'admin',
        isHighRisk: true,
        requiresConfirmation: true,
        confirmationPromptArabic: 'هل أنت متاكد من رغبتك في تفريغ ذاكرة تصحيحات محرك AI؟ سيتم إعادة ضبط المحرك للقيم الأصلية.',
        isLocalExecution: true,
        explanation: 'إجراء حساس لإعادة تعيين ذاكرة التعلم وتصحيحات المدير.',
      };
    }

    // 7. EXPLAIN / HELP / STRATEGIC QUESTIONS (Needs Gemini Reasoning)
    if (cleanQuery.endsWith('؟') || cleanQuery.endsWith('?') || this.isMatch(lowerQuery, ['كيف', 'ما هو', 'لماذا', 'شرح', 'how', 'why', 'explain', 'suggest'])) {
      return {
        rawQuery: cleanQuery,
        intent: 'EXPLAIN_HELP',
        intentArabicLabel: 'استفسار تحليلي معقد (تحليل AI العميق)',
        confidence: 85,
        parameters: [{ name: 'question', value: cleanQuery, labelArabic: `السؤال: ${cleanQuery}` }],
        requiredRole: 'showroom_manager',
        isHighRisk: false,
        requiresConfirmation: false,
        isLocalExecution: false, // Flagged for Gemini reasoning fallback
        explanation: 'تحليل ذكي غير مباشر يتطلب محرك الاستدلال والتفكير المعقد من Gemini.',
      };
    }

    // Fallback search intent
    const brand = AIKnowledgeEngine.normalizeBrand(cleanQuery);
    return {
      rawQuery: cleanQuery,
      intent: 'SEARCH_INVENTORY',
      intentArabicLabel: `بحث سريع عن: ${cleanQuery}`,
      confidence: 80,
      parameters: [{ name: 'searchQuery', value: cleanQuery, labelArabic: `كلمة البحث: ${cleanQuery}` }],
      targetEntity: 'admin-products',
      requiredRole: 'showroom_manager',
      isHighRisk: false,
      requiresConfirmation: false,
      isLocalExecution: true,
      explanation: `تنفيذ بحث مباشر في سجل الأجهزة المعروضة بمعرف (${brand}).`,
    };
  }

  private static isMatch(text: string, terms: string[]): boolean {
    return terms.some((t) => text.includes(t.toLowerCase()));
  }

  private static createUnknownCommand(query: string): ParsedCommand {
    return {
      rawQuery: query,
      intent: 'UNKNOWN',
      intentArabicLabel: 'غير معروف',
      confidence: 0,
      parameters: [],
      requiredRole: 'any',
      isHighRisk: false,
      requiresConfirmation: false,
      isLocalExecution: true,
      explanation: 'يرجى كتابة أمر واضح مثل "افتح المنتجات" أو "اضف جهاز جديد".',
    };
  }
}
