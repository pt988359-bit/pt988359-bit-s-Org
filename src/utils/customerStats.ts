import { defaultRequestRepository, UnifiedCustomerRequest } from '../core/repositories/RequestRepository';

/**
 * Normalizes a phone number to canonical local digits format (e.g. 01012345678)
 * for reliable cross-system matching between customers and requests.
 */
export function normalizePhoneForMatching(phone?: string | null): string {
  if (!phone) return '';
  // Remove all non-numeric characters
  let cleaned = String(phone).replace(/\D/g, '');
  if (!cleaned) return '';

  // Handle 0020 Egyptian country code prefix
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith('20') && cleaned.length >= 12) {
    cleaned = cleaned.slice(2);
  }

  // Handle local 10-digit format without leading 0 (e.g. 10xxxxxxxx, 11xxxxxxxx, 12xxxxxxxx, 15xxxxxxxx)
  if (
    cleaned.length === 10 &&
    (cleaned.startsWith('10') || cleaned.startsWith('11') || cleaned.startsWith('12') || cleaned.startsWith('15'))
  ) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Checks whether a given UnifiedCustomerRequest belongs to the given customer phone number.
 */
export function doesRequestMatchCustomerPhone(
  req: UnifiedCustomerRequest,
  primaryPhone?: string | null,
  secondaryPhone?: string | null
): boolean {
  const normPrimary = normalizePhoneForMatching(primaryPhone);
  const normSecondary = normalizePhoneForMatching(secondaryPhone);

  if (!normPrimary && !normSecondary) return false;

  const candidatePhones = [
    req.customer?.phone,
    req.customer?.whatsappPhone,
    (req as any).customerPhone,
    (req as any).phone,
  ].filter(Boolean) as string[];

  return candidatePhones.some((p) => {
    const norm = normalizePhoneForMatching(p);
    if (!norm) return false;
    return (Boolean(normPrimary) && norm === normPrimary) || (Boolean(normSecondary) && norm === normSecondary);
  });
}

export interface CustomerDynamicStats {
  totalRequests: number;
  totalPurchases: number;
  requests: UnifiedCustomerRequest[];
  purchaseRequests: UnifiedCustomerRequest[];
}

/**
 * Dynamically computes totalRequests and totalPurchases for a customer by filtering
 * defaultRequestRepository.getAll() matching normalized primary/secondary phone.
 */
export function getCustomerDynamicStats(
  primaryPhone?: string | null,
  secondaryPhone?: string | null,
  allRequests?: UnifiedCustomerRequest[]
): CustomerDynamicStats {
  const requestsSource = allRequests || defaultRequestRepository.getAll();
  const matchingRequests = requestsSource.filter((r) =>
    doesRequestMatchCustomerPhone(r, primaryPhone, secondaryPhone)
  );

  const purchaseRequests = matchingRequests.filter(
    (r) =>
      r.type === 'purchase' ||
      (r.status === 'completed' && (r.type === 'reservation' || r.type === 'negotiation'))
  );

  return {
    totalRequests: matchingRequests.length,
    totalPurchases: purchaseRequests.length,
    requests: matchingRequests,
    purchaseRequests,
  };
}
