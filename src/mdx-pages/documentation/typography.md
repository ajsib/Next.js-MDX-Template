**Generalized Three-Font Typography System (Reusable for Any Project)**

---

## **1. Font Roles**

* **Font 1:** Brand/Headings (authority, boldness)
* **Font 2:** Body/UI (readability, clarity)
* **Font 3:** Accent/Technical (monospace or distinct, for code/labels/data/UI special use)

---

## **2. CSS Variable Naming Convention**

```css
:root {
  --font-brand: 'Font1-Brand', fallback1, fallback2;
  --font-body: 'Font2-Body', fallback1, fallback2;
  --font-accent: 'Font3-Accent', fallback1, fallback2;
}
```

---

## **3. Mapping to HTML Elements**

| HTML Element      | Font Variable | Weight/Style Guidance        | Intended Use                                      |
| ----------------- | ------------- | ---------------------------- | ------------------------------------------------- |
| h1                | --font-brand  | Heavy/Bold, Tight Tracking   | Main headline, logo, page title                   |
| h2, h3, h4        | --font-brand  | Bold/SemiBold                | Section titles, headers, navigation               |
| nav, button, .cta | --font-brand  | Bold/SemiBold                | Main UI, call-to-action, navigation, tabs         |
| body, p, li       | --font-body   | Regular/Medium, Open Spacing | Paragraphs, lists, all standard content           |
| small, caption    | --font-body   | Light/Regular, Smaller Size  | Footnotes, UI helpers, subtle elements            |
| code, pre, badge  | --font-accent | Regular/SemiBold, Mono       | Inline code, meta, badges, labels, special blocks |
| blockquote, aside | --font-accent | Regular                      | Pull quotes, system notes, technical emphasis     |
| kpi, stat, metric | --font-accent | Bold                         | Data, numbers, technical features                 |

---

## **4. General CSS Template**

```css
:root {
  --font-brand: 'Font1-Brand', Arial, sans-serif;
  --font-body: 'Font2-Body', Helvetica, sans-serif;
  --font-accent: 'Font3-Accent', 'Consolas', monospace;
}

h1, h2, h3, h4, .brand, .logo {
  font-family: var(--font-brand);
  font-weight: 700;
  letter-spacing: -0.01em;
}

nav, .button, .cta {
  font-family: var(--font-brand);
  font-weight: 600;
  text-transform: uppercase;
}

body, p, li {
  font-family: var(--font-body);
  font-weight: 400;
}

small, .caption, .footnote {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 0.85em;
}

code, pre, .meta, .badge, .stat, .config, .label, .kpi {
  font-family: var(--font-accent);
  font-weight: 600;
  background: #f6f6f6;
  color: #222;
  border-radius: 2px;
  padding: 0 0.25em;
}
```

---

## **5. Usage Guidelines**

* **Headings/navigation**: Always use `--font-brand`
* **Paragraph/UI**: Always use `--font-body`
* **Special/tech/accent**: Always use `--font-accent`
* **Mix only for emphasis or accessibility; keep each block to a single font type**
* **All fallback stacks defined in variable for easy, project-wide font swaps**

---

**Result:**
One universal CSS/font structure, instantly swappable to any three-font combination for consistent brand, UI, and technical differentiation in any project.
