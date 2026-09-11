/**
 * Command Registry Service (TASK-014)
 * Provides static and dynamic suggestions, autocomplete matching, favorite command management, and recent commands history.
 */

import { CommandSuggestion, FavoriteCommand } from '../../../types/aiOperationsAgent';

const FAVORITE_COMMANDS_KEY = 'proteck_ai_favorite_commands_v1';
const RECENT_QUERIES_KEY = 'proteck_ai_recent_queries_v1';

export class CommandRegistryService {
  private static staticSuggestions: CommandSuggestion[] = [
    // Pages & Navigation
    { id: 'sug-prod', label: 'الانتقال إلى الأجهزة والمخزون', query: 'افتح الأجهزة', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'Package', shortcut: 'Shift+P' },
    { id: 'sug-res', label: 'عرض الحجوزات وإدارة الطلبات', query: 'افتح الحجوزات', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'ShoppingBag', shortcut: 'Shift+R' },
    { id: 'sug-fin', label: 'لوحة الحسابات المالية والأرباح', query: 'افتح المالية', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'TrendingUp', shortcut: 'Shift+F' },
    { id: 'sug-inv', label: 'سجل الفواتير والضمان الضريبي', query: 'افتح الفواتير', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'FileText' },
    { id: 'sug-cust', label: 'دليل وشخصيات العملاء', query: 'افتح العملاء', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'Users' },
    { id: 'sug-ai', label: 'لوحة الذكاء الاصطناعي والمعرفة', query: 'افتح الذكاء الاصطناعي', category: 'pages', categoryLabelArabic: 'صفحات النظام', iconName: 'Brain' },

    // Core Actions & Intake
    { id: 'sug-add', label: 'إضافة جهاز جديد بالمعالجة الذكية (AI Intake)', query: 'إضافة جهاز جديد', category: 'products', categoryLabelArabic: 'أوامر المنتجات', iconName: 'PlusCircle', shortcut: 'Ctrl+N' },
    { id: 'sug-audit', label: 'تشغيل فحص جودة البيانات والضمان', query: 'فحص جودة البيانات', category: 'ai', categoryLabelArabic: 'ذكاء الأعمال', iconName: 'ShieldCheck' },
    { id: 'sug-price', label: 'تحليل هامش الربح والحد الأدنى للتسعير', query: 'تحليل تسعير الأجهزة', category: 'finance', categoryLabelArabic: 'الذكاء المالي', iconName: 'Zap' },
    { id: 'sug-search-lg', label: 'تصفية جميع غسالات وثلاجات LG', query: 'بحث عن LG', category: 'products', categoryLabelArabic: 'أوامر المنتجات', iconName: 'Search' },
    { id: 'sug-search-samsung', label: 'حصر شاشات وأجهزة Samsung', query: 'بحث عن سامسونج', category: 'products', categoryLabelArabic: 'أوامر المنتجات', iconName: 'Search' },
    { id: 'sug-clear-mem', label: 'مسح ذاكرة التعلم واستعادة الضبط', query: 'مسح الذاكرة', category: 'system', categoryLabelArabic: 'إدارة النظام', iconName: 'Trash2' },
  ];

  public static getSuggestions(query: string = ''): CommandSuggestion[] {
    const clean = query.trim().toLowerCase();
    if (!clean) return this.staticSuggestions;

    return this.staticSuggestions.filter(
      (s) => s.label.toLowerCase().includes(clean) || s.query.toLowerCase().includes(clean) || s.categoryLabelArabic.includes(clean)
    );
  }

  // FAVORITES MANAGEMENT
  public static getFavorites(): FavoriteCommand[] {
    try {
      const stored = localStorage.getItem(FAVORITE_COMMANDS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load favorite commands', e);
    }
    return [
      { id: 'fav-1', label: 'إضافة جهاز جديد بالـ AI', query: 'إضافة جهاز جديد', category: 'products', usageCount: 14, shortcut: 'Alt+A' },
      { id: 'fav-2', label: 'فحص جودة الضمان والمواصفات', query: 'فحص جودة البيانات', category: 'ai', usageCount: 8 },
      { id: 'fav-3', label: 'تصفية أجهزة LG بالمعرض', query: 'بحث عن LG', category: 'products', usageCount: 6 },
    ];
  }

  public static toggleFavorite(command: { label: string; query: string; category: string }): void {
    const favs = this.getFavorites();
    const existingIndex = favs.findIndex((f) => f.query === command.query);

    if (existingIndex >= 0) {
      favs.splice(existingIndex, 1);
    } else {
      favs.unshift({
        id: `fav-${Date.now()}`,
        label: command.label,
        query: command.query,
        category: command.category,
        usageCount: 1,
      });
    }

    try {
      localStorage.setItem(FAVORITE_COMMANDS_KEY, JSON.stringify(favs));
    } catch (e) {
      console.warn('Failed to save favorite commands', e);
    }
  }

  // RECENT QUERIES HISTORY
  public static getRecentQueries(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_QUERIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load recent queries', e);
    }
    return ['إضافة جهاز جديد', 'افتح الحجوزات', 'بحث عن سامسونج', 'فحص جودة البيانات'];
  }

  public static addRecentQuery(query: string): void {
    if (!query || query.trim().length < 2) return;
    const clean = query.trim();
    let recents = this.getRecentQueries().filter((q) => q !== clean);
    recents.unshift(clean);
    if (recents.length > 10) recents = recents.slice(0, 10);

    try {
      localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(recents));
    } catch (e) {
      console.warn('Failed to save recent queries', e);
    }
  }
}
