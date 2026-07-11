'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { BRANDS } from '@/lib/data'
import Link from 'next/link'
function Inner() {
  return (
    <div className="container px-4 md:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-6">Shop by Brand</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {BRANDS.map(b => (
          <Link key={b} href={`/shop?brand=${encodeURIComponent(b)}`} className="rounded-2xl border bg-card p-6 text-center font-bold hover:border-primary hover:text-primary hover:shadow-premium transition">{b}</Link>
        ))}
      </div>
    </div>
  )
}
export default function Brands() { return <SiteChrome><Inner /></SiteChrome> }
