// src/components/mdx-components/elements/CodeBlock.tsx
'use client'

import React, { useState, ReactNode, ReactElement } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Mermaid from '../Mermaid'
import './syntax-highlight.css'

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: ReactNode
  language?: string
  maxHeight?: number | string
}

/** ---------- Prism theme (uses your CSS vars) ---------- */
type HighlighterStyle = Record<string, React.CSSProperties>
const vsCodeAgnostic: HighlighterStyle = {
  'code[class*="language-"]': {
    color: 'var(--syntax-fg)',
    background: 'none',
    fontFamily:
      'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '1em',
    textShadow: 'none',
    lineHeight: '1.6',
    tabSize: 4
  },
  'pre[class*="language-"]': {
    color: 'var(--syntax-fg)',
    background: 'none',
    fontFamily:
      'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '1em',
    textShadow: 'none',
    margin: 0,
    padding: 0,
    overflow: 'auto',
    lineHeight: '1.6'
  },
  comment: { color: 'var(--syntax-comment)', fontStyle: 'italic' },
  prolog: { color: 'var(--syntax-prolog)' },
  doctype: { color: 'var(--syntax-doctype)' },
  cdata: { color: 'var(--syntax-cdata)' },
  punctuation: { color: 'var(--syntax-punctuation)' },
  namespace: { opacity: 0.7 },
  property: { color: 'var(--syntax-property)' },
  tag: { color: 'var(--syntax-tag)' },
  constant: { color: 'var(--syntax-constant)' },
  symbol: { color: 'var(--syntax-symbol)' },
  deleted: { color: 'var(--syntax-deleted)' },
  boolean: { color: 'var(--syntax-boolean)' },
  number: { color: 'var(--syntax-number)' },
  selector: { color: 'var(--syntax-selector)' },
  'attr-name': { color: 'var(--syntax-attr-name)' },
  string: { color: 'var(--syntax-string)' },
  char: { color: 'var(--syntax-char)' },
  builtin: { color: 'var(--syntax-builtin)' },
  inserted: { color: 'var(--syntax-inserted)' },
  operator: { color: 'var(--syntax-operator)' },
  entity: { color: 'var(--syntax-entity)', cursor: 'help' },
  url: { color: 'var(--syntax-url)' },
  atrule: { color: 'var(--syntax-atrule)' },
  'attr-value': { color: 'var(--syntax-attr-value)' },
  function: { color: 'var(--syntax-function)' },
  'class-name': { color: 'var(--syntax-class-name)' },
  keyword: { color: 'var(--syntax-keyword)' },
  regex: { color: 'var(--syntax-regex)' },
  important: { color: 'var(--syntax-important)', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  variable: { color: 'var(--syntax-variable)' },
  plain: { color: 'var(--syntax-plain)' }
}

/** ---------- styles ---------- */
const preStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.95em',
  background: 'var(--surface-0)',
  borderRadius: '0.375rem',
  overflowX: 'auto',
  overflowY: 'auto',
  position: 'relative',
  padding: '1rem',
  margin: '1.5rem 0',
  color: 'var(--text-600)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-light)',
  maxHeight: '30vh'
}

const copyButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  padding: '0.25rem 0.75rem',
  fontSize: '0.8rem',
  borderRadius: '0.25rem',
  border: 'none',
  background: 'var(--brand-400)',
  color: 'var(--text-on-brand)',
  cursor: 'pointer',
  opacity: 0.85,
  transition: 'opacity 0.2s',
  zIndex: 1
}

/** ---------- helpers (type-safe) ---------- */
type CodeChildProps = { className?: string; children?: ReactNode }

// Depth-first search to find the actual <code> element React node
function findCodeElement(node: ReactNode): ReactElement<CodeChildProps> | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const el = findCodeElement(n)
      if (el) return el
    }
    return null
  }
  if (React.isValidElement(node)) {
    if (node.type === 'code') return node as ReactElement<CodeChildProps>

    const props = node.props as Record<string, unknown> | undefined
    const child = props && ('children' in props ? (props.children as ReactNode) : undefined)
    if (React.isValidElement(child) && child.type === 'code') {
      return child as ReactElement<CodeChildProps>
    }
    if (child) return findCodeElement(child)
  }
  return null
}

function extractInnerText(n: ReactNode): string {
  if (typeof n === 'string') return n
  if (typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(extractInnerText).join('')
  if (React.isValidElement(n)) {
    const props = n.props as Record<string, unknown> | undefined
    const child = props && ('children' in props ? (props.children as ReactNode) : undefined)
    return extractInnerText(child)
  }
  return ''
}

/** ---------- component ---------- */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  style,
  language,
  maxHeight,
  ...props
}) => {
  // Detect language from child <code class="language-xxx">
  const codeEl = findCodeElement(children)
  const childClass = codeEl?.props?.className ?? ''
  const detected =
    (childClass.match(/language-([\w-]+)/i)?.[1] || language || 'text').toLowerCase()
  const codeText = extractInnerText(codeEl?.props?.children ?? children).trim()

  // Hooks must not be conditional:
  const [copied, setCopied] = useState(false)

  // Mermaid bypass
  if (detected === 'mermaid') {
    return (
      <div style={{ position: 'relative', margin: '1.5rem 0' }}>
        <Mermaid chart={codeText} className="mdx-mermaid" />
      </div>
    )
  }

  // Normal code path
  const mergedPreStyle: React.CSSProperties = {
    ...preStyle,
    ...style,
    ...(maxHeight ? { maxHeight } : {})
  }

  function handleCopy() {
    navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        style={copyButtonStyle}
        aria-label="Copy code"
        onClick={handleCopy}
        tabIndex={0}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <SyntaxHighlighter
        language={detected}
        // Avoid `any` cast; this prop accepts arbitrary theme objects
        style={vsCodeAgnostic}
        PreTag="pre"
        customStyle={mergedPreStyle}
        codeTagProps={{
          style: {
            background: 'none',
            fontFamily: 'inherit',
            padding: 0,
            margin: 0
          }
        }}
        {...props}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  )
}
