'use client'

import { useState } from 'react'
import { BulkImportWizard } from '@/features/admin/components'
import { BulkImportResult } from '@/types'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function BulkImportPage() {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)

  const handleComplete = (result: BulkImportResult) => {
    toast.success(`Successfully imported ${result.imported} users!`)
    setIsComplete(true)
  }

  const handleCancel = () => {
    router.push('/admin/users')
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="space-y-6">
        {/* Page Header */}
        {!isComplete && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Import Users</h1>
            <p className="text-muted-foreground mt-2">
              Import multiple users at once from a CSV file
            </p>
          </div>
        )}

        {/* Wizard */}
        <BulkImportWizard
          entityType="users"
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
