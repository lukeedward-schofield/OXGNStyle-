import { Link, Outlet } from 'react-router'
import { useAuth } from '../auth/AuthContext'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold">
            OXGN Style+
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-400">{user?.name}</span>
            <button
              onClick={() => void logout()}
              className="rounded-md border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}