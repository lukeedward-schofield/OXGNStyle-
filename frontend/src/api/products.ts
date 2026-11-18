import { api } from '../lib/api'

export type ProductCategory = 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory'
export type AvatarShape = 'tee' | 'tank' | 'pants' | 'shorts'

export type ProductSize = {
  id: number
  size: string
  in_stock: boolean
  measurements: Record<string, number> | null
}

export type Product = {
  id: number
  name: string
  slug: string
  category: ProductCategory
  description: string | null
  price: number
  avatar_color: string | null
  avatar_shape: AvatarShape | null
  sizing: 'mens' | 'ladies' | null
  fit_note: string | null
  image_url: string | null
  layer_image_url: string | null
  source_url: string | null
  is_sample_data: boolean
  sizes: ProductSize[]
}

export type ProductFilters = {
  category?: ProductCategory
  sizing?: 'mens' | 'ladies'
  max_price?: number
  search?: string
}

// per_page is the API maximum (50), which is plenty for the prototype catalog.
export async function fetchProducts(filters: ProductFilters = {}) {
  const { data } = await api.get<{ data: Product[] }>('/products', {
    params: { per_page: 50, ...filters },
  })
  return data.data
}

export async function fetchProduct(slug: string) {
  const { data } = await api.get<{ data: Product }>(`/products/${slug}`)
  return data.data
}

export type FitLabel = 'snug' | 'regular' | 'loose'

export type SizeFit = {
  size: string
  chest_ease_cm: number | null
  fit: FitLabel | null
}

export async function fetchProductFit(slug: string) {
  const { data } = await api.get<{ data: { sizes: SizeFit[] } | null }>(`/products/${slug}/fit`)
  return data.data
}