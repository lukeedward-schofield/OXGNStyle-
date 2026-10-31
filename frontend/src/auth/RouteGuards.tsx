import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthContext'

// Pages only for logged-in users.
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-neutral-400">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// Pages only for logged-out users (login, register).
export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}