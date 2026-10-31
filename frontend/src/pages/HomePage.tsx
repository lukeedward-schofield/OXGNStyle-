import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../api/health'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-neutral-950 text-white">
      <h1 className="text-3xl font-bold">OXGN Style+</h1>
      <p className="text-neutral-300">Signed in as {user?.name}</p>
      {isPending && <p className="text-neutral-400">Checking API…</p>}
      {isError && <p className="text-red-400">API unreachable</p>}
      {data && <p className="text-emerald-400">API status: {data.status}</p>}
      <button
        onClick={() => void logout()}
        className="mt-2 rounded-md border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
      >
        Log out
      </button>
    </main>
  )
}