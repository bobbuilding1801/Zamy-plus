'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/site/ProductCard'
import { Flame } from 'lucide-react'

function DealsInner() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/products?tag=deal&sort=discount&limit=48').then(r=>r.json()).then(d => setItems(d.items||[])) }, [])
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 border-b">
        <div className="container px-4 md:px-6 py-10 md:py-14">
          <div className="flex items-center gap-3">
            <Flame className="text-black" size={28} />
            <span className="px-3 py-1 rounded-full bg-black text-yellow-300 text-xs font-bold">LIMITED TIME</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-black mt-3">Flash Deals</h1>
          <p className="text-black/80 mt-2">Save big on electronics, PC parts, tools and more. Ends in 24 hours.</p>
        </div>
      </section>
      <div className="container px-4 md:px-6 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}
export default function D() { return <SiteChrome><DealsInner /></SiteChrome> }
