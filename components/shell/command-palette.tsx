"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  File,
  MessageSquare,
  Settings,
  Smile,
  User,
  Users,
  FolderKanban,
  Search,
  Home,
  Bell,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/chat"))}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projects</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/files"))}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Files</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/directory"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Directory</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/calendar"))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/chat?action=new"))}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/projects?action=new"))
            }
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>New Project</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/files?action=upload"))}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Upload File</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings/profile"))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/notifications"))}
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
