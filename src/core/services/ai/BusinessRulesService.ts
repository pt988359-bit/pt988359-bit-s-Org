/**
 * Business Rules Service (TASK-013 PART 2)
 * Centralizes all PRO TECK business policies, inventory constraints, and financial formulas.
 * The AI Knowledge Engine queries this service to enforce strict compliance.
 */

import { BusinessRuleDefinition } from '../../../types/aiKnowledgeEngine';

export class BusinessRulesService {
  private static rules: BusinessRuleDefinition[] = [
    {
      id: 'rule-01',
      code: 'SINGLE_RESERVATION',
      title: 'حجز نشط واحد فقط للعميل',
      description: 'لا يحق للعميل إجراء أكثر من حجز نشط واحد في نفس الوقت لمنع احتكار المخزون.',
      category: 'reservation',
      enforced: true,
    },
    {
      id: 'rule-02',
      code: 'RESERVATION_EXPIRATION',
      title: 'صلاحية الحجز 24 ساعة',
      description: 'ينتهي الحجز المؤقت تلقائياً بعد 24 ساعة من إنشائه ما لم يتم تأكيد الشراء أو المعاينة.',
      category: 'reservation',
      enforced: true,
    },
    {
      id: 'rule-03',
      code: 'SOLD_DISAPPEAR',
      title: 'اختفاء الأجهزة المباعة تلقائياً',
      description: 'الأجهزة المباعة تحول إلى حالة sold وتختفي فوراً من شاشة العرض العامة للعملاء.',
      category: 'inventory',
      enforced: true,
    },
    {
      id: 'rule-04',
      code: 'ARCHIVED_INTERNAL_ONLY',
      title: 'الأرشيف للمدراء فقط',
      description: 'الأجهزة المؤرشفة تظهر في الأرشيف الداخلي للإدارة فقط ولا تظهر بالمعرض العام.',
      category: 'inventory',
      enforced: true,
    },
    {
      id: 'rule-05',
      code: 'TOTAL_COST_FORMULA',
      title: 'معادلة التكلفة الشاملة',
      description: 'إجمالي التكلفة = الشراء + الشحن + الصيانة + التنظيف + الملحقات + النثريات.',
      category: 'finance',
      enforced: true,
    },
    {
      id: 'rule-06',
      code: 'WARRANTY_CARD_VERIFICATION',
      title: 'توثيق كرت الضمان الأصلي',
      description: 'تفعيل خيار بطاقة الضمان يتطلب وجود كرت ضمان مصنع أو ضمان معتمد من مركز المعادي.',
      category: 'warranty',
      enforced: true,
    },
    {
      id: 'rule-07',
      code: 'PROFIT_MARGIN_PROTECTION',
      title: 'حماية هامش الربح الأدنى',
      description: 'الحد الأدنى للبيع المقبول هو 15% فوق التكلفة الشاملة ولا يسمح بالبيع بخسارة إلا بقرار مدير.',
      category: 'finance',
      enforced: true,
    },
  ];

  public static getActiveRules(): BusinessRuleDefinition[] {
    return this.rules.filter((r) => r.enforced);
  }

  public static getAllRules(): BusinessRuleDefinition[] {
    return this.rules;
  }

  public static formatRulesForAiPrompt(): string {
    return this.getActiveRules()
      .map((r) => `- [${r.code}] ${r.title}: ${r.description}`)
      .join('\n');
  }
}
