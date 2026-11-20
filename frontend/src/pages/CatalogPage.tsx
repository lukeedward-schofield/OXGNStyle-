import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { fetchProducts, type ProductCategory } from '../api/products'
import { ProductImage } from '../components/ProductImage'
import { formatPrice } from '../lib/format'
import { RecommendationCard } from '../components/RecommendationCard'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessories' },
]

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${
    active ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
  }`

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()

  const category = CATEGORIES.find((c) => c.value === params.get('category'))?.value
  const budgetParam = params.get('max_price') ?? ''
  const maxPrice =
    budgetParam !== '' && Number.isFinite(Number(budgetParam)) ? Number(budgetParam) : undefined

  const [budgetInput, setBudgetInput] = useState(budgetParam)

  const {
    data: products,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['products', { category, maxPrice }],
    queryFn: () => fetchProducts({ category, max_price: maxPrice }),
    placeholderData: keepPreviousData,
    retry: false,
  })

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  function applyBudget(event: FormEvent) {
    event.preventDefault()
    setParam('max_price', budgetInput.trim() || undefined)
  }

  function clearBudget() {
    setBudgetInput('')
    setParam('max_price')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <RecommendationCard />

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setParam('category')} className={chip(!category)}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setParam('category', c.value)} className={chip(category === c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      <form onSubmit={applyBudget} className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-300">Budget (₱)</span>
          <input
            type="number"
            min={0}
            step="any"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="e.g. 1000"
            className="w-40 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-white"
          />
        </label>
        <button type="submit" className="rounded-md bg-white px-4 py-2 font-medium text-black">
          Apply
        </button>
        {maxPrice !== undefined && (
          <button
            type="button"
            onClick={clearBudget}
            className="rounded-md border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
          >
            Clear
          </button>
        )}
      </form>

      {isPending && <p className="text-neutral-400">Loading products…</p>}
      {isError && <p className="text-red-400">Could not load products.</p>}
      {products && products.length === 0 && (
        <p className="text-neutral-400">No products match your filters.</p>
      )}

      {products && products.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                to={`/products/${product.slug}`}
                className="block overflow-hidden rounded-lg border border-neutral-800 hover:border-neutral-600"
              >
                <ProductImage product={product} className="aspect-square w-full" />
                <div className="space-y-1 p-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-neutral-300">{formatPrice(product.price)}</p>
                  {product.is_sample_data && (
                    <span className="inline-block rounded bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
                      Sample data
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}