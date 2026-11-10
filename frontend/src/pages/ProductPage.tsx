import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { fetchProduct } from '../api/products'
import { ProductImage } from '../components/ProductImage'
import { formatPrice } from '../lib/format'

export default function ProductPage() {
  const { slug = '' } = useParams()

  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    retry: false,
  })

  if (isPending) return <p className="text-neutral-400">Loading…</p>

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="text-red-400">We couldn't find that product.</p>
        <Link to="/" className="underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  // Collect every measurement name used by any size, e.g. body_width, body_length.
  const columns = [...new Set(product.sizes.flatMap((s) => Object.keys(s.measurements ?? {})))]

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-neutral-400 underline">
        ← Back to catalog
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <ProductImage product={product} className="aspect-square w-full rounded-lg" />

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl">{formatPrice(product.price)}</p>
          {product.is_sample_data && (
            <span className="inline-block rounded bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
              Sample data, not an official OXGN listing
            </span>
          )}
          {product.description && <p className="text-neutral-300">{product.description}</p>}
          {product.fit_note && <p className="text-sm text-neutral-400">{product.fit_note}</p>}
          {product.source_url && (
            <a href={product.source_url} target="_blank" rel="noreferrer" className="text-sm underline">
              View on OXGN
            </a>
          )}
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Sizes</h2>
        {columns.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <span key={s.id} className="rounded-md border border-neutral-700 px-3 py-1 text-sm">
                {s.size}
              </span>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-2 pr-4">Size</th>
                  {columns.map((c) => (
                    <th key={c} className="py-2 pr-4 capitalize">
                      {c.replace(/_/g, ' ')} (cm)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-900">
                    <td className="py-2 pr-4 font-medium">{s.size}</td>
                    {columns.map((c) => (
                      <td key={c} className="py-2 pr-4">
                        {s.measurements?.[c] ?? '–'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}