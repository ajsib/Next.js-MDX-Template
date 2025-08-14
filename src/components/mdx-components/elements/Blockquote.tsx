// ./src/components/mdx-components/elements/Blockquote.tsx

import React from 'react'

interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  children: React.ReactNode
}

const blockquoteStyle = {
  fontFamily: 'var(--font-body, serif)',
//   fontSize: '1.125rem',
  color: 'var(--secondary, #64748b)',
  fontStyle: 'italic',
  borderLeft: '4px solid var(--brand-300, #93c5fd)',
  paddingLeft: '1rem',
} as const

export const Blockquote: React.FC<BlockquoteProps> = ({ children, style, ...props }) => (
  <blockquote style={{ ...blockquoteStyle, ...style }} {...props}>
    {children}
  </blockquote>
)
