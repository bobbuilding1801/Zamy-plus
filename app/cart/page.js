'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useEffect, useState } from 'react'
import { useShop, formatINR } from '@/lib/store'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Minus, Plus, BookmarkPlus, ArrowRight, Tag, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

function CartInner() {
  const { cart, updateQty, removeFromCart, saveForLater, moveToCart } = useShop()
  const [products, setProducts] = useState({})
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [pin, setPin] = useState('560001')

  useEffect(() => {
    const ids = cart.map(c => c.id).join(',')
    if (!ids) return setProducts({})
    fetch(`/api/products/by-ids?ids=${ids}`).then(r=>r.json()).then(d => {
      const map = {}
      d.items?.forEach(p => { map[p.id] = p })
      setProducts(map)
    })
  }, [cart])

  const active = cart.filter(c => !c.savedForLater)
  const saved = cart.filter(c => c.savedForLater)
  const subtotal = active.reduce((s,c) => s + (products[c.id]?.price || 0) * c.qty, 0)
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax - discount

  const applyCoupon = () => {
    const codes = { 'WELCOME10': Math.min(subtotal*0.1, 2000), 'ZAMY20': Math.min(subtotal*0.2, 5000), 'FLAT500': 500 }
    const v = codes[coupon.toUpperCase()]
    if (v) { setDiscount(v); toast.success(`Coupon applied. –${formatINR(v)}`) }
    else { setDiscount(0); toast.error('Invalid coupon') }
  }

  if (active.length === 0 && saved.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h1 className="text-3xl font-extrabold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Discover our best deals and add items to your cart.</p>
        <Link href="/shop"><Button className="mt-6 rounded-full h-12 px-8 font-bold">Start Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">My Cart ({active.length})</h1>
        <div className="space-y-3">
          {active.map(item => {
            const p = products[item.id]
            if (!p) return null
            return (
              <Card key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 rounded-2xl">
                <Link href={`/product/${p.id}`} className="h-24 w-24 shrink-0 rounded-lg overflow-hidden border bg-secondary">
                  <img src={p.images[0]} className="h-full w-full object-cover" alt="" />
                </Link>
                <div className="flex-1">
                  <div className="text-[11px] uppercase text-muted-foreground">{p.brand}</div>
                  <Link href={`/product/${p.id}`} className="font-semibold hover:text-primary line-clamp-2">{p.name}</Link>
                  <div className="text-xs text-muted-foreground mt-1">In stock · Delivery in 2-4 days</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="inline-flex items-center border rounded-full">
                      <button onClick={() => updateQty(item.id, item.qty-1)} className="h-8 w-8 grid place-items-center"><Minus size={14} /></button>
                      <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty+1)} className="h-8 w-8 grid place-items-center"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => saveForLater(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold hover:text-primary"><BookmarkPlus size={14} /> Save for later</button>
                    <button onClick={() => removeFromCart(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">{formatINR(p.price * item.qty)}</div>
                  {p.mrp > p.price && <div className="text-xs text-muted-foreground line-through">{formatINR(p.mrp * item.qty)}</div>}
                  {p.discount > 0 && <div className="text-xs text-green-600 font-semibold">Save {formatINR((p.mrp-p.price)*item.qty)}</div>}
                </div>
              </Card>
            )
          })}
        </div>

        {saved.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mt-8 mb-3">Saved for later ({saved.length})</h2>
            <div className="space-y-3">
              {saved.map(item => {
                const p = products[item.id]; if (!p) return null
                return (
                  <Card key={item.id} className="p-4 flex gap-4 rounded-2xl">
                    <img src={p.images[0]} className="h-20 w-20 object-cover rounded-lg" alt="" />
                    <div className="flex-1">
                      <div className="font-semibold line-clamp-1">{p.name}</div>
                      <div className="font-bold">{formatINR(p.price)}</div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <button onClick={() => moveToCart(item.id)} className="font-semibold hover:text-primary">Move to cart</button>
                        <button onClick={() => removeFromCart(item.id)} className="font-semibold text-red-500">Remove</button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-28 space-y-4">
          <Card className="p-5 rounded-2xl">
            <h3 className="font-bold text-lg mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span></div>
              <div className="flex justify-between"><span>Estimated Tax (5%)</span><span>{formatINR(tax)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatINR(discount)}</span></div>}
              <div className="flex justify-between border-t pt-3 mt-2 text-lg font-black"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold flex items-center gap-1"><Tag size={12} /> Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <Input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="WELCOME10" />
                <Button variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">Try: WELCOME10, ZAMY20, FLAT500</div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold">Shipping to</label>
              <div className="flex gap-2 mt-1">
                <Input value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN Code" />
                <Button variant="outline" onClick={() => toast.success('Delivers to '+pin)}>Check</Button>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full mt-5 h-12 rounded-full font-bold">Proceed to Checkout <ArrowRight size={16} className="ml-1" /></Button>
            </Link>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-secondary">UPI</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary">Visa</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary">Mastercard</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary">Razorpay</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary">Stripe</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary">PayPal</span>
            </div>
          </Card>
          <Card className="p-4 rounded-2xl text-sm text-muted-foreground">
            <b className="text-foreground">Secure Checkout</b><br />100% secure payments · PCI DSS certified
          </Card>
        </div>
      </aside>
    </div>
  )
}

function Cart() { return <SiteChrome><CartInner /></SiteChrome> }
export default Cart
