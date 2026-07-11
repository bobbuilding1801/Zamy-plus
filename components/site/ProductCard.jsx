'use client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, GitCompare, ShoppingCart, Zap, Truck } from 'lucide-react'
import StarRating from './StarRating'
import { useShop, formatINR } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Reduce image size for card thumbnails
function thumb(url, w=420) {
  if (!url) return url
  return url.replace(/([?&])w=\d+/, `$1w=${w}`)
}

export default function ProductCard({ p, className='' }) {
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useShop()
  const inWish = wishlist.includes(p.id)
  const inCmp = compare.includes(p.id)
  return (
    <Card className={cn('group relative overflow-hidden rounded-2xl border-border/60 hover:border-primary/40 hover:shadow-premium transition-all duration-300 bg-card', className)}>
      <Link href={`/product/${p.id}`} prefetch={false} className="block">
        <div className="zoom-wrap relative aspect-square bg-secondary/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(p.images[0], 420)} alt={p.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          {p.discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow">-{p.discount}%</span>
          )}
          {p.tags?.includes('new') && (
            <span className="absolute left-3 top-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold text-white">NEW</span>
          )}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
            <button onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); toast.success(inWish?'Removed from wishlist':'Added to wishlist') }} className={cn('h-9 w-9 grid place-items-center rounded-full glass border shadow', inWish && 'text-red-500')} aria-label="wishlist">
              <Heart size={16} className={inWish ? 'fill-red-500' : ''} />
            </button>
            <button onClick={(e) => { e.preventDefault(); toggleCompare(p.id); toast.success(inCmp?'Removed from compare':'Added to compare') }} className={cn('h-9 w-9 grid place-items-center rounded-full glass border shadow', inCmp && 'text-primary')} aria-label="compare">
              <GitCompare size={16} />
            </button>
          </div>
        </div>
      </Link>
      <div className="p-3.5 space-y-1.5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
        <Link href={`/product/${p.id}`} prefetch={false} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary transition min-h-[2.5rem]">{p.name}</Link>
        <StarRating value={p.rating} count={p.ratingCount} />
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-extrabold">{formatINR(p.price)}</span>
          {p.mrp > p.price && <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {p.freeShip && <span className="inline-flex items-center gap-1"><Truck size={12} /> Free Delivery</span>}
          {p.tags?.includes('deal') && <span className="inline-flex items-center gap-1 text-primary-foreground bg-primary/90 rounded px-1.5 py-0.5 font-semibold"><Zap size={12} /> Deal</span>}
        </div>
        <Button onClick={() => { addToCart(p.id); toast.success('Added to cart') }} className="w-full mt-2 rounded-full font-semibold" size="sm">
          <ShoppingCart size={14} className="mr-1.5" /> Add to Cart
        </Button>
      </div>
    </Card>
  )
}
