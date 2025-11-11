/**
 * Unit tests for chat sanitization utilities
 */

import {
  sanitizeMessage,
  extractPlainText,
  hasXssAttempt,
  sanitizeFileName,
  sanitizeSearchQuery,
  getContentLength,
  truncateContent,
} from '../sanitize';

describe('sanitizeMessage', () => {
  test('should allow markdown formatting', () => {
    const input = '**bold** *italic* `code`';
    const output = sanitizeMessage(input, { allowMarkdown: true });
    
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
    expect(output).toContain('<code>code</code>');
  });

  test('should convert URLs to links', () => {
    const input = 'Visit https://example.com for more info';
    const output = sanitizeMessage(input, { allowLinks: true });
    
    expect(output).toContain('<a href="https://example.com"');
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  test('should prevent XSS attacks', () => {
    const malicious = '<script>alert("XSS")</script>';
    const output = sanitizeMessage(malicious);
    
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('alert');
  });

  test('should prevent javascript: URLs', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const output = sanitizeMessage(malicious, { allowLinks: true });
    
    expect(output).not.toContain('javascript:');
  });

  test('should truncate long messages', () => {
    const longMessage = 'a'.repeat(20000);
    const output = sanitizeMessage(longMessage, { maxLength: 10000 });
    
    expect(output.length).toBeLessThanOrEqual(10000);
  });

  test('should handle emoji', () => {
    const input = 'Hello 👋 World 🌍';
    const output = sanitizeMessage(input, { allowEmoji: true });
    
    expect(output).toContain('👋');
    expect(output).toContain('🌍');
  });

  test('should convert line breaks', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    const output = sanitizeMessage(input, { allowMarkdown: true });
    
    expect(output).toContain('<br>');
  });
});

describe('extractPlainText', () => {
  test('should extract text from HTML', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const text = extractPlainText(html);
    
    expect(text).toBe('Hello World');
  });

  test('should remove all HTML tags', () => {
    const html = '<div><span>Test</span><br><a href="#">Link</a></div>';
    const text = extractPlainText(html);
    
    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
  });
});

describe('hasXssAttempt', () => {
  test('should detect script tags', () => {
    expect(hasXssAttempt('<script>alert(1)</script>')).toBe(true);
    expect(hasXssAttempt('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
  });

  test('should detect javascript: protocol', () => {
    expect(hasXssAttempt('<a href="javascript:alert(1)">x</a>')).toBe(true);
  });

  test('should detect event handlers', () => {
    expect(hasXssAttempt('<img onerror="alert(1)">')).toBe(true);
    expect(hasXssAttempt('<div onclick="alert(1)">x</div>')).toBe(true);
  });

  test('should detect iframe', () => {
    expect(hasXssAttempt('<iframe src="evil.com"></iframe>')).toBe(true);
  });

  test('should allow safe content', () => {
    expect(hasXssAttempt('Hello **World**')).toBe(false);
    expect(hasXssAttempt('<p>Safe paragraph</p>')).toBe(false);
  });
});

describe('sanitizeFileName', () => {
  test('should remove dangerous characters', () => {
    const dangerous = 'file<>:"/\\|?*name.txt';
    const safe = sanitizeFileName(dangerous);
    
    expect(safe).not.toContain('<');
    expect(safe).not.toContain('>');
    expect(safe).not.toContain(':');
    expect(safe).not.toContain('/');
  });

  test('should handle path traversal attempts', () => {
    const traversal = '../../../etc/passwd';
    const safe = sanitizeFileName(traversal);
    
    expect(safe).toBe('_.._passwd');
  });

  test('should truncate to 255 characters', () => {
    const longName = 'a'.repeat(300) + '.txt';
    const safe = sanitizeFileName(longName);
    
    expect(safe.length).toBeLessThanOrEqual(255);
  });
});

describe('sanitizeSearchQuery', () => {
  test('should trim whitespace', () => {
    expect(sanitizeSearchQuery('  search term  ')).toBe('search term');
  });

  test('should remove angle brackets', () => {
    expect(sanitizeSearchQuery('<script>search</script>')).toBe('scriptsearch/script');
  });

  test('should truncate long queries', () => {
    const longQuery = 'a'.repeat(1000);
    const safe = sanitizeSearchQuery(longQuery);
    
    expect(safe.length).toBeLessThanOrEqual(500);
  });
});

describe('getContentLength', () => {
  test('should count plain text length', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const length = getContentLength(html);
    
    expect(length).toBe(11); // "Hello World"
  });

  test('should ignore HTML tags', () => {
    const html = '<div><span>Test</span></div>';
    const length = getContentLength(html);
    
    expect(length).toBe(4); // "Test"
  });
});

describe('truncateContent', () => {
  test('should truncate long content', () => {
    const long = 'This is a very long message';
    const truncated = truncateContent(long, 10);
    
    expect(truncated).toBe('This is...');
    expect(truncated.length).toBeLessThanOrEqual(10);
  });

  test('should not truncate short content', () => {
    const short = 'Short';
    const truncated = truncateContent(short, 10);
    
    expect(truncated).toBe('Short');
  });

  test('should use custom suffix', () => {
    const content = 'Long content here';
    const truncated = truncateContent(content, 10, '…');
    
    expect(truncated).toContain('…');
    expect(truncated.length).toBeLessThanOrEqual(10);
  });
});
