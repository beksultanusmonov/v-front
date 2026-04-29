import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses, fetchVacancies } from '../lib/contentApi'
import { formatSalaryUzs } from '../lib/salary'

const featureCards = [
  {
    title: 'Online video kurslar',
    description:
      'Kasbga yo‘naltirilgan darsliklarga yoziling, bosqichma-bosqich o‘qing va yakuniy sertifikatga ega bo‘ling.',
  },
  {
    title: 'Smart resume builder',
    description:
      'Profilingiz ichida professional resume yarating, saqlang va uni bir necha soniyada vakansiyalarga topshiring.',
  },
  {
    title: 'Kompaniyalar uchun panel',
    description:
      'Kampaniyalar ro‘yxatdan o‘tib vakansiya e’lon qiladi, nomzodlar bazasini ko‘radi va mos xodimlarni tanlaydi.',
  },
]

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform-gpu transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function HomePage() {
  const [popularVacancies, setPopularVacancies] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const [vacancies, courses] = await Promise.all([fetchVacancies(), fetchCourses()])
      if (!isMounted) return
      const sortedVacancies = [...vacancies]
        .sort((a, b) => {
          const applicantsA = Array.isArray(a.applicantsList) ? a.applicantsList.length : a.applicants || 0
          const applicantsB = Array.isArray(b.applicantsList) ? b.applicantsList.length : b.applicants || 0
          return applicantsB - applicantsA
        })
        .slice(0, 6)
      setPopularVacancies(sortedVacancies)
      setRecommendedCourses(courses.slice(0, 3))
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section id="hero" className="relative isolate overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1 text-sm font-medium text-indigo-200">
              YourJob - online karyera ekotizimi
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Vakansiya, resume va darsliklarni bitta platformada
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              YourJob orqali foydalanuvchilar istalgan vaqtda profilida resume yaratadi va vakansiyalarga
              topshiradi. Online kurslar esa alohida yo‘nalish bo‘lib, xohlovchilar ularga yozilib bilimini
              oshirishi mumkin. Kompaniyalar ro‘yxatdan o‘tib yangi ish o‘rinlarini joylaydi.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/accaunt/register"
                className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Platformani boshlash
              </Link>
              <Link
                to="/vacancies"
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"
              >
                Vakansiyalarni ko‘rish
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="vakansiyalar" className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">So‘nggi e’lonlar</p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Mashhur ish o‘rinlari</h2>
            </div>
            <Link
              to="/vacancies"
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:text-cyan-300"
            >
              Barchasini ko‘rish
            </Link>
          </div>
        </Reveal>

        <div className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularVacancies.map((vacancy, index) => (
            <Reveal key={vacancy.id} delay={index * 90}>
              <Link
                to={`/vacancies/${vacancy.id}`}
                className="group block rounded-2xl border border-slate-800 bg-slate-900/65 p-5 transition hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-cyan-300">
                  {vacancy.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{vacancy.company || 'My Company'}</p>
                <p className="mt-2 text-sm font-semibold text-violet-200">{formatSalaryUzs(vacancy.salary)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-1 text-indigo-200">{vacancy.type}</span>
                  <span className="rounded-md bg-cyan-500/20 px-2 py-1 text-cyan-200">{vacancy.location}</span>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-200">
                    {Array.isArray(vacancy.applicantsList) ? vacancy.applicantsList.length : vacancy.applicants || 0} ta
                    resume
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <article className="group h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:-translate-y-2 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/15">
                <div className="mb-5 inline-flex rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200">
                  0{index + 1}
                </div>
                <h2 className="text-xl font-semibold text-white transition group-hover:text-cyan-300">
                  {item.title}
                </h2>
                <p className="mt-3 leading-relaxed text-slate-300">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="courses-info" className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/65 p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">O‘rganing</p>
                <h3 className="mt-2 text-2xl font-black text-white md:text-4xl">Tavsiya etilgan kurslar</h3>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:text-cyan-300"
              >
                Barchasini ko‘rish <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recommendedCourses.map((course, index) => (
                <Reveal key={course.id} delay={index * 90}>
                  <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
                    <div className={`relative h-28 bg-gradient-to-r ${course.gradient}`}>
                      <div className="flex items-center justify-between p-3">
                        <span className="rounded-full border border-white/25 bg-white/15 px-2 py-1 text-[11px] font-semibold text-white">
                          {course.level}
                        </span>
                        <span className="rounded-full border border-white/25 bg-emerald-500/75 px-2 py-1 text-[11px] font-semibold text-white">
                          {course.status}
                        </span>
                      </div>
                      <span className="absolute inset-x-0 bottom-4 text-center text-4xl">{course.icon}</span>
                    </div>

                    <div className="p-4">
                      <h4 className="line-clamp-2 text-lg font-bold text-white">{course.title || course.name}</h4>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span>👤 {course.teacher}</span>
                        <span>⏱ {course.duration}</span>
                        <span>📚 {course.lessons}</span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-800">
                        <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${course.progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{course.progress}% bajarildi</p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xl font-black text-emerald-300">{course.price}</p>
                        <p className="text-sm font-semibold text-slate-300">
                          ⭐ {course.rating} ({course.reviews})
                        </p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}

export default HomePage
