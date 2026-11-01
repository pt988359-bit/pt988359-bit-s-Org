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
