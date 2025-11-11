/**
 * Internationalization and RTL Utilities
 * 
 * Provides helpers for RTL languages, locale detection,
 * and direction-aware styling.
 */

export type TextDirection = 'ltr' | 'rtl';
export type Locale = string; // e.g., 'en-US', 'ar-SA', 'he-IL'

// RTL Languages
export const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian
  'ur', // Urdu
  'yi', // Yiddish
] as const;

// Locale utilities
export const localeUtils = {
  /**
   * Detect if a locale uses RTL direction
   */
  isRTL(locale: Locale): boolean {
    const lang = locale.split('-')[0].toLowerCase();
    return RTL_LANGUAGES.includes(lang as any);
  },

  /**
   * Get text direction for a locale
   */
  getDirection(locale: Locale): TextDirection {
    return this.isRTL(locale) ? 'rtl' : 'ltr';
  },

  /**
   * Format number with locale-specific formatting
   */
  formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(value);
  },

  /**
   * Format date with locale-specific formatting
   */
  formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    locale: Locale
  ): string {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
  },

  /**
   * Get browser locale
   */
  getBrowserLocale(): Locale {
    if (typeof window === 'undefined') return 'en-US';
    return window.navigator.language || 'en-US';
  },
};

// RTL-aware CSS utilities
export const rtlStyles = {
  /**
   * Get margin/padding value that respects RTL
   * @example marginStart(4) -> 'ml-4' (LTR) or 'mr-4' (RTL)
   */
  marginStart(value: string | number, direction: TextDirection = 'ltr'): string {
    const prefix = direction === 'rtl' ? 'mr' : 'ml';
    return `${prefix}-${value}`;
  },

  marginEnd(value: string | number, direction: TextDirection = 'ltr'): string {
    const prefix = direction === 'rtl' ? 'ml' : 'mr';
    return `${prefix}-${value}`;
  },

  paddingStart(value: string | number, direction: TextDirection = 'ltr'): string {
    const prefix = direction === 'rtl' ? 'pr' : 'pl';
    return `${prefix}-${value}`;
  },

  paddingEnd(value: string | number, direction: TextDirection = 'ltr'): string {
    const prefix = direction === 'rtl' ? 'pl' : 'pr';
    return `${prefix}-${value}`;
  },

  /**
   * Get text alignment that respects RTL
   */
  textAlign(align: 'left' | 'right' | 'center', direction: TextDirection = 'ltr'): string {
    if (align === 'center') return 'text-center';
    if (align === 'left') {
      return direction === 'rtl' ? 'text-right' : 'text-left';
    }
    return direction === 'rtl' ? 'text-left' : 'text-right';
  },

  /**
   * Get border side that respects RTL
   */
  borderStart(direction: TextDirection = 'ltr'): string {
    return direction === 'rtl' ? 'border-r' : 'border-l';
  },

  borderEnd(direction: TextDirection = 'ltr'): string {
    return direction === 'rtl' ? 'border-l' : 'border-r';
  },
};

// Locale-aware tokenization for search
export const tokenization = {
  /**
   * Tokenize text based on locale
   * Different rules for CJK (Chinese, Japanese, Korean) and Thai
   */
  tokenize(text: string, locale: Locale): string[] {
    const lang = locale.split('-')[0].toLowerCase();

    // CJK languages: character-based tokenization
    if (['zh', 'ja', 'ko'].includes(lang)) {
      return Array.from(text);
    }

    // Thai: use Intl.Segmenter if available
    if (lang === 'th' && typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new (Intl as any).Segmenter(locale, { granularity: 'word' });
      return Array.from(segmenter.segment(text))
        .filter((segment: any) => segment.isWordLike)
        .map((segment: any) => segment.segment);
    }

    // Default: word-based tokenization
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 0);
  },

  /**
   * Normalize text for search (remove diacritics, lowercase)
   */
  normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  },

  /**
   * Check if query matches text (locale-aware)
   */
  matches(text: string, query: string, locale: Locale): boolean {
    const textTokens = this.tokenize(this.normalize(text), locale);
    const queryTokens = this.tokenize(this.normalize(query), locale);

    return queryTokens.every(queryToken =>
      textTokens.some(textToken => textToken.includes(queryToken))
    );
  },
};

// React hook for locale and direction
export function useLocale() {
  const [locale, setLocale] = React.useState<Locale>(localeUtils.getBrowserLocale());
  const direction = localeUtils.getDirection(locale);
  const isRTL = direction === 'rtl';

  React.useEffect(() => {
    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
    }
  }, [direction, locale]);

  return {
    locale,
    setLocale,
    direction,
    isRTL,
    isLTR: !isRTL,
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      localeUtils.formatNumber(value, locale, options),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      localeUtils.formatDate(date, locale, options),
    formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) =>
      localeUtils.formatRelativeTime(value, unit, locale),
  };
}

// React import
import React from 'react';
