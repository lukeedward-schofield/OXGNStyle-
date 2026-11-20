import { api } from '../lib/api'

export type HealthResponse = { status: string; app: string; time: string }

export async function getHealth() {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}