import type { ComponentPropsWithRef } from 'react'

type Props = ComponentPropsWithRef<'input'> & { label: string; error?: string }

export function TextField({ label, error, ...props }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-300">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-white"
      />
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </label>
  )
}