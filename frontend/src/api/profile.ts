import { api } from '../lib/api'

export type BodyProfile = {
  sizing: 'mens' | 'ladies'
  height_cm: number
  weight_kg: number | null
  chest_cm: number
  waist_cm: number
  hips_cm: number
}

export type SizeRecommendation = {
  sizing: 'mens' | 'ladies'
  top: { size: string; out_of_range: boolean }
  bottom: { size: string; out_of_range: boolean }
  by_measurement: { chest: string; waist: string; hips: string }
}

export async function fetchProfile() {
  const { data } = await api.get<{ data: BodyProfile | null }>('/profile')
  return data.data
}

export async function saveProfile(profile: BodyProfile) {
  const { data } = await api.put<{ data: BodyProfile }>('/profile', profile)
  return data.data
}

export async function fetchSizeRecommendation() {
  const { data } = await api.get<{ data: SizeRecommendation | null }>('/size-recommendation')
  return data.data
}