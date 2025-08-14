# Design System Reference

This document outlines all design variables available in our system. Use this as a reference guide when implementing UI components.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Text Styling](#text-styling)
- [Responsive Design](#responsive-design)

## Colors

### Brand Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--brand-100` | #F9FAF7 | #252c28 | Lightest brand shade, backgrounds |
| `--brand-200` | #F5A300 | #e8b544 | Primary accent color, call to action |
| `--brand-300` | #7C8463 | #a1a687 | Secondary brand color |
| `--brand-400` | #5C6066 | #969b93 | Subtle brand elements |
| `--brand-500` | #343A40 | #878c94 | Section headers, strong elements |
| `--brand-600` | #2D3C33 | #F9FAF7 | Main text color, strong contrast |

### Neutral Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--neutral-000` | #ffffff | #161a19 | Pure white/black, base surfaces |
| `--neutral-100` | #F9FAF7 | #232a26 | Background, subtle off-white/black |
| `--neutral-200` | #E9ECEF | #2D3C33 | Subtle containers, dividers |
| `--neutral-300` | #DEE2E6 | #343A40 | Borders, separators, hover states |
| `--neutral-400` | #CED4DA | #444A51 | Disabled elements, secondary borders |
| `--neutral-500` | #ADB5BD | #5C6066 | Placeholder text, disabled text |
| `--neutral-600` | #868E96 | #7C8463 | Muted text, secondary content |
| `--neutral-700` | #495057 | #b3b8ae | Body text in dark mode |
| `--neutral-800` | #343A40 | #e0e2df | Headings in dark mode |
| `--neutral-900` | #2D3C33 | #F9FAF7 | Highest contrast text in dark mode |

### Surface Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--surface-page` | `var(--neutral-100)` | Main page background |
| `--surface-card` | `var(--neutral-000)` | Card and container backgrounds |
| `--surface-variant` | `var(--brand-100)` | Alternative surface for variety |
| `--surface-elevated` | `var(--neutral-200)` | Elevated components (modals, popovers) |
| `--surface-hover` | `var(--neutral-300)` | Hover state backgrounds |
| `--surface-active` | `var(--neutral-400)` | Active/pressed state backgrounds |
| `--surface-disabled` | `var(--neutral-300)` | Disabled component backgrounds |

### Text Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `var(--brand-600)` | Main text color |
| `--text-secondary` | `var(--brand-400)` | Secondary text, subtitles |
| `--text-muted` | `var(--neutral-600)` | Less prominent text, captions |
| `--text-inverse` | `var(--neutral-000)` | Text on dark backgrounds |
| `--text-on-brand` | `var(--neutral-000)` | Text on brand-colored backgrounds |
| `--text-disabled` | `var(--neutral-500)` | Disabled text |

### Accent & Interactive Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--accent-main` | `var(--brand-200)` | Primary accent/highlight color |
| `--accent-hover` | #e29300 | Hover state for accent elements |
| `--accent-active` | #b87800 | Active state for accent elements |
| `--interactive-default` | `var(--brand-200)` | Default state for interactive elements |
| `--interactive-hover` | `var(--brand-300)` | Hover state for interactive elements |
| `--interactive-active` | `var(--brand-400)` | Active state for interactive elements |
| `--interactive-focus` | `var(--accent-main)` | Focus state indicator |

### Semantic Status Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--success-main` | #1B7C38 | #57e389 | Success messages, positive indicators |
| `--success-bg` | #d3e7d9 | #173b27 | Success message backgrounds |
| `--warning-main` | #F5A300 | #f5c573 | Warning messages, caution indicators |
| `--warning-bg` | #fff4d1 | #3d2f08 | Warning message backgrounds |
| `--error-main` | #C1121F | #ff6565 | Error messages, negative indicators |
| `--error-bg` | #ffd6d6 | #412021 | Error message backgrounds |
| `--info-main` | #005ca3 | #69b8f4 | Informational messages |
| `--info-bg` | #e0f0ff | #143a53 | Info message backgrounds |

### Border Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--border-light` | #E9ECEF | Subtle borders, dividers |
| `--border-medium` | #ADB5BD | Standard borders |
| `--border-dark` | #343A40 | Emphasized borders |
| `--border-focus` | `var(--accent-main)` | Focus state borders |

### Shadow Effects

| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.04) | Subtle elevation |
| `--shadow-md` | 0 4px 8px rgba(0,0,0,0.10) | Medium elevation |
| `--shadow-lg` | 0 8px 16px rgba(0,0,0,0.18) | High elevation |
| `--focus-ring` | 0 0 0 3px rgba(245, 163, 0, 0.35) | Focus state indicator |
| `--overlay-bg` | rgba(44, 44, 44, 0.65) | Modal/dialog overlays |

### Gradient Effects

| Variable | Value | Usage |
|----------|-------|-------|
| `--gradient-brand` | linear-gradient(90deg, var(--brand-200), var(--brand-300)) | Brand gradient for emphasis |
| `--gradient-accent` | linear-gradient(90deg, var(--accent-main), var(--accent-hover)) | Accent gradient for CTAs |

## Typography

### Font Families

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-brand` | 'Eurostile', sans-serif | Brand identity, headings |
| `--font-brand-condensed` | 'Eurostile Condensed', sans-serif | Space-efficient brand text |
| `--font-brand-extended` | 'Eurostile Extended', sans-serif | Expanded brand text, hero headers |
| `--font-body` | 'Inter', sans-serif | Main body text |
| `--font-accent` | 'JetBrains Mono', monospace | Code, technical content |
| `--font-accent-nl` | 'JetBrains Mono NL', monospace | Code without ligatures |

### Font Sizes

| Variable | Value | Pixels | Usage |
|----------|-------|--------|-------|
| `--text-xs` | 0.75rem | 12px | Fine print, captions |
| `--text-sm` | 0.875rem | 14px | Small text, secondary info |
| `--text-base` | 1rem | 16px | Body text, default size |
| `--text-lg` | 1.125rem | 18px | Slightly larger body text |
| `--text-xl` | 1.25rem | 20px | Lead paragraphs, small headings |
| `--text-2xl` | 1.5rem | 24px | Subheadings, h4-h6 |
| `--text-3xl` | 1.875rem | 30px | Medium headings, h3 |
| `--text-4xl` | 2.25rem | 36px | Large headings, h2 |
| `--text-5xl` | 3rem | 48px | Extra large headings, h1 |
| `--text-6xl` | 3.75rem | 60px | Display headings |
| `--text-7xl` | 4.5rem | 72px | Hero headings |
| `--text-8xl` | 6rem | 96px | Large display headings |
| `--text-9xl` | 8rem | 128px | Extra large display headings |

### Font Weights

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-thin` | 100 | Extremely light text |
| `--font-extralight` | 200 | Very light text |
| `--font-light` | 300 | Light text |
| `--font-normal` | 400 | Regular text (default) |
| `--font-medium` | 500 | Medium emphasis |
| `--font-semibold` | 600 | Semi-bold emphasis |
| `--font-bold` | 700 | Bold text |
| `--font-extrabold` | 800 | Extra bold text |
| `--font-black` | 900 | Heaviest weight |

### Line Heights

| Variable | Value | Usage |
|----------|-------|-------|
| `--leading-none` | 1 | No line spacing (headings) |
| `--leading-tight` | 1.25 | Tight line spacing (compact headings) |
| `--leading-snug` | 1.375 | Reduced line spacing |
| `--leading-normal` | 1.5 | Default line spacing |
| `--leading-relaxed` | 1.625 | Increased line spacing |
| `--leading-loose` | 2 | Double line spacing |

### Letter Spacing

| Variable | Value | Usage |
|----------|-------|-------|
| `--tracking-tighter` | -0.05em | Very tight letter spacing |
| `--tracking-tight` | -0.025em | Tight letter spacing |
| `--tracking-normal` | 0em | Default letter spacing |
| `--tracking-wide` | 0.025em | Wide letter spacing |
| `--tracking-wider` | 0.05em | Wider letter spacing |
| `--tracking-widest` | 0.1em | Widest letter spacing |

## Text Styling

### Text Depth Effects

| Variable | Value | Usage |
|----------|-------|-------|
| `--text-depth-shadow-sm` | 0.5px 0.5px 0px rgba(0,0,0,0.1) | Subtle text shadow |
| `--text-depth-shadow-md` | 1px 1px 1px rgba(0,0,0,0.15) | Medium text shadow |
| `--text-depth-shadow-lg` | 2px 2px 2px rgba(0,0,0,0.2) | Pronounced text shadow |
| `--text-depth-inset` | inset 1px 1px 1px rgba(0,0,0,0.2) | Inset/pressed text effect |
| `--text-depth-emboss` | -1px -1px 0 rgba(255,255,255,0.2), 1px 1px 0 rgba(0,0,0,0.1) | Embossed text effect |

### Text Container Widths

| Class | Value | Usage |
|-------|-------|-------|
| `.text-container-xs` | max-width: 20ch | Very narrow text container |
| `.text-container-sm` | max-width: 45ch | Narrow text container |
| `.text-container-md` | max-width: 65ch | Optimal reading width |
| `.text-container-lg` | max-width: 75ch | Wide text container |
| `.text-container-xl` | max-width: 85ch | Very wide text container |

### Text Manipulation

| Class | Effect | Usage |
|-------|--------|-------|
| `.truncate` | Truncates with ellipsis | Single-line truncation |
| `.line-clamp-2` | Clamps to 2 lines | Multi-line truncation (2 lines) |
| `.line-clamp-3` | Clamps to 3 lines | Multi-line truncation (3 lines) |
| `.break-normal` | Normal word breaks | Default word wrapping |
| `.break-words` | Break on words | Wrap long words |
| `.break-all` | Break anywhere | Break at any character |

### Text Decoration & Transformation

| Class | Effect | Usage |
|-------|--------|-------|
| `.text-uppercase` | All caps | Transform text to uppercase |
| `.text-lowercase` | All lowercase | Transform text to lowercase |
| `.text-capitalize` | Title Case | Capitalize first letter of each word |
| `.text-underline` | Underlined | Add underline to text |
| `.text-line-through` | Strikethrough | Add line through text |
| `.text-italic` | Italicized | Make text italic |

### Special Text Effects

| Class | Effect | Usage |
|-------|--------|-------|
| `.text-gradient-brand` | Brand gradient text | Apply brand gradient to text |
| `.text-gradient-accent` | Accent gradient text | Apply accent gradient to text |
| `.text-outline-sm` | Thin text outline | Thin outlined text (0.5px) |
| `.text-outline-md` | Medium text outline | Medium outlined text (1px) |
| `.text-outline-lg` | Thick text outline | Thick outlined text (2px) |
| `.text-depth-sm` | Subtle shadow | Apply subtle text shadow |
| `.text-depth-md` | Medium shadow | Apply medium text shadow |
| `.text-depth-lg` | Large shadow | Apply large text shadow |
| `.text-depth-inset` | Inset effect | Apply inset text effect |
| `.text-depth-emboss` | Embossed effect | Apply embossed text effect |

## Responsive Design

### Responsive Typography

These classes automatically adjust text size based on viewport width:

| Class | Size Range | Usage |
|-------|------------|-------|
| `.text-responsive-sm` | 0.875rem to 1rem | Small responsive text |
| `.text-responsive-md` | 1rem to 1.25rem | Medium responsive text |
| `.text-responsive-lg` | 1.125rem to 1.875rem | Large responsive text |
| `.text-responsive-xl` | 1.25rem to 3rem | Extra large responsive text |
| `.text-responsive-2xl` | 1.5rem to 4.5rem | Double extra large responsive text |

### Responsive Breakpoints

Typography automatically adjusts at these breakpoints:

| Breakpoint | Screen Width | Effect |
|------------|-------------|--------|
| Tablet | 768px | Reduced heading sizes |
| Mobile | 480px | Further reduced heading sizes |

At tablet breakpoint (max-width: 768px):
- `h1`: 36px (was 48px)
- `h2`: 30px (was 36px)
- `h3`: 24px (was 30px)
- `h4`: 20px (was 24px)
- `.heading-hero`: 60px (was 72px)
- `.lead`: 18px (was 20px)

At mobile breakpoint (max-width: 480px):
- `h1`: 30px
- `h2`: 24px
- `h3`: 20px
- `h4`: 18px
- `.heading-hero`: 48px
