# Blueprint: Config-Driven Full-Stack Assembly

## Non-negotiables

* Single source of truth: strongly typed config (YAML/JSON) with JSON-Schema/Zod.
* Deterministic compiler: parse → validate → normalize → plan → generate → verify.
* Database-agnostic adapters behind capability interfaces.
* Intermediate Representation (IR): graph of Entities, Capabilities, Adapters, Workflows, Endpoints, Policies.
* Idempotent codegen for DB, API, client SDK, workflows, infra.
* Strict versioning: config schema semver, migration engine, reproducible builds.

## System Pipeline

1. Parse config → AST.
2. Validate types/refs/constraints.
3. Normalize to IR (canonical IDs, defaults, adapter binding).
4. Plan execution graph (dependency resolution, topo sort).
5. Generate artifacts (SQL, TS, OpenAPI/GraphQL, Temporal/n8n workflows, SDK).
6. Verify (typecheck, contract tests, migration diff, static analysis).
7. Package and deploy (monolith or microservices).
8. Observe (contracts, metrics, traces mapped to IR nodes).

```mermaid
graph TD
  CFG[Config (YAML/JSON)] --> PARSE
  PARSE --> VALIDATE
  VALIDATE --> IR[IR Graph]
  IR --> PLAN[Planner]
  PLAN --> GEN[Generators]
  GEN --> {DB|API|SDK|WF|Infra|Docs}
  {DB|API|SDK|WF|Infra|Docs} --> VERIFY
  VERIFY --> PKG[Package/Deploy]
```

## Core Abstractions

### Config DSL (illustrative)

```yaml
version: 1
app: project_x
adapters:
  db: { kind: postgres|mysql|mongo|dynamo, conn: ${ENV.DB_URL} }
  auth: { kind: supabase|auth0|local }
entities:
  User:
    fields: { id: uuid, email: string, passwordHash: string }
    policies: { read: "owner", write: "owner|admin" }
  Project:
    fields: { id: uuid, name: string, ownerId: ref(User.id) }
capabilities:
  auth: { adapter: auth, exposes: [register, login, verify] }
  projectCrud: { adapter: db, entity: Project, exposes: [list, get, create, update, delete] }
workflows:
  onUserRegister:
    steps:
      - auth.register
      - projectCrud.create: { input: { name: "Welcome", ownerId: $.auth.userId } }
api:
  rest:
    routes:
      - GET /projects -> projectCrud.list
      - POST /auth/login -> auth.login
client:
  bindings:
    reactQuery: true
    endpoints: ["projects", "auth"]
```

### IR (essential TS)

```ts
type Id = string;

type Entity = { id:Id; name:string; fields:Record<string,string>; policies?:Record<string,string> };
type Adapter = { id:Id; kind:string; config:Record<string,unknown> };
type Capability = { id:Id; name:string; adapter:Id; contract:Record<string,unknown> };
type Endpoint = { id:Id; method:'GET'|'POST'|'PATCH'|'DELETE'; path:string; target:Id };
type Workflow = { id:Id; name:string; steps:Array<{ref:Id; params?:Record<string,unknown>}> };

type IR = { entities:Entity[]; adapters:Adapter[]; capabilities:Capability[]; endpoints:Endpoint[]; workflows:Workflow[] };
```

### Capability Contracts

```ts
export interface Repo<T, Q=unknown> {
  list(query?: Q): Promise<T[]>;
  get(id: string): Promise<T|null>;
  create(input: Partial<T>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
export interface Auth {
  register(email:string, password:string): Promise<{ userId:string }>;
  login(email:string, password:string): Promise<{ token:string, userId:string }>;
  verify(token:string): Promise<{ userId:string }>;
}
```

Adapters implement these interfaces for Postgres/MySQL/Mongo/Dynamo/Auth0/Supabase/etc.

## Code Generation Targets

* DB: SQL DDL + migrations (Postgres/MySQL) or schema/init for NoSQL; migration diffing engine.
* API: NestJS modules/controllers or Next.js Route Handlers; tRPC/GraphQL resolvers; OpenAPI spec.
* SDK: Type-safe TS client + React hooks (fetch/tRPC/GraphQL clients).
* Workflows: Temporal workflow/activities (TS) or n8n JSON graph; CRON/queues for schedules.
* Infra: optional Terraform/CDK stubs per adapter.
* Docs: Endpoint docs from OpenAPI/GraphQL SDL; capability index.

## Algorithms

* Graph planning: topological sort over IR deps (entities → capabilities → endpoints → workflows).
* Constraint solving: policy and adapter compatibility (e.g., entity uses features unsupported by adapter).
* Schema merge/diff: generate additive migrations; 3-way diff to avoid drift.
* Type inference: propagate entity field types into API/SDK signatures.
* Policy enforcement: compile to SQL RLS, middleware guards, or resolver checks.
* Validation: Zod/JSON-Schema for payloads; quickcheck/property tests for contracts.
* Deterministic ID & hashing: stable artifact naming and reproducible builds.
* Workflow verification: static reachability, dead-step detection, SLA budget estimation.

## Execution Placement

* Interaction-critical compute: client (Next.js) and edge where needed.
* Data access + policy enforcement: server routes.
* Heavy/async jobs, layout/AI: worker pool or Temporal activities.
* Storage: pluggable via adapter; blobs to S3-compatible.

## Tooling Leverage (as building blocks, not lock-in)

* Validation/types: Zod, TypeBox, JSON-Schema draft 2020-12.
* ORM/DB backends: Drizzle ORM, Prisma, Mongoose, DynamoDB SDK.
* API layers: NestJS, Next.js Route Handlers, tRPC, GraphQL Yoga.
* Workflow: Temporal (code-first) or n8n (node graph).
* Client SDK: OpenAPI generator or tRPC client; React Query for hooks.
* Visual editor: React Flow to render/edit IR; exports canonical config.

## Security Model

* Multi-tenant boundaries at policy layer; compile to RLS or per-request guards.
* Secrets sourced from environment/secret manager; config contains references only.
* Generated code ships with auth middleware; capability contracts annotated with required scopes.

## Testing Strategy

* Contract tests per capability (generated).
* Golden test vectors for endpoints and workflows.
* Migration round-trip tests: apply → rollback → reapply.
* Snapshot tests for generated artifacts to catch drift.
* Load tests for hot endpoints; SLOs attached to IR nodes.

## MVP Cut

* Entities + CRUD capability with Postgres and Mongo adapters.
* Auth capability with one external provider and one local provider.
* REST endpoints + generated TS client + React hooks.
* Temporal-less workflows (sequential in-process) for first iteration.
* Visual editor that validates and writes the config.
* Migration diff + reproducible build hash.

## Risk/Cost Control

* Avoid runtime reflection; prefer generated, tree-shakable code.
* Keep adapters thin; use provider SDKs directly.
* Start monolith; split to services only when SLOs/ownership require.
* Deterministic builds to enable binary cache and fast CI.

## Agentic AI Fit

* Agent reads config/IR, proposes edits, runs compiler, executes contract tests, iterates.
* Safe sandbox: ephemeral env per proposal; promotion only after passing tests and policy checks.
* AI nodes as capabilities (embedding, classification, layout) with clear contracts.

## Answer to “AutoCAD for software”

* The IR + visual editor is the parametric model.
* Constraints/policies are the dimension rules.
* Generators are the CAM toolpath.
* Deterministic builds are the fabrication line.
* Outcome: precise, repeatable assemblies from a single spec, with adapter-level freedom for any stack.
