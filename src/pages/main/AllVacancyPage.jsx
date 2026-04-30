import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faBriefcase, faFilter, faLocationDot, faMagnifyingGlass, faSignal } from '@fortawesome/free-solid-svg-icons'
import { fetchVacancies } from '../../lib/contentApi'
import { formatSalaryUzs } from '../../lib/salary'

function isActiveVacancy(status) {
  return String(status || '').trim().toLowerCase() === 'active'
}

function AllVacancyPage({ basePath = '/main/all-vacancy' }) {
  const [vacancies, setVacancies] = useState([])
  const isPublicVacanciesPage = basePath === '/vacancies'
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')

  const locations = useMemo(
    () => ['all', ...new Set(vacancies.map((item) => item.location).filter(Boolean))],
    [vacancies],
  )
  const types = useMemo(() => ['all', ...new Set(vacancies.map((item) => item.type).filter(Boolean))], [vacancies])
  const categories = useMemo(() => ['all', ...new Set(vacancies.map((item) => item.level).filter(Boolean))], [vacancies])

  const filteredVacancies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = vacancies.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        (item.company || '').toLowerCase().includes(normalizedSearch)
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter
      const matchesCategory = categoryFilter === 'all' || item.level === categoryFilter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
      return matchesSearch && matchesLocation && matchesCategory && matchesType
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '')
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    })
  }, [vacancies, search, locationFilter, categoryFilter, selectedTypes, sortBy])

  const filterFieldClass =
    'h-11 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400'
  const filterLabelClass = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400'

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const apiItems = await fetchVacancies({ status: 'active' })
        const onlyActive = (Array.isArray(apiItems) ? apiItems : []).filter((item) => isActiveVacancy(item.status))
        if (isMounted) setVacancies(onlyActive)
      } catch {
        if (isMounted) setVacancies([])
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  if (!isPublicVacanciesPage) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/65 p-3 sm:p-4">
          <div className="relative max-w-md">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Vakansiya qidirish..."
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-8 pr-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-400">{filteredVacancies.length} ta natija</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredVacancies.map((vacancy) => (
            <Link
              key={vacancy.id}
              to={`${basePath}/${vacancy.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5 transition hover:-translate-y-1 hover:border-indigo-400/50"
            >
              <h3 className="line-clamp-2 text-lg font-bold text-white">{vacancy.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{vacancy.company || 'My Company'}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{vacancy.about}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-indigo-500/20 px-2 py-1 text-indigo-200">{vacancy.type}</span>
                <span className="rounded-md bg-cyan-500/20 px-2 py-1 text-cyan-200">{vacancy.location}</span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200">{vacancy.experience}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 md:py-10">
      <section className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-indigo-500/10">
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 px-6 py-10 text-center md:px-10 md:py-12">
            <h1 className="text-3xl font-black text-white md:text-5xl">Ish o‘rinlari</h1>
            <p className="mt-2 text-sm text-slate-200 md:text-base">Ochiq vakansiyalar sizni kutmoqda</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/90 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"
            >
              <span aria-hidden="true">←</span>
              Bosh sahifa
            </Link>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-slate-300">
              Topildi: <span className="ml-1 text-cyan-300">{filteredVacancies.length}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
                Filtrlar
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setLocationFilter('all')
                  setCategoryFilter('all')
                  setSelectedTypes([])
                  setSortBy('newest')
                }}
                className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Tozalash
              </button>
            </div>

            <div className="space-y-3">
              <label className={filterLabelClass}>Qidiruv</label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Qidiruv..."
                  className={`${filterFieldClass} pl-8 pr-3`}
                />
              </div>
              <label className={filterLabelClass}>Shahar</label>
              <select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                className={filterFieldClass}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'Barcha shaharlar' : location}
                  </option>
                ))}
              </select>
              <label className={filterLabelClass}>Kategoriya</label>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={filterFieldClass}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Barchasi' : category}
                  </option>
                ))}
              </select>

              <label className={filterLabelClass}>Ish turi</label>
              <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                {types
                  .filter((item) => item !== 'all')
                  .map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() =>
                          setSelectedTypes((prev) =>
                            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
                          )
                        }
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span>{type.toUpperCase()}</span>
                    </label>
                  ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-400">{filteredVacancies.length} ta ish topildi</p>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none transition focus:border-cyan-400"
                >
                  <option value="newest">Eng yangi</option>
                  <option value="name">Nomi bo‘yicha</option>
                  <option value="company">Kompaniya bo‘yicha</option>
                </select>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                    viewMode === 'grid'
                      ? 'border-slate-700 bg-indigo-500/90 text-white'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                    viewMode === 'list'
                      ? 'border-slate-700 bg-indigo-500/90 text-white'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
            {filteredVacancies.map((vacancy) => (
              <Link
                key={vacancy.id}
                to={`${basePath}/${vacancy.id}`}
                className={`group rounded-2xl border border-slate-800 bg-slate-900/65 p-4 transition hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 ${
                  viewMode === 'list' ? 'flex items-start justify-between gap-4' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'w-full' : ''}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-black text-cyan-300">
                        {(vacancy.company || 'YC')
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                      <h3 className="line-clamp-2 text-base font-medium text-white transition group-hover:text-cyan-300">
                          {vacancy.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">{vacancy.company || 'My Company'}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      <FontAwesomeIcon icon={faBookmark} />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-1 text-indigo-200">
                      <FontAwesomeIcon icon={faBriefcase} />
                      {vacancy.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-200">
                      <FontAwesomeIcon icon={faSignal} />
                      {vacancy.experience}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-base font-black text-emerald-300">{formatSalaryUzs(vacancy.salary)}</p>
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <FontAwesomeIcon icon={faLocationDot} />
                      {vacancy.location}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AllVacancyPage
