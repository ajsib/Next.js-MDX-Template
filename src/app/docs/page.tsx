// src/app/docs/page.tsx
import {
  getMdxBySlug,
  hasIndexMdx,
  listDirectoryTree,
  allContentPaths
} from "@/lib/mdx"
import MdxSlugLayout from "@/components/layouts/mdx-slug-layout"
import { buildNavTree, getBreadcrumbs } from "@/components/layouts/mdx-slug-layout/util"
import React from "react"

// A directory tree is a nested object: keys are segment names; leaves are `true`
type DirTree = { [segment: string]: DirTree | true }

const navTree = buildNavTree(allContentPaths)

function DirectoryTreeList(
  { tree, baseSlug = "" }: { tree: DirTree | null | undefined; baseSlug?: string }
) {
  if (!tree) return null
  return (
    <ul style={{ listStyle: "none", margin: 0, paddingLeft: 0 }}>
      {Object.entries(tree).map(([key, value]) => {
        if (key === "index") return null
        const fullSlug = baseSlug ? `${baseSlug}/${key}` : key
        const isDir = typeof value === "object"
        return (
          <li key={fullSlug} style={{ margin: "0.35em 0", padding: 0 }}>
            {isDir ? (
              <a
                href={`/docs/${fullSlug}`}
                style={{
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  background: "none",
                  borderRadius: 5,
                  padding: "0.16em 0.32em",
                  transition: "background 0.14s",
                  display: "inline-block"
                }}
              >
                {key}
              </a>
            ) : (
              <a
                href={`/docs/${fullSlug}`}
                style={{
                  color: "var(--text-interactive)",
                  fontWeight: 500,
                  textDecoration: "none",
                  borderRadius: 5,
                  padding: "0.12em 0.25em",
                  background: "none",
                  transition: "background 0.12s"
                }}
              >
                {key}
              </a>
            )}
            {isDir && (
              <div style={{ marginLeft: 17, marginTop: 2 }}>
                <DirectoryTreeList tree={value as DirTree} baseSlug={fullSlug} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function DirectoryListing({ dirSlug }: { dirSlug: string }) {
  const tree = listDirectoryTree(dirSlug) as DirTree
  const label = dirSlug ? dirSlug.split("/").pop() ?? "" : "Documentation"
  return (
    <div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "2.1rem",
          color: "var(--text-900)",
          letterSpacing: "-0.5px",
          fontFamily: "var(--font-brand)",
          margin: "0.7em 0 0.45em 0"
        }}
      >
        {label}
      </h1>
      <div
        style={{
          fontSize: "1.07rem",
          color: "var(--text-muted)",
          marginBottom: "2.5vh"
        }}
      >
        No overview document. Select a page or folder below:
      </div>
      <DirectoryTreeList tree={tree} baseSlug={dirSlug} />
    </div>
  )
}

export default function Page() {
  const slugPath = ""
  const MDXComponent = getMdxBySlug(slugPath)
  const breadcrumbs = getBreadcrumbs([])

  if (hasIndexMdx(slugPath)) {
    if (!MDXComponent) return null
    return (
      <MdxSlugLayout navTree={navTree} breadcrumbs={breadcrumbs}>
        <MDXComponent />
      </MdxSlugLayout>
    )
  }

  return (
    <MdxSlugLayout navTree={navTree} breadcrumbs={breadcrumbs}>
      <DirectoryListing dirSlug={slugPath} />
    </MdxSlugLayout>
  )
}
