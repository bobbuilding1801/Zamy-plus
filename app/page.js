'use client'
import { useEffect, useState } from 'react'
import SiteChrome from '@/components/site/SiteChrome'
import HeroCarousel from '@/components/site/HeroCarousel'
import CategoryStrip from '@/components/site/CategoryStrip'
import ProductRail from '@/components/site/ProductRail'
import PromoBanner from '@/components/site/PromoBanner'
import { PROMOS } from '@/lib/data'
import { useShop } from '@/lib/store'

function Home() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [trending, setTrending] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [topRated, setTopRated] = useState([])
  const [deals, setDeals] = useState([])
  const [recommended, setRecommended] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const { recent } = useShop()

  useEffect(() => {
    const f = (tag, sort, limit=12) => fetch(`/api/products?tag=${tag}&sort=${sort}&limit=${limit}`).then(r=>r.json())
    Promise.all([
      f('featured','popular'),
      f('bestseller','popular'),
      f('trending','popular'),
      f('new','newest'),
      f('toprated','rating'),
      f('deal','discount'),
      fetch('/api/products?sort=popular&limit=12').then(r=>r.json()),
    ]).then(([a,b,c,d,e,g,h]) => {
      setFeatured(a.items||[]); setBestsellers(b.items||[]); setTrending(c.items||[]);
      setNewArrivals(d.items||[]); setTopRated(e.items||[]); setDeals(g.items||[]); setRecommended(h.items||[])
    })
  }, [])

  useEffect(() => {
    if (!recent.length) return
    fetch(`/api/products/by-ids?ids=${recent.join(',')}`).then(r=>r.json()).then(d => setRecentlyViewed(d.items||[]))
  }, [recent])

  return (
    <>
      <HeroCarousel />
      <CategoryStrip />
      <ProductRail title="Featured Products" subtitle="Hand-picked by ZAMY editors" products={featured} viewAll="/shop?tag=featured" />
      <ProductRail title="Best Sellers" subtitle="Loved by thousands of customers" products={bestsellers} viewAll="/shop?tag=bestseller" />
      <PromoBanner items={PROMOS} />
      <ProductRail title="Trending Now" subtitle="What everyone's buying today" products={trending} viewAll="/shop?tag=trending" />
      <ProductRail title="New Arrivals" subtitle="Fresh drops this week" products={newArrivals} viewAll="/shop?tag=new" />
      <section className="container px-4 md:px-6 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 p-6 md:p-10 shadow-premium">
          <div className="relative z-10 max-w-xl">
            <div className="text-xs font-bold uppercase tracking-widest text-black/70">Limited Time</div>
            <h3 className="text-2xl md:text-4xl font-black text-black mt-1">Flash Deals · Extra 20% OFF</h3>
            <p className="text-black/80 text-sm md:text-base mt-2">On computer parts, mobile accessories &amp; power tools. Code: ZAMY20</p>
            <a href="/deals" className="inline-block mt-4 rounded-full bg-black text-yellow-300 font-bold px-6 py-3 text-sm hover:bg-black/85">Shop the Deals →</a>
          </div>
          <div className="absolute -right-8 -bottom-8 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          <div className="absolute right-6 top-6 opacity-30 text-black text-8xl font-black select-none hidden md:block">SALE</div>
        </div>
      </section>
      <ProductRail title="Top Rated" subtitle="Highest rated by our community" products={topRated} viewAll="/shop?tag=toprated" />
      <ProductRail title="Limited Time Deals" subtitle="Grab them before they're gone" products={deals} viewAll="/deals" />
      {recentlyViewed.length > 0 && (
        <ProductRail title="Recently Viewed" subtitle="Continue where you left off" products={recentlyViewed} />
      )}
      <ProductRail title="Recommended For You" subtitle="Picked based on trending interests" products={recommended} viewAll="/shop" />
    </>
  )
}

function App() {
  return <SiteChrome><Home /></SiteChrome>
}

export default App
