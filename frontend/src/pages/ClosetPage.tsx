import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClosetItem, deleteClosetItem, fetchClosetItems } from '../api/closet'
import { TextField } from '../components/TextField'
import { applyServerErrors } from '../lib/errors'

const CATEGORIES = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessory' },
] as const

const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Keep it under 100 characters'),
  category: z.enum(['top', 'bottom', 'outerwear', 'footwear', 'accessory']),
  color: z.string().trim().max(50, 'Keep it under 50 characters'),
  size: z.string().trim().max(20, 'Keep it under 20 characters'),
})
type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { name: '', category: 'top', color: '', size: '' }

function AddItemForm() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState(0) // changing the key clears the file input

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const mutation = useMutation({
    mutationFn: createClosetItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['closet-items'] }),
  })

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null
    setFileError(null)

    if (picked && !PHOTO_TYPES.includes(picked.type)) {
      setFileError('Use a JPG, PNG or WebP photo.')
      setFile(null)
      return
    }
    if (picked && picked.size > MAX_PHOTO_BYTES) {
      setFileError('The photo must be 4 MB or smaller.')
      setFile(null)
      return
    }
    setFile(picked)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        name: values.name,
        category: values.category,
        color: values.color || undefined,
        size: values.size || undefined,
        image: file,
      })
      reset(EMPTY)
      setFile(null)
      setFileKey((k) => k + 1)
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border border-neutral-800 p-4">
      <h2 className="font-semibold">Add a piece</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" error={errors.name?.message} {...register('name')} />

        <label className="block">
          <span className="mb-1 block text-sm text-neutral-300">Category</span>
          <select
            {...register('category')}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && <span className="mt-1 block text-sm text-red-400">{errors.category.message}</span>}
        </label>

        <TextField label="Color (optional)" error={errors.color?.message} {...register('color')} />
        <TextField label="Size (optional)" error={errors.size?.message} {...register('size')} />
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-300">Photo (optional, JPG, PNG or WebP, up to 4 MB)</span>
          <input
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="block w-full text-sm text-neutral-300 file:mr-3 file:rounded-md file:border file:border-neutral-700 file:bg-neutral-900 file:px-3 file:py-1 file:text-white"
          />
        </label>
        {fileError && <p className="text-sm text-red-400">{fileError}</p>}
        {previewUrl && <img src={previewUrl} alt="Preview of your photo" className="h-32 w-32 rounded-md object-cover" />}
      </div>

      {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
      >
        {isSubmitting ? 'Adding…' : 'Add to closet'}
      </button>
    </form>
  )
}

export default function ClosetPage() {
  const queryClient = useQueryClient()

  const {
    data: items,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['closet-items'],
    queryFn: fetchClosetItems,
    retry: false,
  })

  const remove = useMutation({
    mutationFn: deleteClosetItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['closet-items'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My closet</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Add clothes you already own. To change a piece, delete it and add it again.
        </p>
      </div>

      <AddItemForm />

      {isPending && <p className="text-neutral-400">Loading your closet…</p>}
      {isError && <p className="text-red-400">Could not load your closet.</p>}
      {remove.isError && <p className="text-red-400">Could not delete that item. Please try again.</p>}
      {items && items.length === 0 && <p className="text-neutral-400">Your closet is empty. Add your first piece above.</p>}

      {items && items.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-neutral-800">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-neutral-900 text-sm capitalize text-neutral-500">
                  {item.category}
                </div>
              )}
              <div className="space-y-1 p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm capitalize text-neutral-400">
                  {[item.category, item.color, item.size].filter(Boolean).join(' · ')}
                </p>
                <button
                  type="button"
                  onClick={() => remove.mutate(item.id)}
                  disabled={remove.isPending && remove.variables === item.id}
                  className="text-sm text-red-400 underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}