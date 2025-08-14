/** @jsxImportSource @emotion/react */
"use client"
import { css } from "@emotion/react"
import Breadcrumbs from "./Breadcrumbs"

type Props = {
  breadcrumbs: { href: string; label: string }[]
}

const headerCss = css`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--background-0);
  border-bottom: 1px solid var(--border-light);
  min-height: 54px;
  display: flex;
  align-items: center;
  padding: 0 2.2rem;
`

export default function Header({ breadcrumbs }: Props) {
  return (
    <header css={headerCss}>
      <Breadcrumbs crumbs={breadcrumbs} />
    </header>
  )
}
