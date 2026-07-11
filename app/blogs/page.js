'use client'
import SiteChrome from '@/components/site/SiteChrome'
import Link from 'next/link'
function Inner() {
  const posts = [
    { t:'How to build the perfect gaming PC in 2025', c:'Guides', img:'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200' },
    { t:'Best cordless power tools for professionals', c:'Automotive', img:'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200' },
    { t:'Top 10 smartphones under ₹30,000', c:'Electronics', img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200' },
    { t:'Choosing the right car battery: a complete guide', c:'Automotive', img:'https://images.pexels.com/photos/10126655/pexels-photo-10126655.jpeg?w=1200' },
  ]
  return (
    <div className="container px-4 md:px-6 py-10">
      <h1 className="text-4xl font-black">ZAMY Blog</h1>
      <p className="text-muted-foreground mt-2">Buying guides, reviews and stories from the ZAMY editorial team.</p>
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p,i) => (
          <Link key={i} href="#" className="group rounded-2xl border overflow-hidden hover:shadow-premium transition bg-card">
            <div className="aspect-[16/10] overflow-hidden"><img src={p.img} className="h-full w-full object-cover group-hover:scale-105 transition" alt="" /></div>
            <div className="p-4">
              <div className="text-xs text-primary font-bold uppercase">{p.c}</div>
              <h3 className="font-bold text-lg mt-1 group-hover:text-primary">{p.t}</h3>
              <div className="text-xs text-muted-foreground mt-1">5 min read</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
export default function B() { return <SiteChrome><Inner /></SiteChrome> }
