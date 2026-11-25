# Legacy Banking App — Modernization Plan

## Overview

Modernize a Java 8 Swing desktop banking application into a web application using **React (MUI)** for the frontend and **Spring Boot (Java 21)** for the backend. All new code lives under a `modern/` folder. The existing legacy source code and `legacybank.db` are strictly read-only. The modern app connects to the **same SQLite database file** (`legacybank.db`) — no data migration required.

### Scope

| Component | Approach |
|-----------|----------|
| Database  | Retain SQLite (`legacybank.db`); Spring Boot reads it via JPA + SQLite dialect |
| Backend   | Spring Boot 3 (Java 21) — REST API, Spring Security + JWT, Spring Data JPA |
| Frontend  | React 18 + Vite + Material UI (MUI) — SPA with React Router |
| DevOps    | Docker Compose (local dev), GitHub Actions CI, updated README |

### Non-Goals

- Do not modify any file under `src/`, `database/`, `pom.xml`, `legacybank.db`, `run.bat`, or `run.command`.
- No PostgreSQL migration (optional, deferred).
- No production deployment.

### GitHub Integration

- All work tracked as GitHub Issues in the repository configured as `origin`.
- **3 Epics** (one per component): `Database`, `Backend`, `Frontend`, `DevOps`.
- Each Story is linked only to its component Epic.
- Stories that span two components are split into two separate Stories.

---

## Decisions Recorded

| Question | Decision |
|----------|----------|
| Database | Retain SQLite — connect Spring Boot to existing `legacybank.db` |
| Auth     | JWT-based stateless auth via Spring Security |
| UI Library | Material UI (MUI) |
| DevOps   | Include: Docker Compose + GitHub Actions CI + README |

---

## Architecture

```
modern/
├── backend/          ← Spring Boot 3 (Java 21) Maven project
│   └── src/
│       ├── entity/   ← JPA entities (Employee, Customer, Account, Transaction)
│       ├── repository/ ← Spring Data JPA repositories
│       ├── service/  ← Business logic (preserved from legacy)
│       ├── controller/ ← REST controllers
│       ├── security/ ← JWT filter, UserDetailsService
│       └── dto/      ← Request/Response DTOs
└── frontend/         ← React 18 + Vite + MUI
    └── src/
        ├── pages/    ← Login, Dashboard, CustomerSearch, AccountDetails,
        │               Deposit, Withdrawal, Transfer, TransactionHistory
        ├── components/ ← Shared UI (Navbar, ProtectedRoute, etc.)
        ├── api/      ← Axios client + API call functions
        └── context/  ← AuthContext (JWT token storage)
```

Both the legacy JAR and the modern app read/write the same `legacybank.db` file (not concurrently during the demo).

---

## GitHub Epics and Stories

### Epic 1 — Database

**Epic title:** `Database`
**Goal:** Configure Spring Boot JPA to connect to the existing SQLite database with 100% schema and data compatibility.

---

#### Story DB-1: JPA Entity Mapping

**Intent:** Define JPA entities for all 5 tables so the modern backend can read and write the existing SQLite schema without altering the database.

**Acceptance Criteria:**
- `Employee`, `Customer`, `Account`, `Transaction`, and `ReferenceSequence` JPA entities exist.
- Entity field names and types match the SQLite schema exactly (case-insensitive column mapping configured).
- `Account.balance` and `Transaction.amount` use `BigDecimal`.
- `Account` has `@ManyToOne` to `Customer`; `Transaction` has `@ManyToOne` to `Account` via `ACCOUNT_NUMBER`.
- All check-constraint-backed enums (`AccountType`, `AccountStatus`, `TransactionType`, `EmployeeStatus`) are modeled as Java enums stored as `STRING`.
- Application starts cleanly with `spring.jpa.hibernate.ddl-auto=validate` (no schema changes allowed).

**Todo:**
1. Add `org.xerial:sqlite-jdbc` and `com.github.gwenn:sqlite-dialect` to `modern/backend/pom.xml`.
2. Configure `application.properties`: datasource URL pointing to `../../legacybank.db`, dialect, `ddl-auto=validate`.
3. Create `Employee.java` entity.
4. Create `Customer.java` entity.
5. Create `Account.java` entity with `@ManyToOne Customer`.
6. Create `Transaction.java` entity with `@ManyToOne Account` (join on `ACCOUNT_NUMBER`).
7. Create `ReferenceSequence.java` entity (single auto-increment PK, no other columns).
8. Verify startup — application starts with no schema errors.

**Relevant Context:**
- Schema source: [`database/sqlite-schema.sql`](database/sqlite-schema.sql)
- Money precision: [`BankUtil.getMoney()`](src/main/java/com/legacybank/BankUtil.java) rounds to 2 decimals (HALF_UP) due to SQLite float storage.
- Reference sequence: [`BankUtil.nextReference()`](src/main/java/com/legacybank/BankUtil.java) — uses `last_insert_rowid()`; replicate with a custom repository method.

**Status:** [ ] pending — [#5](https://github.com/ceozenti/ibmbobcheck/issues/5)

---

#### Story DB-2: Reference Number Generation (JPA-compatible)

**Intent:** Replicate the legacy `nextReference()` logic using JPA so the modern backend can generate unique reference numbers (`DEP/WDR/TRF` + 10-digit sequence) using the same `REFERENCE_SEQUENCE` table.

**Acceptance Criteria:**
- A `ReferenceSequenceRepository` with a custom method inserts a row into `REFERENCE_SEQUENCE` and returns the generated ID.
- A `ReferenceService.next(prefix)` method formats the number as `PREFIX0000000001`.
- The same `REFERENCE_SEQUENCE` table is used (not a separate sequence), preserving cross-app compatibility.
- Concurrency: the insert is performed within the calling `@Transactional` service method.

**Todo:**
1. Create `ReferenceSequenceRepository` with a native-query insert and ID retrieval.
2. Create `ReferenceService.next(String prefix)`.
3. Unit-test with two concurrent calls to verify uniqueness.

**Relevant Context:**
- Legacy implementation: [`BankUtil.nextReference()`](src/main/java/com/legacybank/BankUtil.java)
- Format: `prefix + String.format("%010d", id)`

**Status:** [ ] pending — [#6](https://github.com/ceozenti/ibmbobcheck/issues/6)

---

### Epic 2 — Backend

**Epic title:** `Backend`
**Goal:** Implement a Spring Boot 3 REST API that exposes all banking operations, enforces all business rules, and secures endpoints with JWT.

---

#### Story BE-1: Spring Boot Project Scaffold

**Intent:** Bootstrap the `modern/backend` Maven project with correct dependencies, folder structure, and basic health endpoint.

**Acceptance Criteria:**
- `modern/backend/pom.xml` includes: Spring Boot 3 starter web, starter data JPA, starter security, starter validation, `jjwt` (io.jsonwebtoken), SQLite JDBC + dialect, Lombok (optional).
- `BankingModernApplication.java` starts without errors.
- `GET /api/health` returns `{"status":"UP"}`.
- CORS is configured to allow `http://localhost:5173` (Vite dev server).

**Todo:**
1. Create `modern/backend/pom.xml` with parent `spring-boot-starter-parent:3.x`.
2. Add all required dependencies.
3. Create `BankingModernApplication.java`.
4. Create `HealthController.java` with `GET /api/health`.
5. Add `application.properties` with server port `8080` and SQLite datasource.
6. Configure `CorsConfig.java`.
7. Verify startup and health endpoint.

**Status:** [ ] pending — [#7](https://github.com/ceozenti/ibmbobcheck/issues/7)

---

#### Story BE-2: JWT Authentication

**Intent:** Implement employee login via `POST /api/auth/login` returning a signed JWT, and protect all other endpoints with a JWT filter — preserving the legacy plain-text password check against the `EMPLOYEES` table.

**Acceptance Criteria:**
- `POST /api/auth/login` with `{"username":"admin","password":"admin123"}` returns `{"token":"<jwt>","employeeName":"..."}`.
- Invalid credentials return HTTP 401.
- Inactive employee (`STATUS != 'ACTIVE'`) is rejected.
- All `/api/**` endpoints except `/api/auth/**` and `/api/health` require a valid `Authorization: Bearer <token>` header.
- JWT includes `employeeId`, `username`, and `employeeName` claims; expiry configurable in `application.properties`.
- Passwords are compared as plain text to match the legacy schema (no bcrypt migration).

**Todo:**
1. Create `EmployeeRepository` with `findByUsernameAndPasswordAndStatus()`.
2. Create `JwtService` (sign, validate, extract claims using `jjwt`).
3. Create `JwtAuthFilter` (`OncePerRequestFilter`) — parse `Authorization` header, validate token, set `SecurityContext`.
4. Create `AuthController` with `POST /api/auth/login`.
5. Create `SecurityConfig` — permit `/api/auth/**` and `/api/health`; require auth on all others.
6. Add `jwt.secret` and `jwt.expiry-hours` to `application.properties`.
7. Integration-test: valid login → token; bad password → 401; expired token → 401.

**Relevant Context:**
- Legacy login SQL: [`LoginFrame.doLogin()`](src/main/java/com/legacybank/LoginFrame.java)
- Legacy session: [`AppSession.java`](src/main/java/com/legacybank/AppSession.java) — JWT replaces this static global state.
- Employee table: `EMPLOYEES (EMPLOYEE_ID, USERNAME, PASSWORD, EMPLOYEE_NAME, STATUS)`.

**Status:** [ ] pending — [#8](https://github.com/ceozenti/ibmbobcheck/issues/8)

---

#### Story BE-3: Customer API

**Intent:** Expose customer search and account listing endpoints to replace `CustomerSearchFrame` logic.

**Acceptance Criteria:**
- `GET /api/customers/{customerId}` returns customer details + their accounts list.
- `GET /api/customers?accountNumber={acct}` returns customer details + their accounts list (lookup via account number).
- Returns HTTP 404 if not found.
- Response includes: `customerId`, `customerName`, `email`, `phone`, `address`, `accounts[]` (each with `accountNumber`, `accountType`, `status`, `balance`).

**Todo:**
1. Create `CustomerRepository` with `findByAccountNumber()` (join query).
2. Create `AccountRepository` with `findByCustomerCustomerId()`.
3. Create `CustomerService` with `findById()` and `findByAccountNumber()`.
4. Create `CustomerController` with the two endpoints.
5. Create `CustomerResponse` and `AccountSummaryResponse` DTOs.
6. Test with seed data (customer 1001, account 1001000001).

**Relevant Context:**
- Legacy SQL: [`CustomerSearchFrame.doSearch()`](src/main/java/com/legacybank/CustomerSearchFrame.java)

**Status:** [ ] pending — [#9](https://github.com/ceozenti/ibmbobcheck/issues/9)

---

#### Story BE-4: Account Details API

**Intent:** Expose a single account lookup endpoint to replace `AccountDetailsFrame` logic.

**Acceptance Criteria:**
- `GET /api/accounts/{accountNumber}` returns full account details including customer info.
- Returns HTTP 404 if account not found.
- Response includes: `accountNumber`, `accountType`, `status`, `balance`, `createdDate`, nested `customer` (`customerId`, `customerName`, `email`, `phone`).

**Todo:**
1. Add `findByAccountNumber()` to `AccountRepository`.
2. Create `AccountService.findByAccountNumber()`.
3. Create `AccountController` with `GET /api/accounts/{accountNumber}`.
4. Create `AccountDetailResponse` DTO.
5. Test: existing account → 200; unknown account → 404.

**Relevant Context:**
- Legacy SQL: [`AccountDetailsFrame.loadAccount()`](src/main/java/com/legacybank/AccountDetailsFrame.java)

**Status:** [ ] pending — [#10](https://github.com/ceozenti/ibmbobcheck/issues/10)

---

#### Story BE-5: Deposit API

**Intent:** Implement `POST /api/transactions/deposit` with the same atomic business rules as the legacy `DepositFrame`.

**Acceptance Criteria:**
- Request: `{"accountNumber":"...","amount":500.00,"description":"..."}`.
- Validates: amount > 0, ≤ 10,000,000, ≤ 2 decimal places; account exists; account is ACTIVE.
- Atomically: updates balance, inserts `DEPOSIT` transaction row, generates `DEP`-prefixed reference.
- Response: `{"reference":"DEP0000000001","newBalance":1500.00}`.
- Invalid input → HTTP 400 with field errors; account not found → 404; inactive → 422.
- Annotated with `@Transactional`.

**Todo:**
1. Create `TransactionService` with `deposit()` method.
2. Port business-rule validation from legacy `DepositFrame.doDeposit()`.
3. Use `ReferenceService.next("DEP")` for reference number.
4. Create `DepositRequest` DTO with Bean Validation annotations.
5. Create `TransactionController` with `POST /api/transactions/deposit`.
6. Create `TransactionResponse` DTO.
7. Test: valid deposit → balance updated, transaction row inserted; inactive account → 422.

**Relevant Context:**
- Legacy logic: [`DepositFrame.doDeposit()`](src/main/java/com/legacybank/DepositFrame.java)
- Validation rules: [`BankUtil.parseAmount()`](src/main/java/com/legacybank/BankUtil.java)

**Status:** [ ] pending — [#11](https://github.com/ceozenti/ibmbobcheck/issues/11)

---

#### Story BE-6: Withdrawal API

**Intent:** Implement `POST /api/transactions/withdrawal` with overdraft prevention, mirroring `WithdrawalFrame`.

**Acceptance Criteria:**
- Same structure as Deposit API.
- Additional rule: `balance >= amount` (no overdraft); violation → HTTP 422 with message "Insufficient funds".
- Atomically: updates balance (balance − amount), inserts `WITHDRAWAL` transaction, generates `WDR` reference.
- Response: `{"reference":"WDR...","newBalance":...}`.
- Annotated with `@Transactional`.

**Todo:**
1. Add `withdrawal()` method to `TransactionService`.
2. Port overdraft check from [`WithdrawalFrame.doWithdraw()`](src/main/java/com/legacybank/WithdrawalFrame.java).
3. Add `POST /api/transactions/withdrawal` to `TransactionController`.
4. Test: insufficient funds → 422; valid withdrawal → 200.

**Status:** [ ] pending — [#12](https://github.com/ceozenti/ibmbobcheck/issues/12)

---

#### Story BE-7: Fund Transfer API

**Intent:** Implement `POST /api/transactions/transfer` as a single atomic transaction updating two accounts — mirroring `TransferFrame`.

**Acceptance Criteria:**
- Request: `{"sourceAccount":"...","destinationAccount":"...","amount":...,"description":"..."}`.
- Validates: source ≠ destination; both accounts exist and are ACTIVE; source balance ≥ amount.
- Atomically: deducts source, credits destination, inserts `TRANSFER_DEBIT` + `TRANSFER_CREDIT` rows sharing one `TRF` reference number.
- Response: `{"reference":"TRF...","sourceNewBalance":...,"destinationNewBalance":...}`.
- If any step fails, entire transaction rolls back (both legs).
- Annotated with `@Transactional`.

**Todo:**
1. Add `transfer()` method to `TransactionService`.
2. Port both-lock logic from [`TransferFrame.doTransfer()`](src/main/java/com/legacybank/TransferFrame.java).
3. Add `POST /api/transactions/transfer` to `TransactionController`.
4. Create `TransferRequest` and `TransferResponse` DTOs.
5. Test: partial failure (destination frozen) → both legs rolled back; valid transfer → both balances updated.

**Status:** [ ] pending — [#13](https://github.com/ceozenti/ibmbobcheck/issues/13)

---

#### Story BE-8: Transaction History API

**Intent:** Expose `GET /api/transactions/history/{accountNumber}` with optional type filter — mirroring `TransactionHistoryFrame`.

**Acceptance Criteria:**
- `GET /api/transactions/history/{accountNumber}?type=DEPOSIT` returns filtered list; omit `type` for all.
- Sorted by `transactionDate` DESC, `transactionId` DESC.
- Returns HTTP 404 if the account does not exist.
- Each item includes: `transactionId`, `transactionType`, `amount`, `transactionDate`, `referenceNumber`, `description`.

**Todo:**
1. Add `findByAccountNumberOrderByTransactionDateDesc()` to `TransactionRepository` with optional type filter.
2. Add `getHistory()` to `TransactionService`.
3. Add `GET /api/transactions/history/{accountNumber}` to `TransactionController`.
4. Create `TransactionHistoryItemResponse` DTO.
5. Test: returns all; filters by type; sorted newest-first.

**Relevant Context:**
- Legacy SQL: [`TransactionHistoryFrame.doSearch()`](src/main/java/com/legacybank/TransactionHistoryFrame.java)

**Status:** [ ] pending — [#14](https://github.com/ceozenti/ibmbobcheck/issues/14)

---

#### Story BE-9: Global Error Handling

**Intent:** Return consistent JSON error responses for all failure scenarios so the React frontend can display user-friendly messages.

**Acceptance Criteria:**
- All `@RestController` exceptions return JSON: `{"error":"message","status":400}`.
- `MethodArgumentNotValidException` (Bean Validation) → 400 with field-level errors.
- Custom `BankingRuleException` (account not active, insufficient funds) → 422.
- `EntityNotFoundException` → 404.
- Unhandled exceptions → 500 (no stack trace in body).

**Todo:**
1. Create `GlobalExceptionHandler` (`@RestControllerAdvice`).
2. Create `BankingRuleException` (replaces `BankingException`).
3. Create `ErrorResponse` DTO.
4. Test each error path.

**Status:** [ ] pending — [#15](https://github.com/ceozenti/ibmbobcheck/issues/15)

---

### Epic 3 — Frontend

**Epic title:** `Frontend`
**Goal:** Build a clean, modern React SPA using Material UI that replicates all 8 screens of the legacy Swing app.

---

#### Story FE-1: React Project Scaffold and Routing

**Intent:** Bootstrap `modern/frontend` with Vite + React 18 + MUI and configure routing for all pages.

**Acceptance Criteria:**
- `modern/frontend` created with `npm create vite@latest -- --template react`.
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `react-router-dom`, `axios` installed.
- React Router configured with routes: `/login`, `/dashboard`, `/customers`, `/accounts/:accountNumber`, `/deposit`, `/withdrawal`, `/transfer`, `/history`.
- `ProtectedRoute` component redirects unauthenticated users to `/login`.
- `AuthContext` stores JWT token and employee info; persisted to `localStorage`.
- MUI `ThemeProvider` with a custom banking theme (primary: deep blue, secondary: teal).

**Todo:**
1. Scaffold Vite project under `modern/frontend/`.
2. Install dependencies.
3. Create `AuthContext.jsx` with `login()`, `logout()`, and `token` state.
4. Create `api/axiosClient.js` — Axios instance with `Authorization: Bearer <token>` interceptor.
5. Create `ProtectedRoute.jsx`.
6. Configure `App.jsx` with React Router and all routes.
7. Create MUI theme in `theme.js`.
8. Verify dev server starts at `http://localhost:5173`.

**Status:** [ ] pending — [#16](https://github.com/ceozenti/ibmbobcheck/issues/16)

---

#### Story FE-2: Login Page

**Intent:** Build a clean login form that authenticates against `POST /api/auth/login` and stores the JWT.

**Acceptance Criteria:**
- Centered card layout with bank logo/name, username and password fields, login button.
- Shows inline error message on 401.
- Disables button and shows spinner during request.
- On success, navigates to `/dashboard`.
- Keyboard shortcut: Enter submits the form.

**Todo:**
1. Create `pages/LoginPage.jsx`.
2. Use MUI `Card`, `TextField`, `Button`, `CircularProgress`.
3. Call `api/auth.js` → `POST /api/auth/login`.
4. Store token via `AuthContext.login()`.
5. Handle 401 error state.
6. Test: correct credentials → navigates to dashboard; wrong credentials → error shown.

**Status:** [ ] pending — [#17](https://github.com/ceozenti/ibmbobcheck/issues/17)

---

#### Story FE-3: Dashboard (Main Menu)

**Intent:** Replace the legacy Swing `MainFrame` with a clean, modern dashboard showing quick-action cards and the logged-in employee's name.

**Acceptance Criteria:**
- Top navigation bar: bank name, logged-in employee name, Logout button.
- 6 quick-action cards in a responsive grid: Customer Search, Account Details, Cash Deposit, Cash Withdrawal, Fund Transfer, Transaction History.
- Each card has an icon, title, and short description; clicking navigates to the respective page.
- Logout clears `AuthContext` and redirects to `/login`.
- Dashboard is visually clean — consistent spacing, MUI elevation, branded colors.

**Todo:**
1. Create `components/Navbar.jsx` with employee name and logout.
2. Create `pages/DashboardPage.jsx` with `Grid` of `Card` components.
3. Use MUI icons (AccountBalance, Search, Payment, etc.).
4. Wire navigation links to React Router routes.
5. Test: all 6 cards navigate correctly; logout clears token.

**Status:** [ ] pending — [#18](https://github.com/ceozenti/ibmbobcheck/issues/18)

---

#### Story FE-4: Customer Search Page

**Intent:** Replicate `CustomerSearchFrame` — search by Customer ID or Account Number, display customer details and account list.

**Acceptance Criteria:**
- Dropdown to choose search type; text field for input; Search button.
- Shows customer info (ID, Name, Email, Phone, Address) in a details card.
- Shows accounts in a MUI `DataGrid` or `Table` (Account Number, Type, Status, Balance).
- Clicking a row navigates to `/accounts/:accountNumber`.
- Shows "No results" message if not found.

**Todo:**
1. Create `pages/CustomerSearchPage.jsx`.
2. Create `api/customers.js` → `GET /api/customers/{id}` and `GET /api/customers?accountNumber=`.
3. Use MUI `Select`, `TextField`, `Table`/`DataGrid`, `Chip` for status colours.
4. Handle loading and error states.

**Relevant Context:**
- Legacy screen: [`CustomerSearchFrame.java`](src/main/java/com/legacybank/CustomerSearchFrame.java)

**Status:** [ ] pending — [#19](https://github.com/ceozenti/ibmbobcheck/issues/19)

---

#### Story FE-5: Account Details Page

**Intent:** Replicate `AccountDetailsFrame` — look up an account by number and display full details with action buttons.

**Acceptance Criteria:**
- Account number input; Lookup button.
- Displays account info (number, type, status badge, balance) and customer info.
- Action buttons: Deposit, Withdraw, View History — each navigates to the respective page with the account number pre-filled.
- 404 shows "Account not found" alert.

**Todo:**
1. Create `pages/AccountDetailsPage.jsx`.
2. Create `api/accounts.js` → `GET /api/accounts/{accountNumber}`.
3. Use MUI `Chip` with colour coding for status (green=ACTIVE, orange=FROZEN, red=CLOSED).
4. Pre-fill account number if passed via React Router `state`.

**Status:** [ ] pending — [#20](https://github.com/ceozenti/ibmbobcheck/issues/20)

---

#### Story FE-6: Deposit and Withdrawal Pages

**Intent:** Build forms for cash deposit and withdrawal, displaying the updated balance and reference number on success. (Two pages, same structure — built together.)

**Acceptance Criteria:**
- Account number field (pre-fillable), amount field, optional description, submit button.
- Real-time amount validation (positive, ≤ 2 decimals, ≤ 10,000,000).
- Shows success panel with reference number and new balance after submission.
- Shows inline error for business rule violations (inactive account, insufficient funds).
- Deposit and Withdrawal pages share a common `TransactionForm` component.

**Todo:**
1. Create `components/TransactionForm.jsx` (shared).
2. Create `pages/DepositPage.jsx` and `pages/WithdrawalPage.jsx` using `TransactionForm`.
3. Create `api/transactions.js` → `POST /api/transactions/deposit` and `POST /api/transactions/withdrawal`.
4. Handle 400 (validation), 404 (not found), 422 (business rule) errors distinctly.
5. Test: valid deposit → shows new balance; overdraft → shows "Insufficient funds".

**Status:** [ ] pending — [#21](https://github.com/ceozenti/ibmbobcheck/issues/21)

---

#### Story FE-7: Fund Transfer Page

**Intent:** Replicate `TransferFrame` — transfer funds between two accounts with both new balances shown on success.

**Acceptance Criteria:**
- Source account, destination account, amount, description fields.
- Validates source ≠ destination on the client.
- On success, shows reference number, source new balance, and destination new balance.
- Handles all API error types (inactive account, insufficient funds, same account).

**Todo:**
1. Create `pages/TransferPage.jsx`.
2. Add `transfer()` to `api/transactions.js` → `POST /api/transactions/transfer`.
3. Client-side validation: source ≠ destination.
4. Display both balances in success summary card.

**Status:** [ ] pending — [#22](https://github.com/ceozenti/ibmbobcheck/issues/22)

---

#### Story FE-8: Transaction History Page

**Intent:** Replicate `TransactionHistoryFrame` — view transactions for an account with type filter.

**Acceptance Criteria:**
- Account number input (pre-fillable); transaction type filter dropdown (All, Deposit, Withdrawal, Transfer Debit, Transfer Credit).
- Results in a MUI `Table` sorted newest first: ID, Type (chip), Amount, Date, Reference, Description.
- Shows total count. Empty state: "No transactions found".
- Amount column formatted with commas and 2 decimals.

**Todo:**
1. Create `pages/TransactionHistoryPage.jsx`.
2. Add `getHistory()` to `api/transactions.js` → `GET /api/transactions/history/{accountNumber}`.
3. Format amounts and dates using `Intl` APIs.
4. Use MUI `Chip` with colour per transaction type.

**Status:** [ ] pending — [#23](https://github.com/ceozenti/ibmbobcheck/issues/23)

---

### Epic 4 — DevOps

**Epic title:** `DevOps`
**Goal:** Add local development tooling and CI so the modern app can be run and validated with minimal setup.

---

#### Story DO-1: Docker Compose for Local Development

**Intent:** Provide a single `docker-compose.yml` at the repo root that starts the Spring Boot backend and Vite frontend dev server together.

**Acceptance Criteria:**
- `docker-compose.yml` defines two services: `backend` (Spring Boot on port 8080) and `frontend` (Vite on port 5173).
- Backend service mounts `legacybank.db` from the repo root so the modern app shares the existing data.
- `docker compose up` starts both services; `http://localhost:5173` serves the React app.
- `Dockerfile` for the backend: multi-stage build (Maven compile → slim JRE runtime image).
- `Dockerfile` for the frontend: dev mode only (Vite serve, not production build).
- `.dockerignore` files added for each service.

**Todo:**
1. Create `modern/backend/Dockerfile` (multi-stage: `maven:3.9-eclipse-temurin-21` → `eclipse-temurin:21-jre`).
2. Create `modern/frontend/Dockerfile` (Node 20 image, `npm install && npm run dev`).
3. Create `docker-compose.yml` at repo root.
4. Mount `./legacybank.db` as a volume into the backend container.
5. Add `.dockerignore` files.
6. Test: `docker compose up` → both services healthy; login works at `localhost:5173`.

**Status:** [ ] pending — [#24](https://github.com/ceozenti/ibmbobcheck/issues/24)

---

#### Story DO-2: GitHub Actions CI Workflow

**Intent:** Add a CI workflow that builds and tests the backend and frontend on every push and pull request to `main`.

**Acceptance Criteria:**
- `.github/workflows/ci.yml` triggers on `push` and `pull_request` to `main`.
- Backend job: `mvn --no-transfer-progress verify` under `modern/backend/`.
- Frontend job: `npm ci && npm run build` under `modern/frontend/`.
- Both jobs run on `ubuntu-latest`.
- CI does NOT touch the legacy app build.
- Workflow status badge added to `modern/README.md`.

**Todo:**
1. Create `.github/workflows/ci.yml` with two jobs: `backend` and `frontend`.
2. Backend job: checkout → Java 21 setup → `mvn verify` in `modern/backend`.
3. Frontend job: checkout → Node 20 setup → `npm ci` → `npm run build` in `modern/frontend`.
4. Add CI badge to `modern/README.md`.

**Status:** [ ] pending — [#25](https://github.com/ceozenti/ibmbobcheck/issues/25)

---

#### Story DO-3: Modern App README

**Intent:** Write `modern/README.md` explaining how to run the full modern stack (with and without Docker).

**Acceptance Criteria:**
- Prerequisites section: JDK 21, Maven 3.9, Node 20, Docker (optional).
- Quick start: two options — Docker Compose (single command) and manual (backend `mvn spring-boot:run`, frontend `npm run dev`).
- Login credentials noted (`admin` / `admin123`).
- Architecture diagram (text or Mermaid embedded in Markdown).
- Link back to root `README.md` for legacy app instructions.
- CI badge shown.

**Todo:**
1. Create `modern/README.md` with all required sections.
2. Add architecture overview table.
3. Add Docker Compose quick-start.
4. Add manual run instructions.

**Status:** [ ] pending — [#26](https://github.com/ceozenti/ibmbobcheck/issues/26)

---

## Implementation Sequence

The recommended order below ensures each story has its dependencies in place before work starts:

```
Phase 1 — Foundation
  BE-1  Spring Boot scaffold + health endpoint
  DB-1  JPA entity mapping (validate schema)
  DB-2  Reference number generation
  BE-9  Global error handling

Phase 2 — Auth
  BE-2  JWT authentication

Phase 3 — Core APIs
  BE-3  Customer API
  BE-4  Account Details API
  BE-8  Transaction History API

Phase 4 — Transaction APIs
  BE-5  Deposit API
  BE-6  Withdrawal API
  BE-7  Fund Transfer API

Phase 5 — Frontend Foundation
  FE-1  React scaffold + routing + auth context

Phase 6 — Frontend Pages
  FE-2  Login page
  FE-3  Dashboard
  FE-4  Customer Search page
  FE-5  Account Details page
  FE-6  Deposit + Withdrawal pages
  FE-7  Transfer page
  FE-8  Transaction History page

Phase 7 — DevOps
  DO-3  Modern README
  DO-1  Docker Compose
  DO-2  GitHub Actions CI
```

---

## GitHub Issues to Create

For each Epic and Story above, create:
1. One **Epic** issue per component (label: `epic`) — `Database`, `Backend`, `Frontend`, `DevOps`.
2. One **Story** issue per story (label: `story`) linked to its Epic via GitHub issue references.

| Story ID | GitHub Issue | Title | Epic |
|----------|-------------|-------|------|
| DB-1 | [#5](https://github.com/ceozenti/ibmbobcheck/issues/5) | JPA Entity Mapping | Database |
| DB-2 | [#6](https://github.com/ceozenti/ibmbobcheck/issues/6) | Reference Number Generation | Database |
| BE-1 | [#7](https://github.com/ceozenti/ibmbobcheck/issues/7) | Spring Boot Project Scaffold | Backend |
| BE-2 | [#8](https://github.com/ceozenti/ibmbobcheck/issues/8) | JWT Authentication | Backend |
| BE-3 | [#9](https://github.com/ceozenti/ibmbobcheck/issues/9) | Customer API | Backend |
| BE-4 | [#10](https://github.com/ceozenti/ibmbobcheck/issues/10) | Account Details API | Backend |
| BE-5 | [#11](https://github.com/ceozenti/ibmbobcheck/issues/11) | Deposit API | Backend |
| BE-6 | [#12](https://github.com/ceozenti/ibmbobcheck/issues/12) | Withdrawal API | Backend |
| BE-7 | [#13](https://github.com/ceozenti/ibmbobcheck/issues/13) | Fund Transfer API | Backend |
| BE-8 | [#14](https://github.com/ceozenti/ibmbobcheck/issues/14) | Transaction History API | Backend |
| BE-9 | [#15](https://github.com/ceozenti/ibmbobcheck/issues/15) | Global Error Handling | Backend |
| FE-1 | [#16](https://github.com/ceozenti/ibmbobcheck/issues/16) | React Project Scaffold and Routing | Frontend |
| FE-2 | [#17](https://github.com/ceozenti/ibmbobcheck/issues/17) | Login Page | Frontend |
| FE-3 | [#18](https://github.com/ceozenti/ibmbobcheck/issues/18) | Dashboard | Frontend |
| FE-4 | [#19](https://github.com/ceozenti/ibmbobcheck/issues/19) | Customer Search Page | Frontend |
| FE-5 | [#20](https://github.com/ceozenti/ibmbobcheck/issues/20) | Account Details Page | Frontend |
| FE-6 | [#21](https://github.com/ceozenti/ibmbobcheck/issues/21) | Deposit and Withdrawal Pages | Frontend |
| FE-7 | [#22](https://github.com/ceozenti/ibmbobcheck/issues/22) | Fund Transfer Page | Frontend |
| FE-8 | [#23](https://github.com/ceozenti/ibmbobcheck/issues/23) | Transaction History Page | Frontend |
| DO-1 | [#24](https://github.com/ceozenti/ibmbobcheck/issues/24) | Docker Compose for Local Development | DevOps |
| DO-2 | [#25](https://github.com/ceozenti/ibmbobcheck/issues/25) | GitHub Actions CI Workflow | DevOps |
| DO-3 | [#26](https://github.com/ceozenti/ibmbobcheck/issues/26) | Modern App README | DevOps |

---

## Guardrails

- Never modify `src/`, `database/`, `pom.xml`, `legacybank.db`, `run.bat`, `run.command`.
- All new code lives exclusively under `modern/`.
- 100% business rule preservation (amounts, account statuses, overdraft check, transfer atomicity, reference format).
- `spring.jpa.hibernate.ddl-auto=validate` — schema never modified by the modern app.
- Passwords remain plain-text in the database (demo only).
- Do not commit `target/`, `node_modules/`, `legacybank.db`, or `.env` files.
