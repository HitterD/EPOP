'use client'

import { ReactNode } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Permission, UserRole } from '@/types'

interface IfCanProps {
  permission?: Permission
  permissions?: Permission[]
  role?: UserRole
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
  hideOnForbidden?: boolean
}

export function IfCan({
  permission,
  permissions,
  role,
  requireAll = false,
  children,
  fallback = null,
  hideOnForbidden = true,
}: IfCanProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasRole = useAuthStore((state) => state.hasRole)
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission)
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions)

  let isAllowed = false

  // Check role if provided
  if (role && hasRole(role)) {
    isAllowed = true
  }

  // Check single permission
  if (permission && hasPermission(permission)) {
    isAllowed = true
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      isAllowed = hasAllPermissions(permissions)
    } else {
      isAllowed = hasAnyPermission(permissions)
    }
  }

  if (!isAllowed) {
    return hideOnForbidden ? null : <>{fallback}</>
  }

  return <>{children}</>
}
