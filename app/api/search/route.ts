import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/mock-data'
import type { SearchResult, SearchResultItem, Message, Project, User, FileItem } from '@/types'
import { tokenization } from '@/styles/i18n'

export async function GET(request: NextRequest) {
  const start = performance.now()
  const { searchParams } = new URL(request.url)
  const qRaw = searchParams.get('q') || ''
  const locale = (searchParams.get('locale') || 'en-US')
  const q = tokenization.normalize(qRaw.trim())
  const qTokens = tokenization.tokenize(q, locale)
  const tab = (searchParams.get('tab') || 'all') as 'all' | 'messages' | 'projects' | 'users' | 'files'
  const limit = Number(searchParams.get('limit') || '50')
  const offset = Number(searchParams.get('offset') || '0')
  const wantExplain = searchParams.get('explain') === '1'

  if (!q) {
    const empty: SearchResult = { messages: [], projects: [], users: [], files: [], total: 0, took: 0 }
    return NextResponse.json({ success: true, data: empty })
  }

  const textTokens = (text?: string) => tokenization.tokenize(tokenization.normalize(text || ''), locale)
  const matchesAll = (text?: string) => {
    const t = textTokens(text)
    return qTokens.every((qt) => t.some((tok) => tok.includes(qt)))
  }
  const scoreOf = (text?: string) => (matchesAll(text) ? 1 : 0)

  // Build result lists
  const users: SearchResultItem<User>[] = db
    .getAllUsers()
    .filter((u) => matchesAll(u.name) || matchesAll(u.email))
    .map((u) => ({
      item: u,
      score: scoreOf(u.name) + scoreOf(u.email),
      ...(wantExplain && { highlights: [{ field: 'name/email', matches: qTokens }] }),
    }))

  const projects: SearchResultItem<Project>[] = db
    .getAllProjects()
    .filter((p) => matchesAll(p.name) || matchesAll(p.description))
    .map((p) => ({
      item: p,
      score: scoreOf(p.name) + scoreOf(p.description),
      ...(wantExplain && { highlights: [{ field: 'name/description', matches: qTokens }] }),
    }))

  const files: SearchResultItem<FileItem>[] = db
    .getAllFiles()
    .filter((f) => matchesAll(f.name) || matchesAll(f.mimeType))
    .map((f) => ({
      item: f,
      score: scoreOf(f.name) + scoreOf(f.mimeType),
      ...(wantExplain && { highlights: [{ field: 'name/mimeType', matches: qTokens }] }),
    }))

  const messages: SearchResultItem<Message>[] = db
    .getAllMessages()
    .filter((m) => matchesAll(m.content))
    .map((m) => ({
      item: m,
      score: scoreOf(m.content),
      ...(wantExplain && { highlights: [{ field: 'content', matches: qTokens }] }),
    }))

  // Apply tab filter
  const filtered: SearchResult = {
    messages: tab === 'all' || tab === 'messages' ? messages : [],
    projects: tab === 'all' || tab === 'projects' ? projects : [],
    users: tab === 'all' || tab === 'users' ? users : [],
    files: tab === 'all' || tab === 'files' ? files : [],
    total: 0,
    took: 0,
  }

  // Sort by score desc then createdAt/updatedAt desc if present
  const byScore = <T extends { item: any; score: number }>(a: T, b: T) => b.score - a.score
  filtered.messages.sort(byScore)
  filtered.projects.sort(byScore)
  filtered.users.sort(byScore)
  filtered.files.sort(byScore)

  // Pagination over the combined results or per tab? We'll paginate per tab.
  const paginate = <T>(arr: T[]): T[] => arr.slice(offset, offset + limit)
  filtered.messages = paginate(filtered.messages)
  filtered.projects = paginate(filtered.projects)
  filtered.users = paginate(filtered.users)
  filtered.files = paginate(filtered.files)

  filtered.total =
    (tab === 'messages' ? messages.length : 0) +
    (tab === 'projects' ? projects.length : 0) +
    (tab === 'users' ? users.length : 0) +
    (tab === 'files' ? files.length : 0) +
    (tab === 'all' ? messages.length + projects.length + users.length + files.length : 0)

  filtered.took = Math.round(performance.now() - start)

  // Did-you-mean (very simple: suggest users whose name starts with first token)
  let suggestions: string[] | undefined
  if (filtered.total === 0 && qTokens.length) {
    const first = qTokens[0]
    const candidates = db.getAllUsers().map((u) => u.name)
    suggestions = candidates
      .filter((name) => (tokenization.normalize(name) || '').startsWith(first))
      .slice(0, 5)
    if (!suggestions.length) suggestions = undefined
  }

  return NextResponse.json({ success: true, data: filtered, ...(suggestions ? { suggestions } : {}) })
}
