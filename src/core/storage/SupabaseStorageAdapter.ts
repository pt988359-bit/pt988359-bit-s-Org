/**
 * Enterprise Architecture - Production Supabase Storage Adapter
 * Step 3 Supabase Migration
 *
 * Implements StorageAdapter interface for Supabase, mirroring FirestoreStorageAdapter
 * with local fallback, bidirectional camelCase/snake_case mapping, and Supabase Realtime subscriptions.
 */

import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { LoggerService } from '../services/LoggerService';
import { supabase } from '../../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type StorageMode = 'local' | 'supabase';

/**
 * Table Column Definitions (extracted from sql/001_initial_schema.sql)
 * Known typed columns per table that are extracted to top-level Postgres columns.
 * All other properties are safely stored in the `data` jsonb column.
 */
const TABLE_TYPED_COLUMNS: Record<string, Set<string>> = {
  products: new Set([
    'id', 'title', 'brand', 'model', 'category_id', 'category', 'price',
    'original_price', 'min_negotiation_price', 'is_negotiable', 'condition',
    'status', 'availability_status', 'lifecycle_stage', 'is_published',
    'is_archived', 'is_featured', 'showroom_location', 'qr_code', 'barcode',
    'views_count', 'reservations_count', 'purchase_requests_count', 'negotiations_count',
    'created_at', 'updated_at',
  ]),
  categories: new Set([
    'id', 'name', 'arabic_name', 'english_name', 'slug', 'seo_slug',
    'icon_name', 'is_active', 'sort_order', 'created_at', 'updated_at',
  ]),
  brands: new Set([
    'id', 'name', 'arabic_name', 'logo_url', 'is_active', 'sort_order',
    'created_at', 'updated_at',
  ]),
  customers: new Set([
    'id', 'full_name', 'primary_phone', 'whatsapp_phone', 'email', 'status',
    'first_contact_date', 'last_activity_date', 'total_requests', 'total_purchases',
    'total_reservations', 'total_spent', 'assigned_admin', 'firebase_uid',
    'is_archived', 'created_at', 'updated_at',
  ]),
  users: new Set([
    'id', 'username', 'email', 'full_name', 'role', 'is_two_factor_enabled',
    'last_login_at', 'created_at', 'updated_at',
  ]),
  reservations: new Set([
    'id', 'reservation_number', 'product_id', 'customer_id', 'customer_name',
    'customer_phone', 'customer_email', 'product_price', 'remaining_balance',
    'duration_hours', 'expires_at', 'status', 'assigned_admin', 'auto_release_enabled',
    'is_archived', 'created_at', 'updated_at',
  ]),
  orders: new Set([
    'id', 'order_number', 'customer_id', 'customer_name', 'phone', 'total_amount',
    'remaining_amount', 'payment_method', 'status', 'created_at', 'updated_at',
  ]),
  completed_sales: new Set([
    'id', 'order_number', 'customer_name', 'customer_phone', 'product_id',
    'product_title', 'final_price', 'payment_method', 'invoice_number',
    'completion_date', 'delivery_type', 'assigned_admin', 'created_at', 'updated_at',
  ]),
  exchange_requests: new Set([
    'id', 'request_number', 'customer_name', 'customer_phone', 'customer_whatsapp',
    'current_appliance_type', 'current_brand', 'desired_product_id',
    'estimated_trade_value', 'cash_difference', 'status', 'assigned_admin',
    'created_at', 'updated_at',
  ]),
  sell_requests: new Set([
    'id', 'request_number', 'customer_name', 'customer_phone', 'customer_whatsapp',
    'appliance_type', 'brand', 'asking_price', 'offered_price', 'condition',
    'status', 'assigned_admin', 'created_at', 'updated_at',
  ]),
  purchase_requests: new Set([
    'id', 'reference_number', 'customer_id', 'customer_name', 'customer_phone',
    'product_id', 'product_title', 'product_price', 'priority', 'status',
    'assigned_admin', 'is_archived', 'created_at', 'updated_at',
  ]),
  negotiations: new Set([
    'id', 'reference_number', 'customer_name', 'customer_phone', 'product_id',
    'product_title', 'original_price', 'suggested_price', 'discount_amount',
    'discount_percent', 'status', 'assigned_admin', 'created_at', 'updated_at',
  ]),
  inquiries: new Set([
    'id', 'reference_number', 'customer_name', 'customer_phone', 'product_id',
    'product_title', 'inquiry_message', 'admin_response', 'priority', 'status',
    'assigned_admin', 'created_at', 'updated_at',
  ]),
  suppliers: new Set([
    'id', 'supplier_number', 'name', 'phone', 'whatsapp', 'area', 'type',
    'purchase_count', 'total_spent', 'rating', 'is_archived', 'created_at', 'updated_at',
  ]),
  expenses: new Set([
    'id', 'reference_number', 'category', 'amount', 'description',
    'related_product_id', 'supplier_id', 'created_by', 'date', 'is_archived',
    'created_at', 'updated_at',
  ]),
  finance: new Set([
    'id', 'reference_number', 'type', 'category', 'amount', 'description',
    'created_at', 'updated_at',
  ]),
  cost_sheets: new Set([
    'id', 'product_id', 'product_title', 'category', 'purchase_cost',
    'repair_cost', 'total_cost', 'target_selling_price', 'minimum_acceptable_price',
    'target_profit_margin_percent', 'created_at', 'updated_at',
  ]),
  invoices: new Set([
    'id', 'invoice_number', 'customer_name', 'customer_phone', 'subtotal',
    'tax_amount', 'discount_amount', 'total_amount', 'payment_status',
    'issue_date', 'due_date', 'created_at', 'updated_at',
  ]),
  cash_ledgers: new Set([
    'id', 'reference_number', 'type', 'category', 'amount', 'description',
    'running_balance', 'created_by', 'is_archived', 'created_at', 'updated_at',
  ]),
  audit_logs: new Set([
    'id', 'action', 'actor', 'actor_role', 'target', 'category', 'status',
    'severity', 'ip_address', 'device', 'description', 'timestamp',
    'created_at', 'updated_at',
  ]),
  showroom_settings: new Set([
    'id', 'name', 'brand_tagline', 'email', 'phone', 'whatsapp_phone',
    'enable_ai_assistant', 'currency_symbol', 'created_at', 'updated_at',
  ]),
  documents: new Set([
    'id', 'document_number', 'type', 'title', 'reference_number', 'customer_name',
    'customer_phone', 'product_title', 'product_price', 'remaining_amount',
    'issue_date', 'status', 'created_at', 'updated_at',
  ]),
  admins: new Set([
    'id', 'email', 'username', 'full_name', 'role', 'is_active',
    'created_at', 'updated_at',
  ]),
  inventory: new Set([
    'id', 'reference_number', 'appliance_type', 'brand', 'target_purchase_price',
    'maximum_purchase_price', 'priority', 'status', 'is_archived',
    'created_at', 'updated_at',
  ]),
  reports: new Set([
    'id', 'title', 'report_type', 'generated_by', 'period_start', 'period_end',
    'created_at', 'updated_at',
  ]),
  analytics: new Set([
    'id', 'metric_key', 'category', 'value', 'date', 'created_at', 'updated_at',
  ]),
  portal_tracking: new Set([
    'id', 'tracking_code', 'phone', 'reference_number', 'is_invalidated',
    'created_at', 'updated_at',
  ]),
  portal_sessions: new Set([
    'id', 'phone_number', 'normalized_phone', 'customer_name', 'auth_method',
    'authenticated_at', 'created_at', 'updated_at',
  ]),
  portal_support: new Set([
    'id', 'thread_id', 'sender', 'sender_name', 'message', 'created_at', 'updated_at',
  ]),
  auth_sessions: new Set([
    'id', 'token', 'user_id', 'expires_at', 'created_at', 'updated_at',
  ]),
  auth_attempts: new Set([
    'id', 'ip', 'email', 'attempts_count', 'is_locked_until', 'last_failed_at',
    'created_at', 'updated_at',
  ]),
  auth_logs: new Set([
    'id', 'user_id', 'user_name', 'action', 'category', 'status', 'ip_address',
    'created_at', 'updated_at',
  ]),
  notifications: new Set([
    'id', 'type', 'title', 'message', 'reference_number', 'priority', 'state',
    'is_read', 'user_id', 'created_at', 'updated_at',
  ]),
  reviews: new Set([
    'id', 'customer_name', 'rating', 'comment', 'approved', 'location',
    'created_at', 'updated_at',
  ]),
  ai_knowledge: new Set([
    'id', 'rule_code', 'category', 'title', 'enforced', 'created_at', 'updated_at',
  ]),
};

/**
 * Converts a camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Bidirectional mapper: Maps an incoming TypeScript object (camelCase) to a Postgres row (snake_case + data jsonb).
 */
export function mapItemToPostgresRow(tableName: string, item: any): Record<string, any> {
  if (!item || typeof item !== 'object') {
    return { id: crypto.randomUUID(), data: item };
  }

  const typedColumns = TABLE_TYPED_COLUMNS[tableName];
  const row: Record<string, any> = {};
  const remainingData: Record<string, any> = {};

  // Ensure primary key id exists
  const id = item.id || item._id || item.key || crypto.randomUUID();
  row.id = String(id);

  // Normalize incoming fields
  for (const [key, value] of Object.entries(item)) {
    if (key === 'id') continue;

    const snakeKey = camelToSnake(key);

    // If the field corresponds to a known typed column in the schema
    if (typedColumns && typedColumns.has(snakeKey)) {
      row[snakeKey] = value;
    } else if (typedColumns && typedColumns.has(key)) {
      // Already snake_case in input
      row[key] = value;
    } else {
      // Remaining unstructured / nested data
      remainingData[key] = value;
    }
  }

  // Handle created_at & updated_at normalization
  if (item.createdAt || item.created_at) {
    row.created_at = new Date(item.createdAt || item.created_at).toISOString();
  } else if (!row.created_at) {
    row.created_at = new Date().toISOString();
  }

  if (item.updatedAt || item.updated_at) {
    row.updated_at = new Date(item.updatedAt || item.updated_at).toISOString();
  } else {
    row.updated_at = new Date().toISOString();
  }

  row.data = remainingData;
  return row;
}

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key] && process.env[key].trim() !== '') {
    return process.env[key].trim();
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[key];
      if (val && typeof val === 'string' && val.trim() !== '') {
        return val.trim();
      }
    }
  } catch {
    // Environment without import.meta
  }
  return undefined;
};

/**
 * Bidirectional mapper: Maps a Postgres row (snake_case + data jsonb) back to a single flat camelCase TypeScript object.
 */
export function mapPostgresRowToItem<T>(tableName: string, row: any): T {
  if (!row || typeof row !== 'object') {
    return row as T;
  }

  // Start with the nested unstructured payload from `data jsonb`
  const result: Record<string, any> = typeof row.data === 'object' && row.data !== null ? { ...row.data } : {};

  // Map each top-level typed column back to camelCase ONLY
  for (const [colName, val] of Object.entries(row)) {
    if (colName === 'data') continue;

    if (colName === 'id') {
      result.id = val;
      continue;
    }

    const camelKey = snakeToCamel(colName);
    result[camelKey] = val;
  }

  return result as unknown as T;
}

export class SupabaseStorageAdapter implements StorageAdapter {
  private _fallbackAdapter?: LocalStorageAdapter;
  private mode: StorageMode;
  private activeSubscriptions: Map<string, RealtimeChannel> = new Map();

  private get fallbackAdapter(): LocalStorageAdapter {
    if (!this._fallbackAdapter) {
      this._fallbackAdapter = new LocalStorageAdapter();
    }
    return this._fallbackAdapter;
  }

  constructor(mode?: StorageMode) {
    const rawMode = getEnv('VITE_SUPABASE_STORAGE_MODE');
    const defaultMode: StorageMode = rawMode === 'supabase' ? 'supabase' : 'local';
    this.mode = mode || defaultMode;
  }

  public setMode(mode: StorageMode): void {
    this.mode = mode;
    LoggerService.info('SupabaseStorageAdapter', `Storage mode switched to ${mode}`);
  }

  public getMode(): StorageMode {
    return this.mode;
  }

  public getItem<T>(key: string): T | null {
    return this.fallbackAdapter.getItem<T>(key);
  }

  public setItem<T>(key: string, value: T): void {
    // 1. Write to local storage cache first
    this.fallbackAdapter.setItem<T>(key, value);

    // 2. Asynchronously sync to Supabase if item is a structured record with an id
    if (this.getMode() === 'supabase' && typeof value === 'object' && value !== null && 'id' in (value as any)) {
      const tableName = key;
      const mappedRow = mapItemToPostgresRow(tableName, value);

      (async () => {
        try {
          const { error } = await supabase.from(tableName).upsert(mappedRow);
          if (error) {
            LoggerService.warn('SupabaseStorageAdapter', `Async setItem sync failed for key ${key}`, error);
          }
        } catch (err) {
          LoggerService.warn('SupabaseStorageAdapter', `Async setItem unexpected error for key ${key}`, err);
        }
      })();
    }
  }

  public removeItem(key: string): void {
    this.fallbackAdapter.removeItem(key);
  }

  public clear(): void {
    this.fallbackAdapter.clear();
  }

  public getCollection<T>(collectionName: string): T[] {
    return this.fallbackAdapter.getCollection<T>(collectionName);
  }

  public saveCollection<T>(collectionName: string, items: T[]): void {
    // 1. Save to local storage immediately
    this.fallbackAdapter.saveCollection<T>(collectionName, items);

    // 2. Asynchronously batch sync to Supabase
    if (this.getMode() === 'supabase' && Array.isArray(items)) {
      const validItems = items.filter((item) => item && typeof item === 'object' && 'id' in (item as any));
      if (validItems.length === 0) return;

      const mappedRows = validItems.map((item) => mapItemToPostgresRow(collectionName, item));

      // Batch in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < mappedRows.length; i += chunkSize) {
        const chunk = mappedRows.slice(i, i + chunkSize);
        (async () => {
          try {
            const { error } = await supabase.from(collectionName).upsert(chunk);
            if (error) {
              LoggerService.warn('SupabaseStorageAdapter', `Batch upsert to ${collectionName} failed`, error);
            }
          } catch (err) {
            LoggerService.warn('SupabaseStorageAdapter', `Batch upsert unexpected error for ${collectionName}`, err);
          }
        })();
      }
    }
  }

  public queryCollection<T>(collectionName: string, predicate: (item: T) => boolean): T[] {
    return this.fallbackAdapter.queryCollection<T>(collectionName, predicate);
  }

  public async fetchCollectionAsync<T>(collectionName: string): Promise<T[]> {
    if (this.getMode() === 'local') {
      return this.getCollection<T>(collectionName);
    }

    try {
      const { data, error } = await supabase
        .from(collectionName)
        .select('*');

      if (error) {
        LoggerService.warn('SupabaseStorageAdapter', `fetchCollectionAsync failed for ${collectionName}: ${error.message}. Falling back to local cache.`);
        return this.getCollection<T>(collectionName);
      }

      if (data && data.length > 0) {
        const mappedItems = data.map((row) => mapPostgresRowToItem<T>(collectionName, row));
        this.fallbackAdapter.saveCollection(collectionName, mappedItems);
        return mappedItems;
      }
    } catch (err) {
      LoggerService.warn('SupabaseStorageAdapter', `fetchCollectionAsync unexpected error for ${collectionName}, using local cache`, err);
    }

    return this.getCollection<T>(collectionName);
  }

  public subscribeToCollectionUpdates<T extends { id: string }>(
    collectionName: string,
    onUpdate: (items: T[]) => void
  ): () => void {
    if (this.getMode() !== 'supabase') {
      return () => {};
    }

    // Cancel existing subscription on same collection key if active
    if (this.activeSubscriptions.has(collectionName)) {
      const existingChannel = this.activeSubscriptions.get(collectionName);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
      this.activeSubscriptions.delete(collectionName);
    }

    // Trigger initial authoritative fetch immediately
    this.fetchCollectionAsync<T>(collectionName)
      .then((items) => {
        if (items && items.length > 0) {
          onUpdate(items);
        } else {
          const cached = this.getCollection<T>(collectionName);
          if (cached && cached.length > 0) {
            onUpdate(cached);
          }
        }
      })
      .catch(() => {
        const cached = this.getCollection<T>(collectionName);
        if (cached && cached.length > 0) {
          onUpdate(cached);
        }
      });

    // Setup Supabase Realtime Postgres Changes channel
    const channel = supabase
      .channel(`realtime:${collectionName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collectionName },
        () => {
          // On any insert, update, or delete, refetch the updated collection
          this.fetchCollectionAsync<T>(collectionName)
            .then((updatedItems) => {
              onUpdate(updatedItems);
            })
            .catch((err) => {
              LoggerService.warn('SupabaseStorageAdapter', `Realtime update refetch failed for ${collectionName}`, err);
            });
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          LoggerService.warn('SupabaseStorageAdapter', `Realtime channel error for ${collectionName}, falling back to local cache`);
          const cached = this.getCollection<T>(collectionName);
          if (cached && cached.length > 0) {
            onUpdate(cached);
          }
        }
      });

    this.activeSubscriptions.set(collectionName, channel);

    return () => {
      supabase.removeChannel(channel);
      this.activeSubscriptions.delete(collectionName);
    };
  }
}

export const supabaseStorageAdapter = new SupabaseStorageAdapter();
