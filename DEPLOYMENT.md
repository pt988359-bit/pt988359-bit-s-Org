# PRO TECK Showroom — Production Deployment Guide & Operational Runbook

This document serves as the master production deployment guide and operational runbook for the **PRO TECK Appliance Showroom** platform.

---

## 1. System Requirements & Architecture Overview

* **Frontend Framework**: React 19 + TypeScript + Vite + Tailwind CSS (RTL support)
* **Backend Ingress**: Express 4 server on Port 3000
* **Database & Persistence**: Google Cloud Firestore (`ai-studio-proteck-f11aa4ca-9bc5-40c4-a06f-9a11f191c8e8`)
* **Security Rules**: Firestore Security Rules (`firestore.rules`) with complete coverage
* **Settings Management**: Dynamic `showroom_settings` collection for zero-hardcoded configuration

---

## 2. Environment Variables & Configuration

Before deploying to production, verify all required environment variables in `.env` (refer to `.env.example`):

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID (`quadratic-infusion-gzp2g`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_DATABASE_ID` | Firestore Database ID |

Run environment verification in code via:
```ts
import { EnvironmentValidator } from './src/core/services/EnvironmentValidator';
EnvironmentValidator.validateEnvironment();
```

---

## 3. Production Database Seeding (`npm run seed`)

To populate initial categories, brands, default suppliers, and initial showroom settings:

```bash
npm run seed
```

* **Safety Guarantee**: The seeder checks if collections exist prior to writing. It will **NEVER** overwrite existing production data.

---

## 4. Firestore Security Rules Deployment

To deploy updated Firestore Security Rules (`firestore.rules`):

```bash
npm run deploy:rules # or via deploy_firebase tool
```

* **Coverage**: Audited for all 32 collections including `products`, `customers`, `reservations`, `orders`, `suppliers`, `invoices`, `showroom_settings`, `audit_logs`, and `analytics`.

---

## 5. Pre-Launch Demo Cleanup

Before opening the platform to real customers:

1. Access the Admin Control Center -> System / Maintenance.
2. Execute `ProductionCleanupService.purgeAllDemoData()` to remove:
   * Demo products (`isDemo: true`)
   * Test customer profiles (`01000000000`)
   * Fake reservations and inquiries
   * Development logs and sample notifications
3. Real customer reservations, real orders, and showroom settings will remain untouched.

---

## 6. Backup & Recovery Protocol

* **Automated Export**: Admin Panel -> System Settings -> Export Snapshot (`BackupRestoreService.exportDatabaseBackup()`).
* **Restore Snapshot**: Upload valid JSON backup file via `BackupRestoreService.importDatabaseBackup(payload)`.

---

## 7. Production Build & Execution

```bash
# Compile and build production assets
npm run build

# Start production server
npm run start
```

* Express backend serves compiled assets from `dist/` and handles API requests on port 3000.
