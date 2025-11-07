'use client'

import { useState } from 'react'
import { X, Send, Paperclip, Bold, Italic, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { FileItem } from '@/types'

interface MailComposerProps {
  onClose: () => void
  onSend: (data: {
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    body: string
    attachments?: FileItem[]
  }) => Promise<void>
  replyTo?: {
    id: string
    subject: string
    from: string
  }
}

export function MailComposer({ onClose, onSend, replyTo }: MailComposerProps) {
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : ''
  )
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<FileItem[]>([])
  const [sending, setSending] = useState(false)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)

  const handleSend = async () => {
    if (to.length === 0 || !subject || !body) {
      alert('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      const payload = {
        to,
        subject,
        body,
        ...(cc.length > 0 ? { cc } : {}),
        ...(bcc.length > 0 ? { bcc } : {}),
        ...(attachments.length > 0 ? { attachments } : {}),
      }
      await onSend(payload)
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const handleAddRecipient = (value: string, type: 'to' | 'cc' | 'bcc') => {
    if (!value.trim()) return

    const emails = value.split(',').map((e) => e.trim()).filter(Boolean)
    
    switch (type) {
      case 'to':
        setTo([...to, ...emails])
        break
      case 'cc':
        setCc([...cc, ...emails])
        break
      case 'bcc':
        setBcc([...bcc, ...emails])
        break
    }
  }

  const handleRemoveRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    switch (type) {
      case 'to':
        setTo(to.filter((e) => e !== email))
        break
      case 'cc':
        setCc(cc.filter((e) => e !== email))
        break
      case 'bcc':
        setBcc(bcc.filter((e) => e !== email))
        break
    }
  }

  const handleAttachFile = () => {
    // In real implementation, this would open file picker
    alert('File attachment will be implemented')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {replyTo ? 'Reply' : 'New Message'}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* To */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="w-12">To:</Label>
              <div className="flex-1 flex flex-wrap gap-1">
                {to.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveRecipient(email, 'to')}
                  >
                    {email}
                    <X size={12} className="ml-1" />
                  </Badge>
                ))}
                <Input
                  className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 px-0"
                  placeholder="Add recipients"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      handleAddRecipient(e.currentTarget.value, 'to')
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCc(!showCc)}
                >
                  Cc
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowBcc(!showBcc)}
                >
                  Bcc
                </Button>
              </div>
            </div>
          </div>

          {/* Cc */}
          {showCc && (
            <div className="flex items-center gap-2">
              <Label className="w-12">Cc:</Label>
              <div className="flex-1 flex flex-wrap gap-1">
                {cc.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveRecipient(email, 'cc')}
                  >
                    {email}
                    <X size={12} className="ml-1" />
                  </Badge>
                ))}
                <Input
                  className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 px-0"
                  placeholder="Add Cc"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      handleAddRecipient(e.currentTarget.value, 'cc')
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Bcc */}
          {showBcc && (
            <div className="flex items-center gap-2">
              <Label className="w-12">Bcc:</Label>
              <div className="flex-1 flex flex-wrap gap-1">
                {bcc.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveRecipient(email, 'bcc')}
                  >
                    {email}
                    <X size={12} className="ml-1" />
                  </Badge>
                ))}
                <Input
                  className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 px-0"
                  placeholder="Add Bcc"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      handleAddRecipient(e.currentTarget.value, 'bcc')
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Subject */}
          <div className="flex items-center gap-2">
            <Label className="w-12">Subject:</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="border-0 focus-visible:ring-0 px-0"
            />
          </div>

          <Separator />

          {/* Body */}
          <div className="min-h-[300px]">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your message..."
              className="w-full h-full min-h-[300px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments:</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <Badge key={file.id} variant="outline">
                    {file.name}
                    <X
                      size={12}
                      className="ml-1 cursor-pointer"
                      onClick={() =>
                        setAttachments(attachments.filter((f) => f.id !== file.id))
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" title="Bold">
              <Bold size={16} />
            </Button>
            <Button size="icon" variant="ghost" title="Italic">
              <Italic size={16} />
            </Button>
            <Button size="icon" variant="ghost" title="Link">
              <LinkIcon size={16} />
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAttachFile}
              title="Attach file"
            >
              <Paperclip size={16} />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Discard
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              <Send size={14} className="mr-2" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
