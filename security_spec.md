# Security Specification & Data Invariants Audit

## Core Identity & Role Invariants
1. **Unauthenticated Public Users**:
   - May read published products in `/products/{productId}` where `status == 'available'` or public catalogue listings.
   - May create a reservation in `/reservations/{reservationId}` strictly matching `isValidReservation()` schema (must have valid `customerPhone`, max 1 active reservation, valid product ID).
   - May submit trade-in/sell requests (`/sell_requests`) or product exchange requests (`/exchange_requests`) with required contact fields and size-bounded fields.
   - May submit inquiries or purchase requests under strict rate limits & payload constraints.
   - **FORBIDDEN**: Cannot modify existing records, update status, read customer PII lists, view finance/ledger data, or access `/admins` or `/expenses`.

2. **Authenticated Customers**:
   - May read and update their own customer profile in `/customers/{customerId}` (`customerId == request.auth.uid`).
   - May read their own reservations and purchase requests where `customerPhone == request.auth.token.phone_number` or `customerId == request.auth.uid`.

3. **Admins (`/admins/{uid}`)**:
   - Must be authenticated (`request.auth != null`) AND verified via Firestore document lookup `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching registered admin email domain with verified status.
   - Can read, create, update, and manage all collections (`products`, `customers`, `reservations`, `orders`, `suppliers`, `expenses`, `finance`, `invoices`, `audit_logs`, `showroom_settings`, `documents`, `system_logs`).

---

## Data Invariants per Collection

### 1. Products (`/products/{productId}`)
- `id`: string <= 128 chars, matches `^[a-zA-Z0-9_-]+$`
- `name`: string, 2..200 chars
- `price`: number >= 0
- `category`: string <= 50 chars
- `images`: list of string URLs, max size 10, each item string <= 1000 chars

### 2. Reservations (`/reservations/{reservationId}`)
- `productId`: string <= 128 chars
- `customerPhone`: string, 8..20 chars
- `customerName`: string, 2..100 chars
- `status`: string, enum `['active', 'expired', 'cancelled', 'completed', 'converted']`
- `createdAt`: server timestamp or ISO string <= 50 chars
- **Terminal Lock**: Once `status` is `'expired'`, `'cancelled'`, or `'converted'`, regular non-admins cannot change `status`.

### 3. Orders & Purchase Requests (`/orders/{orderId}`)
- Public can create with valid `productId` and `customerPhone`.
- Immutable fields on update: `orderId`, `customerId`, `createdAt`.
- Unauthenticated users cannot read arbitrary order records without matching order reference.

---

## The "Dirty Dozen" Malicious Payloads

1. **Payload #1 (Privilege Escalation via Shadow Admin)**
   - Attack: Attempting to create `/admins/attacker_uid` with `{ role: 'superadmin' }`.
   - Expected Result: `PERMISSION_DENIED`

2. **Payload #2 (Overwriting Product Prices)**
   - Attack: Unauthenticated request updating `/products/prod_123` with `{ price: 1 }`.
   - Expected Result: `PERMISSION_DENIED`

3. **Payload #3 (SQL/Script Injection in Product Name)**
   - Attack: Creating product with `<script>alert(1)</script>` or 2MB string.
   - Expected Result: `PERMISSION_DENIED`

4. **Payload #4 (PII Harvesting on Customers)**
   - Attack: Unauthenticated list query on `/customers`.
   - Expected Result: `PERMISSION_DENIED`

5. **Payload #5 (Status Manipulation on Reservations)**
   - Attack: Updating reservation status from `expired` to `approved` as guest.
   - Expected Result: `PERMISSION_DENIED`

6. **Payload #6 (Financial Ledger Modification)**
   - Attack: Unauthenticated write to `/finance/daily_summary` setting net income to 1,000,000.
   - Expected Result: `PERMISSION_DENIED`

7. **Payload #7 (Bypassing Immutable Fields)**
   - Attack: Updating `/orders/ord_100` changing `customerId` to another victim's UID.
   - Expected Result: `PERMISSION_DENIED`

8. **Payload #8 (System Log Tampering)**
   - Attack: Deleting `/audit_logs/log_999` to cover malicious activity.
   - Expected Result: `PERMISSION_DENIED`

9. **Payload #9 (Over-Sized Image List Injection)**
   - Attack: Updating a product with an array of 5,000 image URLs.
   - Expected Result: `PERMISSION_DENIED`

10. **Payload #10 (Injected Junk Character Document ID)**
    - Attack: Creating document at `/reservations/` with a 2000-character malicious string ID.
    - Expected Result: `PERMISSION_DENIED`

11. **Payload #11 (Unverified Email Admin Spoofing)**
    - Attack: Authenticating with `email_verified: false` and requesting admin workspace write.
    - Expected Result: `PERMISSION_DENIED`

12. **Payload #12 (Shadow Field Injection in Reservation)**
    - Attack: Creating a reservation with hidden administrative fields `{ isAdminApproved: true, priceDiscount: 90 }`.
    - Expected Result: `PERMISSION_DENIED`
