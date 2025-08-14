import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MDX_DIR = path.join(ROOT, "src", "mdx-pages");
const OUT = path.join(ROOT, "src", "mdx-manifest.ts");

const toSlug = (fp) =>
  fp.replace(/\.(md|mdx)$/i, "").replace(/\/index$/i, "") || "";

async function main() {
  if (!fs.existsSync(MDX_DIR)) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(
      OUT,
      `/* AUTO-GENERATED. DO NOT EDIT. */
import type { ComponentType } from "react";

export type MdxComponent = ComponentType<Record<string, unknown>>;
export type MdxModule = { default: MdxComponent };

export const paths: string[] = [];
export const modules: Record<string, MdxModule> = {};
`,
      "utf8"
    );
    return;
  }

  const entries = await fg(["**/*.md", "**/*.mdx"], { cwd: MDX_DIR, dot: false });
  const norm = entries.map((e) => e.replace(/\\/g, "/"));

  const imports = [];
  const recordLines = new Set(); // avoid duplicates
  const pathsArr = [...norm];

  norm.forEach((rel, i) => {
    const varName = `M${i}`;
    const importPath = `@/mdx-pages/${rel}`; // alias @ -> src
    const slug = toSlug(rel);
    const explicit = rel.replace(/\.(md|mdx)$/i, "");

    imports.push(`import ${varName} from "${importPath}";`);

    const keys = new Set([
      rel,        // "a/b.md"
      explicit,   // "a/b" or "a/index"
      slug,       // "a/b" or "a"
    ]);
    if (explicit.endsWith("/index")) {
      keys.add(`${slug}/index`); // "a/index"
    }

    keys.forEach((k) => {
      if (!k) return;
      recordLines.add(`  ${JSON.stringify(k)}: { default: ${varName} },`);
    });
  });

  const file = `/* AUTO-GENERATED. DO NOT EDIT. */
import type { ComponentType } from "react";
${imports.join("\n")}

export type MdxComponent = ComponentType<Record<string, unknown>>;
export type MdxModule = { default: MdxComponent };

export const paths: string[] = ${JSON.stringify(pathsArr, null, 2)};

export const modules: Record<string, MdxModule> = {
${[...recordLines].join("\n")}
};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, file, "utf8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
