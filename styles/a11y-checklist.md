# Accessibility Checklist

## Per Component Checklist

### Semantic HTML
- [ ] Uses semantic elements (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>`
- [ ] Forms use `<form>`, `<label>`, `<input>` properly

### ARIA
- [ ] Appropriate ARIA role (if needed)
- [ ] `aria-label` or `aria-labelledby` for context
- [ ] `aria-describedby` for additional info
- [ ] `aria-live` for dynamic content
- [ ] `aria-expanded`, `aria-selected`, `aria-checked` for state
- [ ] `aria-disabled` instead of removing interactivity

### Keyboard Navigation
- [ ] All interactive elements are focusable (tabindex="0" or native)
- [ ] Focus visible (ring-2 ring-primary)
- [ ] Enter activates buttons/links
- [ ] Escape closes dialogs/menus
- [ ] Arrow keys for lists/menus
- [ ] Tab order is logical

### Focus Management
- [ ] Focus trapped in modals
- [ ] Focus returns after closing dialogs
- [ ] Skip links for main content
- [ ] No keyboard traps

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text)
- [ ] UI component contrast ≥ 3:1
- [ ] Don't rely on color alone

### Motion & Animation
- [ ] Respects `prefers-reduced-motion`
- [ ] No auto-playing animations >5s
- [ ] Pause/stop controls for motion

### Screen Readers
- [ ] Informative alt text for images
- [ ] Empty alt for decorative images
- [ ] Form validation errors announced
- [ ] Loading states announced
- [ ] Success/error messages announced

### Testing Tools
- [ ] jest-axe passes (no violations)
- [ ] Manual keyboard testing
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Lighthouse accessibility score >90

## Common Patterns

### Buttons
```tsx
<button
  type="button"
  aria-label="Close dialog"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>
```

### Dialogs
```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent aria-labelledby="dialog-title">
    <DialogTitle id="dialog-title">Dialog Title</DialogTitle>
    {/* Focus trapped automatically by shadcn Dialog */}
  </DialogContent>
</Dialog>
```

### Lists
```tsx
<div role="list" aria-label="Chat conversations">
  {items.map(item => (
    <div key={item.id} role="listitem">
      {item.name}
    </div>
  ))}
</div>
```

### Live Regions
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

### Form Fields
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-destructive text-sm">
      {error}
    </p>
  )}
</div>
```

## Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)
