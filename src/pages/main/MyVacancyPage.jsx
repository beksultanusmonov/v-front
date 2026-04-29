import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createVacancy, fetchVacancies, updateVacancy } from '../../lib/contentApi'
import { getResumeById } from '../../lib/resumeApi'
import { formatSalaryUzs, parseSalary } from '../../lib/salary'

const initialForm = {
  title: '',
  location: '',
  type: 'Full-time',
  level: 'Junior',
  experience: '',
  salary: '',
  about: '',
  requirementsText: '',
  technologiesText: '',
}

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

function MyVacancyPage() {
  const { userId, companyName } = useOutletContext()
  const [vacancies, setVacancies] = useState([])
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [serverError, setServerError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingVacancyId, setEditingVacancyId] = useState(null)
  const [openedApplicantsId, setOpenedApplicantsId] = useState(null)
  const [selectedResume, setSelectedResume] = useState(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isResumeLoading, setIsResumeLoading] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeCache, setResumeCache] = useState({})

  const ownerId = userId ? String(userId) : ''

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const items = await fetchVacancies()
        if (!isMounted) return
        const owned = items.filter((item) => {
          if (!ownerId) return true
          return String(item.ownerUserId || '') === ownerId
        })
        setVacancies(owned)
      } catch {
        if (isMounted) {
          setVacancies([])
          setServerError('Vakansiyalarni yuklashda xatolik yuz berdi.')
        }
      }
    })()
    return () => {
      isMounted = false
    }
  }, [ownerId])

  const filteredVacancies = useMemo(() => {
    if (activeFilter === 'all') return vacancies
    return vacancies.filter((item) => item.status === activeFilter)
  }, [activeFilter, vacancies])

  const handleInput = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  const handleCreateOrUpdateVacancy = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.location.trim() || !form.experience.trim() || !form.about.trim()) {
      setFormError('Title, location, experience va about maydonlari majburiy.')
      return
    }

    const requirements = form.requirementsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const technologies = form.technologiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (requirements.length === 0 || technologies.length === 0) {
      setFormError('Kamida bitta requirement va bitta technology kiriting.')
      return
    }

    const vacancyPayload = {
      title: form.title.trim(),
      company: companyName || 'My Company',
      ownerUserId: userId || null,
      location: form.location.trim(),
      type: form.type,
      level: form.level,
      experience: form.experience.trim(),
      salary: parseSalary(form.salary),
      about: form.about.trim(),
      requirements,
      responsibilities: requirements,
      technologies,
      updatedAt: new Date().toISOString(),
    }

    try {
      if (editingVacancyId) {
        await updateVacancy(editingVacancyId, vacancyPayload)
      } else {
        await createVacancy({
          ...vacancyPayload,
          applicantsList: [],
          status: 'inactive',
        })
      }
      const items = await fetchVacancies()
      const owned = items.filter((item) => {
        if (!ownerId) return true
        return String(item.ownerUserId || '') === ownerId
      })
      setVacancies(owned)
      setServerError('')
    } catch {
      setFormError('Vakansiyani saqlashda xatolik yuz berdi.')
      return
    }

    setForm(initialForm)
    setFormError('')
    setIsCreateModalOpen(false)
    setEditingVacancyId(null)
  }

  const handleStatusToggle = async (id) => {
    const current = vacancies.find((item) => String(item.id) === String(id))
    if (!current) return
    try {
      await updateVacancy(id, {
        status: current.status === 'active' ? 'inactive' : 'active',
      })
      setVacancies((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, status: item.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() }
            : item
        )
      )
    } catch {
      setServerError('Vakansiya statusini yangilashda xatolik yuz berdi.')
    }
  }

  const getApplicantsCount = (vacancy) => {
    if (Array.isArray(vacancy.applicantsList)) return vacancy.applicantsList.length
    return vacancy.applicants || 0
  }

  const handleApplicantDecision = async (vacancyId, applicantId, nextStatus) => {
    const targetVacancy = vacancies.find((item) => String(item.id) === String(vacancyId))
    if (!targetVacancy) return
    const applicantsList = (targetVacancy.applicantsList || []).map((candidate) =>
      candidate.id === applicantId ? { ...candidate, status: nextStatus } : candidate
    )
    try {
      await updateVacancy(vacancyId, { applicantsList })
      setVacancies((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(vacancyId)) return item
          return { ...item, applicantsList, updatedAt: new Date().toISOString() }
        })
      )
    } catch {
      setServerError('Nomzod holatini yangilashda xatolik yuz berdi.')
    }
  }

  const handleEditVacancy = (vacancy) => {
    setEditingVacancyId(vacancy.id)
    setForm({
      title: vacancy.title,
      location: vacancy.location,
      type: vacancy.type,
      level: vacancy.level,
      experience: vacancy.experience,
      salary: vacancy.salary ? String(vacancy.salary) : '',
      about: vacancy.about,
      requirementsText: vacancy.requirements.join('\n'),
      technologiesText: vacancy.technologies.join(', '),
    })
    setFormError('')
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingVacancyId(null)
    setForm(initialForm)
    setFormError('')
  }

  const handleOpenResume = async (resumeId) => {
    const normalizedResumeId = String(resumeId || '').trim()
    if (!normalizedResumeId) {
      setResumeError('Resume ID topilmadi.')
      setIsResumeModalOpen(true)
      return
    }

    setResumeError('')
    setIsResumeModalOpen(true)
    if (resumeCache[normalizedResumeId]) {
      setSelectedResume(resumeCache[normalizedResumeId])
      return
    }

    setIsResumeLoading(true)
    setSelectedResume(null)
    try {
      const resume = await getResumeById(normalizedResumeId)
      if (!resume) {
        setResumeError('Resume topilmadi.')
        return
      }
      setSelectedResume(resume)
      setResumeCache((prev) => ({ ...prev, [normalizedResumeId]: resume }))
    } catch {
      setResumeError('Resume ni yuklashda xatolik yuz berdi.')
    } finally {
      setIsResumeLoading(false)
    }
  }

  const handleCloseResumeModal = () => {
    setIsResumeModalOpen(false)
    setIsResumeLoading(false)
    setResumeError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditingVacancyId(null)
            setForm(initialForm)
            setFormError('')
            setIsCreateModalOpen(true)
          }}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Vakansiya yaratish
        </button>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4">
          <article className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Yangi vacancy yaratish</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Talablar va texnologiyalarni to‘liq kiriting. Yangi vacancy default holatda noactive yaratiladi.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                Yopish
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleCreateOrUpdateVacancy}>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Position nomi (masalan, Backend Engineer)"
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  placeholder="Lokatsiya (Toshkent / Remote)"
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInput}
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleInput}
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                >
                  <option>Junior</option>
                  <option>Middle</option>
                  <option>Senior</option>
                </select>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleInput}
                  placeholder="Tajriba (masalan, 3+ yil)"
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
                <input
                  name="salary"
                  value={form.salary}
                  onChange={handleInput}
                  placeholder="Maosh (masalan: 12000000)"
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
              </div>

              <textarea
                name="about"
                value={form.about}
                onChange={handleInput}
                rows={3}
                placeholder="Vacancy haqida qisqacha tavsif..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <textarea
                  name="requirementsText"
                  value={form.requirementsText}
                  onChange={handleInput}
                  rows={4}
                  placeholder={'Talablar (har birini yangi qatordan yozing)\nMasalan:\nNode.js tajribasi\nPostgreSQL bilimi'}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
                <textarea
                  name="technologiesText"
                  value={form.technologiesText}
                  onChange={handleInput}
                  rows={4}
                  placeholder="Texnologiyalar (vergul bilan): React, Node.js, PostgreSQL"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
                />
              </div>

              {formError ? <p className="text-sm font-semibold text-rose-300">{formError}</p> : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  {editingVacancyId ? 'Vacancy ni saqlash' : 'Vacancy yaratish'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Noactive' },
        ].map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeFilter === filter.id
                ? 'bg-indigo-500/25 text-indigo-100 ring-1 ring-indigo-400/50'
                : 'border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {serverError ? <p className="text-sm font-semibold text-rose-300">{serverError}</p> : null}
        {filteredVacancies.map((vacancy) => (
          <article
            key={vacancy.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5 transition hover:-translate-y-1 hover:border-indigo-400/50"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">{vacancy.title}</h3>
              </div>
              <span
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  vacancy.status === 'active' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                {vacancy.status === 'active' ? 'Active' : 'Noactive'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Nomzodlar</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{getApplicantsCount(vacancy)} ta</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Lokatsiya</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{vacancy.location}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Tajriba</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{vacancy.experience}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Type</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{vacancy.type}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Maosh</p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">{formatSalaryUzs(vacancy.salary)}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">{vacancy.about}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {vacancy.technologies.map((tech) => (
                <span key={`${vacancy.id}-${tech}`} className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleEditVacancy(vacancy)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
              >
                Tahrirlash
              </button>
              <button
                type="button"
                onClick={() => setOpenedApplicantsId((prev) => (prev === vacancy.id ? null : vacancy.id))}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
              >
                Topshirilgan nomzodlar
              </button>
              <button
                type="button"
                onClick={() => handleStatusToggle(vacancy.id)}
                className="rounded-lg bg-indigo-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                {vacancy.status === 'active' ? 'Noactive qilish' : 'Active qilish'}
              </button>
            </div>

            {openedApplicantsId === vacancy.id ? (
              <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                {(vacancy.applicantsList || []).length === 0 ? (
                  <p className="text-sm text-slate-300">Hozircha topshirilgan nomzodlar yo‘q.</p>
                ) : (
                  vacancy.applicantsList.map((candidate) => (
                    <div key={candidate.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{candidate.fullName}</p>
                          <p className="text-xs text-slate-300">{candidate.email}</p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                            candidate.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : candidate.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-200'
                                : 'bg-amber-500/20 text-amber-200'
                          }`}
                        >
                          {candidate.status === 'accepted'
                            ? 'Qabul qilingan'
                            : candidate.status === 'rejected'
                              ? 'Rad etilgan'
                              : 'Ko‘rib chiqilmoqda'}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenResume(candidate.resumeId)}
                          className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                        >
                          Resume ko‘rish
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplicantDecision(vacancy.id, candidate.id, 'accepted')}
                          className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-400"
                        >
                          Ishga qabul qilish
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplicantDecision(vacancy.id, candidate.id, 'rejected')}
                          className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-400"
                        >
                          Rad qilish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {isResumeModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <article className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Nomzod resume</h3>
                {selectedResume?.id ? <p className="text-xs text-slate-400">Resume ID: {selectedResume.id}</p> : null}
              </div>
              <button
                type="button"
                onClick={handleCloseResumeModal}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                Yopish
              </button>
            </div>

            {isResumeLoading ? <p className="text-sm text-slate-300">Resume yuklanmoqda...</p> : null}
            {resumeError ? <p className="text-sm font-semibold text-rose-300">{resumeError}</p> : null}

            {!isResumeLoading && !resumeError && selectedResume ? (
              <article className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/20">
                <div className="grid lg:grid-cols-[240px_1fr]">
                  <aside className="bg-slate-900 px-5 py-7 text-slate-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cyan-300 bg-slate-800 text-lg font-bold text-cyan-200">
                      {String(selectedResume.fullName || 'CV')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((item) => item[0]?.toUpperCase())
                        .join('') || 'CV'}
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold leading-tight text-white">{selectedResume.fullName || 'F.I.Sh'}</h3>
                    <p className="mt-1 text-xs text-cyan-200">Candidate Resume</p>

                    <section className="mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Contact</h4>
                      <div className="mt-3 space-y-2 text-sm text-slate-200">
                        <p>{selectedResume.email || 'Email yo‘q'}</p>
                        <p>{selectedResume.phone || 'Telefon yo‘q'}</p>
                        <p>{selectedResume.location || 'Manzil yo‘q'}</p>
                        {selectedResume.portfolio ? <p className="break-all text-cyan-200">{selectedResume.portfolio}</p> : null}
                      </div>
                    </section>

                    <section className="mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Skills</h4>
                      {splitByComma(selectedResume.skills).length ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {splitByComma(selectedResume.skills).map((skill) => (
                            <li key={skill} className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                              {skill}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">Ko‘nikmalar kiritilmagan</p>
                      )}
                    </section>
                  </aside>

                  <div className="space-y-6 px-5 py-7 text-slate-800">
                    <section>
                      <h4 className="text-sm font-black uppercase tracking-[0.15em] text-slate-500">Summary</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {selectedResume.summary || 'Qisqacha ma’lumot kiritilmagan.'}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-sm font-black uppercase tracking-[0.15em] text-slate-500">Experience</h4>
                      {splitByLine(selectedResume.experience).length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {splitByLine(selectedResume.experience).map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">Ish tajribasi kiritilmagan.</p>
                      )}
                    </section>

                    <section>
                      <h4 className="text-sm font-black uppercase tracking-[0.15em] text-slate-500">Education</h4>
                      {splitByLine(selectedResume.education).length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {splitByLine(selectedResume.education).map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">Ta’lim bo‘limi kiritilmagan.</p>
                      )}
                    </section>
                  </div>
                </div>
              </article>
            ) : null}
          </article>
        </div>
      ) : null}
    </div>
  )
}

export default MyVacancyPage
