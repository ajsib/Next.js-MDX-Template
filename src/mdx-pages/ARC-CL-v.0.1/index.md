# Project ARC Configuration Language (ARC-CL) — Draft Spec v0.1

## Goals

* Single declarative source of truth for data, behavior, and integration.
* Deterministic compilation to DB schema, APIs, workflows, and client bindings.
* Visual-first: nested graphs map 1:1 to configuration scopes.
* Database-agnostic via adapters; stack-agnostic via code generators.
* Turing complete through controlled control-flow and recursion.
* Reproducible builds, strict versioning, idempotent generators.

## Core Concepts

* **Scope**: a graph container (App, Subsystem, Service, Feature). Scopes nest.
* **Node**: typed unit inside a scope (Store, Entity, Capability, Endpoint, Workflow, Algorithm, View).
* **Port**: typed input/output on a node; contracts for edges.
* **Edge**: directed, typed connection between ports; request/response or stream.
* **Adapter**: implementation binding (e.g., Postgres, Mongo, S3, Auth0).
* **IR**: normalized intermediate graph compiled from YAML; single source for generators.

## Visual Model (Nested Graphs)

* Top scope **App** contains coarse nodes (DB | Node.js | Next.js).
* Drilling into **DB** reveals Stores, Entities, Policies.
* Drilling into **Node.js** reveals Capabilities, Workflows, Endpoints.
* Drilling into **Next.js** reveals Views, DataBindings, Actions.
* Edges between higher-level nodes summarize all contained edges; detail revealed by drilling.

## Language Surface (YAML)

### File Header

```yaml
arc: 1
name: "project-arc-demo"
version: "0.1.0"
```

### Parameters and Environments

```yaml
params:
  env: { type: enum, values: [dev, staging, prod], default: dev }
  db_url: { type: secret }
```

### Adapters

```yaml
adapters:
  store.main:
    kind: postgres | mysql | mongo | dynamo
    conn: ${db_url}
  auth.primary:
    kind: supabase | auth0 | local
    config: { domain: ${AUTH_DOMAIN}, clientId: ${AUTH_CLIENT_ID} }
```

### Scopes and Graph

```yaml
scopes:
  app:
    nodes:
      - ref: db.main
      - ref: service.api
      - ref: web.frontend
    edges:
      - from: service.api.http -> web.frontend.data
      - from: db.main.store -> service.api.repo
```

### Stores and Entities (Data-First)

```yaml
stores:
  db.main:
    adapter: store.main
    dialect: sql
    entities:
      User:
        fields:
          id: uuid@pk
          email: string@unique
          passwordHash: string
          createdAt: timestamp@default(now)
        policies:
          read: "self|admin"
          write: "self|admin"
      Project:
        fields:
          id: uuid@pk
          name: string
          ownerId: ref(User.id)@index
          createdAt: timestamp@default(now)
        relations:
          owner: { hasOne: User, fk: ownerId }
```

### ViewModels (Frontend Data Shape)

```yaml
views:
  ProjectCard:
    model:
      id: uuid
      name: string
      ownerEmail: string
    from:
      sql: |
        select p.id, p.name, u.email as "ownerEmail"
        from Project p join "User" u on u.id = p."ownerId"
```

### Capabilities (Reusable Backend Modules)

```yaml
capabilities:
  auth:
    adapter: auth.primary
    exposes: [register(email, password) -> { userId: uuid }, login(email, password) -> { token: string, userId: uuid }, verify(token) -> { userId: uuid }]
  projectCrud:
    adapter: store.main
    entity: Project
    exposes:
      - list(query?) -> Project[]
      - get(id: uuid) -> Project
      - create(input: Partial<Project>) -> Project
      - update(id: uuid, patch: Partial<Project>) -> Project
      - delete(id: uuid)
```

### Endpoints (API Surface)

```yaml
endpoints:
  rest:
    - GET /projects -> projectCrud.list
    - GET /projects/{id} -> projectCrud.get
    - POST /projects -> projectCrud.create
    - PATCH /projects/{id} -> projectCrud.update
    - DELETE /projects/{id} -> projectCrud.delete
  auth:
    - POST /auth/register -> auth.register
    - POST /auth/login -> auth.login
```

### Workflows (Control Flow Graph)

```yaml
workflows:
  onUserRegister:
    inputs: { email: string, password: string }
    steps:
      - call: auth.register
        with: { email: $.email, password: $.password }
        as: reg
      - call: projectCrud.create
        with: { input: { name: "Welcome", ownerId: $.reg.userId } }
        as: proj
    outputs: { projectId: $.proj.id }
  nightlyCleanup:
    schedule: "0 3 * * *"
    steps:
      - foreach: item in projectCrud.list({ stale: true })
        do:
          - call: projectCrud.delete
            with: { id: $.item.id }
```

### Frontend Bindings

```yaml
client:
  nextjs:
    bindings:
      hooks: react-query
      endpoints: ["/projects", "/auth"]
    pages:
      - path: "/projects"
        data: ProjectCard[]
        source: view.ProjectCard
```

### Algorithms as Nodes

```yaml
algorithms:
  layoutGraph:
    impl: elkjs
    input: { nodes: any[], edges: any[] }
    output: { nodes: any[], edges: any[] }
```

### Composition (Imports)

```yaml
imports:
  - ./packages/auth/auth.cap.yaml
  - ./packages/crud/crud.cap.yaml
  - ./apps/project-x/entities.yaml
```

## Type System

* **Primitives**: string, number, boolean, uuid, date, timestamp, bytes, json.
* **Collections**: list<T>, map\<K,V>, set<T>.
* **Records**: named fields with optional/required markers.
* **Enums/Discriminated Unions**:

  * `Status: enum[active, archived]`
  * `Payload = {type:'A', a:number} | {type:'B', b:string}`
* **Refs**: `ref(Entity.field)`; compile to FK or logical reference depending on adapter.
* **Derived Types**: `type View<ProjectCard> = pick<Project, 'id'|'name'> & { ownerEmail: string }`.
* **Generics** for capabilities: `Repo<T>`; specialized at compile time.
* **Validation**: Zod/JSON-Schema emitted for payloads and responses; enforced in runtime.

## Determinism and Evaluation Order

* **Build**: DAG over declarations → topologically sorted; cycles rejected except for allowed mutually recursive workflows.
* **Runtime**:

  * Request-response edges: synchronous call with schema validation at both ends.
  * Stream edges: back-pressure aware async iterables; explicit buffer policies (`drop|block|latest`).
* **Transaction Boundaries**:

  * Each endpoint step group compiles to a transaction if all steps target the same Store and are declared `atomic: true`.
* **Idempotency**:

  * Declarative idempotency keys on endpoints/workflows for safe retries.

## Turing Completeness

* **Control nodes**: `if`, `match`, `foreach`, `reduce`, `while` (bounded with explicit guards in production).
* **Recursion**: workflows may call workflows; must declare a decreasing metric or maxDepth for safety; compiler checks.
* **Expressions**:

  * Safe TS subset or JSONata-like expression engine for inline transforms.
  * Optionally WASM plugins for pure functions; declared with input/output schemas.
* This yields the ability to express arbitrary computable transformations while keeping compilation analyzable.

## Compiler Architecture

* **Phases**:

  1. Parse YAML → AST (preserve comments/locations).
  2. Validate (schema + semantic checks, refs, uniqueness, acyclicity).
  3. Normalize → IR (canonical IDs, defaults, adapter binding).
  4. Plan (dependency resolution, execution graphs, transaction grouping, policy compilation).
  5. Generate (DB DDL/migrations, API code, client SDK, workflows, infra stubs, docs).
  6. Verify (typecheck, contract tests, migration diff, openapi lint).
  7. Pack (emit to `generated/` with content hashes).
* **IR (essential TS)**:

```ts
type Id = string;
type Store = { id:Id; kind:'sql'|'nosql'; adapter:Id; entities:Entity[] };
type Entity = { id:Id; name:string; fields:Field[]; policies?:Policy[]; relations?:Relation[] };
type Field = { name:string; type:string; flags?:string[] };
type Capability = { id:Id; name:string; contract:Op[]; adapter:Id; bindings?:Binding[] };
type Op = { name:string; in:TypeRef; out:TypeRef; atomic?:boolean };
type Endpoint = { id:Id; method:string; path:string; target:Ref<Capability,Op>; policy?:PolicyRef };
type Workflow = { id:Id; steps:Step[]; io:{in:TypeRef; out:TypeRef} };
type Step = CallStep|IfStep|ForEachStep|ReduceStep|WhileStep;
type Adapter = { id:Id; kind:string; config:Record<string,unknown> };
type View = { id:Id; model:Record<string,string>; source:Query|Transform };
type Edge = { from:PortRef; to:PortRef; mode:'req'|'stream' };
type IR = { stores:Store[]; capabilities:Capability[]; endpoints:Endpoint[]; workflows:Workflow[]; views:View[]; edges:Edge[]; adapters:Adapter[] };
```

## Code Generation Targets

* **DB**: SQL DDL + migrations (Postgres/MySQL) or init scripts (Mongo/Dynamo). RLS/policies compiled from `policies`.
* **API**: Next.js Route Handlers or NestJS controllers; OpenAPI spec; input/output Zod validators.
* **SDK**: Typed TS client + React Query hooks; endpoint tags and cache keys derived from IR.
* **Workflows**: Temporal TS activities/workflows or n8n JSON; schedules compiled from cron fields.
* **Infra**: Obelisk templates (Dockerfile, compose, Kubernetes manifests, serverless) chosen by adapter metadata.
* **Docs**: HTML/MD from OpenAPI + IR index; visual graph JSON for editor.

## Project ARC Directory Layout


### Obelisk (tooling backbone)

```
/obelisk
  /tool                      # ARC toolchain lives here
    /arc-config             # schema defs, zod/json-schema, config loader
    /arc-parser             # YAML→AST with source spans
    /arc-validator          # AST checks (structural/ref/semantic)
    /arc-ir                 # AST→IR normalizer (canonical IDs/defaults)
    /arc-graph              # IR→Graph JSON exporter
    /arc-visualizer         # read-only SPA (serves Graph JSON)
    /generators             # Phase 2+: db/api/sdk/workflow/infra codegen
      /db
      /api
      /sdk
      /workflow
      /infra
    /plugins                # optional external generators/adapters
    /adapters               # registry metadata for supported backends
      registry.json
    /manifests              # build manifests (hashes, versions, inputs/outputs)
  /cli                      # CLI entrypoints (local dev, build, deploy)
    /commands
      arc-parse.ts
      arc-validate.ts
      arc-plan.ts
      arc-graph.ts
      arc-build.ts          # wraps parser→validator→ir→graph
      dev-up.ts             # local dev orchestration
      dev-down.ts
      deploy.ts
      projects.ts           # project scaffolding
      services.ts           # service lifecycle helpers
    README.md
  /compose                  # docker-compose for local stacks
    atrium-compose.yml
  /templates                # infra stubs (docker/k8s/serverless/ci)
    /docker
    /k8s
    /serverless
    /ci
  /ci                       # CI jobs/pipelines owned by obelisk
    /jobs
      /atrium
        build-back.yml
        build-front.yml
    /templates
      docker-build-push-template.yml
  /scripts                  # shell/python/node helpers invoked by CLI
  README.md
```

### Nucleus (capabilities, components, algorithms)

```
/nucleus
  /capabilities             # reusable backend modules (auth, crud, notif, etc.)
    /auth
    /crud
    /storage
  /components               # frontend components/widgets (pure runtime)
  /algorithms               # pure functions (layout, routing, transforms)
  /packages                 # shared runtime libs (types, utils, adapters)
    /arc-types              # shared TS types consumed by runtime and generators
    /arc-runtime            # thin runtime helpers (policy checks, repo interfaces)
  /examples                 # minimal apps showcasing capability use
  README.md
```

### Atrium (staging apps/projects)

```
/atrium
  /projects
    /example-app
      /api                  # Next.js routes or Express (handwritten)
      /web                  # Next.js frontend (handwritten)
      /generated            # codegen output from obelisk/tool (git-ignored)
      /overrides            # safe extension points (never overwritten)
      app.arc.yaml          # project-level config (optional override of /config)
  README.md
```

### Config (single source of truth for apps; imported by obelisk/tool)

```
/config
  app.arc.yaml              # canonical top-level config (can import partials)
  /partials                 # shared fragments (entities, capabilities, workflows)
```

## Deterministic Builds

* Content-hash all inputs (config + imported fragments + generator versions).
* Emit manifest with hashes; re-use cached outputs on exact match.
* Lockfile pins adapter/generator versions; migrations tagged with IR hash.

## Security and Tenancy

* Policies compile to:

  * SQL RLS for SQL stores.
  * Middleware guards for endpoints.
  * Capability preconditions.
* Secrets are indirections `${ENV.X}` only; never literals in YAML.
* Tenancy via `tenantId` field convention; enforced at policy compilation.

## Error Handling

* Compile-time: undefined refs, type mismatches, policy gaps, cyclic deps, unsupported adapter features → hard errors with source locations.
* Runtime: uniform error envelope `{ code, message, details }` derived from IR contracts; idempotent retry hints.

## Performance

* Generated APIs aim for P50 < 15 ms handler overhead; zero reflection paths.
* Query planning caches by endpoint signature.
* Streaming edges default to back-pressure `latest`.

## Extensibility

* New adapters: implement adapter contract; register capabilities supported.
* New algorithms: publish IO schemas; pure functions preferred; optional WASM.
* New codegen targets: add generator with IR visitor.

## Visual Editor Mapping Rules

* Every YAML node becomes a visual Node; `kind` picks icon and available Ports.
* Ports derive from `exposes` (capabilities), `model` (views), `contract` (endpoints), `fields` (entities).
* Edges mirror `edges:` and workflow `steps:`; nested scopes render as collapsible groups.
* Editor saves canonical YAML; no lossy transforms.

## Minimal End-to-End Example

**app.arc.yaml**

```yaml
arc: 1
name: "hello-arc"
adapters:
  store.main: { kind: postgres, conn: ${DB_URL} }
stores:
  db.main:
    adapter: store.main
    dialect: sql
    entities:
      User: { fields: { id: uuid@pk, email: string@unique, passwordHash: string, createdAt: timestamp@default(now) } }
capabilities:
  auth:
    adapter: auth.primary
    exposes:
      - register(email:string, password:string) -> { userId: uuid }
      - login(email:string, password:string) -> { token:string, userId: uuid }
  userCrud:
    adapter: store.main
    entity: User
    exposes:
      - get(id:uuid) -> User
endpoints:
  rest:
    - POST /auth/register -> auth.register
    - GET /users/{id} -> userCrud.get
client:
  nextjs:
    bindings: { hooks: react-query, endpoints: ["/auth/register", "/users/{id}"] }
```

**Generated (sketch)**

*Postgres DDL*

```sql
create table "User"(
  id uuid primary key,
  email text unique not null,
  "passwordHash" text not null,
  "createdAt" timestamp not null default now()
);
```

*Next.js route handler*

```ts
// /api/users/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = z.string().uuid().parse(params.id);
  const user = await repoUser.get(id);
  return NextResponse.json(user);
}
```

*Client hook*

```ts
export const useUser = (id: string) => useQuery(['users', id], () => client.get(`/users/${id}`));
```

## Turing Completeness Proof Sketch

* `while`, `if`, recursion across workflows, and state via Stores yield full computational expressiveness.
* Pure expression node + ability to allocate/unbounded iteration (guarded in production) suffices to encode a Turing machine.
* Compiler enforces practical guards (maxDepth, timeouts) without reducing expressiveness.

## Versioning and Migrations

* `arc` (language) semver; `version` (app) semver.
* Migration engine: IR(n) → IR(n+1) diff; generate SQL or adapter ops; record in manifest.
* Backward-compatible schema changes auto-generated; breaking changes require explicit `rewrite` blocks.

## Phased Delivery

* [**Phase 1**: Parser/Validator, IR, Graph JSON export, visualizer. No codegen.](./ARC-CL-v.0.1/phase-I)
* [**Phase 2**: DB + REST codegen, client SDK, minimal orchestrator.](./ARC-CL-v.0.1/phase-II)
* [**Phase 3**: Adapters matrix, policies→RLS, workflows→Temporal, infra stubs.](./ARC-CL-v.0.1/phase-III)
* [**Phase 4**: WASM/algorithm nodes, visual editor with round-trip fidelity, AI-assisted edits.](./ARC-CL-v.0.1/phase-IV)
