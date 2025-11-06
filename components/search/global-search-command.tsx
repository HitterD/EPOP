'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Search, MessageSquare, FolderKanban, Users, File } from 'lucide-react'

/**
 * Global Search Command Palette (Cmd+K / Ctrl+K)
 * Wave-2: Keyboard shortcut for quick search access
 */
export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search messages, projects, users, and files..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const input = e.currentTarget
            handleSearch(input.value)
          }
        }}
      />
      <CommandList>
        <CommandEmpty>Type to search across EPop</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              router.push('/search?q=')
              setOpen(false)
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Open Full Search</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Search By Type">
          <CommandItem
            onSelect={() => {
              router.push('/search')
              setOpen(false)
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Search Messages</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              router.push('/search')
              setOpen(false)
            }}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Search Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              router.push('/search')
              setOpen(false)
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Search Users</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              router.push('/search')
              setOpen(false)
            }}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Search Files</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem disabled>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
            <span className="ml-2 text-xs text-muted-foreground">Toggle search</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
