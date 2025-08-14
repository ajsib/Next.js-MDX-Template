// src/components/layouts/mdx-slug-layout/util.ts

export type NavNode = {
  label: string
  href: string
  children?: NavNode[]
}

function normalizePath(p: string) {
  let s = p.replace(/^\.\//, "").replace(/\.(md|mdx)$/i, "")
  s = s.replace(/\/index$/i, "")
  return s
}

// Accept ReadonlyArray so you can pass `readonly string[]`
export function buildNavTree(paths: ReadonlyArray<string>): NavNode[] {
  const root: NavNode[] = []

  for (const raw of paths) {
    const clean = normalizePath(raw)
    if (!clean) continue

    const parts = clean.split("/")
    let curr = root
    const hrefParts: string[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      hrefParts.push(part)

      let node = curr.find((n) => n.label === part)
      if (!node) {
        node = { label: part, href: `/docs/${hrefParts.join("/")}`, children: [] }
        curr.push(node)
      }

      const isLeaf = i === parts.length - 1
      if (isLeaf) {
        if (node.children && node.children.length === 0) delete node.children
      } else {
        if (!node.children) node.children = []
        curr = node.children
      }
    }
  }

  return root
}

export function getBreadcrumbs(slugArray: string[]): { href: string; label: string }[] {
  let href = "/a"
  return [
    { href, label: "Articles" },
    ...slugArray.map((seg) => {
      href += "/" + seg
      return { href, label: seg }
    })
  ]
}
