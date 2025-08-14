import type { ComponentType } from "react";
import { modules, paths as manifestPaths, type MdxModule } from "@/mdx-manifest";

function normalizeSlug(slugPath: string): string {
  return slugPath.replace(/\/$/, "");
}

const exts = ["mdx", "md"] as const;

export function getMdxBySlug(
  slugPath: string
): ComponentType<Record<string, unknown>> | null {
  const s = normalizeSlug(slugPath);
  const candidates = [
    `${s}`,
    ...exts.map((e) => `${s}.${e}`),
    `${s}/index`,
    ...exts.map((e) => `${s}/index.${e}`),
  ];
  for (const key of candidates) {
    const mod: MdxModule | undefined = modules[key];
    if (mod?.default) return mod.default;
  }
  return null;
}

export function hasIndexMdx(slugPath: string): boolean {
  const s = normalizeSlug(slugPath);
  return Boolean(
    modules[`${s}/index`] || modules[`${s}/index.mdx`] || modules[`${s}/index.md`]
  );
}

export function listDirectoryMdxSlugs(slugPath: string): string[] {
  const s = normalizeSlug(slugPath);
  const prefix = s ? `${s}/` : "";
  const baseLen = prefix.length;

  const files = Object.keys(modules)
    // only extension-bearing keys participate here
    .filter((k) => /\.(md|mdx)$/i.test(k))
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(baseLen))
    .filter((rest) => rest.length > 0 && !rest.includes("/"))
    .filter((rest) => !/^index\.(md|mdx)$/i.test(rest))
    .map((rest) => (prefix + rest).replace(/\.(md|mdx)$/i, ""));

  return Array.from(new Set(files));
}

type DirLeaf = true;
export type DirTree = { [name: string]: DirTree | DirLeaf };

/**
 * Builds a shallow-to-deep directory tree (excluding "index" leaves).
 * Returns an object where a leaf is `true` and a branch is another object.
 */
export function listDirectoryTree(slugPath: string): DirTree {
  const s = normalizeSlug(slugPath);
  const prefix = s ? `${s}/` : "";

  const files = manifestPaths
    .map((p) => p.replace(/\.(md|mdx)$/i, "")) // strip extension
    .filter((p) => p.startsWith(prefix));

  const tree: DirTree = {};
  for (const full of files) {
    const rel = full.slice(prefix.length);
    const parts = rel.split("/");
    let node: DirTree = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (node[seg] === true) {
        // previously marked as leaf; convert to branch
        node[seg] = {};
      }
      if (!node[seg]) node[seg] = {};
      node = node[seg] as DirTree;
    }
    const leaf = parts[parts.length - 1];
    if (leaf !== "index") node[leaf] = true;
  }
  return tree;
}

export const allContentPaths: readonly string[] = manifestPaths;
