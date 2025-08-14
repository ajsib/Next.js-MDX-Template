# Standard Operating Procedure: Using Emotion CSS with Next.js App Directory (App Router)

## Core Principles

* Use **React Server Components** (default in App Router) whenever possible for performance, streaming, and improved bundle size.
* Use **Client Components** only when you require client-side interactivity, state, context, refs, or CSS-in-JS (like Emotion) styles that must be generated at runtime.
* Emotion **cannot** run its runtime styling (css prop, styled, CacheProvider) in Server Components. It only works in Client Components.

---

## 1. Server vs. Client Components: When To Use Each

### Server Components

* **Default in ********************`/app`******************** directory.**
* Run only on the server, do not ship any client JS.
* No client interactivity, hooks, or runtime CSS-in-JS.
* Best for static content, data fetching, and structural components.
* Can render other Server Components and Client Components.

**Use Server Components when:**

* You do not need `useState`, `useEffect`, `useRef`, or runtime CSS-in-JS.
* You are outputting static HTML.
* You want to maximize performance and reduce bundle size.

### Client Components

* Must be explicitly marked with `'use client'` at the top of the file.
* Can use all React hooks and browser APIs.
* Needed for interactivity, state, refs, or runtime CSS-in-JS (Emotion).
* Inherit all parent components as client (cannot render Server Components as children).

**Use Client Components when:**

* You need interactivity, state, refs, or browser APIs.
* You want to use Emotion's runtime styling (css prop, styled, CacheProvider).

---

## 2. Emotion CSS Usage

### 2.1 Using Emotion (Client Components Only)

* **Create Client Components:**
  Any component using Emotion **must** be a Client Component.
  Place `'use client'` at the top of the file.
* **Example:**

  ```tsx
  // 'use client'
  import { css } from '@emotion/react'

  export function FancyButton({ children }) {
    return (
      <button css={css`color: hotpink;`}>
        {children}
      </button>
    )
  }
  ```
* **Server Component Limit:**
  You cannot use Emotion's `css` prop, `styled`, or `CacheProvider` in Server Components.
  Marking a file as `'use client'` is not always enough—parent components and consumers must also allow client usage.
* **MDX Usage:**
  If MDX is rendered as Server Components, you **cannot** use Emotion in mapped elements unless you dynamically import the Client Component with `ssr: false`, which has performance and hydration costs.

---

### 2.2 What To Do When You Cannot Use Emotion (e.g., Server Components, MDX, etc.)

* **Do not use ********************`css`******************** prop, ********************`styled`********************, or ********************`CacheProvider`********************.**

* Use inline `style` objects in the component (static styles only).

* Or, use `className` with global CSS, CSS modules, or TailwindCSS.

* **Example using inline ********************`style`********************:**

  ```tsx
  // Works everywhere, including server components
  export function Title({ children }) {
    return (
      <h1 style={{
        fontFamily: 'var(--font-brand, sans-serif)',
        fontSize: '3rem',
        fontWeight: 'bold'
      }}>
        {children}
      </h1>
    )
  }
  ```

* **Example using global CSS:**

  ```css
  /* styles/global.css */
  .brand-heading {
    font-family: var(--font-brand, sans-serif);
    font-size: 3rem;
    font-weight: bold;
  }
  ```

  ```tsx
  export function Title({ children }) {
    return <h1 className="brand-heading">{children}</h1>
  }
  ```

---

## 3. How To Decide (Summary Table)

| Use Case                          | Server Component | Client Component ('use client') | Emotion CSS |
| --------------------------------- | ---------------- | ------------------------------- | ----------- |
| Static content, no runtime styles | ✔️               |                                 |             |
| Dynamic styles via Emotion        |                  | ✔️                              | ✔️          |
| Interactivity, state              |                  | ✔️                              | ✔️          |
| MDX Headings, static styling      | ✔️               |                                 |             |
| MDX Headings, Emotion styling     |                  | *Complicated*See note           | *No*        |

---

## 4. Recommendations

* **Default to Server Components** for all layout, data, and presentational logic.
* **Use Client Components** only when interactivity or runtime CSS-in-JS is absolutely needed.
* **For MDX and Markdown mappings,** avoid Emotion and use either inline `style` or CSS classes with global CSS, to preserve server rendering and avoid hydration errors.
* **Do not attempt to "force" Emotion into server/MDX context.** Use static style objects or CSS classes.

---

## 5. Known Issues & Caveats

* Marking a component as `'use client'` does not propagate to its parent or consumer.
  If a Server Component tries to render a Client Component, this is fine. But if you try to pass hooks or client-only context from a Server Component, it will not work.
* MDX will default to rendering mapped components as Server Components; Emotion styling will break unless you dynamically import the mapping with `{ ssr: false }`, which is not recommended for general use.
* Do **not** mix client and server logic arbitrarily; be intentional about boundaries.

---

## 6. Decision Tree

1. **Do you need runtime styling or interactivity?**

   * Yes → Use Client Component, use Emotion.
   * No → Use Server Component, use static styles or CSS.

2. **Is your component used in MDX or Markdown?**

   * Yes → Use only static styles or classes; no Emotion.
   * No → Proceed as above.

3. **Are you using Emotion in ********************`/app`******************** directory?**

   * Yes → Only inside Client Components with `'use client'`.

---

## 7. References

* [Emotion Docs: Next.js App Router](https://emotion.sh/docs/ssr#nextjs)
* [Next.js Docs: App Router, Client and Server Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#client-components)
* [MDX + Next.js App Directory](https://mdxjs.com/guides/next/#app-directory)

---

This SOP provides explicit guidance on when and how to use Emotion CSS and what to do when it is not possible.
Use Server Components by default for performance and simplicity.
Reserve Emotion for Client Components and scenarios that require it.
Use static styles and classes for all server-only or MDX-based content.

## 8. How to Achieve Emotion-Like Styles in Server Components

```tsx
// You cannot use Emotion in React Server Components.
// For Emotion-like inline styles in Server Components, use plain JS objects and the style prop.

import React from 'react'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const h1Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontSize: '3rem',
  fontWeight: 'bold',
  letterSpacing: '-0.02em',
  color: 'var(--brand-600, #1e293b)',
} as const

// ... repeat for h2Style, h3Style, etc.

const H1: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h1 style={{ ...h1Style, ...style }} {...props}>{children}</h1>
)

const H2: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h2 style={{ ...h2Style, ...style }} {...props}>{children}</h2>
)

// ...repeat for H3–H6

export const Heading = { H1, H2, H3, H4, H5, H6 }
```