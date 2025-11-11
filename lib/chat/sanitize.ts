/**
 * Chat Content Sanitization
 * 
 * Sanitizes user-generated content to prevent XSS while supporting
 * markdown, linkify, and emoji rendering.
 */

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizeOptions {
  allowMarkdown?: boolean;
  allowLinks?: boolean;
  allowEmoji?: boolean;
  maxLength?: number;
}

/**
 * Sanitize chat message content
 */
export function sanitizeMessage(
  content: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowMarkdown = true,
    allowLinks = true,
    allowEmoji = true,
    maxLength = 10000,
  } = options;

  // Truncate if too long
  let sanitized = content.slice(0, maxLength);

  // Convert markdown to HTML if allowed
  if (allowMarkdown) {
    sanitized = convertMarkdown(sanitized);
  }

  // Linkify URLs if allowed
  if (allowLinks) {
    sanitized = linkifyUrls(sanitized);
  }

  // Process emoji if allowed
  if (allowEmoji) {
    sanitized = processEmoji(sanitized);
  }

  // Final XSS sanitization with DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: allowMarkdown
      ? ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'a']
      : ['p', 'br', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  return sanitized;
}

/**
 * Convert simple markdown to HTML
 * Supports: **bold**, *italic*, `code`, ~~strikethrough~~
 */
function convertMarkdown(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Inline code: `text`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

/**
 * Convert URLs to clickable links
 */
function linkifyUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Process emoji (keep native emoji, can be extended for custom emoji)
 */
function processEmoji(text: string): string {
  // For now, just preserve native emoji
  // Can be extended to support custom emoji like :smile: -> 😊
  return text;
}

/**
 * Extract plain text from HTML content
 */
export function extractPlainText(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Check if content contains potentially dangerous patterns
 */
export function hasXssAttempt(content: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(content));
}

/**
 * Sanitize file name for safe display
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 500)
    .replace(/[<>]/g, '');
}

/**
 * Get content length (excluding HTML tags)
 */
export function getContentLength(html: string): number {
  return extractPlainText(html).length;
}

/**
 * Truncate content to specified length
 */
export function truncateContent(
  content: string,
  maxLength: number,
  suffix = '...'
): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength - suffix.length) + suffix;
}
