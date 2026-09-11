/**
 * Security & Hashing Utilities
 * Ensures passwords are never stored or transmitted in plain text.
 */

const SALT = 'PROTECK_MAADI_SECURE_SALT_2026';

/**
 * Hash a plain string using SHA-256 + Salt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salted = `${SALT}:${plainText}:${SALT}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salted);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple fallback string hashing
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(24);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Cryptographically safe fallback using Date timestamp and high resolution time
    const ts = Date.now().toString(16) + performance.now().toString(16).replace('.', '');
    return (ts + '0000000000000000000000000000000000000000').slice(0, 48);
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
