import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { registerUser } from '../lib/authApi'

const roleOptions = [
  { id: 'employee', label: 'Xodim sifatida ro‘yxatdan o‘tish' },
  { id: 'company', label: 'Kompaniya sifatida ro‘yxatdan o‘tish' },
]

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  jobTitle: '',
  experience: '',
  companyName: '',
  industry: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('employee')
  const [formData, setFormData] = useState(initialForm)
  const [touched, setTouched] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const errors = useMemo(() => {
    const result = {}
    if (!formData.fullName.trim()) result.fullName = 'Ism-familiyangizni kiriting.'
    if (!formData.email.trim()) result.email = 'Email kiritilishi shart.'
    if (!/\S+@\S+\.\S+/.test(formData.email)) result.email = 'Email formati noto‘g‘ri.'
    if (formData.password.length < 8) result.password = 'Parol kamida 8 ta belgidan iborat bo‘lishi kerak.'
    if (formData.confirmPassword !== formData.password) result.confirmPassword = 'Parollar bir xil emas.'

    if (role === 'employee') {
      if (!formData.jobTitle.trim()) result.jobTitle = 'Kasb yo‘nalishini kiriting.'
      if (!formData.experience.trim()) result.experience = 'Tajriba darajasini kiriting.'
    } else {
      if (!formData.companyName.trim()) result.companyName = 'Kompaniya nomi majburiy.'
      if (!formData.industry.trim()) result.industry = 'Soha nomini kiriting.'
    }
    return result
  }, [formData, role])

  const isValid = Object.keys(errors).length === 0

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!isValid) {
      toast.error('Formani to‘g‘ri to‘ldiring.')
      return
    }

    try {
      const user = await registerUser({
        role,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyName: role === 'company' ? formData.companyName.trim() : '',
      })

      navigate(role === 'company' ? '/main/all-vacancy' : '/main/profile', {
        state: {
          id: user.id ?? user.userId ?? null,
          userId: user.id ?? user.userId ?? null,
          role: user.role || role,
          fullName: user.fullName || formData.fullName,
          email: user.email || formData.email,
          companyName: user.companyName || (role === 'company' ? formData.companyName.trim() : ''),
        },
      })
      toast.success('Muvaffaqiyatli ro‘yxatdan o‘tildi!')
    } catch (error) {
      const message = error?.response?.data?.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  const sharedInputClass =
    'mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl lg:grid-cols-5">
        <aside className="border-b border-slate-800 p-7 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/90 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"
          >
            <span aria-hidden="true">←</span>
            Bosh sahifa
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">YourJob Auth</p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-white">Mukammal karyerani shu yerdan boshlang</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Hisob oching, profilingizni to‘ldiring va platformadagi ish o‘rinlari hamda karyera vositalaridan
            foydalanishni boshlang.
          </p>
          <div className="mt-7 space-y-3 text-sm text-slate-300">
            <p>• Profil asosida mos vakansiyalar tavsiya qilinadi.</p>
            <p>• Smart resume builder orqali tez ariza yuborasiz.</p>
            <p>• Kompaniya panelida nomzodlarni boshqarasiz.</p>
          </div>
        </aside>

        <div className="p-7 lg:col-span-3 lg:p-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">Ro‘yxatdan o‘tish</h2>
            <Link className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200" to="/accaunt/login">
              Akkountim bor, kirish
            </Link>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  role === option.id
                    ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-200">
                Ism-familiya
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={sharedInputClass}
                  placeholder="Ali Valiyev"
                />
                {touched && errors.fullName ? <p className="mt-1 text-xs text-rose-300">{errors.fullName}</p> : null}
              </label>
              <label className="text-sm text-slate-200">
                Email
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={sharedInputClass}
                  placeholder="you@example.com"
                />
                {touched && errors.email ? <p className="mt-1 text-xs text-rose-300">{errors.email}</p> : null}
              </label>
              <label className="text-sm text-slate-200">
                Parol
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={sharedInputClass}
                  placeholder="Kamida 8 ta belgi"
                />
                {touched && errors.password ? <p className="mt-1 text-xs text-rose-300">{errors.password}</p> : null}
              </label>
              <label className="text-sm text-slate-200">
                Parolni tasdiqlang
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={sharedInputClass}
                  placeholder="Parolni qayta kiriting"
                />
                {touched && errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-rose-300">{errors.confirmPassword}</p>
                ) : null}
              </label>
            </div>

            {role === 'employee' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-200">
                  Kasbingiz
                  <input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className={sharedInputClass}
                    placeholder="Frontend Developer"
                  />
                  {touched && errors.jobTitle ? <p className="mt-1 text-xs text-rose-300">{errors.jobTitle}</p> : null}
                </label>
                <label className="text-sm text-slate-200">
                  Tajriba
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={sharedInputClass}
                    placeholder="2 yil"
                  />
                  {touched && errors.experience ? (
                    <p className="mt-1 text-xs text-rose-300">{errors.experience}</p>
                  ) : null}
                </label>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-200">
                  Kompaniya nomi
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={sharedInputClass}
                    placeholder="YourJob LLC"
                  />
                  {touched && errors.companyName ? (
                    <p className="mt-1 text-xs text-rose-300">{errors.companyName}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-200">
                  Faoliyat sohasi
                  <input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={sharedInputClass}
                    placeholder="IT / Fintech"
                  />
                  {touched && errors.industry ? <p className="mt-1 text-xs text-rose-300">{errors.industry}</p> : null}
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Ro‘yxatdan o‘tib dashboardga o‘tish
            </button>
            {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}
          </form>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
