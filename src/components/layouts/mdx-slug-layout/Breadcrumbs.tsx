"use client";
import Link from "next/link";

type Crumb = { href: string; label: string };
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" style={{
      fontSize: "0.93rem",
      padding: "1.5rem 0 1rem 0",
      fontFamily: "var(--font-body, Inter, sans-serif)",
      color: "var(--text-muted)"
    }}>
      {crumbs.map((c, i) =>
        <span key={c.href}>
          {i !== 0 && (
            <span aria-hidden style={{
              margin: "0 0.3em", color: "var(--text-200)"
            }}>/</span>
          )}
          <Link href={c.href} style={{
            color: i === crumbs.length - 1
              ? "var(--text-900)"
              : "var(--text-interactive)",
            textDecoration: i === crumbs.length - 1 ? "none" : "underline"
          }}>
            {c.label}
          </Link>
        </span>
      )}
    </nav>
  );
}
