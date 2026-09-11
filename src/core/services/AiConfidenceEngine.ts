/**
 * AI Confidence Engine Service (TASK-012 STEP 3 & 8)
 * Responsible for evaluating confidence ratings and assigning status badges (Green / Yellow / Red).
 */

import { ConfidenceStatus, FieldExtractionResult } from '../../types/aiProductIntake';

export class AiConfidenceEngine {
  /**
   * Evaluates score into a structured FieldExtractionResult with Green/Yellow/Red status
   */
  public static evaluateField<T>(
    value: T,
    rawConfidenceScore?: number,
    missingCondition?: boolean
  ): FieldExtractionResult<T> {
    const isMissing = missingCondition ?? (value === undefined || value === null || value === '' || value === 'غير محدد' || value === 'N/A' || (typeof value === 'number' && Number.isNaN(value)));
    
    if (isMissing) {
      return {
        value,
        confidence: 0,
        status: 'red',
        note: 'بيان غير متوفر بالنص الأصلي - يتطلب إدخال يدوياً',
      };
    }

    const confidence = Math.min(100, Math.max(0, rawConfidenceScore ?? 90));

    let status: ConfidenceStatus = 'green';
    let note = 'تم الاستخراج بنجاح وبنسبة ثقة عالية';

    if (confidence < 60) {
      status = 'red';
      note = 'نسبة ثقة منخفضة - يرجى المراجعة والتدقيق';
    } else if (confidence < 85) {
      status = 'yellow';
      note = 'استخراج تقديري - يفضل التحقق من الصحة';
    }

    return {
      value,
      confidence,
      status,
      note,
    };
  }

  /**
   * Computes overall average confidence score for the extraction
   */
  public static computeOverallConfidence(fields: FieldExtractionResult<any>[]): number {
    if (fields.length === 0) return 0;
    const sum = fields.reduce((acc, f) => acc + f.confidence, 0);
    return Math.round(sum / fields.length);
  }
}
