import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '../lib/contentApi'

const values = [
  {
    title: 'Aniq yo‘nalish',
    description:
      'Platformadagi barcha jarayonlar - kurs tanlashdan tortib ishga topshirishgacha - bir xil, sodda va tushunarli oqimda ishlaydi.',
  },
  {
    title: 'Real bozor talabi',
    description:
      'Kurslar va vakansiyalar bozor ehtiyojlaridan kelib chiqib tuziladi. Nomzod real skill bilan ishga kirishga tayyorlanadi.',
  },
  {
    title: 'Tezkor aloqa',
    description:
      'Kompaniyalar nomzodlarni filtrlab ko‘radi, resume ochadi va tezkor qaror beradi. Jarayon ortiqcha bosqichlarsiz olib boriladi.',
  },
]

const workflow = [
  'Nomzod yoki kompaniya sifatida ro‘yxatdan o‘tasiz.',
  'Profilingizni to‘ldirib, kerakli bo‘limlarni yangilaysiz.',
  'Nomzodlar kurs va vakansiyalarni ko‘rib ariza topshiradi.',
  'Kompaniyalar nomzodlarni ko‘rib chiqib qabul/rad etadi.',
]

function formatCount(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function AboutPage() {
  const [stats, setStats] = useState({
    activeVacancies: 0,
    registeredCandidates: 0,
    partnerCompanies: 0,
    courseDirections: 0,
  })

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const data = await fetchStats()
      if (isMounted && data) setStats(data)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const platformStats = [
    { label: 'Faol vakansiyalar', value: `${formatCount(stats.activeVacancies)}+` },
    { label: 'Ro‘yxatdan o‘tgan nomzodlar', value: `${formatCount(stats.registeredCandidates)}+` },
    { label: 'Hamkor kompaniyalar', value: `${formatCount(stats.partnerCompanies)}+` },
    { label: 'Kurs yo‘nalishlari', value: `${formatCount(stats.courseDirections)}+` },
  ]

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-500/10 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Biz haqimizda</p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-5xl">YourJob - karyera uchun yagona ekotizim</h1>
          <p className="mt-5 max-w-4xl text-sm leading-relaxed text-slate-300 md:text-base">
            YourJob platformasi nomzodlar, o‘quvchilar va kompaniyalarni bitta joyga jamlaydi. Bizning maqsadimiz:
            insonlarga mos ish topishda, kompaniyalarga esa eng to‘g‘ri nomzodni tez topishda yordam berish. Shu bilan
            birga, kurslar orqali foydalanuvchini amaliy ko‘nikmaga olib chiqish.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/vacancies"
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Vakansiyalarni ko‘rish
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
            >
              Kurslar bo‘limi
            </Link>
          </div>
        </article>

        <article className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </article>

        <article className="grid gap-4 lg:grid-cols-3">
          {values.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>
            </div>
          ))}
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 md:p-10">
          <h2 className="text-2xl font-black text-white md:text-3xl">Platforma qanday ishlaydi?</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            {workflow.map((item, index) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-300">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-slate-300">{item}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  )
}

export default AboutPage
