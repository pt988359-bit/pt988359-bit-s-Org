/**
 * Server-Side Reservation Expiry Background Job
 * Runs every minute on the server independently of client browser sessions.
 * Scans reservations in Firestore via Firebase Admin SDK, expires past reservation limits, restores product status,
 * creates audit log, and dispatches notifications.
 */

import { getAdminDb } from './firebaseAdmin';

export async function processExpiredReservationsJob(): Promise<{
  processed: number;
  expiredIds: string[];
}> {
  try {
    const db = getAdminDb();
    const nowIso = new Date().toISOString();
    const reservationsCol = db.collection('reservations');

    // Query active or pending reservations
    const snapshot = await reservationsCol.get();
    if (snapshot.empty) {
      return { processed: 0, expiredIds: [] };
    }

    const expiredDocs: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = data.status;
      const expiresAt = data.expiresAt;

      if ((status === 'active' || status === 'pending') && expiresAt && expiresAt < nowIso) {
        expiredDocs.push({ id: docSnap.id, ...data });
      }
    });

    if (expiredDocs.length === 0) {
      return { processed: 0, expiredIds: [] };
    }

    const batch = db.batch();
    const expiredIds: string[] = [];

    for (const resItem of expiredDocs) {
      expiredIds.push(resItem.id);

      // 1. Mark reservation expired
      const resRef = db.collection('reservations').doc(resItem.id);
      batch.update(resRef, {
        status: 'expired',
        expiredAt: nowIso,
        updatedAt: nowIso,
      });

      // 2. Return product to Available
      if (resItem.productId) {
        const prodRef = db.collection('products').doc(resItem.productId);
        batch.update(prodRef, {
          status: 'available',
          availabilityStatus: 'available',
          lifecycleStage: 'published',
          isReserved: false,
          reservedBy: null,
          reservedUntil: null,
          updatedAt: nowIso,
        });
      }

      // 3. Write Audit Log
      const auditRef = db.collection('audit_logs').doc();
      batch.set(auditRef, {
        id: auditRef.id,
        action: 'RESERVATION_AUTO_EXPIRED',
        actor: 'SYSTEM_JOB',
        entity: 'reservation',
        entityId: resItem.id,
        details: `انتهاء مدة حجز الجهاز ${resItem.productTitle || resItem.productId} تلقائياً وإعادته للمخزن`,
        timestamp: nowIso,
      });

      // 4. Send Notification
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        id: notifRef.id,
        title: 'انتهت مدة حجز جهاز',
        message: `تم إلغاء حجز الجهاز ${resItem.productTitle || resItem.productId} تلقائياً لانتهاء الوقت المحدد (${resItem.customerPhone || 'العميل'})`,
        type: 'reservation_expired',
        read: false,
        createdAt: nowIso,
      });
    }

    await batch.commit();
    console.log(`[ReservationJob] Processed ${expiredDocs.length} expired reservations: ${expiredIds.join(', ')}`);
    return { processed: expiredDocs.length, expiredIds };
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes('NOT_FOUND')) {
      console.warn('[ReservationJob] Firestore database not found or uninitialized on server Admin SDK:', error.message || error);
    } else if (error?.code === 7 || error?.message?.includes('PERMISSION_DENIED')) {
      console.warn('[ReservationJob] Server-side Admin SDK lacks credentials/permissions for background cron:', error.message || error);
    } else {
      console.warn('[ReservationJob] Reservation expiration check notice:', error?.message || error);
    }
    return { processed: 0, expiredIds: [] };
  }
}

let jobInterval: NodeJS.Timeout | null = null;

export function startReservationExpirationCron(intervalMs = 60000) {
  if (jobInterval) return;
  console.log(`[ReservationJob] Starting server-side reservation expiration cron worker every ${intervalMs / 1000}s`);

  // Delay initial check by 20s so server startup is completely unblocked
  setTimeout(async () => {
    try {
      await processExpiredReservationsJob();
    } catch (err: any) {
      console.warn('[ReservationJob] Initial background expiration check notice:', err?.message || err);
    }
  }, 20000);

  jobInterval = setInterval(async () => {
    try {
      await processExpiredReservationsJob();
    } catch (err: any) {
      console.warn('[ReservationJob] Background expiration check notice:', err?.message || err);
    }
  }, intervalMs);
}
