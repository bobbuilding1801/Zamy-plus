'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { Button } from '@/components/ui/button'
function Inner() {
  const jobs = [
    { t:'Senior Frontend Engineer', l:'Bengaluru · Full-time', d:'React, Next.js, design systems.' },
    { t:'Product Designer', l:'Remote · Full-time', d:'Ship pixel-perfect commerce experiences.' },
    { t:'Warehouse Operations Manager', l:'Delhi NCR', d:'Own logistics excellence across zones.' },
    { t:'Seller Success Manager', l:'Mumbai', d:'Onboard and grow top sellers on ZAMY.' },
  ]
  return (
    <div>
      <section className="bg-black text-white">
        <div className="container px-4 md:px-6 py-14">
          <h1 className="text-4xl md:text-6xl font-black">Build the future of commerce.</h1>
          <p className="text-white/70 mt-3 max-w-xl">Join ZAMY. Ship things that matter. Own outcomes. Grow fast.</p>
        </div>
      </section>
      <div className="container px-4 md:px-6 py-10 grid md:grid-cols-2 gap-4">
        {jobs.map((j,i) => (
          <div key={i} className="rounded-2xl border p-6">
            <h3 className="font-bold text-xl">{j.t}</h3>
            <div className="text-xs text-muted-foreground mt-1">{j.l}</div>
            <p className="text-sm mt-2">{j.d}</p>
            <Button className="mt-3 rounded-full">Apply</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default function K() { return <SiteChrome><Inner /></SiteChrome> }
