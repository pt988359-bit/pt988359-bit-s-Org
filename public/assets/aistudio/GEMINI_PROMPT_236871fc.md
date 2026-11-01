# برومبت Gemini — إصلاح مزامنة النظام المالي + تنظيف invoices

انسخ كل ما هو داخل الصندوق أدناه والصقه في Gemini كما هو، دون تعديل أي سطر.

---

نفّذ التعديلات التالية على الكود بدقة ميكانيكية تامة. التعديلات مصممة ومُتحقق من ترجمتها مسبقًا، مهمتك التطبيق الحرفي فقط.

**قواعد صارمة:**
1. طبّق التعديلات التالية فقط، ولا تعمل أي Refactoring أو إعادة تسمية أو "تحسين" لأي شيء آخر.
2. لا تعدّل package-lock.json إطلاقًا.
3. لا تلمس src/firebase/ ولا index.html ولا manifest.json.
4. بعد التطبيق: شغّل `tsc --noEmit` ثم `vite build` — يجب أن ينجحا بصفر أخطاء.
5. ثم اعمل Commit بالرسالة المحددة أدناه حرفيًا، ولا تضغط Publish.
6. في ردّك النهائي: اكتب رقم الكوميت الحقيقي (git rev-parse --short HEAD) وناتج `git diff --stat` فقط، دون أي ادعاءات إضافية.

---

## التعديل 1: ملف جديد كامل

أنشئ الملف `src/core/storage/CloudSyncOutbox.ts` بهذا المحتوى الكامل حرفيًا:

```typescript
/**
 * Cloud Sync Outbox — Reliable pending-write queue for admin data.
 *
 * Problem it solves:
 * FirestoreStorageAdapter writes to localStorage first, then pushes to the cloud
 * asynchronously. If the cloud push fails (no admin session, network down, server
 * error), the record previously stayed local-only SILENTLY — invisible until the
 * browser cache was cleared, at which point it was lost forever.
 *
 * This outbox queues any write that never reached the server and retries it in the
 * background until the server confirms persistence. The pending count is exposed so
 * the admin UI can show a visible indicator instead of failing silently.
 */

import { AdminSessionService } from '../services/AdminSessionService';
import { LoggerService } from '../services/LoggerService';

const OUTBOX_KEY = 'proteck_cloud_sync_outbox_v1';
const MAX_OUTBOX_SIZE = 500;
const MAX_FLUSH_PER_RUN = 50;
const FLUSH_INTERVAL_MS = 60000;

export interface OutboxEntry {
  collection: string;
  id: string;
  data: any;
  queuedAt: string;
  attempts: number;
  lastAttemptAt?: string;
}

type PendingListener = (pendingCount: number) => void;

const listeners = new Set<PendingListener>();
let flushTimer: any = null;
let flushing = false;
let initialized = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readOutbox(): OutboxEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(entries: OutboxEntry[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch (err) {
    LoggerService.warn('CloudSyncOutbox', 'Failed to persist outbox to localStorage', err);
  }
}

function notifyPendingCount(): void {
  const count = getPendingSyncCount();
  listeners.forEach((cb) => {
    try {
      cb(count);
    } catch {}
  });
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent('proteck:cloud_sync_outbox', { detail: { pending: count } }));
    } catch {}
  }
}

/**
 * Queues a write that failed to reach the cloud. Deduplicates by collection+id
 * (the newest payload wins) and caps the queue size to protect localStorage.
 */
export function enqueueFailedWrite(collectionName: string, id: string, data: any): void {
  if (!isBrowser() || !collectionName || !id) return;
  try {
    const entries = readOutbox();
    const existingIndex = entries.findIndex((e) => e.collection === collectionName && e.id === id);
    const entry: OutboxEntry = {
      collection: collectionName,
      id,
      data,
      queuedAt: new Date().toISOString(),
      attempts: existingIndex >= 0 ? entries[existingIndex].attempts : 0,
    };
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    // Cap the queue: drop oldest entries beyond the limit
    while (entries.length > MAX_OUTBOX_SIZE) {
      entries.shift();
    }
    writeOutbox(entries);
    notifyPendingCount();
    LoggerService.warn('CloudSyncOutbox', `Queued unsynced write for ${collectionName}/${id} (pending: ${entries.length})`);
    ensureFlushTimer();
    // Try an immediate flush in case the token/network just became available
    void flushOutbox();
  } catch {}
}

export function getPendingSyncCount(): number {
  return readOutbox().length;
}

export function subscribeToPendingSync(cb: PendingListener): () => void {
  listeners.add(cb);
  try {
    cb(getPendingSyncCount());
  } catch {}
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Attempts to push queued entries to the server via the admin collection API.
 * Only runs when an admin session token exists. Entries that fail stay queued.
 */
export async function flushOutbox(): Promise<{ sent: number; remaining: number }> {
  if (!isBrowser() || flushing) return { sent: 0, remaining: getPendingSyncCount() };
  if (!AdminSessionService.hasToken()) return { sent: 0, remaining: getPendingSyncCount() };

  flushing = true;
  let sent = 0;
  try {
    let entries = readOutbox();
    if (entries.length === 0) return { sent: 0, remaining: 0 };

    const batch = entries.slice(0, MAX_FLUSH_PER_RUN);
    for (const entry of batch) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...AdminSessionService.getAuthHeaders(),
        };
        const res = await fetch(`/api/admin/collection/${encodeURIComponent(entry.collection)}`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({ id: entry.id, ...entry.data }),
        });

        if (res.ok) {
          entries = entries.filter((e) => !(e.collection === entry.collection && e.id === entry.id));
          sent++;
        } else if (res.status === 401 || res.status === 403) {
          // Not authenticated / not allowed — stop this run, keep entries queued.
          break;
        } else {
          // Server error — keep entry queued for the next run.
          entry.attempts++;
          entry.lastAttemptAt = new Date().toISOString();
        }
      } catch {
        // Network error — keep entry queued, stop this run.
        entry.attempts++;
        entry.lastAttemptAt = new Date().toISOString();
        break;
      }
    }

    writeOutbox(entries);
    notifyPendingCount();
    if (sent > 0) {
      LoggerService.info('CloudSyncOutbox', `Flushed ${sent} pending write(s) to the server`);
    }
    return { sent, remaining: entries.length };
  } finally {
    flushing = false;
  }
}

function ensureFlushTimer(): void {
  if (!isBrowser() || flushTimer) return;
  flushTimer = setInterval(() => {
    if (getPendingSyncCount() > 0 && AdminSessionService.hasToken()) {
      void flushOutbox();
    }
  }, FLUSH_INTERVAL_MS);
}

/** One-time global initialization: retry timer + flush when connectivity returns. */
export function initCloudSyncOutbox(): void {
  if (!isBrowser() || initialized) return;
  initialized = true;
  ensureFlushTimer();
  window.addEventListener('online', () => {
    void flushOutbox();
  });
}
```

---

## التعديل 2: ملف جديد كامل

أنشئ الملف `src/components/admin/CloudSyncIndicator.tsx` بهذا المحتوى الكامل حرفيًا:

```tsx
/**
 * CloudSyncIndicator — Visible admin badge for records waiting to reach the cloud.
 *
 * Renders nothing when everything is synced. When the Cloud Sync Outbox has
 * pending entries, a small amber chip appears showing the count with a
 * "retry now" button, so failed cloud saves are never silent again.
 */

import React, { useEffect, useState } from 'react';
import { subscribeToPendingSync, flushOutbox, initCloudSyncOutbox } from '../../core/storage/CloudSyncOutbox';

export const CloudSyncIndicator: React.FC = () => {
  const [pending, setPending] = useState<number>(0);
  const [retrying, setRetrying] = useState<boolean>(false);

  useEffect(() => {
    initCloudSyncOutbox();
    const unsubscribe = subscribeToPendingSync((count) => setPending(count));
    return () => {
      unsubscribe();
    };
  }, []);

  if (pending <= 0) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await flushOutbox();
    } catch {}
    setRetrying(false);
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-[9998] flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-200 shadow-lg backdrop-blur"
      title="سجلات لم تصل للسحابة بعد — سيتم إرسالها تلقائيًا"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
      </span>
      <span>
        {pending} سجل بانتظار المزامنة السحابية
      </span>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-400/35 disabled:opacity-50"
      >
        {retrying ? 'جارٍ الإرسال…' : 'إعادة المحاولة'}
      </button>
    </div>
  );
};

export default CloudSyncIndicator;
```

---

## التعديل 3: src/core/storage/FirestoreStorageAdapter.ts — ثلاثة استبدالات

**3-أ)** استبدل هذا السطرين:

```typescript
import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
```

بهذه الأسطر الثلاثة:

```typescript
import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { enqueueFailedWrite } from './CloudSyncOutbox';
```

**3-ب)** استبدل كتلة catch الكاملة في `saveCollection` (داخل حلقة chunks):

من:

```typescript
            } catch (err: any) {
              LoggerService.warn('FirestoreStorageAdapter', `Batch write to ${collectionName} failed for chunk of ${chunk.length} items`, err);
              if (this.isPermissionError(err) && AdminSessionService.hasToken()) {
                LoggerService.info('FirestoreStorageAdapter', `Batch write permission error for ${collectionName}. Falling back to admin server POST endpoint for ${chunk.length} items.`);
                for (const item of chunk) {
                  await this.saveDocViaAdminApi(collectionName, (item as any).id, item);
                }
              }
            }
```

إلى:

```typescript
            } catch (err: any) {
              LoggerService.warn('FirestoreStorageAdapter', `Batch write to ${collectionName} failed for chunk of ${chunk.length} items`, err);
              if (this.isPermissionError(err)) {
                if (AdminSessionService.hasToken()) {
                  LoggerService.info('FirestoreStorageAdapter', `Batch write permission error for ${collectionName}. Falling back to admin server POST endpoint for ${chunk.length} items.`);
                  for (const item of chunk) {
                    const savedViaApi = await this.saveDocViaAdminApi(collectionName, (item as any).id, item);
                    if (!savedViaApi && item && (item as any).id) {
                      enqueueFailedWrite(collectionName, (item as any).id, item);
                    }
                  }
                } else {
                  // No admin session available — queue everything so nothing is silently local-only
                  for (const item of chunk) {
                    if (item && (item as any).id) {
                      enqueueFailedWrite(collectionName, (item as any).id, item);
                    }
                  }
                }
              } else {
                // Non-permission batch failure — queue the chunk for background retry
                for (const item of chunk) {
                  if (item && (item as any).id) {
                    enqueueFailedWrite(collectionName, (item as any).id, item);
                  }
                }
              }
            }
```

**3-ج)** استبدل كتلة catch الكاملة في `writeDocSingle`:

من:

```typescript
    } catch (err: any) {
      if (this.isPermissionError(err)) {
        LoggerService.info(
          'FirestoreStorageAdapter',
          `Direct write permission error for ${collectionName}/${data.id}. Attempting admin server fallback.`
        );
        await this.saveDocViaAdminApi(collectionName, data.id, data);
        return;
      }
      firestoreHealthManager.recordError(err, `writeDocSingle:${collectionName}/${data.id}`);
      LoggerService.warn(
        'FirestoreStorageAdapter',
        `Single doc write to ${collectionName}/${data.id} failed`,
        err
      );
    }
```

إلى:

```typescript
    } catch (err: any) {
      if (this.isPermissionError(err)) {
        LoggerService.info(
          'FirestoreStorageAdapter',
          `Direct write permission error for ${collectionName}/${data.id}. Attempting admin server fallback.`
        );
        const savedViaApi = await this.saveDocViaAdminApi(collectionName, data.id, data);
        if (!savedViaApi) {
          enqueueFailedWrite(collectionName, data.id, data);
        }
        return;
      }
      firestoreHealthManager.recordError(err, `writeDocSingle:${collectionName}/${data.id}`);
      LoggerService.warn(
        'FirestoreStorageAdapter',
        `Single doc write to ${collectionName}/${data.id} failed`,
        err
      );
      // Last resort: try the admin server endpoint, otherwise queue the write so
      // it is retried in the background instead of silently staying local-only.
      const savedViaApi = await this.saveDocViaAdminApi(collectionName, data.id, data);
      if (!savedViaApi) {
        enqueueFailedWrite(collectionName, data.id, data);
      }
    }
```

---

## التعديل 4: src/components/admin/AdminLayout.tsx — استبدالان

**4-أ)** بعد هذه الأسطر الستة في منطقة الاستيراد:

```typescript
import { AdminNotificationCenter } from './core/AdminNotificationCenter';
import { AdminActivityTimelineModal } from './core/AdminActivityTimelineModal';
import { AdminQuickActionCenter } from './core/AdminQuickActionCenter';
import { AdminRecentWorkDrawer } from './core/AdminRecentWorkDrawer';
import { AdminProfileSecurityModal } from './core/AdminProfileSecurityModal';
import { AdminSystemStatusModal } from './core/AdminSystemStatusModal';
```

أضف سطرًا سابعًا بعدها مباشرة:

```typescript
import { CloudSyncIndicator } from './CloudSyncIndicator';
```

**4-ب)** في قسم الـ JSX للـ return الرئيسي، بعد هذا العنصر:

```tsx
      {/* Temporary Diagnostic Badge */}
      <div className="fixed top-1 left-1 z-[9999] bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none shadow">
        {windowWidth}px
      </div>
```

أضف بعده مباشرة:

```tsx
      {/* Cloud Sync Outbox Indicator (hidden when fully synced) */}
      <CloudSyncIndicator />
```

---

## التعديل 5: server.ts — حذف سطر واحد

في المصفوفة `ALLOWED_ADMIN_COLLECTIONS` احذف هذا السطر فقط:

```typescript
    'invoices',
```

(المصفوفة تبدأ بـ 'customer_requests' وتضم 'products' و'purchase_requests' — احذف سطر 'invoices' منها فقط ولا تغيّر أي سطر آخر).

---

## الخاتمة

بعد تطبيق كل التعديلات:
1. `npx tsc --noEmit` → يجب أن يكون صفر أخطاء.
2. `npx vite build` → يجب أن ينجح.
3. اعمل commit بالرسالة التالية حرفيًا:

```
feat(finance): cloud sync outbox with visible pending indicator + drop dead invoices collection access
```

4. لا تضغط Publish.
5. أبلغني برقم الكوميت الحقيقي وناتج `git diff --stat` فقط.
