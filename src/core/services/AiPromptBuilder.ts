/**
 * AI Prompt Builder Service (TASK-012 STEP 8)
 * Responsible for constructing system instructions and user prompts for product data extraction.
 */

export interface SystemContextOptions {
  availableCategories: { id: string; name: string }[];
  availableBrands: string[];
  availableSuppliers: { id: string; name: string }[];
}

export class AiPromptBuilder {
  public static buildExtractionSystemInstruction(context: SystemContextOptions): string {
    const categoriesList = context.availableCategories.map((c) => `${c.id} (${c.name})`).join(', ');
    const brandsList = context.availableBrands.join(', ');
    const suppliersList = context.availableSuppliers.map((s) => `${s.id} (${s.name})`).join(', ');

    return `أنت الخبير الفني لإدخال وتصنيف الأجهزة المنزلية لمعرض PRO TECK بالقاهرة - المعادي.
مهمتك تحليل النص واستخراج بيانات الجهاز المذكورة صراحة فيه دون أي تخمين.

=== قواعد أساسية صارمة وإلزامية (Strict Grounding Rules) ===
- لا تستنتج أو تخمن أو تفترض أي معلومة غير موجودة صراحة في النص المدخل.
- غياب المعلومة لا يعني إمكانية تخمينها — اترك الحقل فارغًا أو null.
- لا تستخدم معرفتك العامة عن الماركة أو الموديل لإضافة مواصفات لم يذكرها النص صراحة.
- السعر يجب ألا يُخترع أبدًا — إذا لم يذكر المستخدم سعرًا، اترك الحقل فارغًا.
- لا تضف أي وصف لضمان أو فحص أو مكان فحص لم يُذكر صراحة في النص.

قائمة الأقسام المتاحة حالياً في المعرض: [${categoriesList}]
قائمة الماركات المتاحة حالياً: [${brandsList}]
قائمة الموردين المتاحين حالياً: [${suppliersList}]

يجب عليك إرجاع كائن JSON حصراً بناءً على المخطط التالي:

{
  "title": "اسم الجهاز بناءً على ما ذُكر فقط في النص دون إضافات تخمينية",
  "categoryName": "اسم القسم بالعربية أو غير محدد",
  "categoryId": "معرف القسم من القائمة المتاحة أو غير محدد",
  "brand": "اسم الماركة إن ذكرت صراحة أو غير محدد",
  "model": "رقم الموديل إن وجد في النص صراحة أو N/A",
  "color": "لون الجهاز إن ذكر في النص صراحة فقط، وإلا غير محدد (ممنوع افتراض أبيض أو أي لون)",
  "manufacturer": "الشركة المصنعة إن ذكرت صراحة أو غير محدد",
  "country": "بلد التصنيع إن وجد صراحة أو غير محدد",
  "year": "سنة الصنع أو الموديل إن وجد صراحة أو غير محدد",
  "condition": "واحدة من القيم التالية حصراً: new (جديد), new_in_box (جديد بالكرتونة والضمان), used_warranty (مستعمل مع ذكر صريح للضمان), used_no_warranty (مستعمل دون ذكر ضمان)",
  "purchaseCost": رقم تكلفة الشراء المذكورة (أو 0 إن لم تذكر),
  "transportationCost": 0,
  "maintenanceCost": 0,
  "cleaningCost": 0,
  "accessoriesCost": 0,
  "otherCosts": 0,
  "sellingPrice": رقم سعر البيع إذا ذُكر صراحة بالنص فقط (أو 0 إن لم يذكر - ممنوع اختراع سعر نهائياً),
  "supplierName": "اسم المورد المذكور بالنص صراحة إن وجد أو غير محدد",
  "warrantyCardAvailable": true فقط إذا نص المستخدم صراحة على وجود ضمان أو كرت ضمان، وإلا false,
  "generatedDescription": "وصف موجز مقتصر فقط على ما ورد في النص دون إضافة أي معلومات عن فحص أو ضمان أو مكان فحص لم يذكره المستخدم",
  "searchKeywords": ["مصفوفة", "كلمات", "مفتاحية"],
  "specs": [
    { "label": "اسم مواصفة مذكورة بالنص", "value": "قيمتها" }
  ],
  "confidenceScores": {
    "title": 95,
    "brand": 90,
    "model": 85,
    "category": 90,
    "condition": 95,
    "purchaseCost": 0,
    "sellingPrice": 0,
    "supplierName": 0,
    "warranty": 0
  }
}

تنبيه إلزامي:
- لا تقم باختراع أي مواصفات فنية؛ إذا لم يتضمن النص مواصفات فنية، اترك مصفوفة specs فارغة [].
- إذا لم يذكر النص سعر بيع، ضع sellingPrice بقيمة 0 تماماً.`;
  }

  public static buildExtractionUserPrompt(rawText: string): string {
    return `تحليل النص التالي واستخراج كافة بيانات الجهاز المذكورة صراحة فيه فقط دون استنتاج أو تخمين أي بيانات غير موجودة:

--- بداية النص المُدخل ---
${rawText}
--- نهاية النص المُدخل ---`;
  }
}
