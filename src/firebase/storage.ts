import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { app } from './firebase';
import { firebaseConfig } from './config';
import { LoggerService } from '../core/services/LoggerService';

export const storage = getStorage(app, firebaseConfig.storageBucket || 'quadratic-infusion-gzp2g.firebasestorage.app');

/**
 * Compresses an image file in the browser using HTML Canvas before upload
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file to Firebase Storage and returns the public download URL
 */
export async function uploadFileToStorage(
  file: File,
  folderPath: string,
  onProgress?: (progressPct: number) => void
): Promise<string> {
  try {
    console.log("STEP 3");
    console.log(storage);
    console.log(storage.app.options.storageBucket);

    const compressed = await compressImage(file);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${sanitizedName}`;
    const storageRef = ref(storage, `${folderPath}/${filename}`);
    console.log(storageRef.fullPath);

    console.log("STEP 7");
    const uploadTask = uploadBytesResumable(storageRef, compressed, {
      contentType: compressed.type,
    });
    console.log("Upload task created");

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          console.log(snapshot.bytesTransferred);
          console.log(snapshot.totalBytes);
          console.log(snapshot.state);
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error(error);
          console.error((error as any)?.code);
          console.error((error as any)?.message);
          console.error((error as any)?.stack);
          LoggerService.error('FirebaseStorage', `Upload failed for ${file.name}`, error);
          reject(error);
        },
        async () => {
          console.log("Upload completed");
          console.log("Downloading URL");
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(downloadUrl);
            LoggerService.info('FirebaseStorage', `File uploaded successfully: ${downloadUrl}`);
            resolve(downloadUrl);
          } catch (err) {
            console.error(err);
            console.error((err as any)?.code);
            console.error((err as any)?.message);
            console.error((err as any)?.stack);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    console.error((error as any)?.code);
    console.error((error as any)?.message);
    console.error((error as any)?.stack);
    LoggerService.error('FirebaseStorage', 'Error in uploadFileToStorage', error);
    throw error;
  }
}

/**
 * Uploads a product image file to Firebase Storage under products/{productId}/
 */
export async function uploadProductImageToStorage(
  file: File,
  productId: string,
  onProgress?: (progressPct: number) => void
): Promise<string> {
  const folderPath = `products/${productId}`;
  return uploadFileToStorage(file, folderPath, onProgress);
}

/**
 * Converts a File into a compressed Data URL (base64) for instant site storage and rendering
 * before or independently of Firebase Storage uploads
 */
export async function convertFileToDataUrl(file: File): Promise<string> {
  const compressed = await compressImage(file, 1200, 1200, 0.75);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(compressed);
  });
}


/**
 * Deletes a file from Firebase Storage given its full URL or storage path
 */
export async function deleteFileFromStorage(fileUrlOrPath: string): Promise<void> {
  if (!fileUrlOrPath || !fileUrlOrPath.includes('firebasestorage.googleapis.com')) {
    return; // Skip non-firebase storage URLs
  }
  try {
    const fileRef = ref(storage, fileUrlOrPath);
    await deleteObject(fileRef);
    LoggerService.info('FirebaseStorage', `Deleted file from storage: ${fileUrlOrPath}`);
  } catch (error) {
    LoggerService.warn('FirebaseStorage', `Failed to delete file from storage`, error);
  }
}

/**
 * Deletes multiple product images from Firebase Storage
 */
export async function deleteAllProductImagesFromStorage(imageUrls: string[]): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) return;
  const deletePromises = imageUrls
    .filter((url) => url && url.includes('firebasestorage.googleapis.com'))
    .map((url) => deleteFileFromStorage(url));
  await Promise.allSettled(deletePromises);
}

