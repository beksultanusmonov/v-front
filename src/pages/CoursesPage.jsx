import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses } from '../lib/contentApi'

function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Barchasi')
  const [levelFilter, setLevelFilter] = useState('Barchasi')
  const [isLoading, setIsLoading] = useState(true)

  const categoryOptions = useMemo(
    () => ['Barchasi', ...new Set(courses.map((item) => item.category).filter(Boolean))],
    [courses],
  )
  const levelOptions = useMemo(() => ['Barchasi', ...new Set(courses.map((item) => item.level).filter(Boolean))], [courses])

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return courses.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        String(item.name || '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(item.teacher || '')
          .toLowerCase()
          .includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'Barchasi' || item.category === categoryFilter
      const matchesLevel = levelFilter === 'Barchasi' || item.level === levelFilter
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, search, categoryFilter, levelFilter])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const items = await fetchCourses()
        if (isMounted) setCourses(Array.isArray(items) ? items : [])
      } catch {
        if (isMounted) setCourses([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-indigo-500/10">
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 px-6 py-10 text-center md:px-10 md:py-12">
            <h1 className="text-3xl font-black text-white md:text-5xl">Onlayn Kurslar</h1>
            <p className="mt-2 text-sm text-slate-200 md:text-base">Kasbiy ko‘nikmalaringizni biz bilan oshiring</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Kurs nomi..."
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 md:max-w-xs"
            />
            {categoryOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategoryFilter(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  categoryFilter === item
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {levelOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevelFilter(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  levelFilter === item
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {!isLoading && filteredCourses.length === 0 ? (
            <article className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
              <p className="text-sm text-slate-300">Hozircha backendda kurslar topilmadi.</p>
            </article>
          ) : null}
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-100 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className={`relative flex h-28 items-start justify-between bg-gradient-to-r p-3 ${course.gradient}`}>
                <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-slate-100">
                  {course.level}
                </span>
                <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {course.status}
                </span>
                <span className="absolute inset-x-0 bottom-4 text-center text-4xl drop-shadow-sm">{course.icon}</span>
              </div>

              <div className="p-4">
                <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white">{course.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">{course.description}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <p>👤 {course.teacher}</p>
                  <p>⏱️ {course.duration}</p>
                  <p>📚 {course.videoLessons?.length || 0} dars</p>
                </div>

                <div className="mt-3">
                  <div className="mb-1 h-1.5 w-full rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: '0%' }} />
                  </div>
                  <p className="text-xs text-slate-400">Ro‘yxatdan o‘tib progressni kuzating</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-black text-emerald-300">{course.price}</p>
                  <p className="text-sm font-semibold text-slate-300">⭐ {course.rating} ({course.reviews})</p>
                </div>

                <Link
                  to="/accaunt/register"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Boshlash
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default CoursesPage
