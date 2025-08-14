/** @jsxImportSource @emotion/react */
"use client"
import Link from "next/link"
import { css } from "@emotion/react"
import { useState, useMemo } from "react"
import { NavNode } from "./util"

type Props = {
  navTree: NavNode[]
  currentPath: string[]
}

const sidebarCss = css`
  position: sticky;
  top: 4rem;
  width: 300px;
  border-radius: 8px;
  background: var(--surface-50);
  border-left: 1px solid var(--border-light);
  min-height: calc(100vh - 112px);
  max-height: calc(100vh - 112px);
  padding: 0 0.7rem;
  font-size: 1.05rem;
  font-family: var(--font-body, Inter, sans-serif);
  overflow-y: auto;
`

const ulCss = (depth: number) => css`
  list-style: none;
  margin: 0;
  padding: ${depth === 0 ? "1.2rem 0.7rem 1.2rem 0.7rem" : "0 0 0 1.10rem"};
`

const linkCss = (active: boolean) => css`
  color: ${active ? "var(--text-900)" : "var(--text-700)"};
  text-decoration: ${active ? "underline" : "none"};
  font-weight: ${active ? 700 : 500};
  padding: 0.13em 0.3em;
  border-radius: 5px;
  background: ${active ? "var(--surface-selected)" : "none"};
  transition: background 0.13s;
  cursor: pointer;
  display: block;
  &:hover {
    color: var(--text-interactive);
    background: var(--surface-hover);
    text-decoration: underline;
  }
`

const caretCss = (open: boolean) => css`
  font-size: 0.97em;
  margin-right: 0.34em;
  color: var(--text-muted);
  user-select: none;
  transition: transform 0.13s;
  transform: rotate(${open ? 90 : 0}deg);
  cursor: pointer;
`

// Helper to filter out all index nodes
function filterIndex(nodes: NavNode[] = []): NavNode[] {
  return nodes.filter(n => n.label !== "index").map(n =>
    n.children
      ? { ...n, children: filterIndex(n.children) }
      : n
  )
}

function DropdownNode({
  node,
  nodePath,
  currentPath,
  defaultOpen,
  depth
}: {
  node: NavNode
  nodePath: string[]
  currentPath: string[]
  defaultOpen: boolean
  depth: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isActive = currentPath.join("/") === nodePath.join("/")
  const hasChildren = node.children && node.children.length > 0

  return (
    <li css={css`margin-bottom: 0.17em;`}>
<div css={css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`}>
  <Link href={node.href} css={linkCss(isActive)}>
    {node.label}
  </Link>
  {hasChildren && (
    <span
      onClick={() => setOpen(v => !v)}
      tabIndex={0}
      role="button"
      css={caretCss(open)}
      aria-label={open ? "Collapse" : "Expand"}
      aria-expanded={open}
    >▶</span>
  )}
</div>

      {hasChildren && open && (
        <ul css={ulCss(depth + 1)}>
          {node.children!.map(child => (
            child.label !== "index" && (
              child.children && child.children.length > 0
                ? <DropdownNode
                    key={child.href}
                    node={child}
                    nodePath={[...nodePath, child.label]}
                    currentPath={currentPath}
                    defaultOpen={currentPath.slice(0, nodePath.length + 1).join("/") === [...nodePath, child.label].join("/")}
                    depth={depth + 1}
                  />
                : <li key={child.href} css={css`margin-bottom: 0.17em;`}>
                    <Link href={child.href} css={linkCss(currentPath.join("/") === [...nodePath, child.label].join("/"))}>
                      {child.label}
                    </Link>
                  </li>
            )
          ))}
        </ul>
      )}
    </li>
  )
}

function renderTree(nodes: NavNode[], currentPath: string[], depth = 0, parentPath: string[] = []) {
  // First level: always expanded, no dropdowns, show children recursively
  if (depth === 0) {
    return (
      <ul css={ulCss(depth)}>
        {nodes.map(node => {
          if (node.label === "index") return null
          const nodePath = [...parentPath, node.label]
          const isActive = currentPath.join("/") === nodePath.join("/")
          return (
            <li key={node.href} css={css`margin-bottom: 0.17em;`}>
              <Link href={node.href} css={linkCss(isActive)}>
                <b>{node.label}</b>
              </Link>
              {node.children && (
                <ul css={ulCss(depth + 1)}>
                  {node.children.filter(child => child.label !== "index").map(child =>
                    child.children && child.children.length > 0
                      ? <DropdownNode
                          key={child.href}
                          node={child}
                          nodePath={[...nodePath, child.label]}
                          currentPath={currentPath}
                          defaultOpen={currentPath.slice(0, nodePath.length + 1).join("/") === [...nodePath, child.label].join("/")}
                          depth={depth + 1}
                        />
                      : <li key={child.href} css={css`margin-bottom: 0.17em;`}>
                          <Link href={child.href} css={linkCss(currentPath.join("/") === [...nodePath, child.label].join("/"))}>
                            {child.label}
                          </Link>
                        </li>
                  )}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    )
  }
}

export default function SidebarNav({ navTree, currentPath }: Props) {
  // Remove all index nodes before rendering
  const cleanTree = useMemo(() => filterIndex(navTree), [navTree])
  return (
    <aside css={sidebarCss}>
<Link
  href="/docs/"
  css={css`
    display: block;
    font-family: var(--font-brand, Inter, sans-serif);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 0.01em;
    color: var(--text-900);
    text-decoration: none;
    margin: 1.3rem 0 0rem 0.1rem;
    padding: 0.14em 0.35em;
    border-radius: 6px;
    transition: background 0.13s;
    &:hover,
    &:focus {
      color: var(--text-interactive);
      background: var(--surface-hover);
      text-decoration: underline;
    }
  `}
>
  Docs
</Link>


      {renderTree(cleanTree, currentPath)}
    </aside>
  )
}
