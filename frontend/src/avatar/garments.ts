import type { Product } from '../api/products'
import type { BottomGarment, TopGarment } from './Avatar'

// Used when we have no garment measurements to compute a real ease from.
const DEFAULT_TOP_EASE_CM = 8
const DEFAULT_BOTTOM_EASE_CM = 6

// Turns a catalog product into something the avatar can draw. Returns undefined
// when the product has no drawing data, so the avatar keeps its base outfit.
export function topGarment(product: Product | undefined, easeCm: number | null = null): TopGarment | undefined {
  if (!product?.avatar_color) return undefined

  switch (product.avatar_shape) {
    case 'tee':
      return { color: product.avatar_color, easeCm: easeCm ?? DEFAULT_TOP_EASE_CM, sleeves: 'short' }
    case 'tank':
      return { color: product.avatar_color, easeCm: easeCm ?? DEFAULT_TOP_EASE_CM, sleeves: 'none' }
    default:
      return undefined
  }
}

export function bottomGarment(product: Product | undefined): BottomGarment | undefined {
  if (!product?.avatar_color) return undefined

  switch (product.avatar_shape) {
    case 'pants':
      return { color: product.avatar_color, easeCm: DEFAULT_BOTTOM_EASE_CM, hemFraction: 0.96 }
    case 'shorts':
      return { color: product.avatar_color, easeCm: DEFAULT_BOTTOM_EASE_CM, hemFraction: 0.74 }
    default:
      return undefined
  }
}