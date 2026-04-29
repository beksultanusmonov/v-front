import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchVacancyById, applyToVacancy } from '../../lib/contentApi'
import { getResumeByEmail } from '../../lib/resumeApi'
import { useTheme } from '../../theme/ThemeContext'
import { formatSalaryUzs } from '../../lib/salary'

function VacancyDetailPage({ basePath = '/main/all-vacancy' }) {
  const { vacancyId } = useParams()
  const [vacancy, setVacancy] = useState(undefined)
  const [isApplying, setIsApplying] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const authState = useMemo(() => {
    try {
      const raw = localStorage.getItem('yourjob_auth')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])
  const role = authState?.role === 'company' ? 'company' : 'employee'
  const isAuthenticated = Boolean(authState?.email)
  const userId = authState?.id || ''
  const email = authState?.email || ''
  const fullName = authState?.fullName || ''
  const companyName = authState?.companyName || ''
  const pageClasses = isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
  const cardClasses = isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-800 bg-slate-900/75'
  const titleClasses = isLight ? 'text-slate-900' : 'text-white'
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400'

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const item = await fetchVacancyById(vacancyId)
      if (isMounted) setVacancy(item || null)
    })()
    return () => {
      isMounted = false
    }
  }, [vacancyId])

  const handleApply = async () => {
    if (!email) {
      toast.error('Avval tizimga kiring.')
      return
    }
    setIsApplying(true)
    try {
      const resume = await getResumeByEmail(email, userId)
      if (!resume) {
        toast.error('Avval Resume bo‘limida rezumeni saqlang.')
        return
      }
      const candidate = await applyToVacancy(vacancyId, { userId, email, fullName })
      setVacancy((prev) => {
        if (!prev) return prev
        const applicantsList = Array.isArray(prev.applicantsList) ? [...prev.applicantsList] : []
        const index = applicantsList.findIndex((item) => item.email === candidate.email)
        if (index >= 0) applicantsList[index] = candidate
        else applicantsList.unshift(candidate)
        return { ...prev, applicantsList }
      })
      toast.success('Resume muvaffaqiyatli topshirildi.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Resume yuborishda xatolik yuz berdi.'
      toast.error(message)
    } finally {
      setIsApplying(false)
    }
  }

  if (vacancy === undefined) {
    return (
      <main className={`min-h-screen px-4 py-8 sm:px-6 ${pageClasses}`}>
        <section className={`mx-auto w-full max-w-6xl rounded-3xl border p-6 text-center ${cardClasses}`}>
          <p className={`text-sm ${mutedText}`}>Yuklanmoqda...</p>
        </section>
      </main>
    )
  }

  if (!vacancy) {
    return (
      <main className={`min-h-screen px-4 py-8 sm:px-6 ${pageClasses}`}>
        <section className={`mx-auto w-full max-w-6xl rounded-3xl border p-6 text-center ${cardClasses}`}>
          <h3 className={`text-2xl font-black ${titleClasses}`}>Vakansiya topilmadi</h3>
          <p className={`mt-2 text-sm ${mutedText}`}>Ushbu e’lon mavjud emas yoki o‘chirib yuborilgan.</p>
          <Link
            to={basePath}
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            All Vacancy ga qaytish
          </Link>
        </section>
      </main>
    )
  }

  const isOwner =
    role === 'company' &&
    (String(vacancy.ownerUserId || '') === String(userId || '') ||
      [companyName, fullName].filter(Boolean).includes(vacancy.company))
  const myApplication = (vacancy.applicantsList || []).find((candidate) => {
    if (userId && String(candidate.userId || '') === String(userId)) return true
    return String(candidate.email || '').toLowerCase() === email.toLowerCase()
  })
  const hasApplied = role === 'employee' && Boolean(myApplication)
  const myApplicationStatus =
    myApplication?.status === 'accepted' ? 'Qabul qilingan' : myApplication?.status === 'rejected' ? 'Rad qilingan' : 'Ko‘rib chiqilmoqda'
  const softCardClasses = isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/70'
  const normalText = isLight ? 'text-slate-700' : 'text-slate-300'
  const dividerClasses = isLight ? 'border-slate-200' : 'border-slate-800'
  const companyBadgeClasses = isLight ? 'bg-blue-50 text-blue-700' : 'bg-indigo-500/20 text-indigo-200'
  const skillBadgeClasses = isLight ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-slate-200'

  return (
    <main className={`min-h-screen px-4 py-8 sm:px-6 md:py-10 ${pageClasses}`}>
      <section className="mx-auto w-full max-w-7xl">
        <Link to={basePath} className={`mb-4 inline-flex items-center gap-1 text-sm transition ${mutedText} ${isLight ? 'hover:text-slate-700' : 'hover:text-slate-200'}`}>
          <span aria-hidden="true">←</span>
          Orqaga
        </Link>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className={`rounded-3xl border p-5 md:p-7 ${cardClasses}`}>
            <div className="flex items-start gap-4">
              <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${companyBadgeClasses}`}>
                {(vacancy.company || 'VC')
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h1 className={`text-3xl font-black md:text-4xl ${titleClasses}`}>{vacancy.title}</h1>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  {vacancy.company || 'My Company'} • {vacancy.location}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">{vacancy.type}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">{vacancy.experience}</span>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700">{vacancy.level}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Maosh</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatSalaryUzs(vacancy.salary)}</p>
              </div>
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Ish turi</p>
                <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{vacancy.type}</p>
              </div>
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Lokatsiya</p>
                <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{vacancy.location}</p>
              </div>
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Tajriba</p>
                <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{vacancy.experience}</p>
              </div>
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Daraja</p>
                <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{vacancy.level}</p>
              </div>
              <div className={`rounded-xl border p-3 ${softCardClasses}`}>
                <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Yangilangan</p>
                <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {(vacancy.updatedAt || '').slice(0, 10) || '—'}
                </p>
              </div>
            </div>

            <section className={`mt-6 border-t pt-5 ${dividerClasses}`}>
              <h4 className={`text-xl font-bold ${titleClasses}`}>Ish haqida</h4>
              <p className={`mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{vacancy.about}</p>
            </section>

            <section className={`mt-6 border-t pt-5 ${dividerClasses}`}>
              <h4 className={`text-xl font-bold ${titleClasses}`}>Talablar</h4>
              <ul className={`mt-3 space-y-2 text-sm ${normalText}`}>
                {(vacancy.requirements || []).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`mt-6 border-t pt-5 ${dividerClasses}`}>
              <h4 className={`text-xl font-bold ${titleClasses}`}>Vazifalar</h4>
              <ul className={`mt-3 space-y-2 text-sm ${normalText}`}>
                {(vacancy.responsibilities || vacancy.requirements || []).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`mt-6 border-t pt-5 ${dividerClasses}`}>
              <h4 className={`text-xl font-bold ${titleClasses}`}>Ko‘nikmalar</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {(vacancy.technologies || []).map((tech) => (
                  <span key={tech} className={`rounded-full px-3 py-1 text-xs font-semibold ${skillBadgeClasses}`}>
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-4">
            <article className={`sticky top-4 rounded-3xl border p-4 ${cardClasses}`}>
              <p className="text-3xl font-black text-emerald-600">{formatSalaryUzs(vacancy.salary)}</p>
              <p className={`mt-2 text-xs ${mutedText}`}>Muddat: {(vacancy.updatedAt || '').slice(0, 10) || '—'}</p>

              {role === 'employee' && isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying || hasApplied}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {hasApplied ? 'Allaqachon topshirilgan' : isApplying ? 'Yuborilmoqda...' : 'Ariza topshirish'}
                </button>
              ) : null}
              {role === 'employee' && !isAuthenticated ? (
                <Link
                  to="/accaunt/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Ariza topshirish uchun kiring
                </Link>
              ) : null}
              {hasApplied ? (
                <p className={`mt-3 text-xs font-semibold ${myApplication?.status === 'accepted' ? 'text-emerald-500' : myApplication?.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                  Holat: {myApplicationStatus}
                </p>
              ) : null}
            </article>

            <article className={`rounded-3xl border p-4 ${cardClasses}`}>
              <div className="flex items-center gap-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${companyBadgeClasses}`}>
                  {(vacancy.company || 'VC')
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${titleClasses}`}>{vacancy.company || 'My Company'}</p>
                  <p className={`text-xs ${mutedText}`}>{vacancy.location}</p>
                </div>
              </div>
              <p className={`mt-3 line-clamp-3 text-sm ${mutedText}`}>{vacancy.about}</p>
            </article>

            {role === 'company' && isOwner ? (
              <article className={`rounded-3xl border p-4 ${cardClasses}`}>
                <h4 className={`text-sm font-bold ${titleClasses}`}>Topshirilgan resumelar</h4>
                <p className={`mt-2 text-sm ${mutedText}`}>
                  Topshirilganlar soni: <span className="font-semibold">{(vacancy.applicantsList || []).length}</span>
                </p>
                <p className={`mt-1 text-xs ${mutedText}`}>
                  Nomzodlar ro‘yxati faqat `My Vacancy` bo‘limida ko‘rinadi.
                </p>
              </article>
            ) : null}

            {role === 'company' && !isOwner ? (
              <article className={`rounded-3xl border p-4 ${cardClasses}`}>
                <h4 className={`text-sm font-bold ${titleClasses}`}>Topshirilgan resumelar</h4>
                <p className={`mt-2 text-sm ${mutedText}`}>
                  Bu vakansiya sizga tegishli emasligi sababli nomzodlar ro‘yxatini ko‘ra olmaysiz.
                </p>
              </article>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default VacancyDetailPage
