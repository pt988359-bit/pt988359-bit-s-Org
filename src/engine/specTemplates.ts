import { SpecTemplate, Category, ProductSpec } from '../types';

export const DEFAULT_SPEC_TEMPLATES: Record<string, SpecTemplate> = {
  'refrigerators-freezers': {
    id: 'tmpl-refrigerators',
    categoryId: 'cat-1',
    categoryName: 'ثلاجات وديب فريزر',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'capacity_feet',
        labelArabic: 'السعة القدمية',
        labelEnglish: 'Capacity (Feet)',
        fieldType: 'number',
        unit: 'قدم',
        required: true,
        group: 'السعة والأبعاد',
      },
      {
        key: 'capacity_liters',
        labelArabic: 'السعة باللتر',
        labelEnglish: 'Capacity (Liters)',
        fieldType: 'number',
        unit: 'ليتر',
        required: false,
        group: 'السعة والأبعاد',
      },
      {
        key: 'cooling_type',
        labelArabic: 'تقنية التبريد',
        labelEnglish: 'Cooling System',
        fieldType: 'select',
        options: ['نوفروست بخار', 'ديفروست ثلج', 'انفرتر ديجيتال نوفروست', 'بلازما كلاستر انفرتر'],
        required: true,
        group: 'الأداء والتقنية',
      },
      {
        key: 'motor_type',
        labelArabic: 'نوع الموتور',
        labelEnglish: 'Motor / Compressor Type',
        fieldType: 'select',
        options: ['Inverter موفر للكهرباء', 'قياسي Standard', 'Tropical استوائي heavy duty'],
        required: true,
        group: 'الأداء والتقنية',
      },
      {
        key: 'door_count',
        labelArabic: 'عدد الأبواب',
        labelEnglish: 'Door Count',
        fieldType: 'select',
        options: ['2 باب', '3 باب', '4 باب Side-by-Side', 'باب واحد فريزر'],
        required: true,
        group: 'التصميم',
      },
      {
        key: 'color_finish',
        labelArabic: 'اللون والتشطيب',
        labelEnglish: 'Color & Finish',
        fieldType: 'select',
        options: ['فضائي استانلس ستيل', 'أسود زجاجي ديجيتال', 'أبيض ناصع', 'رمادي متدرج Dark Stainless'],
        required: false,
        group: 'التصميم',
      },
      {
        key: 'energy_rating',
        labelArabic: 'كفاءة الطاقة',
        labelEnglish: 'Energy Efficiency Rating',
        fieldType: 'select',
        options: ['A+++ الأعلى توفيراً', 'A++', 'A+', 'A'],
        required: false,
        group: 'كفاءة الطاقة',
      }
    ]
  },

  'washers-dishwashers': {
    id: 'tmpl-washers',
    categoryId: 'cat-2',
    categoryName: 'غسالات ملابس وأطباق',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'wash_capacity',
        labelArabic: 'سعة الغسيل',
        labelEnglish: 'Washing Capacity',
        fieldType: 'number',
        unit: 'كيلو جرام',
        required: true,
        group: 'الأداء والسعة',
      },
      {
        key: 'rpm',
        labelArabic: 'سرعة الدوران RPM',
        labelEnglish: 'Max Spin Speed',
        fieldType: 'select',
        options: ['1000 RPM', '1200 RPM', '1400 RPM', '1600 RPM'],
        required: true,
        group: 'الأداء والسعة',
      },
      {
        key: 'motor_type',
        labelArabic: 'نوع المحرك',
        labelEnglish: 'Motor Type',
        fieldType: 'select',
        options: ['Inverter Direct Drive دفع مباشر', 'Inverter Belt انفرتر سير', 'قياسي Universal'],
        required: true,
        group: 'المحرك والتقنية',
      },
      {
        key: 'steam_cycle',
        labelArabic: 'تقنية التعقيم بالبخار',
        labelEnglish: 'Steam Wash Feature',
        fieldType: 'boolean',
        required: false,
        group: 'المحرك والتقنية',
      },
      {
        key: 'program_count',
        labelArabic: 'عدد برامج الغسيل',
        labelEnglish: 'Number of Programs',
        fieldType: 'number',
        unit: 'برنامج',
        required: false,
        group: 'البرامج والوظائف',
      },
      {
        key: 'water_consumption',
        labelArabic: 'استهلاك المياه',
        labelEnglish: 'Water Consumption',
        fieldType: 'text',
        unit: 'لتر / دورة',
        required: false,
        group: 'كفاءة الطاقة والمياه',
      }
    ]
  },

  'smart-tvs': {
    id: 'tmpl-smart-tvs',
    categoryId: 'cat-3',
    categoryName: 'شاشات وتلفزيونات ذكية',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'display_size',
        labelArabic: 'حجم الشاشة',
        labelEnglish: 'Display Size',
        fieldType: 'select',
        options: ['32 بوصة', '43 بوصة', '50 بوصة', '55 بوصة', '65 بوصة', '75 بوصة', '85 بوصة'],
        required: true,
        group: 'العرض والتصوير',
      },
      {
        key: 'resolution',
        labelArabic: 'دقة العرض',
        labelEnglish: 'Resolution',
        fieldType: 'select',
        options: ['4K Ultra HD (3840x2160)', 'Full HD (1920x1080)', '8K Ultra HD', 'HD Ready (1366x768)'],
        required: true,
        group: 'العرض والتصوير',
      },
      {
        key: 'display_tech',
        labelArabic: 'تقنية الشاشة',
        labelEnglish: 'Display Panel Tech',
        fieldType: 'select',
        options: ['OLED ألوان ذاتية الإضاءة', 'QLED نقاط كوانتوم', 'Crystal UHD LED', 'NanoCell LED'],
        required: true,
        group: 'العرض والتصوير',
      },
      {
        key: 'refresh_rate',
        labelArabic: 'معدل التحديث',
        labelEnglish: 'Refresh Rate',
        fieldType: 'select',
        options: ['60Hz', '120Hz Native (للألعاب والرياضة)', '144Hz Turbo'],
        required: false,
        group: 'الأداء والقيمنج',
      },
      {
        key: 'smart_os',
        labelArabic: 'نظام التشغيل الذكي',
        labelEnglish: 'Smart OS',
        fieldType: 'select',
        options: ['Google TV / Android TV', 'Samsung Tizen OS', 'LG webOS', 'VIDAA OS'],
        required: true,
        group: 'الذكاء والاتصال',
      },
      {
        key: 'ports_hdmi',
        labelArabic: 'منافذ HDMI',
        labelEnglish: 'HDMI Ports',
        fieldType: 'select',
        options: ['2 منافذ HDMI', '3 منافذ HDMI', '4 منافذ HDMI 2.1'],
        required: false,
        group: 'الذكاء والاتصال',
      }
    ]
  },

  'cookers-ovens': {
    id: 'tmpl-cookers',
    categoryId: 'cat-4',
    categoryName: 'بوتاجازات وأفران بلت إن',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'burner_count',
        labelArabic: 'عدد الشعلات',
        labelEnglish: 'Burner Count',
        fieldType: 'select',
        options: ['4 شعلة', '5 شعلة', '6 شعلة', 'سطح سيراميك كهربائي'],
        required: true,
        group: 'المواصفات الأساسية',
      },
      {
        key: 'dimensions',
        labelArabic: 'الأبعاد القياسية',
        labelEnglish: 'Dimensions',
        fieldType: 'select',
        options: ['90 × 60 سم', '80 × 60 سم', '60 × 60 سم', 'بلت إن 90 سم', 'بلت إن 60 سم'],
        required: true,
        group: 'المواصفات الأساسية',
      },
      {
        key: 'full_safety',
        labelArabic: 'نظام الأمان الكامل',
        labelEnglish: 'Full Safety Feature',
        fieldType: 'boolean',
        required: true,
        group: 'الأمان والخامات',
      },
      {
        key: 'material',
        labelArabic: 'خامة الهيكل',
        labelEnglish: 'Body Material',
        fieldType: 'select',
        options: ['استانلس ستيل ثقيل مقاوم للبصمات', 'زجاج حراري أسود Tempered Glass', 'استانلس مط'],
        required: false,
        group: 'الأمان والخامات',
      },
      {
        key: 'convection_fan',
        labelArabic: 'مروحة توزيع الحرارة بالفرن',
        labelEnglish: 'Convection Fan',
        fieldType: 'boolean',
        required: false,
        group: 'الفرن والشواية',
      }
    ]
  },

  'air-conditioners': {
    id: 'tmpl-aircon',
    categoryId: 'cat-5',
    categoryName: 'أجهزة التكييف والتبريد',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'horsepower',
        labelArabic: 'القدرة بالحصان',
        labelEnglish: 'Horsepower Capacity',
        fieldType: 'select',
        options: ['1.5 حصان (حتى 12م²)', '2.25 حصان (حتى 20م²)', '3 حصان (حتى 28م²)', '4 حصان', '5 حصان'],
        required: true,
        group: 'القدرة والتغطية',
      },
      {
        key: 'system_type',
        labelArabic: 'نظام التشغيل',
        labelEnglish: 'System Mode',
        fieldType: 'select',
        options: ['انفرتر بارد / ساخن', 'انفرتر بارد فقط', 'بارد / ساخن قياسي', 'بارد فقط قياسي'],
        required: true,
        group: 'القدرة والتغطية',
      },
      {
        key: 'freon_type',
        labelArabic: 'نوع الفريون',
        labelEnglish: 'Refrigerant Type',
        fieldType: 'select',
        options: ['R410A صديق للبيئة', 'R32 عالي الكفاءة'],
        required: false,
        group: 'التقنية والبيئة',
      },
      {
        key: 'plasma_filter',
        labelArabic: 'فلاتر البلازما لتنقيه الهواء',
        labelEnglish: 'Plasma Air Filter',
        fieldType: 'boolean',
        required: false,
        group: 'التقنية والبيئة',
      }
    ]
  },

  'kitchen-small-appliances': {
    id: 'tmpl-small-appliances',
    categoryId: 'cat-6',
    categoryName: 'أجهزة المطبخ والمنزل',
    version: 1,
    createdAt: '2026-07-27T00:00:00Z',
    updatedAt: '2026-07-27T00:00:00Z',
    fields: [
      {
        key: 'power_watt',
        labelArabic: 'القدرة بالوات',
        labelEnglish: 'Power (Watts)',
        fieldType: 'number',
        unit: 'وات',
        required: false,
        group: 'المواصفات',
      },
      {
        key: 'capacity_volume',
        labelArabic: 'السعة الحجمية',
        labelEnglish: 'Capacity',
        fieldType: 'text',
        required: false,
        group: 'المواصفات',
      },
      {
        key: 'control_type',
        labelArabic: 'طريقة التحكم',
        labelEnglish: 'Control Type',
        fieldType: 'select',
        options: ['شاشة لمس Touch Screen', 'مفاتيح ديجيتال', 'أكرة يدوية Manual'],
        required: false,
        group: 'المواصفات',
      }
    ]
  }
};

/**
 * Retrieves the appropriate SpecTemplate for a given Category or Category Slug
 */
export function getSpecTemplateForCategory(category: Category): SpecTemplate {
  if (category.customSpecTemplate && category.customSpecTemplate.length > 0) {
    return {
      id: `tmpl-${category.id}`,
      categoryId: category.id,
      categoryName: category.name,
      version: 1,
      fields: category.customSpecTemplate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Fallback to pre-built template by slug or ID
  if (DEFAULT_SPEC_TEMPLATES[category.slug]) {
    return DEFAULT_SPEC_TEMPLATES[category.slug];
  }

  // Default generic template
  return {
    id: `tmpl-generic-${category.id}`,
    categoryId: category.id,
    categoryName: category.name,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        key: 'brand_model',
        labelArabic: 'الماركة والموديل',
        labelEnglish: 'Brand & Model',
        fieldType: 'text',
        required: true,
        group: 'عام',
      },
      {
        key: 'warranty_info',
        labelArabic: 'حالة الضمان',
        labelEnglish: 'Warranty Info',
        fieldType: 'text',
        required: false,
        group: 'عام',
      },
      {
        key: 'power_spec',
        labelArabic: 'المواصفات الكهربائية',
        labelEnglish: 'Electrical Spec',
        fieldType: 'text',
        required: false,
        group: 'الأداء',
      }
    ]
  };
}

/**
 * Validates specifications array against template requirements
 */
export function validateSpecsAgainstTemplate(specs: ProductSpec[], template: SpecTemplate): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of template.fields) {
    if (field.required) {
      const match = specs.find(s => s.key === field.key || s.label.toLowerCase().includes(field.labelArabic.toLowerCase()));
      if (!match || !match.value || match.value.trim() === '') {
        missingFields.push(field.labelArabic);
      }
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}
