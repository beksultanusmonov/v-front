import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFaqs } from '../lib/contentApi'

function FaqPage() {
  const [faqs, setFaqs] = useState([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Barchasi')
  const [openedId, setOpenedId] = useState(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const items = await fetchFaqs()
      if (!isMounted) return
      setFaqs(items)
      setOpenedId(items[0]?.id || null)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => ['Barchasi', ...new Set(faqs.map((item) => item.category))], [faqs])

  const filteredFaqs = useMemo(
    () =>
      faqs.filter((item) => {
        const matchesCategory = activeCategory === 'Barchasi' || item.category === activeCategory
        const normalizedQuery = query.trim().toLowerCase()
        const matchesQuery =
          normalizedQuery.length === 0 ||
          item.q.toLowerCase().includes(normalizedQuery) ||
          item.a.toLowerCase().includes(normalizedQuery)
        return matchesCategory && matchesQuery
      }),
    [activeCategory, query],
  )

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-500/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">FAQ</p>
        <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Ko‘p beriladigan savollar</h1>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Savol bo‘yicha qidirish..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  activeCategory === category
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-indigo-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-300">Mos savol topilmadi. Boshqa kalit so‘z bilan urinib ko‘ring.</p>
            </div>
          ) : (
            filteredFaqs.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <button
                  type="button"
                  onClick={() => setOpenedId((prev) => (prev === item.id ? null : item.id))}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <span className="mb-2 inline-flex rounded-md bg-indigo-500/20 px-2 py-1 text-[11px] font-semibold text-indigo-200">
                      {item.category}
                    </span>
                    <h2 className="text-sm font-semibold text-white md:text-base">{item.q}</h2>
                  </div>
                  <span className="text-lg font-bold text-slate-300">{openedId === item.id ? '−' : '+'}</span>
                </button>

                {openedId === item.id ? <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.a}</p> : null}
              </article>
            ))
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <p className="text-sm font-semibold text-white">Savolingizga javob topilmadimi?</p>
          <p className="mt-2 text-sm text-slate-300">
            Akkaunt ochib platformadagi barcha funksiyalarni sinab ko‘ring yoki vakansiyalar bo‘limidan mos ishlarni
            ko‘rib chiqing.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/accaunt/register"
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Ro‘yxatdan o‘tish
            </Link>
            <Link
              to="/vacancies"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
            >
              Vakansiyalarni ko‘rish
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FaqPage
