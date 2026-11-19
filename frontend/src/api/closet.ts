import { api } from '../lib/api'
import type { ProductCategory } from './products'

export type ClosetItem = {
  id: number
  name: string
  category: ProductCategory
  color: string | null
  size: string | null
  image_url: string | null
}

export type NewClosetItem = {
  name: string
  category: ProductCategory
  color?: string
  size?: string
  image?: File | null
}

export async function fetchClosetItems() {
  const { data } = await api.get<{ data: ClosetItem[] }>('/closet-items')
  return data.data
}

// Sent as multipart form data so the optional photo can be uploaded with it.
export async function createClosetItem(input: NewClosetItem) {
  const form = new FormData()
  form.append('name', input.name)
  form.append('category', input.category)
  if (input.color) form.append('color', input.color)
  if (input.size) form.append('size', input.size)
  if (input.image) form.append('image', input.image)

  const { data } = await api.post<{ data: ClosetItem }>('/closet-items', form)
  return data.data
}

export async function deleteClosetItem(id: number) {
  await api.delete(`/closet-items/${id}`)
}