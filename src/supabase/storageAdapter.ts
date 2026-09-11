/**
 * Enterprise Architecture - Production Supabase Storage Adapter
 * Step 5 Storage Migration (Isolated)
 *
 * Wraps Supabase Storage client functions for managing product images.
 * Kept completely isolated from active live Firebase Storage components.
 */

import { supabase } from './client';
import { LoggerService } from '../core/services/LoggerService';

export const BUCKET_NAME = 'product-images';

export interface StorageUploadResult {
  publicUrl: string | null;
  path: string | null;
  error: Error | null;
}

export interface StorageDeleteResult {
  error: Error | null;
}

/**
 * Returns the public URL for an image path in the 'product-images' bucket
 */
export function getPublicImageUrl(path: string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanPath);
  return data.publicUrl || '';
}

/**
 * Uploads a product image file to Supabase Storage and returns its public URL
 */
export async function uploadProductImage(
  file: File,
  path: string
): Promise<StorageUploadResult> {
  try {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(cleanPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      LoggerService.warn('SupabaseStorageAdapter', `uploadProductImage failed for ${cleanPath}:`, error.message);
      return { publicUrl: null, path: null, error };
    }

    const publicUrl = getPublicImageUrl(data.path);

    LoggerService.info('SupabaseStorageAdapter', `Uploaded product image successfully to ${data.path}`);
    return {
      publicUrl,
      path: data.path,
      error: null,
    };
  } catch (err: any) {
    LoggerService.warn('SupabaseStorageAdapter', `uploadProductImage unexpected error:`, err);
    return {
      publicUrl: null,
      path: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Deletes a product image from Supabase Storage by its storage path
 */
export async function deleteProductImage(path: string): Promise<StorageDeleteResult> {
  try {
    if (!path) {
      throw new Error('No path provided for deletion.');
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([cleanPath]);

    if (error) {
      LoggerService.warn('SupabaseStorageAdapter', `deleteProductImage failed for ${cleanPath}:`, error.message);
      return { error };
    }

    LoggerService.info('SupabaseStorageAdapter', `Deleted product image successfully from ${cleanPath}`);
    return { error: null };
  } catch (err: any) {
    LoggerService.warn('SupabaseStorageAdapter', `deleteProductImage unexpected error:`, err);
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export const supabaseImageStorage = {
  uploadProductImage,
  deleteProductImage,
  getPublicImageUrl,
  BUCKET_NAME,
};
