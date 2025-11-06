# Frontend Virtualization Guide — @tanstack/react-virtual

Updated: 5 Nov 2025

## Objective
- Keep long lists smooth at 60fps by rendering only visible rows.
- Integrate with TanStack Query infinite scroll (cursor pagination).
- Provide a reusable VirtualList component and integration patterns.

## Dependencies
Already present in package.json:
- `@tanstack/react-virtual`
- `@tanstack/react-query`

## Reusable Component
File: `components/virtual/VirtualList.tsx`
- Props: `items`, `estimateSize`, `row(item, index)`, `overscan`, `className`.
- Internals: `useVirtualizer` with absolute-positioned rows.

Usage example:
```tsx
<VirtualList
  items={items}
  estimateSize={64}
  overscan={12}
  row={(m) => (<MessageRow msg={m} />)}
  className="h-[60vh]"
/>
```

## Integration Patterns
- Flatten pages from `useInfiniteQuery`:
```ts
const items = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items ?? []), [data])
```
- Fetch next page near-bottom:
  - Simplest: "Load more" button using `fetchNextPage()`.
  - Advanced: IntersectionObserver sentinel at bottom.

## Implemented
- Chat list: `features/chat/components/chat-list.tsx` — already uses `useVirtualizer` directly.
- Files list: `app/(shell)/files/page.tsx` — virtualized list view with `useVirtualizer`.
- Mail list: `app/(shell)/mail/[folder]/page.tsx` — updated to use `VirtualList` + infinite scroll.

## UX & A11y
- Container should be focusable if keyboard navigation is needed; add `tabIndex={0}` as required.
- Provide aria-labels for list containers and rows.
- Use skeleton placeholders while `isFetchingNextPage`.
- Preserve scroll position when appending new pages; `react-virtual` handles index-based virtualization; for prepend, use anchor keys.

## Performance Budget
- 10k items: keep frame time < 16ms on mid‑range laptops.
- Avoid heavy per-row computation; memoize row components when needed.
- Defer image loading via `loading="lazy"`.

## Next
- Migrate chat message stream from `react-window` to `@tanstack/react-virtual` for consistency.
- Abstract a `VirtualGrid` if needed for files grid view.
