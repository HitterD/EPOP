"use client"

import DOMPurify from 'dompurify'
import React from 'react'

interface SafeHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string
}

export function SafeHtml({ html, ...props }: SafeHtmlProps) {
  const sanitized = React.useMemo(() => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }), [html])
  return <div {...props} dangerouslySetInnerHTML={{ __html: sanitized }} />
}
