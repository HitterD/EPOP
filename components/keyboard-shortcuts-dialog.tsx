'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { keyboardShortcuts, ShortcutCategory } from '@/lib/keyboard/shortcuts'
import { Keyboard } from 'lucide-react'

const categories: { id: ShortcutCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'actions', label: 'Actions' },
  { id: 'chat', label: 'Chat' },
  { id: 'projects', label: 'Projects' },
  { id: 'search', label: 'Search' },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open with '?' key
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement
        // Don't open if typing in input
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        event.preventDefault()
        setOpen(true)
      }

      // Close with Escape
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> to toggle this
            dialog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => {
            const shortcuts = keyboardShortcuts.getByCategory(category.id)
            if (shortcuts.length === 0) return null

            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold mb-3">{category.label}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {keyboardShortcuts.formatShortcut(shortcut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Most shortcuts work globally, but some are context-specific.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
