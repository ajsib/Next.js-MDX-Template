// ./src/components/mdx-components/elements/Code.tsx

import React from 'react'

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: `'JetBrains Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
  fontSize: '0.875rem',
  backgroundColor: 'var(--surface-200, #E9ECEF)',
  color: 'var(--text-700, #3A413D)',
  padding: '0.125rem 0.25rem',
  borderRadius: '0.25rem',
  lineHeight: 1.6,
  fontWeight: 400,
  border: 'none',
  boxShadow: 'none',
  wordBreak: 'break-word'
}

const inlineCodeDarkStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-200, #2D3C33)',
  color: 'var(--text-700, #D4D8DC)'
}

function getInlineCodeStyle() {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return { ...inlineCodeStyle, ...inlineCodeDarkStyle }
  }
  return inlineCodeStyle
}

export const InlineCode: React.FC<CodeProps> = ({ children, className = '', style, ...props }) => (
  <code
    style={{ ...getInlineCodeStyle(), ...style }}
    className={className}
    {...props}
  >
    {children}
  </code>
)

export const Code: React.FC<CodeProps> = ({ children, className = '', style, ...props }) => {
  if (className && className.includes('language-')) {
    return <code className={className} style={style} {...props}>{children}</code>
  }
  return <InlineCode className={className} style={style} {...props}>{children}</InlineCode>
}
