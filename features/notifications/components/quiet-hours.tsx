'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Moon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface QuietHoursSettings {
  enabled: boolean
  from: string
  to: string
  days: number[] // 1=Mon, 2=Tue, ..., 7=Sun
  allowUrgent: boolean
}

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return { value: `${hour}:00`, label: `${i === 0 ? '12' : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}` }
})

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function QuietHours() {
  const [settings, setSettings] = useState<QuietHoursSettings>({
    enabled: false,
    from: '22:00',
    to: '07:00',
    days: [1, 2, 3, 4, 5, 6, 7], // All days by default
    allowUrgent: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  const toggleDay = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day].sort(),
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In production: await updateQuietHours(settings)
    toast.success('Quiet hours settings saved')
    setHasChanges(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <div>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Suppress notifications during specific times
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => {
              setSettings((prev) => ({ ...prev, enabled: checked }))
              setHasChanges(true)
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Select
              value={settings.from}
              onValueChange={(value) => {
                setSettings((prev) => ({ ...prev, from: value }))
                setHasChanges(true)
              }}
              disabled={!settings.enabled}
            >
              <SelectTrigger id="from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Select
              value={settings.to}
              onValueChange={(value) => {
                setSettings((prev) => ({ ...prev, to: value }))
                setHasChanges(true)
              }}
              disabled={!settings.enabled}
            >
              <SelectTrigger id="to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Days Selection */}
        <div className="space-y-3">
          <Label>Days</Label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((day, index) => {
              const dayNumber = index + 1
              const isSelected = settings.days.includes(dayNumber)
              return (
                <Button
                  key={day}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(dayNumber)}
                  disabled={!settings.enabled}
                  className="w-14"
                >
                  {day}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Behavior During Quiet Hours */}
        <div className="space-y-3 rounded-lg border p-4">
          <div className="font-medium">During quiet hours:</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>In-App:</strong> Show badge count only, no popup notifications
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Email:</strong> Queue and send after quiet hours end
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Web Push:</strong> Suppress all browser notifications
              </span>
            </li>
          </ul>

          {/* Allow Urgent */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="allowUrgent"
              checked={settings.allowUrgent}
              onCheckedChange={(checked) => {
                setSettings((prev) => ({ ...prev, allowUrgent: checked as boolean }))
                setHasChanges(true)
              }}
              disabled={!settings.enabled}
            />
            <Label
              htmlFor="allowUrgent"
              className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allow urgent/critical alerts to bypass quiet hours
            </Label>
          </div>
        </div>

        {/* Warning Note */}
        {settings.enabled && settings.days.length === 0 && (
          <div className="flex gap-2 rounded-lg bg-orange-50 p-3 text-sm dark:bg-orange-950/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
            <p className="text-orange-900 dark:text-orange-100">
              Please select at least one day for quiet hours to apply
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={!hasChanges || !settings.enabled} className="w-full">
          Save Quiet Hours
        </Button>
      </CardContent>
    </Card>
  )
}
