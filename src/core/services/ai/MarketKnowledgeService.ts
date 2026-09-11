/**
 * Market Knowledge Service (TASK-013 PART 6)
 * Understands Egyptian appliance market terminology, brand aliases, common Arabic spellings, and category synonyms.
 */

import { MarketBrandAlias } from '../../../types/aiKnowledgeEngine';

export class MarketKnowledgeService {
  private static brandAliases: MarketBrandAlias[] = [
    {
      canonicalName: 'LG',
      arabicName: 'ال جي',
      aliases: ['lg', 'ال جي', 'إل جي', 'الجي', 'l.g', 'l.g.'],
      countryOfOrigin: 'South Korea',
    },
    {
      canonicalName: 'Samsung',
      arabicName: 'سامسونج',
      aliases: ['samsung', 'سامسونج', 'سامسونق', 'سامسنوج', 'سماسنوج'],
      countryOfOrigin: 'South Korea',
    },
    {
      canonicalName: 'Sharp',
      arabicName: 'شارب',
      aliases: ['sharp', 'شارب', 'شرب'],
      countryOfOrigin: 'Japan',
    },
    {
      canonicalName: 'Kiriazi',
      arabicName: 'كريازي',
      aliases: ['kiriazi', 'كريازى', 'كريازي', 'كرايازي', 'كريازى مصر'],
      countryOfOrigin: 'Egypt',
    },
    {
      canonicalName: 'Toshiba',
      arabicName: 'توشيبا',
      aliases: ['toshiba', 'توشيبا', 'توشيبا العربي', 'العربي توشيبا'],
      countryOfOrigin: 'Japan',
    },
    {
      canonicalName: 'Zanussi',
      arabicName: 'زانوسي',
      aliases: ['zanussi', 'زانوسي', 'زانوسى', 'إدال زانوسي', 'إدال زانوسى'],
      countryOfOrigin: 'Italy',
    },
    {
      canonicalName: 'Beko',
      arabicName: 'بيكو',
      aliases: ['beko', 'بيكو', 'بيكو تركيا'],
      countryOfOrigin: 'Turkey',
    },
    {
      canonicalName: 'Fresh',
      arabicName: 'فرش',
      aliases: ['fresh', 'فرش', 'فريش', 'فريش مصر'],
      countryOfOrigin: 'Egypt',
    },
    {
      canonicalName: 'Whirlpool',
      arabicName: 'ويرلبول',
      aliases: ['whirlpool', 'ويرلبول', 'ويربول', 'وايربول'],
      countryOfOrigin: 'USA',
    },
    {
      canonicalName: 'Carrier',
      arabicName: 'كاريير',
      aliases: ['carrier', 'كاريير', 'كارير'],
      countryOfOrigin: 'USA',
    },
  ];

  private static categorySynonyms: Record<string, string[]> = {
    refrigerators: ['ثلاجة', 'ثلاجات', 'فريزر', 'ديب فريزر', 'ثلاجه', 'fridge', 'refrigerator', 'freezer'],
    washing_machines: ['غسالة', 'غسالات', 'غسالة ملابس', 'غسالة أطباق', 'غسالة صحون', 'washer', 'washing machine'],
    tvs: ['شاشة', 'شاشات', 'تلفزيون', 'تلفاز', 'سمارت', 'tv', 'television', 'led', 'oled'],
    cookers: ['بوتاجاز', 'بوتجاز', 'فرن', 'ميكروويف', 'مسطح', 'cooker', 'stove', 'oven'],
    air_conditioners: ['تكييف', 'تكييفات', 'مكيف', 'مكيف هواء', 'air conditioner', 'ac'],
  };

  /**
   * Normalizes brand name to canonical brand using Egyptian aliases
   */
  public static normalizeBrand(input: string): string {
    if (!input) return 'غير محدد';
    const clean = input.trim().toLowerCase();
    for (const b of this.brandAliases) {
      if (b.aliases.some((a) => a.toLowerCase() === clean || clean.includes(a.toLowerCase()))) {
        return b.canonicalName;
      }
    }
    return input.trim();
  }

  /**
   * Normalizes category ID based on Arabic or English synonyms
   */
  public static normalizeCategory(input: string): string | null {
    if (!input) return null;
    const clean = input.trim().toLowerCase();
    for (const [catId, synonyms] of Object.entries(this.categorySynonyms)) {
      if (synonyms.some((s) => clean.includes(s.toLowerCase()))) {
        return catId;
      }
    }
    return null;
  }

  /**
   * Returns list of all known brand aliases for prompt builder injection
   */
  public static getBrandAliasesList(): MarketBrandAlias[] {
    return this.brandAliases;
  }
}
