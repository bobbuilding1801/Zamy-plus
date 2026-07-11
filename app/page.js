'use client'
import { useEffect, useState } from 'react'
import SiteChrome from '@/components/site/SiteChrome'
import HeroCarousel from '@/components/site/HeroCarousel'
import CategoryStrip from '@/components/site/CategoryStrip'
import ProductRail from '@/components/site/ProductRail'
import PromoBanner from '@/components/site/PromoBanner'
import Countdown from '@/components/site/Countdown'
import Testimonials from '@/components/site/Testimonials'
import { PROMOS } from '@/lib/data'
import { useShop } from '@/lib/store'
import { Sparkles } from 'lucide-react'

function Home() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [trending, setTrending] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [topRated, setTopRated] = useState([])
  const [deals, setDeals] = useState([])
  const [aiRecs, setAiRecs] = useState({ items:[], reason:'' })
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const { recent, cart, wishlist } = useShop()

  useEffect(() => {
    const f = (tag, sort, limit=12) => fetch(`/api/products?tag=${tag}&sort=${sort}&limit=${limit}`).then(r=>r.json())
    Promise.all([
      f('featured','popular'), f('bestseller','popular'), f('trending','popular'),
      f('new','newest'), f('toprated','rating'), f('deal','discount'),
    ]).then(([a,b,c,d,e,g]) => {
      setFeatured(a.items||[]); setBestsellers(b.items||[]); setTrending(c.items||[]);
      setNewArrivals(d.items||[]); setTopRated(e.items||[]); setDeals(g.items||[])
    })
  }, [])

  useEffect(() => {
    if (!recent.length) return
    fetch(`/api/products/by-ids?ids=${recent.join(',')}`).then(r=>r.json()).then(d => setRecentlyViewed(d.items||[]))
  }, [recent])

  useEffect(() => {
    fetch('/api/ai/recommendations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ recentIds:recent, cartIds:cart.map(c=>c.id), wishlistIds:wishlist })})
      .then(r=>r.json()).then(setAiRecs).catch(()=>{})
  }, [recent.length, cart.length, wishlist.length])

  // Deal window: ends 24h from midnight today (deterministic per page load)
  const [dealEnd] = useState(() => { const d = new Date(); d.setHours(23,59,59,0); return d.getTime() })

  return (
    <>
      <HeroCarousel />
      <CategoryStrip />
      <ProductRail title="Featured Products" subtitle="Hand-picked by ZAMY editors" products={featured} viewAll="/shop?tag=featured" />
      <ProductRail title="Best Sellers" subtitle="Loved by thousands of customers" products={bestsellers} viewAll="/shop?tag=bestseller" />
      <PromoBanner items={PROMOS} />
      <ProductRail title="Trending Now" subtitle="What everyone's buying today" products={trending} viewAll="/shop?tag=trending" />
      <ProductRail title="New Arrivals" subtitle="Fresh drops this week" products={newArrivals} viewAll="/shop?tag=new" />

      {/* Countdown flash deals */}
      <section className="container px-4 md:px-6 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 p-6 md:p-10 shadow-premium">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-black text-yellow-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1">⚡ Flash Deals</div>
              <h3 className="text-2xl md:text-4xl font-black text-black mt-2">Extra 20% OFF — Ends Tonight</h3>
              <p className="text-black/80 text-sm md:text-base mt-1">On computer parts, mobile accessories &amp; power tools. Code: ZAMY20</p>
              <a href="/deals" className="inline-block mt-4 rounded-full bg-black text-yellow-300 font-bold px-6 py-3 text-sm hover:bg-black/85">Shop the Deals →</a>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-[11px] font-bold uppercase text-black/70 mb-2">Ends in</div>
              <Countdown endsAt={dealEnd} />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
        </div>
      </section>

      <ProductRail title="Top Rated" subtitle="Highest rated by our community" products={topRated} viewAll="/shop?tag=toprated" />
      <ProductRail title="Limited Time Deals" subtitle="Grab them before they're gone" products={deals} viewAll="/deals" />

      {aiRecs.items.length > 0 && (
        <section>
          <div className="container px-4 md:px-6 pt-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-black dark:text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest"><Sparkles size={12} /> AI Picks for You</div>
          </div>
          <ProductRail title="Recommended For You" subtitle={aiRecs.reason || 'Curated by ZAMY AI based on your interests'} products={aiRecs.items} />
        </section>
      )}

      {recentlyViewed.length > 0 && <ProductRail title="Recently Viewed" subtitle="Continue where you left off" products={recentlyViewed} />}
      <Testimonials />
    </>
  )
}

function App() { return <SiteChrome><Home /></SiteChrome> }
export default App
