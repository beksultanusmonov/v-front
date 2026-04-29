import { useTheme } from '../../theme/ThemeContext'

function ThemeController({ className = '' }) {
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'
  const nextTheme = isLight ? 'dark' : 'light'

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={isLight ? 'Dark modega o‘tish' : 'Light modega o‘tish'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
        isLight
          ? 'border-slate-300 bg-white text-amber-500 hover:border-indigo-500'
          : 'border-slate-700/80 bg-slate-950/80 text-cyan-300 hover:border-cyan-400'
      } ${className}`}
    >
      <span className="inline-flex items-center justify-center" aria-hidden="true">
        {isLight ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10.45-10.45 1 1 0 0 0-1.19-1.3A10 10 0 1 0 23 15.05a1 1 0 0 0-1.36-2.05Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42Zm10.45 14.32 1.79 1.8 1.41-1.42-1.8-1.79-1.4 1.41ZM11 0h2v3h-2V0Zm0 21h2v3h-2v-3ZM0 11h3v2H0v-2Zm21 0h3v2h-3v-2ZM4.22 19.78l1.42 1.41 1.79-1.8-1.41-1.41-1.8 1.8ZM17.66 6.34l1.41 1.41 1.8-1.79-1.42-1.42-1.79 1.8ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
          </svg>
        )}
      </span>
    </button>
  )
}

export default ThemeController
