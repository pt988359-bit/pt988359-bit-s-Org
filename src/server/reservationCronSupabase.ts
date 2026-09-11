/**
 * Enterprise Architecture - Production Server-Side Supabase Reservation Expiry Worker
 * Step 6 Migration (Isolated Background Job Implementation)
 *
 * Implements the exact same business logic as reservationCron.ts using Supabase Admin Client.
 * Scans 'reservations' table in Supabase PostgreSQL, expires past reservation limits,
 * restores product availability in 'products', writes audit logs in 'audit_logs',
 * and creates alert records in 'notifications'.
 *
 * NOTE: Kept strictly isolated and inert. NOT automatically scheduled or called until final cutover.
 */

import { getSupabaseAdminClient, isSupabaseAdminConfigured } from './supabaseAdmin';

export interface ReservationJobResult {
  status: 'success' | 'warning' | 'error' | 'not_configured';
  processed: number;
  expiredIds: string[];
  dryRun?: boolean;
  message?: string;
  details?: Array<{
    reservationId: string;
    productId?: string;
    customerPhone?: string;
    expiresAt?: string;
    status: string;
  }>;
  error?: string;
}

/**
 * Core processing function for expired reservations via Supabase PostgreSQL.
 * @param options.dryRun If true, scans and detects expired items without writing any database changes.
 */
export async function processExpiredReservationsSupabaseJob(options: {
  dryRun?: boolean;
} = {}): Promise<ReservationJobResult> {
  const { dryRun = false } = options;

  if (!isSupabaseAdminConfigured()) {
    return {
      status: 'not_configured',
      processed: 0,
      expiredIds: [],
      dryRun,
      message: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL environment variable is missing on server.',
    };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      status: 'not_configured',
      processed: 0,
      expiredIds: [],
      dryRun,
      message: 'Failed to obtain server-side Supabase client.',
    };
  }

  try {
    const nowIso = new Date().toISOString();

    // 1. Fetch active/pending reservations
    const { data: rows, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['active', 'pending', 'Reserved', 'reserved', 'ACTIVE', 'PENDING']);

    if (fetchError) {
      console.warn('[SupabaseReservationJob] Query error on reservations table:', fetchError.message);
      return {
        status: 'error',
        processed: 0,
        expiredIds: [],
        dryRun,
        error: fetchError.message,
      };
    }

    if (!rows || rows.length === 0) {
      return {
        status: 'success',
        processed: 0,
        expiredIds: [],
        dryRun,
        message: 'No active or pending reservations found.',
      };
    }

    // 2. Identify expired reservations
    const expiredRows: any[] = [];
    for (const row of rows) {
      const rowData = typeof row.data === 'object' && row.data !== null ? row.data : {};
      const status = (row.status || rowData.status || '').toLowerCase();
      const expiresAt = row.expires_at || rowData.expiresAt || rowData.expires_at;

      const isCandidateStatus = status === 'active' || status === 'pending' || status === 'reserved';
      if (isCandidateStatus && expiresAt && expiresAt < nowIso) {
        expiredRows.push({
          id: row.id,
          productId: row.product_id || rowData.productId || rowData.product_id,
          productTitle: rowData.productTitle || rowData.product_title || row.product_id,
          customerPhone: row.customer_phone || rowData.customerPhone || rowData.customer_phone,
          customerName: row.customer_name || rowData.customerName,
          expiresAt,
          rawData: rowData,
        });
      }
    }

    if (expiredRows.length === 0) {
      return {
        status: 'success',
        processed: 0,
        expiredIds: [],
        dryRun,
        message: 'All active reservations are currently within their valid time limits.',
      };
    }

    const expiredIds: string[] = expiredRows.map((r) => r.id);
    const detailsSummary = expiredRows.map((r) => ({
      reservationId: r.id,
      productId: r.productId,
      customerPhone: r.customerPhone,
      expiresAt: r.expiresAt,
      status: 'expired',
    }));

    // If dry-run, stop before any mutation
    if (dryRun) {
      return {
        status: 'success',
        processed: expiredRows.length,
        expiredIds,
        dryRun: true,
        message: `[Dry Run] Detected ${expiredRows.length} expired reservations eligible for release.`,
        details: detailsSummary,
      };
    }

    // 3. Process expired items (Execute mutations in Supabase)
    for (const item of expiredRows) {
      // Step A: Mark reservation expired
      await supabase
        .from('reservations')
        .update({
          status: 'expired',
          expires_at: item.expiresAt,
          updated_at: nowIso,
          data: {
            ...item.rawData,
            status: 'expired',
            expiredAt: nowIso,
            updatedAt: nowIso,
          },
        })
        .eq('id', item.id);

      // Step B: Return product to available status
      if (item.productId) {
        // Fetch current product data to merge nicely
        const { data: prodRow } = await supabase
          .from('products')
          .select('data')
          .eq('id', item.productId)
          .single();

        const prodData = prodRow?.data && typeof prodRow.data === 'object' ? prodRow.data : {};

        await supabase
          .from('products')
          .update({
            status: 'available',
            availability_status: 'available',
            lifecycle_stage: 'published',
            updated_at: nowIso,
            data: {
              ...prodData,
              status: 'available',
              availabilityStatus: 'available',
              lifecycleStage: 'published',
              isReserved: false,
              reservedBy: null,
              reservedUntil: null,
              updatedAt: nowIso,
            },
          })
          .eq('id', item.productId);
      }

      // Step C: Write Audit Log
      const auditId = `audit_sys_exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await supabase.from('audit_logs').insert({
        id: auditId,
        action: 'RESERVATION_AUTO_EXPIRED',
        actor: 'SYSTEM_JOB',
        actor_role: 'system',
        target: 'reservation',
        category: 'operations',
        status: 'success',
        severity: 'info',
        description: `انتهاء مدة حجز الجهاز ${item.productTitle || item.productId} تلقائياً وإعادته للمخزن (Supabase)`,
        timestamp: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
        data: {
          id: auditId,
          action: 'RESERVATION_AUTO_EXPIRED',
          actor: 'SYSTEM_JOB',
          entity: 'reservation',
          entityId: item.id,
          details: `انتهاء مدة حجز الجهاز ${item.productTitle || item.productId} تلقائياً وإعادته للمخزن`,
          timestamp: nowIso,
        },
      });

      // Step D: Send Notification
      const notifId = `notif_exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await supabase.from('notifications').insert({
        id: notifId,
        type: 'reservation_expired',
        title: 'انتهت مدة حجز جهاز',
        message: `تم إلغاء حجز الجهاز ${item.productTitle || item.productId} تلقائياً لانتهاء الوقت المحدد (${item.customerPhone || 'العميل'})`,
        priority: 'medium',
        state: 'unread',
        is_read: false,
        created_at: nowIso,
        updated_at: nowIso,
        data: {
          id: notifId,
          title: 'انتهت مدة حجز جهاز',
          message: `تم إلغاء حجز الجهاز ${item.productTitle || item.productId} تلقائياً لانتهاء الوقت المحدد (${item.customerPhone || 'العميل'})`,
          type: 'reservation_expired',
          read: false,
          createdAt: nowIso,
        },
      });
    }

    console.log(`[SupabaseReservationJob] Processed ${expiredRows.length} expired reservations: ${expiredIds.join(', ')}`);
    return {
      status: 'success',
      processed: expiredRows.length,
      expiredIds,
      dryRun: false,
      message: `Processed and released ${expiredRows.length} expired reservations in Supabase.`,
      details: detailsSummary,
    };
  } catch (error: any) {
    console.error('[SupabaseReservationJob] Execution error:', error?.message || error);
    return {
      status: 'error',
      processed: 0,
      expiredIds: [],
      dryRun,
      error: error?.message || String(error),
    };
  }
}
