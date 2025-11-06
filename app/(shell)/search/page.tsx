'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, FolderKanban, Users, File } from 'lucide-react'
import {
  useSearch as useSearchAll,
  useSearchMessages,
  useSearchProjects,
  useSearchUsers,
  useSearchFiles,
} from '@/lib/api/hooks/use-search'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'projects' | 'users' | 'files'>('all')
  const [hasAttachments, setHasAttachments] = useState<boolean | undefined>(undefined)
  const [sender, setSender] = useState('')

  const filters = useMemo(
    () => ({
      sender: sender || undefined,
      hasAttachments,
    }),
    [sender, hasAttachments]
  )

  const all = useSearchAll({ query, tab: 'all', filters })
  const messages = useSearchMessages(query, filters)
  const projects = useSearchProjects(query, filters)
  const users = useSearchUsers(query, filters)
  const files = useSearchFiles(query, filters)

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold">Search</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search across messages, projects, users, and files..."
            className="pl-10 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Filter by sender (email or name)"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={!!hasAttachments}
            onChange={(e) => setHasAttachments(e.target.checked ? true : undefined)}
          />
          Has attachments
        </label>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="files">
            <File className="mr-2 h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {query ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Results for "{query}"</p>
              <p>Messages: {all.data?.messages.length ?? 0}</p>
              <p>Projects: {all.data?.projects.length ?? 0}</p>
              <p>Users: {all.data?.users.length ?? 0}</p>
              <p>Files: {all.data?.files.length ?? 0}</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Enter a search query to see results
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="space-y-2">
            {(messages.data?.messages || []).map((r) => (
              <Card key={r.item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{r.item.content}</p>
                      {Array.isArray(r.highlights) && r.highlights.length > 0 && (
                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {r.highlights.map((h: any, idx: number) => (
                            <div key={idx}>…{h.matches.join(' … ')}…</div>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(r.item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-2">
            {(projects.data?.projects || []).map((r) => (
              <Card key={r.item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{r.item.name}</span>
                  <Badge variant="outline">{r.item.memberIds.length} members</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-2">
            {(users.data?.users || []).map((r) => (
              <Card key={r.item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{r.item.name}</span>
                  <Badge variant="outline">{r.item.email}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="space-y-2">
            {(files.data?.files || []).map((r) => (
              <Card key={r.item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{r.item.name}</span>
                  <Badge variant="outline">{(r.item.size / 1024).toFixed(1)} KB</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
