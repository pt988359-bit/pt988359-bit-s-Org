# PRO-TECK Enterprise Architecture Documentation
*Phase 14.7 Architecture Hardening & Transaction Engine*

---

## 1. Architectural Layers & Structure

```
src/
├── core/
│   ├── config/          # Centralized configuration, business constants & magic numbers
│   ├── errors/          # Strongly typed domain exception classes
│   ├── events/          # Domain Events & EventBus publish/subscribe system
│   ├── repositories/    # Single Aggregate Repositories (Split Repositories)
│   ├── services/        # Pure domain business services, logger, metrics, cache & sequence service
│   ├── storage/         # StorageAdapter interface, LocalStorageAdapter & FirestoreAdapterStub
│   ├── transactions/    # UnitOfWork & Transaction Engine for atomic multi-repo staging
│   └── validators/      # Business domain validation logic independent of UI
├── domain/              # Aggregate root interfaces & business domain entities
├── components/          # Pure React presentation components (No storage or direct DOM calls)
├── context/             # Global React state providers delegating to Domain Services
├── engine/              # Interactive rules, AI governance & decision engines
└── utils/               # Storage Facades bridging legacy callers to Core Repositories
```

---

## 2. Dependency Rules & Boundaries

### Allowed Dependency Flows
- **UI (React Components)** $\rightarrow$ **React Context / Custom Hooks** $\rightarrow$ **Services** $\rightarrow$ **Repositories** $\rightarrow$ **Storage Adapter** $\rightarrow$ **Persistence (LocalStorage / Firestore)**

### Forbidden Violations (Enforced)
- ❌ **UI Components MUST NOT call `localStorage` directly** (`getItem`, `setItem`, `removeItem`).
- ❌ **Repositories MUST NOT reference React UI components or hooks.**
- ❌ **Services MUST NOT depend on DOM or browser UI primitives.**
- ❌ **Repositories MUST NOT access raw `localStorage` without using `StorageAdapter`.**

---

## 3. Single Aggregate Repositories (Split Repositories)

To respect the **Single Responsibility Principle**, large monolithic storage files have been decomposed into dedicated single-aggregate repositories:

1. `ExpenseRepository`: Manages expense items aggregate.
2. `CashLedgerRepository`: Manages cash inflow/outflow ledger entries.
3. `CostSheetRepository`: Manages product cost sheets and margin targets.
4. `SupplierRepository`: Manages supplier records & purchase statistics.
5. `PurchaseRepository`: Manages original appliance purchase history.
6. `FinancialAlertRepository`: Manages financial risk alerts.
7. `FinancialTimelineRepository`: Manages audit timeline events.
8. `ProcurementRepository`: Manages requested appliance procurement orders.
9. `SequenceRepository`: Manages atomic sequence counters.
10. `SettingsRepository`: Manages showroom & InstaPay business configuration.

---

## 4. Atomic Sequence Counter Flow

Record numbering no longer relies on `collection.length + 1`.

```
[Service Call] -> SequenceService.generateNextReference('EXP')
                       │
                       ▼
             SequenceRepository.incrementCounter('EXP')
                       │
                       ▼
             Increments stored lastValue atomically
                       │
                       ▼
             Returns "EXP-2026-000012"
```

*Note: Deleting or archiving records never affects atomic counters or causes duplicate sequence numbers.*

---

## 5. Transaction Engine & Unit of Work Pattern

Multi-repository operations execute within a transactional unit of work:

```typescript
const tx = UnitOfWork.beginTransaction();

tx.addOperation({
  description: 'Save Expense Record',
  execute: () => expenseRepo.save(newExpense),
  rollback: () => expenseRepo.remove(newExpense.id)
});

tx.addOperation({
  description: 'Save Cash Ledger Outflow',
  execute: () => cashRepo.save(cashEntry),
  rollback: () => cashRepo.remove(cashEntry.id)
});

tx.commit(); // If any operation throws, rollback() unwinds all staged changes.
```

---

## 6. Domain Event Flow & EventBus

Business actions publish typed domain events asynchronously:

```
[FinanceService] ──(Publishes ExpenseCreatedEvent)──► [EventBus]
                                                          │
                                         ┌────────────────┴───────────────┐
                                         ▼                                ▼
                             [LoggerService / Audit]          [Notification / WhatsApp]
```

### Registered Domain Events
- `ExpenseCreated`
- `ReservationApproved`
- `DepositVerified`
- `SaleCompleted`
- `WarrantyActivated`
- `NegotiationAccepted`

---

## 7. Future Firestore Migration Plan (Phase 15)

1. **StorageAdapter Swap**: Replace `LocalStorageAdapter` with `FirestoreAdapter` inside repository constructors.
2. **Zero Business Logic Code Changes**: `FinanceService`, `PricingService`, `ReservationService`, and UI components require zero code modifications because all data operations are strictly encapsulated behind the `StorageAdapter` interface and `BaseRepository<T>`.
3. **Firestore Native Transactions**: Map `UnitOfWork` directly to `db.runTransaction()`.
