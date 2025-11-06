import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teams-purple to-teams-purple-dark p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">EPOP</h1>
          <p className="mt-2 text-sm text-white/80">Enterprise Collaboration Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
