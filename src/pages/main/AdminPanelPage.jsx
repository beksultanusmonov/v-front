import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { adminDeleteVacancy, adminSetVacancyStatus, fetchAdminOverview } from '../../lib/adminApi'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function AdminPanelPage() {
  const { role } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({
    stats: {},
    users: [],
    vacancies: [],
    resumes: [],
    courses: [],
    certificates: [],
  })

  const loadOverview = async () => {
    try {
      const data = await fetchAdminOverview()
      setOverview(data || { stats: {}, users: [], vacancies: [], resumes: [], courses: [], certificates: [] })
    } catch {
      toast.error('Admin panel ma’lumotlarini yuklashda xatolik.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  const usersByRole = useMemo(() => {
    const map = { admin: 0, company: 0, employee: 0 }
    ;(overview.users || []).forEach((item) => {
      const key = String(item.role || '')
      if (Object.prototype.hasOwnProperty.call(map, key)) map[key] += 1
    })
    return map
  }, [overview.users])

  const roleChartData = useMemo(
    () => [
      { name: 'Admin', value: usersByRole.admin },
      { name: 'Companies', value: usersByRole.company },
      { name: 'Employees', value: usersByRole.employee },
    ],
    [usersByRole]
  )

  const vacancyChartData = useMemo(
    () => [
      { name: 'Active', value: overview.stats?.activeVacancies || 0 },
      { name: 'Inactive', value: Math.max(0, (overview.stats?.vacancies || 0) - (overview.stats?.activeVacancies || 0)) },
    ],
    [overview.stats]
  )

  if (role !== 'admin') {
    return (
      <article className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
        <p className="text-sm font-semibold text-rose-200">Bu bo‘lim faqat admin uchun.</p>
      </article>
    )
  }

  const toggleVacancy = async (vacancy) => {
    const next = String(vacancy.status || '').toLowerCase() === 'active' ? 'inactive' : 'active'
    try {
      await adminSetVacancyStatus(vacancy.id, next)
      toast.success('Vakansiya statusi yangilandi.')
      await loadOverview()
    } catch {
      toast.error('Vakansiya statusini yangilashda xatolik.')
    }
  }

  const removeVacancy = async (vacancyId) => {
    if (!window.confirm('Vakansiyani o‘chirishni tasdiqlaysizmi?')) return
    try {
      await adminDeleteVacancy(vacancyId)
      toast.success('Vakansiya o‘chirildi.')
      await loadOverview()
    } catch {
      toast.error('Vakansiyani o‘chirishda xatolik.')
    }
  }

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-slate-300">Yuklanmoqda...</p> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Foydalanuvchilar', value: overview.stats?.users || 0 },
          { label: 'Vakansiyalar', value: overview.stats?.vacancies || 0 },
          { label: 'Rezumelar', value: overview.stats?.resumes || 0 },
          { label: 'Sertifikatlar', value: overview.stats?.certificates || 0 },
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Adminlar</p>
          <p className="mt-1 text-xl font-black text-cyan-300">{usersByRole.admin}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Kompaniyalar</p>
          <p className="mt-1 text-xl font-black text-indigo-300">{usersByRole.company}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Xodimlar</p>
          <p className="mt-1 text-xl font-black text-emerald-300">{usersByRole.employee}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
          <h3 className="text-sm font-bold text-white">User role statistikasi</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
          <h3 className="text-sm font-bold text-white">Vakansiya status statistikasi</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vacancyChartData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {vacancyChartData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={index === 0 ? '#22c55e' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
        <h3 className="text-base font-bold text-white">Vakansiyalarni boshqarish</h3>
        <div className="mt-3 space-y-2">
          {(overview.vacancies || []).map((vacancy) => (
            <div key={vacancy.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{vacancy.title}</p>
                  <p className="text-xs text-slate-400">
                    {vacancy.company || 'N/A'} • {vacancy.location || 'N/A'} • status: {vacancy.status || 'inactive'}
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
                    onClick={() => removeVacancy(vacancy.id)}
                    className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400"
                  >
                    O‘chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminPanelPage
