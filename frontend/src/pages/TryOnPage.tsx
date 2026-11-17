import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { fetchProfile } from '../api/profile'
import { Avatar, SKIN_TONES } from '../avatar/Avatar'

export default function TryOnPage() {
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1])

  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Try-on</h1>
        <p className="mt-1 text-sm text-neutral-400">
          An illustrated avatar drawn from your measurements. It is a guide, not an exact likeness.
        </p>
      </div>

      {isPending && <p className="text-neutral-400">Loading…</p>}
      {isError && <p className="text-red-400">Could not load your measurements.</p>}

      {!isPending && !isError && !profile && (
        <div className="space-y-2 rounded-lg border border-neutral-800 p-4 text-sm">
          <p className="text-neutral-300">Add your measurements to see your avatar.</p>
          <Link to="/measurements" className="underline">
            Add measurements
          </Link>
        </div>
      )}

      {profile && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <Avatar input={profile} skinTone={skinTone} className="mx-auto h-[28rem] w-auto" />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-sm text-neutral-300">Skin tone</h2>
              <div className="flex gap-2">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSkinTone(tone)}
                    aria-label={`Skin tone ${tone}`}
                    aria-pressed={skinTone === tone}
                    style={{ backgroundColor: tone }}
                    className={`h-8 w-8 rounded-full border-2 ${
                      skinTone === tone ? 'border-white' : 'border-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-neutral-400">
              Height {profile.height_cm} cm · Chest {profile.chest_cm} cm · Waist {profile.waist_cm} cm · Hips{' '}
              {profile.hips_cm} cm
            </p>
            <Link to="/measurements" className="inline-block text-sm underline">
              Edit measurements
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}