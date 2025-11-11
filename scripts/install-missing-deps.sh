#!/bin/bash

echo "Installing missing dependencies for EPop platform..."

# Accessibility testing
echo "📦 Installing accessibility testing tools..."
pnpm add -D jest-axe @types/jest-axe

# Rich text editor for Mail module
echo "📝 Installing Tiptap rich text editor..."
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-underline

# Service worker for PWA
echo "⚙️ Installing service worker tools..."
pnpm add -D workbox-webpack-plugin
pnpm add workbox-window workbox-core workbox-routing workbox-strategies workbox-precaching

# Additional UI components
echo "🎨 Installing additional UI components..."
pnpm add @radix-ui/react-tooltip @radix-ui/react-alert-dialog @radix-ui/react-switch

# Date handling
echo "📅 Installing date utilities (if not present)..."
pnpm add date-fns

# Virtualization (if not present)
echo "📊 Installing virtualization libraries (if not present)..."
pnpm add @tanstack/react-table @tanstack/react-virtual

# HTML sanitization (if not present)
echo "🔒 Installing HTML sanitization..."
pnpm add isomorphic-dompurify

echo "✅ All dependencies installed successfully!"
echo "Run 'pnpm install' if you encounter any peer dependency warnings."
