---
title: Mermaid Test
description: Testing Mermaid diagrams in MDX
---

# Mermaid Diagram Test

This is a test page for Mermaid diagrams inside `.md`/`.mdx` files.

## Flowchart Example

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Celebrate!]
    B -- No --> D[Debug]
    D --> B
````

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Server

    User->>App: Open Mermaid page
    App->>Server: Fetch data
    Server-->>App: Respond with data
    App-->>User: Render diagram
```

## Gantt Chart Example

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Development
    Setup Project       :done,    des1, 2025-08-01, 3d
    Implement Features  :active,  des2, 2025-08-04, 7d
    Testing             :         des3, after des2, 5d
    Deployment          :         des4, after des3, 2d
```