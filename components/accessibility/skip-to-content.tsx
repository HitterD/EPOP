'use client'

interface SkipToContentProps {
  targetId?: string
  label?: string
}

export function SkipToContent({ targetId = 'main-content', label = 'Skip to main content' }: SkipToContentProps) {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {label}
    </a>
  )
}
