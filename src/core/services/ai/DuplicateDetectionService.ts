/**
 * Duplicate Detection Service (TASK-013 PART 11)
 * Compares new product candidates with existing showroom inventory to detect duplicates.
 */

import { DuplicateDetectionMatch } from '../../../types/aiKnowledgeEngine';
import { EnrichedProduct } from '../../../types/productStudio';

export class DuplicateDetectionService {
  /**
   * Scans existing products for potential matches with incoming extracted data or title/model
   */
  public static findPotentialDuplicates(
    candidate: { title: string; brand: string; model?: string; barcode?: string },
    existingProducts: EnrichedProduct[]
  ): DuplicateDetectionMatch[] {
    const matches: DuplicateDetectionMatch[] = [];

    const candBrand = (candidate.brand || '').toLowerCase().trim();
    const candModel = (candidate.model || '').toLowerCase().trim();
    const candTitle = (candidate.title || '').toLowerCase().trim();

    for (const prod of existingProducts) {
      let similarityScore = 0;
      const matchReasons: string[] = [];

      const prodBrand = (prod.brand || '').toLowerCase().trim();
      const prodModel = (prod.model || '').toLowerCase().trim();
      const prodTitle = (prod.title || '').toLowerCase().trim();

      // Model Match (High weight)
      if (candModel && candModel !== 'n/a' && candModel.length > 3 && prodModel === candModel) {
        similarityScore += 60;
        matchReasons.push(`تطابق تام في رقم الموديل (${prod.model})`);
      }

      // Brand match
      if (candBrand && prodBrand && (candBrand === prodBrand || candBrand.includes(prodBrand) || prodBrand.includes(candBrand))) {
        similarityScore += 25;
        matchReasons.push(`تطابق الماركة (${prod.brand})`);
      }

      // Title Substring / Fuzzy match
      if (candTitle && prodTitle && (candTitle.includes(prodTitle) || prodTitle.includes(candTitle))) {
        similarityScore += 20;
        matchReasons.push('تطابق كبير في كلمات مسمى الجهاز');
      }

      if (similarityScore >= 50) {
        matches.push({
          productId: prod.id,
          title: prod.title,
          brand: prod.brand,
          model: prod.model,
          similarityScore: Math.min(100, similarityScore),
          matchReason: matchReasons.join(' • '),
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}
