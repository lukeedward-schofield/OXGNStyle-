import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { fetchProfile, fetchSizeRecommendation } from '../api/profile'
import { fetchProductFit, fetchProducts, type FitLabel, type Product, type SizeFit } from '../api/products'
import { Avatar, SKIN_TONES } from '../avatar/Avatar'
import { bottomGarment, topGarment } from '../avatar/garments'

const FIT_TEXT: Record<FitLabel, string> = {
  snug: 'Snug: close to the body',
  regular: 'Regular fit',
  loose: 'Loose: roomy fit',
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${
    active ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
  }`

// The size the user picked, else their recommended size, else the middle of the range.
function pickSize(sizes: string[], chosen: string | null, recommended: string | undefined) {
  if (chosen && sizes.includes(chosen)) return chosen
  if (recommended && sizes.includes(recommended)) return recommended
  return sizes[Math.floor(sizes.length / 2)] ?? null
}

function describeFit(fit: SizeFit | undefined, loading: boolean) {
  if (loading) return 'Checking fit…'
  if (fit?.fit) {
    const ease = fit.chest_ease_cm ?? 0
    return `${FIT_TEXT[fit.fit]} (${ease > 0 ? '+' : ''}${ease} cm chest ease)`
  }
  return 'No garment measurements are available for this item, so there is no fit estimate.'
}

type SectionProps = {
  title: string
  products: Product[] | undefined
  selected: Product | undefined
  onSelect: (slug: string | null) => void
  size: string | null
  onSizeChange: (size: string) => void
  fitText: string
}

function GarmentSection({ title, products, selected, onSelect, size, onSizeChange, fitText }: SectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm text-neutral-300">{title}</h2>

      {!products && <p className="text-sm text-neutral-500">Loading…</p>}
      {products && products.length === 0 && <p className="text-sm text-neutral-500">Nothing available yet.</p>}
      {products && products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onSelect(null)} className={chip(!selected)}>
            Default
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.slug)}
              className={chip(selected?.slug === p.slug)}
            >
              {p.name.replace('Sample ', '')}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {selected.sizes.map((s) => (
              <button key={s.id} type="button" onClick={() => onSizeChange(s.size)} className={chip(size === s.size)}>
                {s.size}
              </button>
            ))}
          </div>
          <p className="text-sm text-neutral-300">{fitText}</p>
        </div>
      )}
    </section>
  )
}

export default function TryOnPage() {
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1])
  const [topSlug, setTopSlug] = useState<string | null>(null)
  const [topSizeChoice, setTopSizeChoice] = useState<string | null>(null)
  const [bottomSlug, setBottomSlug] = useState<string | null>(null)
  const [bottomSizeChoice, setBottomSizeChoice] = useState<string | null>(null)

  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
  })

  const sizing = profile?.sizing

  const tops = useQuery({
    queryKey: ['products', { category: 'top', sizing }],
    queryFn: () => fetchProducts({ category: 'top', sizing }),
    enabled: Boolean(sizing),
  })
  const bottoms = useQuery({
    queryKey: ['products', { category: 'bottom', sizing }],
    queryFn: () => fetchProducts({ category: 'bottom', sizing }),
    enabled: Boolean(sizing),
  })
  const recommendation = useQuery({
    queryKey: ['size-recommendation'],
    queryFn: fetchSizeRecommendation,
    enabled: Boolean(profile),
    retry: false,
  })

  const top = tops.data?.find((p) => p.slug === topSlug)
  const bottom = bottoms.data?.find((p) => p.slug === bottomSlug)

  // The chest measurement is in the key so fit labels refresh after the user edits their profile.
  const topFit = useQuery({
    queryKey: ['product-fit', topSlug, profile?.chest_cm],
    queryFn: () => fetchProductFit(topSlug ?? ''),
    enabled: Boolean(top),
    retry: false,
  })

  const topSize = top
    ? pickSize(
        top.sizes.map((s) => s.size),
        topSizeChoice,
        recommendation.data?.top.size,
      )
    : null
  const bottomSize = bottom
    ? pickSize(
        bottom.sizes.map((s) => s.size),
        bottomSizeChoice,
        recommendation.data?.bottom.size,
      )
    : null

  const topSizeFit = topFit.data?.sizes.find((s) => s.size === topSize)

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
            <Avatar
              input={profile}
              skinTone={skinTone}
              top={topGarment(top, topSizeFit?.chest_ease_cm ?? null)}
              bottom={bottomGarment(bottom)}
              className="mx-auto h-[28rem] w-auto"
            />
          </div>

          <div className="space-y-5">
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

            <GarmentSection
              title="Top"
              products={tops.data}
              selected={top}
              onSelect={(slug) => {
                setTopSlug(slug)
                setTopSizeChoice(null)
              }}
              size={topSize}
              onSizeChange={setTopSizeChoice}
              fitText={describeFit(topSizeFit, topFit.isPending)}
            />

            <GarmentSection
              title="Bottom"
              products={bottoms.data}
              selected={bottom}
              onSelect={(slug) => {
                setBottomSlug(slug)
                setBottomSizeChoice(null)
              }}
              size={bottomSize}
              onSizeChange={setBottomSizeChoice}
              fitText={describeFit(undefined, false)}
            />

            <p className="text-xs text-neutral-500">
              Fit labels are estimates from garment measurements, using assumed thresholds. Items are sample data.
            </p>

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