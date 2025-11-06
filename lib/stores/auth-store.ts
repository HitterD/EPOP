import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthSession, Permission, UserRole } from '@/types'

interface AuthState {
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: AuthSession | null) => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                user: { ...state.session.user, ...userData },
              }
            : null,
        })),

      logout: () =>
        set({
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasPermission: (permission: Permission): boolean => {
        const state = get()
        return state.session?.user?.permissions?.includes(permission) ?? false
      },

      hasRole: (role: UserRole): boolean => {
        const state = get()
        return state.session?.user?.role === role
      },

      hasAnyPermission: (permissions: Permission[]): boolean => {
        const state = get()
        const userPermissions = state.session?.user?.permissions ?? []
        return permissions.some(p => userPermissions.includes(p))
      },

      hasAllPermissions: (permissions: Permission[]): boolean => {
        const state = get()
        const userPermissions = state.session?.user?.permissions ?? []
        return permissions.every(p => userPermissions.includes(p))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
