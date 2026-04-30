import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import ThemeController from '../theme/ThemeController'
import { useTheme } from '../../theme/ThemeContext'

function AdminDashboard({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const initialAuthState = useMemo(() => {
    if (location.state?.email) return location.state
    try {
      const raw = localStorage.getItem('yourjob_auth')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [location.state])

  const [authState, setAuthState] = useState(initialAuthState)

  useEffect(() => {
    if (location.state?.email) setAuthState(location.state)
  }, [location.state])

  useEffect(() => {
    if (!authState?.email || authState?.role !== 'admin') {
      navigate('/accaunt/login', { replace: true })
      return
    }
    localStorage.setItem('yourjob_auth', JSON.stringify(authState))
  }, [authState, navigate])

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/panel', { replace: true })
    }
  }, [location.pathname, navigate])

  const fullName = authState?.fullName || 'Super Admin'
  const email = authState?.email || 'admin@gmail.com'
  const sidebarItems = [
    { to: '/admin/panel', label: 'Admin Panel' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/companies', label: 'Companies' },
  ]

  const currentTitle = location.pathname.includes('/users')
    ? 'Users'
    : location.pathname.includes('/companies')
      ? 'Companies'
      : 'Admin Panel'

  const handleLogout = () => {
    localStorage.removeItem('yourjob_auth')
    setAuthState(null)
    navigate('/accaunt/login', { replace: true })
  }

  const shellClasses = isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
  const sidebarClasses = isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/75'
  const contentClasses = isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/75'
  const mutedText = isLight ? 'text-slate-600' : 'text-slate-300'
  const subtleText = isLight ? 'text-slate-500' : 'text-slate-400'
  const panelTitle = isLight ? 'text-slate-900' : 'text-white'

  return (
    <main className={`min-h-screen ${shellClasses}`}>
      <div className="mx-auto flex h-screen max-w-[1600px] gap-4 p-4">
        <aside className={`hidden w-72 shrink-0 rounded-3xl border p-5 lg:block ${sidebarClasses}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Admin Console</p>
          <h1 className={`mt-3 text-xl font-black ${panelTitle}`}>Super Admin Panel</h1>
          <p className={`mt-2 text-sm ${mutedText}`}>{fullName}</p>
          <p className={`text-xs ${subtleText}`}>{email}</p>
          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-indigo-500/25 text-indigo-100 ring-1 ring-indigo-400/50' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/30"
          >
            Tizimdan chiqish
          </button>
        </aside>

        <section className={`h-full w-full overflow-y-auto rounded-3xl border p-6 md:p-8 ${contentClasses}`}>
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Admin Dashboard</p>
                <h2 className={`mt-2 text-2xl font-black ${panelTitle}`}>{currentTitle}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/main/all-vacancy" className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white">
                  Main Dashboard
                </Link>
                <ThemeController />
              </div>
            </div>
            {children({ role: 'admin', userId: authState?.id || '', fullName, email, companyName: '', updateAuthState: setAuthState })}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard
