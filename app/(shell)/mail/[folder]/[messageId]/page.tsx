'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMailMessage, useMoveMail, useSetMailRead } from '@/lib/api/hooks/use-mail'
import { formatDate } from '@/lib/utils'
import { SafeHtml } from '@/components/ui/safe-html'

export default function MailDetailPage() {
  const params = useParams<{ folder: string; messageId: string }>()
  const router = useRouter()
  const folder = (params.folder || 'received') as 'received' | 'sent' | 'deleted'
  const messageId = params.messageId
  const { data: m } = useMailMessage(messageId)
  const moveMail = useMoveMail()
  const setMailRead = useSetMailRead()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href={`/mail/${folder}`} className="text-sm text-muted-foreground hover:underline">← Back to {folder}</Link>
          {m && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMailRead.mutate({ messageId: m.id, isRead: !m.isRead })}
              >
                {m.isRead ? 'Mark Unread' : 'Mark Read'}
              </Button>
              <Link href={`/mail/compose?replyTo=${m.id}`}>
                <Button variant="ghost" size="sm">Reply</Button>
              </Link>
              <Link href={`/mail/compose?forward=${m.id}`}>
                <Button variant="ghost" size="sm">Forward</Button>
              </Link>
            </>
          )}
        </div>
        {m && m.folder !== 'deleted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveMail.mutate({ messageId: m.id, folder: 'deleted' }, { onSuccess: () => router.push('/mail/deleted') })}
          >
            Delete
          </Button>
        )}
      </div>

      {m ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold" title={m.subject}>{m.subject}</h1>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>From: {m.from}</div>
                  <div>To: {m.to.join(', ')}</div>
                  {m.cc && m.cc.length > 0 && <div>CC: {m.cc.join(', ')}</div>}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {formatDate(m.createdAt, 'long')}
                <div className="mt-2">
                  <Badge variant="outline">{m.priority}</Badge>
                </div>
              </div>
            </div>

            <SafeHtml html={m.body} className="prose max-w-none dark:prose-invert" />

            {m.attachments && m.attachments.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium">Attachments</h2>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {m.attachments.map((a) => (
                    <li key={a.id}>
                      <a href={a.url} className="hover:underline" target="_blank" rel="noreferrer">
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
