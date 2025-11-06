# EPOP Design Tokens

**Design System**: EPOP  
**Version**: 1.0.0  
**Framework**: TailwindCSS + shadcn/ui  
**Theme**: Light/Dark Mode Support

---

## 🎨 Color Palette

### Primary Colors
```css
--primary: 222.2 47.4% 11.2%
--primary-foreground: 210 40% 98%
```

### Secondary Colors
```css
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%
```

### Semantic Colors
```css
--destructive: 0 84.2% 60.2%
--destructive-foreground: 210 40% 98%

--success: 142 76% 36%
--success-foreground: 210 40% 98%

--warning: 38 92% 50%
--warning-foreground: 222.2 47.4% 11.2%

--info: 221 83% 53%
--info-foreground: 210 40% 98%
```

### Background & Surface
```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%

--card: 0 0% 100%
--card-foreground: 222.2 84% 4.9%

--popover: 0 0% 100%
--popover-foreground: 222.2 84% 4.9%

--muted: 210 40% 96.1%
--muted-foreground: 215.4 16.3% 46.9%
```

### Border & Input
```css
--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--ring: 222.2 84% 4.9%
```

---

## 📏 Spacing Scale

Based on TailwindCSS spacing scale (0.25rem increments):

| Token | Value | Pixels |
|-------|-------|--------|
| `spacing-0` | 0 | 0px |
| `spacing-1` | 0.25rem | 4px |
| `spacing-2` | 0.5rem | 8px |
| `spacing-3` | 0.75rem | 12px |
| `spacing-4` | 1rem | 16px |
| `spacing-5` | 1.25rem | 20px |
| `spacing-6` | 1.5rem | 24px |
| `spacing-8` | 2rem | 32px |
| `spacing-10` | 2.5rem | 40px |
| `spacing-12` | 3rem | 48px |
| `spacing-16` | 4rem | 64px |

---

## 📝 Typography

### Font Families
```css
--font-sans: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', 'Courier New', monospace
```

### Font Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Captions, labels |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body small, secondary text |
| `text-base` | 1rem (16px) | 1.5rem | Body text |
| `text-lg` | 1.125rem (18px) | 1.75rem | Subheadings |
| `text-xl` | 1.25rem (20px) | 1.75rem | Headings H4 |
| `text-2xl` | 1.5rem (24px) | 2rem | Headings H3 |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Headings H2 |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Headings H1 |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis |
| `font-semibold` | 600 | Headings, buttons |
| `font-bold` | 700 | Strong emphasis |

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 0.125rem (2px) | Small elements |
| `rounded` | 0.25rem (4px) | Default |
| `rounded-md` | 0.375rem (6px) | Cards, inputs |
| `rounded-lg` | 0.5rem (8px) | Large cards, modals |
| `rounded-xl` | 0.75rem (12px) | Featured elements |
| `rounded-full` | 9999px | Circular elements, avatars |

---

## 🌑 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle depth |
| `shadow` | 0 1px 3px rgba(0,0,0,0.1) | Default |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Dropdowns, popovers |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | Modals |

---

## ⏱️ Animation Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration-75` | 75ms | Instant feedback |
| `duration-150` | 150ms | Quick transitions |
| `duration-200` | 200ms | Default animations |
| `duration-300` | 300ms | Moderate animations |
| `duration-500` | 500ms | Slow animations |

### Easing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📱 Breakpoints

| Token | Min Width | Usage |
|-------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🎯 Component Tokens

### Buttons
```css
--button-height-sm: 2rem (32px)
--button-height-default: 2.5rem (40px)
--button-height-lg: 3rem (48px)

--button-padding-x-sm: 0.75rem (12px)
--button-padding-x-default: 1rem (16px)
--button-padding-x-lg: 1.5rem (24px)
```

### Inputs
```css
--input-height-sm: 2rem (32px)
--input-height-default: 2.5rem (40px)
--input-height-lg: 3rem (48px)

--input-padding-x: 0.75rem (12px)
--input-border-width: 1px
--input-focus-ring: 2px
```

### Cards
```css
--card-padding: 1.5rem (24px)
--card-border-width: 1px
--card-border-radius: 0.5rem (8px)
```

### Modals
```css
--modal-max-width-sm: 24rem (384px)
--modal-max-width-default: 32rem (512px)
--modal-max-width-lg: 48rem (768px)
--modal-padding: 1.5rem (24px)
```

---

## 🌓 Dark Mode Overrides

### Dark Mode Colors
```css
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%

--card: 222.2 84% 4.9%
--card-foreground: 210 40% 98%

--muted: 217.2 32.6% 17.5%
--muted-foreground: 215 20.2% 65.1%

--border: 217.2 32.6% 17.5%
--input: 217.2 32.6% 17.5%
```

---

## ♿ Accessibility

### Focus States
```css
--focus-ring-width: 2px
--focus-ring-offset: 2px
--focus-ring-color: var(--primary)
```

### Touch Targets
- Minimum size: 44x44px (iOS) / 48x48px (Android)
- Recommended: 48x48px for all platforms

### Color Contrast Ratios
- Normal text (14px+): 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum (WCAG AA)
- UI components: 3:1 minimum (WCAG AA)

---

## 🎨 Usage Examples

### Primary Button
```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-sm hover:bg-primary/90 transition-colors duration-200">
  Click Me
</button>
```

### Card
```tsx
<div className="bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
  Card Content
</div>
```

### Input
```tsx
<input className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
```

---

## 📦 Exporting Tokens

### For Figma
Use Figma Tokens plugin to import color and spacing variables.

### For iOS/Android
Generate platform-specific token files:
- iOS: `.xcassets` color sets
- Android: `colors.xml` resources

### For CSS Variables
All tokens are available as CSS custom properties in `globals.css`.

---

## 🔄 Version History

### v1.0.0 (5 Nov 2025)
- Initial design system
- Light/Dark mode support
- Complete token set
- TailwindCSS integration

---

**Maintained by**: Design System Team  
**Last Updated**: 5 November 2025
