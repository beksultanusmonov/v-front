import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { adminDeleteUser, fetchAdminOverview } from '../../lib/adminApi'

function AdminUsersPage() {
  const { role } = useOutletContext()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')

  const loadUsers = async () => {
    try {
      const data = await fetchAdminOverview()
      setUsers(data?.users || [])
    } catch {
      toast.error('Users ma’lumotlarini yuklashda xatolik.')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return users
    return users.filter((item) => {
      const name = String(item.fullName || '').toLowerCase()
      const email = String(item.email || '').toLowerCase()
      const roleName = String(item.role || '').toLowerCase()
      return name.includes(normalized) || email.includes(normalized) || roleName.includes(normalized)
    })
  }, [query, users])

  if (role !== 'admin') {
    return <p className="text-sm text-rose-300">Bu bo‘lim faqat admin uchun.</p>
  }

  const onDelete = async (user) => {
    if (String(user.role || '').toLowerCase() === 'admin') {
      toast.error('Admin userni o‘chirish mumkin emas.')
      return
    }
    if (!window.confirm(`${user.fullName || user.email} ni o‘chirasizmi?`)) return
    try {
      await adminDeleteUser(user.id)
      toast.success('User o‘chirildi.')
      await loadUsers()
    } catch {
      toast.error('Userni o‘chirishda xatolik.')
    }
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="User qidirish (name/email/role)"
          className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        />
      </article>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
        <h3 className="text-base font-bold text-white">Users ({filtered.length})</h3>
        <div className="mt-3 space-y-2">
          {filtered.map((user) => (
            <div key={user.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{user.fullName || 'N/A'}</p>
                  <p className="text-xs text-slate-400">
                    {user.email} • {user.role} • ID: {user.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(user)}
                  disabled={String(user.role || '').toLowerCase() === 'admin'}
                  className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  O‘chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminUsersPage
