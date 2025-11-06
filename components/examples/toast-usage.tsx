"use client"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"

/**
 * Example component demonstrating Toast usage
 * Toast is better than Alert for non-blocking notifications
 */

export function ToastExamples() {
  const { toast } = useToast()

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Toast Notification Examples</h3>
      
      <div className="space-y-2">
        <Button
          onClick={() => {
            toast({
              variant: "success",
              title: "Success!",
              description: "Project created successfully",
            })
          }}
        >
          Show Success Toast
        </Button>

        <Button
          variant="destructive"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to save changes",
            })
          }}
        >
          Show Error Toast
        </Button>

        <Button
          onClick={() => {
            toast({
              variant: "warning",
              title: "Warning",
              description: "You have unsaved changes",
              action: (
                <ToastAction altText="Save now">Save</ToastAction>
              ),
            })
          }}
        >
          Show Warning with Action
        </Button>

        <Button
          onClick={() => {
            toast({
              title: "File Uploaded",
              description: "document.pdf uploaded successfully",
              action: (
                <ToastAction altText="View">View</ToastAction>
              ),
            })
          }}
        >
          Show Toast with Action
        </Button>
      </div>
    </div>
  )
}

// Example usage in API hooks:
export function useProjectCreate() {
  const { toast } = useToast()

  const onSuccess = () => {
    toast({
      variant: "success",
      title: "Project Created",
      description: "Your new project is ready",
    })
  }

  const onError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Failed to Create Project",
      description: error.message || "Please try again",
    })
  }

  return { onSuccess, onError }
}
