import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '../client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AuthSession, User, UserSession } from '@/types'
// Lazy-load socket client to avoid pulling it into auth pages bundle
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { withIdempotencyKey } from '../utils'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
}

interface ResetPasswordData {
  token: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthSession>('/auth/login', credentials)
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed')
      }
      return response.data
    },
    onSuccess: (session) => {
      setSession(session)
      // Socket connection will use httpOnly cookie for auth (lazy)
      import('@/lib/socket/client').then((m) => m.connectSocket(session.user.id, ''))
      toast.success('Welcome back!')
      router.push(ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<{ message: string }>('/auth/register', data, withIdempotencyKey())
      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Account created! Please login.')
      router.push(ROUTES.LOGIN)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/logout', {}, withIdempotencyKey())
      if (!response.success) {
        throw new Error(response.error?.message || 'Logout failed')
      }
    },
    onSuccess: () => {
      logout()
      import('@/lib/socket/client').then((m) => m.disconnectSocket())
      router.push(ROUTES.LOGIN)
      toast.success('Logged out successfully')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<{ message: string }>(
        '/auth/forgot-password',
        {
          email,
        },
        withIdempotencyKey()
      )
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send reset email')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Password reset email sent!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await apiClient.post<{ message: string }>(
        '/auth/reset-password',
        data,
        withIdempotencyKey()
      )
      if (!response.success) {
        throw new Error(response.error?.message || 'Password reset failed')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Password reset successfully! Please login.')
      router.push(ROUTES.LOGIN)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me')
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch user')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get all active sessions for current user
 */
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.get<UserSession[]>('/auth/sessions')
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch sessions')
      }
      return response.data
    },
    staleTime: 30_000, // 30 seconds
  })
}

/**
 * Revoke a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.delete(`/auth/sessions/${sessionId}`)
      if (!response.success) {
        throw new Error('Failed to revoke session')
      }
      return sessionId
    },
    onSuccess: (sessionId, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session revoked successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Revoke all sessions except current
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/sessions/revoke-all', {}, withIdempotencyKey())
      if (!response.success) {
        throw new Error('Failed to revoke all sessions')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('All other sessions have been logged out')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
