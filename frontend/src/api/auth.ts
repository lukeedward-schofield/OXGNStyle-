import { api } from '../lib/api'

export type User = { id: number; name: string; email: string }

export type LoginInput = { email: string; password: string }
export type RegisterInput = LoginInput & { name: string; password_confirmation: string }

type AuthResponse = { data: { user: User; token: string } }

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/login', input)
  return data.data
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<AuthResponse>('/register', input)
  return data.data
}

export async function logout() {
  await api.post('/logout')
}

export async function fetchMe() {
  const { data } = await api.get<{ data: User }>('/me')
  return data.data
}