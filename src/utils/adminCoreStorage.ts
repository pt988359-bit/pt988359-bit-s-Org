import {
  AdminNotification,
  ApprovalItem,
  ActivityLogEntry,
  RecentWorkItem,
  AdminDraft,
  ServiceHealthStatus,
  ActiveSession,
  FailedLoginAttempt,
} from '../types/adminCore';

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [];

export const INITIAL_APPROVALS: ApprovalItem[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLogEntry[] = [];

export const INITIAL_RECENT_WORK: RecentWorkItem[] = [];

export const INITIAL_DRAFTS: AdminDraft[] = [];

export const INITIAL_SYSTEM_SERVICES: ServiceHealthStatus[] = [
  {
    name: 'قاعدة بيانات المعرض الرئيسية',
    key: 'database',
    status: 'operational',
    latencyMs: 14,
    lastChecked: '2026-07-27 16:38',
    details: 'Firestore Cloud - جميع المؤشرات مستقرة ومتزامنة',
  },
  {
    name: 'حارس الذكاء الاصطناعي (Gemini AI Engine)',
    key: 'ai_service',
    status: 'operational',
    latencyMs: 120,
    lastChecked: '2026-07-27 16:38',
    details: 'محرك التحليل والتسعير التلقائي جاهز لتقييم الحجوزات',
  },
  {
    name: 'بوابة واتساب الإشعارات والفواتير',
    key: 'whatsapp',
    status: 'operational',
    latencyMs: 85,
    lastChecked: '2026-07-27 16:35',
    details: 'متصل بحساب المعرض الرسمي - جاهز للربط الفوري',
  },
  {
    name: 'منظومة إنستا باي والتحقق التلقائي',
    key: 'instapay',
    status: 'operational',
    latencyMs: 45,
    lastChecked: '2026-07-27 16:37',
    details: 'مراقبة التحويلات الآلية تعمل بكفاءة 100%',
  },
  {
    name: 'مخزن ملفات وصور الأجهزة (Cloud Storage)',
    key: 'storage',
    status: 'operational',
    latencyMs: 22,
    lastChecked: '2026-07-27 16:30',
    details: 'تخزين صور الفرز الأول والعيوب البسيطة متوفر بسرعة فائقة',
  },
  {
    name: 'واجهات الربط الفني (Core API)',
    key: 'api',
    status: 'operational',
    latencyMs: 18,
    lastChecked: '2026-07-27 16:38',
    details: 'جميع النقاط العائدة لطلب الشراء والحجز متوفرة',
  },
  {
    name: 'خادم البريد الإلكتروني والضمان',
    key: 'email',
    status: 'operational',
    latencyMs: 65,
    lastChecked: '2026-07-27 16:25',
    details: 'خدمة إرسال إيصالات الضمان مستقرة',
  },
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [];

export const INITIAL_FAILED_LOGINS: FailedLoginAttempt[] = [];
