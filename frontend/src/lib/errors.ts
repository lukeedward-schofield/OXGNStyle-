import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (isAxiosError(error) && error.response?.status === 422) {
    const errors = error.response.data?.errors as Record<string, string[]> | undefined
    if (errors) {
      for (const [field, messages] of Object.entries(errors)) {
        setError(field as Path<T>, { message: messages[0] })
      }
      return true
    }
  }
  return false
}