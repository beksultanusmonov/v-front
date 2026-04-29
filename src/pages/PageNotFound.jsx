import { Link } from 'react-router-dom'

function PageNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">404</p>
        <h1 className="mt-3 text-3xl font-black text-white">Sahifa topilmadi</h1>
        <p className="mt-3 text-sm text-slate-300">Kiritilgan manzil mavjud emas. Bosh sahifaga qayting.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700/90 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"
        >
          <span aria-hidden="true">←</span>
          Bosh sahifa
        </Link>
      </div>
    </main>
  )
}

export default PageNotFound
