// ./src/components/mdx-components/elements/Heading.tsx

import React from 'react'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const h1Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 'bold',
  letterSpacing: '-0.02em',
//   color: 'var(--brand-600, #1e293b)',
  margin: '1rem 0 1rem'
} as const

const h2Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 'bold',
  letterSpacing: '-0.02em',
//   color: 'var(--brand-500, #2563eb)',
  margin: '1.75rem 0 0.875rem'
} as const

const h3Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 600,
//   color: 'var(--brand-500, #2563eb)',
  margin: '1.5rem 0 0.75rem'
} as const

const h4Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 600,
//   color: 'var(--brand-400, #60a5fa)',
  margin: '1.25rem 0 0.5rem'
} as const

const h5Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 500,
//   color: 'var(--brand-400, #60a5fa)',
  margin: '1rem 0 0.5rem'
} as const

const h6Style = {
  fontFamily: 'var(--font-brand, sans-serif)',
  fontWeight: 500,
//   color: 'var(--brand-400, #60a5fa)',
  margin: '0.75rem 0 0.25rem'
} as const

const H1: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h1 style={{ ...h1Style, ...style }} {...props}>{children}</h1>
)

const H2: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h2 style={{ ...h2Style, ...style }} {...props}>{children}</h2>
)

const H3: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h3 style={{ ...h3Style, ...style }} {...props}>{children}</h3>
)

const H4: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h4 style={{ ...h4Style, ...style }} {...props}>{children}</h4>
)

const H5: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h5 style={{ ...h5Style, ...style }} {...props}>{children}</h5>
)

const H6: React.FC<HeadingProps> = ({ children, style, ...props }) => (
  <h6 style={{ ...h6Style, ...style }} {...props}>{children}</h6>
)

export const Heading = { H1, H2, H3, H4, H5, H6 }
