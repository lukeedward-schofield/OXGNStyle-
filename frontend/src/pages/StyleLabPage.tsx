import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
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

  function toggle(category: ProductCategory, slug: string) {
    setSelection((prev) => ({ ...prev, [category]: prev[category] === slug ? undefined : slug }))
  }

  const chosen = SLOTS.map((slot) => products?.find((p) => p.slug === selection[slot.category])).filter(
    (p): p is Product => Boolean(p),
  )
  const total = Math.round(chosen.reduce((sum, p) => sum + p.price, 0) * 100) / 100

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