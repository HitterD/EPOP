import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this when rendering user-generated HTML content
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is, actual sanitization happens on backend
    return html
  }

  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'class',
      'id',
      'style',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  })
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, '')
  }

  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  return clean
}

/**
 * Sanitize HTML for email preview (more restrictive)
 */
export function sanitizeEmailHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}
