import SidebarNav from "./SidebarNav"
import { NavNode } from "./util"

type Props = {
  navTree: NavNode[]
  breadcrumbs: { href: string; label: string }[]
  children: React.ReactNode
}

export default function MdxSlugLayout({ navTree, breadcrumbs, children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        color: "var(--text-default)",
        fontFamily: "var(--font-body, Inter, sans-serif)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Left margin for wide screens */}
      {/* Sidebar nav */}
      <div style={{
        flex: "0 0 235px",
        maxWidth: 335,
        marginRight: 32,
        marginTop: 64,
        marginBottom: 32,
        background: "none"
      }}>
        <SidebarNav navTree={navTree} currentPath={breadcrumbs.slice(1).map(b => b.label.replace(/ /g, "-"))} />
      </div>
      {/* Main content */}
      <main
  style={{
    flex: "1 1 auto",
    maxWidth: "min(1200px, 100%)", // grow up to 1200px but not beyond viewport
    margin: "32px 0",
    background: "var(--surface-0)",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--border-light)",
    borderRadius: 10,
    padding: "2.2rem 2rem 2.7rem 2rem",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  }}
>
  {children}
</main>

      <div style={{ flex: 1, maxWidth: 260 }} >
        
      </div>
    </div>
  )
}
