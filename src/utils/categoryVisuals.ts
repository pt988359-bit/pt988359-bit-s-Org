import { DEFAULT_CATEGORY_PLACEHOLDER } from '../constants/placeholders';

interface CategoryVisualTheme {
  name: string;
  startColor: string;
  midColor: string;
  endColor: string;
  accentColor: string;
  svgPaths: string;
  decorations: string;
}

const THEMES: Record<string, CategoryVisualTheme> = {
  Refrigerator: {
    name: 'ثلاجات وديب فريزر',
    startColor: '#05192d',
    midColor: '#0c4a6e',
    endColor: '#0284c7',
    accentColor: '#38bdf8',
    svgPaths:
      '<path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/><path d="M5 10h14"/><path d="M15 7v6"/>',
    decorations: `
      <circle cx="400" cy="195" r="95" fill="none" stroke="#38bdf8" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="6 6"/>
      <circle cx="400" cy="195" r="125" fill="none" stroke="#38bdf8" stroke-opacity="0.12" stroke-width="1"/>
      <path d="M290 120 L300 130 M510 120 L500 130 M290 270 L300 260 M510 270 L500 260" stroke="#38bdf8" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  WashingMachine: {
    name: 'غسالات ملابس وأطباق',
    startColor: '#0c122c',
    midColor: '#1e1b4b',
    endColor: '#4338ca',
    accentColor: '#818cf8',
    svgPaths:
      '<path d="M3 6h3"/><path d="M17 6h.01"/><rect width="18" height="20" x="3" y="2" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5"/>',
    decorations: `
      <circle cx="400" cy="195" r="90" fill="none" stroke="#818cf8" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="10 8"/>
      <circle cx="400" cy="195" r="120" fill="none" stroke="#818cf8" stroke-opacity="0.15" stroke-width="1.5"/>
      <circle cx="340" cy="140" r="16" fill="#818cf8" fill-opacity="0.08"/>
      <circle cx="460" cy="250" r="22" fill="#818cf8" fill-opacity="0.06"/>
    `,
  },
  Tv: {
    name: 'شاشات وتلفزيونات ذكية',
    startColor: '#180728',
    midColor: '#4a044e',
    endColor: '#7e22ce',
    accentColor: '#c084fc',
    svgPaths:
      '<path d="m17 2-5 5-5-5"/><rect width="20" height="15" x="2" y="7" rx="2"/>',
    decorations: `
      <rect x="260" y="85" width="280" height="175" rx="18" fill="none" stroke="#c084fc" stroke-opacity="0.18" stroke-width="1.5"/>
      <rect x="280" y="100" width="240" height="145" rx="12" fill="none" stroke="#c084fc" stroke-opacity="0.1" stroke-width="1"/>
      <circle cx="400" cy="195" r="110" fill="none" stroke="#c084fc" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="4 8"/>
    `,
  },
  Flame: {
    name: 'بوتاجازات وأفران بلت إن',
    startColor: '#260a04',
    midColor: '#7c2d12',
    endColor: '#ea580c',
    accentColor: '#fb923c',
    svgPaths:
      '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
    decorations: `
      <circle cx="400" cy="195" r="95" fill="none" stroke="#fb923c" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8 6"/>
      <path d="M320 270 C360 250, 440 250, 480 270" fill="none" stroke="#fb923c" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="400" cy="195" r="130" fill="none" stroke="#fb923c" stroke-opacity="0.12" stroke-width="1"/>
    `,
  },
  Wind: {
    name: 'أجهزة التكييف والتبريد',
    startColor: '#032020',
    midColor: '#115e59',
    endColor: '#0d9488',
    accentColor: '#2dd4bf',
    svgPaths:
      '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    decorations: `
      <path d="M250 145 C320 120, 480 120, 550 145" fill="none" stroke="#2dd4bf" stroke-opacity="0.25" stroke-width="2" stroke-linecap="round"/>
      <path d="M270 245 C340 270, 460 270, 530 245" fill="none" stroke="#2dd4bf" stroke-opacity="0.25" stroke-width="2" stroke-linecap="round"/>
      <circle cx="400" cy="195" r="105" fill="none" stroke="#2dd4bf" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="8 6"/>
    `,
  },
  Microwave: {
    name: 'أجهزة المطبخ والمنزل',
    startColor: '#031c14',
    midColor: '#064e3b',
    endColor: '#059669',
    accentColor: '#34d399',
    svgPaths:
      '<rect width="20" height="15" x="2" y="4" rx="2"/><rect width="8" height="7" x="6" y="8" rx="1"/><path d="M18 8v7"/><path d="M6 19v2"/><path d="M18 19v2"/>',
    decorations: `
      <circle cx="400" cy="195" r="95" fill="none" stroke="#34d399" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8 6"/>
      <circle cx="400" cy="195" r="125" fill="none" stroke="#34d399" stroke-opacity="0.12" stroke-width="1"/>
      <rect x="290" y="105" width="220" height="155" rx="16" fill="none" stroke="#34d399" stroke-opacity="0.15" stroke-width="1.5"/>
    `,
  },
  Coffee: {
    name: 'ماكينات ومحضرات القهوة',
    startColor: '#1f0d04',
    midColor: '#78350f',
    endColor: '#b45309',
    accentColor: '#facc15',
    svgPaths:
      '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    decorations: `
      <circle cx="400" cy="195" r="95" fill="none" stroke="#facc15" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="400" cy="195" r="125" fill="none" stroke="#facc15" stroke-opacity="0.12" stroke-width="1"/>
    `,
  },
  Default: {
    name: 'قسم معتمد',
    startColor: '#0b1324',
    midColor: '#1e293b',
    endColor: '#2563eb',
    accentColor: '#60a5fa',
    svgPaths:
      '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
    decorations: `
      <circle cx="400" cy="195" r="100" fill="none" stroke="#60a5fa" stroke-opacity="0.2" stroke-width="2" stroke-dasharray="8 6"/>
      <circle cx="400" cy="195" r="130" fill="none" stroke="#60a5fa" stroke-opacity="0.1" stroke-width="1.5"/>
    `,
  },
};

/**
 * Determine the matching theme key for a category based on iconName, slug, and name.
 */
function resolveThemeKey(iconName?: string, categoryName?: string, slug?: string): string {
  const normIcon = (iconName || '').trim().toLowerCase();
  const normName = (categoryName || '').trim().toLowerCase();
  const normSlug = (slug || '').trim().toLowerCase();

  // 1. Check exact/common iconName
  if (normIcon === 'refrigerator' || normIcon === 'fridge') return 'Refrigerator';
  if (normIcon === 'washingmachine' || normIcon === 'washer') return 'WashingMachine';
  if (normIcon === 'tv' || normIcon === 'screen') return 'Tv';
  if (normIcon === 'flame' || normIcon === 'cooker' || normIcon === 'oven') return 'Flame';
  if (normIcon === 'wind' || normIcon === 'aircon') return 'Wind';
  if (normIcon === 'microwave') return 'Microwave';
  if (normIcon === 'coffee') return 'Coffee';

  // 2. Check keywords in slug or name (Arabic & English)
  const combined = `${normName} ${normSlug}`;
  if (/ثلاج|فريزر|refrigerat|freezer|fridge/.test(combined)) return 'Refrigerator';
  if (/غسال|أطباق|ملابس|washer|wash|dishwash|laundry/.test(combined)) return 'WashingMachine';
  if (/شاش|تلفزيون|تلفاز|smart-tv|oled|qled|tv|screen/.test(combined)) return 'Tv';
  if (/بوتاجاز|فرن|مسطح|cooker|oven|stove|flame/.test(combined)) return 'Flame';
  if (/تكييف|تبريد|إنفرتر|air-condition|aircon|cooling|wind/.test(combined)) return 'Wind';
  if (/ميكروويف|قلاي|مطبخ|خلاط|microwave|kitchen|small-appliance/.test(combined)) return 'Microwave';
  if (/قهوة|كوفي|اسبريسو|coffee|espresso/.test(combined)) return 'Coffee';

  return 'Default';
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an ultra-crisp, locally synthesized SVG cover image data URI
 * with distinct styling, colors, and centered icon for each category.
 */
export function generateCategoryCoverSvg(
  iconName?: string,
  categoryName?: string,
  slug?: string
): string {
  const themeKey = resolveThemeKey(iconName, categoryName, slug);
  const theme = THEMES[themeKey] || THEMES.Default;
  const displayName = categoryName ? escapeXml(categoryName) : theme.name;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <!-- Background Multi-Stop Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.startColor}"/>
      <stop offset="55%" stop-color="${theme.midColor}"/>
      <stop offset="100%" stop-color="${theme.endColor}"/>
    </linearGradient>

    <!-- Radial Center Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="${theme.accentColor}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="${theme.accentColor}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${theme.accentColor}" stop-opacity="0"/>
    </radialGradient>

    <!-- Glassmorphic Icon Backdrop Gradient -->
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>

    <!-- Subtle Texture Pattern -->
    <pattern id="dotPattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#ffffff" fill-opacity="0.06"/>
    </pattern>
  </defs>

  <!-- Background Canvas -->
  <rect width="800" height="480" fill="url(#bgGrad)"/>
  <rect width="800" height="480" fill="url(#dotPattern)"/>
  <circle cx="400" cy="195" r="240" fill="url(#centerGlow)"/>

  <!-- Category Specific Ambient Decorations -->
  ${theme.decorations}

  <!-- Glassmorphic Central Icon Plate -->
  <rect x="330" y="125" width="140" height="140" rx="36" fill="url(#glassGrad)" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
  <circle cx="400" cy="195" r="58" fill="${theme.accentColor}" fill-opacity="0.12"/>

  <!-- Centered Lucide Icon (Scaled to 100px) -->
  <g transform="translate(400, 195) scale(4.2) translate(-12, -12)" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    ${theme.svgPaths}
  </g>

  <!-- Category Title & Showroom Signature -->
  <text x="400" y="330" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="0.3">${displayName}</text>
  <text x="400" y="365" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1">معرض PRO TECK • أجهزة مفحوصة بالكامل</text>

  <!-- High-Tech Corner Markers -->
  <path d="M 30 50 L 30 30 L 50 30" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" fill="none"/>
  <path d="M 770 50 L 770 30 L 750 30" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" fill="none"/>
  <path d="M 30 430 L 30 450 L 50 450" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" fill="none"/>
  <path d="M 770 430 L 770 450 L 750 450" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" fill="none"/>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Validates whether a given URL is a real custom uploaded cover image
 * (rather than missing, empty, or the default placeholder).
 */
export function isCustomCoverImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;
  if (trimmed === DEFAULT_CATEGORY_PLACEHOLDER) return false;
  // Check if it's the old gray placeholder SVG with "لا توجد صورة متاحة"
  if (trimmed.includes('لا توجد صورة متاحة') || trimmed.includes('%D9%84%D8%A7%20%D8%AA%D9%88%D8%AC%D8%AF%20%D8%B5%D9%88%D8%B1%D8%A9')) {
    return false;
  }
  return true;
}

/**
 * Returns the real uploaded coverImage if present, or dynamically generates
 * an appropriate category visual SVG cover based on iconName and categoryName.
 */
export function getCategoryCover(category: {
  coverImage?: string;
  iconName?: string;
  name?: string;
  slug?: string;
}): string {
  if (isCustomCoverImage(category.coverImage)) {
    return category.coverImage!;
  }
  return generateCategoryCoverSvg(category.iconName, category.name, category.slug);
}
