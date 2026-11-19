import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { fetchBudgetOutfits, type Outfit } from '../api/outfits'
import { fetchProducts, type Product, type ProductCategory } from '../api/products'
import { fetchProfile } from '../api/profile'
import { Avatar } from '../avatar/Avatar'
import { bottomGarment, topGarment } from '../avatar/garments'
import { formatPrice } from '../lib/format'

const SLOTS: { category: ProductCategory; label: string }[] = [
  { category: 'top', label: 'Top' },
  { category: 'bottom', label: 'Bottom' },
  { category: 'outerwear', label: 'Outerwear' },
  { category: 'footwear', label: 'Footwear' },
  { category: 'accessory', label: 'Accessory' },
]

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${
    active ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
  }`

export default function StyleLabPage() {
  // One chosen product slug per category. Clicking the chosen one again removes it.
  const [selection, setSelection] = useState<Partial<Record<ProductCategory, string>>>({})
  const [budgetInput, setBudgetInput] = useState('')
  const [budget, setBudget] = useState<number | null>(null)

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
  })
  const profile = profileQuery.data
  const sizing = profile?.sizing

  const productsQuery = useQuery({
    queryKey: ['products', { sizing, scope: 'style-lab' }],
    queryFn: () => fetchProducts({ sizing }),
    enabled: !profileQuery.isPending,
    retry: false,
  })
  const products = productsQuery.data

  // Sizing is in the key because the server filters by the profile's sizing.
  const outfitsQuery = useQuery({
    queryKey: ['budget-outfits', budget, sizing],
    queryFn: () => fetchBudgetOutfits(budget ?? 0),
    enabled: budget !== null && !profileQuery.isPending,
    retry: false,
  })

  function toggle(category: ProductCategory, slug: string) {
    setSelection((prev) => ({ ...prev, [category]: prev[category] === slug ? undefined : slug }))
  }

  function applyBudget(event: FormEvent) {
    event.preventDefault()
    const value = Number(budgetInput)
    if (budgetInput.trim() !== '' && Number.isFinite(value) && value >= 0) setBudget(value)
  }

  function clearBudget() {
    setBudgetInput('')
    setBudget(null)
  }

  function loadOutfit(outfit: Outfit) {
    const next: Partial<Record<ProductCategory, string>> = {}
    for (const p of outfit.products) next[p.category] = p.slug
    setSelection(next)
  }

  const chosen = SLOTS.map((slot) => products?.find((p) => p.slug === selection[slot.category])).filter(
    (p): p is Product => Boolean(p),
  )
  const total = Math.round(chosen.reduce((sum, p) => sum + p.price, 0) * 100) / 100
  const remaining = budget !== null ? Math.round((budget - total) * 100) / 100 : null

  const top = products?.find((p) => p.slug === selection.top)
  const bottom = products?.find((p) => p.slug === selection.bottom)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Style Lab</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Mix and match items to build an outfit. The total updates as you pick.
        </p>
      </div>

      {(profileQuery.isPending || productsQuery.isPending) && <p className="text-neutral-400">Loading…</p>}
      {(profileQuery.isError || productsQuery.isError) && <p className="text-red-400">Could not load the Style Lab.</p>}

      {products && (
        <section className="space-y-3 rounded-lg border border-neutral-800 p-4">
          <h2 className="font-semibold">Budget builder</h2>
          <p className="text-sm text-neutral-400">
            Enter a budget to see outfits (a top, a bottom and optional extras) that fit within it.
          </p>

          <form onSubmit={applyBudget} className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-sm text-neutral-300">Budget (₱)</span>
              <input
                type="number"
                min={0}
                step="any"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 3000"
                className="w-40 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-white"
              />
            </label>
            <button type="submit" className="rounded-md bg-white px-4 py-2 font-medium text-black">
              Find outfits
            </button>
            {budget !== null && (
              <button
                type="button"
                onClick={clearBudget}
                className="rounded-md border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
              >
                Clear budget
              </button>
            )}
          </form>

          {budget !== null && outfitsQuery.isPending && <p className="text-sm text-neutral-400">Finding outfits…</p>}
          {outfitsQuery.isError && <p className="text-sm text-red-400">Could not load outfit suggestions.</p>}
          {outfitsQuery.data && outfitsQuery.data.length === 0 && (
            <p className="text-sm text-neutral-400">
              No outfit fits within {formatPrice(budget ?? 0)}. A top and a bottom together cost more than that.
            </p>
          )}
          {outfitsQuery.data && outfitsQuery.data.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-400">
                Showing up to {outfitsQuery.data.length} outfits within {formatPrice(budget ?? 0)}, biggest spend first.
              </p>
              <ul className="grid gap-3 md:grid-cols-2">
                {outfitsQuery.data.map((outfit, index) => (
                  <li key={index} className="space-y-2 rounded-md border border-neutral-800 p-3">
                    <ul className="space-y-0.5 text-sm text-neutral-300">
                      {outfit.products.map((p) => (
                        <li key={p.id} className="flex justify-between gap-4">
                          <span>{p.name.replace('Sample ', '')}</span>
                          <span>{formatPrice(p.price)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-neutral-800 pt-2">
                      <span className="font-semibold">{formatPrice(outfit.total)}</span>
                      <button
                        type="button"
                        onClick={() => loadOutfit(outfit)}
                        className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
                      >
                        Try this outfit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {products && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              {profile ? (
                <Avatar
                  input={profile}
                  top={topGarment(top)}
                  bottom={bottomGarment(bottom)}
                  className="mx-auto h-[28rem] w-auto"
                />
              ) : (
                <div className="space-y-2 py-16 text-center text-sm">
                  <p className="text-neutral-300">Add your measurements to see your avatar wear this outfit.</p>
                  <Link to="/measurements" className="underline">
                    Add measurements
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-neutral-800 p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">Your outfit</h2>
                {chosen.length > 0 && (
                  <button type="button" onClick={() => setSelection({})} className="text-sm text-neutral-400 underline">
                    Clear
                  </button>
                )}
              </div>

              {chosen.length === 0 && <p className="text-sm text-neutral-500">Nothing picked yet.</p>}
              {chosen.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {chosen.map((p) => (
                    <li key={p.id} className="flex justify-between gap-4">
                      <Link to={`/products/${p.slug}`} className="underline">
                        {p.name}
                      </Link>
                      <span className="text-neutral-300">{formatPrice(p.price)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-between border-t border-neutral-800 pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {remaining !== null && chosen.length > 0 && (
                <p className={`text-sm ${remaining >= 0 ? 'text-green-400' : 'text-amber-300'}`}>
                  {remaining >= 0
                    ? `${formatPrice(remaining)} left of your ${formatPrice(budget ?? 0)} budget`
                    : `${formatPrice(-remaining)} over your ${formatPrice(budget ?? 0)} budget`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {SLOTS.map(({ category, label }) => {
              const options = products.filter((p) => p.category === category)
              return (
                <section key={category} className="space-y-2">
                  <h2 className="text-sm text-neutral-300">{label}</h2>
                  {options.length === 0 && <p className="text-sm text-neutral-500">Nothing available.</p>}
                  <div className="flex flex-wrap gap-2">
                    {options.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(category, p.slug)}
                        className={chip(selection[category] === p.slug)}
                      >
                        {p.name.replace('Sample ', '')} · {formatPrice(p.price)}
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}

            <p className="text-xs text-neutral-500">
              Items are sample data, not official OXGN listings. Only tops and bottoms are drawn on the avatar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}