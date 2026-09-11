/**
 * Question Generation Service (TASK-013 PART 12)
 * Generates targeted clarification questions for the admin when AI confidence is low.
 */

import { ClarificationQuestion } from '../../../types/aiKnowledgeEngine';
import { ExtractedProductData } from '../../../types/aiProductIntake';

export class QuestionGenerationService {
  /**
   * Scans extracted product data and generates targeted questions for low-confidence fields
   */
  public static generateClarificationQuestions(extracted: ExtractedProductData): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = [];

    // 1. Model Low Confidence or N/A
    if (!extracted.model.value || extracted.model.value === 'N/A' || extracted.model.confidence < 70) {
      questions.push({
        id: 'q-model',
        field: 'model',
        questionArabic: 'لم نتمكن من تحديد رقم الموديل الفني بدقة عالية. هل يرغب المدير بتحديده من الخيارات التالية؟',
        options: ['GN-B492GLCL', 'RT43K6000SL', 'إدخال رقم موديل آخر يدوياً'],
        recommendation: 'رقم الموديل يساعد العميل على مراجعة المواصفات بموقع الشركة المصنعة.',
      });
    }

    // 2. Category Verification
    if (extracted.categoryName.confidence < 75) {
      questions.push({
        id: 'q-category',
        field: 'categoryId',
        questionArabic: 'يرجى تأكيد تخصص القسم الصحيح لهذا الجهاز بالمعرض:',
        options: ['ثلاجات وديب فريزر', 'غسالات ملابس وأطباق', 'شاشات وتلفزيونات', 'بوتاجازات وأفران'],
        recommendation: 'تم اقتراح التخمين الأكثر ملاءمة بناءً على كلمات النص.',
      });
    }

    // 3. Purchase Cost Verification
    if (extracted.purchaseCost.confidence < 70 || extracted.purchaseCost.value === 0) {
      questions.push({
        id: 'q-purchaseCost',
        field: 'purchaseCost',
        questionArabic: 'تكلفة الشراء الأساسية غير واضحة بالنص. يرجى اختيار النطاق التقديري لتكلفة الشراء:',
        options: ['10,000 - 15,000 ج.م', '15,000 - 20,000 ج.م', '20,000 - 30,000 ج.م', 'تحديد تكلفة دقيقة يدوياً'],
      });
    }

    return questions;
  }
}
