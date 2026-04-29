import html2canvas from 'html2canvas'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { completeCourseLesson, fetchCertificates, fetchCourseById, fetchCourseProgress } from '../../lib/contentApi'

function toEmbedUrl(youtubeUrl = '', youtubeId = '') {
  const directId = String(youtubeId || '').trim()
  if (directId) return `https://www.youtube.com/embed/${directId}?enablejsapi=1&rel=0`
  const raw = String(youtubeUrl || '')
  const fromShort = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  const fromWatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  const videoId = fromShort?.[1] || fromWatch?.[1] || ''
  return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0` : ''
}

function EmployeeCourseDetailPage() {
  const { courseId } = useParams()
  const { userId, fullName, email } = useOutletContext()
  const actorId = userId ? String(userId) : `email:${String(email || '').toLowerCase()}`
  const [course, setCourse] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [progress, setProgress] = useState({ completedLessonIds: [], completed: false })
  const [certificates, setCertificates] = useState([])
  const [awardedCertificate, setAwardedCertificate] = useState(null)
  const certificateRef = useRef(null)

  useEffect(() => {
    if (!courseId || !actorId) return
    let isMounted = true
    ;(async () => {
      try {
        const [courseData, userProgress, userCertificates] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseProgress(courseId, actorId),
          fetchCertificates(actorId),
        ])
        if (!isMounted) return
        setCourse(courseData)
        setProgress(userProgress || { completedLessonIds: [], completed: false })
        setCertificates(userCertificates)
        const lessons = courseData?.videoLessons || []
        if (lessons.length) {
          const firstIncomplete = lessons.find((item) => !(userProgress?.completedLessonIds || []).includes(item.id))
          setSelectedLessonId((firstIncomplete || lessons[0]).id)
        }
      } catch {
        if (isMounted) setCourse(null)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [courseId, actorId])

  const selectedLesson = useMemo(() => {
    const lessons = course?.videoLessons || []
    return lessons.find((item) => item.id === selectedLessonId) || lessons[0] || null
  }, [course, selectedLessonId])

  const lessonIndexMap = useMemo(() => {
    const ids = (course?.videoLessons || []).map((lesson) => lesson.id)
    return new Map(ids.map((id, index) => [id, index]))
  }, [course])

  const openNextLesson = (currentLessonId) => {
    const lessons = course?.videoLessons || []
    const currentIndex = lessonIndexMap.get(currentLessonId)
    if (typeof currentIndex !== 'number') return
    const nextLesson = lessons[currentIndex + 1]
    if (nextLesson) setSelectedLessonId(nextLesson.id)
  }

  const openPrevLesson = () => {
    const lessons = course?.videoLessons || []
    const currentIndex = lessonIndexMap.get(selectedLesson?.id)
    if (typeof currentIndex !== 'number') return
    const prevLesson = lessons[currentIndex - 1]
    if (prevLesson) setSelectedLessonId(prevLesson.id)
  }

  const markCurrentLessonComplete = async () => {
    const lesson = selectedLesson
    if (!lesson || !courseId || !actorId) return
    const alreadyCompleted = (progress.completedLessonIds || []).includes(lesson.id)
    if (alreadyCompleted) {
      openNextLesson(lesson.id)
      return
    }
    try {
      const result = await completeCourseLesson(courseId, { userId: actorId, lessonId: lesson.id, fullName })
      if (result?.progress) setProgress(result.progress)
      if (result?.certificate) {
        setAwardedCertificate(result.certificate)
        setCertificates((prev) => [result.certificate, ...prev])
        toast.success('Tabriklaymiz! Kurs tugadi, sertifikat berildi.')
      } else {
        toast.success('Dars yakunlandi.')
      }
      openNextLesson(lesson.id)
    } catch {
      toast.error('Darsni yakunlashda xatolik yuz berdi.')
    }
  }

  const completion = useMemo(() => {
    const total = course?.videoLessons?.length || 0
    const completed = progress?.completedLessonIds?.length || 0
    if (!total) return 0
    return Math.round((completed / total) * 100)
  }, [course, progress])

  const downloadCertificate = async (cert) => {
    if (!certificateRef.current) {
      toast.error('Sertifikat topilmadi.')
      return
    }
    const safeName = String(fullName || 'student').replace(/\s+/g, '_')
    const safeCourse = String(cert?.courseName || course?.name || 'course').replace(/\s+/g, '_')
    const filenameBase = `certificate_${safeName}_${safeCourse}`
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
      })
      const filename = `${filenameBase}.png`
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('BLOB_CREATE_FAILED'))
        }, 'image/png')
      })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
      toast.success('Sertifikat yuklab olindi.')
      return
    } catch (primaryError) {
      try {
        const fallbackUrl = certificateRef.current?.querySelector('canvas')?.toDataURL?.('image/png')
        if (fallbackUrl && fallbackUrl.startsWith('data:image/png')) {
          const fallbackLink = document.createElement('a')
          fallbackLink.href = fallbackUrl
          fallbackLink.download = `${filenameBase}.png`
          document.body.appendChild(fallbackLink)
          fallbackLink.click()
          fallbackLink.remove()
          toast.success('Sertifikat yuklab olindi.')
          return
        }
      } catch (fallbackError) {
        console.error('Certificate PNG fallback failed:', fallbackError)
      }

      try {
        const issued = cert?.awardedAt ? new Date(cert.awardedAt).toLocaleDateString('uz-UZ') : 'N/A'
        const courseName = String(cert?.courseName || course?.name || 'Course')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const userName = String(fullName || 'Student')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const certId = String(cert?.id || 'N/A')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="990" fill="#f8fafc"/>
  <rect x="0" y="0" width="1400" height="170" fill="#12345a"/>
  <rect x="-80" y="145" width="560" height="70" rx="35" transform="rotate(-8 200 180)" fill="url(#gold)"/>
  <text x="1190" y="78" text-anchor="end" font-size="66" font-weight="800" fill="#fbbf24">CERTIFICATE</text>
  <text x="1190" y="125" text-anchor="end" font-size="28" font-weight="700" fill="#e2e8f0" letter-spacing="8">OF BRILLIANCE</text>
  <text x="700" y="340" text-anchor="middle" font-size="34" fill="#334155">This certificate is awarded to</text>
  <text x="700" y="430" text-anchor="middle" font-size="64" font-weight="800" fill="#0f172a">${userName}</text>
  <line x1="240" y1="455" x2="1160" y2="455" stroke="#cbd5e1" stroke-width="3"/>
  <text x="700" y="535" text-anchor="middle" font-size="32" fill="#334155">for successfully completing</text>
  <text x="700" y="600" text-anchor="middle" font-size="44" font-weight="800" fill="#12345a">"${courseName}"</text>
  <text x="240" y="830" font-size="27" fill="#475569">Issued: ${issued}</text>
  <text x="980" y="830" font-size="27" fill="#475569">Certificate ID: ${certId}</text>
  <rect x="1120" y="760" width="180" height="70" rx="35" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
  <text x="1210" y="804" text-anchor="middle" font-size="28" font-weight="800" fill="#b45309">VERIFIED</text>
</svg>`
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(blob)
        const svgLink = document.createElement('a')
        svgLink.href = svgUrl
        svgLink.download = `${filenameBase}.svg`
        document.body.appendChild(svgLink)
        svgLink.click()
        svgLink.remove()
        URL.revokeObjectURL(svgUrl)
        toast.success('PNG ishlamadi, SVG sertifikat yuklab olindi.')
        return
      } catch (svgError) {
        console.error('Certificate SVG fallback failed:', svgError)
      }

      console.error('Certificate download failed:', primaryError)
      try {
        const imageUrl = certificateRef.current?.querySelector('img')?.src
        if (imageUrl) window.open(imageUrl, '_blank', 'noopener,noreferrer')
      } catch {
        // fallback failed
      }
      toast.error('Sertifikatni yuklab olishda xatolik yuz berdi. Qayta urinib ko‘ring.')
    }
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Link to="/main/courses" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
          <span aria-hidden="true">←</span>
          Kurslarga qaytish
        </Link>
        <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
          <p className="text-sm text-slate-300">Kurs yuklanmoqda...</p>
        </article>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link to="/main/courses" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
        <span aria-hidden="true">←</span>
        Orqaga
      </Link>

      <article className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white">{course.name}</h3>
            <p className="text-sm text-slate-300">
              Progress: {progress.completedLessonIds?.length || 0}/{course.videoLessons?.length || 0} ({completion}%)
            </p>
          </div>
          <span className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-cyan-300">
            {completion === 100 ? 'Kurs tugagan' : 'Davom etmoqda'}
          </span>
        </div>

        {selectedLesson ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <iframe
              key={selectedLesson.id}
              id={`course-player-${courseId}-${selectedLesson.id}`}
              src={toEmbedUrl(selectedLesson.youtubeUrl, selectedLesson.youtubeId)}
              title={selectedLesson.title}
              className="h-[360px] w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
        {selectedLesson ? (
          <a
            href={selectedLesson.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Video ochilmasa YouTube’da ko‘rish
          </a>
        ) : null}

        {selectedLesson ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markCurrentLessonComplete}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              Darsni tugatdim
            </button>
            <button
              type="button"
              onClick={openPrevLesson}
              disabled={(lessonIndexMap.get(selectedLesson.id) || 0) <= 0}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Oldingi video
            </button>
            <button
              type="button"
              onClick={() => openNextLesson(selectedLesson.id)}
              disabled={(lessonIndexMap.get(selectedLesson.id) || 0) >= (course.videoLessons?.length || 1) - 1}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keyingi video
            </button>
          </div>
        ) : null}

        <div className="mt-4">
          <h4 className="text-sm font-bold text-white">Darslar</h4>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {(course.videoLessons || []).map((lesson) => {
              const done = (progress.completedLessonIds || []).includes(lesson.id)
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${
                    selectedLesson?.id === lesson.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <span className="mr-2">{done ? '✅' : '🎬'}</span>
                  {lesson.title}
                </button>
              )
            })}
          </div>
        </div>
      </article>

      {(awardedCertificate || certificates.length > 0) && fullName ? (
        <article className="rounded-2xl border border-amber-300/25 bg-slate-950/70 p-5">
          <h4 className="text-base font-bold text-amber-200">Sertifikat</h4>
          {(awardedCertificate ? [awardedCertificate] : certificates).slice(0, 1).map((cert) => (
            <div key={cert.id} className="mt-3 space-y-3">
              <div
                ref={certificateRef}
                className="relative overflow-hidden rounded-2xl border-[5px] border-[#12345a] bg-slate-50 px-6 py-8 shadow-2xl md:px-8"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[#12345a]" />
                <div className="pointer-events-none absolute -left-6 top-[4.6rem] h-16 w-[360px] rotate-[-8deg] rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-[#12345a]" />
                <div className="pointer-events-none absolute right-4 top-5 h-16 w-16 rounded-full border-4 border-amber-300 bg-[#12345a] shadow-xl" />
                <p className="pointer-events-none absolute right-[2.1rem] top-[2.55rem] text-3xl font-black text-amber-300">e</p>
                <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(0deg,rgba(100,116,139,0.06)_0px,rgba(100,116,139,0.06)_2px,transparent_2px,transparent_6px)]" />

                <div className="relative z-10">
                  <p className="text-right text-3xl font-black tracking-wide text-amber-300">CERTIFICATE</p>
                  <p className="text-right text-sm font-semibold tracking-[0.28em] text-slate-100">OF BRILLIANCE</p>

                  <div className="mt-10 rounded-xl border border-slate-200 bg-white/80 p-5">
                    <p className="text-base text-slate-700">This certificate is awarded to</p>
                    <p className="mt-2 border-b border-slate-300 pb-2 text-3xl font-black text-slate-900">{fullName}</p>
                    <p className="mt-4 text-base text-slate-700">for successfully completing</p>
                    <p className="mt-1 text-xl font-extrabold text-[#12345a]">&quot;{cert.courseName}&quot;</p>
                  </div>

                  <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Issued</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {cert.awardedAt ? new Date(cert.awardedAt).toLocaleDateString('uz-UZ') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Certificate ID</p>
                      <p className="text-sm font-semibold text-[#12345a]">{cert.id}</p>
                    </div>
                    <div className="rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-xs font-bold tracking-wide text-amber-700">
                      VERIFIED
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadCertificate(cert)}
                className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Sertifikatni yuklab olish
              </button>
            </div>
          ))}
        </article>
      ) : null}
    </div>
  )
}

export default EmployeeCourseDetailPage
