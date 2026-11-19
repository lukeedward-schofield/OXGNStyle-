import { api } from '../lib/api'
import type { Product } from './products'

export type Outfit = {
  total: number
  products: Product[]
}

// The server picks the sizing from the user's profile unless one is passed.
export async function fetchBudgetOutfits(budget: number) {
  const { data } = await api.get<{ data: Outfit[] }>('/outfits/budget', {
    params: { budget },
  })
  return data.data
}