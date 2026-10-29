// Global process-level safety handlers to prevent unhandled Firebase Admin or async crashes
process.on('uncaughtException', (err) => {
  console.error('[FATAL][uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL][unhandledRejection]', reason);
});

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { processExpiredReservationsSupabaseJob } from './src/server/reservationCronSupabase';
import { getAdminAuth, getAdminDb, getAdminDbSafe } from './src/server/firebaseAdmin';
import { ADMIN_FIREBASE_UID, ADMIN_EMAIL } from './src/server/adminSessionConfig';
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from './src/server/supabaseAdmin';
import { mapItemToPostgresRow, mapPostgresRowToItem } from './src/core/storage/SupabaseStorageAdapter';
import { APP_CONFIG } from './src/core/config/appConfig';

dotenv.config();

// In-memory customer identity cache to ensure instant, crash-proof customer login
const inMemoryCustomerCache = new Map<string, any>();

// In-memory admin session storage (24-hour expiration)
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const adminSessions = new Map<string, AdminSession>();

// Cleanup expired admin sessions hourly
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Helper to parse cookies from request header
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      cookies[name] = decodeURIComponent(val);
    }
  });
  return cookies;
}

function getAdminSessionSecret(): string {
  const secret = process.env.ADMIN_ACCESS_PASSWORD;
  if (!secret || secret.trim() === '') {
    throw new Error(
      '[Security] ADMIN_ACCESS_PASSWORD غير معرّف في بيئة السيرفر. لا يمكن إصدار أو التحقق ' +
      'من جلسات الأدمن حتى يتم ضبط هذا المتغير بقيمة حقيقية.'
    );
  }
  return secret;
}

function generateAdminToken(maxAgeMs: number = 24 * 60 * 60 * 1000): string {
  const expiresAt = Date.now() + maxAgeMs;
  const secret = getAdminSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(String(expiresAt)).digest('hex');
  return `${expiresAt}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  // 1. Check in-memory session map
  const session = adminSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return true;
  }
  // 2. Check signed HMAC token format: <expiresAt>.<signature>
  const parts = token.split('.');
  if (parts.length === 2) {
    const [expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!isNaN(expiresAt) && expiresAt > Date.now()) {
      const secret = getAdminSessionSecret();
      const expectedSignature = crypto.createHmac('sha256', secret).update(expiresAtStr).digest('hex');
      try {
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
          // Re-insert into memory cache for quick subsequent lookups
          adminSessions.set(token, {
            token,
            createdAt: expiresAt - (24 * 60 * 60 * 1000),
            expiresAt,
          });
          return true;
        }
      } catch {
        return false;
      }
    }
  }
  return false;
}

function getAdminSessionToken(req: express.Request): string | null {
  // Check header first (for clients inside iframes where third-party cookies might be blocked)
  const headerToken = req.headers['x-admin-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer && bearer.includes('.')) {
      return bearer;
    }
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  return cookies['admin_session'] || null;
}

function isValidAdminSession(req: express.Request): boolean {
  const token = getAdminSessionToken(req);
  if (!token) return false;
  return verifyAdminToken(token);
}

// Middleware to enforce active Admin Access Gate session on sensitive routes
const requireAdminSession: express.RequestHandler = (req, res, next) => {
  try {
    if (!isValidAdminSession(req)) {
      return res.status(401).json({
        status: 'error',
        error: 'جلسة الأدمن غير صالحة أو منتهية. يرجى تسجيل الدخول إلى لوحة التحكم من /admin أولاً.',
      });
    }
    next();
  } catch (err: any) {
    console.warn('[AdminAccess] requireAdminSession notice:', err?.message || err);
    return res.status(500).json({
      status: 'error',
      error: err?.message || 'خطأ في التحقق من جلسة الأدمن في بيئة السيرفر',
    });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Gemini AI client lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'PRO TECK Showroom API',
      location: APP_CONFIG.address.fullArabic,
      email: 'pt988359@gmail.com',
      phone: APP_CONFIG.phonePrimary,
      workingHours: `${APP_CONFIG.workingHours.openTime} - ${APP_CONFIG.workingHours.closeTime}`,
    });
  });

  // API Info Endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: APP_CONFIG.businessName,
      brandTagline: APP_CONFIG.tagline,
      email: 'pt988359@gmail.com',
      phone: APP_CONFIG.phonePrimary,
      address: APP_CONFIG.address,
      workingHours: `${APP_CONFIG.workingHours.openTime} - ${APP_CONFIG.workingHours.closeTime}`,
    });
  });

  // Isolated Supabase Background Cron Diagnostic Endpoint (Manual Trigger Only - Protected for Admin Only)
  app.get(['/system/test-supabase-cron', '/api/system/test-supabase-cron'], requireAdminSession, async (req, res) => {
    try {
      const isDryRun = req.query.dryRun !== 'false';
      const result = await processExpiredReservationsSupabaseJob({ dryRun: isDryRun });
      res.json({
        endpoint: '/system/test-supabase-cron',
        triggeredAt: new Date().toISOString(),
        mode: isDryRun ? 'DRY_RUN (Safe Scan - No DB Mutation)' : 'MUTATION (Live Execute)',
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        endpoint: '/system/test-supabase-cron',
        status: 'error',
        error: error?.message || String(error),
      });
    }
  });

  // =========================================================================
  // ADMIN ACCESS GATEWAY ENDPOINTS (Single-Password Layer)
  // =========================================================================

  let canGenerateCustomTokens = true;
  async function tryGenerateAdminCustomToken(): Promise<string | undefined> {
    if (!canGenerateCustomTokens) {
      return undefined;
    }
    try {
      const adminAuth = getAdminAuth();
      return await adminAuth.createCustomToken(ADMIN_FIREBASE_UID, {
        role: 'superadmin',
        admin: true,
        email: ADMIN_EMAIL,
      });
    } catch (fbErr: any) {
      const errMsg = fbErr?.message || String(fbErr);
      if (errMsg.includes('signBlob') || fbErr?.code === 'auth/insufficient-permission') {
        canGenerateCustomTokens = false;
        console.info('[AdminAccess] Cloud Run service account lacks signBlob permission; admin session will operate via server-managed session tokens.');
      } else {
        console.warn('[AdminAccess] Notice: Firebase custom token generation skipped:', errMsg);
      }
      return undefined;
    }
  }

  // Login with ADMIN_ACCESS_PASSWORD
  app.post('/api/admin/access/login', async (req, res) => {
    try {
      const { password } = req.body || {};
      const expectedPassword = process.env.ADMIN_ACCESS_PASSWORD;

      if (!expectedPassword) {
        console.warn('[AdminAccess] ADMIN_ACCESS_PASSWORD is not set in server environment.');
        return res.status(500).json({
          success: false,
          error: 'متغير ADMIN_ACCESS_PASSWORD غير معرّف في بيئة السيرفر.',
        });
      }

      if (!password || typeof password !== 'string' || password.trim() !== expectedPassword.trim()) {
        return res.status(401).json({
          success: false,
          error: 'كلمة السر غير صحيحة',
        });
      }

      const now = Date.now();
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
      const token = generateAdminToken(maxAgeMs);
      const expiresAt = now + maxAgeMs;

      adminSessions.set(token, {
        token,
        createdAt: now,
        expiresAt,
      });

      // Try generating Firebase Custom Token for admin session if supported by environment credentials
      const firebaseCustomToken = await tryGenerateAdminCustomToken();

      // Ensure the admin doc exists in Firestore in background if available
      try {
        const adminDb = getAdminDbSafe();
        if (adminDb) {
          adminDb.collection('admins').doc(ADMIN_FIREBASE_UID).set({
            uid: ADMIN_FIREBASE_UID,
            email: ADMIN_EMAIL,
            role: 'superadmin',
            name: 'PRO TECK Showroom Master Admin',
            status: 'active',
            isProtectedSystemAdmin: true,
            updatedAt: new Date().toISOString(),
          }, { merge: true }).catch((err) => {
            console.warn('[AdminAccess] Background admin doc ensure notice:', err?.message || err);
          });
        }
      } catch (dbErr) {
        // Non-blocking
      }

      // Use sameSite: 'none' and secure: true so cookies work reliably in iframe previews
      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: maxAgeMs,
        path: '/',
      });

      return res.json({
        success: true,
        token,
        firebaseCustomToken,
        message: 'تم تسجيل الدخول بنجاح',
      });
    } catch (err: any) {
      console.warn('[AdminAccess] Login notice:', err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'حدث خطأ أثناء المصادقة',
      });
    }
  });

  // Check admin session validity
  app.get('/api/admin/access/check', async (req, res) => {
    try {
      const authenticated = isValidAdminSession(req);
      const token = authenticated ? getAdminSessionToken(req) : null;
      const firebaseCustomToken = authenticated ? await tryGenerateAdminCustomToken() : undefined;

      return res.json({
        authenticated,
        token: token || undefined,
        firebaseCustomToken,
      });
    } catch (err: any) {
      console.warn('[AdminAccess] Check notice:', err?.message || err);
      return res.status(500).json({
        authenticated: false,
        error: err?.message || 'فشل في التحقق من جلسة الأدمن',
      });
    }
  });

  // Logout admin session
  app.post('/api/admin/access/logout', (req, res) => {
    const token = getAdminSessionToken(req);
    if (token) {
      adminSessions.delete(token);
    }
    res.clearCookie('admin_session', { path: '/' });
    return res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  });

  // =========================================================================
  // ADMIN FIRESTORE COLLECTIONS FALLBACK PROXY
  // Protected with requireAdminSession (HMAC session validation)
  // Provides direct Firestore Admin access for admin clients when signBlob/custom-token is unavailable
  // =========================================================================

  const ALLOWED_ADMIN_COLLECTIONS = new Set([
    'customer_requests',
    'orders',
    'reservations',
    'customers',
    'cash_ledgers',
    'expenses',
    'sequence_counters',
    'categories',
    'products',
    'invoices',
    'purchase_requests',
    'negotiations',
    'inquiries',
    'completed_sales',
    'sell_requests',
    'exchange_requests',
    'suppliers',
    'cost_sheets',
    'procurement',
    'purchase_history',
    'financial_timeline',
    'financial_alerts',
    'audit_logs',
    'showroom_settings',
    'brands',
    'customer_activities',
    'portal_support',
    'portal_tracking',
    'portal_sessions',
  ]);

  function sanitizeFirestoreData(val: any): any {
    if (val === null || val === undefined) return val;
    if (typeof val.toDate === 'function') {
      return val.toDate().toISOString();
    }
    if (Array.isArray(val)) {
      return val.map(sanitizeFirestoreData);
    }
    if (typeof val === 'object' && Object.prototype.toString.call(val) === '[object Object]') {
      const res: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        res[key] = sanitizeFirestoreData(val[key]);
      }
      return res;
    }
    return val;
  }

  // Authoritative server-side memory store & tombstones to guarantee zero lost writes and zero resurrected deletes
  const serverCollectionStore = new Map<string, Map<string, any>>();
  const serverDeletedDocIds = new Map<string, Set<string>>();
  const serverSequenceCounters = new Map<string, number>();

  function getServerCollectionMap(collectionName: string): Map<string, any> {
    let map = serverCollectionStore.get(collectionName);
    if (!map) {
      map = new Map();
      serverCollectionStore.set(collectionName, map);
    }
    return map;
  }

  function getDeletedSet(collectionName: string): Set<string> {
    let set = serverDeletedDocIds.get(collectionName);
    if (!set) {
      set = new Set();
      serverDeletedDocIds.set(collectionName, set);
    }
    return set;
  }

  function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB operation timed out')), ms)),
    ]);
  }

  // GET all documents in a collection via Firebase Admin SDK (with safe fallbacks)
  app.get('/api/admin/collection/:name', requireAdminSession, async (req, res) => {
    const collectionName = req.params.name;
    if (!ALLOWED_ADMIN_COLLECTIONS.has(collectionName)) {
      return res.status(403).json({
        status: 'error',
        error: `المجموعة '${collectionName}' غير مصرح بالوصول إليها عبر نقطة الأدمن.`,
      });
    }

    try {
      const itemsMap = new Map<string, any>();
      const deletedSet = getDeletedSet(collectionName);

      const adminDb = getAdminDbSafe();
      if (adminDb) {
        try {
          const snapshot = await withTimeout(adminDb.collection(collectionName).get(), 1500);
          snapshot.docs.forEach((docSnap) => {
            if (!deletedSet.has(docSnap.id)) {
              const data = sanitizeFirestoreData(docSnap.data());
              itemsMap.set(docSnap.id, { id: docSnap.id, ...data });
            }
          });
        } catch (dbErr: any) {
          console.warn(`[AdminAccess] Firestore Admin fetch notice for ${collectionName}:`, dbErr?.message || dbErr);
        }
      }

      // Safe fallback 1: Supabase service-role client if configured
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.from(collectionName).select('*');
          if (!error && Array.isArray(data)) {
            data.forEach((row) => {
              const item = mapPostgresRowToItem<any>(collectionName, row);
              const itemId = item.id || row.id;
              if (itemId && !deletedSet.has(itemId) && !itemsMap.has(itemId)) {
                itemsMap.set(itemId, item);
              }
            });
          } else if (collectionName === 'customer_requests' && error && error.code === 'PGRST205') {
            // Dual-read from specialized request tables in Supabase if customer_requests table is awaiting SQL migration
            const { data: pData } = await supabase.from('purchase_requests').select('*');
            if (Array.isArray(pData)) {
              pData.forEach((row) => {
                const item = row.data && typeof row.data === 'object' ? { ...row.data, id: row.id } : mapPostgresRowToItem(collectionName, row);
                const itemId = item.id || row.id;
                if (itemId && !deletedSet.has(itemId) && !itemsMap.has(itemId)) {
                  itemsMap.set(itemId, item);
                }
              });
            }
          }
        } catch (sbErr: any) {
          // Table may not exist or Supabase not reachable
        }
      }

      // Merge server-side memory writes ensuring recently created/updated docs are present
      const memoryMap = getServerCollectionMap(collectionName);
      memoryMap.forEach((val, id) => {
        if (!deletedSet.has(id)) {
          itemsMap.set(id, val);
        }
      });

      return res.json(Array.from(itemsMap.values()));
    } catch (err: any) {
      console.warn(`[AdminAccess] Handled error fetching collection ${collectionName}:`, err?.message || err);
      const memoryMap = getServerCollectionMap(collectionName);
      const deletedSet = getDeletedSet(collectionName);
      const fallbackList = Array.from(memoryMap.values()).filter((it) => it && it.id && !deletedSet.has(it.id));
      return res.json(fallbackList);
    }
  });

  // PATCH a document in a collection via Firebase Admin SDK (with safe fallbacks)
  app.patch('/api/admin/collection/:name/:id', requireAdminSession, async (req, res) => {
    const collectionName = req.params.name;
    const docId = req.params.id;

    if (!ALLOWED_ADMIN_COLLECTIONS.has(collectionName)) {
      return res.status(403).json({
        status: 'error',
        error: `المجموعة '${collectionName}' غير مصرح بالوصول إليها عبر نقطة الأدمن.`,
      });
    }

    if (!docId || typeof docId !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: 'معرف المستند غير صالح',
      });
    }

    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        status: 'error',
        error: 'بيانات المستند غير صالحة',
      });
    }

    const cleanDocId = docId.trim();
    const memoryMap = getServerCollectionMap(collectionName);
    const existing = memoryMap.get(cleanDocId) || {};
    const updatedData = { ...existing, ...data, id: cleanDocId };

    // Update memory store and clear any deletion tombstone
    getDeletedSet(collectionName).delete(cleanDocId);
    memoryMap.set(cleanDocId, updatedData);

    try {
      const adminDb = getAdminDbSafe();
      if (adminDb) {
        try {
          await withTimeout(adminDb.collection(collectionName).doc(cleanDocId).set(data, { merge: true }), 1500);
        } catch (dbErr: any) {
          console.warn(`[AdminAccess] Firestore Admin write notice for ${collectionName}/${cleanDocId}:`, dbErr?.message || dbErr);
        }
      }

      // Safe fallback 1: Supabase service-role client if configured
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          const rowData = mapItemToPostgresRow(collectionName, updatedData);
          const { error } = await supabase.from(collectionName).upsert(rowData);
          if (error && collectionName === 'customer_requests' && error.code === 'PGRST205') {
            const cust = typeof updatedData.customer === 'object' && updatedData.customer ? updatedData.customer : {};
            const subTable = updatedData.type === 'sell_device' ? 'sell_requests' :
                             updatedData.type === 'trade_in' ? 'exchange_requests' :
                             updatedData.type === 'negotiation' ? 'negotiations' :
                             updatedData.type === 'inquiry' ? 'inquiries' :
                             updatedData.type === 'reservation' ? 'reservations' : 'purchase_requests';
            await supabase.from(subTable).upsert({
              id: cleanDocId,
              reference_number: updatedData.referenceNumber || updatedData.reference_number || cleanDocId,
              customer_name: cust.fullName || cust.name || 'عميل',
              customer_phone: cust.phone || cust.phoneNumber || '0000000000',
              status: updatedData.status || 'new',
              data: updatedData,
            });
          }
        } catch (sbErr: any) {}
      }

      return res.json({
        success: true,
        message: 'تم حفظ وتأكيد التحديث بنجاح',
        id: cleanDocId,
        collection: collectionName,
        data: updatedData,
      });
    } catch (err: any) {
      console.warn(`[AdminAccess] Handled error writing document ${collectionName}/${cleanDocId}:`, err?.message || err);
      return res.status(500).json({
        status: 'error',
        error: err?.message || 'فشل في حفظ المستند عبر السيرفر',
      });
    }
  });

  // DELETE a document from a collection via Firebase Admin SDK (with safe fallbacks)
  app.delete('/api/admin/collection/:name/:id', requireAdminSession, async (req, res) => {
    const collectionName = req.params.name;
    const docId = req.params.id;

    if (!ALLOWED_ADMIN_COLLECTIONS.has(collectionName)) {
      return res.status(403).json({
        status: 'error',
        error: `المجموعة '${collectionName}' غير مصرح بالوصول إليها عبر نقطة الأدمن.`,
      });
    }

    if (!docId || typeof docId !== 'string' || !docId.trim()) {
      return res.status(400).json({
        status: 'error',
        error: 'معرف المستند غير صالح',
      });
    }

    const cleanDocId = docId.trim();

    try {
      let deletedFromFirestore = false;
      let deletedFromSupabase = false;

      const adminDb = getAdminDbSafe();
      if (adminDb) {
        try {
          await withTimeout(adminDb.collection(collectionName).doc(cleanDocId).delete(), 2500);
          deletedFromFirestore = true;
          console.info(`[AdminAccess] Document ${collectionName}/${cleanDocId} deleted successfully via Admin SDK`);
        } catch (dbErr: any) {
          console.warn(`[AdminAccess] Firestore Admin delete notice for ${collectionName}/${cleanDocId}:`, dbErr?.message || dbErr);
        }
      }

      // Safe fallback/sync: Supabase service-role client if configured
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          const { error } = await supabase.from(collectionName).delete().eq('id', cleanDocId);
          if (!error) {
            deletedFromSupabase = true;
          } else if (collectionName === 'customer_requests') {
            // Also attempt deletion from specialized request tables in Supabase
            for (const subTable of ['purchase_requests', 'sell_requests', 'exchange_requests', 'negotiations', 'inquiries', 'reservations']) {
              const { error: delErr } = await supabase.from(subTable).delete().eq('id', cleanDocId);
              if (!delErr) {
                deletedFromSupabase = true;
              }
            }
          }
        } catch (sbErr: any) {}
      }

      const actuallyDeleted = deletedFromFirestore || deletedFromSupabase;

      if (!actuallyDeleted) {
        return res.status(500).json({
          status: 'error',
          error: `تعذر حذف المستند (${cleanDocId}) من المجموعة (${collectionName}) في قاعدة البيانات (فشل الحذف في Firestore و Supabase بسبب نقص الصلاحيات PERMISSION_DENIED أو عدم توفر الجدول).`,
          id: cleanDocId,
          collection: collectionName,
        });
      }

      // Only update tombstones and memory store if actual backend deletion succeeded
      getDeletedSet(collectionName).add(cleanDocId);
      getServerCollectionMap(collectionName).delete(cleanDocId);

      return res.json({
        success: true,
        message: 'تم حذف المستند بنجاح عبر السيرفر',
        id: cleanDocId,
        collection: collectionName,
      });
    } catch (err: any) {
      console.warn(`[AdminAccess] Handled error deleting document ${collectionName}/${cleanDocId}:`, err?.message || err);
      return res.status(500).json({
        status: 'error',
        error: err?.message || 'فشل في حذف المستند عبر السيرفر',
      });
    }
  });

  // POST create or upsert a document in a collection via Firebase Admin SDK (with safe fallbacks)
  app.post('/api/admin/collection/:name', requireAdminSession, async (req, res) => {
    const collectionName = req.params.name;

    if (!ALLOWED_ADMIN_COLLECTIONS.has(collectionName)) {
      return res.status(403).json({
        status: 'error',
        error: `المجموعة '${collectionName}' غير مصرح بالوصول إليها عبر نقطة الأدمن.`,
      });
    }

    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        status: 'error',
        error: 'بيانات المستند غير صالحة',
      });
    }

    try {
      const adminDb = getAdminDbSafe();
      let targetId = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : '';

      if (!targetId) {
        targetId = adminDb ? adminDb.collection(collectionName).doc().id : `${collectionName.slice(0, 4)}-${Date.now()}`;
      }

      const payloadToSave = { ...data, id: targetId };
      let savedInFirestore = false;
      let savedInSupabase = false;

      // 1. Persist to Firestore Admin SDK
      if (adminDb) {
        try {
          await withTimeout(adminDb.collection(collectionName).doc(targetId).set(payloadToSave, { merge: true }), 2500);
          savedInFirestore = true;
          console.info(`[AdminAccess] Document ${collectionName}/${targetId} saved successfully via Admin SDK`);
        } catch (dbErr: any) {
          console.warn(`[AdminAccess] Firestore Admin POST write notice for ${collectionName}:`, dbErr?.message || dbErr);
        }
      }

      // 2. Safe sync to Supabase if configured
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          const rowData = mapItemToPostgresRow(collectionName, payloadToSave);
          const { error } = await supabase.from(collectionName).upsert(rowData);
          if (!error) {
            savedInSupabase = true;
          } else if (collectionName === 'customer_requests' && error && error.code === 'PGRST205') {
            // Dual-write to specialized request table in Supabase if customer_requests table is awaiting SQL migration
            const cust = typeof payloadToSave.customer === 'object' && payloadToSave.customer ? payloadToSave.customer : {};
            const fallbackRow = {
              id: targetId,
              reference_number: payloadToSave.referenceNumber || payloadToSave.reference_number || targetId,
              customer_id: cust.id || null,
              customer_name: cust.fullName || cust.name || 'عميل',
              customer_phone: cust.phone || cust.phoneNumber || '0000000000',
              product_id: payloadToSave.productId || payloadToSave.product_id || null,
              product_title: payloadToSave.productTitle || payloadToSave.product_title || 'طلب بدون عنوان',
              product_price: payloadToSave.productPrice || payloadToSave.product_price || 0,
              status: payloadToSave.status || 'new',
              data: payloadToSave,
            };
            const subTable = payloadToSave.type === 'sell_device' ? 'sell_requests' :
                             payloadToSave.type === 'trade_in' ? 'exchange_requests' :
                             payloadToSave.type === 'negotiation' ? 'negotiations' :
                             payloadToSave.type === 'inquiry' ? 'inquiries' :
                             payloadToSave.type === 'reservation' ? 'reservations' : 'purchase_requests';
            const { error: subErr } = await supabase.from(subTable).upsert(fallbackRow);
            if (!subErr) {
              savedInSupabase = true;
            }
          }
        } catch (sbErr: any) {}
      }

      const actuallySaved = savedInFirestore || savedInSupabase;

      if (!actuallySaved) {
        return res.status(500).json({
          status: 'error',
          error: `تعذر حفظ المستند (${targetId}) في المجموعة (${collectionName}) في قاعدة البيانات (فشل الحفظ في Firestore و Supabase بسبب نقص الصلاحيات PERMISSION_DENIED أو عدم توفر الجدول).`,
          id: targetId,
          collection: collectionName,
        });
      }

      // Only update memory store and clear deletion tombstone if actual backend persistence succeeded
      getDeletedSet(collectionName).delete(targetId);
      getServerCollectionMap(collectionName).set(targetId, payloadToSave);

      return res.json({
        success: true,
        message: 'تم حفظ وإنشاء المستند بنجاح عبر السيرفر',
        id: targetId,
        collection: collectionName,
        data: payloadToSave,
      });
    } catch (err: any) {
      console.warn(`[AdminAccess] Handled error in POST /api/admin/collection/${collectionName}:`, err?.message || err);
      return res.status(500).json({
        status: 'error',
        error: err?.message || 'فشل في حفظ المستند عبر السيرفر',
      });
    }
  });

  // POST atomic sequence reference generation via Firebase Admin SDK
  app.post('/api/admin/generate-reference', requireAdminSession, async (req, res) => {
    try {
      const rawPrefix = req.body?.prefix || req.body?.prefixKey || 'GEN';
      const cleanPrefix = String(rawPrefix).trim().toUpperCase();

      const adminDb = getAdminDbSafe();
      if (adminDb) {
        try {
          const counterDocRef = adminDb.collection('sequence_counters').doc(cleanPrefix);
          const nextValue = await withTimeout(
            adminDb.runTransaction(async (transaction) => {
              const docSnap = await transaction.get(counterDocRef);
              let currentValue = 0;
              if (docSnap.exists) {
                const docData = docSnap.data();
                if (typeof docData?.lastValue === 'number' && !isNaN(docData.lastValue)) {
                  currentValue = docData.lastValue;
                } else if (typeof docData?.current === 'number' && !isNaN(docData.current)) {
                  currentValue = docData.current;
                }
              }

              const calculatedNext = currentValue + 1;
              transaction.set(
                counterDocRef,
                {
                  id: cleanPrefix,
                  prefix: cleanPrefix,
                  lastValue: calculatedNext,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );

              return calculatedNext;
            }),
            1500
          );

          console.info(`[AdminAccess] Generated atomic sequence [${cleanPrefix}]: ${nextValue} via Admin SDK`);
          serverSequenceCounters.set(cleanPrefix, nextValue);
          return res.json({
            success: true,
            prefix: cleanPrefix,
            nextValue,
            sequenceNumber: nextValue,
          });
        } catch (txErr: any) {
          console.warn(`[AdminAccess] Admin SDK sequence transaction notice for ${cleanPrefix}:`, txErr?.message || txErr);
        }
      }

      // Safe atomic server sequence increment
      const currentCounter = serverSequenceCounters.get(cleanPrefix) || Math.max(100, Math.floor(Date.now() / 1000) % 100000);
      const nextSequence = currentCounter + 1;
      serverSequenceCounters.set(cleanPrefix, nextSequence);

      return res.json({
        success: true,
        prefix: cleanPrefix,
        nextValue: nextSequence,
        sequenceNumber: nextSequence,
      });
    } catch (err: any) {
      console.warn('[AdminAccess] Handled error in /api/admin/generate-reference:', err?.message || err);
      return res.status(500).json({
        status: 'error',
        error: err?.message || 'فشل في زيادة العداد التسلسلي الذري عبر السيرفر',
      });
    }
  });

  // =========================================================================
  // ADMIN PRODUCT SYNC ENDPOINTS (Supabase Service-Role)
  // Protected with Admin Access Session Verification
  // =========================================================================

  // Upsert product into Supabase 'products' table
  app.post('/api/admin/products/sync', requireAdminSession, async (req, res) => {
    try {
      if (!isSupabaseAdminConfigured()) {
        return res.status(500).json({
          status: 'error',
          error: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not configured on the server.',
        });
      }

      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to initialize server-side Supabase Admin Client.',
        });
      }

      const product = req.body;
      if (!product || typeof product !== 'object' || !product.id) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid product payload: missing product object or product.id',
        });
      }

      const row = mapItemToPostgresRow('products', product);

      // Ensure required schema constraints are satisfied
      if (!row.title || String(row.title).trim() === '') {
        row.title = product.name || product.productTitle || product.title_ar || 'منتج بدون عنوان';
      }
      if (row.price === undefined || row.price === null || isNaN(Number(row.price))) {
        row.price = 0;
      } else {
        row.price = Number(row.price);
      }

      const { data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })
        .select();

      if (error) {
        console.error(`[AdminProductSync] Error upserting product ${product.id} to Supabase:`, error.message);
        return res.status(500).json({
          status: 'error',
          id: product.id,
          error: error.message,
        });
      }

      console.log(`[AdminProductSync] Successfully upserted product ${product.id} ("${row.title}") to Supabase products table.`);
      res.json({
        status: 'success',
        id: product.id,
        title: row.title,
        price: row.price,
        syncedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[AdminProductSync] Unexpected server error:', error?.message || error);
      res.status(500).json({
        status: 'error',
        error: error?.message || String(error),
      });
    }
  });

  // Upsert customer into Supabase 'customers' table (Protected by Firebase ID Token verification)
  app.post('/api/customers/sync', async (req, res) => {
    try {
      // 1. Verify Firebase ID Token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          error: 'Unauthorized: Missing or invalid Authorization Bearer token',
        });
      }

      const idToken = authHeader.split('Bearer ')[1]?.trim();
      if (!idToken) {
        return res.status(401).json({
          status: 'error',
          error: 'Unauthorized: Empty token provided',
        });
      }

      let decodedToken;
      try {
        const adminAuth = getAdminAuth();
        decodedToken = await adminAuth.verifyIdToken(idToken);
      } catch (authErr: any) {
        console.error('[CustomerSync] Firebase ID token verification failed:', authErr?.message || authErr);
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden: Invalid or expired Firebase ID token',
        });
      }

      const callerUid = decodedToken.uid;
      const customer = req.body;
      if (!customer || typeof customer !== 'object' || (!customer.id && !customer.firebaseUid)) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid customer payload: missing customer object or customer.id/customer.firebaseUid',
        });
      }

      // 2. Enforce customer identity match with authenticated Firebase user UID
      const matchesUid =
        (customer.id && String(customer.id) === callerUid) ||
        (customer.firebaseUid && String(customer.firebaseUid) === callerUid);

      if (!matchesUid) {
        console.warn(
          `[CustomerSync] 403 Forbidden: Token UID ${callerUid} does not match customer payload (id: ${customer.id}, firebaseUid: ${customer.firebaseUid})`
        );
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden: Caller UID does not match customer identity',
        });
      }

      if (!customer.id) {
        customer.id = callerUid;
      }

      if (!isSupabaseAdminConfigured()) {
        return res.status(500).json({
          status: 'error',
          error: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not configured on the server.',
        });
      }

      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to initialize server-side Supabase Admin Client.',
        });
      }

      const row = mapItemToPostgresRow('customers', customer);

      // Ensure required schema defaults if missing
      if (!row.full_name || String(row.full_name).trim() === '') {
        row.full_name = customer.name || customer.fullName || 'عميل PRO TECK';
      }
      if (!row.primary_phone) {
        row.primary_phone = customer.phone || customer.primaryPhone || customer.whatsappPhone || '';
      }
      if (!row.whatsapp_phone) {
        row.whatsapp_phone = customer.whatsappPhone || row.primary_phone || '';
      }
      if (!row.status) {
        row.status = customer.status || 'new';
      }

      const { data, error } = await supabase
        .from('customers')
        .upsert(row, { onConflict: 'id' })
        .select();

      if (error) {
        console.error(`[CustomerSync] Error upserting customer ${customer.id} to Supabase:`, error.message);
        return res.status(500).json({
          status: 'error',
          id: customer.id,
          error: error.message,
        });
      }

      console.log(`[CustomerSync] Successfully upserted customer ${customer.id} ("${row.full_name}") to Supabase customers table.`);
      res.json({
        status: 'success',
        id: customer.id,
        fullName: row.full_name,
        syncedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[CustomerSync] Unexpected server error:', error?.message || error);
      res.status(500).json({
        status: 'error',
        error: error?.message || String(error),
      });
    }
  });

  // Phone Normalization and Validation Helpers for Egyptian Numbers
  function normalizeEgyptianPhoneNumber(rawPhone: string): string {
    if (!rawPhone) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let cleaned = String(rawPhone).replace(/[٠-٩]/g, (w) => arabicDigits.indexOf(w).toString());
    cleaned = cleaned.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0020')) {
      cleaned = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('+20')) {
      cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.startsWith('20') && cleaned.length === 12) {
      cleaned = '0' + cleaned.slice(2);
    }
    return cleaned;
  }

  function isValidEgyptianMobile(phone: string): boolean {
    return /^01[0125]\d{8}$/.test(phone);
  }

  // Helper to persist customer records with real await to Supabase and Firestore
  interface CustomerPersistenceResult {
    persisted: boolean;
    supabaseSuccess: boolean;
    firestoreSuccess: boolean;
    errors: string[];
  }

  async function persistCustomerRecord(
    customer: any,
    options?: { simulateFailure?: boolean }
  ): Promise<CustomerPersistenceResult> {
    if (options?.simulateFailure) {
      const errorMsg = 'Simulated database failure for testing';
      console.error(
        `[CRITICAL] Customer data NOT persisted to permanent storage! Customer ID: ${customer.id}, Phone: ${customer.phone || customer.primaryPhone}, Name: ${customer.fullName || customer.name}. Errors: ${errorMsg}`
      );
      return {
        persisted: false,
        supabaseSuccess: false,
        firestoreSuccess: false,
        errors: [errorMsg],
      };
    }

    let supabaseSuccess = false;
    let firestoreSuccess = false;
    const errors: string[] = [];

    // 1. Attempt Supabase persistence if configured
    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const row = mapItemToPostgresRow('customers', customer);
          if (!row.full_name) {
            row.full_name = customer.fullName || customer.name || 'عميل PRO TECK';
          }
          if (!row.primary_phone) {
            row.primary_phone = customer.primaryPhone || customer.phone || '';
          }
          if (!row.whatsapp_phone) {
            row.whatsapp_phone = customer.whatsappPhone || row.primary_phone || '';
          }
          if (!row.status) {
            row.status = customer.status || 'active';
          }

          const { error } = await supabase.from('customers').upsert(row, { onConflict: 'id' });
          if (error) {
            errors.push(`Supabase: ${error.message}`);
            console.warn('[IdentifyCustomer] Supabase upsert error:', error.message);
          } else {
            supabaseSuccess = true;
          }
        } else {
          errors.push('Supabase client unavailable');
        }
      } catch (sbErr: any) {
        const msg = sbErr?.message || String(sbErr);
        errors.push(`Supabase exception: ${msg}`);
        console.warn('[IdentifyCustomer] Supabase exception:', msg);
      }
    } else {
      errors.push('Supabase not configured');
    }

    // 2. Attempt Firestore persistence if available
    try {
      const adminDb = getAdminDbSafe();
      if (adminDb) {
        const firestorePayload = { ...customer };
        delete firestorePayload._persisted;
        await adminDb.collection('customers').doc(customer.id).set(firestorePayload, { merge: true });
        firestoreSuccess = true;
      } else {
        errors.push('Firestore adminDb unavailable');
      }
    } catch (fbErr: any) {
      const msg = fbErr?.message || String(fbErr);
      errors.push(`Firestore exception: ${msg}`);
      console.warn('[IdentifyCustomer] Firestore exception:', msg);
    }

    const persisted = supabaseSuccess || firestoreSuccess;

    if (!persisted) {
      console.error(
        `[CRITICAL] Customer data NOT persisted to permanent storage! Customer ID: ${customer.id}, Phone: ${customer.phone || customer.primaryPhone}, Name: ${customer.fullName || customer.name}. Errors: ${errors.join(' | ')}`
      );
    } else {
      console.log(
        `[IdentifyCustomer] Customer ${customer.id} successfully persisted to permanent storage (Supabase: ${supabaseSuccess}, Firestore: ${firestoreSuccess})`
      );
    }

    return {
      persisted,
      supabaseSuccess,
      firestoreSuccess,
      errors,
    };
  }

  // Fast Customer Identification by Name & Egyptian Phone (Multi-tiered: Acceleration Cache + Supabase + Firebase Admin)
  app.post('/api/customers/identify', async (req, res) => {
    const { name, phone } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        error: 'يرجى إدخال اسم العميل بالكامل',
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        status: 'error',
        error: 'يرجى إدخال رقم الهاتف',
      });
    }

    const normalizedPhone = normalizeEgyptianPhoneNumber(phone);
    if (!isValidEgyptianMobile(normalizedPhone)) {
      return res.status(400).json({
        status: 'error',
        error: 'رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم يبدأ بـ 01 (مثال: 01012345678)',
      });
    }

    const trimmedName = name.trim();
    const now = new Date().toISOString();
    const simulateFailure =
      req.headers['x-simulate-db-failure'] === 'true' ||
      req.query?.simulateFailure === 'true';

    try {
      let matchedCustomer: any = null;

      // 1. Tier 1 (Acceleration Cache): Only trust in-memory cache if explicitly confirmed persisted in permanent storage
      const cachedCustomer = inMemoryCustomerCache.get(normalizedPhone);
      if (cachedCustomer && cachedCustomer._persisted === true && !simulateFailure) {
        matchedCustomer = { ...cachedCustomer };
      }

      // 2. Tier 2: Check Supabase if configured (authoritative lookup)
      if (!matchedCustomer && isSupabaseAdminConfigured() && !simulateFailure) {
        try {
          const supabase = getSupabaseAdminClient();
          if (supabase) {
            const { data, error } = await supabase
              .from('customers')
              .select('*')
              .or(`primary_phone.eq.${normalizedPhone},whatsapp_phone.eq.${normalizedPhone},phone.eq.${normalizedPhone}`)
              .limit(1);

            if (!error && data && data.length > 0) {
              matchedCustomer = mapPostgresRowToItem<any>('customers', data[0]);
              matchedCustomer._persisted = true;
            }
          }
        } catch (sbErr) {
          console.warn('[IdentifyCustomer] Supabase lookup notice:', sbErr);
        }
      }

      // 3. Tier 3: Check Firestore Admin SDK safely (authoritative lookup)
      if (!matchedCustomer && !simulateFailure) {
        try {
          const adminDb = getAdminDbSafe();
          if (adminDb) {
            const customersRef = adminDb.collection('customers');
            let snap = await customersRef.where('primaryPhone', '==', normalizedPhone).limit(1).get();
            if (snap.empty) {
              snap = await customersRef.where('whatsappPhone', '==', normalizedPhone).limit(1).get();
            }
            if (snap.empty) {
              snap = await customersRef.where('phone', '==', normalizedPhone).limit(1).get();
            }
            if (!snap.empty) {
              const docSnap = snap.docs[0];
              matchedCustomer = { id: docSnap.id, ...docSnap.data(), _persisted: true };
            }
          }
        } catch (fbErr: any) {
          console.warn('[IdentifyCustomer] Firestore lookup notice (non-fatal):', fbErr?.message || fbErr);
        }
      }

      // 4. Tier 4 (Fallback): If permanent stores had no record or were unavailable, fall back to unconfirmed cache
      if (!matchedCustomer && cachedCustomer) {
        matchedCustomer = { ...cachedCustomer };
        console.info(`[IdentifyCustomer] Using unconfirmed in-memory record for ${normalizedPhone} as permanent stores returned no match.`);
      }

      // Handle Existing Customer
      if (matchedCustomer) {
        const customerId = matchedCustomer.id || `cust-${Date.now()}`;
        const currentName = matchedCustomer.fullName || matchedCustomer.name || '';
        const isPlaceholderName =
          !currentName ||
          currentName.includes('عميل PRO TECK') ||
          currentName.includes('عميل جديد') ||
          currentName.includes('عميل محترم');

        const resolvedName = (isPlaceholderName && trimmedName) ? trimmedName : (currentName || trimmedName);

        const customerPayload = {
          ...matchedCustomer,
          id: customerId,
          name: resolvedName,
          fullName: resolvedName,
          phone: normalizedPhone,
          primaryPhone: normalizedPhone,
          whatsappPhone: normalizedPhone,
          address: matchedCustomer.address || {
            governorate: '',
            cityArea: '',
            streetAddress: '',
          },
          lastActivityDate: now,
          verified: true,
        };

        // Real AWAIT persistence to Supabase / Firestore before replying
        const { persisted } = await persistCustomerRecord(customerPayload, { simulateFailure });

        // Update in-memory cache with confirmed persistence status
        inMemoryCustomerCache.set(normalizedPhone, {
          ...customerPayload,
          _persisted: persisted,
        });

        console.log(`[IdentifyCustomer] Identified existing customer ${customerId} (${customerPayload.name}) with phone ${normalizedPhone} (persisted: ${persisted})`);

        const clientCustomer = { ...customerPayload };
        delete (clientCustomer as any)._persisted;

        return res.json({
          status: 'success',
          persisted,
          customer: clientCustomer,
          isNew: false,
        });
      }

      // Handle New Customer
      const newCustId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newCustomer = {
        id: newCustId,
        fullName: trimmedName,
        name: trimmedName,
        primaryPhone: normalizedPhone,
        whatsappPhone: normalizedPhone,
        phone: normalizedPhone,
        preferredContactMethod: 'whatsapp',
        status: 'active',
        address: {
          governorate: '',
          cityArea: '',
          streetAddress: '',
        },
        firstContactDate: now,
        lastActivityDate: now,
        createdAt: now,
        totalRequests: 0,
        totalPurchases: 0,
        totalSpent: 0,
        isArchived: false,
        verified: true,
        tags: ['تسجيل نشاطي', 'عميل مباشر'],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: now,
            actor: 'العميل',
            eventType: 'customer_created',
            title: 'تسجيل الدخول إلى نشاطي',
            description: `تم تسجيل الدخول برقم الهاتف (${normalizedPhone}) والاسم (${trimmedName})`,
          },
        ],
        documents: [],
        visitedProducts: [],
        notes: [],
        communicationLogs: [],
      };

      // Real AWAIT persistence to Supabase / Firestore before replying
      const { persisted } = await persistCustomerRecord(newCustomer, { simulateFailure });

      // Update in-memory cache with confirmed persistence status
      inMemoryCustomerCache.set(normalizedPhone, {
        ...newCustomer,
        _persisted: persisted,
      });

      console.log(`[IdentifyCustomer] Created new customer ${newCustId} (${trimmedName}) with phone ${normalizedPhone} (persisted: ${persisted})`);

      const clientNewCustomer = {
        ...newCustomer,
        id: newCustId,
        name: trimmedName,
        phone: normalizedPhone,
        verified: true,
      };
      delete (clientNewCustomer as any)._persisted;

      return res.json({
        status: 'success',
        persisted,
        customer: clientNewCustomer,
        isNew: true,
      });
    } catch (error: any) {
      console.error(
        `[CRITICAL] [IdentifyCustomer] Unexpected failure in customer identification pipeline for ${normalizedPhone} (${trimmedName}):`,
        error?.message || error
      );
      // Construct fallback customer object in-memory so the customer is never blocked
      const fallbackId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const fallbackCustomer = {
        id: fallbackId,
        fullName: trimmedName,
        name: trimmedName,
        primaryPhone: normalizedPhone,
        whatsappPhone: normalizedPhone,
        phone: normalizedPhone,
        status: 'active',
        firstContactDate: now,
        lastActivityDate: now,
        createdAt: now,
        verified: true,
      };
      inMemoryCustomerCache.set(normalizedPhone, {
        ...fallbackCustomer,
        _persisted: false,
      });

      return res.json({
        status: 'success',
        persisted: false,
        customer: fallbackCustomer,
        isNew: true,
      });
    }
  });

  // Fetch all requests for a customer by normalized phone (Multi-tier: Firestore + Supabase)
  app.get('/api/customers/requests', async (req, res) => {
    const rawPhone = String(req.query.phone || '').trim();
    if (!rawPhone) {
      return res.status(400).json({ status: 'error', error: 'رقم الهاتف مطلوب' });
    }

    const normalizedPhone = normalizeEgyptianPhoneNumber(rawPhone);
    if (!isValidEgyptianMobile(normalizedPhone)) {
      return res.status(400).json({ status: 'error', error: 'رقم هاتف غير صالح' });
    }

    try {

      const resultsMap = new Map<string, any>();

      // 1. Try Firestore safely
      try {
        const adminDb = getAdminDbSafe();
        if (adminDb) {
          const requestsRef = adminDb.collection('customer_requests');

          const q1 = await requestsRef.where('customer.phone', '==', normalizedPhone).get();
          q1.forEach((doc) => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));

          const q2 = await requestsRef.where('customer.whatsappPhone', '==', normalizedPhone).get();
          q2.forEach((doc) => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));

          const q3 = await requestsRef.where('customerPhone', '==', normalizedPhone).get();
          q3.forEach((doc) => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));

          const resQ = await adminDb.collection('reservations').where('customerPhone', '==', normalizedPhone).get();
          resQ.forEach((doc) => {
            const data = doc.data();
            if (!resultsMap.has(doc.id)) {
              resultsMap.set(doc.id, {
                id: doc.id,
                referenceNumber: data.reservationNumber || doc.id,
                type: 'reservation',
                status: data.status || 'pending',
                productId: data.productId,
                productTitle: data.productTitle,
                productPrice: data.productPrice,
                productImage: data.productImage,
                createdAt: data.createdAt,
                customer: {
                  name: data.customerName,
                  phone: data.customerPhone,
                },
                ...data,
              });
            }
          });
        }
      } catch (fbErr: any) {
        console.warn('[GetCustomerRequests] Firestore query notice (non-fatal):', fbErr?.message || fbErr);
      }

      // 2. Try Supabase if configured
      if (isSupabaseAdminConfigured()) {
        try {
          const supabase = getSupabaseAdminClient();
          if (supabase) {
            // Check reservations in Supabase
            const { data: resData } = await supabase
              .from('reservations')
              .select('*')
              .eq('customer_phone', normalizedPhone);

            if (resData && Array.isArray(resData)) {
              for (const row of resData) {
                const r = mapPostgresRowToItem<any>('reservations', row);
                if (!resultsMap.has(r.id)) {
                  resultsMap.set(r.id, {
                    id: r.id,
                    referenceNumber: r.reservationNumber || r.id,
                    type: 'reservation',
                    status: r.status || 'pending',
                    productId: r.productId,
                    productTitle: r.productTitle,
                    productPrice: r.productPrice,
                    productImage: r.productImage,
                    createdAt: r.createdAt,
                    customer: {
                      name: r.customerName,
                      phone: r.customerPhone,
                    },
                    ...r,
                  });
                }
              }
            }

            // Check purchase requests in Supabase
            const { data: purData } = await supabase
              .from('purchase_requests')
              .select('*')
              .eq('customer_phone', normalizedPhone);

            if (purData && Array.isArray(purData)) {
              for (const row of purData) {
                const p = mapPostgresRowToItem<any>('purchase_requests', row);
                if (!resultsMap.has(p.id)) {
                  resultsMap.set(p.id, {
                    id: p.id,
                    type: 'purchase_request',
                    status: p.status || 'pending',
                    createdAt: p.createdAt,
                    customer: {
                      name: p.customerName,
                      phone: p.customerPhone,
                    },
                    ...p,
                  });
                }
              }
            }
          }
        } catch (sbErr) {
          console.warn('[GetCustomerRequests] Supabase query notice:', sbErr);
        }
      }

      const requests = Array.from(resultsMap.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      return res.json({
        status: 'success',
        phone: normalizedPhone,
        count: requests.length,
        requests,
      });
    } catch (error: any) {
      console.warn('[GetCustomerRequests] Non-fatal fallback:', error?.message || error);
      return res.json({
        status: 'success',
        phone: rawPhone,
        count: 0,
        requests: [],
      });
    }
  });

  // Delete product from Supabase 'products' table
  app.delete('/api/admin/products/sync/:id', requireAdminSession, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          status: 'error',
          error: 'Missing product id parameter.',
        });
      }

      if (!isSupabaseAdminConfigured()) {
        return res.status(500).json({
          status: 'error',
          error: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not configured on the server.',
        });
      }

      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to initialize server-side Supabase Admin Client.',
        });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[AdminProductSync] Error deleting product ${id} from Supabase:`, error.message);
        return res.status(500).json({
          status: 'error',
          id,
          error: error.message,
        });
      }

      console.log(`[AdminProductSync] Successfully deleted product ${id} from Supabase products table.`);
      res.json({
        status: 'success',
        id,
        deletedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`[AdminProductSync] Unexpected server error deleting ${req.params.id}:`, error?.message || error);
      res.status(500).json({
        status: 'error',
        id: req.params.id,
        error: error?.message || String(error),
      });
    }
  });

  // AI Assistant Proxy Route
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAiClient();
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                'أنت المساعد الذكي لمعرض PRO TECK للأجهزة المنزلية في المعادي شارع 68 القاهرة. أجب باحترافية ولطافة باللغة العربية ورشح الأجهزة المناسبة للعميل.',
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`[AIChat] Model ${modelName} failed, attempting next candidate:`, mErr?.message || mErr);
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('فشل في استجابة المساعد الذكي');
      }

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('AI API Error:', error);
      let clientMsg = error?.message || 'Failed to generate AI response';
      try {
        const parsed = JSON.parse(clientMsg);
        if (parsed?.error?.message) {
          clientMsg = parsed.error.message;
        }
      } catch {}
      res.status(500).json({ error: clientMsg });
    }
  });

  // AI Enterprise Product Extraction Endpoint (TASK-012)
  app.post('/api/ai/extract-product', requireAdminSession, async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'يرجى تقديم نص الاستخراج (prompt مطلوب)' });
      }

      const ai = getAiClient();
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || 'قم بتحليل بيانات الجهاز واستخراجها بكائن JSON محدد.',
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`[AIExtract] Model ${modelName} failed, attempting next candidate:`, mErr?.message || mErr);
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('تعذر استجابة نماذج الذكاء الاصطناعي');
      }

      const responseText = response.text?.trim() || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        // Fallback if markdown json fence exists
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      res.json({ extracted: parsed });
    } catch (error: any) {
      console.error('AI Extraction Error:', error);
      let clientMsg = error?.message || 'فشل في استخراج بيانات الجهاز بواسطة الذكاء الاصطناعي';
      try {
        const parsed = JSON.parse(clientMsg);
        if (parsed?.error?.message) {
          clientMsg = parsed.error.message;
        }
      } catch {}
      res.status(500).json({ error: clientMsg });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PRO TECK Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use.`);
    } else {
      console.error('[Server] Unexpected server error:', err);
    }
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error during startServer:', err);
});
