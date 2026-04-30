import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { adminDeleteVacancy, adminSetVacancyStatus, fetchAdminOverview } from '../../lib/adminApi'

function AdminCompaniesPage() {
  const { role } = useOutletContext()
  const [companies, setCompanies] = useState([])
  const [vacancies, setVacancies] = useState([])

  const load = async () => {
    try {
      const data = await fetchAdminOverview()
      const users = data?.users || []
      const companyUsers = users.filter((item) => String(item.role || '').toLowerCase() === 'company')
      setCompanies(companyUsers)
      setVacancies(data?.vacancies || [])
    } catch {
      toast.error('Companies ma’lumotlarini yuklashda xatolik.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const companyCards = useMemo(() => {
    return companies.map((company) => {
      const ownVacancies = vacancies.filter((item) => String(item.ownerUserId || '') === String(company.id))
      return {
        ...company,
        ownVacancies,
        activeCount: ownVacancies.filter((item) => String(item.status || '').toLowerCase() === 'active').length,
      }
    })
  }, [companies, vacancies])

  if (role !== 'admin') {
    return <p className="text-sm text-rose-300">Bu bo‘lim faqat admin uchun.</p>
  }

  const toggleVacancy = async (vacancy) => {
    const next = String(vacancy.status || '').toLowerCase() === 'active' ? 'inactive' : 'active'
    try {
      await adminSetVacancyStatus(vacancy.id, next)
      toast.success('Vakansiya statusi yangilandi.')
      await load()
    } catch {
      toast.error('Vakansiya statusini yangilashda xatolik.')
    }
  }

  const deleteVacancy = async (vacancyId) => {
    if (!window.confirm('Vakansiyani o‘chirishni tasdiqlaysizmi?')) return
    try {
      await adminDeleteVacancy(vacancyId)
      toast.success('Vakansiya o‘chirildi.')
      await load()
    } catch {
      toast.error('Vakansiyani o‘chirishda xatolik.')
    }
  }

  return (
    <div className="space-y-4">
      {companyCards.map((company) => (
        <section key={company.id} className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">{company.companyName || company.fullName}</h3>
              <p className="text-xs text-slate-400">
                {company.email} • ID: {company.id} • Aktiv: {company.activeCount}/{company.ownVacancies.length}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {company.ownVacancies.length === 0 ? (
              <p className="text-xs text-slate-400">Bu kompaniyada hozircha vakansiya yo‘q.</p>
            ) : (
              company.ownVacancies.map((vacancy) => (
                <div key={vacancy.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{vacancy.title}</p>
                      <p className="text-xs text-slate-400">
                        {vacancy.location || 'N/A'} • status: {vacancy.status || 'inactive'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleVacancy(vacancy)}
                        className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
                      >
                        {String(vacancy.status || '').toLowerCase() === 'active' ? 'Noactive' : 'Active'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVacancy(vacancy.id)}
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400"
                      >
                        O‘chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export default AdminCompaniesPage
