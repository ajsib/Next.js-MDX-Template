// ./src/components/mdx-components/elements/Table.tsx
import React from "react";

export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        margin: "32px 0",
        fontSize: "1rem",
        background: "var(--surface-0)",
        color: "var(--text-default)",
        border: "1px solid var(--border-light)",
        borderRadius: 8,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden"
      }}
      {...props}
    />
  );
}

export function Thead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      style={{
        background: "var(--surface-brand-50)",
      }}
      {...props}
    />
  );
}

export function Tbody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr(props: React.HTMLAttributes<HTMLTableRowElement>) {
  // Treat row as header iff all element children are <th> or have `as="th"`.
  const isHeaderRow =
    !!props.children &&
    React.Children.toArray(props.children).every((child) => {
      if (!React.isValidElement(child)) return true; // ignore text/null/etc.
      const asProp = (child.props as { as?: string } | undefined)?.as;
      const t = child.type;
      const isTh =
        (typeof t === "string" && t.toLowerCase() === "th") || asProp === "th";
      return isTh;
    });

  return (
    <tr
      style={
        isHeaderRow
          ? undefined
          : {
              transition: "background 0.12s",
              cursor: "default",
            }
      }
      {...props}
    />
  );
}

export function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      style={{
        padding: "14px 16px",
        borderBottom: "2px solid var(--border-medium)",
        borderRight: "1px solid var(--border-light)",
        fontWeight: 700,
        textAlign: "left",
        background: "var(--surface-brand-100)",
        color: "var(--text-brand-contrast)",
        fontSize: "1rem",
        letterSpacing: 0.01,
        verticalAlign: "middle",
        whiteSpace: "nowrap"
      }}
      {...props}
    />
  );
}

export function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-light)",
        borderRight: "1px solid var(--border-light)",
        background: "var(--surface-0)",
        color: "var(--text-default)",
        fontSize: "0.97rem",
        verticalAlign: "middle",
      }}
      {...props}
    />
  );
}
