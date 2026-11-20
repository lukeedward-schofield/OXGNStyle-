import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../auth/AuthContext'
import { TextField } from '../components/TextField'
import { applyServerErrors } from '../lib/errors'


const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 text-white">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Log in</h1>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-white py-2 font-medium text-black disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-sm text-neutral-400">
            New here?{' '}
            <Link to="/register" className="text-white underline">
                Create an account
            </Link>
        </p>
      </form>
    </main>
  )
}