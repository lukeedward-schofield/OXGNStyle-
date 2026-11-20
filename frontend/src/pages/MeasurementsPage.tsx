import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { fetchProfile, saveProfile, type BodyProfile } from '../api/profile'
import { TextField } from '../components/TextField'
import { applyServerErrors } from '../lib/errors'
import { RecommendationCard } from '../components/RecommendationCard'

// Same sanity ranges as the backend (UpdateProfileRequest).
const inRange = (v: string, min: number, max: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= min && n <= max
}

const required = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => inRange(v, min, max), `${label} must be between ${min} and ${max}`)

const schema = z.object({
  sizing: z.enum(['mens', 'ladies']),
  height_cm: required('Height', 100, 250),
  weight_kg: z
    .string()
    .trim()
    .refine((v) => v === '' || inRange(v, 30, 300), 'Weight must be between 30 and 300'),
  chest_cm: required('Chest', 60, 160),
  waist_cm: required('Waist', 40, 160),
  hips_cm: required('Hips', 60, 170),
})
type FormValues = z.infer<typeof schema>

function MeasurementsForm({ profile }: { profile: BodyProfile | null }) {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sizing: profile?.sizing ?? 'mens',
      height_cm: profile ? String(profile.height_cm) : '',
      weight_kg: profile?.weight_kg != null ? String(profile.weight_kg) : '',
      chest_cm: profile ? String(profile.chest_cm) : '',
      waist_cm: profile ? String(profile.waist_cm) : '',
      hips_cm: profile ? String(profile.hips_cm) : '',
    },
  })

  const mutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      void queryClient.invalidateQueries({ queryKey: ['size-recommendation'] })
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false)
    try {
      await mutation.mutateAsync({
        sizing: values.sizing,
        height_cm: Number(values.height_cm),
        weight_kg: values.weight_kg === '' ? null : Number(values.weight_kg),
        chest_cm: Number(values.chest_cm),
        waist_cm: Number(values.waist_cm),
        hips_cm: Number(values.hips_cm),
      })
      setSaved(true)
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      <fieldset>
        <legend className="mb-1 text-sm text-neutral-300">Which OXGN size chart should we use?</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" value="mens" {...register('sizing')} /> Men&apos;s
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="ladies" {...register('sizing')} /> Ladies&apos;
          </label>
        </div>
        {errors.sizing && <span className="mt-1 block text-sm text-red-400">{errors.sizing.message}</span>}
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Height (cm)" type="number" step="any" error={errors.height_cm?.message} {...register('height_cm')} />
        <TextField label="Weight (kg, optional)" type="number" step="any" error={errors.weight_kg?.message} {...register('weight_kg')} />
        <TextField label="Chest (cm)" type="number" step="any" error={errors.chest_cm?.message} {...register('chest_cm')} />
        <TextField label="Waist (cm)" type="number" step="any" error={errors.waist_cm?.message} {...register('waist_cm')} />
        <TextField label="Hips (cm)" type="number" step="any" error={errors.hips_cm?.message} {...register('hips_cm')} />
      </div>

      {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}
      {saved && <p className="text-sm text-green-400">Measurements saved.</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Save measurements'}
      </button>
    </form>
  )
}

export default function MeasurementsPage() {
  const { data: profile, isPending, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My measurements</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Used only to recommend sizes from OXGN&apos;s size charts. You can change them any time.
        </p>
      </div>

      {isPending && <p className="text-neutral-400">Loading…</p>}
      {isError && <p className="text-red-400">Could not load your measurements.</p>}
      {!isPending && !isError && <MeasurementsForm profile={profile} />}
      {!isPending && !isError && profile && <RecommendationCard promptWhenEmpty={false} />}
    </div>
  )
}