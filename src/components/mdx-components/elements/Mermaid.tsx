// src/components/mdx-components/elements/Mermaid.tsx
'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import mermaid from 'mermaid'

type Props = { chart: string; className?: string }

/* ---- tokens ---- */
function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v?.trim() || fallback
}

/* ---- svg helpers (root-only edits; children untouched) ---- */
function normalizeSvgRoot(svg: string) {
  const m = svg.match(/<svg[^>]*>/i)
  if (!m) return svg
  let open = m[0]
  open = open.replace(/\swidth="[^"]*"/i, '')
             .replace(/\sheight="[^"]*"/i, '')
             .replace(/\spreserveAspectRatio="[^"]*"/i, '')
  if (!/preserveAspectRatio=/i.test(open)) {
    open = open.replace(/>$/, ' preserveAspectRatio="xMidYMid meet">')
  }
  return svg.replace(m[0], open)
}

function injectSvgStyles(svg: string) {
  const baseCSS = `
    svg { display:block; width:100%; height:auto; }
    text, .label { font-family: var(--font-body, Inter, system-ui, sans-serif); fill: var(--text-800); }
    .node rect, .node polygon, .node circle { fill: var(--surface-100); stroke: var(--border-light); }
    .cluster rect { fill: var(--surface-brand-50); stroke: var(--accent-main); }
    .edgePath path { stroke: var(--border-medium); }
    .marker { fill: var(--border-medium); stroke: var(--border-medium); }
    .edgeLabel, .flowchart-link { color: var(--text-700); }
  `.replace(/\s+/g, ' ')
  if (svg.toLowerCase().includes('<style')) {
    return svg.replace(/<style[^>]*>/i, (m) => `${m}${baseCSS}`)
  }
  return svg.replace(/<svg([^>]+)>/i, (_m, attrs) => `<svg${attrs}><style>${baseCSS}</style>`)
}

/* ---- component ---- */
export default function Mermaid({ chart, className }: Props) {
  const id = useId().replace(/[:]/g, '_')

  const [svg, setSvg] = useState<string>('')     // holds current diagram
  const [open, setOpen] = useState(false)

  // theme sync (use version string to force re-render paths)
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
  const themeVersion = useMemo(() => (isDark ? 'dark' : 'light'), [isDark])

  useEffect(() => {
    if (typeof window === 'undefined') return
  
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
  
    type LegacyMQL = MediaQueryList & {
      addListener?: (l: (e: MediaQueryListEvent) => void) => void
      removeListener?: (l: (e: MediaQueryListEvent) => void) => void
    }
    const legacy = mql as LegacyMQL
  
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
  
    if (typeof legacy.addListener === 'function') {
      legacy.addListener(onChange)
      return () => legacy.removeListener?.(onChange)
    }
  
    // No-op cleanup fallback
    return () => {}
  }, [])
  
  

  const themeVariables = useMemo(() => ({
    background: 'transparent',
    primaryColor: cssVar('--surface-0', '#ffffff'),
    primaryTextColor: cssVar('--text-800', '#1f2937'),
    primaryBorderColor: cssVar('--border-light', '#e5e7eb'),
    lineColor: cssVar('--border-medium', '#adb5bd'),
    tertiaryColor: cssVar('--surface-100', '#f9fafb'),
    noteBkgColor: cssVar('--surface-brand-50', '#fff8e1'),
    noteTextColor: cssVar('--text-800', '#1f2937'),
    fontFamily:
      'var(--font-body, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial)',
    signalColor: cssVar('--accent-main', '#f5a300'),
    edgeLabelBackground: cssVar('--surface-0', '#fff'),
  }), [isDark])
  

  // Always (re)initialize on theme change; no reset call.
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: isDark ? 'dark' : 'default',
      themeVariables,
    })
  }, [isDark, themeVariables])  

  // Render on inputs; use a unique key per theme to avoid internal cache reuse.
  // Keep previous SVG until new one is ready (prevents flicker/disappear).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const key = `m_${id}_${themeVersion}`
        const r = await mermaid.render(key, chart)
        if (cancelled) return
        const next = injectSvgStyles(normalizeSvgRoot(r.svg))
        setSvg(next)
      } catch (err) {
        if (!cancelled) {
          setSvg(
            `<pre style="color:var(--text-error);background:var(--error-bg);padding:.75rem;border-radius:.5rem;overflow:auto">Mermaid render error:\n${String(
              err
            )}</pre>`
          )
        }
      }
    })()
    return () => { cancelled = true }
  }, [chart, id, themeVersion])

  // lock background scroll while modal open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const downloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Inline preview: 100% width fill, centered, horizontal scroll allowed for huge diagrams */}
      <div
        className={className}
        style={{
          width: '100%',
          margin: '1rem 0',
          overflowX: 'auto',
          overflowY: 'visible',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? setOpen(true) : null)}
          title="Click to open fullscreen"
          style={{
            background: 'var(--surface-0)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-sm)',
            padding: 12,
            cursor: 'zoom-in',
            width: '100%',     // fill the content column
            maxWidth: '100%',

          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Fullscreen modal: height dominates (no vertical scroll), width may overflow horizontally */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onWheel={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'var(--overlay-bg)',
            display: 'flex',
            flexDirection: 'column',
          }}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        >
          {/* Top bar */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              paddingTop: 'calc(8px + env(safe-area-inset-top))',
              paddingLeft: 'calc(12px + env(safe-area-inset-left))',
              paddingRight: 'calc(12px + env(safe-area-inset-right))',
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--surface-50)',
            }}
          >
            <div style={{ color: 'var(--text-700)', fontWeight: 600 }}>Diagram</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={downloadSvg}
                style={{
                  padding: '6px 10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--surface-0)',
                  color: 'var(--text-700)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Download SVG
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--brand-200)',
                  color: 'var(--text-on-brand)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Stage */}
          <div
            style={{
              flex: '1 1 auto',
              width: '100vw',
              maxWidth: '100vw',
              height: '100%',
              overflowX: 'auto',   // horizontal scroll allowed
              overflowY: 'hidden', // no vertical scroll; height dominates
              background: 'var(--surface-0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setOpen(false)}
          >
            <div
              style={{ height: '100%', minWidth: '100%' }}
              dangerouslySetInnerHTML={{
                // In fullscreen, enforce: height=100%, width at least 100% (may overflow horizontally)
                __html: svg.replace(
                  /<style[^>]*>/i,
                  (m) => `${m}
                    svg { height:100% !important; width:auto !important; min-width:100% !important; }
                  `
                ),
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
