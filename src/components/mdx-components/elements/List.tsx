// ./src/components/mdx-components/elements/List.tsx

import React from "react";

// ----
// List Root Components
// ----

interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
}

export const Unordered: React.FC<ListProps> = ({ children, ...props }) => (
  <ul
    style={{
      paddingLeft: "2rem",
      margin: "1.1em 0",
      listStyle: "disc outside",
      color: "var(--text-default)",
    }}
    {...props}
  >
    {children}
    <style>
      {`
        ul > li::marker {
          color: var(--brand-200);
          font-weight: bold;
          font-family: var(--font-brand), inherit;
        }
      `}
    </style>
  </ul>
);

export const Ordered: React.FC<ListProps> = ({ children, ...props }) => (
  <ol
    style={{
      paddingLeft: "2rem",
      margin: "1.1em 0",
      listStyle: "decimal outside",
      color: "var(--text-default)",
    }}
    {...props}
  >
    {children}
    <style>
      {`
        ol > li::marker {
          color: var(--brand-200);
          font-weight: bold;
          font-family: var(--font-brand), inherit;
        }
      `}
    </style>
  </ol>
);

export const List = { Unordered, Ordered };

// ----
// List Item Component, includes markdown task support
// ----

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

// Helper: Check if children is a markdown task item
function renderTaskItem(child: React.ReactNode) {
  if (typeof child === "string") {
    const unchecked = child.match(/^\s*\[ \]\s(.*)$/i);
    if (unchecked) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5em" }}>
          <span
            aria-hidden
            style={{
              width: 18,
              height: 18,
              display: "inline-block",
              border: "2px solid var(--border-medium)",
              borderRadius: 4,
              background: "var(--surface-0)",
              marginRight: 8,
              flexShrink: 0,
            }}
          />
          <span>{unchecked[1]}</span>
        </span>
      );
    }
    const checked = child.match(/^\s*\[x\]\s(.*)$/i);
    if (checked) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5em" }}>
          <span
            aria-hidden
            style={{
              width: 18,
              height: 18,
              display: "inline-block",
              border: "2px solid var(--accent-main)",
              borderRadius: 4,
              background: "var(--accent-main)",
              marginRight: 8,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              width={13}
              height={13}
              style={{
                display: "block",
                position: "absolute",
                left: 1.5,
                top: 1.5,
                fill: "none",
                stroke: "var(--text-on-brand)",
                strokeWidth: 2.1,
              }}
            >
              <polyline points="2.5,8.5 6.5,12 13.5,4.5" />
            </svg>
          </span>
          <span style={{ textDecoration: "line-through", color: "var(--text-muted)" }}>
            {checked[1]}
          </span>
        </span>
      );
    }
  }
  return child;
}

export const ListItem: React.FC<ListItemProps> = ({ children, ...props }) => {
  if (Array.isArray(children)) {
    const processed = children.map((child, idx) =>
      idx === 0 && typeof child === "string" ? renderTaskItem(child) : child
    );
    return (
      <li
        style={{
          marginBottom: "0.55em",
          fontSize: "1rem",
          color: "var(--text-default)",
        }}
        {...props}
      >
        {processed}
      </li>
    );
  }
  return (
    <li
      style={{
        marginBottom: "0.65rem",
        color: "var(--text-default)",
      }}
      {...props}
    >
      {renderTaskItem(children)}
    </li>
  );
};
