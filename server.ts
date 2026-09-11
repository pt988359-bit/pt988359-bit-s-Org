import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { startReservationExpirationCron } from './src/server/reservationCron';
import { processExpiredReservationsSupabaseJob } from './src/server/reservationCronSupabase';
import { getAdminAuth } from './src/server/firebaseAdmin';
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from './src/server/supabaseAdmin';
import { mapItemToPostgresRow } from './src/core/storage/SupabaseStorageAdapter';

dotenv.config();

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
  return process.env.ADMIN_ACCESS_PASSWORD || 'proteck_internal_admin_token_secret_2025';
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
  if (!isValidAdminSession(req)) {
    return res.status(401).json({
      status: 'error',
      error: 'جلسة الأدمن غير صالحة أو منتهية. يرجى تسجيل الدخول إلى لوحة التحكم من /admin أولاً.',
    });
  }
  next();
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
      location: 'Cairo - Maadi 68 St',
      email: 'pt988359@gmail.com',
      workingHours: '14:00 - 01:00',
    });
  });

  // API Info Endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'PRO TECK',
      brandTagline: 'معرض الأجهزة المنزلية الجديدة والمستعملة - القاهرة المعادي',
      email: 'pt988359@gmail.com',
      phone: '01000000000',
      address: {
        governorate: 'القاهرة',
        area: 'المعادي',
        street: 'شارع 68',
      },
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

  // Login with ADMIN_ACCESS_PASSWORD
  app.post('/api/admin/access/login', (req, res) => {
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
        message: 'تم تسجيل الدخول بنجاح',
      });
    } catch (err: any) {
      console.error('[AdminAccess] Login error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'حدث خطأ أثناء المصادقة',
      });
    }
  });

  // Check admin session validity
  app.get('/api/admin/access/check', (req, res) => {
    const authenticated = isValidAdminSession(req);
    const token = authenticated ? getAdminSessionToken(req) : null;
    return res.json({
      authenticated,
      token: token || undefined,
    });
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
    try {
      startReservationExpirationCron(60000);
    } catch (err: any) {
      console.warn('[Server] Notice starting reservation expiration cron:', err?.message || err);
    }
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
