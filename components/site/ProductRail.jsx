'use client'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import Link from 'next/link'

export default function ProductRail({ title, subtitle, products, viewAll }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  if (!products?.length) return null
  return (
    <section className="py-6 md:py-10">
      <div className="container px-4 md:px-6">
        <div className="flex items-end justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {viewAll && <Link href={viewAll} className="text-sm font-semibold text-primary hover:underline hidden sm:inline">View all →</Link>}
            <button onClick={() => scroll(-1)} className="h-9 w-9 grid place-items-center rounded-full border hover:bg-secondary transition"><ChevronLeft size={18} /></button>
            <button onClick={() => scroll(1)} className="h-9 w-9 grid place-items-center rounded-full border hover:bg-secondary transition"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div ref={ref} className="rail no-scrollbar flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {products.map(p => (
            <div key={p.id} className="min-w-[220px] sm:min-w-[240px] md:min-w-[260px] max-w-[260px]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
