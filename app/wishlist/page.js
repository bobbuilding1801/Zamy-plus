'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useEffect, useState } from 'react'
import { useShop } from '@/lib/store'
import ProductCard from '@/components/site/ProductCard'
import { HeartOff } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function WishlistInner() {
  const { wishlist } = useShop()
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!wishlist.length) return setItems([])
    fetch(`/api/products/by-ids?ids=${wishlist.join(',')}`).then(r=>r.json()).then(d => setItems(d.items||[]))
  }, [wishlist])

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-extrabold mb-6">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <HeartOff className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nothing here yet.</p>
          <Link href="/shop"><Button className="mt-4 rounded-full">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
export default function W() { return <SiteChrome><WishlistInner /></SiteChrome> }
