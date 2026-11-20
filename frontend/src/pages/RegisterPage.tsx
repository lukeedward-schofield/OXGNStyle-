import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../auth/AuthContext'
import { TextField } from '../components/TextField'
import { applyServerErrors } from '../lib/errors'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Use at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: signUp } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values)
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
        <h1 className="text-2xl font-bold">Create account</h1>
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-white py-2 font-medium text-black disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-sm text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}