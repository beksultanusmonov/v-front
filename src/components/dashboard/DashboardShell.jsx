import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import ThemeController from '../theme/ThemeController'
import { useTheme } from '../../theme/ThemeContext'

function DashboardShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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
    if (location.state?.email) {
      setAuthState(location.state)
    }
  }, [location.state])

  const role = authState?.role === 'company' ? 'company' : 'employee'
  const userId = authState?.id || ''
  const fullName = authState?.fullName || 'Foydalanuvchi'
  const email = authState?.email || 'demo@yourjob.uz'
  const companyName = authState?.companyName || ''

  const handleLogout = () => {
    try {
      localStorage.removeItem('yourjob_auth')
    } catch {
      // ignore storage errors
    }
    setAuthState(null)
    navigate('/accaunt/login', { replace: true })
  }

  useEffect(() => {
    if (authState?.email) localStorage.setItem('yourjob_auth', JSON.stringify(authState))
  }, [authState])

  useEffect(() => {
    if (location.pathname === '/main' || location.pathname === '/main/') {
      navigate('/main/all-vacancy', { replace: true })
    }
  }, [location.pathname, navigate, role])

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  const sidebarItems =
    role === 'company'
      ? [
          { to: '/main/all-vacancy', label: 'All Vacancy' },
          { to: '/main/my-vacancy', label: 'My Vacancy' },
          { to: '/main/profile', label: 'Profile' },
        ]
      : [
          { to: '/main/all-vacancy', label: 'All Vacancy' },
          { to: '/main/resume', label: 'Resume' },
          { to: '/main/courses', label: 'Kurslar' },
          { to: '/main/profile', label: 'Profile' },
        ]

  const currentTitle = location.pathname.includes('/all-vacancy')
    ? 'All Vacancy'
    : location.pathname.includes('/my-vacancy')
      ? 'My Vacancy'
      : location.pathname.includes('/resume')
        ? 'Resume'
        : location.pathname.includes('/courses')
          ? 'Kurslar'
          : 'Profile'

  const shellClasses = isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
  const blobLeftClasses = isLight ? 'bg-indigo-300/30' : 'bg-indigo-600/20'
  const blobRightClasses = isLight ? 'bg-cyan-300/30' : 'bg-cyan-500/20'
  const mobileOverlayClasses = isLight ? 'bg-slate-900/40' : 'bg-slate-950/70'
  const mobileSidebarClasses = isLight
    ? 'border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/10'
    : 'border-slate-800 bg-slate-900/95 text-slate-100'
  const desktopSidebarClasses = isLight
    ? 'border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-900/5'
    : 'border-slate-800 bg-slate-900/75 text-slate-100'
  const contentClasses = isLight
    ? 'border-slate-200 bg-white shadow-xl shadow-slate-900/5'
    : 'border-slate-800 bg-slate-900/75 shadow-2xl shadow-indigo-500/10'
  const headerBorderClasses = isLight ? 'border-slate-200' : 'border-slate-800'
  const dashLabelClasses = isLight ? 'text-indigo-600' : 'text-cyan-300'
  const panelTitleClasses = isLight ? 'text-slate-900' : 'text-white'
  const mutedTextClasses = isLight ? 'text-slate-600' : 'text-slate-300'
  const subtleTextClasses = isLight ? 'text-slate-500' : 'text-slate-400'
  const logoutButtonClasses = isLight
    ? 'border-rose-200 bg-gradient-to-r from-rose-50 via-white to-rose-50 text-rose-700 shadow-sm shadow-rose-100/80 hover:border-rose-300 hover:from-rose-100 hover:to-rose-50 hover:shadow-md hover:shadow-rose-200/70'
    : 'border-rose-400/40 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-rose-400/20 text-rose-100 shadow-sm shadow-rose-900/40 hover:border-rose-300/50 hover:from-rose-500/30 hover:to-rose-400/30 hover:shadow-md hover:shadow-rose-900/60'
  const mobileMenuButtonClasses = isLight
    ? 'border-slate-300 text-slate-700 hover:border-indigo-400'
    : 'border-slate-700 text-slate-200 hover:border-indigo-400'
  const roleBadgeClasses = isLight
    ? 'border-slate-200 bg-slate-100 text-slate-600'
    : 'border-slate-700 text-slate-300'
  const closeButtonClasses = isLight ? 'border-slate-300 text-slate-600' : 'border-slate-700 text-slate-200'

  return (
    <main className={`relative h-screen w-screen overflow-hidden ${shellClasses}`}>
      <div className={`pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full blur-3xl ${blobLeftClasses}`} />
      <div className={`pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full blur-3xl ${blobRightClasses}`} />

      <div
        className={`absolute inset-0 z-40 transition-opacity duration-300 lg:hidden ${mobileOverlayClasses} ${
          isMobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside
        className={`absolute left-0 top-0 z-50 h-full w-72 border-r p-5 backdrop-blur-xl transition-transform duration-300 ease-out lg:hidden ${mobileSidebarClasses} ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dashLabelClasses}`}>YourJob Dashboard</p>
            <h1 className={`mt-2 text-lg font-black ${panelTitleClasses}`}>{role === 'company' ? 'Company Panel' : 'Employee Panel'}</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`rounded-md border px-2 py-1 text-xs font-semibold ${closeButtonClasses}`}
          >
            X
          </button>
        </div>
        <p className={`mt-3 text-sm ${mutedTextClasses}`}>{role === 'company' ? companyName || fullName : fullName}</p>
        <p className={`text-xs ${subtleTextClasses}`}>{email}</p>
        <nav className="mt-6 space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      : 'bg-indigo-500/25 text-indigo-100 ring-1 ring-indigo-400/50'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
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
          className={`mt-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${logoutButtonClasses}`}
        >
          <span
            aria-hidden="true"
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/25 text-rose-100'
            }`}
          >
            ⎋
          </span>
          Tizimdan chiqish
        </button>
      </aside>

      <header className="relative z-30 flex items-center justify-between px-3 pt-3 sm:px-4 sm:pt-4 lg:hidden">
        <Link to="/" className={`inline-flex items-center gap-2 text-sm font-black ${panelTitleClasses}`}>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${isLight ? 'bg-indigo-500' : 'bg-cyan-400'}`} />
          YourJob
        </Link>
        <div className="flex items-center gap-2">
          <ThemeController />
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${mobileMenuButtonClasses}`}
          >
            <span className="text-sm leading-none">☰</span>
            Menu
          </button>
        </div>
      </header>

      <div className="flex h-full w-full gap-3 p-3 pt-2 sm:gap-4 sm:p-4 sm:pt-2 md:gap-6 md:p-6 lg:pt-6">
        <aside className={`hidden h-full w-72 shrink-0 rounded-3xl border p-5 backdrop-blur-xl lg:block ${desktopSidebarClasses}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dashLabelClasses}`}>YourJob Dashboard</p>
          <h1 className={`mt-3 text-xl font-black ${panelTitleClasses}`}>{role === 'company' ? 'Company Panel' : 'Employee Panel'}</h1>
          <p className={`mt-2 text-sm ${mutedTextClasses}`}>{role === 'company' ? companyName || fullName : fullName}</p>
          <p className={`text-xs ${subtleTextClasses}`}>{email}</p>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? isLight
                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-indigo-500/25 text-indigo-100 ring-1 ring-indigo-400/50'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
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
            className={`mt-8 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${logoutButtonClasses}`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/25 text-rose-100'
              }`}
            >
              ⎋
            </span>
            Tizimdan chiqish
          </button>
        </aside>

        <section className={`h-full w-full overflow-y-auto rounded-3xl border p-4 backdrop-blur-xl sm:p-6 md:p-8 ${contentClasses}`}>
          <div className="mx-auto w-full max-w-6xl">
            <div className={`mb-6 flex items-center justify-between gap-3 border-b pb-4 ${headerBorderClasses}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dashLabelClasses}`}>Dashboard</p>
                <h2 className={`mt-2 text-2xl font-black sm:text-3xl ${panelTitleClasses}`}>{currentTitle}</h2>
              </div>
              <div className="flex items-center gap-2">
                <ThemeController />
                <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${roleBadgeClasses}`}>
                  {role === 'company' ? 'Company' : 'Employee'}
                </span>
              </div>
            </div>
            {children({ role, userId, fullName, email, companyName, updateAuthState: setAuthState })}
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardShell
