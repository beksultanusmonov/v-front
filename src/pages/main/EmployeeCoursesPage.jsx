import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses } from '../../lib/contentApi'

function EmployeeCoursesPage() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('Barchasi')

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const items = await fetchCourses()
      if (isMounted) setCourses(items)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const levelOptions = useMemo(() => ['Barchasi', ...new Set(courses.map((item) => item.level).filter(Boolean))], [courses])

  const filteredCourses = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return courses.filter((item) => {
      const matchesSearch =
        normalized.length === 0 || item.name.toLowerCase().includes(normalized) || item.teacher.toLowerCase().includes(normalized)
      const matchesLevel = levelFilter === 'Barchasi' || item.level === levelFilter
      return matchesSearch && matchesLevel
    })
  }, [courses, search, levelFilter])

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Kurslar</p>
            <h3 className="mt-2 text-2xl font-black text-white">Ko‘nikmangizni oshiring</h3>
          </div>
          <Link
            to="/courses"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400"
          >
            Barcha kurslar
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kurs qidirish..."
            className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 sm:max-w-sm"
          />
          {levelOptions.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setLevelFilter(level)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                levelFilter === level
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <Link
            key={course.id}
            to={`/main/courses/${course.id}`}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/75 text-left transition hover:border-cyan-400"
          >
            <div className={`relative h-24 bg-gradient-to-r ${course.gradient}`}>
              <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-white/15 px-2 py-1 text-[11px] font-semibold text-white">
                {course.level}
              </span>
              <span className="absolute bottom-3 inset-x-0 text-center text-3xl">{course.icon}</span>
            </div>
            <div className="p-4">
              <h4 className="line-clamp-2 text-base font-semibold text-white">{course.name}</h4>
              <p className="mt-1 text-xs text-slate-400">{course.teacher}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-300">{course.price}</p>
              <p className="mt-2 text-xs text-cyan-300">Kursni ochish</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default EmployeeCoursesPage
