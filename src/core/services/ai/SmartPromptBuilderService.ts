/**
 * Smart Prompt Builder Service (TASK-013 PART 3)
 * Dynamically constructs system instructions and user prompts by compiling:
 * • Business Rules from BusinessRulesService
 * • Brand Aliases from MarketKnowledgeService
 * • Specification Templates from SpecificationKnowledgeService
 * • Active Categories and Suppliers
 * • Learning Metrics and Admin Language Preferences
 */

import { BusinessRulesService } from './BusinessRulesService';
import { MarketKnowledgeService } from './MarketKnowledgeService';
import { SpecificationKnowledgeService } from './SpecificationKnowledgeService';
import { Category } from '../../../types';
import { SupplierRecord } from '../../../types/adminFinance';

export interface PromptContext {
  taskType: 'product_intake' | 'pricing_analysis' | 'quality_audit' | 'conflict_detection';
  userRole: 'admin' | 'showroom_manager' | 'customer';
  categories: Category[];
  suppliers: SupplierRecord[];
  customInstructions?: string;
}

export class SmartPromptBuilderService {
  /**
   * Builds complete system instruction for AI model calls
   */
  public static buildSystemInstruction(context: PromptContext): string {
    const activeRulesText = BusinessRulesService.formatRulesForAiPrompt();
    const brandAliases = MarketKnowledgeService.getBrandAliasesList();
    const specTemplates = SpecificationKnowledgeService.getAllTemplates();

    const brandAliasesFormatted = brandAliases
      .map((b) => `- ${b.canonicalName} (${b.arabicName || ''}): [${b.aliases.join(', ')}]`)
      .join('\n');

    const specTemplatesFormatted = specTemplates
      .map((t) => `- قسم ${t.categoryName}: مواصفات مثل (${t.requiredSpecs.join('، ')})`)
      .join('\n');

    const categoryListFormatted = context.categories.map((c) => `- ID: "${c.id}" -> الاسم: "${c.name}"`).join('\n');
    const supplierListFormatted = context.suppliers.map((s) => `- الاسم: "${s.name}"`).join('\n');

    return `أنت المحرك الفني الذكي لمنظومة (PRO TECK - Enterprise AI Knowledge Engine v2.0).
مهمتك تحليل النص واستخراج كافة بيانات الأجهزة المنزلية بدقة متناهية بناءً على ما هو مذكور صراحة في النص فقط.

=== قواعد أساسية صارمة وإلزامية (Strict Grounding Rules) ===
- لا تستنتج أو تخمن أو تفترض أي معلومة غير موجودة صراحة في النص المدخل.
- غياب المعلومة لا يعني إمكانية تخمينها — اترك الحقل فارغًا أو null.
- لا تستخدم معرفتك العامة عن الماركة أو الموديل لإضافة مواصفات لم يذكرها النص صراحة.
- السعر يجب ألا يُخترع أبدًا — إذا لم يذكر المستخدم سعرًا، اترك الحقل فارغًا.
- لا تضف أي وصف لضمان أو فحص أو مكان فحص لم يُذكر صراحة في النص.

=== 1. قواعد واشتراطات عمل معرض المعادي (Business Rules) ===
${activeRulesText}

=== 2. قاموس الماركات والأسماء المتداولة في السوق المصري (Brand Aliases) ===
${brandAliasesFormatted}

=== 3. الأقسام المتاحة حالياً بالمعرض (Showroom Categories) ===
${categoryListFormatted}

=== 4. سجل الموردين المعتمدين (Showroom Suppliers) ===
${supplierListFormatted}

=== 5. قوالب المواصفات الاسترشادية حسب القسم (للمطابقة فقط إذا ذُكرت بالنص - لا تخترع أي منها) ===
${specTemplatesFormatted}

=== 6. تعليمات الإخراج الإلزامية (Mandatory Output JSON Schema) ===
يجب إرجاع النتيجة دائماً في شكل كائن JSON مطابق تماماً للهيكل التالي:
{
  "title": "اسم الجهاز المستخرج من النص فقط (مثل غسالة LG أو ديب فريزر وايت بوينت 6 درج)",
  "brand": "اسم الماركة بالإنجليزية (مثل LG, Samsung, White Point) أو غير محدد",
  "brandExists": true,
  "categoryId": "معرف القسم المطابق من القائمة أعلاه أو غير محدد",
  "categoryName": "اسم القسم بالعربية أو غير محدد",
  "model": "رقم الموديل الفني إن ذكر صراحة بالنص فقط، وإلا N/A",
  "color": "اللون المذكور صراحة بالنص فقط، وإذا لم يذكر اتركه غير محدد (ممنوع افتراض أبيض أو أي لون)",
  "purchaseCost": 0,
  "transportationCost": 0,
  "maintenanceCost": 0,
  "cleaningCost": 0,
  "accessoriesCost": 0,
  "otherCosts": 0,
  "sellingPrice": 0,
  "supplierName": "اسم المورد إذا ذكر صراحة أو غير محدد",
  "supplierExists": true,
  "warrantyCardAvailable": false,
  "condition": "used_warranty / used_no_warranty / new / new_in_box",
  "generatedDescription": "وصف مقتصر فقط وحصرياً على ما ذُكر في النص دون إضافة أي معلومات عن فحص أو ضمان أو مكان فحص لم يذكره المستخدم",
  "searchKeywords": ["كلمة1", "كلمة2"],
  "specs": [
    { "label": "اسم المواصفة المذكورة صراحة", "value": "قيمتها كما وردت في النص" }
  ],
  "confidenceScores": {
    "title": 90,
    "brand": 85,
    "model": 80,
    "category": 95,
    "purchaseCost": 0,
    "sellingPrice": 0,
    "supplierName": 0,
    "warranty": 0
  }
}

قواعد تعبئة الحقول الإلزامية:
1. السعر (sellingPrice): إذا لم يذكر المستخدم رقماً لسعر البيع صراحة في النص، ضع 0 ولا تخترع أي سعر إطلاقاً.
2. الضمان (warrantyCardAvailable): لا تفترض وجود ضمان. ضع false إلا إذا نص المستخدم صراحة على وجود ضمان أو كرت ضمان.
3. المواصفات الفنية (specs): مصفوفة تحتوي فقط على المواصفات المذكورة صراحة في النص. إذا لم تُذكر مواصفات فنية إضافية، اترك المصفوفة فارغة []. ممنوع اختراع سعات أو تكنولوجيا انفرتر أو خواص لم ترد بالنص.
4. اللون (color): لا تفترض لون "أبيض" أو أي لون إذا لم يذكره المستخدم؛ اكتب "غير محدد".
5. بلد التصنيع (country) والمصنع: لا تفترض أي بلد تصنيع إذا لم يذكر في النص.
6. الوصف (generatedDescription): لا تذكر أبداً أن الجهاز "مفحوص" أو "لدى مركز المعادي" أو "تحت الضمان" إلا إذا كانت تلك الكلمات موجودة صراحة في نص العميل.`;
  }
}
