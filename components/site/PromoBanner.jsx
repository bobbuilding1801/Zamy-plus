import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PromoBanner({ items }) {
  return (
    <section className="container px-4 md:px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((b, i) => (
          <Link key={i} href={b.href} className="group relative overflow-hidden rounded-2xl h-40 md:h-48 shadow-premium">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.img} alt={b.title} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 p-5 md:p-6 h-full flex flex-col justify-end text-white">
              <h3 className="text-lg md:text-xl font-extrabold leading-tight">{b.title}</h3>
              <p className="text-xs md:text-sm text-white/85">{b.sub}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">{b.cta} <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
