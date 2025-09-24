# Mission

Train real people against a controlled, replayable, compartmentalized “internet” that looks and behaves like the real thing. Build exercises as portable, versioned manifests. Run them in isolated sandboxes. Capture actions and score outcomes.

# Product Outcomes

* Single file/manifest defines an exercise: narrative, roles, platforms, content seeds, injects, scoring, permissions.
* One-click instantiate a sandboxed “internet” from a manifest.
* Real users interact via familiar clones (Google, X, Facebook, Instagram, YouTube, Reddit, custom sites).
* Admins script timelines and injects, operate NPCs, and observe telemetry.
* Export/import exercises losslessly.
* Strict separation between exercises for privacy, replay, and cleanup.
* Minimal moving parts for MVP; clear growth path.

# Modules

1. **Auth & Identity**
2. **Exercise Builder (Template Authoring)**
3. **Exercise Runtime (Sandbox Orchestrator)**
4. **Platforms (Google/X/Facebook/Instagram/YouTube/Reddit + Custom Sites)**
5. **Content & Media**
6. **Injects & Timeline**
7. **Personas & Organizations**
8. **Scoring & Flags**
9. **Search Index (for the Google clone)**
10. **Telemetry & Replay**
11. **Admin Portal**
12. **User Portal**

# App Flow (MVP)

* Admin signs in → creates Exercise Template → defines personas, orgs, platforms, seeds content, adds injects, defines flags → publishes Template → launches Exercise Run.
* Launch allocates a sandbox (logical isolation via `exerciseId`) and seeds runtime collections from the template.
* Users sign in to the User Portal → land on Google clone → navigate to social clones and custom sites → interact.
* Admin monitors, triggers injects, controls NPCs, marks flags, and ends run.
* After action: export run data and scores; archive sandbox.

# Roles

* **Admin**: full builder/operator. No in-scenario identity by default.
* **Player Character (PC)**: real user mapped to a **Persona** for the exercise. Interacts in clones.
* **Non-Player Character (NPC)**: simulated persona controlled by Admin or scheduled/bot scripts.
* **Account**: login credential for Admins/Players; never reused across exercises for privacy.
* **Persona**: in-scenario identity (display name, handles) that owns platform accounts. PCs/NPCs are attributes on personas, not separate types.

# Architecture (containers)

* Next.js (user + admin UI)
* Node.js API (REST) + job worker (inject scheduler)
* MongoDB
* Blob storage (S3/MinIO)
* Optional Redis (job queue/session), only if needed

# Data Model Overview (MongoDB)

**Principles**

* Schema-first. Strict validation at collection boundaries.
* Exercise is the root. Everything references `exerciseId`.
* Template vs Runtime separation.
* Keep template as a single canonical manifest + normalized subdocs for queryable bits.
* Runtime denormalizes for speed; all writes tagged with `exerciseId`.
* Export/import is a pure JSON round-trip.

## Collections (minimal set)

### 1) `accounts`

Login credentials. Exercise-agnostic.

```json
{
  "_id": "acct_...",
  "username": "string",
  "passwordHash": "string",
  "roles": ["admin"|"player"],
  "status": "active|disabled",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 2) `exercise_templates`

Authoring-time, versionable, portable definition. Single source of truth.

```json
{
  "_id": "tpl_...",
  "name": "string",
  "version": 3,
  "status": "draft|published|archived",
  "manifest": {
    "meta": {
      "title": "string",
      "summary": "string",
      "objectives": ["string"],
      "duration": { "minutes": 120 },
      "visibility": "internal|external"
    },
    "organizations": [
      { "orgId": "org_1", "name": "string", "type": "company|ngo|threat|gov" }
    ],
    "personas": [
      {
        "personaId": "per_1",
        "displayName": "string",
        "isNPC": true,
        "orgId": "org_1",
        "notes": "string",
        "platformAccounts": [
          { "platform": "x", "handle": "string", "verified": false },
          { "platform": "reddit", "handle": "string" }
        ]
      }
    ],
    "platforms": [
      {
        "key": "google",
        "enabled": true,
        "config": { "safeSearch": false }
      },
      {
        "key": "reddit",
        "enabled": true,
        "config": { "subreddits": ["r/news", "r/local"] }
      },
      {
        "key": "customSite",
        "enabled": true,
        "config": {
          "slug": "citygazette",
          "routes": [
            { "path": "/", "template": "newsFront", "blocks": [...] },
            { "path": "/article/:slug", "template": "article" }
          ]
        }
      }
    ],
    "contentSeeds": [
      {
        "contentId": "c_1",
        "platform": "reddit",
        "type": "post",
        "authorPersonaId": "per_1",
        "subreddit": "r/local",
        "title": "string",
        "body": "markdown/text",
        "media": [{ "assetKey": "m_hero.jpg", "alt": "string" }],
        "tags": ["tag1","tag2"],
        "pinned": false
      }
    ],
    "injects": [
      {
        "injectId": "inj_1",
        "title": "Leak appears",
        "when": { "offsetMin": 30 }, 
        "actions": [
          {
            "kind": "createContent",
            "platform": "x",
            "authorPersonaId": "per_2",
            "payload": { "text": "breaking...", "media": [] }
          },
          { "kind": "boostTrend", "platform": "x", "hashtag": "#event" }
        ],
        "conditions": [{ "type": "flagNotRaised", "flagKey": "f_foundLeak" }]
      }
    ],
    "flags": [
      {
        "flagKey": "f_foundLeak",
        "name": "Locate leaked memo",
        "kind": "binary|count|score",
        "criteria": [
          { "type": "searchQueryRun", "contains": ["memo", "leak"] },
          { "type": "visitedPath", "platform": "customSite", "path": "/article/leak" }
        ],
        "points": 10
      }
    ],
    "scoring": {
      "maxPoints": 100,
      "rubric": [{ "flagKey": "f_foundLeak", "weight": 1 }]
    },
    "assets": [
      { "assetKey": "m_hero.jpg", "blobPath": "exercises/tpl_.../m_hero.jpg", "contentType": "image/jpeg" }
    ]
  },
  "createdBy": "acct_...",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 3) `exercise_runs`

Runtime instance derived from a published template. The sandbox anchor.

```json
{
  "_id": "run_...",
  "templateId": "tpl_...",
  "name": "string",
  "status": "provisioning|ready|running|paused|ended|archived",
  "startsAt": "date|null",
  "endsAt": "date|null",
  "exerciseId": "ex_...",              // stable tenant key for all runtime docs
  "playerAssignments": [
    { "accountId": "acct_...", "personaId": "per_3" }
  ],
  "adminIds": ["acct_..."],
  "clock": { "mode": "real|accelerated", "speed": 1.0 },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 4) `runtime_personas`

Seeded from template personas so the run is immutable relative to the template.

```json
{
  "_id": "rp_...",
  "exerciseId": "ex_...",
  "templatePersonaId": "per_1",
  "displayName": "string",
  "isNPC": true,
  "orgId": "org_1",
  "platformAccounts": [{ "platform": "x", "handle": "..." }]
}
```

### 5) `runtime_content`

Unified content envelope across platforms.

```json
{
  "_id": "rc_...",
  "exerciseId": "ex_...",
  "platform": "google|x|facebook|instagram|youtube|reddit|custom",
  "type": "post|comment|video|image|page|message",
  "authorPersonaRef": "rp_...",
  "parentId": "rc_...|null",           // comment/thread linkage
  "channel": {                         // platform-specific routing
    "reddit": { "subreddit": "r/..." },
    "x": { "hashtag": ["#..."] },
    "custom": { "site": "citygazette", "path": "/..." }
  },
  "title": "string|null",
  "body": "string|markdown",
  "media": [{ "assetKey": "m_...", "blobPath": "..." }],
  "metrics": { "likes": 0, "reposts": 0, "comments": 0 },
  "tags": ["..."],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### 6) `runtime_injects`

Materialized schedule with state for a run.

```json
{
  "_id": "rj_...",
  "exerciseId": "ex_...",
  "templateInjectId": "inj_1",
  "status": "pending|fired|skipped|failed",
  "scheduledFor": "date",
  "firedAt": "date|null",
  "lastError": "string|null"
}
```

### 7) `runtime_flags`

Per-run evaluation states.

```json
{
  "_id": "rf_...",
  "exerciseId": "ex_...",
  "flagKey": "f_foundLeak",
  "state": { "achieved": false, "count": 0, "score": 0 },
  "achievedAt": "date|null",
  "byAccountId": "acct_...|null"
}
```

### 8) `search_index`

Documents indexed for Google clone.

```json
{
  "_id": "si_...",
  "exerciseId": "ex_...",
  "url": "string", 
  "title": "string",
  "snippet": "string",
  "tokens": ["..."],
  "sourceRef": "rc_...|custom_page_id",
  "lastIndexedAt": "date"
}
```

### 9) `telemetry`

Immutable event log for replay and scoring.

```json
{
  "_id": "ev_...",
  "exerciseId": "ex_...",
  "ts": "date",
  "actor": { "type": "account|npc|system", "id": "acct_...|rp_...|system" },
  "verb": "search|visit|post|comment|like|share|injectFired|flagAchieved",
  "obj": { "platform": "x|reddit|...", "ref": "rc_...|url" },
  "meta": { "ip": "string", "ua": "string" }
}
```

### 10) `assets`

Blob metadata (shared across templates and runs; physical blobs in S3/MinIO).

```json
{
  "_id": "asset_...",
  "ownerScope": "template|exercise",
  "ownerId": "tpl_...|ex_...",
  "assetKey": "m_hero.jpg",
  "blobPath": "string",
  "contentType": "string",
  "bytes": 12345,
  "createdAt": "date"
}
```

# Relationships

* `exercise_templates.manifest.*` is the design-time source of truth.
* `exercise_runs.exerciseId` is the tenant key for isolation.
* `runtime_*` collections always include `exerciseId`.
* `accounts` link to runs only through `playerAssignments` to avoid cross-run leakage.
* `runtime_personas` are snapshots of template personas.
* `runtime_content` references `runtime_personas`.
* `telemetry` references `accounts` and `runtime_*` via ids and `exerciseId`.

# Indices (MVP)

* `runtime_content`: `{ exerciseId: 1, platform: 1, createdAt: -1 }`, text index on `title/body/tags`.
* `runtime_personas`: `{ exerciseId: 1, displayName: 1 }`.
* `runtime_injects`: `{ exerciseId: 1, status: 1, scheduledFor: 1 }`.
* `runtime_flags`: `{ exerciseId: 1, flagKey: 1 }`.
* `search_index`: `{ exerciseId: 1, tokens: 1 }`.
* `telemetry`: `{ exerciseId: 1, ts: 1 }`.
* `exercise_runs`: `{ status: 1, createdAt: -1 }`.

# Platforms (clones)

* **Google**: reads `search_index`; renders results; logs `search` and `visit`.
* **Reddit**: reads/writes `runtime_content` with channel.reddit; supports posts, comments, voting (likes).
* **X/Facebook/Instagram/YouTube**: same `runtime_content` envelope; per-platform view models map to their UI.
* **Custom Sites**: `platform=custom`; pages from template config; content pulls from `runtime_content` or inline page blocks.

# Inject Engine

* Scheduler materializes `runtime_injects` on run creation using manifest offsets.
* Job worker executes actions atomically: create content, edit content, boost metrics, toggle site blocks, send system messages.
* Conditions read `runtime_flags` and telemetry.
* Idempotency keys per inject to avoid duplicates.

# Scoring & Flags

* Flags are defined in the template and evaluated by watchers:

  * rule matchers on telemetry,
  * content discoveries,
  * search queries,
  * page visits.
* Accrue points to per-account scorecards; freeze at run end.

# Admin Portal IA

* Templates: list → editor (organizations, personas, platforms, content seeds, injects, flags, assets) → version/publish.
* Runs: list → launch dialog (assign players, clock mode) → live dashboard (timeline, inject control, NPC console, scores, logs).
* Assets: upload/manage.
* Users: create player/admin accounts; per-run assignments.
* Exports: template JSON, run JSONL (telemetry), content dumps.

# User Portal IA

* Login → Google landing → perform searches, navigate to platforms, interact as assigned persona.
* Profile switcher (if multiple personas assigned).
* Notifications (inject-driven events).
* Minimal chrome; everything else is “in-scenario”.

# Configuration-Driven Approach

* The **manifest** in `exercise_templates` is authoritative.
* Launch copies manifest → seeds `runtime_*` with `exerciseId`.
* All UI modules render off config (enabled platforms, custom sites, routes).
* No cross-run coupling; export/import is `manifest.json` + asset bundle.

# Authentication

* `accounts` with role-based access.
* Admin endpoints gated by role.
* Player access bound to `exercise_runs.playerAssignments`.
* Session tokens scoped; telemetry logs actor id and scope.

# MVP Scope

* Admin: create/publish template; define orgs/personas/platforms; seed content; define injects (createContent + boostTrend); define 3 flags; upload assets; launch run; assign players.
* Platforms: Google search, Reddit, X; 1 custom news site.
* Runtime: scheduler, telemetry, scoring, export.
* User: act as persona, search, post, comment, like, navigate custom site.

# Expansion Hooks (kept dormant until needed)

* Bot scripts for NPCs (worker queue).
* Accelerated clock and time dilation.
* Replay UI from telemetry.
* Additional platforms and richer actions.
* Basic classification API: optional tagger writing to `runtime_content.tags`.

# Simplicity & Isolation

* Single Mongo database; hard isolation via `exerciseId` and strict queries.
* All runtime writes include `exerciseId`.
* Export deletes are single-key by `exerciseId`.
* No shared mutable state across runs.

# PCs, NPCs, Admins—Clear Separation

* **Admin**: account with `roles:["admin"]`; interacts only in admin portal; may impersonate NPCs via NPC console without using player flows.
* **PC**: `account` + `playerAssignment` → `runtime_persona`; can only act as that persona inside the run.
* **NPC**: `runtime_persona.isNPC=true`; content authored either by scheduled injects or manual admin ops; never logs in.

# Schema-First Cheatsheet (keys only)

```
accounts(_id, username, passwordHash, roles, status, createdAt, updatedAt)

exercise_templates(_id, name, version, status, manifest{meta, organizations[], personas[], platforms[], contentSeeds[], injects[], flags[], scoring, assets[]}, createdBy, createdAt, updatedAt)

exercise_runs(_id, templateId, name, status, startsAt, endsAt, exerciseId, playerAssignments[], adminIds[], clock, createdAt, updatedAt)

runtime_personas(_id, exerciseId, templatePersonaId, displayName, isNPC, orgId, platformAccounts[])

runtime_content(_id, exerciseId, platform, type, authorPersonaRef, parentId, channel{}, title, body, media[], metrics{}, tags[], createdAt, updatedAt)

runtime_injects(_id, exerciseId, templateInjectId, status, scheduledFor, firedAt, lastError)

runtime_flags(_id, exerciseId, flagKey, state{achieved,count,score}, achievedAt, byAccountId)

search_index(_id, exerciseId, url, title, snippet, tokens[], sourceRef, lastIndexedAt)

telemetry(_id, exerciseId, ts, actor{type,id}, verb, obj{platform,ref}, meta{ip,ua})

assets(_id, ownerScope, ownerId, assetKey, blobPath, contentType, bytes, createdAt)
```

# Buildability

* Few collections, predictable references, strict `exerciseId` tenanting.
* Manifest first; runtime derived; clean export/import.
* Next.js + Node API + job worker + Mongo + MinIO is sufficient for MVP.
