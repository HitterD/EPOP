"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const onInstall = async () => {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      setDeferred(null)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded border bg-background p-3 shadow-lg">
      <div className="mb-2 text-sm font-medium">Install EPOP?</div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onInstall}>Install</Button>
        <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>Later</Button>
      </div>
    </div>
  )
}
