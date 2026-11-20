import { useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

// PLACEHOLDER WORDING: the client will provide the final privacy notice text.
// Replace the paragraphs below before the defense.
const NOTICE = [
  'OXGN Style+ is a student prototype. It is not an official OXGN product.',
  'The measurements you enter are used only to estimate your size and how garments may fit. They are stored with your account.',
  'Products shown are sample data and are not official OXGN listings or measurements.',
  'By continuing you agree to this use of your information for the demonstration.',
]

const storageKey = (userId: number) => `oxgn_consent_${userId}`

function hasAccepted(userId: number) {
  try {
    return localStorage.getItem(storageKey(userId)) === 'yes'
  } catch {
    return false
  }
}

export function ConsentGate({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [accepted, setAccepted] = useState(() => (user ? hasAccepted(user.id) : false))

  if (!user || accepted) return <>{children}</>

  function accept() {
    try {
      localStorage.setItem(storageKey(user!.id), 'yes')
    } catch {
      // If storage is blocked, the notice simply shows again next visit.
    }
    setAccepted(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Before you continue</h1>
        <p className="rounded-md border border-amber-900 bg-amber-950 p-2 text-xs text-amber-300">
          Placeholder wording. The final privacy notice will be provided by the project team.
        </p>
        {NOTICE.map((paragraph) => (
          <p key={paragraph} className="text-sm text-neutral-300">
            {paragraph}
          </p>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={accept} className="rounded-md bg-white px-4 py-2 font-medium text-black">
            I agree
          </button>
          <button
            onClick={() => void logout()}
            className="rounded-md border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  )
}