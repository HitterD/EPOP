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
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Infinity } from 'lucide-react'
import { format, addDays } from 'date-fns'

type RetentionPolicy = '30d' | '90d' | '1y' | '7y' | 'permanent'

interface RetentionTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFiles: string[]
  onApply: (policy: RetentionPolicy) => void
}

const retentionPolicies = [
  {
    value: '30d' as RetentionPolicy,
    label: '30 Days',
    description: 'File will be deleted after 30 days',
    icon: Clock,
    color: 'text-orange-600',
    badge: 'warning',
  },
  {
    value: '90d' as RetentionPolicy,
    label: '90 Days',
    description: 'File will be deleted after 90 days',
    icon: Clock,
    color: 'text-yellow-600',
    badge: 'secondary',
  },
  {
    value: '1y' as RetentionPolicy,
    label: '1 Year',
    description: 'File will be deleted after 1 year',
    icon: Calendar,
    color: 'text-blue-600',
    badge: 'default',
  },
  {
    value: '7y' as RetentionPolicy,
    label: '7 Years',
    description: 'File will be deleted after 7 years (compliance)',
    icon: Calendar,
    color: 'text-purple-600',
    badge: 'default',
  },
  {
    value: 'permanent' as RetentionPolicy,
    label: 'Permanent',
    description: 'File will never be automatically deleted',
    icon: Infinity,
    color: 'text-green-600',
    badge: 'default',
  },
]

export function RetentionTagDialog({
  open,
  onOpenChange,
  selectedFiles,
  onApply,
}: RetentionTagDialogProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy>('90d')

  const handleApply = () => {
    onApply(selectedPolicy)
    onOpenChange(false)
  }

  const getExpiryDate = (policy: RetentionPolicy): string | null => {
    if (policy === 'permanent') return null
    
    const days = {
      '30d': 30,
      '90d': 90,
      '1y': 365,
      '7y': 365 * 7,
    }[policy]

    return format(addDays(new Date(), days), 'MMM d, yyyy')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Retention Policy</DialogTitle>
          <DialogDescription>
            Choose how long to keep {selectedFiles.length} selected file{selectedFiles.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedPolicy} onValueChange={(v) => setSelectedPolicy(v as RetentionPolicy)}>
            <div className="space-y-3">
              {retentionPolicies.map((policy) => {
                const Icon = policy.icon
                const expiryDate = getExpiryDate(policy.value)
                const isSelected = selectedPolicy === policy.value

                return (
                  <div
                    key={policy.value}
                    className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value={policy.value} id={policy.value} className="mt-1" />
                    <Label
                      htmlFor={policy.value}
                      className="flex flex-1 cursor-pointer flex-col space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${policy.color}`} />
                        <span className="font-semibold">{policy.label}</span>
                        {isSelected && <Badge variant="outline">Selected</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                      {expiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {expiryDate}
                        </p>
                      )}
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Get badge variant for retention policy
 */
export function getRetentionBadgeVariant(policy: RetentionPolicy): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (policy) {
    case '30d':
      return 'destructive'
    case '90d':
      return 'secondary'
    case '1y':
    case '7y':
      return 'default'
    case 'permanent':
      return 'outline'
    default:
      return 'default'
  }
}

/**
 * Get display label for retention policy
 */
export function getRetentionLabel(policy: RetentionPolicy): string {
  return retentionPolicies.find(p => p.value === policy)?.label || policy
}
