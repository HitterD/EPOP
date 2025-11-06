'use client'

import { useState } from 'react'
import { BulkImportUploadStep } from './bulk-import-upload-step'
import { BulkImportMappingStep } from './bulk-import-mapping-step'
import { BulkImportPreviewStep } from './bulk-import-preview-step'
import { BulkImportResultStep } from './bulk-import-result-step'
import { BulkImportMapping, BulkImportPreview, BulkImportResult } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkImportWizardProps {
  entityType?: 'users' | 'contacts'
  onComplete?: (result: BulkImportResult) => void
  onCancel?: () => void
  className?: string
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'import' | 'result'

interface WizardStepConfig {
  id: WizardStep
  title: string
  description: string
}

const steps: WizardStepConfig[] = [
  { id: 'upload', title: 'Upload CSV', description: 'Choose a CSV file to import' },
  { id: 'mapping', title: 'Map Columns', description: 'Map CSV columns to fields' },
  { id: 'preview', title: 'Preview', description: 'Review and validate data' },
  { id: 'import', title: 'Import', description: 'Import validated records' },
  { id: 'result', title: 'Results', description: 'View import summary' },
]

export function BulkImportWizard({
  entityType = 'users',
  onComplete,
  onCancel,
  className,
}: BulkImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [mapping, setMapping] = useState<BulkImportMapping>({})
  const [preview, setPreview] = useState<BulkImportPreview | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleUploadComplete = (uploadedFile: File) => {
    setFile(uploadedFile)
    setCurrentStep('mapping')
  }

  const handleMappingComplete = (columnMapping: BulkImportMapping) => {
    setMapping(columnMapping)
    setCurrentStep('preview')
  }

  const handlePreviewComplete = (previewData: BulkImportPreview) => {
    setPreview(previewData)
    setCurrentStep('import')
  }

  const handleImportComplete = (importResult: BulkImportResult) => {
    setResult(importResult)
    setCurrentStep('result')
    onComplete?.(importResult)
  }

  const handleRestart = () => {
    setCurrentStep('upload')
    setFile(null)
    setMapping({})
    setPreview(null)
    setResult(null)
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import {entityType === 'users' ? 'Users' : 'Contacts'}</CardTitle>
          <CardDescription>
            Follow the steps to import multiple records from CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Indicator */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div
                  key={step.id}
                  className={cn(
                    'relative flex flex-col items-center text-center p-3 rounded-lg transition-colors',
                    isActive && 'bg-primary/10 border-2 border-primary',
                    isCompleted && 'bg-muted',
                    !isActive && !isCompleted && 'bg-background border'
                  )}
                >
                  {/* Step Number/Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isCurrent && 'bg-primary text-primary-foreground',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Title */}
                  <div
                    className={cn(
                      'text-xs font-medium',
                      isActive && 'text-primary',
                      isCompleted && 'text-foreground',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div>
        {currentStep === 'upload' && (
          <BulkImportUploadStep
            entityType={entityType}
            onComplete={handleUploadComplete}
            onCancel={onCancel}
          />
        )}

        {currentStep === 'mapping' && file && (
          <BulkImportMappingStep
            file={file}
            entityType={entityType}
            onComplete={handleMappingComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'preview' && file && (
          <BulkImportPreviewStep
            file={file}
            mapping={mapping}
            entityType={entityType}
            onComplete={handlePreviewComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'import' && file && preview && (
          <Card>
            <CardHeader>
              <CardTitle>Importing...</CardTitle>
              <CardDescription>
                Please wait while we import {preview.valid} valid records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'result' && result && (
          <BulkImportResultStep
            result={result}
            onRestart={handleRestart}
            onClose={onCancel}
          />
        )}
      </div>
    </div>
  )
}
