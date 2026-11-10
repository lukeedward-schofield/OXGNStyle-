import type { Product } from '../api/products'

export function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  if (product.image_url) {
    return <img src={product.image_url} alt={product.name} className={`object-cover ${className}`} />
  }

  return (
    <div className={`flex items-center justify-center bg-neutral-900 text-sm capitalize text-neutral-500 ${className}`}>
      {product.category}
    </div>
  )
}