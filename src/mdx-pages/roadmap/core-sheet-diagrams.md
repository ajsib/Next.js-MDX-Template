### System Context & Data Flow

```mermaid
graph TB
  %% Client
  subgraph C[Client (Next.js app route, client component)]
    Input[Pointer/Keyboard Input]
    Gizmo[Interaction Gizmos]
    CmdBus[Command Bus\n(undo/redo stack)]
    Reducer[Pure Reducers]
    Sheet[Sheet Model\n(artifacts, edges, order, config)]
    Derived[Derived Indices\nQuadtree / Anchors / Z-Order / Selection]
    Renderer[Canvas2D Renderer\n(dirty regions)]
    Exporter[Export Engine\nPNG/SVG/JSON]
    YDoc[Yjs Document]
  end

  %% Server
  subgraph S[Node WebSocket + HTTP API]
    YSrv[Yjs WS Server]
    API[HTTP Route Handlers]
    Cron[Snapshot Cron]
  end

  %% Storage
  subgraph DB[(PostgreSQL)]
    Projects[(projects)]
    Sheets[(sheets)]
    Events[(sheet_events)]
    Snaps[(sheet_snapshots)]
  end

  Input --> Gizmo -->|Intents| CmdBus -->|Commands| Reducer -->|immutable-ish update| Sheet
  Sheet --> Derived --> Renderer -->|Dirty AABBs| Renderer
  Sheet --> Exporter
  Sheet <-->|apply| YDoc
  YDoc <-->|updates| YSrv
  API <-->|HTTP| C
  YSrv -->|append CRDT deltas| Events
  Cron -->|materialize latest| Snaps
  API -->|GET /api/sheets/:id| Snaps
  API -->|eventsSince| Events
  Projects -. rel .- Sheets
  Sheets -. fk .-> Events
  Sheets -. fk .-> Snaps
```

### Command → Render Pipeline

```mermaid
flowchart LR
  A[Pointer Down/Move/Up] --> B[Hit-Test\nquadtree.queryPoint/queryAABB]
  B --> C[Topmost by Z-Order]
  C --> D[Gizmo\ntranslate/resize/connect]
  D --> E[Snap\n(grid|anchors|angles)]
  E --> F[Command\nART_PATCH/CREATE/EDGE_CREATE/...]
  F --> G[Reducer\npure updates on Sheet]
  G --> H[Derived Indices\nincremental update]
  H --> I[Dirty Region Union\nminimal redraw]
  I --> J[Canvas2D Draw\ngrid→edges→artifacts→handles→cursors]
  G --> K[CRDT Mapping\nYjs ops]
  K --> L[Broadcast via WS]
```

### CRDT Sync & Persistence (Sequence)

```mermaid
sequenceDiagram
  autonumber
  actor UA as User A
  participant CA as Client A
  participant YDocA as Yjs Doc (A)
  participant WS as Yjs WS Server
  participant EV as Postgres.sheet_events
  participant SS as Postgres.sheet_snapshots
  participant CB as Client B
  actor UB as User B

  UA->>CA: Drag box (intent)
  CA->>CA: Command→Reducer→Sheet
  CA->>YDocA: Apply Yjs updates
  YDocA->>WS: Update payload
  WS->>EV: Append event (append-only)
  WS-->>CB: Broadcast update
  CB->>CB: Apply Yjs to local doc→render

  rect rgb(245,245,245)
  Note over EV,SS: Periodic Snapshot
  WS->>SS: Materialize snapshot (version N)
  end

  CB->>WS: join {sheetId, cursor}
  WS-->>CB: latest snapshot + eventsSince(version)
  CB->>CB: Reconstruct CRDT→render
```

### Database ERD

```mermaid
erDiagram
  PROJECTS ||--o{ SHEETS : contains
  SHEETS ||--o{ SHEET_EVENTS : logs
  SHEETS ||--|| SHEET_SNAPSHOTS : has_latest

  PROJECTS {
    uuid id PK
    text name
    uuid owner_id
    timestamptz created_at
  }

  SHEETS {
    uuid id PK
    uuid project_id FK
    text name
    jsonb config
    timestamptz created_at
  }

  SHEET_EVENTS {
    bigint id PK
    uuid sheet_id FK
    uuid actor_id
    timestamptz ts
    jsonb payload
  }

  SHEET_SNAPSHOTS {
    uuid sheet_id PK FK
    bigint version
    jsonb state
    timestamptz updated_at
  }
```

### Core Types (Class Diagram Approximation)

```mermaid
classDiagram
  class Vec2 { +number x +number y }
  class AABB { +number x +number y +number w +number h }
  class Style { +string fill +string stroke +number strokeWidth +number radius }
  class Artifact {
    <<interface>>
    +Id id
    +string type
    +AABB geom
    +Style style
  }
  class BoxArtifact { +props: {label?} }
  class MDXArtifact { +props: {source} }
  class MermaidArtifact { +props: {source} }
  class TaskListArtifact { +props: {items[]} }

  class EdgeEnd { +Id id +string port }
  class Edge { +Id id +EdgeEnd from +EdgeEnd to +string type +labels[] }

  class Derived {
    +QuadtreeIndex spatial
    +AnchorIndex anchors
    +Set~Id~ selection
    +AABB[] dirtyAABBs
  }

  class Sheet {
    +Id id
    +string name
    +config:{grid:number,snap:boolean,theme}
    +artifacts: Record~Id,Artifact~
    +edges: Record~Id,Edge~
    +order: Id[]
    +_derived: Derived
  }

  Artifact <|-- BoxArtifact
  Artifact <|-- MDXArtifact
  Artifact <|-- MermaidArtifact
  Artifact <|-- TaskListArtifact
  Sheet "1" o-- "many" Artifact
  Sheet "1" o-- "many" Edge
  Sheet "1" o-- Derived
```

### Derived Indices & Ops

```mermaid
flowchart TB
  subgraph D[Derived Indices]
    Q[QuadtreeIndex\ninsert/remove/query]
    A[AnchorIndex\nprecomputed centers/mids/corners]
    Z[Z-Order Array\nId[] + index map]
    S[Selection Set]
  end
  E[Events: ART_CREATE/ART_PATCH/ART_DELETE/EDGE_*] -->|delta AABB| Q
  E -->|recompute anchors(id)| A
  E -->|mutate order| Z
  E -->|SELECT_*| S
  Q -->|queryPoint/queryAABB| Hit[Hit-Testing]
  A -->|nearest anchors| Snap[Snapping]
  Z -->|sort candidates| Hit
```

### Orthogonal Router & Caching

```mermaid
flowchart LR
  Start[Endpoints + Obstacle Set] --> Inflate[Inflate Obstacles by margin]
  Inflate --> Gridize[Grid Overlay (cell = k px)]
  Gridize --> AStar[A* Search\nManhattan metric]
  AStar --> Path[Raw Waypoints]
  Path --> Simplify[Remove Collinear Bends]
  Simplify --> Route[Final Orthogonal Polyline]
  Start ---> CacheKey[(fromGeom,toGeom,obstacleVersion)]
  CacheKey -->|hit| Route
  CacheKey -->|miss| AStar
  subgraph Nearby Changes
    Move[Endpoint Move] -->|mark| Invalid[Invalidate Cache]
    ObstacleDelta[Obstacle Change via quadtree window] --> Invalid
  end
```

### API Surface (HTTP + WS)

```mermaid
sequenceDiagram
  autonumber
  participant CLI as Client
  participant API as HTTP Routes
  participant DB as Postgres
  participant WS as Yjs WS

  CLI->>API: POST /api/sheets {name, projectId}
  API->>DB: INSERT sheets
  API-->>CLI: 201 {id}

  CLI->>API: GET /api/sheets/:id
  API->>DB: SELECT snapshot + eventsSince
  API-->>CLI: {snapshot, eventsSince}

  CLI->>API: GET /api/export/:sheetId.svg|png
  API->>DB: Load sheet state
  API-->>CLI: stream(svg|png)

  CLI->>WS: join {sheetId, token}
  WS-->>CLI: ack + presence
  CLI->>WS: update {yUpdate}
  WS->>DB: append event
  WS-->>CLI: broadcast peers' updates
```

### Rendering State & Dirty Regions

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Dragging : pointerdown on hit
  Dragging --> Dragging : pointermove\nupdate AABB\naccumulate dirty
  Dragging --> Commit : pointerup
  Commit --> Recalc : reducer applied\nindices updated
  Recalc --> Redraw : union dirtyAABBs\nclip draw
  Redraw --> Idle
```

### Compute Placement Quadrant

```mermaid
quadrantChart
    title Compute Placement
    x-axis Client  --> Server
    y-axis Realtime --> Batch
    quadrant-1 Client/Realtime
    quadrant-2 Server/Realtime
    quadrant-3 Client/Batch
    quadrant-4 Server/Batch
    "Reducers/Indices"        : [0.1, 0.1]
    "Hit-Test & Snapping"     : [0.15, 0.15]
    "Routing (S/M graphs)"    : [0.25, 0.2]
    "PNG/SVG Export (fast)"   : [0.2, 0.3]
    "Snapshot Cron"           : [0.9, 0.8]
    "Heavy Routing Batches"   : [0.8, 0.2]
    "PDF Export"              : [0.85, 0.6]
```

### Extensibility Mindmap

```mermaid
mindmap
  root((Sheet Model))
    Artifacts
      Box
      Mermaid
      MDX
      TaskList
      Connector
      <<registerArtifact>>
        schema(Zod schema)
        measure(measure/size)
        draw(Canvas/SVG)
        anchors(anchor points)
        hit(custom hit-test)
        routerHooks(obstacles)
    Tools
      <<registerTool>>
        select
        translate
        resize
        connect
    Export
      PNG
      SVG
      JSON
      <<registerExport>>
    Future
      Constraints(Cassowary/Kiwi)
      IdBuffer(Color Picking)
      ChannelRouting(Incremental route graph)
      WebGPU(Renderer)
```

### Performance Targets Timeline

```mermaid
timeline
  title Performance & Load Targets
  T0 : Sheet load from snapshot + events
  ≤8ms/frame : Drag frame latency target
  60fps : Canvas2D typical scenes
  10k artifacts : steady interaction
  2k connectors : orthogonal routing cached
```

### Three-Week Gantt

```mermaid
gantt
  title Sheet Model — 3-Week Plan
  dateFormat  YYYY-MM-DD
  axisFormat  %b %d
  section Week 1
  Core types & reducers         :w1a, 2025-08-11, 3d
  Quadtree + anchors + z-order  :w1b, after w1a, 2d
  Canvas renderer + grid/snap   :w1c, after w1b, 2d
  Command bus undo/redo         :w1d, after w1b, 2d
  section Week 2
  Connectors + router + hit     :w2a, 2025-08-18, 3d
  Marquee + grouping            :w2b, after w2a, 2d
  MDX render→bitmap             :w2c, after w2a, 2d
  Mermaid render→SVG→bitmap     :w2d, after w2c, 1d
  PNG/SVG export                :w2e, after w2d, 1d
  section Week 3
  Yjs sync + presence           :w3a, 2025-08-25, 2d
  Postgres events + snapshots   :w3b, after w3a, 2d
  Snapshot cron                 :w3c, after w3b, 1d
  E2E + profiling + dirty redraw:w3d, after w3b, 3d
```

### Connector Creation Angle Snap

```mermaid
flowchart TB
  Start[Drag from source port] --> Candidate[Compute raw vector v]
  Candidate --> Clamp0[Clamp to 0/90/45°]
  Clamp0 --> SnapGrid[Apply grid snap if enabled]
  SnapGrid --> RouteOrtho[Generate orthogonal legs]
  RouteOrtho --> CreateEdge[EDGE_CREATE with waypoints]
  CreateEdge --> End
```

### Export Paths

```mermaid
flowchart LR
  SheetState[Sheet State] -->|Canvas draw| Raster[Bitmap Surface]
  SheetState -->|SVG path mirror| SVGO[SVG Document]
  Raster --> PNG[PNG Stream]
  SVGO --> SVG[SVG Stream]
  PNG --> APIpng[GET /api/export/:id.png]
  SVG --> APIsvg[GET /api/export/:id.svg]
```
