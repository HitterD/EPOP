"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

/**
 * Example component demonstrating Alert usage for different feedback scenarios
 * Use these patterns throughout the app for consistent user feedback
 */

export function SuccessAlert({ title, message }: { title?: string; message: string }) {
  return (
    <Alert variant="success">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{title || "Success"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function ErrorAlert({ title, message }: { title?: string; message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title || "Error"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function WarningAlert({ title, message }: { title?: string; message: string }) {
  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title || "Warning"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function InfoAlert({ title, message }: { title?: string; message: string }) {
  return (
    <Alert variant="info">
      <Info className="h-4 w-4" />
      <AlertTitle>{title || "Info"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

// Example usage in a page:
export function AlertExamplesDemo() {
  return (
    <div className="space-y-4 p-4">
      <SuccessAlert message="Your project has been created successfully!" />
      
      <ErrorAlert message="Failed to save changes. Please try again." />
      
      <WarningAlert 
        title="Unsaved Changes" 
        message="You have unsaved changes. Save before leaving?" 
      />
      
      <InfoAlert message="New features are now available. Check them out!" />
    </div>
  )
}
