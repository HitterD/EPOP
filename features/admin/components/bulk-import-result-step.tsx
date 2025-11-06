'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { BulkImportResult } from '@/types'

interface BulkImportResultStepProps {
  result: BulkImportResult
  onRestart: () => void
  onClose?: () => void
}

export function BulkImportResultStep({
  result,
  onRestart,
  onClose,
}: BulkImportResultStepProps) {
  const successRate = result.total > 0 ? Math.round((result.imported / result.total) * 100) : 0
  const hasErrors = result.errors.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          Import Complete
        </CardTitle>
        <CardDescription>
          Your import has finished processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{result.total}</div>
            <div className="text-sm text-muted-foreground">Total Rows</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.imported}
            </div>
            <div className="text-sm text-muted-foreground">Imported</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {result.skipped}
            </div>
            <div className="text-sm text-muted-foreground">Skipped</div>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-sm font-medium">{successRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Status Alert */}
        {!hasErrors ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully imported {result.imported} record{result.imported !== 1 ? 's' : ''} without any errors!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Imported {result.imported} record{result.imported !== 1 ? 's' : ''}, 
              but {result.skipped} row{result.skipped !== 1 ? 's were' : ' was'} skipped due to errors.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Details */}
        {hasErrors && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Import Errors ({result.errors.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="font-medium mb-1">
                    Row {error.row}:
                    {error.field && <span className="text-muted-foreground ml-1">({error.field})</span>}
                  </div>
                  <p className="text-muted-foreground">{error.message}</p>
                </div>
              ))}
              {result.errors.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  ... and {result.errors.length - 10} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium">Next Steps:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Imported records are now available in the system</li>
            <li>Users will receive email notifications (if enabled)</li>
            {hasErrors && <li>Review and fix errors, then retry the import</li>}
            <li>Check the audit trail for detailed import history</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Import Another File
        </Button>
        <Button onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </CardFooter>
    </Card>
  )
}
