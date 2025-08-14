// ./src/components/mdx-components/elements/Link.tsx

import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a 
    className={`text-interactive-default hover:text-interactive-hover transition-colors ${className}`}
    {...props}
  >
    {children}
  </a>
);