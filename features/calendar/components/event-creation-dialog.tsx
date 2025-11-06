'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface EventCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date?: Date
  hour?: number
  onSave: (event: NewEvent) => void
}

export interface NewEvent {
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  type: 'task' | 'milestone' | 'mail' | 'reminder'
  location?: string
}

export function EventCreationDialog({
  open,
  onOpenChange,
  date,
  hour,
  onSave,
}: EventCreationDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<NewEvent['type']>('task')
  const [location, setLocation] = useState('')

  const handleSave = () => {
    if (!title.trim() || !date) return

    const startDate = new Date(date)
    if (hour !== undefined) {
      startDate.setHours(hour, 0, 0, 0)
    }

    const event: NewEvent = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      type,
      location: location.trim() || undefined,
    }

    onSave(event)
    
    // Reset form
    setTitle('')
    setDescription('')
    setType('task')
    setLocation('')
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            {date && (
              <>
                {format(date, 'EEEE, MMMM d, yyyy')}
                {hour !== undefined && ` at ${format(new Date().setHours(hour, 0), 'h:mm a')}`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as NewEvent['type'])}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="mail">Scheduled Mail</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
