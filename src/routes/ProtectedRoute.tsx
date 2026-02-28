import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Rol } from '@/types'

interface Props {
  allowedRole: Rol
}

export function ProtectedRoute({ allowedRole }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== allowedRole) {
    return <Navigate to={user.rol === 'ADMIN' ? '/admin' : '/vendedor'} replace />
  }

  return <Outlet />
}
