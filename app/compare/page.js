'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useEffect, useState } from 'react'
import { useShop, formatINR } from '@/lib/store'
import StarRating from '@/components/site/StarRating'
import { Button } from '@/components/ui/button'
import { X, GitCompareArrows } from 'lucide-react'
import Link from 'next/link'

function CompareInner() {
  const { compare, toggleCompare, addToCart, clearCompare } = useShop()
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!compare.length) return setItems([])
    fetch(`/api/products/by-ids?ids=${compare.join(',')}`).then(r=>r.json()).then(d => setItems(d.items||[]))
  }, [compare])

  if (items.length === 0) return (
    <div className="container py-24 text-center">
      <GitCompareArrows className="mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">Add products from listings or details to compare (up to 4).</p>
      <Link href="/shop"><Button className="mt-4 rounded-full">Browse Products</Button></Link>
    </div>
  )

  const allSpecKeys = Array.from(new Set(items.flatMap(p => Object.keys(p.specs||{}))))

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Compare Products</h1>
        <Button variant="outline" onClick={clearCompare}>Clear all</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              <th className="w-40 text-left"></th>
              {items.map(p => (
                <th key={p.id} className="p-3 align-top w-1/4">
                  <div className="relative rounded-2xl border p-3 bg-card">
                    <button onClick={() => toggleCompare(p.id)} className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-secondary hover:bg-red-100"><X size={14} /></button>
                    <img src={p.images[0]} alt="" className="h-32 w-full object-cover rounded-lg" />
                    <Link href={`/product/${p.id}`} className="block mt-2 font-semibold line-clamp-2 hover:text-primary text-left">{p.name}</Link>
                    <div className="font-black mt-1">{formatINR(p.price)}</div>
                    <StarRating value={p.rating} count={p.ratingCount} />
                    <Button size="sm" className="mt-2 w-full rounded-full" onClick={() => addToCart(p.id)}>Add to Cart</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[['Brand','brand'],['Category','category'],['Subcategory','subcategory'],['Rating','rating'],['Stock','stock'],['SKU','sku']].map(([lbl,k]) => (
              <tr key={k} className="border-t"><td className="p-3 font-semibold text-muted-foreground">{lbl}</td>{items.map(p => <td key={p.id} className="p-3">{String(p[k])}</td>)}</tr>
            ))}
            {allSpecKeys.map(k => (
              <tr key={k} className="border-t"><td className="p-3 font-semibold text-muted-foreground">{k}</td>{items.map(p => <td key={p.id} className="p-3">{p.specs?.[k] || '—'}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default function Compare() { return <SiteChrome><CompareInner /></SiteChrome> }
