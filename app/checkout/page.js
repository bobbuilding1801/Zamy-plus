'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useEffect, useState } from 'react'
import { useShop, formatINR } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, MapPin, Truck, CreditCard, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STEPS = ['Address','Delivery','Payment','Review']

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-8 w-8 grid place-items-center rounded-full text-xs font-bold ${i<=step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {i<step ? <Check size={14} /> : i+1}
          </div>
          <div className={`text-sm font-semibold ${i<=step ? '' : 'text-muted-foreground'} hidden sm:block`}>{s}</div>
          {i < STEPS.length-1 && <div className={`h-0.5 w-6 md:w-10 ${i<step ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  )
}

function CheckoutInner() {
  const router = useRouter()
  const { cart, clearCart, placeOrder } = useShop()
  const [products, setProducts] = useState({})
  const [step, setStep] = useState(0)
  const [guest, setGuest] = useState(true)
  const [addr, setAddr] = useState({ name:'', mobile:'', email:'', line1:'', city:'', state:'', pin:'', country:'India' })
  const [billing, setBilling] = useState({ same: true })
  const [ship, setShip] = useState('standard')
  const [pay, setPay] = useState('upi')

  useEffect(() => {
    const ids = cart.filter(c => !c.savedForLater).map(c => c.id).join(',')
    if (!ids) return
    fetch(`/api/products/by-ids?ids=${ids}`).then(r=>r.json()).then(d => {
      const m={}; d.items?.forEach(p => m[p.id]=p); setProducts(m)
    })
  }, [cart])

  const active = cart.filter(c => !c.savedForLater)
  const subtotal = active.reduce((s,c) => s + (products[c.id]?.price || 0) * c.qty, 0)
  const shipFees = { standard: subtotal > 999 ? 0 : 79, express: 149, sameday: 299 }
  const shipping = shipFees[ship]
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax

  const canNext = () => {
    if (step === 0) return addr.name && addr.mobile && addr.line1 && addr.city && addr.pin
    return true
  }

  const submit = async () => {
    const order = { total, items: active.map(c => ({ ...c, product: products[c.id] })), address: addr, shipping: ship, payment: pay, id: '' }
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order) })
    const data = await res.json()
    placeOrder({ ...order, id: data.order.id, total })
    clearCart()
    toast.success('Order placed successfully!')
    router.push(`/order-success?id=${data.order.id}`)
  }

  if (active.length === 0) return <div className="container py-16 text-center">Your cart is empty. <Link className="text-primary underline" href="/shop">Shop now</Link></div>

  return (
    <div className="container px-4 md:px-6 py-8">
      <Stepper step={step} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-6 rounded-2xl">
            {step === 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><MapPin size={18} /> Shipping Address</h2>
                  <div className="text-sm">
                    <button onClick={() => setGuest(true)} className={`px-3 py-1 rounded-full text-xs font-semibold ${guest?'bg-primary text-primary-foreground':'bg-secondary'}`}>Guest</button>
                    <button onClick={() => setGuest(false)} className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${!guest?'bg-primary text-primary-foreground':'bg-secondary'}`}>Sign in</button>
                  </div>
                </div>
                {!guest && (
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-secondary/50">
                    <Input placeholder="Email" />
                    <Input placeholder="Password" type="password" />
                    <Button className="col-span-2">Sign in</Button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Full name*" value={addr.name} onChange={e => setAddr({...addr, name:e.target.value})} />
                  <Input placeholder="Mobile*" value={addr.mobile} onChange={e => setAddr({...addr, mobile:e.target.value})} />
                  <Input placeholder="Email" className="sm:col-span-2" value={addr.email} onChange={e => setAddr({...addr, email:e.target.value})} />
                  <Input placeholder="Address line*" className="sm:col-span-2" value={addr.line1} onChange={e => setAddr({...addr, line1:e.target.value})} />
                  <Input placeholder="City*" value={addr.city} onChange={e => setAddr({...addr, city:e.target.value})} />
                  <Input placeholder="State" value={addr.state} onChange={e => setAddr({...addr, state:e.target.value})} />
                  <Input placeholder="PIN code*" value={addr.pin} onChange={e => setAddr({...addr, pin:e.target.value})} />
                  <Input placeholder="Country" value={addr.country} onChange={e => setAddr({...addr, country:e.target.value})} />
                </div>
                <div className="mt-4 text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={billing.same} onChange={e => setBilling({ same:e.target.checked })} />
                    Use same address for billing
                  </label>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck size={18} /> Delivery Options</h2>
                <RadioGroup value={ship} onValueChange={setShip} className="space-y-3">
                  {[
                    { v:'standard', t:'Standard Delivery', d:'2–4 business days', f: shipFees.standard },
                    { v:'express', t:'Express Delivery', d:'1–2 business days', f: shipFees.express },
                    { v:'sameday', t:'Same Day Delivery', d:'Order before 12 PM', f: shipFees.sameday },
                  ].map(o => (
                    <label key={o.v} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${ship===o.v?'border-primary bg-primary/5':''}`}>
                      <RadioGroupItem value={o.v} id={o.v} />
                      <div className="flex-1">
                        <div className="font-semibold">{o.t}</div>
                        <div className="text-xs text-muted-foreground">{o.d}</div>
                      </div>
                      <div className="font-bold">{o.f === 0 ? 'Free' : formatINR(o.f)}</div>
                    </label>
                  ))}
                </RadioGroup>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h2>
                <RadioGroup value={pay} onValueChange={setPay} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { v:'upi', t:'UPI', d:'Google Pay, PhonePe, Paytm' },
                    { v:'card', t:'Credit / Debit Card', d:'Visa, MC, RuPay, Amex' },
                    { v:'netbanking', t:'Net Banking', d:'All major banks' },
                    { v:'wallet', t:'Wallets', d:'Paytm, Mobikwik, Amazon Pay' },
                    { v:'razorpay', t:'Razorpay', d:'Multi-method' },
                    { v:'stripe', t:'Stripe', d:'International cards' },
                    { v:'paypal', t:'PayPal', d:'Balance / linked account' },
                    { v:'cod', t:'Cash on Delivery', d:'Pay when you receive' },
                  ].map(o => (
                    <label key={o.v} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${pay===o.v?'border-primary bg-primary/5':''}`}>
                      <RadioGroupItem value={o.v} id={o.v} />
                      <div>
                        <div className="font-semibold">{o.t}</div>
                        <div className="text-xs text-muted-foreground">{o.d}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} /> Encrypted &amp; PCI DSS compliant</div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg font-bold mb-4">Review your order</h2>
                <div className="space-y-3">
                  {active.map(item => { const p = products[item.id]; if (!p) return null; return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={p.images[0]} className="h-16 w-16 rounded-lg object-cover" alt="" />
                      <div className="flex-1"><div className="font-semibold text-sm line-clamp-1">{p.name}</div><div className="text-xs text-muted-foreground">Qty: {item.qty}</div></div>
                      <div className="font-bold">{formatINR(p.price * item.qty)}</div>
                    </div>
                  )})}
                </div>
                <hr className="my-4" />
                <div className="text-sm">
                  <div><b>Ship to:</b> {addr.name}, {addr.line1}, {addr.city} {addr.pin}</div>
                  <div className="mt-1"><b>Delivery:</b> {ship}</div>
                  <div className="mt-1"><b>Payment:</b> {pay.toUpperCase()}</div>
                </div>
              </>
            )}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" disabled={step===0} onClick={() => setStep(s => Math.max(0,s-1))}><ArrowLeft size={16} className="mr-1" /> Back</Button>
              {step < 3 ? (
                <Button onClick={() => canNext() ? setStep(s => s+1) : toast.error('Please fill required fields')} className="rounded-full px-8 font-bold">Continue <ArrowRight size={16} className="ml-1" /></Button>
              ) : (
                <Button onClick={submit} className="rounded-full px-8 font-bold">Place Order</Button>
              )}
            </div>
          </Card>
        </div>
        <aside className="lg:col-span-4">
          <Card className="p-5 rounded-2xl sticky top-28">
            <h3 className="font-bold text-lg mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal ({active.length})</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping===0?'Free':formatINR(shipping)}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>{formatINR(tax)}</span></div>
              <div className="flex justify-between border-t pt-3 mt-2 font-black text-lg"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default function Checkout() { return <SiteChrome><CheckoutInner /></SiteChrome> }
