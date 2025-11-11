/**
 * Scroll Utilities for Chat
 * 
 * Handles scroll preservation when prepending messages,
 * smooth scrolling, and sticky day headers.
 */

export interface ScrollPosition {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/**
 * Save current scroll position
 */
export function saveScrollPosition(element: HTMLElement): ScrollPosition {
  return {
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  };
}

/**
 * Restore scroll position after prepending content
 * This maintains the visual position for the user
 */
export function restoreScrollAfterPrepend(
  element: HTMLElement,
  previousPosition: ScrollPosition
): void {
  const heightDelta = element.scrollHeight - previousPosition.scrollHeight;
  element.scrollTop = previousPosition.scrollTop + heightDelta;
}

/**
 * Check if user is near the bottom of the scroll container
 */
export function isNearBottom(
  element: HTMLElement,
  threshold: number = 100
): boolean {
  const { scrollTop, scrollHeight, clientHeight } = element;
  return scrollHeight - (scrollTop + clientHeight) < threshold;
}

/**
 * Scroll to bottom smoothly
 */
export function scrollToBottom(element: HTMLElement, smooth = true): void {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Scroll to top smoothly
 */
export function scrollToTop(element: HTMLElement, smooth = true): void {
  element.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Scroll to specific element
 */
export function scrollToElement(
  container: HTMLElement,
  target: HTMLElement,
  options: {
    behavior?: 'auto' | 'smooth';
    block?: 'start' | 'center' | 'end' | 'nearest';
    offset?: number;
  } = {}
): void {
  const { behavior = 'smooth', block = 'center', offset = 0 } = options;

  const targetPosition = target.offsetTop - container.offsetTop + offset;
  
  container.scrollTo({
    top: targetPosition,
    behavior,
  });
}

/**
 * React hook for scroll preservation
 */
export function useScrollPreservation(containerRef: React.RefObject<HTMLElement>) {
  const savedPositionRef = React.useRef<ScrollPosition | null>(null);
  const shouldPreserveRef = React.useRef(false);

  const savePosition = React.useCallback(() => {
    if (containerRef.current) {
      savedPositionRef.current = saveScrollPosition(containerRef.current);
      shouldPreserveRef.current = true;
    }
  }, [containerRef]);

  const restorePosition = React.useCallback(() => {
    if (containerRef.current && savedPositionRef.current && shouldPreserveRef.current) {
      restoreScrollAfterPrepend(containerRef.current, savedPositionRef.current);
      shouldPreserveRef.current = false;
    }
  }, [containerRef]);

  return { savePosition, restorePosition };
}

/**
 * React hook for auto-scroll to bottom on new messages
 */
export function useAutoScrollBottom(
  containerRef: React.RefObject<HTMLElement>,
  messages: any[],
  enabled = true
) {
  const wasNearBottomRef = React.useRef(true);

  React.useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const container = containerRef.current;
    const wasNearBottom = wasNearBottomRef.current;

    if (wasNearBottom) {
      scrollToBottom(container, true);
    }
  }, [messages, enabled, containerRef]);

  // Track if user scrolls away from bottom
  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      wasNearBottomRef.current = isNearBottom(container);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToBottomNow = React.useCallback(() => {
    if (containerRef.current) {
      scrollToBottom(containerRef.current, true);
      wasNearBottomRef.current = true;
    }
  }, [containerRef]);

  return { scrollToBottom: scrollToBottomNow };
}

/**
 * Detect scroll direction
 */
export function useScrollDirection(containerRef: React.RefObject<HTMLElement>) {
  const [direction, setDirection] = React.useState<'up' | 'down' | null>(null);
  const lastScrollTopRef = React.useRef(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;

      if (currentScrollTop > lastScrollTop) {
        setDirection('down');
      } else if (currentScrollTop < lastScrollTop) {
        setDirection('up');
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return direction;
}

/**
 * Throttle scroll events
 */
export function useThrottledScroll(
  containerRef: React.RefObject<HTMLElement>,
  callback: (event: Event) => void,
  delay = 100
) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = (event: Event) => {
      if (timeoutRef.current) {
        return;
      }

      timeoutRef.current = setTimeout(() => {
        callback(event);
        timeoutRef.current = null;
      }, delay);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, callback, delay]);
}

// React import
import React from 'react';
