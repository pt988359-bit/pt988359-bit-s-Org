/**
 * Specification Knowledge Service (TASK-013 PART 7)
 * Defines dynamic technical specification templates per appliance category.
 */

import { CategorySpecTemplate } from '../../../types/aiKnowledgeEngine';

export class SpecificationKnowledgeService {
  private static templates: Record<string, CategorySpecTemplate> = {
    refrigerators: {
      categoryId: 'refrigerators',
      categoryName: 'ثلاجات وديب فريزر',
      requiredSpecs: ['السعة اللترية / الأقدام', 'تكنولوجيا التبريد (نوفروست/ديفروست)', 'نوع الكومبريسور (انفرتر/عادي)', 'عدد الأبواب'],
      recommendedSpecs: ['مستوى كفاءة الطاقة', 'لون الجسم والطلاء', 'شاشة ديجيتال', 'أبعاد الجهاز (عرض*عمق*ارتفاع)'],
    },
    washing_machines: {
      categoryId: 'washing_machines',
      categoryName: 'غسالات ملابس وأطباق',
      requiredSpecs: ['سعة الغسيل (كجم)', 'معدل الدوران (RPM)', 'نوع التحميل (أمامي/علوي)', 'نوع الموتور (انفرتر/عادي)'],
      recommendedSpecs: ['عدد البرامج', 'خاصية البخار', 'سخان داخلي', 'مستوى الضوضاء'],
    },
    tvs: {
      categoryId: 'tvs',
      categoryName: 'شاشات وتلفزيونات',
      requiredSpecs: ['حجم الشاشة بالبوصة', 'دقة العرض (4K/FHD)', 'نظام التشغيل (Smart/Android/WebOS)', 'تكنولوجيا الشاشة (OLED/QLED/LED)'],
      recommendedSpecs: ['عدد منافذ HDMI/USB', 'معدل التحديث (Hz)', 'تكنولوجيا الصوت', 'الريمووت الماوس المرفق'],
    },
    cookers: {
      categoryId: 'cookers',
      categoryName: 'بوتاجازات وأفران',
      requiredSpecs: ['عدد الشعلات', 'الأبعاد (60x90 / 60x60)', 'نوع الإشعال (ذاتي/عادي)', 'أمان كامل للشعلات والفرن'],
      recommendedSpecs: ['مروحة توزيع الحرارة بالفرن', 'نوع الحوامل (زهر/حديد)', 'شواية متحركة', 'تايمر ديجيتال'],
    },
    air_conditioners: {
      categoryId: 'air_conditioners',
      categoryName: 'تكييفات ومكيفات هواء',
      requiredSpecs: ['القدرة بالحصان (1.5 / 2.25 / 3)', 'نوع التبريد (بارد فقط / بارد ساخن)', 'تكنولوجيا الانفرتر'],
      recommendedSpecs: ['نوع الفريون', 'خاصية التبريد السريع Turbo', 'خاصية البلازما وتنقيه الهواء', 'خاصية الاتصال الذكي Wi-Fi'],
    },
  };

  /**
   * Retrieves specification template for category
   */
  public static getTemplateForCategory(categoryId: string): CategorySpecTemplate {
    return (
      this.templates[categoryId] || {
        categoryId,
        categoryName: 'أجهزة منزلية عامة',
        requiredSpecs: ['السعة / القدرة', 'الحالة الفنية والجسم', 'تكنولوجيا التشغيل'],
        recommendedSpecs: ['اللون والطلاء', 'أبعاد الجهاز', 'الضمان المرفق'],
      }
    );
  }

  public static getAllTemplates(): CategorySpecTemplate[] {
    return Object.values(this.templates);
  }
}
