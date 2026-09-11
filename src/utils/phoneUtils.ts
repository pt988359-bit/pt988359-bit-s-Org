/**
 * Phone Utilities for Egyptian Phone Numbers
 */

/**
 * Validates Egyptian local phone number format (01XXXXXXXXX - 11 digits)
 */
export function validateEgyptianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Matches Egyptian mobile format: 010, 011, 012, 015 followed by 8 digits
  const egPhoneRegex = /^01[0125][0-9]{8}$/;
  return egPhoneRegex.test(cleaned);
}

/**
 * Normalizes Egyptian local phone number (e.g. 01012345678) into international format
 * for WhatsApp links (+201012345678 or 201012345678).
 * Never modifies the number displayed to the user! Only normalizes internally.
 */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with +20, remove + and return
  if (cleaned.startsWith('+20')) {
    return cleaned.slice(1);
  }

  // If starts with 201, return as is
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return cleaned;
  }

  // If local 01XXXXXXXXX (11 digits), prepend 20 and remove leading 0
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '20' + cleaned.slice(1);
  }

  // Fallback
  return cleaned;
}

/**
 * Formats a raw phone number nicely for display (01X XXXX XXXX)
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
