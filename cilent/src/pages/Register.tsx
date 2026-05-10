import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters')
})

type RegisterInput = z.infer<typeof registerSchema>

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError('')
      const res = await api.post('/auth/register', data)
      login(res.data.data.token, res.data.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">

      {/* left — branding panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 flex-col justify-between p-12">
        <div>
          <span className="text-white text-sm font-medium tracking-widest uppercase">
            Taskflow
          </span>
        </div>
        <div className="space-y-4 slide-up">
          <h1 className="text-white text-4xl leading-tight">
            Start building<br />with your team.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Create your workspace in seconds. Invite members, assign tasks, ship faster.
          </p>
        </div>
        <div className="flex gap-6">
          {['Projects', 'Tasks', 'Teams'].map((item) => (
            <div key={item} className="text-slate-600 text-xs tracking-wider uppercase">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* right — form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 fade-in">

          {/* header */}
          <div className="space-y-1">
            <h2 className="text-2xl text-slate-900">Create account</h2>
            <p className="text-sm text-slate-500 font-light">
              Set up your workspace today
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                Full Name
              </label>
              <Input
                placeholder="Ali Khan"
                className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 rounded-lg font-light"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 rounded-lg font-light"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                Password
              </label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 rounded-lg font-light"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-sm font-medium tracking-wide transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </Button>
          </form>

          {/* divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAFAF9] px-3 text-xs text-slate-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 font-light">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-slate-900 font-medium hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register