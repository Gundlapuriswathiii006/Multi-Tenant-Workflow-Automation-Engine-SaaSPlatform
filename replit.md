# FlowForge

A multi-tenant SaaS workflow automation engine. Teams register organizations, build visual workflows, trigger and monitor executions, and manage users — all from a single platform.

## Run & Operate

- API server starts automatically via the `artifacts/api-server: API Server` workflow (Spring Boot on Maven)
- Web frontend starts via the `artifacts/web: web` workflow (Vite + React)
- `mvn -f artifacts/api-server/pom.xml compile` — compile the Spring Boot backend
- Required env: `DATABASE_URL` / `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` — Postgres connection; `SESSION_SECRET` — JWT signing secret

## Stack

- **Backend**: Java 19, Spring Boot 3.2.5, Spring Security (JWT + RBAC), Spring Data JPA, Hibernate, PostgreSQL, Lombok, jjwt 0.12.6
- **Frontend**: React 18, Vite, TypeScript, TanStack Query, Wouter (routing), Recharts, Tailwind CSS
- **DB**: PostgreSQL via JPA `ddl-auto=update` (auto-creates tables on startup)
- **Auth**: JWT stored in `localStorage` as `flowforge_token`; bearer token auto-attached by `lib/api-client-react/src/custom-fetch.ts`

## Where things live

- `artifacts/api-server/src/main/java/com/flowforge/` — all Java source
  - `entity/` — JPA entities (Tenant, User, Workflow, Execution)
  - `repository/` — Spring Data repositories
  - `security/` — JwtUtil, JwtAuthFilter, UserPrincipal, SecurityConfig
  - `service/` — AuthService, TenantService, UserService, WorkflowService, ExecutionService, DashboardService
  - `controller/` — REST controllers (Auth, Tenant, User, Workflow, Execution, Dashboard, Health)
  - `dto/` — request/response DTOs per domain
  - `exception/` — GlobalExceptionHandler
- `artifacts/web/src/` — React frontend
  - `pages/` — Login, Register, Dashboard, Workflows, WorkflowBuilder, Executions, Users, Settings
  - `hooks/use-auth.tsx` — AuthProvider + useAuth
  - `components/` — Layout, ProtectedRoute, shared UI
- `lib/api-client-react/` — generated API hooks + custom fetch (auto-attaches JWT from localStorage)
- `artifacts/api-server/src/main/resources/application.properties` — Spring Boot config

## Architecture decisions

- Spring Boot serves all API routes under `/api` context path (matches proxy routing in artifact.toml)
- JWT tokens carry `sub` (userId), `tenantId`, and `role` claims — no DB lookup on each request
- Workflow nodes/edges stored as JSON text columns in Postgres, serialized/deserialized via ObjectMapper
- Execution engine uses `@Async` to run workflow steps in background after creating a "running" record
- JPA `ddl-auto=update` auto-manages schema in dev; tables are created on first startup
- CORS is wide-open in dev (`allowedOriginPatterns: *`) — tighten for production

## Product

- **Multi-tenant**: Each organization registers its own workspace; users are isolated per tenant
- **Auth & RBAC**: JWT-based login/register; roles are `ORG_ADMIN`, `USER`, `SUPER_ADMIN`
- **Workflow Builder**: Visual drag-and-drop editor with nodes and edges persisted to DB
- **Execution Engine**: Manual trigger → async execution → status tracked (running/success/failure) with logs
- **Dashboard**: Stats (total workflows, active, executions, success rate), 14-day trend chart, recent activity feed
- **User Management**: Org admins can invite, update roles, deactivate, and remove team members
- **Settings**: Org admins can update tenant name and plan

## User preferences

- Spring Boot (Java) backend only — no Node.js backend
- React frontend

## Gotchas

- The workflow run command executes from the `artifacts/api-server/` directory, so the pom.xml path in artifact.toml must be `pom.xml` (not `artifacts/api-server/pom.xml`)
- `QueryClientProvider` must wrap `AuthProvider` in App.tsx because the auth hook uses React Query internally
- JWT secret must be at least 32 bytes for HS256; `JwtUtil` auto-pads shorter secrets

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- API context path: `/api` (set in `application.properties` as `server.servlet.context-path=/api`)
