import SidebarNav from "./SidebarNav"
import { NavNode } from "./util"

type Props = {
  navTree: NavNode[]
  breadcrumbs: { href: string; label: string }[]
  children: React.ReactNode
}

export default function MdxSlugLayout({ navTree, breadcrumbs, children }: Props) {
  const currentPath = breadcrumbs.slice(1).map(b => b.label.replace(/ /g, "-"))

  return (
    <div className="docs-shell">
      <a className="skip-link" href="#content">Skip to content</a>

      {/* Tiny mobile header only on small screens */}
      <header className="mobile-header" aria-label="Page header">
        <a className="menu-btn" href="#sidenav" aria-controls="sidenav" aria-label="Open navigation">☰</a>
        <div className="brand">Docs</div>
      </header>

      <div className="container">
        {/* Sidebar container. Uses :target for JS-free open/close on mobile */}
        <aside id="sidenav" className="sidebar" aria-label="Section navigation">
          <div className="sidebar-inner">
            <a className="close-btn" href="#" aria-label="Close navigation">×</a>
            <SidebarNav navTree={navTree} currentPath={currentPath} />
          </div>
        </aside>

        {/* Main content */}
        <main id="content" className="content" role="main">
          {children}
        </main>
      </div>

      <style>{`
        /* ---------- Tokens ---------- */
        :root {
          --header-h: 44px;
          --sidebar-w: clamp(220px, 22vw, 300px);
          --content-max: 1200px;
          --gap: clamp(16px, 2.5vw, 32px);
          --vpad: clamp(12px, 2vh, 24px);
          --mobile-gap: 8px;
          --radius: 10px;
        }

        /* ---------- Layout Shell ---------- */
        .docs-shell {
          min-height: 100svh;
          color: var(--text-default);
          font-family: var(--font-body, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
          background: var(--app-bg, transparent);
        }

        .skip-link {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .skip-link:focus { left: 8px; top: 8px; width: auto; height: auto; padding: 6px 8px; background: var(--surface-50); border: 1px solid var(--border-light); border-radius: 6px; z-index: 100; }

        .container {
          min-height: 100svh;
          display: flex;
          align-items: stretch;
          gap: var(--gap);
          max-width: calc(var(--content-max) + var(--sidebar-w) + var(--gap));
          margin-inline: auto;
          padding: var(--vpad) var(--gap);
          width: 100%;
        }

        /* ---------- Header (mobile only) ---------- */
        .mobile-header { display: none; }
        .brand {
          font-family: var(--font-brand, Inter, ui-sans-serif);
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: 0.01em;
        }
        .menu-btn, .close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          min-width: 32px;
          padding: 0 8px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          background: var(--surface-0);
          text-decoration: none;
          color: var(--text-700);
        }

        /* ---------- Sidebar ---------- */
        .sidebar {
          flex: 0 0 var(--sidebar-w);
        }
        .sidebar-inner {
          position: sticky;
          top: var(--vpad);
          height: calc(100svh - var(--vpad) * 2); /* bottom margin via container padding */
          overflow-y: auto;                         /* scroll when content exceeds height */
          background: var(--surface-50);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 0.5rem;
          scrollbar-gutter: stable both-edges;      /* avoids layout shift when scrollbar appears */
        }
        .close-btn { display: none; }

        /* ---------- Content ---------- */
        .content {
          flex: 1 1 auto;      /* allow shrink/grow */
          min-width: 0;        /* enable flex shrink without overflow */
          width: 100%;         /* fluid width */
          max-width: var(--content-max); /* cap at desktop */
          margin: 0;           /* no extra outer margin on desktop */
          background: var(--surface-0);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          border-radius: var(--radius);
          padding: clamp(16px, 2.4vw, 36px);
          min-height: 80svh;
          display: flex;
          flex-direction: column;
        }

        /* ---------- Responsive: ≤ 1024px ---------- */
        @media (max-width: 1024px) {
          .container {
            display: block;
            padding: 0; /* remove side padding so content uses full width */
          }

          .mobile-header {
            position: sticky;
            top: 0;
            z-index: 60;
            display: flex;
            height: var(--header-h);
            align-items: center;
            justify-content: space-between;
            padding: 0 var(--mobile-gap);
            background: var(--surface-0);
            border-bottom: 1px solid var(--border-light);
          }

          .sidebar {
            position: fixed;
            inset: 0 auto 0 0; /* left side sheet */
            width: min(86vw, 320px);
            z-index: 70;
            translate: -100% 0;
            transition: translate .2s ease-out;
            box-shadow: var(--shadow-md, 0 6px 24px rgba(0,0,0,.18));
          }
          /* JS-free open state via :target */
          .sidebar:target { translate: 0 0; }

          .sidebar-inner {
            position: absolute;
            inset: 0;
            max-height: none;
            border-radius: 0;
            border-right: 1px solid var(--border-light);
            border-left: none;
          }

          .close-btn { display: inline-flex; position: absolute; top: 8px; right: 8px; z-index: 71; }

          .content {
            margin: 0;                 /* edge-to-edge container */
            border-radius: 0;          /* remove rounding to maximize space */
            border-left: 0;            /* no left/right borders to reclaim px */
            border-right: 0;
            max-width: none;           /* allow full viewport width */
            padding: clamp(12px, 3.5vw, 20px); /* small inner padding for readability */
            box-shadow: none;          /* minimal chrome on mobile */
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .sidebar { transition: none; }
        }
      `}</style>
    </div>
  )
}
