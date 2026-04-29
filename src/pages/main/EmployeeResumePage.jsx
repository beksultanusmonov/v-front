import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getResumeByEmail, saveResume } from '../../lib/resumeApi'

const STORAGE_KEY = 'yourjob_employee_resume'

function splitByLine(value = '') {
  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitByComma(value = '') {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getInitialResume(fullName = '', email = '') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        fullName,
        email,
        phone: '',
        location: '',
        summary: '',
        skills: '',
        experience: '',
        education: '',
        portfolio: '',
      }
    }
    const parsed = JSON.parse(raw)
    return {
      fullName: parsed.fullName || fullName,
      email: parsed.email || email,
      phone: parsed.phone || '',
      location: parsed.location || '',
      summary: parsed.summary || '',
      skills: parsed.skills || '',
      experience: parsed.experience || '',
      education: parsed.education || '',
      portfolio: parsed.portfolio || '',
    }
  } catch {
    return {
      fullName,
      email,
      phone: '',
      location: '',
      summary: '',
      skills: '',
      experience: '',
      education: '',
      portfolio: '',
    }
  }
}

function EmployeeResumePage() {
  const { userId, fullName, email } = useOutletContext()
  const [form, setForm] = useState(() => getInitialResume(fullName, email))
  const [isSaving, setIsSaving] = useState(false)
  const skillItems = useMemo(() => splitByComma(form.skills), [form.skills])
  const experienceItems = useMemo(() => splitByLine(form.experience), [form.experience])
  const educationItems = useMemo(() => splitByLine(form.education), [form.education])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      if (!email) return
      try {
        const remoteResume = await getResumeByEmail(email, userId)
        if (isMounted && remoteResume) {
          setForm((prev) => ({
            ...prev,
            ...remoteResume,
            fullName: remoteResume.fullName || fullName,
            email: remoteResume.email || email,
          }))
        }
      } catch {
        // fallback to local data only
      }
    })()
    return () => {
      isMounted = false
    }
  }, [email, fullName, userId])

  const completion = useMemo(() => {
    const fields = ['fullName', 'email', 'phone', 'location', 'summary', 'skills', 'experience', 'education']
    const completed = fields.filter((key) => String(form[key] || '').trim().length > 0).length
    return Math.round((completed / fields.length) * 100)
  }, [form])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const payload = { ...form, userId, email: form.email || email, fullName: form.fullName || fullName }
      await saveResume(payload)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      toast.success('Resume saqlandi')
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      toast.error('Serverga saqlanmadi, local holatda saqlandi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Resume Builder</p>
            <h3 className="mt-2 text-2xl font-black text-white">Professional rezume yarating</h3>
          </div>
          <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-200">
            To‘ldirish: {completion}%
          </span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </article>

      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5 lg:col-span-2">
          <h4 className="text-base font-bold text-white">Asosiy ma’lumotlar</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="F.I.Sh"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Telefon raqam"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Shahar"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
          </div>

          <h4 className="mt-6 text-base font-bold text-white">Kasbiy ma’lumot</h4>
          <div className="mt-4 space-y-3">
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="O‘zingiz haqingizda qisqacha..."
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <textarea
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Ko‘nikmalar (masalan: React, Node.js, SQL)"
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Ish tajribasi"
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <textarea
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="Ta’lim"
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
            <input
              name="portfolio"
              value={form.portfolio}
              onChange={handleChange}
              placeholder="Portfolio yoki GitHub linki"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
          <h4 className="text-base font-bold text-white">Amallar</h4>
          <p className="mt-2 text-sm text-slate-300">
            Ma’lumotlarni saqlang, keyin vakansiyalarga ariza topshirishda shu resume’dan foydalaning.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            {isSaving ? 'Saqlanmoqda...' : 'Resume ni saqlash'}
          </button>
        </article>
      </form>

      <article className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/20">
        <div className="grid lg:grid-cols-[260px_1fr]">
          <aside className="bg-slate-900 px-6 py-8 text-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-300 bg-slate-800 text-xl font-bold text-cyan-200">
              {String(form.fullName || 'CV')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((item) => item[0]?.toUpperCase())
                .join('') || 'CV'}
            </div>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight text-white">{form.fullName || 'F.I.Sh'}</h3>
            <p className="mt-1 text-sm text-cyan-200">Frontend / React Developer</p>

            <section className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Contact</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <p>{form.email || 'Email kiriting'}</p>
                <p>{form.phone || 'Telefon kiriting'}</p>
                <p>{form.location || 'Manzil kiriting'}</p>
                {form.portfolio ? <p className="break-all text-cyan-200">{form.portfolio}</p> : null}
              </div>
            </section>

            <section className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Skills</h4>
              {skillItems.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {skillItems.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex w-fit items-center rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Ko‘nikmalar kiriting.</p>
              )}
            </section>
          </aside>

          <div className="px-6 py-8 md:px-8">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Premium Resume Template</p>
              <h4 className="mt-2 text-lg font-bold text-slate-900">Professional Summary</h4>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {form.summary || 'Bu joyda nomzodning professional qisqacha tavsifi ko‘rinadi.'}
              </p>
            </div>

            <section className="mt-6">
              <h4 className="text-lg font-bold text-slate-900">Work Experience</h4>
              {experienceItems.length ? (
                <ul className="mt-3 space-y-3">
                  {experienceItems.map((item) => (
                    <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Ish tajribasi satrma-satr shu yerda chiqadi.</p>
              )}
            </section>

            <section className="mt-6">
              <h4 className="text-lg font-bold text-slate-900">Education</h4>
              {educationItems.length ? (
                <ul className="mt-3 space-y-3">
                  {educationItems.map((item) => (
                    <li key={item} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-sm leading-6 text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Ta’lim ma’lumotlari shu yerda chiqadi.</p>
              )}
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}

export default EmployeeResumePage
