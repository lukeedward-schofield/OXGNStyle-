import { api } from '../lib/api'

export type NewFeedback = {
  rating: number // 1 to 5
  comment?: string
  page?: string
}

export async function sendFeedback(input: NewFeedback) {
  const { data } = await api.post<{ data: { id: number; rating: number } }>('/feedback', input)
  return data.data
}