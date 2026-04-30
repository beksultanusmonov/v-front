import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchVacancies } from '../../lib/contentApi'
import { subscribeEmployeeEvents } from '../../lib/eventsApi'
import { getResumeByEmail } from '../../lib/resumeApi'

function formatRelativeDate(isoDate) {
  if (!isoDate) return 'Hozirgina'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))
  if (minutes < 60) return `${minutes} daqiqa oldin`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} soat oldin`
  return `${Math.floor(hours / 24)} kun oldin`
}

function ProfilePage() {
  const { role, fullName, email, companyName, userId, updateAuthState } = useOutletContext()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileForm, setProfileForm] = useState({
    fullName,
    email,
    companyName: companyName || '',
  })
  const [allVacancies, setAllVacancies] = useState([])
  const [resumeProgress, setResumeProgress] = useState('0%')
  const [showAppliedDetails, setShowAppliedDetails] = useState(false)
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const items = await fetchVacancies()
        if (isMounted) setAllVacancies(Array.isArray(items) ? items : [])
      } catch {
        if (isMounted) setAllVacancies([])
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (role !== 'employee') return undefined
    return subscribeEmployeeEvents({
      userId: String(userId || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      onEvent: async () => {
        try {
          const items = await fetchVacancies()
          setAllVacancies(Array.isArray(items) ? items : [])
        } catch {
          setAllVacancies([])
        }
      },
    })
  }, [role, userId, email])

  useEffect(() => {
    if (role !== 'employee') return undefined
    let isMounted = true
    ;(async () => {
      try {
        const resume = await getResumeByEmail(email, userId)
        if (!isMounted) return
        if (!resume) {
          setResumeProgress('0%')
          return
        }
        const requiredFields = ['fullName', 'email', 'phone', 'location', 'summary', 'skills', 'experience', 'education']
        const filledCount = requiredFields.filter((field) => String(resume[field] || '').trim().length > 0).length
        const progress = Math.round((filledCount / requiredFields.length) * 100)
        setResumeProgress(`${progress}%`)
      } catch {
        if (isMounted) setResumeProgress('0%')
      }
    })()
    return () => {
      isMounted = false
    }
  }, [role, email, userId])

  const ownedVacancies = useMemo(() => {
    if (role !== 'company') return []
    return allVacancies.filter((item) => String(item.ownerUserId || '') === String(userId || ''))
  }, [allVacancies, role, userId])

  const appliedVacancies = useMemo(() => {
    if (role !== 'employee') return []
    const normalizedEmail = String(email || '').toLowerCase().trim()
    const normalizedUserId = String(userId || '').trim()
    return allVacancies
      .map((vacancy) => {
        const applicant = (vacancy.applicantsList || []).find((candidate) => {
          if (normalizedUserId && String(candidate.userId || '') === normalizedUserId) return true
          return String(candidate.email || '').toLowerCase() === normalizedEmail
        })
        if (!applicant) return null
        return { vacancy, applicant }
      })
      .filter(Boolean)
  }, [allVacancies, role, email, userId])

  const profileStats =
    role === 'company'
      ? [
          {
            label: 'Aktiv vakansiyalar',
            value: String(ownedVacancies.filter((item) => item.status === 'active').length),
          },
          {
            label: 'Noactive vakansiyalar',
            value: String(ownedVacancies.filter((item) => item.status === 'inactive').length),
          },
          {
            label: 'User ID',
            value: String(userId || 'ID yo‘q'),
          },
        ]
      : [
          { label: 'Topshirilgan vakansiyalar', value: String(appliedVacancies.length), key: 'applied-vacancies' },
          { label: 'Profil holati', value: 'Faol' },
          { label: 'Resume progress', value: resumeProgress },
        ]

  const handleProfileInput = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
    setProfileError('')
    setProfileSuccess('')
  }

  const handleProfileSave = (event) => {
    event.preventDefault()
    const immutableEmail = String(email || '').trim()

    if (!profileForm.fullName.trim() || !immutableEmail) {
      setProfileError('Ism va email maydonlari majburiy.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(immutableEmail)) {
      setProfileError('Email formati noto‘g‘ri.')
      return
    }
    if (role === 'company' && !profileForm.companyName.trim()) {
      setProfileError('Kompaniya nomi majburiy.')
      return
    }

    const currentAuth = (() => {
      try {
        const raw = localStorage.getItem('yourjob_auth')
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    })()

    const nextAuth = {
      ...currentAuth,
      fullName: profileForm.fullName.trim(),
      email: immutableEmail,
      companyName: role === 'company' ? profileForm.companyName.trim() : '',
      profileUpdatedAt: new Date().toISOString(),
    }

    localStorage.setItem('yourjob_auth', JSON.stringify(nextAuth))
    if (typeof updateAuthState === 'function') {
      updateAuthState(nextAuth)
    }
    setProfileSuccess('Profil ma’lumotlari muvaffaqiyatli yangilandi.')
    setIsEditOpen(false)
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Barcha maydonlarni to‘ldiring.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Yangi parol va tasdiqlash bir xil emas.')
      return
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('Yangi parol avvalgi paroldan farq qilishi kerak.')
      return
    }

    const currentAuth = (() => {
      try {
        const raw = localStorage.getItem('yourjob_auth')
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    })()
    const nextAuth = {
      ...currentAuth,
      passwordUpdatedAt: new Date().toISOString(),
    }
    localStorage.setItem('yourjob_auth', JSON.stringify(nextAuth))
    if (typeof updateAuthState === 'function') {
      updateAuthState(nextAuth)
    }

    setPasswordSuccess('Parolingiz muvaffaqiyatli yangilandi.')
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/80 to-cyan-500/80 text-lg font-black text-white">
              {initials || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{fullName}</h3>
              <p className="text-sm text-slate-300">{email}</p>
              {role === 'company' && companyName ? (
                <p className="text-xs font-semibold text-slate-300">{companyName}</p>
              ) : null}
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">
                {role === 'company' ? 'Kompaniya profili' : 'Xodim profili'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setProfileForm({
                fullName,
                email,
                companyName: companyName || '',
              })
              setProfileError('')
              setProfileSuccess('')
              setIsEditOpen(true)
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
          >
            Profilni tahrirlash
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {profileStats.map((item) => (
            item.key === 'applied-vacancies' ? (
              <button
                key={item.label}
                type="button"
                onClick={() => setShowAppliedDetails((prev) => !prev)}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-left transition hover:border-indigo-400/60"
              >
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-cyan-300">
                  {showAppliedDetails ? 'Yopish' : 'Ko‘rish uchun bosing'}
                </p>
              </button>
            ) : (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-xl font-black text-white">{item.value}</p>
              </div>
            )
          ))}
        </div>
        {role === 'employee' && showAppliedDetails ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h4 className="text-sm font-bold text-white">Topshirilgan vakansiyalar</h4>
            {appliedVacancies.length === 0 ? (
              <p className="text-sm text-slate-300">Hozircha vakansiyaga ariza topshirmagansiz.</p>
            ) : (
              appliedVacancies.map(({ vacancy, applicant }) => (
                <article key={`${vacancy.id}-${applicant.id}`} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{vacancy.title}</p>
                      <p className="mt-1 text-xs text-slate-300">
                        {vacancy.company || 'My Company'} • {vacancy.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        applicant.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : applicant.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-200'
                            : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {applicant.status === 'accepted'
                        ? 'Qabul qilingan'
                        : applicant.status === 'rejected'
                          ? 'Rad qilingan'
                          : 'Ko‘rib chiqilmoqda'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Topshirilgan: {formatRelativeDate(applicant.submittedAt)}</p>
                </article>
              ))
            )}
          </div>
        ) : null}
        {profileSuccess ? <p className="mt-4 text-sm font-semibold text-emerald-300">{profileSuccess}</p> : null}
      </article>

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4">
          <article className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-lg font-bold text-white">Profilni to‘liq tahrirlash</h4>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                Yopish
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleProfileSave}>
              <input
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileInput}
                placeholder="F.I.Sh"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
              />
              <input
                name="email"
                value={profileForm.email}
                readOnly
                placeholder="Email"
                className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-300 outline-none"
              />
              {role === 'company' ? (
                <input
                  name="companyName"
                  value={profileForm.companyName}
                  onChange={handleProfileInput}
                  placeholder="Kompaniya nomi"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
              ) : null}

              {profileError ? <p className="text-sm font-semibold text-rose-300">{profileError}</p> : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5 lg:col-span-2">
          <h4 className="text-base font-bold text-white">Asosiy ma’lumotlar</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">F.I.Sh</p>
              <p className="mt-1 font-semibold text-slate-100">{fullName}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Email</p>
              <p className="mt-1 break-all font-semibold text-slate-100">{email}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Rol</p>
              <p className="mt-1 font-semibold text-slate-100">{role === 'company' ? 'Kompaniya' : 'Xodim'}</p>
            </div>
            {role === 'company' ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Kompaniya nomi</p>
                <p className="mt-1 font-semibold text-slate-100">{companyName || 'Kiritilmagan'}</p>
              </div>
            ) : null}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Holat</p>
              <p className="mt-1 font-semibold text-emerald-300">Faol</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
          <h4 className="text-base font-bold text-white">Security</h4>
          <form className="mt-4 space-y-3" onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
              placeholder="Joriy parol"
            />
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
              placeholder="Yangi parol (min 8 belgi)"
            />
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
              placeholder="Yangi parolni tasdiqlang"
            />

            {passwordError ? <p className="text-xs font-semibold text-rose-300">{passwordError}</p> : null}
            {passwordSuccess ? <p className="text-xs font-semibold text-emerald-300">{passwordSuccess}</p> : null}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Parolni yangilash
            </button>
          </form>
        </article>
      </div>
    </div>
  )
}

export default ProfilePage
