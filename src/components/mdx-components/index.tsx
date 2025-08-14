// ./src/components/mdx-components/index.tsx

import React from 'react';
import { Heading } from './elements/Heading';
import { Code, InlineCode } from './elements/Code';
import { CodeBlock } from './elements/CodeBlock';
import { Blockquote } from './elements/Blockquote';
import { Link } from './elements/Link';
import { List, ListItem } from './elements/List';
import { Table, Thead, Tbody, Tr, Th, Td } from './elements/Table';
import type { MDXComponents } from "mdx/types";

import './styles/mdx-base.css';


export const mdxComponents: MDXComponents = {
  h1: Heading.H1,
  h2: Heading.H2,
  h3: Heading.H3,
  h4: Heading.H4,
  h5: Heading.H5,
  h6: Heading.H6,
  a: Link,
  em: (props) => <em style={{ fontStyle: 'italic' }} {...props} />,
  strong: (props) => <strong style={{ fontWeight: 700 }} {...props} />,
  ul: List.Unordered,
  ol: List.Ordered,
  li: ListItem,
  code: Code,
  inlineCode: InlineCode,
  pre: CodeBlock,
  blockquote: Blockquote,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  hr: (props) => <hr style={{ borderTop: '1px solid #eee', margin: '32px 0' }} {...props} />,
  img: (props) => <img style={{ maxWidth: '100%', height: 'auto' }} {...props} />,
  dl: (props) => <dl {...props} />,
  dt: (props) => <dt style={{ fontWeight: 700, color: '#3875d7' }} {...props} />,
  dd: (props) => <dd style={{ color: '#6b7280' }} {...props} />,
};
