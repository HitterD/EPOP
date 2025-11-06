import { AuditTrailViewer } from '@/features/directory/components'

export default function AuditPage() {
  return (
    <div className="container max-w-6xl py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground mt-2">
            Track all changes to users and organizational units
          </p>
        </div>

        {/* Audit Trail Viewer */}
        <AuditTrailViewer
          contextType="global"
          autoRefresh={true}
          pageSize={20}
        />
      </div>
    </div>
  )
}
