import { ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
}

/**
 * Component to hide content visually but keep it accessible to screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>
}
