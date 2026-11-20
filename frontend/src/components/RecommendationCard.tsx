import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { fetchSizeRecommendation } from '../api/profile'

export function RecommendationCard({ promptWhenEmpty = true }: { promptWhenEmpty?: boolean }) {
  const { data, isPending } = useQuery({
    queryKey: ['size-recommendation'],
    queryFn: fetchSizeRecommendation,
    retry: false,
  })

  if (isPending) return null

  if (!data) {
    if (!promptWhenEmpty) return null
    return (
      <div className="rounded-lg border border-neutral-800 p-4 text-sm">
        <p className="text-neutral-300">Add your measurements to get a recommended size.</p>
        <Link to="/measurements" className="mt-1 inline-block underline">
          Add measurements
        </Link>
      </div>
    )
  }

  const outOfRange = data.top.out_of_range || data.bottom.out_of_range

  return (
    <div className="space-y-2 rounded-lg border border-neutral-800 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Your recommended size</h2>
        {promptWhenEmpty && (
          <Link to="/measurements" className="text-sm text-neutral-400 underline">
            Edit measurements
          </Link>
        )}
      </div>
      <p className="text-lg">
        Tops: <strong>{data.top.size}</strong> · Bottoms: <strong>{data.bottom.size}</strong>
      </p>
      <p className="text-sm text-neutral-400">
        Chest {data.by_measurement.chest} · Waist {data.by_measurement.waist} · Hips {data.by_measurement.hips}
      </p>
      {outOfRange && (
        <p className="text-sm text-amber-300">
          Your measurements are outside the OXGN size chart range, so this is the nearest size.
        </p>
      )}
      <p className="text-xs text-neutral-500">Based on OXGN&apos;s body size charts. Garment fit may vary.</p>
    </div>
  )
}