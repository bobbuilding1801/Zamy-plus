'use client'
import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HERO_SLIDES } from '@/lib/data'
import { Button } from '@/components/ui/button'

export default function HeroCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!embla) return
    const onSel = () => setSelected(embla.selectedScrollSnap())
    embla.on('select', onSel); onSel()
    const id = setInterval(() => embla.scrollNext(), 5000)
    return () => { clearInterval(id); embla.off('select', onSel) }
  }, [embla])

  return (
    <div className="relative container px-4 md:px-6 mt-4">
      <div className="overflow-hidden rounded-3xl shadow-premium" ref={emblaRef}>
        <div className="flex">
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative h-[320px] sm:h-[400px] md:h-[520px] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className={`absolute inset-0 bg-gradient-to-r ${s.accent} opacity-40 mix-blend-multiply`} />
                <div className="relative z-10 h-full flex items-center">
                  <div className="px-6 md:px-14 max-w-2xl text-white">
                    <span className="inline-block rounded-full bg-primary text-primary-foreground text-xs font-bold px-3 py-1 mb-4">{s.tag}</span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight text-balance drop-shadow-md">{s.title}</h1>
                    <p className="mt-3 md:mt-5 text-base md:text-lg text-white/90">{s.subtitle}</p>
                    <Link href={s.href} className="inline-block mt-6"><Button size="lg" className="rounded-full font-bold px-8">{s.cta}</Button></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => embla?.scrollPrev()} className="hidden md:grid absolute top-1/2 left-8 -translate-y-1/2 h-11 w-11 place-items-center rounded-full glass border shadow-premium z-10 hover:bg-primary hover:text-primary-foreground transition"><ChevronLeft /></button>
      <button onClick={() => embla?.scrollNext()} className="hidden md:grid absolute top-1/2 right-8 -translate-y-1/2 h-11 w-11 place-items-center rounded-full glass border shadow-premium z-10 hover:bg-primary hover:text-primary-foreground transition"><ChevronRight /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => embla?.scrollTo(i)} className={`h-2 rounded-full transition-all ${i===selected ? 'w-8 bg-primary' : 'w-2 bg-white/70'}`} aria-label={`Slide ${i+1}`} />
        ))}
      </div>
    </div>
  )
}
