import { Link, NavLink, Outlet } from 'react-router-dom'
import ThemeController from '../../components/theme/ThemeController'
import { useTheme } from '../../theme/ThemeContext'

function HomeLayout() {
  const { theme } = useTheme()
  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive
        ? theme === 'light'
          ? 'text-indigo-700'
          : 'text-cyan-300'
        : theme === 'light'
          ? 'text-slate-700 hover:text-slate-900'
          : 'text-slate-300 hover:text-white'
    }`

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          theme === 'light'
            ? 'border-slate-300/80 bg-white/90'
            : 'border-slate-800/60 bg-slate-950/85'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-base font-bold tracking-wide md:text-lg ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />
            YourJob
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/vacancies" className={navLinkClass}>
              Vakansiyalar
            </NavLink>
            <NavLink to="/courses" className={navLinkClass}>
              Kurslar
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              Biz haqimizda
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              FAQ
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeController />
            <Link
              to="/accaunt/login"
              className={`rounded-lg border px-4 py-2 text-xs font-semibold transition md:text-sm ${
                theme === 'light'
                  ? 'border-slate-300 text-slate-800 hover:border-indigo-500'
                  : 'border-slate-700 text-slate-200 hover:border-indigo-400'
              }`}
            >
              Kirish
            </Link>
            <Link
              to="/accaunt/register"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 md:text-sm"
            >
              Ro‘yxatdan o‘tish
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  )
}

export default HomeLayout
