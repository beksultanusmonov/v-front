import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser } from '../lib/authApi'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.email || !formData.password) {
      const message = 'Email va parolni to‘liq kiriting.'
      setError(message)
      toast.error(message)
      return
    }
    try {
      const user = await loginUser({ email: formData.email, password: formData.password })
      navigate(user.role === 'company' ? '/main/all-vacancy' : '/main/profile', {
        state: {
          id: user.id ?? user.userId ?? null,
          userId: user.id ?? user.userId ?? null,
          role: user.role || 'employee',
          fullName: user.fullName || 'Foydalanuvchi',
          email: user.email || formData.email,
          companyName: user.companyName || '',
        },
      })
      toast.success('Muvaffaqiyatli tizimga kirildi!')
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Kirishda xatolik yuz berdi.'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/65 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/90 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"
        >
          <span aria-hidden="true">←</span>
          Bosh sahifa
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black text-white">Kirish</h1>
        <p className="mt-2 text-sm text-slate-300">Platformaga kirib vakansiyalar va profilingizni boshqaring.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm text-slate-200">
            Parol
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolingiz"
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Dashboardga kirish
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Akkountingiz yo‘qmi?{' '}
          <Link className="font-semibold text-cyan-300 transition hover:text-cyan-200" to="/accaunt/register">
            Ro‘yxatdan o‘tish
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
