'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MailIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/mail/received')
  }, [router])
  return null
}
